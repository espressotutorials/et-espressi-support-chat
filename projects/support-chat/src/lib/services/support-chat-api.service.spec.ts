import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ESPRESSO_SUPPORT_CHAT_CONFIG } from '../support-chat.config';
import { SupportChatApiService } from './support-chat-api.service';

describe('SupportChatApiService', () => {
  let api: SupportChatApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [
      SupportChatApiService, { provide: ESPRESSO_SUPPORT_CHAT_CONFIG, useValue: { apiBaseUrl: 'https://api.example', platform: 'et-de', vectorStoreId: 'vs-1', language: 'de' } }
    ] });
    api = TestBed.inject(SupportChatApiService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('creates a session with the public contract fields and no bearer token', () => {
    api.createSession({ platform: 'et-de', vectorStoreId: 'vs-1', language: 'de', email: 'a@example.org' }).subscribe();
    const req = http.expectOne('https://api.example/api/v1/support-chat/sessions');
    expect(req.request.method).toBe('POST'); expect(req.request.body).toEqual({ platform: 'et-de', vectorStoreId: 'vs-1', language: 'de', email: 'a@example.org' });
    expect(req.request.headers.has('Authorization')).toBeFalse(); req.flush({ chatId: 'c1', sessionToken: 'secret', platform: 'et-de', language: 'de', expiresAt: new Date(Date.now() + 60000).toISOString() });
  });
  it('uses the session token header and client message id', () => {
    api.sendMessage('chat/1', { clientMessageId: 'm-1', message: 'Hallo' }, 'token').subscribe();
    const req = http.expectOne('https://api.example/api/v1/support-chat/sessions/chat%2F1/messages');
    expect(req.request.headers.get('X-Support-Session-Token')).toBe('token'); expect(req.request.body.clientMessageId).toBe('m-1');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({
      messageId: 'r1', clientMessageId: 'm-1',
      answer: 'Die Antwort des Support-Teams.',
      sources: [{ title: 'Wissensbasis.md', fileId: 'file-123' }],
      resolutionPrompt: true, needsHumanSupport: false, status: 'open'
    });
  });
  it('preserves the server EMAIL_REQUIRED code', () => {
    let code = ''; api.ticket('c1', { environment: { platform: 'MacIntel', system: 'macOS', browser_user: 'Chrome', mobile: false, url: 'https://x.test/a' } }, 't').subscribe({ error: e => code = e.code });
    http.expectOne('https://api.example/api/v1/support-chat/sessions/c1/tickets').flush({ code: 'EMAIL_REQUIRED' }, { status: 422, statusText: 'Unprocessable Entity' });
    expect(code).toBe('EMAIL_REQUIRED');
  });
});
