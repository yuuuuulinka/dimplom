export interface Material {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'tutorial';
  category: string;
  thumbnailUrl?: string;
  content?: string;
  videoUrl?: string;
  rating: number;
  duration: string;
  author?: string;
}