import { Material } from '../types/materials';

export const getMaterials = (): Material[] => {
  return [
    {
      id: 'intro-graph-theory',
      title: 'Вступ до теорії графів',
      description: 'Вивчіть основні концепції теорії графів, включаючи вершини, ребра та основні властивості графів.',
      type: 'article',
      category: 'basics',
      thumbnailUrl: 'https://images.pexels.com/photos/2280547/pexels-photo-2280547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      rating: 4.8,
      duration: '10 min',
      author: 'Др. Джейн Сміт'
    },
    {
      id: 'graph-representations',
      title: 'Різні способи представлення графів',
      description: 'Дослідіть різні методи представлення графів у комп\'ютерних науках, включаючи матриці суміжності, списки суміжності та списки ребер.',
      type: 'article',
      category: 'basics',
      thumbnailUrl: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      rating: 4.5,
      duration: '15 min',
      author: 'Проф. Майкл Джонсон'
    },
    {
      id: 'bfs-algorithm',
      title: 'Алгоритм пошуку в ширину',
      description: 'Розумійте, як працює BFS і як його реалізувати для обходу графа та пошуку найкоротшого шляху в незважених графах.',
      type: 'tutorial',
      category: 'algorithms',
      thumbnailUrl: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      rating: 4.9,
      duration: '20 min',
      author: 'Др. Роберт Чен'
    },
    {
      id: 'dfs-algorithm',
      title: 'Алгоритм пошуку в глибину',
      description: 'Вивчіть алгоритм DFS для обходу графа, включаючи застосування, такі як виявлення циклів та топологічне сортування.',
      type: 'tutorial',
      category: 'algorithms',
      thumbnailUrl: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      rating: 4.7,
      duration: '18 min',
      author: 'Др. Роберт Чен'
    },
    {
      id: 'dijkstra-algorithm',
      title: 'Алгоритм найкоротшого шляху Дейкстри',
      description: 'Опануйте алгоритм Дейкстри для пошуку найкоротших шляхів між вузлами у зваженому графі.',
      type: 'video',
      category: 'algorithms',
      thumbnailUrl: 'https://images.pexels.com/photos/7413915/pexels-photo-7413915.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      videoUrl: 'https://www.youtube.com/watch?v=bZkzH5x0SKU&ab_channel=FelixTechTips',
      rating: 4.9,
      duration: '25 min',
      author: 'Проф. Сара Вільямс'
    },
    {
      id: 'prim-algorithm',
      title: 'Алгоритм мінімального кістякового дерева Прима',
      description: 'Вивчіть алгоритм Прима для знаходження мінімальних кістякових дерев у зважених графах, процес покрокового побудови.',
      type: 'video',
      category: 'algorithms',
      thumbnailUrl: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      videoUrl: 'https://www.youtube.com/watch?v=jsmMtJpPnhU&ab_channel=WilliamFiset',
      rating: 4.8,
      duration: '28 min',
      author: 'Др. Марк Томпсон'
    },
    {
      id: 'kruskal-algorithm',
      title: 'Алгоритм мінімального кістякового дерева Крускала',
      description: 'Опануйте алгоритм Крускала, використовуючи структуру даних Union-Find для ефективного побудови мінімальних кістякових дерев.',
      type: 'tutorial',
      category: 'algorithms',
      thumbnailUrl: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      rating: 4.7,
      duration: '32 min',
      author: 'Др. Марк Томпсон'
    },
    {
      id: 'bellman-ford-algorithm',
      title: 'Алгоритм Белмана-Форда для найкоротших шляхів',
      description: 'Розумійте алгоритм Белмана-Форда для пошуку найкоротших шляхів з від\'ємними вагами ребер та виявлення від\'ємних циклів.',
      type: 'video',
      category: 'algorithms',
      thumbnailUrl: 'https://images.pexels.com/photos/1181243/pexels-photo-1181243.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      videoUrl: 'https://www.youtube.com/watch?v=lyw4FaxrwHg&ab_channel=WilliamFiset',
      rating: 4.6,
      duration: '30 min',
      author: 'Проф. Сара Вільямс'
    },
    {
      id: 'minimum-spanning-trees',
      title: 'Мінімальні кістякові дерева',
      description: 'Розумійте концепцію мінімальних кістякових дерев та вивчіть алгоритми Прима і Крускала для їх знаходження.',
      type: 'article',
      category: 'algorithms',
      thumbnailUrl: 'https://images.pexels.com/photos/1261731/pexels-photo-1261731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      rating: 4.6,
      duration: '22 min',
      author: 'Др. Марк Томпсон'
    },
    {
      id: 'social-network-analysis',
      title: 'Застосування теорії графів у соціальних мережах',
      description: 'Дослідіть, як теорія графів використовується для аналізу соціальних мереж та виявлення впливових користувачів і спільнот.',
      type: 'tutorial',
      category: 'applications',
      thumbnailUrl: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      rating: 4.4,
      duration: '30 min',
      author: 'Проф. Емілі Девіс'
    },
    {
      id: 'graph-coloring',
      title: 'Проблеми розфарбування графів',
      description: 'Вивчіть алгоритми розфарбування графів та їх застосування в плануванні, розподілі регістрів та розфарбуванні карт.',
      type: 'article',
      category: 'advanced',
      thumbnailUrl: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      rating: 4.2,
      duration: '20 min',
      author: 'Др. Алекс Тернер'
    },
    {
      id: 'network-flow',
      title: 'Алгоритми потоків у мережах',
      description: 'Розумійте проблеми максимального потоку/мінімального розрізу та алгоритми, такі як Форд-Фулкерсон та Едмондс-Карп.',
      type: 'video',
      category: 'advanced',
      thumbnailUrl: 'https://images.pexels.com/photos/2881229/pexels-photo-2881229.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      videoUrl: 'https://www.youtube.com/watch?v=oHy3ddI9X3o&ab_channel=BackToBackSWE',
      rating: 4.7,
      duration: '35 min',
      author: 'Проф. Девід Вілсон'
    }
  ];
};