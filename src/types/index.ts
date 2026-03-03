export interface Post {
  id: number;
  linkedinUrl: string;
  content: string | null;
  summary: string | null;
  preview: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  hasDocumentsCta: boolean | null;
  authorId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: number;
  name: string;
  linkedinUrl: string | null;
  headline: string | null;
  avatarUrl: string | null;
  role?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface FileCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Attachment {
  id: number;
  postId: number | null;
  authorId: number | null;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  description: string | null;
  source: string | null;
}

export interface OpinionGroup {
  id: number;
  categoryId: number;
  topic: string;
  summary: string;
}

export interface OpinionGroupPost {
  opinionGroupId: number;
  postId: number;
  stance: "agrees" | "contradicts";
}

export interface PostWithRelations extends Post {
  author?: Author | null;
  categories?: Category[];
  attachments?: Attachment[];
}

export interface OGMetadata {
  title?: string;
  description?: string;
  image?: string;
  author?: string;
}
