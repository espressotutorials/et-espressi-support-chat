import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ESPRESSO_SUPPORT_CHAT_CONFIG } from '../support-chat.config';
import { SupportChatConfig } from '../support-chat.models';
import { SupportChatModule } from '../support-chat.module';
import { SupportChatComponent } from './support-chat.component';
import { of } from 'rxjs';

describe('SupportChatComponent identity gate', () => {
  let fixture: ComponentFixture<SupportChatComponent>;
  let http: HttpTestingController;
  const mount = (config: Partial<SupportChatConfig>) => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, SupportChatModule], providers: [
      { provide: ESPRESSO_SUPPORT_CHAT_CONFIG, useValue: { apiBaseUrl: 'https://api.example', platform: 'et-de', vectorStoreId: 'vs-1', language: 'de', ...config } }
    ] });
    fixture = TestBed.createComponent(SupportChatComponent); http = TestBed.inject(HttpTestingController); fixture.detectChanges();
  };
  afterEach(() => { if (http) http.verify(); TestBed.resetTestingModule(); });

  it('requires email before the first session when neither identity field is present', async () => {
    mount({}); fixture.componentInstance.input = 'Hilfe'; await fixture.componentInstance.send();
    expect(fixture.componentInstance.askEmail).toBeTrue();
    http.expectNone('https://api.example/api/v1/support-chat/sessions');
  });
  it('allows chat with userId alone and defers email until a ticket is requested', () => {
    mount({ userId: '4711' }); expect(fixture.componentInstance.askEmail).toBeFalse();
    expect(fixture.componentInstance.config.email).toBeFalsy();
  });
  it('does not ask again when only email is configured', () => {
    mount({ email: 'person@example.org' }); expect(fixture.componentInstance.askEmail).toBeFalse();
  });
  it('does not ask again when both userId and email are configured', () => {
    mount({ userId: '4711', email: 'person@example.org' }); expect(fixture.componentInstance.askEmail).toBeFalse();
  });

  it('keeps the dialog mounted until the close animation finishes', () => {
    mount({ email: 'person@example.org' });
    fixture.componentInstance.open = true;
    fixture.detectChanges();
    fixture.componentInstance.minimize();
    fixture.detectChanges();
    expect(fixture.componentInstance.closing).toBeTrue();
    expect(fixture.componentInstance.open).toBeTrue();
    const dialog = document.createElement('section');
    const animationEnd = new AnimationEvent('animationend', { animationName: 'et-support-chat-close' });
    Object.defineProperties(animationEnd, { target: { value: dialog }, currentTarget: { value: dialog } });
    fixture.componentInstance.onWindowAnimationEnd(animationEnd);
    fixture.detectChanges();
    expect(fixture.componentInstance.closing).toBeFalse();
    expect(fixture.componentInstance.open).toBeFalse();
  });

  it('renders the backend answer field instead of an empty message', async () => {
    mount({ email: 'person@example.org' });
    const component = fixture.componentInstance;
    component.input = 'Meine Frage';
    spyOn(component.sessions, 'get').and.resolveTo({
      chatId: 'chat-1', sessionToken: 'token', platform: 'et-de', language: 'de',
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    });
    spyOn(component.api, 'sendMessage').and.returnValue(of({
      messageId: 'message-1', clientMessageId: 'client-1', answer: 'Antwort vom Backend',
      sources: [{ title: 'Wissensbasis.md', fileId: 'file-1' }], resolutionPrompt: true,
      needsHumanSupport: false, status: 'open'
    }));

    await component.send();

    expect(component.messages.at(-1)?.text).toBe('Antwort vom Backend');
    expect(component.messages.at(-1)?.result?.sources?.[0].title).toBe('Wissensbasis.md');
  });

  it('clears ticket errors on chat completion and allows a fresh chat', async () => {
    mount({ userId: '4711' });
    const component = fixture.componentInstance;
    component.ticketState = 'failed';
    component.error = 'Ticket error';
    component.emailDraft = 'person@example.org';
    await component.submitEmail();
    expect(component.sessions.getCachedEmail()).toBe('person@example.org');

    await component.skipFeedback();

    expect(component.closed).toBeTrue();
    expect(component.ticketState).toBe('');
    expect(component.error).toBe('');
    expect(component.config.email).toBeNull();
    expect(component.sessions.getCachedEmail()).toBeUndefined();
    component.startNewChat();
    expect(component.closed).toBeFalse();
  });
});
