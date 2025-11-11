// src/pages/blog/types.ts
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: BlogContent;
  category: string;
  author: string;
  date: string;
  imageUrl: string;
}

export interface BlogContent {
  introduction: string;
  sections: BlogSection[];
}

export interface BlogSection {
  title: string;
  content: string;
  subsections?: BlogSubsection[];
}

export interface BlogSubsection {
  title: string;
  content: string;
  items?: string[];
}

export type BlogPostsArray = BlogPost[];