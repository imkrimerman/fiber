/**
 * Base Class
 * @class
 * @extends {Backbone.Events}
 * @private
 */
BaseClass = $fn.class.create([
  Backbone.Events, {

    /**
     * Constructs base class
     * @param {Object} [options]
     */
    constructor: $fn.class.createConstructor(),

    /**
     * Destroys Class
     * @returns {BaseClass}
     */
    destroy: function() {
      $fn.apply(this, 'destroyEvents');
      return this;
    }
  }
]);
