import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, Observable, Subject, takeUntil, throwError } from 'rxjs';
import { ESPRESSO_SUPPORT_CHAT_CONFIG } from '../support-chat.config';
import { ApiErrorBody, ChatMessageRequest, ChatMessageResponse, FeedbackRequest, ResolutionRequest, SessionCreateRequest, SupportChatApiError, SupportSession, TicketRequest, TicketResponse } from '../support-chat.models';

@Injectable()
export class SupportChatApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ESPRESSO_SUPPORT_CHAT_CONFIG);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cancelRequests = new Subject<void>();
  private get base(): string { return `${this.config.apiBaseUrl.replace(/\/$/, '')}/api/v1/support-chat`; }
  createSession(body: SessionCreateRequest): Observable<SupportSession> { return this.request(this.http.post<SupportSession>(`${this.base}/sessions`, body)); }
  getSession(chatId: string, token: string): Observable<SupportSession> { return this.request(this.http.get<SupportSession>(`${this.base}/sessions/${encodeURIComponent(chatId)}`, { headers: this.headers(token) })); }
  addContact(chatId: string, email: string, token: string): Observable<unknown> { return this.request(this.http.patch(`${this.base}/sessions/${encodeURIComponent(chatId)}/contact`, { email }, { headers: this.headers(token) })); }
  sendMessage(chatId: string, body: ChatMessageRequest, token: string): Observable<ChatMessageResponse> { return this.request(this.http.post<ChatMessageResponse>(`${this.base}/sessions/${encodeURIComponent(chatId)}/messages`, body, { headers: this.headers(token) })); }
  resolution(chatId: string, body: ResolutionRequest, token: string): Observable<unknown> { return this.request(this.http.post(`${this.base}/sessions/${encodeURIComponent(chatId)}/resolution`, body, { headers: this.headers(token) })); }
  feedback(chatId: string, body: FeedbackRequest, token: string): Observable<unknown> { return this.request(this.http.post(`${this.base}/sessions/${encodeURIComponent(chatId)}/feedback`, body, { headers: this.headers(token) })); }
  close(chatId: string, token: string): Observable<unknown> { return this.request(this.http.post(`${this.base}/sessions/${encodeURIComponent(chatId)}/close`, {}, { headers: this.headers(token) })); }
  ticket(chatId: string, body: TicketRequest, token: string): Observable<TicketResponse> { return this.request(this.http.post<TicketResponse>(`${this.base}/sessions/${encodeURIComponent(chatId)}/tickets`, body, { headers: this.headers(token) })); }
  cancelPending(): void { this.cancelRequests.next(); }
  private headers(token: string): HttpHeaders { return new HttpHeaders({ 'X-Support-Session-Token': token }); }
  private request<T>(request: Observable<T>): Observable<T> {
    return request.pipe(takeUntil(this.cancelRequests), takeUntilDestroyed(this.destroyRef), catchError((e: HttpErrorResponse) => {
      const body = (e.error ?? {}) as ApiErrorBody;
      if (e.status === 401 || e.status === 403) return throwError(() => new SupportChatApiError(e.status, 'SESSION_EXPIRED', 'Your chat session has expired.'));
      return throwError(() => new SupportChatApiError(e.status, body.code ?? 'UNKNOWN', body.message ?? 'The request could not be completed.'));
    }));
  }
}
