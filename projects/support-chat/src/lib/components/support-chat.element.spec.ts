import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createCustomElement } from '@angular/elements';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ESPRESSO_SUPPORT_CHAT_CONFIG } from '../support-chat.config';
import { SupportChatModule } from '../support-chat.module';
import { SupportChatComponent } from './support-chat.component';

describe('espresso-support-chat browser element smoke', () => {
  let host: HTMLElement | undefined;
  let frame: HTMLIFrameElement | undefined;
  afterEach(() => { host?.remove(); frame?.remove(); host = undefined; frame = undefined; TestBed.resetTestingModule(); });

  it('registers, renders in Shadow DOM, and opens the required email gate', async () => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, SupportChatModule], providers: [
      { provide: ESPRESSO_SUPPORT_CHAT_CONFIG, useValue: { apiBaseUrl: '', platform: '', vectorStoreId: '', language: 'de' } }
    ] });
    const tag = `espresso-support-chat-smoke-${Date.now()}`;
    const element = createCustomElement(SupportChatComponent, { injector: TestBed.inject(Injector) });
    customElements.define(tag, element);
    host = document.createElement(tag);
    host.setAttribute('api-base-url', 'https://api.example');
    host.setAttribute('platform', 'espresso-tutorials-de');
    host.setAttribute('vector-store-id', 'vs-example');
    host.setAttribute('language', 'de');
    document.body.append(host);
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(host.shadowRoot?.querySelector('.et-launcher')).not.toBeNull();
    (host.shadowRoot?.querySelector('.et-launcher') as HTMLButtonElement).click();
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(host.shadowRoot?.querySelector('input[type="email"][required]')).not.toBeNull();
  });

  it('loads the separately bundled browser script and applies the same gate without importing its Angular library', async () => {
    frame = document.createElement('iframe');
    document.body.append(frame);
    const frameDocument = frame.contentDocument!;
    const frameWindow = frame.contentWindow!;
    const runtimeErrors: string[] = [];
    frameWindow.addEventListener('error', event => runtimeErrors.push(`${event.message} ${event.error?.stack ?? ''}`));
    frameWindow.addEventListener('unhandledrejection', event => runtimeErrors.push(String(event.reason)));
    const script = frameDocument.createElement('script');
    script.src = '/widget/espresso-support-chat.element.js';
    const loaded = new Promise<void>((resolve, reject) => { script.onload = () => resolve(); script.onerror = () => reject(new Error('Element loader failed to load.')); });
    frameDocument.head.append(script);
    await loaded;
    await Promise.race([
      frameWindow.customElements.whenDefined('espresso-support-chat'),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Element registration timed out. Runtime errors: ${runtimeErrors.join('; ') || 'none'}. Loaded scripts: ${Array.from(frameDocument.scripts).map(item => item.src).join(', ')}`)), 1500))
    ]);
    host = frameDocument.createElement('espresso-support-chat');
    host.setAttribute('api-base-url', 'https://api.example');
    host.setAttribute('platform', 'espresso-tutorials-de');
    host.setAttribute('vector-store-id', 'vs-example');
    host.setAttribute('language', 'de');
    frameDocument.body.append(host);
    await new Promise(resolve => setTimeout(resolve, 40));
    expect(host.shadowRoot?.querySelector('.et-launcher')).not.toBeNull();
    (host.shadowRoot?.querySelector('.et-launcher') as HTMLButtonElement).click();
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(host.shadowRoot?.querySelector('input[type="email"][required]')).not.toBeNull();
  });
});
