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
