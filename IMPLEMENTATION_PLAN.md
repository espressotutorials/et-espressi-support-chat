# Umsetzungsplan: Espresso Tutorials Support Chat

## Ausgangslage

Das Repository enthielt zu Beginn nur die bereitgestellte Spezifikation unter `prompts/` (die Datei ist durch `.gitignore` ausgeschlossen), eine minimale `.gitignore` und keine Anwendung, Backend-Spezifikation, CI oder Tests. Das Backend kann daher nicht lokal gegenimplementiert oder per Integrationstest auf Route-/Feldkompatibilität geprüft werden. Die Tabellen und JSON-Beispiele in der Anleitung sind die maßgebliche Vertragsquelle.

Die Anleitung verlangt Angular 22 stabil und Tailwind CSS 3.4.19. Der Lockfile löst Angular 22.2.2 und Tailwind 3.4.19 auf. Der lokale Build verwendet Angulars integrierten SQLite-Cache, weil das optionale native LMDB-Addon unter der Node/macOS-Toolchain mit einem nativen Abort endet.

## Umsetzungsschritte

1. **Workspace und öffentliche API:** Angular-22-Workspace mit striktem TypeScript, Angular-Library `@espresso-tutorials/support-chat`, `SupportChatModule`, exportierter Component und typisierter Provider-Konfiguration anlegen. Tailwind 3.4.19 mit `et-`-Prefix und deaktiviertem Preflight in die Widget-Stile kompilieren.
2. **Verträge und Zustand:** Typen, API-Client, strukturierte Fehler, per Widget isolierte Sessionverwaltung implementieren. Session-Token bleibt in Memory/`sessionStorage`, wird nur als `X-Support-Session-Token` gesendet und nach Identitäts-/Konfigurationswechsel verworfen. HTTP-Aufrufe werden bei Identitätswechsel und Component-Zerstörung abgebrochen.
3. **Chat und Kontaktfluss:** E-Mail-Gate gemäß vier Identitätsfällen, validierte Kontakt-PATCH, Chat, Quellen, Lösung, Ticket, Feedback und expliziten Abschluss in die UI integrieren. Eine noch nicht existierende Session wird erst beim ersten zulässigen Senden angelegt.
4. **Element und Host-Beispiele:** `createApplication` + `createCustomElement` registriert `<espresso-support-chat>` genau einmal; das zoneless Bundle enthält die Runtime und Shadow-DOM-Stile ohne Zone.js-Laufzeitabhängigkeit. Vanilla- und Angular-19-Script-Beispiele dokumentieren die frameworkunabhängige Einbettung.
5. **Qualität und Release:** gezielte Unit-/HTTP-Tests, Build, `npm pack`-Prüfung, README/CSP/Bundle-Hinweise und GitHub Actions für CI und taggebundene Veröffentlichung ergänzen. UI-Texte sind in einem exportierten Wörterbuch zentralisiert; DE/EN sind umgesetzt, weitere Spezifikationssprachen können ergänzt werden.

## Umsetzungsstand und verbleibende Abnahme

Library, NgModule-API, Chat-Component, API-/Session-Services, Identitäts-Gate, Ticket-/Browserumgebungsfluss, Custom-Element-Loader, Beispiele, CI-/Release-Workflows, README und HTTP-/Identitätstests sind implementiert. UI-Texte sind aus der Component extrahiert; Retry, Skip, Rate-Limit und Ablaufmeldungen verwenden dasselbe Wörterbuch. `npm run lint`, `npm test` (10 Headless-Tests) und `npm run pack:check` sind erfolgreich. Die Angular-Library wird mit rund 24.6 kB gepackter Dateigröße, das eigenständige Element mit rund 72.4 kB gepackter Dateigröße gebaut; das Element-Script selbst ist rund 233 kB unkomprimiert bzw. 63 kB geschätzt übertragen.

Da kein Backend im Repository liegt, müssen echte Antwortformate, CORS, Ablaufverhalten, Ticketstatus und HubSpot-Fehlermapping vor Veröffentlichung gegen die Node-API geprüft werden. Die angegebene GET-Session-Antwort beschreibt keinen Chatverlauf; daher wird beim Wiederherstellen die gültige Session übernommen, aber keine Historie erfunden. Das Paket ist bis zu einer Produktentscheidung zur Lizenzierung als `UNLICENSED` markiert. npm-Publishing wird in diesem Umsetzungsschritt nicht ausgeführt.
