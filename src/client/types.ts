// Streaming markdown library types (external CDN)
export interface SmdRenderer {
  // Internal renderer interface
}

export interface SmdParser {
  // Internal parser interface
}

export interface SmdModule {
  default_renderer(element: HTMLElement): SmdRenderer;
  parser(renderer: SmdRenderer): SmdParser;
  parser_write(parser: SmdParser, content: string): void;
  parser_end(parser: SmdParser): void;
}

// Page data from server
export interface PageInfo {
  slug: string;
  title: string;
  modifiedAt: number;
}

export interface CommentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CommentThread {
  id: string;
  messages: CommentMessage[];
  resolved: boolean;
}

export interface InlineComment extends CommentThread {
  anchor: {
    text: string;
    prefix: string;
    suffix: string;
  };
}

// Global window extensions
declare global {
  interface Window {
    setCostLoading?: (loading: boolean) => void;
  }
}
