# Architektur

Dieses Repository enthält zwei veröffentlichbare Pakete:

- `@espressotutorialsgmbh/et-espressi-support-chat`: Angular-22-Library mit Standalone-Komponente und NgModule-API.
- `@espresso-tutorials/support-chat-element`: eigenständiges Custom Element für Vanilla HTML und ältere Angular-Versionen.

Beide Pakete greifen auf die Support-Chat-API unter `https://ai.api.espresso-tutorials.com/api/v1/support-chat` zu. Das Backend selbst ist nicht Teil dieses Repositories.

## Entwicklung und Veröffentlichung

Lokale Einrichtung, Nutzung und Release-Ablauf stehen in [README.md](README.md). GitHub Actions prüft Änderungen bei Pushes und Pull Requests. Ein `vX.Y.Z`-Tag startet Build, npm-Veröffentlichung und Erstellung eines GitHub Releases.
