The `browser/espresso-support-chat.element.js` file is a same-origin loader. Keep it beside the generated `browser/main.js` when hosting the widget. The build is zoneless, so it does not need a separate Zone.js polyfill and does not interfere with Zone.js already used by Angular hosts. It does not use a CDN. This asset package has no Angular peer dependencies and works as a script asset in Angular 19 or non-Angular sites.

```html
<script src="/assets/espresso-support-chat.element.js" defer></script>
<espresso-support-chat api-base-url="https://ai.api.espresso-tutorials.com"
  platform="espresso-tutorials-de" vector-store-id="vs_example" language="de"></espresso-support-chat>
```
