import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ESPRESSO_SUPPORT_CHAT_CONFIG } from '../support-chat.config';
import { SupportSession } from '../support-chat.models';
import { SupportChatApiService } from './support-chat-api.service';
import { SupportChatSessionService } from './support-chat-session.service';

describe('SupportChatSessionService', () => {
  let service: SupportChatSessionService;
  let api: SupportChatApiService;
  let http: HttpTestingController;
  const config = { apiBaseUrl: 'https://api.example', platform: 'et-de', vectorStoreId: 'vs-1', language: 'de' as const, userId: '4711', instanceId: 'widget-1' };
  const storageKey = 'espresso-support-chat:v1:et-de:widget-1:4711';

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [
      SupportChatApiService,
      SupportChatSessionService,
      { provide: ESPRESSO_SUPPORT_CHAT_CONFIG, useValue: config }
    ] });
    service = TestBed.inject(SupportChatSessionService);
    api = TestBed.inject(SupportChatApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    sessionStorage.removeItem(storageKey);
    http.verify();
    TestBed.resetTestingModule();
  });

  it('restores the same session after reload through the existing session route', async () => {
    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    const stored: SupportSession = { chatId: 'chat-1', sessionToken: 'stored-token', platform: 'et-de', language: 'de', expiresAt };
    sessionStorage.setItem(storageKey, JSON.stringify(stored));
    spyOn(api, 'getSession').and.returnValue(of({ ...stored, sessionToken: 'server-token' }));

    const restored = await service.get();

    expect(api.getSession).toHaveBeenCalledOnceWith('chat-1', 'stored-token');
    expect(restored?.chatId).toBe('chat-1');
    expect(restored?.sessionToken).toBe('stored-token');
  });
});
