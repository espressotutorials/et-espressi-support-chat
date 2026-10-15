import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ESPRESSO_SUPPORT_CHAT_CONFIG } from '../support-chat.config';
import { SessionCreateRequest, SupportSession } from '../support-chat.models';
import { SupportChatApiService } from './support-chat-api.service';

@Injectable()
export class SupportChatSessionService {
  private readonly config = inject(ESPRESSO_SUPPORT_CHAT_CONFIG);
  private readonly api = inject(SupportChatApiService);
  private active?: SupportSession;
  private cachedEmail?: string;
  private readonly volatileInstance = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  private key(): string { return `espresso-support-chat:v1:${encodeURIComponent(this.config.platform)}:${encodeURIComponent(this.config.instanceId ?? this.volatileInstance)}:${encodeURIComponent(this.config.userId == null || this.config.userId === '' ? 'anonymous' : String(this.config.userId))}`; }
  private emailKey(): string { return `${this.key()}:contact-email`; }
  cacheEmail(email: string): void {
    this.cachedEmail = email.trim();
    if (!this.active || !this.config.instanceId || typeof sessionStorage === 'undefined') return;
    try { sessionStorage.setItem(this.emailKey(), this.cachedEmail); } catch { /* Continue with the in-memory contact value. */ }
  }
  getCachedEmail(): string | undefined {
    if (this.cachedEmail) return this.cachedEmail;
    if (!this.active || !this.config.instanceId || typeof sessionStorage === 'undefined') return undefined;
    try { this.cachedEmail = sessionStorage.getItem(this.emailKey()) ?? undefined; } catch { /* Storage may be unavailable. */ }
    return this.cachedEmail;
  }
  async get(): Promise<SupportSession | undefined> {
    if (this.active && Date.parse(this.active.expiresAt) > Date.now()) return this.active;
    if (this.active) this.reset();
    if (!this.config.instanceId) return undefined;
    if (typeof sessionStorage === 'undefined') return undefined;
    const key = this.key();
    try {
      const stored = sessionStorage.getItem(key);
      if (!stored) return undefined;
      const candidate = JSON.parse(stored) as SupportSession;
      if (!candidate.chatId || !candidate.sessionToken || Date.parse(candidate.expiresAt) <= Date.now()) { this.reset(); return undefined; }
      const restored = await firstValueFrom(this.api.getSession(candidate.chatId, candidate.sessionToken));
      if (this.key() !== key) return undefined;
      this.active = { ...candidate, ...restored, sessionToken: candidate.sessionToken };
      return this.active;
    } catch { if (key === this.key()) this.reset(); return undefined; }
  }
  async create(email?: string): Promise<SupportSession> {
    const storageKey = this.key();
    const body: SessionCreateRequest = {
      platform: this.config.platform, vectorStoreId: this.config.vectorStoreId, language: this.config.language,
      ...(this.config.userId != null && this.config.userId !== '' ? { userId: String(this.config.userId) } : {}), ...(email || this.config.email ? { email: email || this.config.email! } : {}),
      ...(typeof location !== 'undefined' ? { pageContext: { pagePath: location.pathname } } : {})
    };
    const created = await firstValueFrom(this.api.createSession(body));
    if (storageKey !== this.key()) return created;
    this.active = created;
    try { if (this.config.instanceId && typeof sessionStorage !== 'undefined') sessionStorage.setItem(storageKey, JSON.stringify(this.active)); } catch { /* Memory-only sessions remain usable when storage is disabled. */ }
    const contactEmail = email || this.config.email;
    if (contactEmail) this.cacheEmail(contactEmail);
    return created;
  }
  invalidate(): void { this.reset(); }
  private reset(): void {
    this.active = undefined; this.cachedEmail = undefined;
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(this.key());
        sessionStorage.removeItem(this.emailKey());
      }
    } catch { /* Storage may be unavailable. */ }
  }
}
