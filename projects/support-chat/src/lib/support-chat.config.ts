import { InjectionToken, Provider } from '@angular/core';
import { SupportChatConfig } from './support-chat.models';

export const ESPRESSO_SUPPORT_CHAT_CONFIG = new InjectionToken<SupportChatConfig>('ESPRESSO_SUPPORT_CHAT_CONFIG');
export function provideEspressoSupportChat(config: SupportChatConfig): Provider {
  return { provide: ESPRESSO_SUPPORT_CHAT_CONFIG, useValue: config };
}
