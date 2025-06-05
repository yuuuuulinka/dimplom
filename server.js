require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'], // Allow multiple Vite ports
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// Database connection
const pool = mysql.createPool({
  host: 'sql7.freesqldatabase.com',
  user: 'sql7781956',
  password: 'Pc7LwYqywl',
  database: 'sql7781956',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// Email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Passport JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Users WHERE id_user = ?', [jwt_payload.id]);
    if (rows.length > 0) {
      return done(null, rows[0]);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy - make it optional
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const [existingUser] = await pool.query(
        'SELECT * FROM Users WHERE gmail = ?',
        [profile.emails[0].value]
      );

      if (existingUser.length > 0) {
        return done(null, existingUser[0]);
      }

      const [result] = await pool.query(
        'INSERT INTO Users (name, lastname, gmail) VALUES (?, ?, ?)',
        [profile.name.givenName, profile.name.familyName, profile.emails[0].value]
      );

      const [newUser] = await pool.query(
        'SELECT * FROM Users WHERE id_user = ?',
        [result.insertId]
      );

      return done(null, newUser[0]);
    } catch (error) {
      return done(error, null);
    }
  }));
} else {
  console.log('Google OAuth not configured - skipping Google strategy setup');
}

// Helper function to send verification email
const sendVerificationEmail = async (email, token, type = 'registration') => {
  const subject = type === 'registration' 
    ? 'Підтвердження реєстрації' 
    : 'Підтвердження видалення профілю';
  
  const text = type === 'registration'
    ? `Ласкаво просимо! Для підтвердження реєстрації перейдіть за посиланням: ${process.env.CLIENT_URL}/verify/${token}`
    : `Для підтвердження видалення профілю перейдіть за посиланням: ${process.env.CLIENT_URL}/delete-account/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text
  });
};

// Registration endpoint
app.post('/auth/register', async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;
    
    console.log('Registration attempt:', { name, surname, email }); // Debug log
    
    // Check if user exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users_confidential WHERE gmail = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Користувач з такою поштою вже існує' });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create user
      const [userResult] = await connection.query(
        'INSERT INTO Users (name, lastname) VALUES (?, ?)',
        [name, surname]
      );
      console.log('User created:', userResult.insertId); // Debug log

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Add confidential info - store hashed password
      await connection.query(
        'INSERT INTO users_confidential (id_user, gmail, password) VALUES (?, ?, ?)',
        [userResult.insertId, email, hashedPassword]
      );
      console.log('Confidential info added'); // Debug log

      // Initialize achievements for new user
      await initializeUserAchievements(userResult.insertId);

      // Get user achievements
      const [achievements] = await pool.query(`
        SELECT achievement_id as id, name, description, icon, earned, earned_date as earnedDate
        FROM user_achievements
        WHERE id_user = ?
        ORDER BY created_at ASC
      `, [userResult.insertId]);

      await connection.commit();

      // Generate JWT
      const token = jwt.sign(
        { id: userResult.insertId },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Реєстрація успішна!',
        token,
        user: {
          id: userResult.insertId,
          name,
          surname,
          email,
          preferences: {
            emailNotifications: true,
            darkMode: false,
            saveProgress: true
          },
          achievements: achievements.map(achievement => ({
            ...achievement,
            earnedDate: achievement.earnedDate ? achievement.earnedDate.toISOString() : null
          }))
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Transaction error:', error);
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Помилка при реєстрації', error: error.message });
  }
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email }); // Debug log

    // Get user with password
    const [users] = await pool.query(
      `SELECT u.*, uc.password, uc.gmail 
       FROM Users u 
       JOIN users_confidential uc ON u.id_user = uc.id_user 
       WHERE uc.gmail = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Невірний email або пароль' });
    }

    const user = users[0];

    // Compare password with hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Невірний email або пароль' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id_user },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    // Check if user has achievements, if not initialize them
    const [existingAchievements] = await pool.query(
      'SELECT COUNT(*) as count FROM user_achievements WHERE id_user = ?',
      [user.id_user]
    );

    if (existingAchievements[0].count === 0) {
      await initializeUserAchievements(user.id_user);
    }

    // Get user achievements
    const [achievements] = await pool.query(`
      SELECT achievement_id as id, name, description, icon, earned, earned_date as earnedDate
      FROM user_achievements
      WHERE id_user = ?
      ORDER BY created_at ASC
    `, [user.id_user]);

    // Return user data and token
    res.json({
      token,
      user: {
        id: user.id_user,
        name: user.name,
        surname: user.lastname,
        email: user.gmail,
        preferences: {
          emailNotifications: true,
          darkMode: false,
          saveProgress: true
        },
        achievements: achievements.map(achievement => ({
          ...achievement,
          earnedDate: achievement.earnedDate ? achievement.earnedDate.toISOString() : null
        }))
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Помилка при вході', error: error.message });
  }
});

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id_user },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// Update user profile
app.put('/users/profile',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { name, surname, email, currentPassword, newPassword, preferences } = req.body;
      const userId = req.user.id_user;

      // Start transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Update basic info - Users table doesn't have gmail column
        await connection.query(
          'UPDATE Users SET name = ?, lastname = ? WHERE id_user = ?',
          [name, surname, userId]
        );

        // Update email in users_confidential table
        await connection.query(
          'UPDATE users_confidential SET gmail = ? WHERE id_user = ?',
          [email, userId]
        );

        // If password change is requested
        if (currentPassword && newPassword) {
          const [user] = await connection.query(
            'SELECT password FROM users_confidential WHERE id_user = ?',
            [userId]
          );

          const isValidPassword = await bcrypt.compare(currentPassword, user[0].password);
          if (!isValidPassword) {
            await connection.rollback();
            return res.status(400).json({ message: 'Невірний поточний пароль' });
          }

          const hashedNewPassword = await bcrypt.hash(newPassword, 10);
          await connection.query(
            'UPDATE users_confidential SET password = ? WHERE id_user = ?',
            [hashedNewPassword, userId]
          );
        }

        await connection.commit();
        res.json({ message: 'Профіль оновлено успішно' });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Помилка при оновленні профілю' });
    }
});

// Initiate account deletion
app.post('/users/delete-request',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const userId = req.user.id_user;
      const deleteToken = jwt.sign(
        { id: userId, action: 'delete' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      await sendVerificationEmail(req.user.gmail, deleteToken, 'deletion');
      res.json({ message: 'Запит на видалення надіслано. Перевірте вашу пошту для підтвердження.' });
    } catch (error) {
      console.error('Delete request error:', error);
      res.status(500).json({ message: 'Помилка при створенні запиту на видалення' });
    }
});

// Confirm account deletion
app.delete('/users/confirm-deletion/:token',
  async (req, res) => {
    try {
      const { token } = req.params;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.action !== 'delete') {
        return res.status(400).json({ message: 'Невірний токен' });
      }

      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Delete user data from all related tables
        await connection.query('DELETE FROM users_confidential WHERE id_user = ?', [decoded.id]);
        await connection.query('DELETE FROM Users WHERE id_user = ?', [decoded.id]);
        
        await connection.commit();
        res.json({ message: 'Обліковий запис видалено успішно' });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Delete confirmation error:', error);
      res.status(500).json({ message: 'Помилка при видаленні облікового запису' });
    }
});

// Get saved graphs for user endpoint
app.get('/api/graphs/user',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const userId = req.user.id_user;

      const [rows] = await pool.query(`
        SELECT 
          sg.id_saved AS id,
          sg.graph_name AS name,
          g.type AS graph_type,
          sg.created_at AS dateCreated,
          sg.updated_at AS dateModified,
          n.id_node AS node_id,
          n.label AS node_label,
          n.x AS node_x,
          n.y AS node_y,
          e.id_edge AS edge_id,
          e.source_node_id AS edge_source,
          e.target_node_id AS edge_target,
          e.weight AS edge_weight
        FROM saved_graphs sg
        JOIN graphs g ON sg.id_graph = g.id_graph
        LEFT JOIN nodes n ON sg.id_graph = n.id_graph
        LEFT JOIN edges e ON sg.id_graph = e.id_graph
        WHERE sg.id_user = ?
        ORDER BY sg.id_saved, n.id_node, e.id_edge
      `, [userId]);

      // Process the rows to group data by graph
      const graphsMap = new Map();

      rows.forEach(row => {
        const graphId = row.id;
        
        if (!graphsMap.has(graphId)) {
          graphsMap.set(graphId, {
            id: row.id.toString(),
            name: row.name,
            graph: {
              type: row.graph_type,
              nodes: [],
              edges: []
            },
            dateCreated: row.dateCreated,
            dateModified: row.dateModified
          });
        }

        const graph = graphsMap.get(graphId);
        
        // Add node if it exists and hasn't been added yet
        if (row.node_id && !graph.graph.nodes.find(n => n.id === row.node_id)) {
          graph.graph.nodes.push({
            id: row.node_id,
            label: row.node_label,
            x: row.node_x,
            y: row.node_y
          });
        }
        
        // Add edge if it exists and hasn't been added yet
        if (row.edge_id && !graph.graph.edges.find(e => e.id === row.edge_id)) {
          const edge = {
            id: row.edge_id,
            source: row.edge_source,
            target: row.edge_target
          };
          
          // Only add weight if it exists
          if (row.edge_weight !== null) {
            edge.weight = row.edge_weight;
          }
          
          graph.graph.edges.push(edge);
        }
      });

      const graphs = Array.from(graphsMap.values());
      
      res.json({
        message: 'Графи успішно завантажено',
        graphs: graphs
      });
    } catch (error) {
      console.error('Get saved graphs error:', error);
      res.status(500).json({ message: 'Помилка при завантаженні графів', error: error.message });
    }
});

// Save graph endpoint
app.post('/api/graphs/save',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { graphName, graph } = req.body;
      const userId = req.user.id_user;

      if (!graphName || !graph) {
        return res.status(400).json({ message: 'Назва графу та дані графу є обов\'язковими' });
      }

      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // First create saved_graphs record
        const [savedGraphResult] = await connection.execute(
          'INSERT INTO saved_graphs (id_user, graph_name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
          [userId, graphName]
        );

        const savedGraphId = savedGraphResult.insertId;

        // Set id_graph to be the same as id_saved (primary key)
        await connection.execute(
          'UPDATE saved_graphs SET id_graph = ? WHERE id_saved = ?',
          [savedGraphId, savedGraphId]
        );

        // Now create graphs record - id_graph references saved_graphs.id_graph
        await connection.execute(
          'INSERT INTO graphs (id_graph, type) VALUES (?, ?)',
          [savedGraphId, graph.type]
        );

        // Insert nodes
        if (graph.nodes && graph.nodes.length > 0) {
          const nodeValues = graph.nodes.map(n => [n.id, savedGraphId, n.label || null, n.x, n.y]);
          await connection.query(
            'INSERT INTO nodes (id_node, id_graph, label, x, y) VALUES ?',
            [nodeValues]
          );
        }

        // Insert edges
        if (graph.edges && graph.edges.length > 0) {
          const edgeValues = graph.edges.map(e => [e.id, savedGraphId, e.source, e.target, e.weight ?? null]);
          await connection.query(
            'INSERT INTO edges (id_edge, id_graph, source_node_id, target_node_id, weight) VALUES ?',
            [edgeValues]
          );
        }

        await connection.commit();

        res.status(201).json({ 
          message: 'Граф успішно збережено',
          graphId: savedGraphId
        });
      } catch (error) {
        await connection.rollback();
        console.error('Graph save transaction error:', error);
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Save graph error:', error);
      res.status(500).json({ message: 'Помилка при збереженні графу', error: error.message });
    }
});

// Delete saved graph endpoint
app.delete('/api/graphs/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id_user;

      if (!id) {
        return res.status(400).json({ message: 'ID графу є обов\'язковим' });
      }

      // First verify that the graph belongs to the current user
      const [ownerCheck] = await pool.query(
        'SELECT id_saved FROM saved_graphs WHERE id_saved = ? AND id_user = ?',
        [id, userId]
      );

      if (ownerCheck.length === 0) {
        return res.status(404).json({ message: 'Граф не знайдено або ви не маєте прав на його видалення' });
      }

      // Delete the saved graph
      const [result] = await pool.query(
        'DELETE FROM saved_graphs WHERE id_saved = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Граф не знайдено' });
      }

      res.json({ 
        message: 'Граф успішно видалено'
      });
    } catch (error) {
      console.error('Delete graph error:', error);
      res.status(500).json({ message: 'Помилка при видаленні графу', error: error.message });
    }
});

// Default achievements data
const defaultAchievements = [
  {
    id: 'first-login',
    name: 'Перші Кроки',
    description: 'Увійшли в систему вперше',
    icon: '🎯',
    earned: true
  },
  {
    id: 'graph-basics',
    name: 'Майстер в Основах Графів!',
    description: 'Завершили всі основні теорії графів',
    icon: '📚',
    earned: false
  },
  {
    id: 'algorithm-master',
    name: 'Майстер Алгоритмів!',
    description: 'Завершили всі основні алгоритми',
    icon: '🧮',
    earned: false
  },
  {
    id: 'graph-creator',
    name: 'Графо-створювач!',
    description: 'Створили і зберегли 10 власних графів',
    icon: '✏️',
    earned: false
  }
];

// Helper function to initialize user achievements
const initializeUserAchievements = async (userId) => {
  try {
    for (const achievement of defaultAchievements) {
      const earnedDate = achievement.earned ? new Date() : null;
      
      await pool.query(`
        INSERT IGNORE INTO user_achievements 
        (id_user, achievement_id, name, description, icon, earned, earned_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        achievement.id,
        achievement.name,
        achievement.description,
        achievement.icon,
        achievement.earned,
        earnedDate
      ]);
    }
  } catch (error) {
    console.error('Error initializing user achievements:', error);
  }
};

// Get user achievements endpoint
app.get('/api/achievements',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const userId = req.user.id_user;

      // Check if user has any achievements, if not initialize them
      const [existingAchievements] = await pool.query(
        'SELECT COUNT(*) as count FROM user_achievements WHERE id_user = ?',
        [userId]
      );

      if (existingAchievements[0].count === 0) {
        await initializeUserAchievements(userId);
      }

      // Get user achievements
      const [achievements] = await pool.query(`
        SELECT achievement_id as id, name, description, icon, earned, earned_date as earnedDate
        FROM user_achievements
        WHERE id_user = ?
        ORDER BY created_at ASC
      `, [userId]);

      res.json({
        message: 'Досягнення успішно завантажено',
        achievements: achievements.map(achievement => ({
          ...achievement,
          earnedDate: achievement.earnedDate ? achievement.earnedDate.toISOString() : null
        }))
      });
    } catch (error) {
      console.error('Get achievements error:', error);
      res.status(500).json({ message: 'Помилка при завантаженні досягнень', error: error.message });
    }
});

// Update achievement endpoint
app.put('/api/achievements/:achievementId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { achievementId } = req.params;
      const { earned } = req.body;
      const userId = req.user.id_user;

      const earnedDate = earned ? new Date() : null;

      const [result] = await pool.query(`
        UPDATE user_achievements 
        SET earned = ?, earned_date = ?
        WHERE id_user = ? AND achievement_id = ?
      `, [earned, earnedDate, userId, achievementId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Досягнення не знайдено' });
      }

      res.json({ 
        message: 'Досягнення успішно оновлено'
      });
    } catch (error) {
      console.error('Update achievement error:', error);
      res.status(500).json({ message: 'Помилка при оновленні досягнення', error: error.message });
    }
});

// Record test success endpoint
app.post('/api/test-success',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { testId, score, passingScore } = req.body;
      const userId = req.user.id_user;

      // Validate input
      if (!testId || score === undefined || passingScore === undefined) {
        return res.status(400).json({ message: 'testId, score та passingScore є обов\'язковими полями' });
      }

      // Check if user passed the test
      if (score < passingScore) {
        return res.status(400).json({ message: 'Результат недостатній для проходження тесту' });
      }

      // Check if success already exists for this user and test
      const [existingSuccess] = await pool.query(
        'SELECT * FROM success WHERE id_user = ? AND id_test = ?',
        [userId, testId]
      );

      if (existingSuccess.length > 0) {
        // Update existing record with better score if applicable
        if (score > existingSuccess[0].mark) {
          await pool.query(
            'UPDATE success SET mark = ? WHERE id_user = ? AND id_test = ?',
            [score, userId, testId]
          );
          res.json({ 
            message: 'Результат тесту оновлено з кращим результатом',
            updated: true
          });
        } else {
          res.json({ 
            message: 'Успіх у тесті вже записаний',
            updated: false
          });
        }
      } else {
        // Insert new success record
        await pool.query(
          'INSERT INTO success (id_user, id_test, mark) VALUES (?, ?, ?)',
          [userId, testId, score]
        );
        res.json({ 
          message: 'Успіх у тесті записано успішно',
          created: true
        });
      }
    } catch (error) {
      console.error('Record test success error:', error);
      res.status(500).json({ message: 'Помилка при записі успіху тесту', error: error.message });
    }
});

// Get user test history endpoint
app.get('/api/test-history',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const userId = req.user.id_user;

      const [testHistory] = await pool.query(
        'SELECT id_test as testId, mark as score FROM success WHERE id_user = ? ORDER BY id_test',
        [userId]
      );

      res.json({
        message: 'Історія тестів завантажена успішно',
        testHistory: testHistory
      });
    } catch (error) {
      console.error('Get test history error:', error);
      res.status(500).json({ message: 'Помилка при завантаженні історії тестів', error: error.message });
    }
});

// Get passed tests count endpoint
app.get('/api/test-stats',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const userId = req.user.id_user;

      // Get count of passed tests
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as count FROM success WHERE id_user = ?',
        [userId]
      );

      // Get list of passed test IDs for marking completion in UI
      const [passedTests] = await pool.query(
        'SELECT id_test as testId, mark as score FROM success WHERE id_user = ?',
        [userId]
      );

      res.json({
        message: 'Статистика тестів завантажена успішно',
        passedCount: countResult[0].count,
        passedTests: passedTests
      });
    } catch (error) {
      console.error('Get test stats error:', error);
      res.status(500).json({ message: 'Помилка при завантаженні статистики тестів', error: error.message });
    }
});

// Get comments for a post
app.get('/api/comments/:postId',
  async (req, res) => {
    try {
      const { postId } = req.params;

      const [comments] = await pool.query(`
        SELECT 
          c.id_comment,
          c.text_comment,
          c.rate,
          c.post_time,
          u.name,
          u.lastname
        FROM comments c
        JOIN Users u ON c.id_user = u.id_user
        WHERE c.id_post = ?
        ORDER BY c.post_time DESC
      `, [postId]);

      res.json({
        message: 'Коментарі завантажено успішно',
        comments: comments.map(comment => ({
          id: comment.id_comment,
          text: comment.text_comment,
          rating: comment.rate,
          date: comment.post_time,
          authorName: `${comment.name} ${comment.lastname}`
        }))
      });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ message: 'Помилка при завантаженні коментарів', error: error.message });
    }
});

// Add comment to a post
app.post('/api/comments',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { postId, text, rating } = req.body;
      const userId = req.user.id_user;

      // Validate input
      if (!postId || !text || !rating) {
        return res.status(400).json({ message: 'postId, text та rating є обов\'язковими полями' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Рейтинг повинен бути від 1 до 5' });
      }

      // Insert new comment
      const [result] = await pool.query(
        'INSERT INTO comments (id_user, id_post, text_comment, rate, post_time) VALUES (?, ?, ?, ?, NOW())',
        [userId, postId, text, rating]
      );

      // Get the created comment with user info
      const [newComment] = await pool.query(`
        SELECT 
          c.id_comment,
          c.text_comment,
          c.rate,
          c.post_time,
          u.name,
          u.lastname
        FROM comments c
        JOIN Users u ON c.id_user = u.id_user
        WHERE c.id_comment = ?
      `, [result.insertId]);

      res.status(201).json({
        message: 'Коментар додано успішно',
        comment: {
          id: newComment[0].id_comment,
          text: newComment[0].text_comment,
          rating: newComment[0].rate,
          date: newComment[0].post_time,
          authorName: `${newComment[0].name} ${newComment[0].lastname}`
        }
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ message: 'Помилка при додаванні коментаря', error: error.message });
    }
});

// Default configuration if .env is not present
const config = {
  port: 3000,
  db: {
    host: 'sql7.freesqldatabase.com',
    user: 'sql7781956',
    password: 'Pc7LwYqywl',
    database: 'sql7781956',
    port: 3306
  },
  jwt: {
    secret: 'your_super_secret_key_123',
    expiresIn: '24h'
  },
  frontend: {
    url: 'http://localhost:5175'
  }
};

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 