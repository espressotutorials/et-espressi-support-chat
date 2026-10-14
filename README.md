# Espresso Tutorials Support Chat

Wiederverwendbares Support-Chat-Widget mit Angular-22-Library und eigenständigem Custom Element. Das Widget spricht die öffentliche Node-API unter `https://ai.api.espresso-tutorials.com/api/v1/support-chat` an.

## Voraussetzungen

- Node.js 24 und npm
- Angular 22 im Host-Projekt, wenn die Angular-Library verwendet wird

Die Angular-Library hat Peer-Dependencies auf `@angular/common`, `@angular/core` und `@angular/forms` in Version `^22.0.0`. Angular-19-Projekte dürfen diese Library nicht importieren; dafür ist das weiter unten beschriebene eigenständige Custom Element vorgesehen.

GitHub-Projekt: [espressotutorials/et-espressi-support-chat](https://github.com/espressotutorials/et-espressi-support-chat). Das Repository ist ein Workspace und kein installierbares npm-Paket; für Anwendungen die veröffentlichten Pakete verwenden. Die öffentliche Sichtbarkeit des Repositorys ändert nichts an der Lizenz: Es gilt der Hinweis in [LICENSE](LICENSE).

Die wichtigsten Projektentscheidungen und Paketgrenzen sind in [ARCHITECTURE.md](ARCHITECTURE.md) beschrieben.

## Repository bauen und prüfen

Repository auschecken und Abhängigkeiten installieren:

```bash
git clone https://github.com/espressotutorials/et-espressi-support-chat.git
cd et-espressi-support-chat
npm ci
```

Lint, Tests und beide Produktionspakete bauen:

```bash
npm run lint
npm test
npm run build
npm run pack:check
```

`npm run build` erzeugt die Angular-Library unter `dist/support-chat` und das browserfähige Custom Element unter `dist/support-chat-element/browser`. `npm run pack:check` baut beide Pakete und prüft deren tatsächlichen npm-Paketinhalt.

Für eine lokale Demo:

```bash
npm run demo
```

Danach ist das Custom Element unter <http://localhost:4200> erreichbar. API-URL, Plattform und Vector-Store-ID der Demo stehen in [examples/vanilla-html/index.html](examples/vanilla-html/index.html).

## Pakete lokal bauen und installieren

Das Root-`package.json` ist ein privater npm-Workspace und kein veröffentlichbares Paket. Zum lokalen Entwickeln kann die Angular-Library als Tarball gebaut und installiert werden.

Im geklonten Support-Chat-Repository:

```bash
npm ci
npm run build:library
npm pack ./dist/support-chat
```

`npm pack` legt im aktuellen Verzeichnis zum Beispiel `espressotutorialsgmbh-et-espressi-support-chat-0.2.0.tgz` ab. Im Angular-22-Host-Projekt installierst du den Tarball oder das veröffentlichte Paket:

```bash
npm install /pfad/zum/support-chat/espressotutorialsgmbh-et-espressi-support-chat-0.1.0.tgz
# oder nach dem Release:
npm install @espressotutorialsgmbh/et-espressi-support-chat
```

Bei einer neuen Version die Library im Quell-Repository erneut bauen und den neuen Tarball im Host installieren. Der Host speichert die Paketversion und den Installationspfad in `package.json` und `package-lock.json`. Voraussetzung ist, dass die Angular-App Angular 22 verwendet.

## In einer Angular-22-App verwenden

Für eine Standalone-App die Konfiguration einmalig in `app.config.ts` bereitstellen:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideEspressoSupportChat } from '@espressotutorialsgmbh/et-espressi-support-chat';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideEspressoSupportChat({
      apiBaseUrl: 'https://ai.api.espresso-tutorials.com',
      platform: 'espresso-tutorials-de',
      vectorStoreId: 'DEINE_VECTOR_STORE_ID',
      language: 'de',
      privacyUrl: 'https://www.espresso-tutorials.de/datenschutz/',
      product: 'et.training',
      instanceId: 'main-support-chat'
    })
  ]
};
```

Importiere die Komponente und platziere sie im App-Template:

```ts
import { Component } from '@angular/core';
import { SupportChatComponent } from '@espressotutorialsgmbh/et-espressi-support-chat';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SupportChatComponent],
  template: '<et-support-chat />'
})
export class AppComponent {}
```

Alternativ funktioniert die klassische NgModule-Integration über `SupportChatModule`:

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideEspressoSupportChat } from '@espressotutorialsgmbh/et-espressi-support-chat';
import { SupportChatModule } from '@espressotutorialsgmbh/et-espressi-support-chat';

@NgModule({
  imports: [BrowserModule, SupportChatModule],
  providers: [provideEspressoSupportChat({
    apiBaseUrl: 'https://ai.api.espresso-tutorials.com',
    platform: 'espresso-tutorials-de',
    vectorStoreId: 'DEINE_VECTOR_STORE_ID',
    language: 'de',
    privacyUrl: 'https://www.espresso-tutorials.de/datenschutz/'
  })]
})
export class AppModule {}
```

Die vollständige Konfiguration unterstützt `userId`, `email`, `requestId`, `product`, `privacyUrl`, `supportUrl`, `theme` und `instanceId`. Verwende pro Widget eine eigene stabile, nicht personenbezogene `instanceId`, wenn mehrere Widgets oder Session-Wiederherstellung benötigt werden. Die E-Mail-Adresse ist Kontaktinformation und wird nicht als Chatnachricht gesendet.

## Vanilla HTML und Angular 19

Für Vanilla-Websites und Angular-19-Hosts das separate Asset-Paket verwenden. Es enthält die eigene Angular-Runtime und hat keine Angular-Peer-Dependencies:

```bash
npm install @espressotutorialsgmbh/et-espressi-support-chat-element
```

Für einen lokalen Build des Pakets:

```bash
npm run build:element
npm pack ./dist/support-chat-element
```

Alternativ können die Dateien aus `dist/support-chat-element/browser/` gemeinsam auf dem Host gehostet werden. Den Loader und das Element in die Seite einfügen:

```html
<script src="/assets/espresso-support-chat.element.js" defer></script>
<espresso-support-chat
  api-base-url="https://ai.api.espresso-tutorials.com"
  platform="espresso-tutorials-de"
  vector-store-id="DEINE_VECTOR_STORE_ID"
  language="de"
  product="et.training"
  privacy-url="https://www.espresso-tutorials.de/datenschutz/">
</espresso-support-chat>
```

Die optionalen Attribute `user-id`, `email` und `request-id` weglassen, wenn sie nicht vorhanden sind. Keine API-Schlüssel, Laravel-Bearer-Tokens oder Downstream-Zugangsdaten in Attribute oder Skripte schreiben. Für CSP müssen die Widget-Dateien in `script-src` und die API-Origin in `connect-src` freigegeben sein.

## API- und Sitzungsdaten

Alle Requests verwenden `${apiBaseUrl}/api/v1/support-chat`. Session-Erstellung sendet `platform`, `vectorStoreId`, `language` und optional `userId`, `email` sowie den aktuellen Seitenpfad. Folgeaufrufe authentifizieren sich mit `X-Support-Session-Token`, nicht mit einem Laravel-Bearer-Token. Nachrichten enthalten `clientMessageId` und `message`; Ticketanfragen laufen ausschließlich über die Node-Bridge.

Ohne User-ID und E-Mail muss der Besucher vor der ersten Session eine gültige E-Mail-Adresse eingeben. Mit User-ID und ohne E-Mail kann er chatten; vor einer Ticketanlage wird die Adresse abgefragt und über `/contact` an die Sitzung gehängt.

Ein im Widget eingegebener Kontakt wird für die Dauer der Sitzung im Speicher gehalten. Mit stabiler `instanceId` wird er zusammen mit dem Session-Schlüssel in `sessionStorage` gespeichert, damit eine gültige Sitzung nach einem Reload wiederhergestellt werden kann. Beim Chatende, Sessionablauf oder Identitätswechsel wird der Cache gelöscht. Ohne `instanceId` bleibt die Sitzung auf die aktuelle Widget-Instanz beschränkt. `pagehide` wird nicht als bestätigter Chatabschluss behandelt.

Die API-Antwort des Nachrichtenendpunkts kann den Antworttext unter `answer` liefern. Quelleninformationen werden unterhalb der Antwort angezeigt. Das Widget rendert Antworttext als Text und interpretiert kein Markdown.

## Releases

Die Pakete verwenden dieselbe SemVer-Version. Für ein Release die gewünschte Erhöhung ausführen:

```bash
npm run release:patch # Fehlerbehebungen, z. B. 0.1.0 -> 0.1.1
npm run release:minor # neue Funktionen, z. B. 0.1.0 -> 0.2.0
npm run release:major # inkompatible Änderungen, z. B. 0.1.0 -> 1.0.0
```

Das Release-Skript aktualisiert die Version im Workspace, in beiden npm-Paketen und in `package-lock.json`, erstellt einen Release-Commit samt `vX.Y.Z`-Tag und pusht beides nach `origin`. Der Tag startet GitHub Actions: Der Workflow führt Lint, Tests und Builds aus, veröffentlicht `@espressotutorialsgmbh/et-espressi-support-chat` sowie `@espressotutorialsgmbh/et-espressi-support-chat-element` auf npmjs.com und erstellt ein GitHub Release mit automatisch generierten Notizen. Vor dem Aufruf müssen alle Änderungen committed sein. Dafür müssen `NPM_TOKEN` als GitHub Secret und Schreibrechte für `GITHUB_TOKEN` eingerichtet sein. Bereits verwendete Tags werden nicht erneut vergeben.
