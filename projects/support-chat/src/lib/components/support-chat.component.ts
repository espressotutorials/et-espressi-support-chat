import { ChangeDetectorRef, Component, DestroyRef, ElementRef, Input, OnChanges, SimpleChanges, ViewEncapsulation, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ESPRESSO_SUPPORT_CHAT_CONFIG } from '../support-chat.config';
import { ChatMessageResponse, SupportChatApiError, SupportLanguage } from '../support-chat.models';
import { EnvironmentCollectorService } from '../services/environment-collector.service';
import { SupportChatApiService } from '../services/support-chat-api.service';
import { SupportChatSessionService } from '../services/support-chat-session.service';
import { ChatStrings, getChatStrings } from '../i18n/messages';
import { renderMarkdown } from './markdown';

type ChatTurnStatus = 'pending' | 'answered' | 'failed' | 'uncertain';
interface ChatViewMessage {
  role: 'user' | 'assistant';
  text: string;
  result?: ChatMessageResponse;
  chatId?: string;
  clientMessageId?: string;
  status?: ChatTurnStatus;
}

@Component({
  selector: 'et-support-chat',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './support-chat.component.html',
  styleUrl: './support-chat.component.generated.css',
  encapsulation: ViewEncapsulation.ShadowDom,
  providers: [
    { provide: ESPRESSO_SUPPORT_CHAT_CONFIG, useFactory: () => { const value = inject(ESPRESSO_SUPPORT_CHAT_CONFIG, { skipSelf: true }); return { ...value, ...(value.theme ? { theme: { ...value.theme } } : {}) }; } },
    SupportChatApiService, SupportChatSessionService, EnvironmentCollectorService
  ],
  host: { '[style.--et-accent]': 'config.theme?.accentColor || "#28A8DF"', '[style.--et-z-index]': 'config.theme?.zIndex || 2147483000' }
})
export class SupportChatComponent implements OnChanges {
  @Input() apiBaseUrl?: string;
  @Input() platform?: string;
  @Input() vectorStoreId?: string;
  @Input() language?: SupportLanguage;
  @Input() userId?: string | number | null;
  @Input() email?: string | null;
  @Input() requestId?: string | null;
  @Input() product?: string;
  @Input() privacyUrl?: string;
  @Input() supportUrl?: string;
  @Input() instanceId?: string;

  private readonly injectedConfig = inject(ESPRESSO_SUPPORT_CHAT_CONFIG);
  readonly config = this.injectedConfig;
  readonly api = inject(SupportChatApiService);
  readonly sessions = inject(SupportChatSessionService);
  readonly environment = inject(EnvironmentCollectorService);
  readonly element = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  open = false;
  closing = false;
  busy = false;
  started = false;
  closed = false;
  askEmail: boolean;
  emailDraft = '';
  emailError = '';
  input = '';
  feedbackComment = '';
  error = '';
  ticketState = '';
  messages: ChatViewMessage[] = [];
  pendingUserMessage = '';
  private pendingClientMessageId = '';
  lastAssistantMessageId?: string;
  showResolution = false;
  showFeedback = false;
  feedbackUncertain = false;
  private identityGeneration = 0;
  private emailCapturedInWidget = false;
  private feedbackSubmitted = false;

  constructor() {
    this.askEmail = !this.config.email && !this.hasUserId(this.config.userId);
    this.emailDraft = this.config.email ?? '';
    this.destroyRef.onDestroy(() => { this.identityGeneration++; this.api.cancelPending(); });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const identityChanged = ['apiBaseUrl', 'platform', 'vectorStoreId', 'language', 'userId', 'email', 'instanceId'].some(key => !!changes[key] && !changes[key].firstChange);
    if (identityChanged) {
      this.clearCapturedEmail();
      this.feedbackSubmitted = false;
      this.identityGeneration++; this.api.cancelPending(); this.sessions.invalidate(); this.messages = []; this.started = false; this.closed = false;
      this.pendingUserMessage = ''; this.pendingClientMessageId = '';
      this.lastAssistantMessageId = undefined; this.showResolution = false; this.showFeedback = false; this.ticketState = ''; this.error = '';
      this.feedbackUncertain = false;
    }
    Object.assign(this.config, {
      ...(this.apiBaseUrl ? { apiBaseUrl: this.apiBaseUrl } : {}), ...(this.platform ? { platform: this.platform } : {}),
      ...(this.vectorStoreId ? { vectorStoreId: this.vectorStoreId } : {}), ...(this.language ? { language: this.language } : {}),
      ...(this.userId !== undefined ? { userId: this.userId === '' ? null : this.userId } : {}), ...(this.email !== undefined ? { email: this.email || null } : {}), ...(this.requestId !== undefined ? { requestId: this.requestId || null } : {}),
      ...(this.product ? { product: this.product } : {}), ...(this.privacyUrl ? { privacyUrl: this.privacyUrl } : {}),
      ...(this.supportUrl ? { supportUrl: this.supportUrl } : {}), ...(this.instanceId ? { instanceId: this.instanceId } : {})
    });
    this.askEmail = !this.config.email && !this.hasUserId(this.config.userId);
    this.emailDraft = this.config.email ?? '';
  }

  get strings(): ChatStrings {
    return getChatStrings(this.config.language);
  }

  renderMarkdown(text: string): string {
    return renderMarkdown(text);
  }

  private hasUserId(userId: string | number | null | undefined): boolean {
    return userId !== null && userId !== undefined && userId !== '';
  }

  private isUncertainRequest(error: unknown): boolean {
    return error instanceof SupportChatApiError && (error.status === 0 || error.status >= 500 || ['REQUEST_TIMEOUT', 'NETWORK_ERROR', 'CHAT_BUSY'].includes(error.code));
  }

  async show(): Promise<void> {
    this.open = true; this.error = '';
    setTimeout(() => { if (this.open) (this.element.nativeElement.shadowRoot?.querySelector('#support-email, #support-message') as HTMLElement | null)?.focus(); }, 0);
    if (!this.started) {
      await this.restore();
      const cachedEmail = this.sessions.getCachedEmail();
      if (cachedEmail && !this.config.email) {
        this.config.email = cachedEmail;
        this.emailDraft = cachedEmail;
        this.emailCapturedInWidget = true;
      }
      this.askEmail = !this.config.email && !this.hasUserId(this.config.userId);
    }
    this.changeDetector.markForCheck();
  }
  minimize(): void { if (this.closing) return; this.closing = true; }
  onWindowAnimationEnd(event: AnimationEvent): void {
    if (event.target !== event.currentTarget || event.animationName !== 'et-support-chat-close') return;
    this.open = false;
    this.closing = false;
    setTimeout(() => (this.element.nativeElement.shadowRoot?.querySelector('.et-launcher') as HTMLElement | null)?.focus(), 0);
  }
  private async restore(): Promise<void> {
    const generation = this.identityGeneration;
    const session = await this.sessions.get();
    if (generation === this.identityGeneration && session) this.started = true;
    this.changeDetector.markForCheck();
  }
  validEmail(value: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()); }
  async submitEmail(): Promise<boolean> {
    if (!this.validEmail(this.emailDraft)) { this.emailError = this.strings.emailInvalid; return false; }
    const generation = this.identityGeneration;
    const email = this.emailDraft.trim();
    this.emailError = '';
    if (this.started) {
      try {
        const session = await this.sessions.get();
        if (generation !== this.identityGeneration) return false;
        if (!session) throw new Error('The chat session is no longer available.');
        await firstValueFrom(this.api.addContact(session.chatId, email, session.sessionToken));
      }
      catch { if (generation === this.identityGeneration) { this.askEmail = true; this.emailError = this.strings.genericError; } return false; }
    }
    this.config.email = email; this.emailCapturedInWidget = true; this.sessions.cacheEmail(email); this.askEmail = false;
    this.changeDetector.markForCheck(); return generation === this.identityGeneration;
  }
  async send(): Promise<void> {
    if (this.busy || !this.input.trim()) return;
    this.showResolution = false;
    this.lastAssistantMessageId = undefined;
    if (!this.config.email && !this.hasUserId(this.config.userId)) { this.pendingUserMessage = this.input.trim(); this.pendingClientMessageId = this.uuid(); this.input = ''; this.askEmail = true; return; }
    this.pendingUserMessage = this.input.trim(); this.input = '';
    this.pendingClientMessageId = this.uuid();
    await this.sendPending();
  }
  async sendPending(): Promise<void> {
    if (!this.pendingUserMessage || this.busy) return;
    const generation = this.identityGeneration;
    let messageRequestStarted = false;
    this.busy = true; this.error = '';
    try {
      let session = await this.sessions.get();
      if (generation !== this.identityGeneration) return;
      if (!session && this.started) {
        this.started = false;
        this.clearCapturedEmail();
        if (!this.config.email && !this.hasUserId(this.config.userId)) {
          this.askEmail = true;
          return;
        }
      }
      if (!session) session = await this.sessions.create(this.config.email ?? undefined);
      if (generation !== this.identityGeneration) return;
      this.started = true;
      const text = this.pendingUserMessage;
      const requestClientMessageId = this.pendingClientMessageId;
      let userTurn = this.messages.find(message => message.role === 'user' && message.clientMessageId === requestClientMessageId);
      if (!userTurn) {
        userTurn = { role: 'user', text, chatId: session.chatId, clientMessageId: requestClientMessageId, status: 'pending' };
        this.messages.push(userTurn);
      } else {
        userTurn.chatId = session.chatId;
        userTurn.status = 'pending';
      }
      messageRequestStarted = true;
      const result = await firstValueFrom(this.api.sendMessage(session.chatId, { clientMessageId: requestClientMessageId, message: text }, session.sessionToken));
      if (generation !== this.identityGeneration) return;
      if (this.pendingClientMessageId !== requestClientMessageId) return;
      if (result.clientMessageId !== undefined && result.clientMessageId !== requestClientMessageId) {
        userTurn.status = 'uncertain';
        this.error = this.strings.replyMismatch ?? this.strings.genericError;
        return;
      }
      userTurn.status = 'answered';
      this.pendingUserMessage = ''; this.pendingClientMessageId = '';
      this.messages.push({ role: 'assistant', text: result.answer ?? result.message ?? '', result, chatId: session.chatId, clientMessageId: requestClientMessageId });
      this.lastAssistantMessageId = result.messageId;
      this.showResolution = result.resolutionPrompt !== false;
      if (result.needsHumanSupport) this.ticketState = 'offered';
    } catch (e) {
      if (generation !== this.identityGeneration) return;
      const userTurn = this.messages.find(message => message.role === 'user' && message.clientMessageId === this.pendingClientMessageId);
      if (e instanceof SupportChatApiError && e.code === 'EMAIL_REQUIRED') {
        if (userTurn) userTurn.status = 'pending';
        this.pendingUserMessage = this.pendingUserMessage || userTurn?.text || '';
        this.pendingClientMessageId ||= this.uuid(); this.askEmail = true;
      }
      else if (e instanceof SupportChatApiError && e.code === 'SESSION_EXPIRED') {
        if (userTurn) userTurn.status = 'pending';
        this.sessions.invalidate(); this.clearCapturedEmail(); this.started = false; this.askEmail = !this.config.email && !this.hasUserId(this.config.userId); this.error = this.strings.expired;
      }
      else if (e instanceof SupportChatApiError && e.code === 'NO_KNOWLEDGE_MATCH') {
        if (userTurn) userTurn.status = 'failed';
        this.error = this.strings.noKnowledge; this.ticketState = 'offered';
      }
      else {
        const uncertain = this.isUncertainRequest(e);
        if (userTurn) userTurn.status = uncertain ? 'uncertain' : 'failed';
        this.error = e instanceof SupportChatApiError && e.code === 'RATE_LIMITED' ? this.strings.rateLimited : uncertain && messageRequestStarted ? this.strings.requestUncertain ?? this.strings.genericError : this.strings.genericError;
      }
    } finally { this.busy = false; this.changeDetector.markForCheck(); }
  }
  async continueAfterEmail(): Promise<void> { if (await this.submitEmail()) await this.sendPending(); }
  async resolve(resolved: boolean): Promise<void> {
    const generation = this.identityGeneration;
    const session = await this.sessions.get(); if (generation !== this.identityGeneration || !session) return;
    this.busy = true;
    try { await firstValueFrom(this.api.resolution(session.chatId, { resolved, ...(this.lastAssistantMessageId ? { messageId: this.lastAssistantMessageId } : {}) }, session.sessionToken)); if (generation !== this.identityGeneration) return; this.showResolution = false; if (!resolved) this.ticketState = 'offered'; }
    catch { if (generation === this.identityGeneration) this.error = this.strings.genericError; } finally { this.busy = false; this.changeDetector.markForCheck(); }
  }
  async createTicket(): Promise<void> {
    if (!this.config.email) { this.askEmail = true; this.ticketState = 'pending'; return; }
    await this.submitTicket();
  }
  async continueTicketAfterEmail(): Promise<void> { if (await this.submitEmail()) await this.submitTicket(); }
  private async submitTicket(): Promise<void> {
    const generation = this.identityGeneration;
    const session = await this.sessions.get(); if (generation !== this.identityGeneration || !session || this.busy) return;
    this.busy = true; this.ticketState = 'sending'; this.error = '';
    try {
      const result = await firstValueFrom(this.api.ticket(session.chatId, { ...(this.config.requestId ? { requestId: this.config.requestId } : {}), environment: this.environment.collect(this.config) }, session.sessionToken));
      if (generation !== this.identityGeneration) return;
      this.ticketState = result.status === 'submitted' ? 'submitted' : result.status === 'unknown' ? 'unknown' : 'failed';
    } catch (e) {
      if (generation !== this.identityGeneration) return;
      if (e instanceof SupportChatApiError && e.code === 'EMAIL_REQUIRED') { this.ticketState = 'pending'; this.askEmail = true; }
      else this.ticketState = e instanceof SupportChatApiError && (e.code === 'TICKET_UNKNOWN' || this.isUncertainRequest(e)) ? 'unknown' : 'failed';
    }
    finally { this.busy = false; this.changeDetector.markForCheck(); }
  }
  async end(rating?: 'positive' | 'negative'): Promise<void> {
    if (!rating) { this.showFeedback = true; return; }
    if (this.feedbackUncertain) { await this.skipFeedback(); return; }
    const generation = this.identityGeneration; const session = await this.sessions.get();
    if (generation !== this.identityGeneration) return;
    if (session) {
      this.busy = true;
      try {
        if (!this.feedbackSubmitted) {
          await firstValueFrom(this.api.feedback(session.chatId, { rating, ...(this.feedbackComment.trim() ? { comment: this.feedbackComment.trim() } : {}) }, session.sessionToken));
          if (generation !== this.identityGeneration) return;
          this.feedbackSubmitted = true;
        }
        await firstValueFrom(this.api.close(session.chatId, session.sessionToken));
        if (generation !== this.identityGeneration) return;
      }
      catch (error) {
        if (generation === this.identityGeneration) {
          if (!this.feedbackSubmitted && this.isUncertainRequest(error)) {
            this.feedbackUncertain = true;
            this.error = this.strings.feedbackUncertain ?? this.strings.genericError;
          } else {
            this.error = !this.feedbackSubmitted && error instanceof SupportChatApiError && error.code === 'INVALID_STATE'
              ? this.strings.feedbackFailed
              : this.strings.genericError;
          }
        }
        return;
      }
      finally { this.busy = false; this.changeDetector.markForCheck(); }
    }
    this.finishChat();
  }
  async skipFeedback(): Promise<void> {
    const generation = this.identityGeneration; const session = await this.sessions.get();
    if (generation !== this.identityGeneration) return;
    if (session) { this.busy = true; try { await firstValueFrom(this.api.close(session.chatId, session.sessionToken)); if (generation !== this.identityGeneration) return; } catch { if (generation === this.identityGeneration) this.error = this.strings.genericError; return; } finally { this.busy = false; this.changeDetector.markForCheck(); } }
    this.finishChat();
  }
  startNewChat(): void {
    this.sessions.invalidate();
    this.feedbackSubmitted = false;
    this.feedbackUncertain = false;
    this.messages = []; this.started = false; this.closed = false; this.showFeedback = false; this.showResolution = false;
    this.ticketState = ''; this.error = ''; this.input = ''; this.pendingUserMessage = ''; this.pendingClientMessageId = '';
    this.feedbackComment = ''; this.lastAssistantMessageId = undefined;
    this.askEmail = !this.config.email && !this.hasUserId(this.config.userId);
    this.emailDraft = this.config.email ?? '';
    this.changeDetector.markForCheck();
  }
  private finishChat(): void {
    this.sessions.invalidate(); this.feedbackSubmitted = false; this.feedbackUncertain = false; this.showFeedback = false; this.closed = true; this.started = false; this.messages = [];
    this.ticketState = ''; this.error = ''; this.pendingUserMessage = ''; this.pendingClientMessageId = '';
    this.showResolution = false; this.lastAssistantMessageId = undefined;
    this.clearCapturedEmail();
    this.changeDetector.markForCheck();
  }
  private clearCapturedEmail(): void {
    if (!this.emailCapturedInWidget) return;
    this.config.email = null; this.emailDraft = ''; this.emailCapturedInWidget = false;
    this.askEmail = !this.hasUserId(this.config.userId);
  }
  safeLink(url: string): boolean { try { return new URL(url, typeof location === 'undefined' ? 'https://localhost/' : location.href).protocol === 'https:' || new URL(url, typeof location === 'undefined' ? 'https://localhost/' : location.href).protocol === 'http:'; } catch { return false; } }
  private uuid(): string { return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
}
