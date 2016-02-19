/**
 * Fiber Error Bag
 * @class
 */
Fiber.ErrorBag = Fiber.Bag.extend({

  /**
   * Returns errors object if not empty and undefined otherwise
   * @returns {Object|undefined}
   */
  getErrors: function(): object | undefined {
    return _.isEmpty(this.items) ? undefined : this.items;
  },

  /**
   * Checks if error bag has errors
   * @returns {boolean}
   */
  hasErrors: function(): boolean {
    return this.getErrors() !== undefined;
  },

  /**
   * Pushes error to given key
   * @param {string} key - Key to push error to
   * @param {string} error - Error to push
   * @return {Fiber.ErrorBag}
   */
  push: function(key: string, error: string): Fiber.ErrorBag {
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
   */
  pop: function(key: string) {
    var check = this.get(key);
    if (! _.isArray(check)) return null;
    return check.pop();
  }

});
