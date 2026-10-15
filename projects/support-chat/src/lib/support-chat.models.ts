export type SupportLanguage = 'de' | 'en' | 'fr' | 'es' | 'pt' | 'ja';
export interface SupportChatConfig {
  apiBaseUrl: string; platform: string; vectorStoreId: string; language: SupportLanguage;
  userId?: string | number | null; email?: string | null; requestId?: string | null; product?: string;
  privacyUrl?: string; supportUrl?: string;
  theme?: { accentColor?: string; position?: 'right' | 'left'; zIndex?: number };
  /** Stable per embedding when multiple instances on one page need independent restoration. */
  instanceId?: string;
}
export interface PageContext { pagePath: string; }
export interface SessionCreateRequest {
  platform: string; vectorStoreId: string; language: SupportLanguage;
  userId?: string; email?: string; pageContext?: PageContext;
}
export interface SupportSession {
  chatId: string; sessionToken: string; contactStatus?: string; platform: string;
  language: SupportLanguage; expiresAt: string;
}
export interface SupportSource { title?: string; url?: string; excerpt?: string; fileId?: string; }
export interface ChatMessageRequest { clientMessageId: string; message: string; }
export interface ChatMessageResponse {
  messageId: string; clientMessageId?: string; answer?: string; message?: string; sources?: SupportSource[];
  resolutionPrompt?: boolean; needsHumanSupport?: boolean; status?: string; createdAt?: string;
}
export interface ResolutionRequest { resolved: boolean; messageId?: string; }
export interface FeedbackRequest { rating: 'positive' | 'negative'; comment?: string; }
export interface TicketEnvironment {
  platform: string; system: string; browser_user: string; mobile: boolean;
  connection?: string; url: string; product?: string;
}
export interface TicketRequest { requestId?: string; environment: TicketEnvironment; }
export interface TicketResponse { status: 'submitted' | 'unknown' | 'failed'; ticketId?: string; }
export interface ApiErrorBody { code?: string; message?: string; }
export class SupportChatApiError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) { super(message); this.name = 'SupportChatApiError'; }
}
