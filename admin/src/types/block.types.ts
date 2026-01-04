export type ContentBlockType =
  | 'text'
  | 'heading'
  | 'divider'
  | 'image'
  | 'video'
  | 'code'
  | 'list';

export interface HeadingTitle {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  text: string;
}

export interface ContentBlockList {
  type: 'ordered' | 'unordered';
  content: string[];
}

export interface ContentBlockLink {
  text: string;
  url: string;
}

export interface ContentBlockDto {
  id?: string;
  type: ContentBlockType;
  title?: HeadingTitle;
  content?: string;
  list?: ContentBlockList;
  links?: ContentBlockLink[];
  imageUrl?: string;
  codeType?: string;
}
