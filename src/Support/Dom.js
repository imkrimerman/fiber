/**
 * Dom manipulation support
 * @type {Object}
 */
$dom = Fiber.fn.dom = {

  /**
   * Private configuration.
   * @type {Object}
   */
  __private: {

    /**
     * Ready state detector helpers
     * @type {Object}
     */
    ready: {
      event: 'DOMContentLoaded',
      queue: []
    }
  },

  /**
   * Creates new Dom element wrapper
   * @param {string} selector
   * @param {?HTMLElement} [scope]
   * @returns {Object}
   */
  $: function(selector, scope) {
    return Fiber.DomElement(selector, scope);
  },

  /**
   * Finds selector in the DOM or in the local scope
   * @param {string|Array.<string>} selector
   * @param {?HTMLElement} [scope=document]
   */
  find: function(selector, scope) {
    scope = $val(scope, $doc);
    return $fn.multi(selector, function(one) {
      var method = _.startsWith(one, '#') ? 'getElementById' : 'querySelectorAll'
        , found = $fn.apply(scope, method, [one]);
      if (found && found.length === 1) return found[0];
      return found;
    });
  },

  /**
   * Creates element with given attributes
   * @param {string} tag
   * @param {?Object} [attributes]
   * @returns {Array.<HTMLElement>|HTMLElement}
   */
  create: function(tag, attributes) {
    return $fn.multi(tag, function(one) {
      var element = $doc.createElement(one);
      if (_.isEmpty(attributes)) return element;
      $fn.dom.attr(element, attributes);
      return element;
    });
  },

  /**
   * Removes element
   * @param {Array.<string>|Array.<HTMLElement>|string|HTMLElement} element
   * @returns {boolean}
   */
  remove: function(element) {
    return $fn.multi(element, function(one) {
      var element = one;
      if (! (one instanceof HTMLElement)) {
        element = $fn.dom.find(element);
        if (! element) return false;
      }
      $doc.removeChild(element);
      return true;
    }, 'constant', 'every');
  },

  /**
   * Provides getter/setter for element attributes
   * @param {Array.<HTMLElement>|HTMLElement} element
   * @param {string} key
   * @param {*} value
   * @returns {Array|HTMLElement|*}
   */
  attr: function(element, key, value) {
    var argsCount = arguments.length;
    return $fn.multi(element, function(one) {
      if (argsCount === 3) one.setAttribute(key, value);
      else if (argsCount === 2) {
        if (! _.isPlainObject(key)) return one.getAttribute(key);
        $fn.multi(key, function(value, attr) {
          one.setAttribute(attr, value);
        });
      }
    });
  },

  /**
   * Sets/Gets html of the given element
   * @param {Array.<HTMLElement>|HTMLElement} element
   * @param {string|HTMLElement|Array} html
   * @returns {HTMLElement|Array}
   */
  html: function(element, html) {
    var argsCount = arguments.length;
    return $fn.multi(element, function(one) {
      if (argsCount === 1) return one.innerHTML;
      one.innerHTML = html;
      return one;
    });
  },

  /**
   * Sets/Gets text of the given element
   * @param {Array.<HTMLElement>|HTMLElement} element
   * @param {string|HTMLElement|Array} text
   * @returns {HTMLElement|Array}
   */
  text: function(element, text) {
    return $fn.multi(element, function(one) {
      if (! _.has(element.textContent)) return $fn.dom.html(element, _.escape(text));
      if (arguments.length === 1) return element.textContent;
      return element.textContent = html;
    });
  },

  /**
   * Inserts element after element
   * @param {Array.<HTMLElement>|HTMLElement} element
   * @param {Array.<HTMLElement>|HTMLElement} after
   * @returns {HTMLElement}
   */
  after: function(element, after) {
    return $fn.dom.insertAdjacent(element, 'afterend', after);
  },

  /**
   * Inserts element before element
   * @param {Array.<HTMLElement>|HTMLElement} element
   * @param {Array.<HTMLElement>|HTMLElement} before
   * @returns {HTMLElement}
   */
  before: function(element, before) {
    return $fn.dom.insertAdjacent(element, 'beforebegin', before);
  },

  /**
   * Appends element into the end of the element
   * @param {Array.<HTMLElement>|HTMLElement} element
   * @param {Array.<HTMLElement>|HTMLElement} append
   * @returns {HTMLElement}
   */
  append: function(element, append) {
    return $fn.dom.insertAdjacent(element, 'beforeend', append);
  },

  /**
   * Prepends element into the beginning of the element
   * @param {Array.<HTMLElement>|HTMLElement} element
   * @param {Array.<HTMLElement>|HTMLElement} prepend
   * @returns {HTMLElement}
   */
  prepend: function(element, prepend) {
    return $fn.dom.insertAdjacent(element, 'afterbegin', prepend);
  },

  /**
   * Inserts element using adjacent types to the other element
   * @param {Array.<HTMLElement>|HTMLElement} element
   * @param {string} type
   * @param {Array.<HTMLElement>|HTMLElement} element
   * @returns {Array.<HTMLElement>|HTMLElement}
   */
  insertAdjacent: function(element, type, insert) {
    return $fn.multi(element, function(one) {
      $fn.multi(insert, function(insertOne) {
        one.insertAdjacentHTML(type, insertOne);
      });
      return one;
    });
  },

  /**
   * Removes all content of the given element
   * @param {Array.<HTMLElement>|HTMLElement} element
   * @returns {Array.<HTMLElement>|HTMLElement}
   */
  empty: function(element) {
    return $fn.multi(element, function(one) {
      $fn.dom.text(one, '');
      return one;
    });
  },

  /**
   * Adds class to the element
   * @param {HTMLElement} element
   * @param {string} className
   * @returns {HTMLElement}
   */
  addClass: function(element, className) {
    if ($fn.dom.hasClass(element, className)) return element;
    var list = element.className.split(' ').push(className);
    element.className = list.join(' ');
    return element;
  },

  /**
   * Determines if element has class
   * @param {HTMLElement} element
   * @param {string} className
   * @returns {boolean}
   */
  hasClass: function(element, className) {
    return ! ! (~ element.className.split(' ').indexOf(className));
  },

  /**
   * Removes element class
   * @param {HTMLElement} element
   * @param {string} className
   * @returns {HTMLElement}
   */
  removeClass: function(element, className) {
    var list = element.className.split(' ')
      , index = list.indexOf(className);

    if (~ index) {
      list.splice(index, 1);
      element.className = list.join(' ');
    }

    return element;
  },

  /**
   * Toggles element class
   * @param {HTMLElement} element
   * @param {string} className
   * @returns {HTMLElement}
   */
  toggleClass: function(element, className) {
    if ($fn.dom.hasClass(element, className)) return $fn.dom.removeClass(element, className);
    return $fn.dom.addClass(element, className);
  },

  /**
   * Sets event listener for the element
   * @param {Array.<HTMLElement>|HTMLElement} element
   * @param {string} event
   * @param {Function} listener
   * @returns {HTMLElement|Array}
   */
  on: function(element, event, listener) {
    return $fn.multi(element, function(one) {
      one.addEventListener(event, listener);
      return element;
    });
  },

  /**
   * Sets event listener for the element that will be immediately removed after first trigger
   * @param {Array.<HTMLElement>|HTMLElement} element
   * @param {string} event
   * @param {Function} listener
   * @returns {HTMLElement|Array}
   */
  once: function(element, event, listener) {
    return $fn.multi(element, function(one) {
      one.addEventListener(event, function() {
        listener.apply(listener, arguments);
        $fn.dom.off(element, event, listener);
        return element;
      });
    });
  },

  /**
   * Removes event listener for the element
   * @param {Array.<HTMLElement>|HTMLElement} element
   * @param {string} event
   * @param {Function} listener
   * @returns {HTMLElement|Array}
   */
  off: function(element, event, listener) {
    return $fn.multi(element, function(one) {
      one.removeEventListener(event, listener);
      return element;
    });
  },

  /**
   * Returns dom ready state and adds callback to the ready queue.
   * @param {Function} cb
   * @returns {boolean}
   */
  ready: function(cb) {
    var ready = $private($fn.dom, 'ready')
      , isReady = $fn.dom.isReady()
      , listener;

    if (! _.isFunction(cb)) return isReady;

    if (isReady) {
      setTimeout(cb, 0);
      return isReady;
    }

    ready.queue.push(cb);

    $fn.dom.on(ready.event, listener = function() {
      isReady = true;
      $fn.dom.off(ready.event, listener);
      while (listener = ready.queue.shift()) listener();
    });

    return isReady;
  },

  /**
   * Determines if dom is ready
   * @returns {boolean}
   */
  isReady: function() {
    var hack = $fn.get($doc, 'documentElement.doScroll');
    return ! ! (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test($doc.readyState);
  }
};

/**
 * Exposed Fiber Dom manipulation support
 * @type {Function}
 */
Fiber.$ = $;
