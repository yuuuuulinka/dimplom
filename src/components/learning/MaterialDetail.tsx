import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, ThumbsUp, MessageCircle, Bookmark, Share2, FileText, Play, Video } from 'lucide-react';
import { Material } from '../../types/materials';
import { useTests } from '../../hooks/useTests';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';

interface MaterialDetailProps {
  material: Material;
  onBack: () => void;
  onTakeTest?: (testId: string) => void;
}

interface Comment {
  id: number;
  text: string;
  rating: number;
  date: string;
  authorName: string;
}

const MaterialDetail: React.FC<MaterialDetailProps> = ({ material, onBack, onTakeTest }) => {
  const { getTestByMaterialId } = useTests();
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotifications();
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset scroll to top when component mounts or material changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [material.id]);

  // Load comments when component mounts
  useEffect(() => {
    loadComments();
  }, [material.id]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const response = await api.comments.getComments(material.id);
      setComments(response.comments);
    } catch (error) {
      console.error('Failed to load comments:', error);
      addNotification({
        type: 'error',
        message: 'Не вдалося завантажити коментарі'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      addNotification({
        type: 'error',
        message: 'Будь ласка, увійдіть в систему, щоб залишити відгук'
      });
      return;
    }

    if (rating === 0) {
      addNotification({
        type: 'warning',
        message: 'Будь ласка, виберіть рейтинг'
      });
      return;
    }

    if (review.trim() === '') {
      addNotification({
        type: 'warning',
        message: 'Будь ласка, напишіть відгук'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.comments.addComment(material.id, review.trim(), rating);
      
      // Add the new comment to the list
      setComments(prev => [response.comment, ...prev]);
      
      addNotification({
        type: 'success',
        message: 'Відгук успішно надіслано!'
      });
      
      // Reset form
      setReview('');
      setRating(0);
    } catch (error) {
      console.error('Failed to submit comment:', error);
      addNotification({
        type: 'error',
        message: 'Не вдалося надіслати відгук. Спробуйте пізніше.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'щойно';
    } else if (diffInHours < 24) {
      return `${diffInHours} год тому`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days} ${days === 1 ? 'день' : days < 5 ? 'дні' : 'днів'} тому`;
    } else {
      return date.toLocaleDateString('uk-UA');
    }
  };

  const averageRating = comments.length > 0 
    ? (comments.reduce((sum, comment) => sum + comment.rating, 0) / comments.length).toFixed(1)
    : material.rating;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={16} className="mr-1" />
        Назад до матеріалів
      </button>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                {material.title}
                {material.videoUrl && <Video size={24} className="ml-2 text-red-600" />}
              </h1>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span className="mr-4">Автор: {material.author}</span>
                <span className="mr-4">{material.duration} {material.videoUrl ? 'переглянути' : 'прочитати'}</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>{averageRating} ({comments.length} відгуків)</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bookmark size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {material.videoUrl ? (
            <div className="mb-6 bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(material.videoUrl)}`}
                title={material.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-80 lg:h-96"
              ></iframe>
            </div>
          ) : material.thumbnailUrl ? (
            <img
              src={material.thumbnailUrl}
              alt={material.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          ) : null}

          <div className="prose max-w-none">
            {(() => {
              switch (material.id) {
                case 'intro-graph-theory':
                  return (
                    <>
                      <h2>Що таке теорія графів?</h2>
                      <p>
                        Теорія графів - це математична дисципліна, яка вивчає взаємозв'язки між об'єктами. 
                        Ці об'єкти представляються вершинами (також називаються вузлами), а взаємозв'язки між ними представляються ребрами.
                      </p>

                      <h3>Основні поняття</h3>
                      <ul>
                        <li><strong>Вершина (Node):</strong> Основна одиниця графу, що представляє об'єкт або сутність.</li>
                        <li><strong>Ребро:</strong> Зв'язок між двома вершинами, що представляє взаємодію або відношення.</li>
                        <li><strong>Степінь:</strong> Кількість ребер, що з'єднуються з вершиною.</li>
                        <li><strong>Шлях:</strong> Послідовність вершин, з'єднаних ребрами.</li>
                        <li><strong>Цикл:</strong> Шлях, що починається і закінчується в одній вершині.</li>
                      </ul>

                      <h3>Типи графів</h3>
                      <ul>
                        <li><strong>Неорієнтований граф:</strong> Ребра не мають напрямку</li>
                        <li><strong>Орієнтований граф (Диграф):</strong> Ребра мають напрямок</li>
                        <li><strong>Ваговий граф:</strong> Ребра мають асоційовані ваги або вартості</li>
                        <li><strong>Зв'язний граф:</strong> Існує шлях між будь-якими двома вершинами</li>
                      </ul>
                    </>
                  );

                case 'graph-representations':
                  return (
                    <>
                      <h2>Представлення графів</h2>
                      <p>
                        Існує кілька способів представлення графів в комп'ютерних науках, кожен з яких має свої переваги 
                        і недоліки щодо складності простору та ефективності операцій.
                      </p>

                      <h3>Матриця суміжності</h3>
                      <p>
                        Матриця суміжності - це двовимірний масив, де запис (i,j) вказує, чи існує ребро 
                        від вершини i до вершини j. Для вагових графів, запис зберігає вагу.
                      </p>
                      <ul>
                        <li><strong>Складність простору:</strong> O(V²)</li>
                        <li><strong>Пошук ребра:</strong> O(1)</li>
                        <li><strong>Найкраще для:</strong> Щільні графі, частота запитів ребер</li>
                      </ul>

                      <h3>Список суміжності</h3>
                      <p>
                        Список суміжності зберігає список сусідів для кожної вершини. Це більш ефективно щодо простору 
                        для розріджених графів.
                      </p>
                      <ul>
                        <li><strong>Складність простору:</strong> O(V + E)</li>
                        <li><strong>Пошук ребра:</strong> O(degree(v))</li>
                        <li><strong>Найкраще для:</strong> Розріджені графі, ітерація по сусідах</li>
                      </ul>

                      <h3>Список ребер</h3>
                      <p>
                        Список ребер просто зберігає всі ребра як пари (або трійки для вагових графів) вершин.
                      </p>
                      <ul>
                        <li><strong>Складність простору:</strong> O(E)</li>
                        <li><strong>Найкраще для:</strong> Алгоритми, які обробляють ребра послідовно</li>
                      </ul>
                    </>
                  );

                case 'bfs-algorithm':
                  return (
                    <>
                      <h2>Пошук у ширину (BFS)</h2>
                      <p>
                        BFS - це алгоритм обходу графу, який відвідує вершини рівнем за рівнем, відвідуючи всіх сусідів вершини перед переходом до наступного рівня.
                      </p>

                      <h3>Кроки алгоритму</h3>
                      <ol>
                        <li>Починаємо з вихідної вершини і позначаємо її як відвідану</li>
                        <li>Додаємо вихідну вершину до черги</li>
                        <li>Поки черга не порожня:
                          <ul>
                            <li>Вилучаємо вершину з початку черги</li>
                            <li>Позначаємо кожного невідвіданого сусіда як відвіданого і додаємо до черги</li>
                          </ul>
                        </li>
                      </ol>

                      <h3>Властивості</h3>
                      <ul>
                        <li><strong>Складність часу:</strong> O(V + E)</li>
                        <li><strong>Складність простору:</strong> O(V)</li>
                        <li><strong>Структура даних:</strong> Черга (FIFO)</li>
                      </ul>

                      <h3>Застосування</h3>
                      <ul>
                        <li>Найкоротший шлях у невагових графах</li>
                        <li>Обхід рівнем за рівнем</li>
                        <li>Зв'язані компоненти</li>
                        <li>Виявлення біпартитних графів</li>
                      </ul>
                    </>
                  );

                case 'dfs-algorithm':
                  return (
                    <>
                      <h2>Пошук у глибину (DFS)</h2>
                      <p>
                        DFS - це алгоритм обходу графу, який просувається якомога далі по кожній гілці, 
                        перш ніж повертатися назад.
                      </p>

                      <h3>Кроки алгоритму</h3>
                      <ol>
                        <li>Починаємо з вихідної вершини і позначаємо її як відвідану</li>
                        <li>Для кожного невідвіданого сусіда рекурсивно застосовуємо DFS</li>
                        <li>Повертаємося назад, коли немає невідвіданих сусідів</li>
                      </ol>

                      <h3>Властивості</h3>
                      <ul>
                        <li><strong>Складність часу:</strong> O(V + E)</li>
                        <li><strong>Складність простору:</strong> O(V)</li>
                        <li><strong>Структура даних:</strong> Стек (LIFO) або рекурсія</li>
                      </ul>

                      <h3>Застосування</h3>
                      <ul>
                        <li>Виявлення циклів</li>
                        <li>Топологічне сортування</li>
                        <li>Силасно зв'язані компоненти</li>
                        <li>Пошук шляху</li>
                        <li>Розв'язання лабіринтів</li>
                      </ul>

                      <h3>Класифікація дерев DFS</h3>
                      <ul>
                        <li><strong>Дерево ребер:</strong> Ребра в дереві DFS</li>
                        <li><strong>Зворотні ребра:</strong> З'єднуються з предками (вказують на цикли)</li>
                        <li><strong>Прямі ребра:</strong> З'єднуються з нащадками</li>
                        <li><strong>Перехресні ребра:</strong> З'єднують вершини в різних піддеревах</li>
                      </ul>
                    </>
                  );

                case 'dijkstra-algorithm':
                  return (
                    <>
                      <h2>Алгоритм Дейкстри - пошук найкоротших шляхів</h2>
                      <p>
                        Алгоритм Дейкстри знаходить найкоротші шляхи від вихідної вершини до всіх інших вершин 
                        у ваговому графі з невід'ємними вагами ребер.
                      </p>

                      <h3>Кроки алгоритму</h3>
                      <ol>
                        <li>Ініціалізуємо відстані: source = 0, others = ∞</li>
                        <li>Додаємо всі вершини до черги з пріоритетом</li>
                        <li>Поки черга не порожня:
                          <ul>
                            <li>Вилучаємо вершину з мінімальною відстанню</li>
                            <li>Для кожного сусіда, розслаблюємо ребро, якщо знайдено коротший шлях</li>
                          </ul>
                        </li>
                      </ol>

                      <h3>Процес розслаблення</h3>
                      <p>
                        Для ребра (u,v) з вагою w: якщо dist[u] + w &lt; dist[v], то оновлюємо dist[v] = dist[u] + w
                      </p>

                      <h3>Властивості</h3>
                      <ul>
                        <li><strong>Складність часу:</strong> O((V + E) log V) з бінарною купою</li>
                        <li><strong>Складність простору:</strong> O(V)</li>
                        <li><strong>Вимога:</strong> Невід'ємні ваги ребер</li>
                      </ul>

                      <h3>Застосування</h3>
                      <ul>
                        <li>GPS навігація</li>
                        <li>Мережеві протоколи маршрутизації</li>
                        <li>Соціальні мережі (найкоротший шлях з'єднання)</li>
                        <li>Польоти (рейси)</li>
                      </ul>
                    </>
                  );

                case 'minimum-spanning-trees':
                  return (
                    <>
                      <h2>Мінімальне кістякове дерево (MST/МКД)</h2>
                      <p>
                        Мінімальне кістякове дерево - це підмножина ребер, які з'єднують всі вершини в ваговому графі з мінімальною загальною вагою, 
                        утворюючи дерево.
                      </p>

                      <h3>Властивості МКД</h3>
                      <ul>
                        <li>Містить точно V-1 ребер для V вершин</li>
                        <li>Не має циклів (утворює дерево)</li>
                        <li>З'єднує всі вершини</li>
                        <li>Має мінімальну загальну вагу серед всіх кістякових дерев</li>
                      </ul>

                      <h3>Алгоритм Крускала</h3>
                      <ol>
                        <li>Сортуємо всі ребра за вагою в порядку зростання</li>
                        <li>Ініціалізуємо кожну вершину як окрему компоненту</li>
                        <li>Для кожного ребра в порядку сортування:
                          <ul>
                            <li>Якщо кінці ребра знаходяться в різних компонентах, додаємо ребро до МКД</li>
                            <li>Об'єднуємо компоненти</li>
                          </ul>
                        </li>
                      </ol>

                      <h3>Алгоритм Прима</h3>
                      <ol>
                        <li>Починаємо з довільної вершини</li>
                        <li>Зберігаємо множину вершин в МКД</li>
                        <li>Повторюємо додавання ребра з мінімальною вагою, яке з'єднує МКД з невключеною вершиною</li>
                      </ol>

                      <h3>Застосування</h3>
                      <ul>
                        <li>Проектування мереж (розкладка кабелів, електромережі)</li>
                        <li>Аналіз кластерів</li>
                        <li>Апроксимаційні алгоритми</li>
                        <li>Розділення зображень</li>
                      </ul>
                    </>
                  );

                case 'social-network-analysis':
                  return (
                    <>
                      <h2>Аналіз соціальних мереж</h2>
                      <p>
                        Аналіз соціальних мереж використовує теорію графів для вивчення соціальних структур, 
                        відносин та інформаційного потоку в мережах людей або організацій.
                      </p>

                      <h3>Матриця мережі</h3>
                      <ul>
                        <li><strong>Степінь центральності:</strong> Кількість прямих зв'язків</li>
                        <li><strong>Центральність між:</strong> Наскільки часто вузол лежить на найкоротших шляхах</li>
                        <li><strong>Центральність близькості:</strong> Середня відстань до всіх інших вузлів</li>
                        <li><strong>Центральність власного вектора:</strong> Впливає на центральність сусідів</li>
                      </ul>

                      <h3>Виявлення спільнот</h3>
                      <p>
                        Спільноти - це групи вершин, які щільніше з'єднані між собою, ніж з іншими частинами мережі.
                      </p>
                      <ul>
                        <li><strong>Модульність:</strong> Вимірює якість структури спільнот</li>
                        <li><strong>Алгоритм Гірвана-Ньюмена:</strong> Вилучає ребра з високою центральністю між</li>
                        <li><strong>Метод Лув'є:</strong> Оптимізує модульність ітеративно</li>
                      </ul>

                      <h3>Властивості мережі</h3>
                      <ul>
                        <li><strong>Мінімальний світ:</strong> Короткі шляхи навіть при низькій зв'язності</li>
                        <li><strong>Масштабованість:</strong> Розподіл степенів відповідає закону зростання</li>
                        <li><strong>Кластеризація:</strong> Тенденція друзів бути друзями</li>
                      </ul>

                      <h3>Застосування</h3>
                      <ul>
                        <li>Максимізація впливу</li>
                        <li>Інформаційна дифузія</li>
                        <li>Системи рекомендацій</li>
                        <li>Виявлення шахрайства</li>
                        <li>Моделювання епідемій</li>
                      </ul>
                    </>
                  );

                case 'graph-coloring':
                  return (
                    <>
                      <h2>Кольорове забарвлення графу</h2>
                      <p>
                        Кольорове забарвлення графу - це присвоєння кольорів вершинам графу так, щоб будь-які дві сусідні вершини мали різний колір, 
                        використовуючи мінімальну кількість кольорів.
                      </p>

                      <h3>Хроматичне число</h3>
                      <p>
                        Хроматичне число χ(G) - це мінімальна кількість кольорів, необхідна для правильного забарвлення графу G.
                      </p>
                      <ul>
                        <li><strong>Повний граф K_n:</strong> χ(K_n) = n</li>
                        <li><strong>Біпартитний граф:</strong> χ(G) = 2</li>
                        <li><strong>Дерево:</strong> χ(T) = 2 (якщо більше однієї вершини)</li>
                        <li><strong>Цикл:</strong> χ(C_n) = 2 якщо n парне, 3 якщо n непарне</li>
                      </ul>

                      <h3>Алгоритм жадного забарвлення</h3>
                      <ol>
                        <li>Замовляємо вершини (різні стратегії)</li>
                        <li>Для кожної вершини, присвоюємо найменший доступний колір</li>
                        <li>Колір доступний, якщо жодна сусідня вершина не використовує його</li>
                      </ol>

                      <h3>Стратегії порядку забарвлення</h3>
                      <ul>
                        <li><strong>Найбільший перший:</strong> Замовляємо за спадаючим ступенем</li>
                        <li><strong>Найменший останній:</strong> Рекурсивно вилучаємо вершину з найменшим ступенем</li>
                        <li><strong>Велш-Полл:</strong> Замовляємо за спадаючим ступенем, кольорово жадно</li>
                      </ul>

                      <h3>Застосування</h3>
                      <ul>
                        <li><strong>Планування:</strong> Призначаємо часові слоти, уникаючи конфліктів</li>
                        <li><strong>Призначення реєстрів:</strong> Призначаємо реєстри CPU для змінних</li>
                        <li><strong>Кольорове забарвлення карт:</strong> Кольорові області так, щоб сусідні області мали різний колір</li>
                        <li><strong>Призначення частот:</strong> Призначаємо радіочастоти</li>
                        <li><strong>Розклад екзаменів:</strong> Розкладаємо екзамени, уникаючи конфліктів студентів</li>
                      </ul>
                    </>
                  );

                case 'network-flow':
                  return (
                    <>
                      <h2>Алгоритми потоку в мережі</h2>
                      <p>
                        Задачі потоку в мережі моделюють рух ресурсів через мережу, знаходять максимальний потік від джерела до стоку, 
                        враховуючи обмеження пропускної здатності.
                      </p>

                      <h3>Компоненти потоку в мережі</h3>
                      <ul>
                        <li><strong>Джерело (s):</strong> Де потік починається</li>
                        <li><strong>Сток (t):</strong> Де потік закінчується</li>
                        <li><strong>Пропускна здатність:</strong> Максимальний потік через кожне ребро</li>
                        <li><strong>Потік:</strong> Фактична кількість, що протікає через кожне ребро</li>
                      </ul>

                      <h3>Властивості потоку</h3>
                      <ul>
                        <li><strong>Обмеження пропускної здатності:</strong> Потік ≤ пропускна здатність для кожного ребра</li>
                        <li><strong>Збереження потоку:</strong> Потік в = потік вихід для кожної вершини (крім s,t)</li>
                        <li><strong>Косо-симетрія:</strong> f(u,v) = -f(v,u)</li>
                      </ul>

                      <h3>Алгоритм Форда-Фалкерсона</h3>
                      <ol>
                        <li>Ініціалізуємо потік до 0</li>
                        <li>Поки існує збільшуючий шлях від s до t:
                          <ul>
                            <li>Знаходимо шлях і його місткість</li>
                            <li>Збільшуємо потік уздовж шляху</li>
                          </ul>
                        </li>
                      </ol>

                      <h3>Теорема про максимальний потік і мінімальний розріз</h3>
                      <p>
                        Максимальне значення потоку дорівнює мінімальній місткості розрізу. Розріз відділяє джерело від стоку, 
                        і його місткість дорівнює сумі місткостей ребер, що перетинають розріз.
                      </p>

                      <h3>Застосування</h3>
                      <ul>
                        <li><strong>Біпартитне збільшення:</strong> Максимальне збільшення в біпартитних графах</li>
                        <li><strong>Розділення зображення:</strong> Відокремлюємо передній план від заднього</li>
                        <li><strong>Надійність мережі:</strong> Знаходимо вузькі місця в мережах</li>
                        <li><strong>Транспортування:</strong> Оптимізуємо перевезення вантажів</li>
                        <li><strong>Вибір проектів:</strong> Вибираємо проекти, що максимізують прибуток</li>
                      </ul>
                    </>
                  );

                case 'prim-algorithm':
                  return (
                    <>
                      <h2>Алгоритм Прима для мінімального кістякового дерева</h2>
                      <p>
                        Алгоритм Прима - це жадний алгоритм, який знаходить мінімальне кістякове дерево (МКД) 
                        для зваженого неорієнтованого графу. Він росте МКД однією вершиною за раз, вибираючи ребро з мінімальною вагою, 
                        яке з'єднує дерево з новою вершиною.
                      </p>

                      <h3>Що таке мінімальне кістякове дерево?</h3>
                      <p>
                        Кістякове дерево графу - це підграф, який включає всі вершини і є деревом 
                        (зв'язаний і ациклічний). Мінімальне кістякове дерево - це кістякове дерево з мінімальною можливою загальною вагою ребер.
                      </p>

                      <h3>Кроки алгоритму</h3>
                      <ol>
                        <li>Починаємо з будь-якої вершини як початкового дерева</li>
                        <li>Позначаємо цю вершину як відвідану</li>
                        <li>Поки є невідвідані вершини:
                          <ul>
                            <li>Знаходимо ребро з мінімальною вагою, яке з'єднує дерево з невідвіданою вершиною</li>
                            <li>Додаємо це ребро і вершину до дерева</li>
                            <li>Позначаємо нову вершину як відвідану</li>
                          </ul>
                        </li>
                      </ol>

                      <h3>Деталі реалізації</h3>
                      <ul>
                        <li><strong>Структура даних:</strong> Пріоритетна черга (мінімальна купа) для ефективної знаходження ребер з мінімальною вагою</li>
                        <li><strong>Складність часу:</strong> O(E log V) з бінарною купою, O(E + V log V) з купою Фібоначчі</li>
                        <li><strong>Складність простору:</strong> O(V) для масиву відвіданих вершин і пріоритетної черги</li>
                      </ul>

                      <h3>Основні властивості</h3>
                      <ul>
                        <li>Завжди підтримує один зв'язаний компонент (дерево)</li>
                        <li>Жадібний вибір: завжди вибирає ребро з мінімальною вагою, яке не створює цикл</li>
                        <li>Працює ефективно на щільних графах</li>
                        <li>Виробляє той самий МКД незалежно від початкової вершини</li>
                      </ul>

                      <h3>Застосування</h3>
                      <ul>
                        <li><strong>Проектування мереж:</strong> Мінімальна вартість для з'єднання всіх місць</li>
                        <li><strong>Проектування електричних схем:</strong> Мінімізуємо довжину проводів в електричних схемах</li>
                        <li><strong>Транспорт:</strong> Проектуємо дорожні мережі з мінімальною загальною вартістю</li>
                        <li><strong>Кластеризація:</strong> Групуємо подібні дані ефективно</li>
                      </ul>

                      <div className="bg-blue-50 p-4 rounded-lg mt-6">
                        <h4 className="font-semibold text-blue-900 mb-2">💡 Професійний порадник</h4>
                        <p className="text-blue-800">
                          Алгоритм Прима особливо ефективний для щільних графів, оскільки він підтримує пріоритетну чергу ребер. 
                          Для рідкісних графів, алгоритм Крускала може бути більш ефективним.
                        </p>
                      </div>
                    </>
                  );

                case 'kruskal-algorithm':
                  return (
                    <>
                      <h2>Алгоритм Крускала для мінімального кістякового дерева</h2>
                      <p>
                        Алгоритм Крускала - це ще один жадний алгоритм для знаходження мінімального кістякового дерева.
                      </p>

                      <h3>Огляд алгоритму</h3>
                      <p>
                        Алгоритм Крускала сортує всі ребра за вагою і додає їх один за одним до МКД, 
                        пропускаючи ребра, які створюють цикл. Він використовує структуру даних Union-Find (Disjoint Set Union) 
                        для ефективного виявлення циклів.
                      </p>

                      <h3>Кроки алгоритму</h3>
                      <ol>
                        <li>Сортуємо всі ребра за зростанням ваги</li>
                        <li>Ініціалізуємо структуру даних Union-Find з кожною вершиною як її власний набір</li>
                        <li>Для кожного ребра (u, v) в відсортованому порядку:
                          <ul>
                            <li>Якщо u і v в різних наборах (без циклу):
                              <ul>
                                <li>Додаємо ребро до МКД</li>
                                <li>Об'єднуємо набори, що містять u і v</li>
                              </ul>
                            </li>
                            <li>Якщо u і v в тому самому наборі: пропускаємо (створить цикл)</li>
                          </ul>
                        </li>
                        <li>Зупиняємося, коли МКД має V-1 ребер</li>
                      </ol>

                      <h3>Структура даних Union-Find</h3>
                      <p>
                        Структура даних Union-Find підтримує дві основні операції:
                      </p>
                      <ul>
                        <li><strong>Find:</strong> Визначаємо, до якого набору належить вершина</li>
                        <li><strong>Union:</strong> Об'єднуємо два набори в один</li>
                      </ul>
                      
                      <h4>Оптимізації:</h4>
                      <ul>
                        <li><strong>Стиснення шляху:</strong> Робимо вузли прямо вказувати на корінь під час Find</li>
                        <li><strong>Об'єднання за рангом:</strong> Завжди прикріплюємо менше дерево під коренем більшого дерева</li>
                      </ul>

                      <h3>Аналіз складності</h3>
                      <ul>
                        <li><strong>Складність часу:</strong> O(E log E) для сортування + O(E α(V)) для операцій Union-Find</li>
                        <li><strong>Загалом:</strong> O(E log E) домінує сортуванням</li>
                        <li><strong>Складність простору:</strong> O(V) для структури Union-Find</li>
                      </ul>

                      <h3>Порівняння з алгоритмом Прима</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 mt-4">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 p-2 text-left">Аспект</th>
                              <th className="border border-gray-300 p-2 text-left">Крускал</th>
                              <th className="border border-gray-300 p-2 text-left">Прима</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 p-2">Структура даних</td>
                              <td className="border border-gray-300 p-2">Union-Find</td>
                              <td className="border border-gray-300 p-2">Пріоритетна черга</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">Обробка ребер</td>
                              <td className="border border-gray-300 p-2">Глобальна (всі ребра)</td>
                              <td className="border border-gray-300 p-2">Локальна (сусідні ребра)</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">Найкраще для</td>
                              <td className="border border-gray-300 p-2">Рідкісні графи</td>
                              <td className="border border-gray-300 p-2">Щільні графи</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <h3>Застосування</h3>
                      <ul>
                        <li><strong>Проектування мереж:</strong> З'єднуємо місця з мінімальною вартістю</li>
                        <li><strong>Розділення зображення:</strong> Групуємо пікселі в області</li>
                        <li><strong>Кластеризація:</strong> Знаходимо природно групування в даних</li>
                        <li><strong>Апроксимаційні алгоритми:</strong> Основа для апроксимації TSP і дерева Стінера</li>
                      </ul>

                      <div className="bg-green-50 p-4 rounded-lg mt-6">
                        <h4 className="font-semibold text-green-900 mb-2">🚀 Професійний порадник</h4>
                        <p className="text-green-800">
                          Структура даних Union-Find зі стисненням шляху і об'єднанням за рангом досягає майже постійного часу на операцію, 
                          роблячи алгоритм Крускала дуже ефективним для рідкісних графів.
                        </p>
                      </div>
                    </>
                  );

                case 'bellman-ford-algorithm':
                  return (
                    <>
                      <h2>Алгоритм Беллмана-Форда для найкоротших шляхів</h2>
                      <p>
                        Алгоритм Беллмана-Форда обчислює найкоротші шляхи від одного джерела до всіх інших вершин у зваженому графі. 
                        На відміну від алгоритму Дейкстри, він може обробляти від'ємні ваги ребер і виявляти від'ємні цикли.
                      </p>

                      <h3>Основні переваги</h3>
                      <ul>
                        <li><strong>Від'ємні ваги:</strong> Працює з від'ємними вагами ребер</li>
                        <li><strong>Виявлення циклів:</strong> Виявляє від'ємні цикли</li>
                        <li><strong>Гнучкість:</strong> Працює з орієнтованими і неорієнтованими графами</li>
                        <li><strong>Простота:</strong> Простіше реалізувати, ніж алгоритм Дейкстри</li>
                      </ul>

                      <h3>Кроки алгоритму</h3>
                      <ol>
                        <li><strong>Ініціалізація:</strong> Встановлюємо відстань до джерела як 0, всі інші як ∞</li>
                        <li><strong>Розслаблення ребер:</strong> Повторюємо V-1 разів:
                          <ul>
                            <li>Для кожного ребра (u,v) з вагою w:</li>
                            <li>Якщо відстань[u] + w &lt; відстань[v]:</li>
                            <li>Встановлюємо відстань[v] = відстань[u] + w</li>
                            <li>Встановлюємо попередник[v] = u</li>
                          </ul>
                        </li>
                        <li><strong>Перевірка на від'ємні цикли:</strong> Робимо одну ітерацію:
                          <ul>
                            <li>Якщо будь-яка відстань може бути покращена, існує від'ємний цикл</li>
                          </ul>
                        </li>
                      </ol>

                      <h3>Чому V-1 ітерацій?</h3>
                      <p>
                        У графі з V вершинами, найдовший простий шлях має V-1 ребер. 
                        Після V-1 ітерацій, всі найкоротші шляхи знайдені, якщо не існує від'ємних циклів.
                      </p>

                      <h3>Розслаблення ребер</h3>
                      <p>
                        Розслаблення ребра (u,v) означає перевірку, чи проходження через u дає коротший 
                        шлях до v, ніж відомий поточний шлях:
                      </p>
                      <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                        if distance[u] + weight(u,v) &lt; distance[v]:<br/>
                        &nbsp;&nbsp;distance[v] = distance[u] + weight(u,v)<br/>
                        &nbsp;&nbsp;predecessor[v] = u
                      </div>

                      <h3>Аналіз складності</h3>
                      <ul>
                        <li><strong>Складність часу:</strong> O(VE) - V-1 ітерацій × E розслаблень ребер</li>
                        <li><strong>Складність простору:</strong> O(V) для масивів відстані і попередників</li>
                        <li><strong>Порівняння:</strong> Повільніше, ніж алгоритм Дейкстри O((V+E) log V), але обробляє від'ємні ваги</li>
                      </ul>

                      <h3>Виявлення від'ємних циклів</h3>
                      <p>
                        Якщо після V-1 ітерацій ми все ще можемо покращити деяку відстань в V-й ітерації, 
                        це означає, що існує від'ємний цикл, до якого можна дістатися від джерела.
                      </p>
                      
                      <div className="bg-red-50 p-4 rounded-lg mt-4">
                        <h4 className="font-semibold text-red-900 mb-2">⚠️ Від'ємні цикли</h4>
                        <p className="text-red-800">
                          Коли існує від'ємний цикл, найкоротші шляхи не визначені, тому що ви можете 
                          продовжувати обходити цикл, щоб отримати довільно малі відстані.
                        </p>
                      </div>

                      <h3>Застосування</h3>
                      <ul>
                        <li><strong>Валютний арбітраж:</strong> Виявляє прибуткові цикли обмінних курсів</li>
                        <li><strong>Маршрутизація мережі:</strong> Обробляє посилання з від'ємними "витратами"</li>
                        <li><strong>Системи обмежень:</strong> Розв'язує системи обмежень</li>
                        <li><strong>Теорія ігор:</strong> Знаходить оптимальні стратегії в певних іграх</li>
                      </ul>

                      <h3>Порівняння з іншими алгоритмами</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 mt-4">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 p-2 text-left">Алгоритм</th>
                              <th className="border border-gray-300 p-2 text-left">Складність часу</th>
                              <th className="border border-gray-300 p-2 text-left">Від'ємні ваги</th>
                              <th className="border border-gray-300 p-2 text-left">Виявлення циклів</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 p-2">Беллман-Форд</td>
                              <td className="border border-gray-300 p-2">O(VE)</td>
                              <td className="border border-gray-300 p-2">✅ Так</td>
                              <td className="border border-gray-300 p-2">✅ Так</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">Дейкстри</td>
                              <td className="border border-gray-300 p-2">O((V+E) log V)</td>
                              <td className="border border-gray-300 p-2">❌ Ні</td>
                              <td className="border border-gray-300 p-2">❌ Ні</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">Флойд-Уоршал</td>
                              <td className="border border-gray-300 p-2">O(V³)</td>
                              <td className="border border-gray-300 p-2">✅ Так</td>
                              <td className="border border-gray-300 p-2">✅ Так</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg mt-6">
                        <h4 className="font-semibold text-purple-900 mb-2">🎯 Коли використовувати</h4>
                        <p className="text-purple-800">
                          Використовуйте Беллман-Форд, коли вам потрібно обробляти від'ємні ваги ребер або виявляти 
                          від'ємні цикли. Для невід'ємних ваг, алгоритм Дейкстри швидший.
                        </p>
                      </div>
                    </>
                  );

                default:
                  return (
                    <>
                      <h2>Теорія графів</h2>
                      <p>Цей матеріал охоплює важливі концепції теорії графів і алгоритмів.</p>
                    </>
                  );
              }
            })()}
          </div>
          
          {/* Test Button */}
          {(() => {
            const relatedTest = getTestByMaterialId(material.id);
            if (relatedTest && onTakeTest) {
              return (
                <div className="mt-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900 mb-2">Тестувати свої знання</h3>
                      <p className="text-purple-700 mb-4">
                        Готові перевірити, що ви вивчили? Пройдіть наш {relatedTest.title}, щоб оцінити своє розуміння.
                      </p>
                      <div className="flex items-center text-sm text-purple-600 space-x-4">
                        <span>• {relatedTest.questions.length} питань</span>
                        <span>• {relatedTest.estimatedTime} хвилин</span>
                        <span>• {relatedTest.passingScore}% для проходження</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onTakeTest(relatedTest.id)}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                    >
                      <FileText size={20} className="mr-2" />
                      Пройти тест
                    </button>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Відгуки</h2> 

          {/* Review Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-4">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={24}
                      className={`${
                        star <= (hoveredStar || rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 ? `${rating} з 5 зірок` : 'Виберіть оцінку'}
              </span>
            </div>

            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Напишіть свій відгук..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={4}
            />

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Надсилання...' : 'Надіслати відгук'}
              </button>
            </div>
          </div>

          {/* Existing Reviews */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              <span className="ml-2 text-gray-600">Завантаження коментарів...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Поки що немає відгуків</h3>
              <p className="text-gray-600">Будьте першим, хто залишить відгук про цей матеріал!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{comment.authorName}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{formatDate(comment.date)}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${
                              i < comment.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-600">{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialDetail;