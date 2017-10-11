/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
const INITIALIZE_TABS = exports.INITIALIZE_TABS = 'INITIALIZE_TABS';
const SWITCH_TAB = exports.SWITCH_TAB = 'SWITCH_TAB';

const RECEIVE_TABS = exports.RECEIVE_TABS = 'RECEIVE_TABS';
const DELETE_TAB = exports.DELETE_TAB = 'DELETE_TAB';
const UPDATE_ACTIVE_TAB = exports.UPDATE_ACTIVE_TAB = 'UPDATE_ACTIVE_TAB';

const UPDATE_SETTING = exports.UPDATE_SETTING = 'UPDATE_SETTING';

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var CONNECTION_NAME = exports.CONNECTION_NAME = 'redux-webext';
var DISPATCH = exports.DISPATCH = '@@STORE_DISPATCH';
var UPDATE_STATE = exports.UPDATE_STATE = '@@STORE_UPDATE_STATE';

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;

var _createStore = __webpack_require__(4);

var _createStore2 = _interopRequireDefault(_createStore);

var _combineReducers = __webpack_require__(27);

var _combineReducers2 = _interopRequireDefault(_combineReducers);

var _bindActionCreators = __webpack_require__(28);

var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

var _applyMiddleware = __webpack_require__(29);

var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);

var _compose = __webpack_require__(9);

var _compose2 = _interopRequireDefault(_compose);

var _warning = __webpack_require__(8);

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  (0, _warning2.default)('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}

exports.createStore = _createStore2.default;
exports.combineReducers = _combineReducers2.default;
exports.bindActionCreators = _bindActionCreators2.default;
exports.applyMiddleware = _applyMiddleware2.default;
exports.compose = _compose2.default;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout() {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
})();
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch (e) {
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }
}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e) {
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }
}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
    return [];
};

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () {
    return '/';
};
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function () {
    return 0;
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ActionTypes = undefined;
exports.default = createStore;

var _isPlainObject = __webpack_require__(5);

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _symbolObservable = __webpack_require__(23);

var _symbolObservable2 = _interopRequireDefault(_symbolObservable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var ActionTypes = exports.ActionTypes = {
  INIT: '@@redux/INIT'

  /**
   * Creates a Redux store that holds the state tree.
   * The only way to change the data in the store is to call `dispatch()` on it.
   *
   * There should only be a single store in your app. To specify how different
   * parts of the state tree respond to actions, you may combine several reducers
   * into a single reducer function by using `combineReducers`.
   *
   * @param {Function} reducer A function that returns the next state tree, given
   * the current state tree and the action to handle.
   *
   * @param {any} [preloadedState] The initial state. You may optionally specify it
   * to hydrate the state from the server in universal apps, or to restore a
   * previously serialized user session.
   * If you use `combineReducers` to produce the root reducer function, this must be
   * an object with the same shape as `combineReducers` keys.
   *
   * @param {Function} [enhancer] The store enhancer. You may optionally specify it
   * to enhance the store with third-party capabilities such as middleware,
   * time travel, persistence, etc. The only store enhancer that ships with Redux
   * is `applyMiddleware()`.
   *
   * @returns {Store} A Redux store that lets you read the state, dispatch actions
   * and subscribe to changes.
   */
};function createStore(reducer, preloadedState, enhancer) {
  var _ref2;

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var currentReducer = reducer;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */
  function getState() {
    return currentState;
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    var isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!(0, _isPlainObject2.default)(action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      listener();
    }

    return action;
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.INIT });
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */
  function observable() {
    var _ref;

    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe: function subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.');
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return { unsubscribe: unsubscribe };
      }
    }, _ref[_symbolObservable2.default] = function () {
      return this;
    }, _ref;
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  dispatch({ type: ActionTypes.INIT });

  return _ref2 = {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  }, _ref2[_symbolObservable2.default] = observable, _ref2;
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseGetTag = __webpack_require__(15);

var _baseGetTag2 = _interopRequireDefault(_baseGetTag);

var _getPrototype = __webpack_require__(20);

var _getPrototype2 = _interopRequireDefault(_getPrototype);

var _isObjectLike = __webpack_require__(22);

var _isObjectLike2 = _interopRequireDefault(_isObjectLike);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!(0, _isObjectLike2.default)(value) || (0, _baseGetTag2.default)(value) != objectTag) {
    return false;
  }
  var proto = (0, _getPrototype2.default)(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}

exports.default = isPlainObject;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _root = __webpack_require__(16);

var _root2 = _interopRequireDefault(_root);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Built-in value references. */
var Symbol = _root2.default.Symbol;

exports.default = Symbol;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var g;

// This works in non-strict mode
g = function () {
	return this;
}();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = warning;
/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = compose;
/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

function compose() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(undefined, arguments));
    };
  });
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _store = __webpack_require__(36);

var _store2 = _interopRequireDefault(_store);

var _eventListeners = __webpack_require__(37);

var _eventListeners2 = _interopRequireDefault(_eventListeners);

var _actions = __webpack_require__(34);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { dispatch } = _store2.default;

dispatch((0, _actions.initializeTabs)());
(0, _eventListeners2.default)(dispatch);

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _backgroundStore = __webpack_require__(12);

Object.defineProperty(exports, 'createBackgroundStore', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_backgroundStore).default;
  }
});

var _uiStore = __webpack_require__(13);

Object.defineProperty(exports, 'createUIStore', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_uiStore).default;
  }
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

exports.default = createBackgroundStore;

var _constants = __webpack_require__(1);

function _objectWithoutProperties(obj, keys) {
    var target = {};for (var i in obj) {
        if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];
    }return target;
}

var store = void 0,
    actions = void 0,
    onDisconnect = void 0;

// eslint-disable-next-line consistent-return
function handleMessage(msg, sender, cb) {
    if (msg.type === _constants.DISPATCH) {
        var _msg$action = msg.action,
            type = _msg$action.type,
            actionData = _objectWithoutProperties(_msg$action, ['type']);

        var action = actions[type];

        if (action) {
            // if action doesn't have any data we should pass "undefined"
            store.dispatch(action(Object.keys(actionData).length ? actionData : undefined));
        } else {
            console.error('Provided in background store "actions" object doesn\'t contain "' + type + '" key.');
        }
    } else if (msg.type === _constants.UPDATE_STATE) {
        cb(store.getState());

        // keep channel open, https://developer.chrome.com/extensions/runtime#event-onMessage
        return true;
    }
}

// allow other parts of the app to reuse the store, e.g. popup
function handleConnection(connection) {
    if (connection.name !== _constants.CONNECTION_NAME) {
        return;
    }

    // send updated state to other parts of the app on every change
    var unsubscribe = store.subscribe(function () {
        connection.postMessage({
            type: _constants.UPDATE_STATE,
            data: store.getState()
        });
    });

    // unsubscribe on disconnect
    connection.onDisconnect.addListener(function () {
        unsubscribe();

        if (onDisconnect) {
            onDisconnect();
        }
    });
}

function createBackgroundStore(options) {
    if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object' || _typeof(options.store) !== 'object') {
        throw new Error('Expected the "store" to be an object.');
    }

    if (options.hasOwnProperty('actions') && _typeof(options.actions) !== 'object') {
        throw new Error('Expected the "actions" to be an object.');
    }

    if (options.hasOwnProperty('onDisconnect') && typeof options.onDisconnect !== 'function') {
        throw new Error('Expected the "onDisconnect" to be a function.');
    }

    store = options.store;
    actions = options.actions || {};
    onDisconnect = options.onDisconnect;

    chrome.runtime.onConnect.addListener(handleConnection);
    chrome.runtime.onMessage.addListener(handleMessage);

    return store;
}

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    // connect to "background" store
    var connection = chrome.runtime.connect({ name: _constants.CONNECTION_NAME });

    // listen for changes in the "background" store
    connection.onMessage.addListener(handleMessage);

    // return promise to allow getting current state of "background" store
    return new Promise(function (resolve) {
        chrome.runtime.sendMessage({ type: _constants.UPDATE_STATE }, function (res) {
            state = res;

            // return an object with equivalent to Redux store interface
            resolve({
                subscribe: subscribe,
                dispatch: dispatch,
                getState: getState
            });
        });
    });
};

var _constants = __webpack_require__(1);

var listeners = [];

var state = void 0;

function handleMessage(msg) {
    if (msg.type === _constants.UPDATE_STATE) {
        state = msg.data;

        listeners.forEach(function (l) {
            return l();
        });
    }
}

function subscribe(listener) {
    listeners.push(listener);

    // return unsubscribe function
    return function () {
        listeners = listeners.filter(function (l) {
            return l !== listener;
        });
    };
}

function dispatch(action) {
    // perform an action to change state of "background" store
    chrome.runtime.sendMessage({
        type: _constants.DISPATCH,
        action: action
    });
}

function getState() {
    return state;
}

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = __webpack_require__(2);

var _reduxThunk = __webpack_require__(30);

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _reduxLogger = __webpack_require__(35);

var _reduxLogger2 = _interopRequireDefault(_reduxLogger);

var _reducers = __webpack_require__(31);

var _reducers2 = _interopRequireDefault(_reducers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _redux.createStore)(_reducers2.default, (0, _redux.applyMiddleware)(_reduxThunk2.default, _reduxLogger2.default));

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Symbol = __webpack_require__(6);

var _Symbol2 = _interopRequireDefault(_Symbol);

var _getRawTag = __webpack_require__(18);

var _getRawTag2 = _interopRequireDefault(_getRawTag);

var _objectToString = __webpack_require__(19);

var _objectToString2 = _interopRequireDefault(_objectToString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = _Symbol2.default ? _Symbol2.default.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? (0, _getRawTag2.default)(value) : (0, _objectToString2.default)(value);
}

exports.default = baseGetTag;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _freeGlobal = __webpack_require__(17);

var _freeGlobal2 = _interopRequireDefault(_freeGlobal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = _freeGlobal2.default || freeSelf || Function('return this')();

exports.default = root;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

exports.default = freeGlobal;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Symbol = __webpack_require__(6);

var _Symbol2 = _interopRequireDefault(_Symbol);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = _Symbol2.default ? _Symbol2.default.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

exports.default = getRawTag;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

exports.default = objectToString;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _overArg = __webpack_require__(21);

var _overArg2 = _interopRequireDefault(_overArg);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Built-in value references. */
var getPrototype = (0, _overArg2.default)(Object.getPrototypeOf, Object);

exports.default = getPrototype;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}

exports.default = overArg;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

exports.default = isObjectLike;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(24);

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global, module) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ponyfill = __webpack_require__(26);

var _ponyfill2 = _interopRequireDefault(_ponyfill);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

var root; /* global window */

if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (true) {
  root = module;
} else {
  root = Function('return this')();
}

var result = (0, _ponyfill2['default'])(root);
exports['default'] = result;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7), __webpack_require__(25)(module)))

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function () {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function () {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function () {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports['default'] = symbolObservablePonyfill;
function symbolObservablePonyfill(root) {
	var result;
	var _Symbol = root.Symbol;

	if (typeof _Symbol === 'function') {
		if (_Symbol.observable) {
			result = _Symbol.observable;
		} else {
			result = _Symbol('observable');
			_Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
};

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = combineReducers;

var _createStore = __webpack_require__(4);

var _isPlainObject = __webpack_require__(5);

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _warning = __webpack_require__(8);

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state. ' + 'If you want this reducer to hold no value, you can return null instead of undefined.';
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }

  if (!(0, _isPlainObject2.default)(inputState)) {
    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
  }

  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
  });

  unexpectedKeys.forEach(function (key) {
    unexpectedKeyCache[key] = true;
  });

  if (unexpectedKeys.length > 0) {
    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
  }
}

function assertReducerShape(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });

    if (typeof initialState === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined. If you don\'t want to set a value for this reducer, ' + 'you can use null instead of undefined.');
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
    if (typeof reducer(undefined, { type: type }) === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined, but can be null.');
    }
  });
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */
function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];

    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        (0, _warning2.default)('No reducer provided for key "' + key + '"');
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers);

  var unexpectedKeyCache = void 0;
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {};
  }

  var shapeAssertionError = void 0;
  try {
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }

  return function combination() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    if (shapeAssertionError) {
      throw shapeAssertionError;
    }

    if (process.env.NODE_ENV !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
      if (warningMessage) {
        (0, _warning2.default)(warningMessage);
      }
    }

    var hasChanged = false;
    var nextState = {};
    for (var _i = 0; _i < finalReducerKeys.length; _i++) {
      var _key = finalReducerKeys[_i];
      var reducer = finalReducers[_key];
      var previousStateForKey = state[_key];
      var nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(_key, action);
        throw new Error(errorMessage);
      }
      nextState[_key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = bindActionCreators;
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(undefined, arguments));
  };
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass a single function as the first argument,
 * and get a function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
  }

  var keys = Object.keys(actionCreators);
  var boundActionCreators = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = applyMiddleware;

var _compose = __webpack_require__(9);

var _compose2 = _interopRequireDefault(_compose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
function applyMiddleware() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function (reducer, preloadedState, enhancer) {
      var store = createStore(reducer, preloadedState, enhancer);
      var _dispatch = store.dispatch;
      var chain = [];

      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch(action) {
          return _dispatch(action);
        }
      };
      chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = _compose2.default.apply(undefined, chain)(store.dispatch);

      return _extends({}, store, {
        dispatch: _dispatch
      });
    };
  };
}

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
function createThunkMiddleware(extraArgument) {
  return function (_ref) {
    var dispatch = _ref.dispatch,
        getState = _ref.getState;
    return function (next) {
      return function (action) {
        if (typeof action === 'function') {
          return action(dispatch, getState, extraArgument);
        }

        return next(action);
      };
    };
  };
}

var thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

exports['default'] = thunk;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = __webpack_require__(2);

var _tabs = __webpack_require__(32);

var _tabs2 = _interopRequireDefault(_tabs);

var _settings = __webpack_require__(33);

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _redux.combineReducers)({
  tabs: _tabs2.default,
  settings: _settings2.default
});

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = tabs;

var _types = __webpack_require__(0);

const initialState = {
  loadedTabs: []
};

function tabs(state = initialState, action) {
  const { payload } = action;
  switch (action.type) {
    case _types.RECEIVE_TABS:
      return Object.assign({}, state, { loadedTabs: payload });
    // case UPDATE_ACTIVE_TAB:
    //   return Object.assign({}, state, { activeTab: payload });
    default:
      return state;
  }
}

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = settings;

var _types = __webpack_require__(0);

const initialState = {
  showTabCount: false,
  searchAllWindows: false,
  fuzzySearch: true
};

function settings(state = initialState, action) {
  if (action.type !== _types.UPDATE_SETTING) {
    return state;
  }
  const { key, value } = action.payload;
  return Object.assign({}, state, { [key]: value });
}

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeTabs = initializeTabs;
exports.deleteTab = deleteTab;
exports.updateSetting = updateSetting;
exports.receiveTabs = receiveTabs;
exports.updateActiveTab = updateActiveTab;
exports.switchTabs = switchTabs;

var _types = __webpack_require__(0);

var types = _interopRequireWildcard(_types);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/* Thunks */
// Loads the active tabs onto the redux store
function initializeTabs() {
  return dispatch => {
    // Query for all window-tabs, it's up to each individual window's popup
    // script to filter the results
    browser.tabs.query({}).then(tabs => dispatch(receiveTabs(tabs))).catch(() => {
      throw new Error('Ran into a problem loading browser\'s tabs.');
    });
  };
}

function deleteTab(tabId) {
  return dispatch => {
    browser.tabs.remove(tabId).catch(() => {
      throw new Error('Ran into a problem deleting tabs.');
    });
  };
}

/* Pure actions */
// Reducer for updating the user's settings
function updateSetting(key, value) {
  return {
    type: types.UPDATE_SETTING,
    payload: {
      key,
      value
    }
  };
}

function receiveTabs(tabs) {
  return {
    type: types.RECEIVE_TABS,
    payload: tabs
  };
}

// Accepts a Tab object and passes the id
function updateActiveTab(tab) {
  return {
    type: types.UPDATE_ACTIVE_TAB,
    payload: tab.id
  };
}

function switchTabs(tabId) {
  browser.tabs.update(tabId, { active: true });
}

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

!function (e, t) {
   true ? t(exports) : "function" == typeof define && define.amd ? define(["exports"], t) : t(e.reduxLogger = e.reduxLogger || {});
}(undefined, function (e) {
  "use strict";
  function t(e, t) {
    e.super_ = t, e.prototype = Object.create(t.prototype, { constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 } });
  }function r(e, t) {
    Object.defineProperty(this, "kind", { value: e, enumerable: !0 }), t && t.length && Object.defineProperty(this, "path", { value: t, enumerable: !0 });
  }function n(e, t, r) {
    n.super_.call(this, "E", e), Object.defineProperty(this, "lhs", { value: t, enumerable: !0 }), Object.defineProperty(this, "rhs", { value: r, enumerable: !0 });
  }function o(e, t) {
    o.super_.call(this, "N", e), Object.defineProperty(this, "rhs", { value: t, enumerable: !0 });
  }function i(e, t) {
    i.super_.call(this, "D", e), Object.defineProperty(this, "lhs", { value: t, enumerable: !0 });
  }function a(e, t, r) {
    a.super_.call(this, "A", e), Object.defineProperty(this, "index", { value: t, enumerable: !0 }), Object.defineProperty(this, "item", { value: r, enumerable: !0 });
  }function f(e, t, r) {
    var n = e.slice((r || t) + 1 || e.length);return e.length = t < 0 ? e.length + t : t, e.push.apply(e, n), e;
  }function u(e) {
    var t = "undefined" == typeof e ? "undefined" : N(e);return "object" !== t ? t : e === Math ? "math" : null === e ? "null" : Array.isArray(e) ? "array" : "[object Date]" === Object.prototype.toString.call(e) ? "date" : "function" == typeof e.toString && /^\/.*\//.test(e.toString()) ? "regexp" : "object";
  }function l(e, t, r, c, s, d, p) {
    s = s || [], p = p || [];var g = s.slice(0);if ("undefined" != typeof d) {
      if (c) {
        if ("function" == typeof c && c(g, d)) return;if ("object" === ("undefined" == typeof c ? "undefined" : N(c))) {
          if (c.prefilter && c.prefilter(g, d)) return;if (c.normalize) {
            var h = c.normalize(g, d, e, t);h && (e = h[0], t = h[1]);
          }
        }
      }g.push(d);
    }"regexp" === u(e) && "regexp" === u(t) && (e = e.toString(), t = t.toString());var y = "undefined" == typeof e ? "undefined" : N(e),
        v = "undefined" == typeof t ? "undefined" : N(t),
        b = "undefined" !== y || p && p[p.length - 1].lhs && p[p.length - 1].lhs.hasOwnProperty(d),
        m = "undefined" !== v || p && p[p.length - 1].rhs && p[p.length - 1].rhs.hasOwnProperty(d);if (!b && m) r(new o(g, t));else if (!m && b) r(new i(g, e));else if (u(e) !== u(t)) r(new n(g, e, t));else if ("date" === u(e) && e - t !== 0) r(new n(g, e, t));else if ("object" === y && null !== e && null !== t) {
      if (p.filter(function (t) {
        return t.lhs === e;
      }).length) e !== t && r(new n(g, e, t));else {
        if (p.push({ lhs: e, rhs: t }), Array.isArray(e)) {
          var w;e.length;for (w = 0; w < e.length; w++) w >= t.length ? r(new a(g, w, new i(void 0, e[w]))) : l(e[w], t[w], r, c, g, w, p);for (; w < t.length;) r(new a(g, w, new o(void 0, t[w++])));
        } else {
          var x = Object.keys(e),
              S = Object.keys(t);x.forEach(function (n, o) {
            var i = S.indexOf(n);i >= 0 ? (l(e[n], t[n], r, c, g, n, p), S = f(S, i)) : l(e[n], void 0, r, c, g, n, p);
          }), S.forEach(function (e) {
            l(void 0, t[e], r, c, g, e, p);
          });
        }p.length = p.length - 1;
      }
    } else e !== t && ("number" === y && isNaN(e) && isNaN(t) || r(new n(g, e, t)));
  }function c(e, t, r, n) {
    return n = n || [], l(e, t, function (e) {
      e && n.push(e);
    }, r), n.length ? n : void 0;
  }function s(e, t, r) {
    if (r.path && r.path.length) {
      var n,
          o = e[t],
          i = r.path.length - 1;for (n = 0; n < i; n++) o = o[r.path[n]];switch (r.kind) {case "A":
          s(o[r.path[n]], r.index, r.item);break;case "D":
          delete o[r.path[n]];break;case "E":case "N":
          o[r.path[n]] = r.rhs;}
    } else switch (r.kind) {case "A":
        s(e[t], r.index, r.item);break;case "D":
        e = f(e, t);break;case "E":case "N":
        e[t] = r.rhs;}return e;
  }function d(e, t, r) {
    if (e && t && r && r.kind) {
      for (var n = e, o = -1, i = r.path ? r.path.length - 1 : 0; ++o < i;) "undefined" == typeof n[r.path[o]] && (n[r.path[o]] = "number" == typeof r.path[o] ? [] : {}), n = n[r.path[o]];switch (r.kind) {case "A":
          s(r.path ? n[r.path[o]] : n, r.index, r.item);break;case "D":
          delete n[r.path[o]];break;case "E":case "N":
          n[r.path[o]] = r.rhs;}
    }
  }function p(e, t, r) {
    if (r.path && r.path.length) {
      var n,
          o = e[t],
          i = r.path.length - 1;for (n = 0; n < i; n++) o = o[r.path[n]];switch (r.kind) {case "A":
          p(o[r.path[n]], r.index, r.item);break;case "D":
          o[r.path[n]] = r.lhs;break;case "E":
          o[r.path[n]] = r.lhs;break;case "N":
          delete o[r.path[n]];}
    } else switch (r.kind) {case "A":
        p(e[t], r.index, r.item);break;case "D":
        e[t] = r.lhs;break;case "E":
        e[t] = r.lhs;break;case "N":
        e = f(e, t);}return e;
  }function g(e, t, r) {
    if (e && t && r && r.kind) {
      var n,
          o,
          i = e;for (o = r.path.length - 1, n = 0; n < o; n++) "undefined" == typeof i[r.path[n]] && (i[r.path[n]] = {}), i = i[r.path[n]];switch (r.kind) {case "A":
          p(i[r.path[n]], r.index, r.item);break;case "D":
          i[r.path[n]] = r.lhs;break;case "E":
          i[r.path[n]] = r.lhs;break;case "N":
          delete i[r.path[n]];}
    }
  }function h(e, t, r) {
    if (e && t) {
      var n = function (n) {
        r && !r(e, t, n) || d(e, t, n);
      };l(e, t, n);
    }
  }function y(e) {
    return "color: " + F[e].color + "; font-weight: bold";
  }function v(e) {
    var t = e.kind,
        r = e.path,
        n = e.lhs,
        o = e.rhs,
        i = e.index,
        a = e.item;switch (t) {case "E":
        return [r.join("."), n, "→", o];case "N":
        return [r.join("."), o];case "D":
        return [r.join(".")];case "A":
        return [r.join(".") + "[" + i + "]", a];default:
        return [];}
  }function b(e, t, r, n) {
    var o = c(e, t);try {
      n ? r.groupCollapsed("diff") : r.group("diff");
    } catch (e) {
      r.log("diff");
    }o ? o.forEach(function (e) {
      var t = e.kind,
          n = v(e);r.log.apply(r, ["%c " + F[t].text, y(t)].concat(P(n)));
    }) : r.log("—— no diff ——");try {
      r.groupEnd();
    } catch (e) {
      r.log("—— diff end —— ");
    }
  }function m(e, t, r, n) {
    switch ("undefined" == typeof e ? "undefined" : N(e)) {case "object":
        return "function" == typeof e[n] ? e[n].apply(e, P(r)) : e[n];case "function":
        return e(t);default:
        return e;}
  }function w(e) {
    var t = e.timestamp,
        r = e.duration;return function (e, n, o) {
      var i = ["action"];return i.push("%c" + String(e.type)), t && i.push("%c@ " + n), r && i.push("%c(in " + o.toFixed(2) + " ms)"), i.join(" ");
    };
  }function x(e, t) {
    var r = t.logger,
        n = t.actionTransformer,
        o = t.titleFormatter,
        i = void 0 === o ? w(t) : o,
        a = t.collapsed,
        f = t.colors,
        u = t.level,
        l = t.diff,
        c = "undefined" == typeof t.titleFormatter;e.forEach(function (o, s) {
      var d = o.started,
          p = o.startedTime,
          g = o.action,
          h = o.prevState,
          y = o.error,
          v = o.took,
          w = o.nextState,
          x = e[s + 1];x && (w = x.prevState, v = x.started - d);var S = n(g),
          k = "function" == typeof a ? a(function () {
        return w;
      }, g, o) : a,
          j = D(p),
          E = f.title ? "color: " + f.title(S) + ";" : "",
          A = ["color: gray; font-weight: lighter;"];A.push(E), t.timestamp && A.push("color: gray; font-weight: lighter;"), t.duration && A.push("color: gray; font-weight: lighter;");var O = i(S, j, v);try {
        k ? f.title && c ? r.groupCollapsed.apply(r, ["%c " + O].concat(A)) : r.groupCollapsed(O) : f.title && c ? r.group.apply(r, ["%c " + O].concat(A)) : r.group(O);
      } catch (e) {
        r.log(O);
      }var N = m(u, S, [h], "prevState"),
          P = m(u, S, [S], "action"),
          C = m(u, S, [y, h], "error"),
          F = m(u, S, [w], "nextState");if (N) if (f.prevState) {
        var L = "color: " + f.prevState(h) + "; font-weight: bold";r[N]("%c prev state", L, h);
      } else r[N]("prev state", h);if (P) if (f.action) {
        var T = "color: " + f.action(S) + "; font-weight: bold";r[P]("%c action    ", T, S);
      } else r[P]("action    ", S);if (y && C) if (f.error) {
        var M = "color: " + f.error(y, h) + "; font-weight: bold;";r[C]("%c error     ", M, y);
      } else r[C]("error     ", y);if (F) if (f.nextState) {
        var _ = "color: " + f.nextState(w) + "; font-weight: bold";r[F]("%c next state", _, w);
      } else r[F]("next state", w);l && b(h, w, r, k);try {
        r.groupEnd();
      } catch (e) {
        r.log("—— log end ——");
      }
    });
  }function S() {
    var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
        t = Object.assign({}, L, e),
        r = t.logger,
        n = t.stateTransformer,
        o = t.errorTransformer,
        i = t.predicate,
        a = t.logErrors,
        f = t.diffPredicate;if ("undefined" == typeof r) return function () {
      return function (e) {
        return function (t) {
          return e(t);
        };
      };
    };if (e.getState && e.dispatch) return console.error("[redux-logger] redux-logger not installed. Make sure to pass logger instance as middleware:\n// Logger with default options\nimport { logger } from 'redux-logger'\nconst store = createStore(\n  reducer,\n  applyMiddleware(logger)\n)\n// Or you can create your own logger with custom options http://bit.ly/redux-logger-options\nimport createLogger from 'redux-logger'\nconst logger = createLogger({\n  // ...options\n});\nconst store = createStore(\n  reducer,\n  applyMiddleware(logger)\n)\n"), function () {
      return function (e) {
        return function (t) {
          return e(t);
        };
      };
    };var u = [];return function (e) {
      var r = e.getState;return function (e) {
        return function (l) {
          if ("function" == typeof i && !i(r, l)) return e(l);var c = {};u.push(c), c.started = O.now(), c.startedTime = new Date(), c.prevState = n(r()), c.action = l;var s = void 0;if (a) try {
            s = e(l);
          } catch (e) {
            c.error = o(e);
          } else s = e(l);c.took = O.now() - c.started, c.nextState = n(r());var d = t.diff && "function" == typeof f ? f(r, l) : t.diff;if (x(u, Object.assign({}, t, { diff: d })), u.length = 0, c.error) throw c.error;return s;
        };
      };
    };
  }var k,
      j,
      E = function (e, t) {
    return new Array(t + 1).join(e);
  },
      A = function (e, t) {
    return E("0", t - e.toString().length) + e;
  },
      D = function (e) {
    return A(e.getHours(), 2) + ":" + A(e.getMinutes(), 2) + ":" + A(e.getSeconds(), 2) + "." + A(e.getMilliseconds(), 3);
  },
      O = "undefined" != typeof performance && null !== performance && "function" == typeof performance.now ? performance : Date,
      N = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
    return typeof e;
  } : function (e) {
    return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  },
      P = function (e) {
    if (Array.isArray(e)) {
      for (var t = 0, r = Array(e.length); t < e.length; t++) r[t] = e[t];return r;
    }return Array.from(e);
  },
      C = [];k = "object" === ("undefined" == typeof global ? "undefined" : N(global)) && global ? global : "undefined" != typeof window ? window : {}, j = k.DeepDiff, j && C.push(function () {
    "undefined" != typeof j && k.DeepDiff === c && (k.DeepDiff = j, j = void 0);
  }), t(n, r), t(o, r), t(i, r), t(a, r), Object.defineProperties(c, { diff: { value: c, enumerable: !0 }, observableDiff: { value: l, enumerable: !0 }, applyDiff: { value: h, enumerable: !0 }, applyChange: { value: d, enumerable: !0 }, revertChange: { value: g, enumerable: !0 }, isConflict: { value: function () {
        return "undefined" != typeof j;
      }, enumerable: !0 }, noConflict: { value: function () {
        return C && (C.forEach(function (e) {
          e();
        }), C = null), c;
      }, enumerable: !0 } });var F = { E: { color: "#2196F3", text: "CHANGED:" }, N: { color: "#4CAF50", text: "ADDED:" }, D: { color: "#F44336", text: "DELETED:" }, A: { color: "#2196F3", text: "ARRAY:" } },
      L = { level: "log", logger: console, logErrors: !0, collapsed: void 0, predicate: void 0, duration: !1, timestamp: !0, stateTransformer: function (e) {
      return e;
    }, actionTransformer: function (e) {
      return e;
    }, errorTransformer: function (e) {
      return e;
    }, colors: { title: function () {
        return "inherit";
      }, prevState: function () {
        return "#9E9E9E";
      }, action: function () {
        return "#03A9F4";
      }, nextState: function () {
        return "#4CAF50";
      }, error: function () {
        return "#F20404";
      } }, diff: !1, diffPredicate: void 0, transformer: void 0 },
      T = function () {
    var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
        t = e.dispatch,
        r = e.getState;return "function" == typeof t || "function" == typeof r ? S()({ dispatch: t, getState: r }) : void console.error("\n[redux-logger v3] BREAKING CHANGE\n[redux-logger v3] Since 3.0.0 redux-logger exports by default logger with default settings.\n[redux-logger v3] Change\n[redux-logger v3] import createLogger from 'redux-logger'\n[redux-logger v3] to\n[redux-logger v3] import { createLogger } from 'redux-logger'\n");
  };e.defaults = L, e.createLogger = S, e.logger = T, e.default = T, Object.defineProperty(e, "__esModule", { value: !0 });
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reduxWebext = __webpack_require__(11);

var _store = __webpack_require__(14);

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _reduxWebext.createBackgroundStore)({ store: _store2.default });

// Instead of initializing tabs on browser action, set event listeners here to
// dispatch

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = addBackgroundListeners;

var _actions = __webpack_require__(34);

function addBackgroundListeners(dispatch) {
  const updateTabs = () => {
    dispatch((0, _actions.initializeTabs)());
  };
  const events = [browser.tabs.onCreated, browser.tabs.onRemoved, browser.tabs.onReplaced, browser.tabs.onUpdated];
  // Repopulate the tabs object every time a tab is modified.
  events.forEach(event => {
    event.addListener(updateTabs);
  });
}

/***/ })
/******/ ]);