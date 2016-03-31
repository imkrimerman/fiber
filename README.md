# Fiber Framework
## Give your Backbone Apps some Fiber.
Fiber framework was born to bring simplicity and consistency to the Backbone Apps with the ease of development and scaling modern apps.

##Simple Application example
 - Install dependencies: jquery, lodash, backbone
 - Build fiber with: gulp build

```html
<main id="app"></main>
<script src="node_modules/jquery/dist/jquery.js"></script>
<script src="node_modules/lodash/lodash.js"></script>
<script src="node_modules/backbone/backbone.js"></script>
<script src="build/fiber.js"></script>
```

```js
var View = Fiber.View.extend({ template: '<%= page %>' });

var routes = {
  home: {
    url: ['', 'home'],
    compose: {
      View: View,
      Model: [Fiber.Model, {page: 'Home'}]
    }
  },
  login: {
    url: 'login',
    compose: {
      View: View,
      Model: [Fiber.Model, {page: 'Login'}]
    }
  }
};

var app = new Fiber.Application({
  viewport: { el: '#app' },
  router: { routes: routes },
});

app.start();

```
