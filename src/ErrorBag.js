/**
 * Fiber Error Bag
 * @class
 * @type {Function}
 * @memberof Fiber#
 */
Fiber.ErrorBag = Fiber.Bag.extend({

  /**
   * Returns errors object if not empty and undefined otherwise
   * @returns {Object|undefined}
   * @memberof Fiber.ErrorBag#
   */
  getErrors: function() {
    return _.isEmpty(this.items) ? undefined : this.items;
  },

  /**
   * Checks if error bag has errors
   * @returns {boolean}
   * @memberof Fiber.ErrorBag#
   */
  hasErrors: function() {
    return this.getErrors() !== undefined;
  },

  /**
   * Pushes error to given key
   * @param {string} key - Key to push error to
   * @param {string} error - Error to push
   * @return {Fiber.ErrorBag}
   * @memberof Fiber.ErrorBag#
   */
  push: function(key, error) {
    var check = this.get(key);
    if (! _.isArray(check)) this.set(key, []);
    var one = this.get(key);
    one.push(error);
    this.set(key, one);
    return this;
  },

  /**
   * Removes item from the end
   * @param {string} key - Key to look up value
   * @returns {*}
   * @memberof Fiber.ErrorBag#
   */
  pop: function(key) {
    var check = this.get(key);
    if (! _.isArray(check)) return null;
    return check.pop();
  }

});
