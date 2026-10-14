import { Injectable } from '@angular/core';
import { SupportChatConfig } from '../support-chat.models';

@Injectable()
export class EnvironmentCollectorService {
  collect(config: SupportChatConfig): { platform: string; system: string; browser_user: string; mobile: boolean; connection?: string; url: string; product?: string } {
    if (typeof navigator === 'undefined' || typeof location === 'undefined') return { platform: 'unknown', system: 'unknown', browser_user: 'unknown', mobile: false, url: '', ...(config.product ? { product: config.product } : {}) };
    const ua = navigator.userAgent;
    const browser_user = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : /OPR\//.test(ua) ? 'Opera' : 'unknown';
    const system = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Mac OS|Macintosh/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'unknown';
    const nav = navigator as Navigator & { connection?: { type?: string; effectiveType?: string } };
    const connection = nav.connection?.type ?? nav.connection?.effectiveType;
    return { platform: navigator.platform || 'unknown', system, browser_user, mobile: /Mobi|Android|iPhone|iPad/.test(ua), ...(connection ? { connection } : {}), url: `${location.origin}${location.pathname}`, ...(config.product ? { product: config.product } : {}) };
  }
}
