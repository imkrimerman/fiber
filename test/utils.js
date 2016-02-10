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
    addSpy: addSpy.bind(obj),
    clearSpies: clearSpies.bind(obj),
    expectCalled: expectCalled.bind(obj)
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
};

/**
 * Removes all spies
 */
var clearSpies = function() {
  if (! this.spies) return;
  for (var key in this.spies) {
    if (_.isFunction(this.spies[key].restore)) {
      this.spies[key].restore();
    }
  }
  this.spies = [];
};

/**
 * Expect that spy is called
 * @param spy
 */
var expectCalled = function(spy) {
  expect(spy.called).to.be.true;
};

/**
 * Expect that object has all given properties
 * @param {Object} obj
 * @param {Array|Object} props
 * @param [{boolean}] isObject - default to `true`
 */
var expectHasAllProps = function(obj, props) {
  var isObject = _.isArray(props) ? false : true;
  for (var key in props) {
    var prop = isObject ? key : props[key];
    expect(obj).to.have.property(prop);
  }
};
