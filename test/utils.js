expect = chai.expect;
assert = chai.assert;
val = Fiber.fn.val;
mocha.setup('bdd');

/**
 * Adds spy methods to object
 * @param {Object} obj
 * @returns {Object}
 */
var makeSpyable = function(obj) {
  _.extend(obj, {
    spies: [],
    addSpy: this.addSpy.bind(obj),
    clearSpies: this.clearSpies.bind(obj)
  });
  return obj;
};

/**
 * Adds spy to object method
 * @param {Object|Function} object
 * @param [{Function} method]
 */
var addSpy = function() {
  if (! this.spies) this.spies = [];
  var withSpy = sinon.spy.apply(sinon, arguments);
  this.spies.push(withSpy);
  return withSpy;
}

/**
 * Removes all set spies
 */
var clearSpies = function() {
  if (! this.spies) return;
  for (var key in this.spies) {
    if (_.isFunction(this.spies[key].restore)) {
      this.spies[key].restore();
    }
  }
  this.spies = [];
}
