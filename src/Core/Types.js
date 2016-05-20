/**
 * Base Types known to Fiber.
 * @type {Object}
 * @private
 */
var $BaseTypes = {
  Arguments: {type: 'object', signature: '[object Arguments]', example: function() {return new Arguments;}},
  Array: {type: 'object', signature: '[object Array]', example: function() {return [];}},
  Object: {type: 'object', signature: '[object Object]', example: function() {return {};}},
  Boolean: {type: 'boolean', signature: '[object Boolean]', example: function() {return false;}},
  Function: {type: 'function', signature: '[object Function]', example: function() {return $fn.noop;}},
  String: {type: 'string', signature: '[object String]', example: function() {return '';}},
  Number: {type: 'number', signature: '[object Number]', example: function() {return 0;}},
  Date: {type: 'object', signature: '[object Date]', example: function() {return new Date;}},
  RegExp: {type: 'object', signature: '[object RegExp]', example: function() {return new RegExp;}},
  NaN: {type: 'number', signature: '[object Number]', example: function() {return NaN;}},
  Null: {type: 'object', signature: '[object Null]', example: function() {return null;}},
  Undefined: {type: 'undefined', signature: '[object Undefined]', example: function() {return void 0;}},
  Error: {type: 'object', signature: '[object Error]', example: function() {return new Error;}},
  //todo: check `example` of File, Blob, FormData
  File: {type: 'object', signature: '[object File]', example: function() {return new File;}},
  Blob: {type: 'object', signature: '[object Blob]', example: function() {return new Blob;}},
  FormData: {type: 'object', signature: '[object FormData]', example: function() {return new FormData;}},

  Access: {type: 'object', signature: '[object Fiber.Access]', example: function() {return new Fiber.Access;}},
};
