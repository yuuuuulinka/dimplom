import { PracticeProblem } from '../types/practice';
import { problemValidators } from '../utils/problemValidators';

export const getProblems = (): PracticeProblem[] => {
  return [
    {
      id: 'bfs-shortest-path',
      title: 'Найкоротший шлях у незваженому графі',
      description: 'Знайдіть найкоротший шлях між двома вузлами у незваженому графі, використовуючи пошук в ширину (BFS).',
      difficulty: 'easy',
      topics: ['bfs', 'paths'],
      type: 'shortest-path',
      config: {
        type: 'shortest-path',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' },
            { id: 5, label: 'E' }
          ],
          edges: [
            { source: 1, target: 2 },
            { source: 1, target: 3 },
            { source: 2, target: 4 },
            { source: 3, target: 5 },
            { source: 4, target: 5 }
          ],
          type: 'undirected',
          weighted: false
        },
        startNode: 'A',
        endNode: 'E'
      },
      examples: [
        {
          input: 'Початкова вершина: A, Кінцева вершина: E',
          output: 'Найкоротший шлях: A → C → E (довжина: 2)',
          explanation: 'BFS досліджує всі шляхи довжиною 1, потім всі шляхи довжиною 2 і так далі, гарантуючи, що перший знайдений шлях є найкоротшим.'
        }
      ],
      constraints: [
        'Граф є незваженим і неорієнтованим',
        'Усі вершини мають унікальні позначення',
        'Існує принаймні один шлях між початковою та кінцевою вершинами'
      ],
      hint: 'Використовуйте BFS алгоритм. Почніть з початкової вершини та досліджуйте всіх сусідів на поточному рівні, перш ніж переходити до наступного рівня.',
      solution: 'Найкоротший шлях: A → C → E. BFS гарантує знаходження найкоротшого шляху в незваженому графі.',
      estimatedTime: 15,
      successRate: 85,
      attemptedCount: 1250,
      averageTime: 12,
      relatedProblems: [
        { id: 'bfs-traversal', title: 'Обхід графа в ширину', difficulty: 'easy', topic: 'BFS' },
        { id: 'dijkstra-weighted', title: 'Найкоротший шлях у зваженому графі', difficulty: 'medium', topic: 'Dijkstra' }
      ],
      validator: (submission) => problemValidators['shortest-path'](submission, {
        type: 'shortest-path',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' },
            { id: 5, label: 'E' }
          ],
          edges: [
            { source: 1, target: 2 },
            { source: 1, target: 3 },
            { source: 2, target: 4 },
            { source: 3, target: 5 },
            { source: 4, target: 5 }
          ],
          type: 'undirected',
          weighted: false
        },
        startNode: 'A',
        endNode: 'E'
      })
    },
    {
      id: 'cycle-detection',
      title: 'Виявлення циклу в неорієнтованому графі',
      description: 'Визначте, чи містить даний неорієнтований граф цикл.',
      difficulty: 'medium',
      topics: ['dfs', 'graphs', 'cycles'],
      type: 'cycle-detection',
      config: {
        type: 'cycle-detection',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' }
          ],
          edges: [
            { source: 1, target: 2 },
            { source: 2, target: 3 },
            { source: 3, target: 4 },
            { source: 4, target: 1 }
          ],
          type: 'undirected',
          weighted: false
        }
      },
      examples: [
        {
          input: 'Граф з ребрами: A-B, B-C, C-D, D-A',
          output: 'Так, граф містить цикл',
          explanation: 'Існує цикл A → B → C → D → A.'
        }
      ],
      constraints: [
        'Граф є неорієнтованим',
        'Граф може містити від 3 до 10 вершин',
        'Кожне ребро з\'являється не більше одного разу'
      ],
      hint: 'Використовуйте DFS. Цикл існує, якщо ви зустрічаєте вершину, яка вже була відвідана, і вона не є батьком поточної вершини.',
      solution: 'Так, граф містить цикл A-B-C-D-A.',
      estimatedTime: 20,
      successRate: 72,
      attemptedCount: 980,
      averageTime: 18,
      relatedProblems: [
        { id: 'directed-cycle', title: 'Виявлення циклу в орієнтованому графі', difficulty: 'medium', topic: 'DFS' },
        { id: 'bipartite-check', title: 'Перевірка на дводольність', difficulty: 'medium', topic: 'BFS' }
      ],
      validator: (submission) => problemValidators['cycle-detection'](submission, {
        type: 'cycle-detection',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' }
          ],
          edges: [
            { source: 1, target: 2 },
            { source: 2, target: 3 },
            { source: 3, target: 4 },
            { source: 4, target: 1 }
          ],
          type: 'undirected',
          weighted: false
        }
      })
    },
    {
      id: 'dijkstra-shortest-path',
      title: 'Найкоротший шлях у зваженому графі',
      description: 'Знайдіть найкоротший шлях між двома вузлами у зваженому графі, використовуючи алгоритм Дейкстри.',
      difficulty: 'medium',
      topics: ['dijkstra', 'paths', 'weighted-graphs'],
      type: 'shortest-path',
      config: {
        type: 'shortest-path',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' }
          ],
          edges: [
            { source: 1, target: 2, weight: 4 },
            { source: 1, target: 3, weight: 2 },
            { source: 2, target: 4, weight: 5 },
            { source: 3, target: 2, weight: 1 },
            { source: 3, target: 4, weight: 8 },
            { source: 4, target: 1, weight: 10 }
          ],
          type: 'undirected',
          weighted: true
        },
        startNode: 'A',
        endNode: 'D'
      },
      examples: [
        {
          input: 'Початкова вершина: A, Кінцева вершина: D',
          output: 'Найкоротший шлях: A → C → B → D (вага: 8)',
          explanation: 'Шлях A → B → D має вагу 9, а A → C → D має вагу 10, але A → C → B → D має вагу тільки 8.'
        }
      ],
      constraints: [
        'Граф є зваженим і неорієнтованим',
        'Ваги ребер є додатними цілими числами',
        'Граф є зв\'язним'
      ],
      hint: 'Використовуйте алгоритм Дейкстри з чергою пріоритетів. Завжди вибирайте вершину з найменшою поточною відстанню.',
      solution: 'Найкоротший шлях: A → C → B → D з загальною вагою 8.',
      estimatedTime: 25,
      successRate: 68,
      attemptedCount: 850,
      averageTime: 22,
      relatedProblems: [
        { id: 'bellman-ford', title: 'Найкоротші шляхи з від\'ємними вагами', difficulty: 'hard', topic: 'Bellman-Ford' },
        { id: 'bfs-shortest-path', title: 'Найкоротший шлях у незваженому графі', difficulty: 'easy', topic: 'BFS' }
      ],
      validator: (submission) => problemValidators['shortest-path'](submission, {
        type: 'shortest-path',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' }
          ],
          edges: [
            { source: 1, target: 2, weight: 4 },
            { source: 1, target: 3, weight: 2 },
            { source: 2, target: 4, weight: 5 },
            { source: 3, target: 2, weight: 1 },
            { source: 3, target: 4, weight: 8 },
            { source: 4, target: 1, weight: 10 }
          ],
          type: 'undirected',
          weighted: true
        },
        startNode: 'A',
        endNode: 'D'
      })
    },
    {
      id: 'min-spanning-tree',
      title: 'Мінімальне кістякове дерево',
      description: 'Знайдіть мінімальне кістякове дерево зв\'язного неорієнтованого графа.',
      difficulty: 'medium',
      topics: ['mst', 'graphs', 'kruskal', 'prim'],
      type: 'minimum-spanning-tree',
      config: {
        type: 'minimum-spanning-tree',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' }
          ],
          edges: [
            { source: 1, target: 2, weight: 3 },
            { source: 1, target: 3, weight: 5 },
            { source: 2, target: 3, weight: 1 },
            { source: 2, target: 4, weight: 4 },
            { source: 3, target: 4, weight: 2 }
          ],
          type: 'undirected',
          weighted: true
        }
      },
      examples: [
        {
          input: 'Граф з ребрами: (A,B,3), (A,C,5), (B,C,1), (B,D,4), (C,D,2)',
          output: 'МКД: ребра (B,C,1), (C,D,2), (A,B,3), загальна вага: 6',
          explanation: 'Ці ребра з\'єднують всі вершини з мінімальною загальною вагою.'
        }
      ],
      constraints: [
        'Граф є зв\'язним і неорієнтованим',
        'Ваги ребер є додатними цілими числами',
        'МКД повинно містити рівно V-1 ребер для V вершин'
      ],
      hint: 'Використовуйте алгоритм Крускала: відсортуйте ребра за вагою і додавайте їх, якщо вони не створюють цикл.',
      solution: 'МКД складається з ребер: B-C (1), C-D (2), A-B (3) з загальною вагою 6.',
      estimatedTime: 30,
      successRate: 62,
      attemptedCount: 720,
      averageTime: 28,
      relatedProblems: [
        { id: 'prims-algorithm', title: 'Алгоритм Прима для МКД', difficulty: 'medium', topic: 'MST' },
        { id: 'union-find', title: 'Структура даних Union-Find', difficulty: 'medium', topic: 'Data Structures' }
      ],
      validator: (submission) => problemValidators['minimum-spanning-tree'](submission, {
        type: 'minimum-spanning-tree',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' }
          ],
          edges: [
            { source: 1, target: 2, weight: 3 },
            { source: 1, target: 3, weight: 5 },
            { source: 2, target: 3, weight: 1 },
            { source: 2, target: 4, weight: 4 },
            { source: 3, target: 4, weight: 2 }
          ],
          type: 'undirected',
          weighted: true
        }
      })
    },
    {
      id: 'bfs-traversal',
      title: 'Обхід графа в ширину (BFS)',
      description: 'Виконайте обхід графа в ширину, починаючи з заданої вершини.',
      difficulty: 'easy',
      topics: ['bfs', 'traversal'],
      type: 'graph-traversal',
      config: {
        type: 'graph-traversal',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' },
            { id: 5, label: 'E' }
          ],
          edges: [
            { source: 1, target: 2 },
            { source: 1, target: 3 },
            { source: 2, target: 4 },
            { source: 3, target: 5 }
          ],
          type: 'undirected',
          weighted: false
        },
        startNode: 'A'
      },
      examples: [
        {
          input: 'Початкова вершина: A',
          output: 'Порядок обходу: A, B, C, D, E',
          explanation: 'BFS спочатку відвідує всіх сусідів A (B, C), потім всіх сусідів B і C (D, E).'
        }
      ],
      constraints: [
        'Граф є неорієнтованим',
        'Початкова вершина завжди досяжна',
        'При однаковому рівні сусіди відвідуються в алфавітному порядку'
      ],
      hint: 'Використовуйте чергу (FIFO). Додайте початкову вершину в чергу, потім для кожної вершини з черги додайте всіх невідвіданих сусідів.',
      solution: 'Правильний порядок BFS обходу: A, B, C, D, E.',
      estimatedTime: 15,
      successRate: 78,
      attemptedCount: 920,
      averageTime: 13,
      relatedProblems: [
        { id: 'dfs-traversal', title: 'Обхід графа в глибину (DFS)', difficulty: 'easy', topic: 'DFS' },
        { id: 'bfs-shortest-path', title: 'Найкоротший шлях у незваженому графі', difficulty: 'easy', topic: 'BFS' }
      ],
      validator: (submission) => problemValidators['graph-traversal'](submission, {
        type: 'graph-traversal',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' },
            { id: 5, label: 'E' }
          ],
          edges: [
            { source: 1, target: 2 },
            { source: 1, target: 3 },
            { source: 2, target: 4 },
            { source: 3, target: 5 }
          ],
          type: 'undirected',
          weighted: false
        },
        startNode: 'A'
      })
    },
    {
      id: 'bipartite-graph',
      title: 'Інтерактивна перевірка дводольності графа',
      description: 'Завдання: Визначте, чи є даний граф дводольним, розфарбувавши його вершини у два кольори так, щоб жодні дві сусідні вершини не мали однакового кольору. Використовуйте інтерактивний інтерфейс для розфарбовування вершин та переміщення їх на полотні.',
      difficulty: 'medium',
      topics: ['bfs', 'dfs', 'graphs', 'coloring'],
      type: 'bipartite-check',
      config: {
        type: 'bipartite-check',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' },
            { id: 5, label: 'E' },
            { id: 6, label: 'F' },
            { id: 7, label: 'G' },
            { id: 8, label: 'H' }
          ],
          edges: [
            { source: 1, target: 2 }, // A-B
            { source: 1, target: 4 }, // A-D
            { source: 1, target: 6 }, // A-F
            { source: 2, target: 3 }, // B-C
            { source: 2, target: 5 }, // B-E
            { source: 3, target: 4 }, // C-D
            { source: 3, target: 8 }, // C-H
            { source: 4, target: 7 }, // D-G
            { source: 5, target: 6 }, // E-F
            { source: 5, target: 8 }, // E-H
            { source: 6, target: 7 }, // F-G
            { source: 7, target: 8 }  // G-H
          ],
          type: 'undirected',
          weighted: false
        }
      },
      examples: [
        {
          input: 'Граф з 8 вершинами (A-H) та 12 ребрами',
          output: 'Дводольний граф з двома групами: {A,C,E,G} та {B,D,F,H}',
          explanation: 'Граф є дводольним, оскільки його вершини можна розділити на дві групи так, що всі ребра з\'єднують лише вершини з різних груп. Використовуйте інтерфейс для розфарбовування: оберіть колір (наприклад, синій), потім клацніть на вершини A,C,E,G. Оберіть інший колір (червоний) і розфарбуйте B,D,F,H.'
        }
      ],
      constraints: [
        '🎨 Використовуйте тільки два різні кольори для розфарбовування',
        '🔗 Сусідні вершини (з\'єднані ребром) повинні мати різні кольори',
        '✅ Всі вершини мають бути розфарбовані для успішного виконання',
        '🖱️ Використовуйте режим "Select" для переміщення вершин або канви'
      ],
      hint: '💡 Підказка: Почніть з вершини A - дайте їй синій колір. Потім всім її сусідам (B, D, F) дайте червоний колір. Продовжуйте цей процес: сусіди червоних вершин повинні бути синіми. Якщо виникає суперечність - граф не є дводольним.',
      solution: '✅ Правильне рішення: Граф є дводольним. Група 1 (синій): A, C, E, G. Група 2 (червоний): B, D, F, H.',
      estimatedTime: 15,
      successRate: 78,
      attemptedCount: 642,
      averageTime: 12,
      relatedProblems: [
        { id: 'graph-coloring', title: 'Розфарбування графа', difficulty: 'hard', topic: 'Graph Coloring' },
        { id: 'cycle-detection', title: 'Виявлення циклу', difficulty: 'medium', topic: 'DFS' }
      ],
      validator: (submission) => problemValidators['bipartite-check'](submission, {
        type: 'bipartite-check',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' },
            { id: 5, label: 'E' },
            { id: 6, label: 'F' },
            { id: 7, label: 'G' },
            { id: 8, label: 'H' }
          ],
          edges: [
            { source: 1, target: 2 },
            { source: 1, target: 4 },
            { source: 1, target: 6 },
            { source: 2, target: 3 },
            { source: 2, target: 5 },
            { source: 3, target: 4 },
            { source: 3, target: 8 },
            { source: 4, target: 7 },
            { source: 5, target: 6 },
            { source: 5, target: 8 },
            { source: 6, target: 7 },
            { source: 7, target: 8 }
          ],
          type: 'undirected',
          weighted: false
        }
      })
    },
    {
      id: 'basic-graph-theory',
      title: 'Що таке повний граф?',
      description: 'Питання: Розгляньте різні типи графів та оберіть правильне означення повного графа. Подивіться на приклади графів нижче, щоб краще зрозуміти відмінності.',
      difficulty: 'easy',
      topics: ['theory', 'basics'],
      type: 'multiple-choice',
      config: {
        type: 'multiple-choice',
        question: '📚 Що таке повний граф?',
        options: [
          '🔗 Граф, в якому кожна пара вершин з\'єднана ребром',
          '🌳 Граф, який не містить циклів (дерево)',
          '⚖️ Граф, в якому всі вершини мають однаковий степінь',
          '🎨 Граф, який можна розфарбувати двома кольорами (дводольний)'
        ],
        correctAnswer: 0,
        // Adding visual examples of different graph types
        graphExamples: [
          {
            type: 'complete',
            title: 'Повний граф K₄',
            graph: {
              nodes: [
                { id: 1, label: 'A' },
                { id: 2, label: 'B' },
                { id: 3, label: 'C' },
                { id: 4, label: 'D' }
              ],
              edges: [
                { source: 1, target: 2 },
                { source: 1, target: 3 },
                { source: 1, target: 4 },
                { source: 2, target: 3 },
                { source: 2, target: 4 },
                { source: 3, target: 4 }
              ],
              type: 'undirected',
              weighted: false
            }
          },
          {
            type: 'tree',
            title: 'Дерево (ациклічний граф)',
            graph: {
              nodes: [
                { id: 1, label: 'A' },
                { id: 2, label: 'B' },
                { id: 3, label: 'C' },
                { id: 4, label: 'D' }
              ],
              edges: [
                { source: 1, target: 2 },
                { source: 1, target: 3 },
                { source: 2, target: 4 }
              ],
              type: 'undirected',
              weighted: false
            }
          },
          {
            type: 'regular',
            title: 'Регулярний граф (степінь 2)',
            graph: {
              nodes: [
                { id: 1, label: 'A' },
                { id: 2, label: 'B' },
                { id: 3, label: 'C' },
                { id: 4, label: 'D' }
              ],
              edges: [
                { source: 1, target: 2 },
                { source: 2, target: 3 },
                { source: 3, target: 4 },
                { source: 4, target: 1 }
              ],
              type: 'undirected',
              weighted: false
            }
          },
          {
            type: 'bipartite',
            title: 'Дводольний граф',
            graph: {
              nodes: [
                { id: 1, label: 'A' },
                { id: 2, label: 'B' },
                { id: 3, label: 'C' },
                { id: 4, label: 'D' }
              ],
              edges: [
                { source: 1, target: 3 },
                { source: 1, target: 4 },
                { source: 2, target: 3 },
                { source: 2, target: 4 }
              ],
              type: 'undirected',
              weighted: false
            }
          }
        ]
      },
      examples: [
        {
          input: 'Що таке повний граф?',
          output: 'Граф, в якому кожна пара вершин з\'єднана ребром',
          explanation: 'Повний граф K_n містить всі можливі ребра між n вершинами. Для n вершин кількість ребер дорівнює n(n-1)/2.'
        }
      ],
      constraints: [
        '📖 Оберіть одну правильну відповідь',
        '👀 Уважно розгляньте приклади графів',
        '🧠 Згадайте основні означення з теорії графів'
      ],
      hint: '💡 Підказка: У повному графі кожна вершина з\'єднана з усіма іншими вершинами. Для графа з 4 вершинами це означає 6 ребер (4×3/2).',
      solution: '✅ Правильна відповідь: "Граф, в якому кожна пара вершин з\'єднана ребром". Це класичне означення повного графа.',
      estimatedTime: 8,
      successRate: 89,
      attemptedCount: 1650,
      averageTime: 6,
      relatedProblems: [
        { id: 'bipartite-graph', title: 'Перевірка дводольності', difficulty: 'medium', topic: 'Graph Coloring' },
        { id: 'cycle-detection', title: 'Виявлення циклів', difficulty: 'medium', topic: 'Graph Properties' }
      ],
      validator: (submission) => problemValidators['multiple-choice'](submission, {
        type: 'multiple-choice',
        question: '📚 Що таке повний граф?',
        options: [
          '🔗 Граф, в якому кожна пара вершин з\'єднана ребром',
          '🌳 Граф, який не містить циклів (дерево)',
          '⚖️ Граф, в якому всі вершини мають однаковий степінь',
          '🎨 Граф, який можна розфарбувати двома кольорами (дводольний)'
        ],
        correctAnswer: 0
      })
    },
    {
      id: 'algorithm-steps-order',
      title: 'Порядок кроків алгоритму BFS',
      description: 'Розташуйте кроки алгоритму пошуку в ширину (BFS) у правильному порядку.',
      difficulty: 'easy',
      topics: ['bfs', 'algorithms'],
      type: 'drag-and-drop',
      config: {
        type: 'drag-and-drop',
        items: [
          'Ініціалізувати чергу та додати початкову вершину',
          'Позначити початкову вершину як відвідану',
          'Поки черга не порожня, витягнути вершину з черги',
          'Додати всіх невідвіданих сусідів до черги',
          'Позначити сусідів як відвідані',
          'Повторити для наступної вершини в черзі'
        ],
        correctOrder: [0, 1, 2, 3, 4, 5]
      },
      examples: [
        {
          input: 'Кроки алгоритму BFS',
          output: 'Правильний порядок кроків алгоритму',
          explanation: 'BFS використовує чергу для систематичного обходу графа по рівнях.'
        }
      ],
      constraints: [
        'Перетягніть елементи в правильному порядку',
        'Всі кроки повинні бути включені',
        'Порядок має логічний сенс для алгоритму BFS'
      ],
      hint: 'Подумайте про те, як працює черга (FIFO) і як BFS досліджує граф по рівнях.',
      solution: 'Кроки в правильному порядку: ініціалізація → позначення → цикл обробки → додавання сусідів → позначення → повторення.',
      estimatedTime: 8,
      successRate: 84,
      attemptedCount: 680,
      averageTime: 6,
      relatedProblems: [
        { id: 'dfs-steps-order', title: 'Порядок кроків алгоритму DFS', difficulty: 'easy', topic: 'DFS' },
        { id: 'bfs-traversal', title: 'Обхід графа в ширину', difficulty: 'easy', topic: 'BFS' }
      ],
      validator: (submission) => problemValidators['drag-and-drop'](submission, {
        type: 'drag-and-drop',
        items: [
          'Ініціалізувати чергу та додати початкову вершину',
          'Позначити початкову вершину як відвідану',
          'Поки черга не порожня, витягнути вершину з черги',
          'Додати всіх невідвіданих сусідів до черги',
          'Позначити сусідів як відвідані',
          'Повторити для наступної вершини в черзі'
        ],
        correctOrder: [0, 1, 2, 3, 4, 5]
      })
    },
    {
      id: 'bellman-ford-negative-weights',
      title: 'Алгоритм Беллмана-Форда з від\'ємними вагами',
      description: 'Знайдіть найкоротші шляхи від початкової вершини до всіх інших у орієнтованому зваженому графі, який може містити від\'ємні ваги ребер.',
      difficulty: 'hard',
      topics: ['bellman-ford', 'shortest-paths', 'negative-weights'],
      type: 'shortest-path',
      config: {
        type: 'shortest-path',
        graph: {
          nodes: [
            { id: 1, label: 'S' },
            { id: 2, label: 'A' },
            { id: 3, label: 'B' },
            { id: 4, label: 'C' },
            { id: 5, label: 'D' }
          ],
          edges: [
            { source: 1, target: 2, weight: 4 },
            { source: 1, target: 3, weight: 2 },
            { source: 2, target: 4, weight: 3 },
            { source: 3, target: 2, weight: -2 },
            { source: 3, target: 4, weight: 4 },
            { source: 4, target: 5, weight: -1 },
            { source: 2, target: 5, weight: 6 }
          ],
          type: 'directed',
          weighted: true
        },
        startNode: 'S',
        endNode: 'D'
      },
      examples: [
        {
          input: 'Початкова вершина: S, Кінцева вершина: D',
          output: 'Найкоротший шлях: S → B → A → C → D (вага: 5)',
          explanation: 'Алгоритм Беллмана-Форда може обробляти від\'ємні ваги, на відміну від алгоритму Дейкстри.'
        }
      ],
      constraints: [
        'Граф є орієнтованим і зваженим',
        'Можуть існувати ребра з від\'ємними вагами',
        'Граф не повинен містити від\'ємних циклів',
        'Алгоритм працює за час O(VE)'
      ],
      hint: 'Алгоритм Беллмана-Форда релаксує всі ребра V-1 разів, де V - кількість вершин. Від\'ємні ваги роблять граф складнішим для обробки.',
      solution: 'Найкоротший шлях: S → B → A → C → D з вагою 5. Шлях S → B → A використовує від\'ємне ребро B → A.',
      estimatedTime: 35,
      successRate: 45,
      attemptedCount: 380,
      averageTime: 32,
      relatedProblems: [
        { id: 'dijkstra-shortest-path', title: 'Алгоритм Дейкстри', difficulty: 'medium', topic: 'Shortest Paths' },
        { id: 'floyd-warshall', title: 'Алгоритм Флойда-Воршалла', difficulty: 'hard', topic: 'All Pairs Shortest Path' }
      ],
      validator: (submission) => problemValidators['bellman-ford'](submission, {
        type: 'shortest-path',
        graph: {
          nodes: [
            { id: 1, label: 'S' },
            { id: 2, label: 'A' },
            { id: 3, label: 'B' },
            { id: 4, label: 'C' },
            { id: 5, label: 'D' }
          ],
          edges: [
            { source: 1, target: 2, weight: 4 },
            { source: 1, target: 3, weight: 2 },
            { source: 2, target: 4, weight: 3 },
            { source: 3, target: 2, weight: -2 },
            { source: 3, target: 4, weight: 4 },
            { source: 4, target: 5, weight: -1 },
            { source: 2, target: 5, weight: 6 }
          ],
          type: 'directed',
          weighted: true
        },
        startNode: 'S',
        endNode: 'D'
      })
    },
    {
      id: 'topological-sort',
      title: 'Топологічне сортування DAG',
      description: 'Виконайте топологічне сортування орієнтованого ациклічного графа (DAG). Знайдіть лінійне впорядкування вершин, що відповідає орієнтації ребер.',
      difficulty: 'medium',
      topics: ['topological-sort', 'dag', 'ordering'],
      type: 'topological-sort',
      config: {
        type: 'topological-sort',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' },
            { id: 5, label: 'E' },
            { id: 6, label: 'F' }
          ],
          edges: [
            { source: 1, target: 2 },
            { source: 1, target: 3 },
            { source: 2, target: 4 },
            { source: 3, target: 4 },
            { source: 3, target: 5 },
            { source: 4, target: 6 },
            { source: 5, target: 6 }
          ],
          type: 'directed',
          weighted: false
        }
      },
      examples: [
        {
          input: 'Орієнтований ациклічний граф з ребрами A→B, A→C, B→D, C→D, C→E, D→F, E→F',
          output: 'Можливий порядок: A, B, C, D, E, F або A, C, B, D, E, F',
          explanation: 'Топологічне сортування може мати кілька правильних відповідей, головне - не порушувати напрямок ребер.'
        }
      ],
      constraints: [
        'Граф повинен бути орієнтованим і ациклічним (DAG)',
        'Кожна вершина має бути включена рівно один раз',
        'Для кожного ребра u → v, вершина u має йти перед v у результаті'
      ],
      hint: 'Використовуйте алгоритм Кана: спочатку додайте всі вершини без вхідних ребер, потім поступово видаляйте їх та оновлюйте ступені входу.',
      solution: 'Один з правильних порядків: A, C, B, E, D, F. Алгоритм базується на ступенях входу вершин.',
      estimatedTime: 25,
      successRate: 68,
      attemptedCount: 520,
      averageTime: 22,
      relatedProblems: [
        { id: 'dfs-directed', title: 'DFS в орієнтованому графі', difficulty: 'medium', topic: 'Graph Traversal' },
        { id: 'cycle-detection-directed', title: 'Виявлення циклів в орієнтованому графі', difficulty: 'medium', topic: 'Cycle Detection' }
      ],
      validator: (submission) => problemValidators['topological-sort'](submission, {
        type: 'topological-sort',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' },
            { id: 5, label: 'E' },
            { id: 6, label: 'F' }
          ],
          edges: [
            { source: 1, target: 2 },
            { source: 1, target: 3 },
            { source: 2, target: 4 },
            { source: 3, target: 4 },
            { source: 3, target: 5 },
            { source: 4, target: 6 },
            { source: 5, target: 6 }
          ],
          type: 'directed',
          weighted: false
        }
      })
    },
    {
      id: 'floyd-warshall-matrix',
      title: 'Алгоритм Флойда-Воршалла',
      description: 'Визначте найкоротші відстані між усіма парами вершин в орієнтованому зваженому графі, використовуючи алгоритм Флойда-Воршалла. Проаналізуйте граф та оберіть правильну відповідь.',
      difficulty: 'hard',
      topics: ['floyd-warshall', 'all-pairs-shortest-path', 'dynamic-programming'],
      type: 'multiple-choice',
      config: {
        type: 'multiple-choice',
        options: [
          'Найкоротша відстань від A до D дорівнює 5 (шлях: A→B→C→D)',
          'Найкоротша відстань від A до D дорівнює 7 (шлях: A→B→D)', 
          'Найкоротша відстань від A до D дорівнює 9 (шлях: A→D)',
          'Шлях від A до D не існує'
        ],
        correctAnswer: 0,
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' }
          ],
          edges: [
            { source: 1, target: 2, weight: 3 },
            { source: 1, target: 4, weight: 9 },
            { source: 2, target: 3, weight: 1 },
            { source: 2, target: 4, weight: 5 },
            { source: 3, target: 4, weight: 1 }
          ],
          type: 'directed',
          weighted: true
        }
      },
      examples: [
        {
          input: 'Орієнтований зважений граф з ребрами: A→B(3), A→D(9), B→C(1), B→D(5), C→D(1)',
          output: 'Найкоротша відстань A→D через шлях A→B→C→D = 3+1+1 = 5',
          explanation: 'Алгоритм Флойда-Воршалла знаходить найкоротші шляхи між всіма парами вершин за O(V³). Перевіряються всі можливі проміжні вершини.'
        }
      ],
      constraints: [
        'Граф є орієнтованим і зваженим',
        'Алгоритм працює за час O(V³)',
        'Може обробляти від\'ємні ваги (але не від\'ємні цикли)',
        'Використовує динамічне програмування'
      ],
      hint: 'Алгоритм Флойда-Воршалла перевіряє всі можливі проміжні вершини для кожної пари. Формула: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]). Спробуйте різні шляхи від A до D.',
      solution: 'Найкоротша відстань від A до D дорівнює 5 через шлях A→B→C→D (3+1+1=5), що коротше за прямий шлях A→D (9) або A→B→D (3+5=8).',
      estimatedTime: 30,
      successRate: 55,
      attemptedCount: 290,
      averageTime: 28,
      relatedProblems: [
        { id: 'bellman-ford-negative-weights', title: 'Алгоритм Беллмана-Форда', difficulty: 'hard', topic: 'Shortest Paths' },
        { id: 'dijkstra-shortest-path', title: 'Алгоритм Дейкстри', difficulty: 'medium', topic: 'Shortest Paths' }
      ],
      validator: (submission) => problemValidators['multiple-choice'](submission, {
        type: 'multiple-choice',
        options: [
          'Найкоротша відстань від A до D дорівнює 5 (шлях: A→B→C→D)',
          'Найкоротша відстань від A до D дорівнює 7 (шлях: A→B→D)',
          'Найкоротша відстань від A до D дорівнює 9 (шлях: A→D)',
          'Шлях від A до D не існує'
        ],
        correctAnswer: 0
      })
    },
    {
      id: 'dfs-directed-graph',
      title: 'Обхід орієнтованого графа в глибину (DFS)',
      description: 'Виконайте обхід орієнтованого графа в глибину, починаючи з заданої вершини. Врахуйте напрямок ребер.',
      difficulty: 'medium',
      topics: ['dfs', 'directed-graphs', 'traversal'],
      type: 'graph-traversal',
      config: {
        type: 'graph-traversal',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' },
            { id: 5, label: 'E' }
          ],
          edges: [
            { source: 1, target: 2 },
            { source: 1, target: 3 },
            { source: 2, target: 4 },
            { source: 3, target: 2 },
            { source: 3, target: 5 },
            { source: 4, target: 5 }
          ],
          type: 'directed',
          weighted: false
        },
        startNode: 'A'
      },
      examples: [
        {
          input: 'Початкова вершина: A в орієнтованому графі',
          output: 'Можливий порядок DFS: A, B, D, E, C',
          explanation: 'DFS в орієнтованому графі слідує тільки вихідним ребрам. Порядок може варіюватися залежно від вибору сусідів.'
        }
      ],
      constraints: [
        'Граф є орієнтованим',
        'Слідуйте тільки вихідним ребрам з поточної вершини',
        'Відвідайте кожну досяжну вершину рівно один раз',
        'При виборі між кількома сусідами, обирайте в алфавітному порядку'
      ],
      hint: 'Використовуйте стек або рекурсію. В орієнтованому графі з вершини можна переходити тільки по вихідним ребрам.',
      solution: 'Один з правильних DFS порядків: A, B, D, E, C або A, C, B, D, E (залежно від порядку відвідування сусідів).',
      estimatedTime: 20,
      successRate: 72,
      attemptedCount: 640,
      averageTime: 18,
      relatedProblems: [
        { id: 'bfs-traversal', title: 'Обхід в ширину (BFS)', difficulty: 'easy', topic: 'Graph Traversal' },
        { id: 'topological-sort', title: 'Топологічне сортування', difficulty: 'medium', topic: 'Topological Sort' }
      ],
      validator: (submission) => problemValidators['graph-traversal'](submission, {
        type: 'graph-traversal',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' },
            { id: 5, label: 'E' }
          ],
          edges: [
            { source: 1, target: 2 },
            { source: 1, target: 3 },
            { source: 2, target: 4 },
            { source: 3, target: 2 },
            { source: 3, target: 5 },
            { source: 4, target: 5 }
          ],
          type: 'directed',
          weighted: false
        },
        startNode: 'A'
      })
    },
    {
      id: 'strongly-connected-components',
      title: 'Створення сильно зв\'язного графа',
      description: 'Створіть сильно зв\'язний орієнтований граф з 5 вершин, додавши ребра між ними. Граф є сильно зв\'язним, якщо з будь-якої вершини можна дійти до будь-якої іншої, слідуючи орієнтованими ребрами.',
      difficulty: 'hard',
      topics: ['strongly-connected-components', 'graph-construction', 'connectivity'],
      type: 'graph-construction',
      config: {
        type: 'graph-construction',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' },
            { id: 5, label: 'E' }
          ],
          edges: [], // Start with no edges - user will add them
          type: 'directed',
          weighted: false
        }
      },
      examples: [
        {
          input: '5 вершин: A, B, C, D, E (без ребер)',
          output: 'Створіть ребра так, щоб утворився сильно зв\'язний граф, наприклад: A→B, B→C, C→D, D→E, E→A',
          explanation: 'Мінімальний сильно зв\'язний граф з 5 вершин потребує принаймні 5 ребер. Один цикл, що включає всі вершини, забезпечить сильну зв\'язність.'
        }
      ],
      constraints: [
        '🎯 Граф повинен бути сильно зв\'язним',
        '📊 5 вершин: A, B, C, D, E',
        '➡️ Граф є орієнтованим',
        '🔄 З кожної вершини має існувати шлях до кожної іншої',
        '🚫 Не можна створювати ребра від вершини до себе'
      ],
      hint: '💡 Підказка: Найпростіший спосіб - створити цикл, що проходить через всі вершини (наприклад, A→B→C→D→E→A). Можна також додати додаткові ребра для покращення зв\'язності.',
      solution: '✅ Один з можливих розв\'язків: створіть цикл A→B→C→D→E→A (5 ребер). Це забезпечить сильну зв\'язність з мінімальною кількістю ребер.',
      estimatedTime: 20,
      successRate: 65,
      attemptedCount: 420,
      averageTime: 18,
      relatedProblems: [
        { id: 'cycle-detection', title: 'Виявлення циклів', difficulty: 'medium', topic: 'Cycle Detection' },
        { id: 'dfs-directed-graph', title: 'DFS в орієнтованому графі', difficulty: 'medium', topic: 'Graph Traversal' }
      ],
      validator: (submission) => problemValidators['graph-construction'](submission, {
        type: 'graph-construction',
        graph: {
          nodes: [
            { id: 1, label: 'A' },
            { id: 2, label: 'B' },
            { id: 3, label: 'C' },
            { id: 4, label: 'D' },
            { id: 5, label: 'E' }
          ],
          edges: [],
          type: 'directed',
          weighted: false
        }
      })
    }
  ];
};