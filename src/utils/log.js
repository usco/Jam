// polygill for array.includes
if (![].includes) {
  Array.prototype.includes = function (searchElement /*, fromIndex*/) {
    'use strict'
    var O = Object(this)
    var len = parseInt(O.length) || 0
    if (len === 0) {
      return false
    }
    var n = parseInt(arguments[1]) || 0
    var k
    if (n >= 0) {
      k = n
    } else {
      k = len + n
      if (k < 0) {k = 0;}
    }
    var currentElement
    while (k < len) {
      currentElement = O[k]
      if (searchElement === currentElement ||
        (searchElement !== searchElement && currentElement !== currentElement)) {
        return true
      }
      k++
    }
    return false
  }
}

// ////////////
let logMaker = function (prefix = '' , strLevel = false , timeStamp = false) {
  let log = {}
  let loglevel = 'warn'
  log.setLevel = function (level) {
    loglevel = level
  }

  log.trace = function () {
    let context = prefix
    if (strLevel) context += 'TRACE:'
    if (timeStamp) {
      let tStamp = new Date().toTimeString().slice(0, 8)
      context += tStamp
    }
    if (! ['trace'].includes(loglevel)) return new Function()
    return Function.prototype.bind.call(console.trace, console, context)
  }()
  log.debug = function () {
    let context = prefix
    if (strLevel) context += 'DEBUG:'
    if (timeStamp) {
      let tStamp = new Date().toTimeString().slice(0, 8)
      context += tStamp
    }
    if (! ['trace', 'debug'].includes(loglevel)) return new Function()
    return Function.prototype.bind.call(console.debug, console, context)
  }()

  log.info = function () {
    let context = prefix
    if (strLevel) context += 'INFO:'
    if (timeStamp) {
      let tStamp = new Date().toTimeString().slice(0, 8)
      context += tStamp
    }
    if (! ['trace', 'debug', 'info'].includes(loglevel)) new Function()
    return Function.prototype.bind.call(console.info, console, context)
  }()

  log.warn = function () {
    let context = prefix
    if (strLevel) context += 'WARN:'
    if (timeStamp) {
      let tStamp = new Date().toTimeString().slice(0, 8)
      context += tStamp
    }
    if (! ['trace', 'debug', 'info', 'warn'].includes(loglevel)) new Function()
    return Function.prototype.bind.call(console.warn, console, context)
  }()
  log.error = function () {
    let context = prefix
    if (strLevel) context += 'ERROR:'
    if (timeStamp) {
      let tStamp = new Date().toTimeString().slice(0, 8)
      context += tStamp
    }
    if (! ['trace', 'debug', 'info', 'warn', 'error'].includes(loglevel)) new Function()
    return Function.prototype.bind.call(console.error, console, context)
  }()

  return log
}

// import log from 'loglevel'

/*function makeLog(prefix=""){
  var originalFactory = _log.methodFactory
  _log.methodFactory = function (methodName, logLevel) {
      var rawMethod = originalFactory(methodName, logLevel)
      let tStamp    = new Date().toTimeString().slice(0, 8)
      //tStamp = tStamp.getHours() +":"+tStamp.getMinutes()+":"+tStamp.getSeconds()+" "+tStamp.getMilliseconds()
      return function (message) {
          rawMethod(prefix+ tStamp +" "+ message)
      }
  }
  return _log
}*/

/*var originalFactory = log.methodFactory
log.methodFactory = function (methodName, logLevel) {
    var rawMethod = originalFactory(methodName, logLevel)

    return function (message) {
        rawMethod("Newsflash: " + message)
    }
}
log.setLevel("warn") // Be sure to call setLevel method in order to apply plugin */

/* log.setLevel("info")
  let foo = {sdf:"dsf",aa:45}
  log.error("too easy")
  log.error("..or is it","blal",foo)
  log.info("..or is it","blal",foo)

  let msg =" sdfqsdq"
  log.trace(msg)
  log.debug(msg)
  log.info(msg)
  log.warn(msg)
  log.error(msg)

  log.info("assetManager",AssetManager)

  log.info("This is a test...");*/

// for now return loglevel
import log from 'loglevel'
let logMaker2 = function (prefix = '') {
  return log
}
// import logger from './utils/log'
// let log = logger("Jam-Root")
// log.setLevel("warn")
export default logMaker2
