# Angular 19 host

Load the exact same independently built browser files used by a Vanilla HTML page. Do not add this repository's Angular 22 library as a dependency to an Angular 19 application.

```html
<script src="/assets/espresso-support-chat.element.js" defer></script>
<espresso-support-chat api-base-url="https://ai.api.espresso-tutorials.com"
  platform="espresso-tutorials-de" vector-store-id="vs_example" language="de"
  product="et.training"></espresso-support-chat>
```

Allow the script origin in `script-src` and the configured API origin in `connect-src` of the host CSP. Do not provide credentials as element attributes.
