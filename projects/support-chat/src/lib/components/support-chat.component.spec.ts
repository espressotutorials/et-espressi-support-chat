import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ESPRESSO_SUPPORT_CHAT_CONFIG } from '../support-chat.config';
import { SupportChatConfig } from '../support-chat.models';
import { SupportChatModule } from '../support-chat.module';
import { SupportChatComponent } from './support-chat.component';
import { of, Subject, throwError } from 'rxjs';
import { SimpleChange } from '@angular/core';
import { SupportChatApiError } from '../support-chat.models';

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
  it('accepts numeric userIds and sends them as strings when creating a session', async () => {
    mount({ userId: 637 });
    expect(fixture.componentInstance.askEmail).toBeFalse();
    const creating = fixture.componentInstance.sessions.create();
    const req = http.expectOne('https://api.example/api/v1/support-chat/sessions');
    expect(req.request.body.userId).toBe('637');
    req.flush({ chatId: 'chat-1', sessionToken: 'token', platform: 'et-de', language: 'de', expiresAt: new Date(Date.now() + 60_000).toISOString() });
    await creating;
  });
  it('does not ask again when only email is configured', () => {
    mount({ email: 'person@example.org' }); expect(fixture.componentInstance.askEmail).toBeFalse();
  });
  it('does not ask again when both userId and email are configured', () => {
    mount({ userId: '4711', email: 'person@example.org' }); expect(fixture.componentInstance.askEmail).toBeFalse();
  });
  it('adds the required ticket email to the existing session before using the Node ticket route', async () => {
    mount({ userId: '4711', product: 'et.training' });
    const component = fixture.componentInstance;
    component.started = true;
    component.ticketState = 'pending';
    component.emailDraft = 'person@example.org';
    spyOn(component.sessions, 'get').and.resolveTo({
      chatId: 'chat-1', sessionToken: 'token', platform: 'et-de', language: 'de',
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    });
    const addContact = spyOn(component.api, 'addContact').and.returnValue(of({}));
    const ticket = spyOn(component.api, 'ticket').and.returnValue(of({ status: 'submitted', ticketId: 'ticket-1' }));

    await component.continueTicketAfterEmail();

    expect(addContact).toHaveBeenCalledOnceWith('chat-1', 'person@example.org', 'token');
    expect(ticket).toHaveBeenCalledTimes(1);
    expect(ticket.calls.first().args[1].environment.product).toBe('et.training');
    expect(component.ticketState).toBe('submitted');
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
      messageId: 'message-1', answer: 'Antwort vom Backend',
      sources: [{ title: 'Wissensbasis.md', fileId: 'file-1' }], resolutionPrompt: true,
      needsHumanSupport: false, status: 'open'
    }));

    await component.send();

    expect(component.messages.at(-1)?.text).toBe('Antwort vom Backend');
    expect(component.messages.at(-1)?.result?.sources?.[0].title).toBe('Wissensbasis.md');
  });

  it('keeps four sequential questions paired with the response echoing each client message id', async () => {
    mount({ email: 'person@example.org' });
    const component = fixture.componentInstance;
    spyOn(component.sessions, 'get').and.resolveTo({
      chatId: 'chat-1', sessionToken: 'token', platform: 'et-de', language: 'de',
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    });
    const answers = ['Markiere den gewünschten Text.', 'Öffne die Einstellungen des Lesemodus.', 'Prüfe zuerst die Auswahl des Textes.', 'Wähle den Modus in den Anzeigeoptionen.'];
    let answerIndex = 0;
    spyOn(component.api, 'sendMessage').and.callFake((_chatId, body) => of({
      messageId: `reply-${answerIndex}`, clientMessageId: body.clientMessageId, answer: answers[answerIndex++]
    }));
    const resolution = spyOn(component.api, 'resolution').and.returnValue(of({}));

    for (const question of ['Wie markiere ich Text?', 'Wie wechsle ich den Lesemodus?', 'Markieren ist nicht möglich.', 'Wie öffne ich den nativen Modus?']) {
      component.input = question;
      await component.send();
    }

    expect(component.messages.length).toBe(8);
    for (let turn = 0; turn < 4; turn++) {
      expect(component.messages[turn * 2].role).toBe('user');
      expect(component.messages[turn * 2].text).toBe(['Wie markiere ich Text?', 'Wie wechsle ich den Lesemodus?', 'Markieren ist nicht möglich.', 'Wie öffne ich den nativen Modus?'][turn]);
      expect(component.messages[turn * 2 + 1].role).toBe('assistant');
      expect(component.messages[turn * 2 + 1].text).toBe(answers[turn]);
      expect(component.messages[turn * 2].clientMessageId).toBe(component.messages[turn * 2 + 1].clientMessageId);
      expect(component.messages[turn * 2].chatId).toBe('chat-1');
    }
    await component.resolve(true);
    expect(resolution.calls.first().args[1].messageId).toBe('reply-3');
  });

  it('rejects an answer carrying a different client message id', async () => {
    mount({ email: 'person@example.org' });
    const component = fixture.componentInstance;
    spyOn(component.sessions, 'get').and.resolveTo({
      chatId: 'chat-1', sessionToken: 'token', platform: 'et-de', language: 'de',
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    });
    spyOn(component.api, 'sendMessage').and.returnValue(of({ messageId: 'old-reply', clientMessageId: 'another-turn', answer: 'Verspätete Antwort' }));
    component.input = 'Neue Frage';

    await component.send();

    expect(component.messages.length).toBe(1);
    expect(component.messages[0].status).toBe('uncertain');
    expect(component.error).toBe(component.strings.replyMismatch!);
    expect(component.pendingUserMessage).toBe('Neue Frage');
    expect(component.showResolution).toBeFalse();
  });

  it('ignores a late response after the platform changes', async () => {
    mount({ email: 'person@example.org' });
    const component = fixture.componentInstance;
    spyOn(component.sessions, 'get').and.resolveTo({
      chatId: 'chat-old', sessionToken: 'token', platform: 'et-de', language: 'de',
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    });
    const response = new Subject<{ messageId: string; clientMessageId: string; answer: string }>();
    spyOn(component.api, 'sendMessage').and.returnValue(response);
    component.input = 'Frage in der alten Plattform';
    const sending = component.send();
    await Promise.resolve();
    expect(component.api.sendMessage).toHaveBeenCalledTimes(1);

    component.platform = 'et-fr';
    component.ngOnChanges({ platform: new SimpleChange('et-de', 'et-fr', false) });
    response.next({ messageId: 'late-reply', clientMessageId: component.pendingUserMessage, answer: 'Alte Antwort' });
    response.complete();
    await sending;

    expect(component.messages).toEqual([]);
    expect(component.config.platform).toBe('et-fr');
  });

  it('starts a clean language context and ignores the previous language response', async () => {
    mount({ email: 'person@example.org' });
    const component = fixture.componentInstance;
    spyOn(component.sessions, 'get').and.resolveTo({
      chatId: 'chat-de', sessionToken: 'token', platform: 'et-de', language: 'de',
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    });
    const response = new Subject<{ messageId: string; clientMessageId: string; answer: string }>();
    const sendMessage = spyOn(component.api, 'sendMessage').and.returnValue(response);
    component.input = 'Frage auf Deutsch';
    const sending = component.send();
    await Promise.resolve();
    const clientMessageId = sendMessage.calls.first().args[1].clientMessageId;

    component.language = 'en';
    component.ngOnChanges({ language: new SimpleChange('de', 'en', false) });
    response.next({ messageId: 'late-reply', clientMessageId, answer: 'Alte Antwort auf Deutsch' });
    response.complete();
    await sending;

    expect(component.messages).toEqual([]);
    expect(component.config.language).toBe('en');
    expect(component.error).toBe('');
  });

  it('ignores duplicate submits while a turn is still pending', async () => {
    mount({ email: 'person@example.org' });
    const component = fixture.componentInstance;
    spyOn(component.sessions, 'get').and.resolveTo({
      chatId: 'chat-1', sessionToken: 'token', platform: 'et-de', language: 'de',
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    });
    const response = new Subject<{ messageId: string; clientMessageId: string; answer: string }>();
    const sendMessage = spyOn(component.api, 'sendMessage').and.returnValue(response);
    component.input = 'Erste Frage';
    const firstSend = component.send();
    component.input = 'Doppelte Eingabe';
    await component.send();
    await Promise.resolve();

    expect(sendMessage).toHaveBeenCalledTimes(1);
    const clientMessageId = sendMessage.calls.first().args[1].clientMessageId;
    response.next({ messageId: 'reply-1', clientMessageId, answer: 'Antwort zur ersten Frage' });
    response.complete();
    await firstSend;

    expect(component.messages.filter(message => message.role === 'user').length).toBe(1);
    expect(component.messages.at(-1)?.text).toBe('Antwort zur ersten Frage');
    expect(component.input).toBe('Doppelte Eingabe');
  });

  it('keeps the same client message id for an explicit retry after a timeout', async () => {
    mount({ email: 'person@example.org' });
    const component = fixture.componentInstance;
    spyOn(component.sessions, 'get').and.resolveTo({
      chatId: 'chat-1', sessionToken: 'token', platform: 'et-de', language: 'de',
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    });
    const sendMessage = spyOn(component.api, 'sendMessage').and.returnValues(
      throwError(() => new SupportChatApiError(0, 'REQUEST_TIMEOUT', 'Timed out')),
      of({ messageId: 'reply-1', answer: 'Antwort nach Retry' })
    );
    component.input = 'Frage mit unklarem Requeststatus';

    await component.send();
    const firstId = sendMessage.calls.first().args[1].clientMessageId;
    expect(component.messages[0].status).toBe('uncertain');
    expect(component.error).toBe(component.strings.requestUncertain!);
    await component.sendPending();

    expect(sendMessage.calls.count()).toBe(2);
    expect(sendMessage.calls.mostRecent().args[1].clientMessageId).toBe(firstId);
    expect(component.messages.filter(message => message.role === 'user').length).toBe(1);
    expect(component.messages.at(-1)?.text).toBe('Antwort nach Retry');
  });

  it('treats CHAT_BUSY as an uncertain turn without automatically resending it', async () => {
    mount({ email: 'person@example.org' });
    const component = fixture.componentInstance;
    spyOn(component.sessions, 'get').and.resolveTo({
      chatId: 'chat-1', sessionToken: 'token', platform: 'et-de', language: 'de',
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    });
    const sendMessage = spyOn(component.api, 'sendMessage').and.returnValue(
      throwError(() => new SupportChatApiError(409, 'CHAT_BUSY', 'A message is already processing.'))
    );
    component.input = 'Noch verarbeitete Frage';

    await component.send();

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(component.messages[0].status).toBe('uncertain');
    expect(component.error).toBe(component.strings.requestUncertain!);
    expect(component.busy).toBeFalse();
  });

  it('does not submit an uncertain feedback rating twice and allows closing without a rating retry', async () => {
    mount({ email: 'person@example.org' });
    const component = fixture.componentInstance;
    component.showFeedback = true;
    spyOn(component.sessions, 'get').and.resolveTo({
      chatId: 'chat-1', sessionToken: 'token', platform: 'et-de', language: 'de',
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    });
    const feedback = spyOn(component.api, 'feedback').and.returnValue(
      throwError(() => new SupportChatApiError(0, 'REQUEST_TIMEOUT', 'Timed out'))
    );
    const close = spyOn(component.api, 'close').and.returnValue(of({}));

    await component.end('positive');
    expect(component.feedbackUncertain).toBeTrue();
    expect(component.busy).toBeFalse();
    expect(component.error).toBe(component.strings.feedbackUncertain!);

    await component.skipFeedback();
    expect(feedback).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(component.closed).toBeTrue();
  });

  it('marks a ticket timeout as unknown to prevent accidental duplicate ticket creation', async () => {
    mount({ email: 'person@example.org' });
    const component = fixture.componentInstance;
    spyOn(component.sessions, 'get').and.resolveTo({
      chatId: 'chat-1', sessionToken: 'token', platform: 'et-de', language: 'de',
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    });
    const ticket = spyOn(component.api, 'ticket').and.returnValue(
      throwError(() => new SupportChatApiError(0, 'REQUEST_TIMEOUT', 'Timed out'))
    );

    await component.createTicket();

    expect(ticket).toHaveBeenCalledTimes(1);
    expect(component.ticketState).toBe('unknown');
    expect(component.busy).toBeFalse();
  });

  it('clears the loading state and keeps feedback available when the API rejects a rating', async () => {
    mount({ email: 'person@example.org' });
    const component = fixture.componentInstance;
    component.showFeedback = true;
    spyOn(component.sessions, 'get').and.resolveTo({
      chatId: 'chat-1', sessionToken: 'token', platform: 'et-de', language: 'de',
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    });
    spyOn(component.api, 'feedback').and.returnValue(throwError(() => new SupportChatApiError(409, 'INVALID_STATE', 'Rating cannot be changed.')));

    await component.end('positive');

    expect(component.busy).toBeFalse();
    expect(component.showFeedback).toBeTrue();
    expect(component.closed).toBeFalse();
    expect(component.error).toBe(component.strings.feedbackFailed);
  });

  it('does not submit a second rating when closing fails after feedback was saved', async () => {
    mount({ email: 'person@example.org' });
    const component = fixture.componentInstance;
    spyOn(component.sessions, 'get').and.resolveTo({
      chatId: 'chat-1', sessionToken: 'token', platform: 'et-de', language: 'de',
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    });
    const feedback = spyOn(component.api, 'feedback').and.returnValue(of({}));
    spyOn(component.api, 'close').and.returnValues(
      throwError(() => new SupportChatApiError(409, 'INVALID_STATE', 'Session cannot be closed.')),
      of({})
    );

    await component.end('positive');
    expect(component.busy).toBeFalse();
    expect(component.closed).toBeFalse();
    expect(component.error).toBe(component.strings.genericError);
    await component.end('negative');

    expect(feedback).toHaveBeenCalledTimes(1);
    expect(component.closed).toBeTrue();
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
