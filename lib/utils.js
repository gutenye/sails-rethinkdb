;(function (root, factory) {
  if (typeof exports === "object" && typeof module === "object")
    module.exports = factory()
  else
    root["utils"] = factory()
})(this, function() {
  var utils = {}

  function toString(x) {
    return Object.prototype.toString.call(x)
  }

  var isArray = Array.isArray
  utils.isArray = isArray

  function isObject(value) {
    return toString(value) === '[object Object]' || false
  }
  utils.isObject = isObject

  function isPlainObject(value) {
    return (!!value && typeof value === 'object' && value.constructor === Object)
  }
  utils.isPlainObject = isPlainObject

  function isRegExp(value) {
    return toString(value) === '[object RegExp]' || false
  }
  utils.isRegExp = isRegExp

  function isString(value) {
    return typeof value === 'string' || (value && typeof value === 'object' && toString(value) === '[object String]') || false
  }
  utils.isString = isString

  function isDate(value) {
    return (value && typeof value === 'object' && toString(value) === '[object Date]') || false
  }
  utils.isDate = isDate

  function isNumber(value) {
    var type = typeof value
    return type === 'number' || (value && type === 'object' && toString(value) === '[object Number]') || false
  }
  utils.isNumber = isNumber

  function isBoolean(value) {
    return toString(value) === '[object Boolean]'
  }
  utils.isBoolean = isBoolean

  function isFunction(value) {
    return typeof value === 'function' || (value && toString(value) === '[object Function]') || false
  }
  utils.isFunction = isFunction

  /**
   * Iterate over an object's own enumerable properties.
   */
  function forOwn(obj, fn, thisArg) {
    var keys = Object.keys(obj)
    var len = keys.length
    let i
    for (i = 0; i < len; i++) {
      fn.call(thisArg, obj[keys[i]], keys[i], obj)
    }
  }
  utils.forOwn = forOwn

  var SPLIT = /\s+/
  var NON_ALPHA = /[^A-Za-z]/g
  var PASCAL_CASE = /(\w)(\w*)/g
  function pascalize(g0, g1, g2) {
    return `${g1.toUpperCase()}${g2.toLowerCase()}`
  }
  function mapToPascal(x) {
    return x.replace(NON_ALPHA, '').replace(PASCAL_CASE, pascalize)
  }

  /**
   * Convert a string to pascalcase.
   */
  function pascalCase(str) {
    return str
      .split(SPLIT)
      .map(mapToPascal)
      .join('')
  }
  utils.pascalCase = pascalCase

  /**
   * Convert a string to camelcase.
   */
  function camelCase(str) {
    str = pascalCase(str)
    if (str) {
      return str.charAt(0).toLowerCase() + str.slice(1)
    }
    return str
  }
  utils.camelCase = camelCase

  return utils
})
