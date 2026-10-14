import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { SupportChatComponent } from '../../support-chat/src/lib/components/support-chat.component';
import { ESPRESSO_SUPPORT_CHAT_CONFIG } from '../../support-chat/src/lib/support-chat.config';
import { SupportChatConfig } from '../../support-chat/src/lib/support-chat.models';

const config: SupportChatConfig = { apiBaseUrl: '', platform: '', vectorStoreId: '', language: 'de' };

async function register(): Promise<void> {
  if (typeof window === 'undefined' || !window.customElements || window.customElements.get('espresso-support-chat')) return;
  const app = await createApplication({ providers: [provideHttpClient(), provideZonelessChangeDetection(), { provide: ESPRESSO_SUPPORT_CHAT_CONFIG, useValue: config }] });
  const element = createCustomElement(SupportChatComponent, { injector: app.injector });
  if (!window.customElements.get('espresso-support-chat')) window.customElements.define('espresso-support-chat', element);
}

void register();
