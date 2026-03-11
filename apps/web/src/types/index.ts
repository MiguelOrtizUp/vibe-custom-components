export interface SessionInfo {
  active: boolean;
  retoolOrg?: string;
  libraryName?: string;
  createdAt?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LogEntry {
  timestamp: string;
  message: string;
}
