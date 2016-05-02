/**
 * Messages registry
 * @type {Object}
 */
$msg = {

  error: {

  },

  warn: {

  },

  info: {

  },

  debug: {

  },

  get: function(path, data) {
    var msg = _.get($msg, path);
    if (_.isString(msg) && ! _.isEmpty(msg)) return $fn.template.system(msg, data || {});
    return msg;
  },

};
