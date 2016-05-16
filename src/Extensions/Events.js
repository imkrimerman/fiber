/**
 * Events Extension
 * @type {Object.<Fiber.Extension>}
 */
var $Events = new Fiber.Extension('Events', Fiber.Events.$mix({

  /**
   * Method name to call when extension is initiating
   * @type {string|boolean}
   */
  initWith: 'applyEvents',

  /**
   * Applies events extension.
   */
  applyEvents: function() {
    this.resetEventProperties();
    $forget(this, '$mix');
  }
}));

/**
 * Register Extension
 */
$Ioc.extension('Events', $Events);
