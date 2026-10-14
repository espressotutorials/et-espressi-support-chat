# Angular 22 module integration

Install the published package and import `SupportChatModule` in the host NgModule. Provide `provideHttpClient()` once in the host application and configure the chat provider per application.

```ts
providers: [provideHttpClient(), provideEspressoSupportChat({
  apiBaseUrl: 'https://ai.api.espresso-tutorials.com', platform: 'espresso-tutorials-de',
  vectorStoreId: 'vs_example', language: 'de', privacyUrl: 'https://www.espresso-tutorials.de/datenschutz/'
})]
```

```html
<et-support-chat></et-support-chat>
```

For multiple widgets, set a distinct stable `instanceId` on each component's config to isolate session restoration.
