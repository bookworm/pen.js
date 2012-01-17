

(function(/*! Stitch !*/) {
  if (!this.require) {
    var modules = {}, cache = {}, require = function(name, root) {
      var path = expand(root, name), indexPath = expand(path, './index'), module, fn;
      module   = cache[path] || cache[indexPath]      
      if (module) {
        return module;
      } else if (fn = modules[path] || modules[path = indexPath]) {
        module = {id: path, exports: {}};
        cache[path] = module.exports;
        fn(module.exports, function(name) {
          return require(name, dirname(path));
        }, module);
        return cache[path] = module.exports;
      } else {
        throw 'module ' + name + ' not found';
      }
    }, expand = function(root, name) {
      var results = [], parts, part;
      if (/^\.\.?(\/|$)/.test(name)) {
        parts = [root, name].join('/').split('/');
      } else {
        parts = name.split('/');
      }
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part == '..') {
          results.pop();
        } else if (part != '.' && part != '') {
          results.push(part);
        }
      }
      return results.join('/');
    }, dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };
    this.require = function(name) {
      return require(name, '');
    }
    this.require.define = function(bundle) {
      for (var key in bundle)
        modules[key] = bundle[key];
    };
    this.require.modules = modules;
    this.require.cache   = cache;
  }
  return this.require.define;
}).call(this)({
  "es5-shimify/index": function(exports, require, module) {// vim:set ts=4 sts=4 sw=4 st:
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- tlrobinson Tom Robinson Copyright (C) 2009-2010 MIT License (Narwhal Project)
// -- dantman Daniel Friesen Copyright(C) 2010 XXX No License Specified
// -- fschaefer Florian Schäfer Copyright (C) 2010 MIT License
// -- Irakli Gozalishvili Copyright (C) 2010 MIT License

/*!
    Copyright (c) 2009, 280 North Inc. http://280north.com/
    MIT License. http://github.com/280north/narwhal/blob/master/README.md
*/

(function (definition) {
    // RequireJS
    if (typeof define === "function") {
        define(function () {
            definition();
        });
    // CommonJS and <script>
    } else {
        definition();
    }

})(function (undefined) {

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * ES5 Draft
 * http://www.ecma-international.org/publications/files/drafts/tc39-2009-050.pdf
 *
 * NOTE: this is a draft, and as such, the URL is subject to change.  If the
 * link is broken, check in the parent directory for the latest TC39 PDF.
 * http://www.ecma-international.org/publications/files/drafts/
 *
 * Previous ES5 Draft
 * http://www.ecma-international.org/publications/files/drafts/tc39-2009-025.pdf
 * This is a broken link to the previous draft of ES5 on which most of the
 * numbered specification references and quotes herein were taken.  Updating
 * these references and quotes to reflect the new document would be a welcome
 * volunteer project.
 *
 * @module
 */

/*whatsupdoc*/

//
// Function
// ========
//

// ES-5 15.3.4.5
// http://www.ecma-international.org/publications/files/drafts/tc39-2009-025.pdf

if (!Function.prototype.bind) {
    var slice = Array.prototype.slice;
    Function.prototype.bind = function bind(that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        // XXX this gets pretty close, for all intents and purposes, letting
        // some duck-types slide
        if (typeof target.apply !== "function" || typeof target.call !== "function")
            return new TypeError();
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        var args = slice.call(arguments);
        // 4. Let F be a new native ECMAScript object.
        // 9. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 10. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 11. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 12. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        // 13. The [[Scope]] internal property of F is unused and need not
        //   exist.
        function bound() {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.

                var self = Object.create(target.prototype);
                target.apply(self, args.concat(slice.call(arguments)));
                return self;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the list
                //   boundArgs in the same order followed by the same values as
                //   the list ExtraArgs in the same order. 5.  Return the
                //   result of calling the [[Call]] internal method of target
                //   providing boundThis as the this value and providing args
                //   as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.call.apply(
                    target,
                    args.concat(slice.call(arguments))
                );

            }

        }
        bound.length = (
            // 14. If the [[Class]] internal property of Target is "Function", then
            typeof target === "function" ?
            // a. Let L be the length property of Target minus the length of A.
            // b. Set the length own property of F to either 0 or L, whichever is larger.
            Math.max(target.length - args.length, 0) :
            // 15. Else set the length own property of F to 0.
            0
        );
        // 16. The length own property of F is given attributes as specified in
        //   15.3.5.1.
        // TODO
        // 17. Set the [[Extensible]] internal property of F to true.
        // TODO
        // 18. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Value]]: null,
        //   [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]:
        //   false}, and false.
        // TODO
        // 19. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Value]]: null,
        //   [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]:
        //   false}, and false.
        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property.
        // XXX can't delete it in pure-js.
        return bound;
    };
}

// Shortcut to an often accessed properties, in order to avoid multiple
// dereference that costs universally.
// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
// us it in defining shortcuts.
var call = Function.prototype.call;
var prototypeOfArray = Array.prototype;
var prototypeOfObject = Object.prototype;
var owns = call.bind(prototypeOfObject.hasOwnProperty);

var defineGetter, defineSetter, lookupGetter, lookupSetter, supportsAccessors;
// If JS engine supports accessors creating shortcuts.
if ((supportsAccessors = owns(prototypeOfObject, '__defineGetter__'))) {
    defineGetter = call.bind(prototypeOfObject.__defineGetter__);
    defineSetter = call.bind(prototypeOfObject.__defineSetter__);
    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
}


//
// Array
// =====
//

// ES5 15.4.3.2
if (!Array.isArray) {
    Array.isArray = function isArray(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
    };
}

// ES5 15.4.4.18
if (!Array.prototype.forEach) {
    Array.prototype.forEach =  function forEach(block, thisObject) {
        var len = +this.length;
        for (var i = 0; i < len; i++) {
            if (i in this) {
                block.call(thisObject, this[i], i, this);
            }
        }
    };
}

// ES5 15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
if (!Array.prototype.map) {
    Array.prototype.map = function map(fun /*, thisp*/) {
        var len = +this.length;
        if (typeof fun !== "function")
          throw new TypeError();

        var res = new Array(len);
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this)
                res[i] = fun.call(thisp, this[i], i, this);
        }

        return res;
    };
}

// ES5 15.4.4.20
if (!Array.prototype.filter) {
    Array.prototype.filter = function filter(block /*, thisp */) {
        var values = [];
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++)
            if (block.call(thisp, this[i]))
                values.push(this[i]);
        return values;
    };
}

// ES5 15.4.4.16
if (!Array.prototype.every) {
    Array.prototype.every = function every(block /*, thisp */) {
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++)
            if (!block.call(thisp, this[i]))
                return false;
        return true;
    };
}

// ES5 15.4.4.17
if (!Array.prototype.some) {
    Array.prototype.some = function some(block /*, thisp */) {
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++)
            if (block.call(thisp, this[i]))
                return true;
        return false;
    };
}

// ES5 15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function reduce(fun /*, initial*/) {
        var len = +this.length;
        // Whether to include (... || fun instanceof RegExp)
        // in the following expression to trap cases where
        // the provided function was actually a regular
        // expression literal, which in V8 and
        // JavaScriptCore is a typeof "function".  Only in
        // V8 are regular expression literals permitted as
        // reduce parameters, so it is desirable in the
        // general case for the shim to match the more
        // strict and common behavior of rejecting regular
        // expressions.  However, the only case where the
        // shim is applied is IE's Trident (and perhaps very
        // old revisions of other engines).  In Trident,
        // regular expressions are a typeof "object", so the
        // following guard alone is sufficient.
        if (typeof fun !== "function")
            throw new TypeError();

        // no value to return if no initial value and an empty array
        if (len === 0 && arguments.length === 1)
            throw new TypeError();

        var i = 0;
        if (arguments.length >= 2) {
            var rv = arguments[1];
        } else {
            do {
                if (i in this) {
                    rv = this[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= len)
                    throw new TypeError();
            } while (true);
        }

        for (; i < len; i++) {
            if (i in this)
                rv = fun.call(null, rv, this[i], i, this);
        }

        return rv;
    };
}


// ES5 15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function reduceRight(fun /*, initial*/) {
        var len = +this.length;
        if (typeof fun !== "function")
            throw new TypeError();

        // no value to return if no initial value, empty array
        if (len === 0 && arguments.length === 1)
            throw new TypeError();

        var rv, i = len - 1;
        if (arguments.length >= 2) {
            rv = arguments[1];
        } else {
            do {
                if (i in this) {
                    rv = this[i--];
                    break;
                }

                // if array contains no values, no initial value to return
                if (--i < 0)
                    throw new TypeError();
            } while (true);
        }

        for (; i >= 0; i--) {
            if (i in this)
                rv = fun.call(null, rv, this[i], i, this);
        }

        return rv;
    };
}

// ES5 15.4.4.14
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function indexOf(value /*, fromIndex */ ) {
        var length = this.length;
        if (!length)
            return -1;
        var i = arguments[1] || 0;
        if (i >= length)
            return -1;
        if (i < 0)
            i += length;
        for (; i < length; i++) {
            if (!(i in this))
                continue;
            if (value === this[i])
                return i;
        }
        return -1;
    };
}

// ES5 15.4.4.15
if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function lastIndexOf(value /*, fromIndex */) {
        var length = this.length;
        if (!length)
            return -1;
        var i = arguments[1] || length;
        if (i < 0)
            i += length;
        i = Math.min(i, length - 1);
        for (; i >= 0; i--) {
            if (!(i in this))
                continue;
            if (value === this[i])
                return i;
        }
        return -1;
    };
}

//
// Object
// ======
//

// ES5 15.2.3.2
if (!Object.getPrototypeOf) {
    // https://github.com/kriskowal/es5-shim/issues#issue/2
    // http://ejohn.org/blog/objectgetprototypeof/
    // recommended by fschaefer on github
    Object.getPrototypeOf = function getPrototypeOf(object) {
        return object.__proto__ || object.constructor.prototype;
        // or undefined if not available in this engine
    };
}

// ES5 15.2.3.3
if (!Object.getOwnPropertyDescriptor) {
    var ERR_NON_OBJECT = "Object.getOwnPropertyDescriptor called on a " +
                         "non-object: ";
    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
        if ((typeof object !== "object" && typeof object !== "function") || object === null)
            throw new TypeError(ERR_NON_OBJECT + object);
        // If object does not owns property return undefined immediately.
        if (!owns(object, property))
            return undefined;

        var descriptor, getter, setter;

        // If object has a property then it's for sure both `enumerable` and
        // `configurable`.
        descriptor =  { enumerable: true, configurable: true };

        // If JS engine supports accessor properties then property may be a
        // getter or setter.
        if (supportsAccessors) {
            // Unfortunately `__lookupGetter__` will return a getter even
            // if object has own non getter property along with a same named
            // inherited getter. To avoid misbehavior we temporary remove
            // `__proto__` so that `__lookupGetter__` will return getter only
            // if it's owned by an object.
            var prototype = object.__proto__;
            object.__proto__ = prototypeOfObject;

            var getter = lookupGetter(object, property);
            var setter = lookupSetter(object, property);

            // Once we have getter and setter we can put values back.
            object.__proto__ = prototype;

            if (getter || setter) {
                if (getter) descriptor.get = getter;
                if (setter) descriptor.set = setter;

                // If it was accessor property we're done and return here
                // in order to avoid adding `value` to the descriptor.
                return descriptor;
            }
        }

        // If we got this far we know that object has an own property that is
        // not an accessor so we set it as a value and return descriptor.
        descriptor.value = object[property];
        return descriptor;
    };
}

// ES5 15.2.3.4
if (!Object.getOwnPropertyNames) {
    Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
        return Object.keys(object);
    };
}

// ES5 15.2.3.5
if (!Object.create) {
    Object.create = function create(prototype, properties) {
        var object;
        if (prototype === null) {
            object = { "__proto__": null };
        } else {
            if (typeof prototype !== "object")
                throw new TypeError("typeof prototype["+(typeof prototype)+"] != 'object'");
            var Type = function () {};
            Type.prototype = prototype;
            object = new Type();
            // IE has no built-in implementation of `Object.getPrototypeOf`
            // neither `__proto__`, but this manually setting `__proto__` will
            // guarantee that `Object.getPrototypeOf` will work as expected with
            // objects created using `Object.create`
            object.__proto__ = prototype;
        }
        if (typeof properties !== "undefined")
            Object.defineProperties(object, properties);
        return object;
    };
}

// ES5 15.2.3.6
if (!Object.defineProperty) {
    var ERR_NON_OBJECT_DESCRIPTOR = "Property description must be an object: ";
    var ERR_NON_OBJECT_TARGET = "Object.defineProperty called on non-object: "
    var ERR_ACCESSORS_NOT_SUPPORTED = "getters & setters can not be defined " +
                                      "on this javascript engine";

    Object.defineProperty = function defineProperty(object, property, descriptor) {
        if (typeof object !== "object" && typeof object !== "function")
            throw new TypeError(ERR_NON_OBJECT_TARGET + object);
        if (typeof descriptor !== "object" || descriptor === null)
            throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);

        // If it's a data property.
        if (owns(descriptor, "value")) {
            // fail silently if "writable", "enumerable", or "configurable"
            // are requested but not supported
            /*
            // alternate approach:
            if ( // can't implement these features; allow false but not true
                !(owns(descriptor, "writable") ? descriptor.writable : true) ||
                !(owns(descriptor, "enumerable") ? descriptor.enumerable : true) ||
                !(owns(descriptor, "configurable") ? descriptor.configurable : true)
            )
                throw new RangeError(
                    "This implementation of Object.defineProperty does not " +
                    "support configurable, enumerable, or writable."
                );
            */

            if (supportsAccessors && (lookupGetter(object, property) ||
                                      lookupSetter(object, property)))
            {
                // As accessors are supported only on engines implementing
                // `__proto__` we can safely override `__proto__` while defining
                // a property to make sure that we don't hit an inherited
                // accessor.
                var prototype = object.__proto__;
                object.__proto__ = prototypeOfObject;
                // Deleting a property anyway since getter / setter may be
                // defined on object itself.
                delete object[property];
                object[property] = descriptor.value;
                // Setting original `__proto__` back now.
                object.__proto__ = prototype;
            } else {
                object[property] = descriptor.value;
            }
        } else {
            if (!supportsAccessors)
                throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
            // If we got that far then getters and setters can be defined !!
            if (owns(descriptor, "get"))
                defineGetter(object, property, descriptor.get);
            if (owns(descriptor, "set"))
                defineSetter(object, property, descriptor.set);
        }

        return object;
    };
}

// ES5 15.2.3.7
if (!Object.defineProperties) {
    Object.defineProperties = function defineProperties(object, properties) {
        for (var property in properties) {
            if (owns(properties, property))
                Object.defineProperty(object, property, properties[property]);
        }
        return object;
    };
}

// ES5 15.2.3.8
if (!Object.seal) {
    Object.seal = function seal(object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// ES5 15.2.3.9
if (!Object.freeze) {
    Object.freeze = function freeze(object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// detect a Rhino bug and patch it
try {
    Object.freeze(function () {});
} catch (exception) {
    Object.freeze = (function freeze(freezeObject) {
        return function freeze(object) {
            if (typeof object === "function") {
                return object;
            } else {
                return freezeObject(object);
            }
        };
    })(Object.freeze);
}

// ES5 15.2.3.10
if (!Object.preventExtensions) {
    Object.preventExtensions = function preventExtensions(object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// ES5 15.2.3.11
if (!Object.isSealed) {
    Object.isSealed = function isSealed(object) {
        return false;
    };
}

// ES5 15.2.3.12
if (!Object.isFrozen) {
    Object.isFrozen = function isFrozen(object) {
        return false;
    };
}

// ES5 15.2.3.13
if (!Object.isExtensible) {
    Object.isExtensible = function isExtensible(object) {
        return true;
    };
}

// ES5 15.2.3.14
// http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
if (!Object.keys) {

    var hasDontEnumBug = true,
        dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    for (var key in {"toString": null})
        hasDontEnumBug = false;

    Object.keys = function keys(object) {

        if (
            typeof object !== "object" && typeof object !== "function"
            || object === null
        )
            throw new TypeError("Object.keys called on a non-object");

        var keys = [];
        for (var name in object) {
            if (owns(object, name)) {
                keys.push(name);
            }
        }

        if (hasDontEnumBug) {
            for (var i = 0, ii = dontEnumsLength; i < ii; i++) {
                var dontEnum = dontEnums[i];
                if (owns(object, dontEnum)) {
                    keys.push(dontEnum);
                }
            }
        }

        return keys;
    };

}

//
// Date
// ====
//

// ES5 15.9.5.43
// Format a Date object as a string according to a subset of the ISO-8601 standard.
// Useful in Atom, among other things.
if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function toISOString() {
        return (
            this.getUTCFullYear() + "-" +
            (this.getUTCMonth() + 1) + "-" +
            this.getUTCDate() + "T" +
            this.getUTCHours() + ":" +
            this.getUTCMinutes() + ":" +
            this.getUTCSeconds() + "Z"
        );
    }
}

// ES5 15.9.4.4
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

// ES5 15.9.5.44
if (!Date.prototype.toJSON) {
    Date.prototype.toJSON = function toJSON(key) {
        // This function provides a String representation of a Date object for
        // use by JSON.stringify (15.12.3). When the toJSON method is called
        // with argument key, the following steps are taken:

        // 1.  Let O be the result of calling ToObject, giving it the this
        // value as its argument.
        // 2. Let tv be ToPrimitive(O, hint Number).
        // 3. If tv is a Number and is not finite, return null.
        // XXX
        // 4. Let toISO be the result of calling the [[Get]] internal method of
        // O with argument "toISOString".
        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
        if (typeof this.toISOString !== "function")
            throw new TypeError();
        // 6. Return the result of calling the [[Call]] internal method of
        // toISO with O as the this value and an empty argument list.
        return this.toISOString();

        // NOTE 1 The argument is ignored.

        // NOTE 2 The toJSON function is intentionally generic; it does not
        // require that its this value be a Date object. Therefore, it can be
        // transferred to other kinds of objects for use as a method. However,
        // it does require that any such object have a toISOString method. An
        // object is free to use the argument key to filter its
        // stringification.
    };
}

// 15.9.4.2 Date.parse (string)
// 15.9.1.15 Date Time String Format
// Date.parse
// based on work shared by Daniel Friesen (dantman)
// http://gist.github.com/303249
if (isNaN(Date.parse("T00:00"))) {
    // XXX global assignment won't work in embeddings that use
    // an alternate object for the context.
    Date = (function(NativeDate) {

        // Date.length === 7
        var Date = function(Y, M, D, h, m, s, ms) {
            var length = arguments.length;
            if (this instanceof NativeDate) {
                var date = length === 1 && String(Y) === Y ? // isString(Y)
                    // We explicitly pass it through parse:
                    new NativeDate(Date.parse(Y)) :
                    // We have to manually make calls depending on argument
                    // length here
                    length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
                    length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
                    length >= 4 ? new NativeDate(Y, M, D, h) :
                    length >= 3 ? new NativeDate(Y, M, D) :
                    length >= 2 ? new NativeDate(Y, M) :
                    length >= 1 ? new NativeDate(Y) :
                                  new NativeDate();
                // Prevent mixups with unfixed Date object
                date.constructor = Date;
                return date;
            }
            return NativeDate.apply(this, arguments);
        };

        // 15.9.1.15 Date Time String Format
        var isoDateExpression = new RegExp("^" +
            "(?:" + // optional year-month-day
                "(" + // year capture
                    "(?:[+-]\\d\\d)?" + // 15.9.1.15.1 Extended years
                    "\\d\\d\\d\\d" + // four-digit year
                ")" +
                "(?:-" + // optional month-day
                    "(\\d\\d)" + // month capture
                    "(?:-" + // optional day
                        "(\\d\\d)" + // day capture
                    ")?" +
                ")?" +
            ")?" +
            "(?:T" + // hour:minute:second.subsecond
                "(\\d\\d)" + // hour capture
                ":(\\d\\d)" + // minute capture
                "(?::" + // optional :second.subsecond
                    "(\\d\\d)" + // second capture
                    "(?:\\.(\\d\\d\\d))?" + // milisecond capture
                ")?" +
            ")?" +
            "(?:" + // time zone
                "Z|" + // UTC capture
                "([+-])(\\d\\d):(\\d\\d)" + // timezone offset
                // capture sign, hour, minute
            ")?" +
        "$");

        // Copy any custom methods a 3rd party library may have added
        for (var key in NativeDate)
            Date[key] = NativeDate[key];

        // Copy "native" methods explicitly; they may be non-enumerable
        Date.now = NativeDate.now;
        Date.UTC = NativeDate.UTC;
        Date.prototype = NativeDate.prototype;
        Date.prototype.constructor = Date;

        // Upgrade Date.parse to handle the ISO dates we use
        // TODO review specification to ascertain whether it is
        // necessary to implement partial ISO date strings.
        Date.parse = function parse(string) {
            var match = isoDateExpression.exec(string);
            if (match) {
                match.shift(); // kill match[0], the full match
                // recognize times without dates before normalizing the
                // numeric values, for later use
                var timeOnly = match[0] === undefined;
                // parse numerics
                for (var i = 0; i < 10; i++) {
                    // skip + or - for the timezone offset
                    if (i === 7)
                        continue;
                    // Note: parseInt would read 0-prefix numbers as
                    // octal.  Number constructor or unary + work better
                    // here:
                    match[i] = +(match[i] || (i < 3 ? 1 : 0));
                    // match[1] is the month. Months are 0-11 in JavaScript
                    // Date objects, but 1-12 in ISO notation, so we
                    // decrement.
                    if (i === 1)
                        match[i]--;
                }
                // if no year-month-date is provided, return a milisecond
                // quantity instead of a UTC date number value.
                if (timeOnly)
                    return ((match[3] * 60 + match[4]) * 60 + match[5]) * 1000 + match[6];

                // account for an explicit time zone offset if provided
                var offset = (match[8] * 60 + match[9]) * 60 * 1000;
                if (match[6] === "-")
                    offset = -offset;

                return NativeDate.UTC.apply(this, match.slice(0, 7)) + offset;
            }
            return NativeDate.parse.apply(this, arguments);
        };

        return Date;
    })(Date);
}

//
// String
// ======
//

// ES5 15.5.4.20
if (!String.prototype.trim) {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    var trimBeginRegexp = /^\s\s*/;
    var trimEndRegexp = /\s\s*$/;
    String.prototype.trim = function trim() {
        return String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
    };
}

});}, "json2ify/index": function(exports, require, module) {/*
    http://www.JSON.org/json2.js
    2009-09-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
  this.JSON = {};
}

module.exports = JSON;

(function () {
  

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());}, "jqueryify/index": function(exports, require, module) {/*!
 * jQuery JavaScript Library v1.7.1
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Mon Nov 21 21:11:03 2011 -0500
 */
(function( window, undefined ) {

// Use the correct document accordingly with window argument (sandbox)
var document = window.document,
	navigator = window.navigator,
	location = window.location;
var jQuery = (function() {

// Define a local copy of jQuery
var jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// A simple way to check for HTML strings or ID strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Check if a string has a non-whitespace character in it
	rnotwhite = /\S/,

	// Used for trimming whitespace
	trimLeft = /^\s+/,
	trimRight = /\s+$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

	// Useragent RegExp
	rwebkit = /(webkit)[ \/]([\w.]+)/,
	ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
	rmsie = /(msie) ([\w.]+)/,
	rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

	// Matches dashed string for camelizing
	rdashAlpha = /-([a-z]|[0-9])/ig,
	rmsPrefix = /^-ms-/,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return ( letter + "" ).toUpperCase();
	},

	// Keep a UserAgent string for use with jQuery.browser
	userAgent = navigator.userAgent,

	// For matching the engine and version of the browser
	browserMatch,

	// The deferred used on DOM ready
	readyList,

	// The ready event handler
	DOMContentLoaded,

	// Save a reference to some core methods
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	trim = String.prototype.trim,
	indexOf = Array.prototype.indexOf,

	// [[Class]] -> type pairs
	class2type = {};

jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), or $(undefined)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// The body element only exists once, optimize finding it
		if ( selector === "body" && !context && document.body ) {
			this.context = document;
			this[0] = document.body;
			this.selector = selector;
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			// Are we dealing with HTML string or an ID?
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = quickExpr.exec( selector );
			}

			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;
					doc = ( context ? context.ownerDocument || context : document );

					// If a single string is passed in and it's a single tag
					// just do a createElement and skip the rest
					ret = rsingleTag.exec( selector );

					if ( ret ) {
						if ( jQuery.isPlainObject( context ) ) {
							selector = [ document.createElement( ret[1] ) ];
							jQuery.fn.attr.call( selector, context, true );

						} else {
							selector = [ doc.createElement( ret[1] ) ];
						}

					} else {
						ret = jQuery.buildFragment( [ match[1] ], [ doc ] );
						selector = ( ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment ).childNodes;
					}

					return jQuery.merge( this, selector );

				// HANDLE: $("#id")
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.7.1",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return slice.call( this, 0 );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {
		// Build a new jQuery matched element set
		var ret = this.constructor();

		if ( jQuery.isArray( elems ) ) {
			push.apply( ret, elems );

		} else {
			jQuery.merge( ret, elems );
		}

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Attach the listeners
		jQuery.bindReady();

		// Add the callback
		readyList.add( fn );

		return this;
	},

	eq: function( i ) {
		i = +i;
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ),
			"slice", slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {
		// Either a released hold or an DOMready/load event and not yet ready
		if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( !document.body ) {
				return setTimeout( jQuery.ready, 1 );
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.fireWith( document, [ jQuery ] );

			// Trigger any bound ready events
			if ( jQuery.fn.trigger ) {
				jQuery( document ).trigger( "ready" ).off( "ready" );
			}
		}
	},

	bindReady: function() {
		if ( readyList ) {
			return;
		}

		readyList = jQuery.Callbacks( "once memory" );

		// Catch cases where $(document).ready() is called after the
		// browser event has already occurred.
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			return setTimeout( jQuery.ready, 1 );
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else if ( document.attachEvent ) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var toplevel = false;

			try {
				toplevel = window.frameElement == null;
			} catch(e) {}

			if ( document.documentElement.doScroll && toplevel ) {
				doScrollCheck();
			}
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	// A crude way of determining if an object is a window
	isWindow: function( obj ) {
		return obj && typeof obj === "object" && "setInterval" in obj;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		for ( var name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	parseJSON: function( data ) {
		if ( typeof data !== "string" || !data ) {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return ( new Function( "return " + data ) )();

		}
		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	},

	// args is for internal usage only
	each: function( object, callback, args ) {
		var name, i = 0,
			length = object.length,
			isObj = length === undefined || jQuery.isFunction( object );

		if ( args ) {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.apply( object[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( object[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return object;
	},

	// Use native String.trim function wherever possible
	trim: trim ?
		function( text ) {
			return text == null ?
				"" :
				trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
		},

	// results is for internal usage only
	makeArray: function( array, results ) {
		var ret = results || [];

		if ( array != null ) {
			// The window, strings (and functions) also have 'length'
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			var type = jQuery.type( array );

			if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) {
				push.call( ret, array );
			} else {
				jQuery.merge( ret, array );
			}
		}

		return ret;
	},

	inArray: function( elem, array, i ) {
		var len;

		if ( array ) {
			if ( indexOf ) {
				return indexOf.call( array, elem, i );
			}

			len = array.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in array && array[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var i = first.length,
			j = 0;

		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var ret = [], retVal;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value, key, ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		if ( typeof context === "string" ) {
			var tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		var args = slice.call( arguments, 2 ),
			proxy = function() {
				return fn.apply( context, args.concat( slice.call( arguments ) ) );
			};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

		return proxy;
	},

	// Mutifunctional method to get and set values to a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, key, value, exec, fn, pass ) {
		var length = elems.length;

		// Setting many attributes
		if ( typeof key === "object" ) {
			for ( var k in key ) {
				jQuery.access( elems, k, key[k], exec, fn, value );
			}
			return elems;
		}

		// Setting one attribute
		if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = !pass && exec && jQuery.isFunction(value);

			for ( var i = 0; i < length; i++ ) {
				fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
			}

			return elems;
		}

		// Getting an attribute
		return length ? fn( elems[0], key ) : undefined;
	},

	now: function() {
		return ( new Date() ).getTime();
	},

	// Use of jQuery.browser is frowned upon.
	// More details: http://docs.jquery.com/Utilities/jQuery.browser
	uaMatch: function( ua ) {
		ua = ua.toLowerCase();

		var match = rwebkit.exec( ua ) ||
			ropera.exec( ua ) ||
			rmsie.exec( ua ) ||
			ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
			[];

		return { browser: match[1] || "", version: match[2] || "0" };
	},

	sub: function() {
		function jQuerySub( selector, context ) {
			return new jQuerySub.fn.init( selector, context );
		}
		jQuery.extend( true, jQuerySub, this );
		jQuerySub.superclass = this;
		jQuerySub.fn = jQuerySub.prototype = this();
		jQuerySub.fn.constructor = jQuerySub;
		jQuerySub.sub = this.sub;
		jQuerySub.fn.init = function init( selector, context ) {
			if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
				context = jQuerySub( context );
			}

			return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
		};
		jQuerySub.fn.init.prototype = jQuerySub.fn;
		var rootjQuerySub = jQuerySub(document);
		return jQuerySub;
	},

	browser: {}
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

browserMatch = jQuery.uaMatch( userAgent );
if ( browserMatch.browser ) {
	jQuery.browser[ browserMatch.browser ] = true;
	jQuery.browser.version = browserMatch.version;
}

// Deprecated, use jQuery.browser.webkit instead
if ( jQuery.browser.webkit ) {
	jQuery.browser.safari = true;
}

// IE doesn't match non-breaking spaces with \s
if ( rnotwhite.test( "\xA0" ) ) {
	trimLeft = /^[\s\xA0]+/;
	trimRight = /[\s\xA0]+$/;
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);

// Cleanup functions for the document ready method
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		jQuery.ready();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	};
}

// The DOM ready check for Internet Explorer
function doScrollCheck() {
	if ( jQuery.isReady ) {
		return;
	}

	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		document.documentElement.doScroll("left");
	} catch(e) {
		setTimeout( doScrollCheck, 1 );
		return;
	}

	// and execute any waiting functions
	jQuery.ready();
}

return jQuery;

})();


// String to Object flags format cache
var flagsCache = {};

// Convert String-formatted flags into Object-formatted ones and store in cache
function createFlags( flags ) {
	var object = flagsCache[ flags ] = {},
		i, length;
	flags = flags.split( /\s+/ );
	for ( i = 0, length = flags.length; i < length; i++ ) {
		object[ flags[i] ] = true;
	}
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	flags:	an optional list of space-separated flags that will change how
 *			the callback list behaves
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible flags:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( flags ) {

	// Convert flags from String-formatted to Object-formatted
	// (we check in cache first)
	flags = flags ? ( flagsCache[ flags ] || createFlags( flags ) ) : {};

	var // Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = [],
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Add one or several callbacks to the list
		add = function( args ) {
			var i,
				length,
				elem,
				type,
				actual;
			for ( i = 0, length = args.length; i < length; i++ ) {
				elem = args[ i ];
				type = jQuery.type( elem );
				if ( type === "array" ) {
					// Inspect recursively
					add( elem );
				} else if ( type === "function" ) {
					// Add if not in unique mode and callback is not in
					if ( !flags.unique || !self.has( elem ) ) {
						list.push( elem );
					}
				}
			}
		},
		// Fire callbacks
		fire = function( context, args ) {
			args = args || [];
			memory = !flags.memory || [ context, args ];
			firing = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( context, args ) === false && flags.stopOnFalse ) {
					memory = true; // Mark as halted
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( !flags.once ) {
					if ( stack && stack.length ) {
						memory = stack.shift();
						self.fireWith( memory[ 0 ], memory[ 1 ] );
					}
				} else if ( memory === true ) {
					self.disable();
				} else {
					list = [];
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					var length = list.length;
					add( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away, unless previous
					// firing was halted (stopOnFalse)
					} else if ( memory && memory !== true ) {
						firingStart = length;
						fire( memory[ 0 ], memory[ 1 ] );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					var args = arguments,
						argIndex = 0,
						argLength = args.length;
					for ( ; argIndex < argLength ; argIndex++ ) {
						for ( var i = 0; i < list.length; i++ ) {
							if ( args[ argIndex ] === list[ i ] ) {
								// Handle firingIndex and firingLength
								if ( firing ) {
									if ( i <= firingLength ) {
										firingLength--;
										if ( i <= firingIndex ) {
											firingIndex--;
										}
									}
								}
								// Remove the element
								list.splice( i--, 1 );
								// If we have some unicity property then
								// we only need to do this once
								if ( flags.unique ) {
									break;
								}
							}
						}
					}
				}
				return this;
			},
			// Control if a given callback is in the list
			has: function( fn ) {
				if ( list ) {
					var i = 0,
						length = list.length;
					for ( ; i < length; i++ ) {
						if ( fn === list[ i ] ) {
							return true;
						}
					}
				}
				return false;
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory || memory === true ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( stack ) {
					if ( firing ) {
						if ( !flags.once ) {
							stack.push( [ context, args ] );
						}
					} else if ( !( flags.once && memory ) ) {
						fire( context, args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!memory;
			}
		};

	return self;
};




var // Static reference to slice
	sliceDeferred = [].slice;

jQuery.extend({

	Deferred: function( func ) {
		var doneList = jQuery.Callbacks( "once memory" ),
			failList = jQuery.Callbacks( "once memory" ),
			progressList = jQuery.Callbacks( "memory" ),
			state = "pending",
			lists = {
				resolve: doneList,
				reject: failList,
				notify: progressList
			},
			promise = {
				done: doneList.add,
				fail: failList.add,
				progress: progressList.add,

				state: function() {
					return state;
				},

				// Deprecated
				isResolved: doneList.fired,
				isRejected: failList.fired,

				then: function( doneCallbacks, failCallbacks, progressCallbacks ) {
					deferred.done( doneCallbacks ).fail( failCallbacks ).progress( progressCallbacks );
					return this;
				},
				always: function() {
					deferred.done.apply( deferred, arguments ).fail.apply( deferred, arguments );
					return this;
				},
				pipe: function( fnDone, fnFail, fnProgress ) {
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( {
							done: [ fnDone, "resolve" ],
							fail: [ fnFail, "reject" ],
							progress: [ fnProgress, "notify" ]
						}, function( handler, data ) {
							var fn = data[ 0 ],
								action = data[ 1 ],
								returned;
							if ( jQuery.isFunction( fn ) ) {
								deferred[ handler ](function() {
									returned = fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise().then( newDefer.resolve, newDefer.reject, newDefer.notify );
									} else {
										newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
									}
								});
							} else {
								deferred[ handler ]( newDefer[ action ] );
							}
						});
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					if ( obj == null ) {
						obj = promise;
					} else {
						for ( var key in promise ) {
							obj[ key ] = promise[ key ];
						}
					}
					return obj;
				}
			},
			deferred = promise.promise({}),
			key;

		for ( key in lists ) {
			deferred[ key ] = lists[ key ].fire;
			deferred[ key + "With" ] = lists[ key ].fireWith;
		}

		// Handle state
		deferred.done( function() {
			state = "resolved";
		}, failList.disable, progressList.lock ).fail( function() {
			state = "rejected";
		}, doneList.disable, progressList.lock );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( firstParam ) {
		var args = sliceDeferred.call( arguments, 0 ),
			i = 0,
			length = args.length,
			pValues = new Array( length ),
			count = length,
			pCount = length,
			deferred = length <= 1 && firstParam && jQuery.isFunction( firstParam.promise ) ?
				firstParam :
				jQuery.Deferred(),
			promise = deferred.promise();
		function resolveFunc( i ) {
			return function( value ) {
				args[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
				if ( !( --count ) ) {
					deferred.resolveWith( deferred, args );
				}
			};
		}
		function progressFunc( i ) {
			return function( value ) {
				pValues[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
				deferred.notifyWith( promise, pValues );
			};
		}
		if ( length > 1 ) {
			for ( ; i < length; i++ ) {
				if ( args[ i ] && args[ i ].promise && jQuery.isFunction( args[ i ].promise ) ) {
					args[ i ].promise().then( resolveFunc(i), deferred.reject, progressFunc(i) );
				} else {
					--count;
				}
			}
			if ( !count ) {
				deferred.resolveWith( deferred, args );
			}
		} else if ( deferred !== firstParam ) {
			deferred.resolveWith( deferred, length ? [ firstParam ] : [] );
		}
		return promise;
	}
});




jQuery.support = (function() {

	var support,
		all,
		a,
		select,
		opt,
		input,
		marginDiv,
		fragment,
		tds,
		events,
		eventName,
		i,
		isSupported,
		div = document.createElement( "div" ),
		documentElement = document.documentElement;

	// Preliminary tests
	div.setAttribute("className", "t");
	div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

	all = div.getElementsByTagName( "*" );
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Can't get basic test support
	if ( !all || !all.length || !a ) {
		return {};
	}

	// First batch of supports tests
	select = document.createElement( "select" );
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName( "input" )[ 0 ];

	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute("href") === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.55/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// Tests for enctype support on a form(#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false;
		});
		div.cloneNode( true ).fireEvent( "onclick" );
	}

	// Check if a radio maintains its value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute("type", "radio");
	support.radioValue = input.value === "t";

	input.setAttribute("checked", "checked");
	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.lastChild );

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	fragment.removeChild( input );
	fragment.appendChild( div );

	div.innerHTML = "";

	// Check if div with explicit width and no margin-right incorrectly
	// gets computed margin-right based on width of container. For more
	// info see bug #3333
	// Fails in WebKit before Feb 2011 nightlies
	// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
	if ( window.getComputedStyle ) {
		marginDiv = document.createElement( "div" );
		marginDiv.style.width = "0";
		marginDiv.style.marginRight = "0";
		div.style.width = "2px";
		div.appendChild( marginDiv );
		support.reliableMarginRight =
			( parseInt( ( window.getComputedStyle( marginDiv, null ) || { marginRight: 0 } ).marginRight, 10 ) || 0 ) === 0;
	}

	// Technique from Juriy Zaytsev
	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( div.attachEvent ) {
		for( i in {
			submit: 1,
			change: 1,
			focusin: 1
		}) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	fragment.removeChild( div );

	// Null elements to avoid leaks in IE
	fragment = select = opt = marginDiv = div = input = null;

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, outer, inner, table, td, offsetSupport,
			conMarginTop, ptlm, vb, style, html,
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		conMarginTop = 1;
		ptlm = "position:absolute;top:0;left:0;width:1px;height:1px;margin:0;";
		vb = "visibility:hidden;border:0;";
		style = "style='" + ptlm + "border:5px solid #000;padding:0;'";
		html = "<div " + style + "><div></div></div>" +
			"<table " + style + " cellpadding='0' cellspacing='0'>" +
			"<tr><td></td></tr></table>";

		container = document.createElement("div");
		container.style.cssText = vb + "width:0;height:0;position:static;top:0;margin-top:" + conMarginTop + "px";
		body.insertBefore( container, body.firstChild );

		// Construct the test element
		div = document.createElement("div");
		container.appendChild( div );

		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		// (only IE 8 fails this test)
		div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName( "td" );
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Check if empty table cells still have offsetWidth/Height
		// (IE <= 8 fail this test)
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Figure out if the W3C box model works as expected
		div.innerHTML = "";
		div.style.width = div.style.paddingLeft = "1px";
		jQuery.boxModel = support.boxModel = div.offsetWidth === 2;

		if ( typeof div.style.zoom !== "undefined" ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.style.display = "inline";
			div.style.zoom = 1;
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );

			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "";
			div.innerHTML = "<div style='width:4px;'></div>";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 2 );
		}

		div.style.cssText = ptlm + vb;
		div.innerHTML = html;

		outer = div.firstChild;
		inner = outer.firstChild;
		td = outer.nextSibling.firstChild.firstChild;

		offsetSupport = {
			doesNotAddBorder: ( inner.offsetTop !== 5 ),
			doesAddBorderForTableAndCells: ( td.offsetTop === 5 )
		};

		inner.style.position = "fixed";
		inner.style.top = "20px";

		// safari subtracts parent border width here which is 5px
		offsetSupport.fixedPosition = ( inner.offsetTop === 20 || inner.offsetTop === 15 );
		inner.style.position = inner.style.top = "";

		outer.style.overflow = "hidden";
		outer.style.position = "relative";

		offsetSupport.subtractsBorderForOverflowNotVisible = ( inner.offsetTop === -5 );
		offsetSupport.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== conMarginTop );

		body.removeChild( container );
		div  = container = null;

		jQuery.extend( support, offsetSupport );
	});

	return support;
})();




var rbrace = /^(?:\{.*\}|\[.*\])$/,
	rmultiDash = /([A-Z])/g;

jQuery.extend({
	cache: {},

	// Please use with caution
	uuid: 0,

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var privateCache, thisCache, ret,
			internalKey = jQuery.expando,
			getByName = typeof name === "string",

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
			cache = isNode ? jQuery.cache : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
			id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey,
			isEvents = name === "events";

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || !cache[id] || (!isEvents && !pvt && !cache[id].data)) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if ( isNode ) {
				elem[ internalKey ] = id = ++jQuery.uuid;
			} else {
				id = internalKey;
			}
		}

		if ( !cache[ id ] ) {
			cache[ id ] = {};

			// Avoids exposing jQuery metadata on plain JS objects when the object
			// is serialized using JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ] = jQuery.extend( cache[ id ], name );
			} else {
				cache[ id ].data = jQuery.extend( cache[ id ].data, name );
			}
		}

		privateCache = thisCache = cache[ id ];

		// jQuery data() is stored in a separate object inside the object's internal data
		// cache in order to avoid key collisions between internal data and user-defined
		// data.
		if ( !pvt ) {
			if ( !thisCache.data ) {
				thisCache.data = {};
			}

			thisCache = thisCache.data;
		}

		if ( data !== undefined ) {
			thisCache[ jQuery.camelCase( name ) ] = data;
		}

		// Users should not attempt to inspect the internal events object using jQuery.data,
		// it is undocumented and subject to change. But does anyone listen? No.
		if ( isEvents && !thisCache[ name ] ) {
			return privateCache.events;
		}

		// Check for both converted-to-camel and non-converted data property names
		// If a data property was specified
		if ( getByName ) {

			// First Try to find as-is property data
			ret = thisCache[ name ];

			// Test for null|undefined property data
			if ( ret == null ) {

				// Try to find the camelCased property
				ret = thisCache[ jQuery.camelCase( name ) ];
			}
		} else {
			ret = thisCache;
		}

		return ret;
	},

	removeData: function( elem, name, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, i, l,

			// Reference to internal data cache key
			internalKey = jQuery.expando,

			isNode = elem.nodeType,

			// See jQuery.data for more information
			cache = isNode ? jQuery.cache : elem,

			// See jQuery.data for more information
			id = isNode ? elem[ internalKey ] : internalKey;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {

			thisCache = pvt ? cache[ id ] : cache[ id ].data;

			if ( thisCache ) {

				// Support array or space separated string names for data keys
				if ( !jQuery.isArray( name ) ) {

					// try the string as a key before any manipulation
					if ( name in thisCache ) {
						name = [ name ];
					} else {

						// split the camel cased version by spaces unless a key with the spaces exists
						name = jQuery.camelCase( name );
						if ( name in thisCache ) {
							name = [ name ];
						} else {
							name = name.split( " " );
						}
					}
				}

				for ( i = 0, l = name.length; i < l; i++ ) {
					delete thisCache[ name[i] ];
				}

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( !pvt ) {
			delete cache[ id ].data;

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject(cache[ id ]) ) {
				return;
			}
		}

		// Browsers that fail expando deletion also refuse to delete expandos on
		// the window, but it will allow it on all other JS objects; other browsers
		// don't care
		// Ensure that `cache` is not a window object #10080
		if ( jQuery.support.deleteExpando || !cache.setInterval ) {
			delete cache[ id ];
		} else {
			cache[ id ] = null;
		}

		// We destroyed the cache and need to eliminate the expando on the node to avoid
		// false lookups in the cache for entries that no longer exist
		if ( isNode ) {
			// IE does not allow us to delete expando properties from nodes,
			// nor does it have a removeAttribute function on Document nodes;
			// we must handle all of these cases
			if ( jQuery.support.deleteExpando ) {
				delete elem[ internalKey ];
			} else if ( elem.removeAttribute ) {
				elem.removeAttribute( internalKey );
			} else {
				elem[ internalKey ] = null;
			}
		}
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return jQuery.data( elem, name, data, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		if ( elem.nodeName ) {
			var match = jQuery.noData[ elem.nodeName.toLowerCase() ];

			if ( match ) {
				return !(match === true || elem.getAttribute("classid") !== match);
			}
		}

		return true;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var parts, attr, name,
			data = null;

		if ( typeof key === "undefined" ) {
			if ( this.length ) {
				data = jQuery.data( this[0] );

				if ( this[0].nodeType === 1 && !jQuery._data( this[0], "parsedAttrs" ) ) {
					attr = this[0].attributes;
					for ( var i = 0, l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( name.indexOf( "data-" ) === 0 ) {
							name = jQuery.camelCase( name.substring(5) );

							dataAttr( this[0], name, data[ name ] );
						}
					}
					jQuery._data( this[0], "parsedAttrs", true );
				}
			}

			return data;

		} else if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		parts = key.split(".");
		parts[1] = parts[1] ? "." + parts[1] : "";

		if ( value === undefined ) {
			data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

			// Try to fetch any internally stored data first
			if ( data === undefined && this.length ) {
				data = jQuery.data( this[0], key );
				data = dataAttr( this[0], key, data );
			}

			return data === undefined && parts[1] ?
				this.data( parts[0] ) :
				data;

		} else {
			return this.each(function() {
				var self = jQuery( this ),
					args = [ parts[0], value ];

				self.triggerHandler( "setData" + parts[1] + "!", args );
				jQuery.data( this, key, value );
				self.triggerHandler( "changeData" + parts[1] + "!", args );
			});
		}
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				jQuery.isNumeric( data ) ? parseFloat( data ) :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	for ( var name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}




function handleQueueMarkDefer( elem, type, src ) {
	var deferDataKey = type + "defer",
		queueDataKey = type + "queue",
		markDataKey = type + "mark",
		defer = jQuery._data( elem, deferDataKey );
	if ( defer &&
		( src === "queue" || !jQuery._data(elem, queueDataKey) ) &&
		( src === "mark" || !jQuery._data(elem, markDataKey) ) ) {
		// Give room for hard-coded callbacks to fire first
		// and eventually mark/queue something else on the element
		setTimeout( function() {
			if ( !jQuery._data( elem, queueDataKey ) &&
				!jQuery._data( elem, markDataKey ) ) {
				jQuery.removeData( elem, deferDataKey, true );
				defer.fire();
			}
		}, 0 );
	}
}

jQuery.extend({

	_mark: function( elem, type ) {
		if ( elem ) {
			type = ( type || "fx" ) + "mark";
			jQuery._data( elem, type, (jQuery._data( elem, type ) || 0) + 1 );
		}
	},

	_unmark: function( force, elem, type ) {
		if ( force !== true ) {
			type = elem;
			elem = force;
			force = false;
		}
		if ( elem ) {
			type = type || "fx";
			var key = type + "mark",
				count = force ? 0 : ( (jQuery._data( elem, key ) || 1) - 1 );
			if ( count ) {
				jQuery._data( elem, key, count );
			} else {
				jQuery.removeData( elem, key, true );
				handleQueueMarkDefer( elem, type, "mark" );
			}
		}
	},

	queue: function( elem, type, data ) {
		var q;
		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			q = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !q || jQuery.isArray(data) ) {
					q = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					q.push( data );
				}
			}
			return q || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			fn = queue.shift(),
			hooks = {};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
		}

		if ( fn ) {
			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			jQuery._data( elem, type + ".run", hooks );
			fn.call( elem, function() {
				jQuery.dequeue( elem, type );
			}, hooks );
		}

		if ( !queue.length ) {
			jQuery.removeData( elem, type + "queue " + type + ".run", true );
			handleQueueMarkDefer( elem, type, "queue" );
		}
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
		}

		if ( data === undefined ) {
			return jQuery.queue( this[0], type );
		}
		return this.each(function() {
			var queue = jQuery.queue( this, type, data );

			if ( type === "fx" && queue[0] !== "inprogress" ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, object ) {
		if ( typeof type !== "string" ) {
			object = type;
			type = undefined;
		}
		type = type || "fx";
		var defer = jQuery.Deferred(),
			elements = this,
			i = elements.length,
			count = 1,
			deferDataKey = type + "defer",
			queueDataKey = type + "queue",
			markDataKey = type + "mark",
			tmp;
		function resolve() {
			if ( !( --count ) ) {
				defer.resolveWith( elements, [ elements ] );
			}
		}
		while( i-- ) {
			if (( tmp = jQuery.data( elements[ i ], deferDataKey, undefined, true ) ||
					( jQuery.data( elements[ i ], queueDataKey, undefined, true ) ||
						jQuery.data( elements[ i ], markDataKey, undefined, true ) ) &&
					jQuery.data( elements[ i ], deferDataKey, jQuery.Callbacks( "once memory" ), true ) )) {
				count++;
				tmp.add( resolve );
			}
		}
		resolve();
		return defer.promise();
	}
});




var rclass = /[\n\t\r]/g,
	rspace = /\s+/,
	rreturn = /\r/g,
	rtype = /^(?:button|input)$/i,
	rfocusable = /^(?:button|input|object|select|textarea)$/i,
	rclickable = /^a(?:rea)?$/i,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute,
	nodeHook, boolHook, fixSpecified;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.attr );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.prop );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classNames, i, l, elem,
			setClass, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call(this, j, this.className) );
			});
		}

		if ( value && typeof value === "string" ) {
			classNames = value.split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className && classNames.length === 1 ) {
						elem.className = value;

					} else {
						setClass = " " + elem.className + " ";

						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
								setClass += classNames[ c ] + " ";
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classNames, i, l, elem, className, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call(this, j, this.className) );
			});
		}

		if ( (value && typeof value === "string") || value === undefined ) {
			classNames = ( value || "" ).split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 && elem.className ) {
					if ( value ) {
						className = (" " + elem.className + " ").replace( rclass, " " );
						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							className = className.replace(" " + classNames[ c ] + " ", " ");
						}
						elem.className = jQuery.trim( className );

					} else {
						elem.className = "";
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.split( rspace );

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space seperated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.nodeName.toLowerCase() ] || jQuery.valHooks[ elem.type ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var self = jQuery(this), val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.nodeName.toLowerCase() ] || jQuery.valHooks[ this.type ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, i, max, option,
					index = elem.selectedIndex,
					values = [],
					options = elem.options,
					one = elem.type === "select-one";

				// Nothing was selected
				if ( index < 0 ) {
					return null;
				}

				// Loop through all the selected options
				i = one ? index : 0;
				max = one ? index + 1 : options.length;
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Don't return options that are disabled or in a disabled optgroup
					if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
							(!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
				if ( one && !values.length && options.length ) {
					return jQuery( options[ index ] ).val();
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attrFn: {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true
	},

	attr: function( elem, name, value, pass ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( pass && name in jQuery.attrFn ) {
			return jQuery( elem )[ name ]( value );
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;

			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, "" + value );
				return value;
			}

		} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			ret = elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return ret === null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var propName, attrNames, name, l,
			i = 0;

		if ( value && elem.nodeType === 1 ) {
			attrNames = value.toLowerCase().split( rspace );
			l = attrNames.length;

			for ( ; i < l; i++ ) {
				name = attrNames[ i ];

				if ( name ) {
					propName = jQuery.propFix[ name ] || name;

					// See #9699 for explanation of this approach (setting first, then removal)
					jQuery.attr( elem, name, "" );
					elem.removeAttribute( getSetAttribute ? name : propName );

					// Set corresponding property to false for boolean attributes
					if ( rboolean.test( name ) && propName in elem ) {
						elem[ propName ] = false;
					}
				}
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				// We can't allow the type property to be changed (since it causes problems in IE)
				if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
					jQuery.error( "type property can't be changed" );
				} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to it's default in case type is set after value
					// This is for element creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		},
		// Use the value property for back compat
		// Use the nodeHook for button elements in IE6/7 (#1954)
		value: {
			get: function( elem, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.get( elem, name );
				}
				return name in elem ?
					elem.value :
					null;
			},
			set: function( elem, value, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.set( elem, value, name );
				}
				// Does not return so that setAttribute is also used
				elem.value = value;
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Add the tabIndex propHook to attrHooks for back-compat (different case is intentional)
jQuery.attrHooks.tabindex = jQuery.propHooks.tabIndex;

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		// Align boolean attributes with corresponding properties
		// Fall back to attribute presence where some booleans are not supported
		var attrNode,
			property = jQuery.prop( elem, name );
		return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		var propName;
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			// value is true since we know at this point it's type boolean and not false
			// Set boolean attributes to the same name and set the DOM property
			propName = jQuery.propFix[ name ] || name;
			if ( propName in elem ) {
				// Only set the IDL specifically if it already exists on the element
				elem[ propName ] = true;
			}

			elem.setAttribute( name, name.toLowerCase() );
		}
		return name;
	}
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	fixSpecified = {
		name: true,
		id: true
	};

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret;
			ret = elem.getAttributeNode( name );
			return ret && ( fixSpecified[ name ] ? ret.nodeValue !== "" : ret.specified ) ?
				ret.nodeValue :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				ret = document.createAttribute( name );
				elem.setAttributeNode( ret );
			}
			return ( ret.nodeValue = value + "" );
		}
	};

	// Apply the nodeHook to tabindex
	jQuery.attrHooks.tabindex.set = nodeHook.set;

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			if ( value === "" ) {
				value = "false";
			}
			nodeHook.set( elem, value, name );
		}
	};
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret === null ? undefined : ret;
			}
		});
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
			return elem.style.cssText.toLowerCase() || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = "" + value );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});




var rformElems = /^(?:textarea|input|select)$/i,
	rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/,
	rhoverHack = /\bhover(\.\S+)?\b/,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,
	quickParse = function( selector ) {
		var quick = rquickIs.exec( selector );
		if ( quick ) {
			//   0  1    2   3
			// [ _, tag, id, class ]
			quick[1] = ( quick[1] || "" ).toLowerCase();
			quick[3] = quick[3] && new RegExp( "(?:^|\\s)" + quick[3] + "(?:\\s|$)" );
		}
		return quick;
	},
	quickIs = function( elem, m ) {
		var attrs = elem.attributes || {};
		return (
			(!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
			(!m[2] || (attrs.id || {}).value === m[2]) &&
			(!m[3] || m[3].test( (attrs[ "class" ] || {}).value ))
		);
	},
	hoverHack = function( events ) {
		return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
	};

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	add: function( elem, types, handler, data, selector ) {

		var elemData, eventHandle, events,
			t, tns, type, namespaces, handleObj,
			handleObjIn, quick, handlers, special;

		// Don't attach events to noData or text/comment nodes (allow plain objects tho)
		if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		events = elemData.events;
		if ( !events ) {
			elemData.events = events = {};
		}
		eventHandle = elemData.handle;
		if ( !eventHandle ) {
			elemData.handle = eventHandle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = jQuery.trim( hoverHack(types) ).split( " " );
		for ( t = 0; t < types.length; t++ ) {

			tns = rtypenamespace.exec( types[t] ) || [];
			type = tns[1];
			namespaces = ( tns[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: tns[1],
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				quick: quickParse( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			handlers = events[ type ];
			if ( !handlers ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	global: {},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var elemData = jQuery.hasData( elem ) && jQuery._data( elem ),
			t, tns, type, origType, namespaces, origCount,
			j, events, special, handle, eventType, handleObj;

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
		for ( t = 0; t < types.length; t++ ) {
			tns = rtypenamespace.exec( types[t] ) || [];
			type = origType = tns[1];
			namespaces = tns[2];

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector? special.delegateType : special.bindType ) || type;
			eventType = events[ type ] || [];
			origCount = eventType.length;
			namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;

			// Remove matching events
			for ( j = 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					 ( !handler || handler.guid === handleObj.guid ) &&
					 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
					 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					eventType.splice( j--, 1 );

					if ( handleObj.selector ) {
						eventType.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( eventType.length === 0 && origCount !== eventType.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			handle = elemData.handle;
			if ( handle ) {
				handle.elem = null;
			}

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery.removeData( elem, [ "events", "handle" ], true );
		}
	},

	// Events that are safe to short-circuit if no handlers are attached.
	// Native DOM events should not be added, they may have inline handlers.
	customEvent: {
		"getData": true,
		"setData": true,
		"changeData": true
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		// Don't do events on text and comment nodes
		if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
			return;
		}

		// Event object or event type
		var type = event.type || event,
			namespaces = [],
			cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType;

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "!" ) >= 0 ) {
			// Exclusive events trigger only for the exact event (no namespaces)
			type = type.slice(0, -1);
			exclusive = true;
		}

		if ( type.indexOf( "." ) >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}

		if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
			// No jQuery handlers for this event type, and it can't have inline handlers
			return;
		}

		// Caller can pass in an Event, Object, or just an event type string
		event = typeof event === "object" ?
			// jQuery.Event object
			event[ jQuery.expando ] ? event :
			// Object literal
			new jQuery.Event( type, event ) :
			// Just the event type (string)
			new jQuery.Event( type );

		event.type = type;
		event.isTrigger = true;
		event.exclusive = exclusive;
		event.namespace = namespaces.join( "." );
		event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
		ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";

		// Handle a global trigger
		if ( !elem ) {

			// TODO: Stop taunting the data cache; remove global events and always attach to document
			cache = jQuery.cache;
			for ( i in cache ) {
				if ( cache[ i ].events && cache[ i ].events[ type ] ) {
					jQuery.event.trigger( event, data, cache[ i ].handle.elem, true );
				}
			}
			return;
		}

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data != null ? jQuery.makeArray( data ) : [];
		data.unshift( event );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		eventPath = [[ elem, special.bindType || type ]];
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			cur = rfocusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
			old = null;
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push([ cur, bubbleType ]);
				old = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( old && old === elem.ownerDocument ) {
				eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
			}
		}

		// Fire handlers on the event path
		for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {

			cur = eventPath[i][0];
			event.type = eventPath[i][1];

			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}
			// Note that this is a bare JS function and not a jQuery handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				// IE<9 dies on focus/blur to hidden element (#1486)
				if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					old = elem[ ontype ];

					if ( old ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( old ) {
						elem[ ontype ] = old;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event || window.event );

		var handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),
			delegateCount = handlers.delegateCount,
			args = [].slice.call( arguments, 0 ),
			run_all = !event.exclusive && !event.namespace,
			handlerQueue = [],
			i, j, cur, jqcur, ret, selMatch, matched, matches, handleObj, sel, related;

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Determine handlers that should run if there are delegated events
		// Avoid disabled elements in IE (#6911) and non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && !event.target.disabled && !(event.button && event.type === "click") ) {

			// Pregenerate a single jQuery object for reuse with .is()
			jqcur = jQuery(this);
			jqcur.context = this.ownerDocument || this;

			for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {
				selMatch = {};
				matches = [];
				jqcur[0] = cur;
				for ( i = 0; i < delegateCount; i++ ) {
					handleObj = handlers[ i ];
					sel = handleObj.selector;

					if ( selMatch[ sel ] === undefined ) {
						selMatch[ sel ] = (
							handleObj.quick ? quickIs( cur, handleObj.quick ) : jqcur.is( sel )
						);
					}
					if ( selMatch[ sel ] ) {
						matches.push( handleObj );
					}
				}
				if ( matches.length ) {
					handlerQueue.push({ elem: cur, matches: matches });
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( handlers.length > delegateCount ) {
			handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
		}

		// Run delegates first; they may want to stop propagation beneath us
		for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
			matched = handlerQueue[ i ];
			event.currentTarget = matched.elem;

			for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
				handleObj = matched.matches[ j ];

				// Triggered event must either 1) be non-exclusive and have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {

					event.data = handleObj.data;
					event.handleObj = handleObj;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						event.result = ret;
						if ( ret === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		return event.result;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	// *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
	props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop,
			originalEvent = event,
			fixHook = jQuery.event.fixHooks[ event.type ] || {},
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = jQuery.Event( originalEvent );

		for ( i = copy.length; i; ) {
			prop = copy[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Target should not be a text node (#504, Safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// For mouse/key events; add metaKey if it's not there (#3368, IE6/7/8)
		if ( event.metaKey === undefined ) {
			event.metaKey = event.ctrlKey;
		}

		return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		ready: {
			// Make sure the ready event is setup
			setup: jQuery.bindReady
		},

		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},

		focus: {
			delegateType: "focusin"
		},
		blur: {
			delegateType: "focusout"
		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

// Some plugins are using, but it's undocumented/deprecated and will be removed.
// The 1.7 special event interface should provide all the hooks needed now.
jQuery.event.handle = jQuery.event.dispatch;

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		if ( elem.detachEvent ) {
			elem.detachEvent( "on" + type, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}

		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE)
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj,
				selector = handleObj.selector,
				ret;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !form._submit_attached ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						// If form was submitted by the user, bubble the event up the tree
						if ( this.parentNode && !event.isTrigger ) {
							jQuery.event.simulate( "submit", this.parentNode, event, true );
						}
					});
					form._submit_attached = true;
				}
			});
			// return undefined since we don't need an event listener
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
							jQuery.event.simulate( "change", this, event, true );
						}
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !elem._change_attached ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					elem._change_attached = true;
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on.call( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			var handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace? handleObj.type + "." + handleObj.namespace : handleObj.type,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( var type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	live: function( types, data, fn ) {
		jQuery( this.context ).on( types, this.selector, data, fn );
		return this;
	},
	die: function( types, fn ) {
		jQuery( this.context ).off( types, this.selector || "**", fn );
		return this;
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length == 1? this.off( selector, "**" ) : this.off( types, selector, fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			return jQuery.event.trigger( type, data, this[0], true );
		}
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

		// link all the functions, so any of them can unbind this click handler
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}

		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};

	if ( jQuery.attrFn ) {
		jQuery.attrFn[ name ] = true;
	}

	if ( rkeyEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks;
	}

	if ( rmouseEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.mouseHooks;
	}
});



/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	expando = "sizcache" + (Math.random() + '').replace('.', ''),
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rReturn = /\r\n/g,
	rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results, seed ) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML( context ),
		parts = [],
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context, seed );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set, seed );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
	var set, i, len, match, type, left;

	if ( !expr ) {
		return [];
	}

	for ( i = 0, len = Expr.order.length; i < len; i++ ) {
		type = Expr.order[i];
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rBackslash, "" );
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( "*" ) :
			[];
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		type, found, item, filter, left,
		i, pass,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
		for ( type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				filter = Expr.filter[ type ];
				left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							pass = not ^ found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Utility function for retreiving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
var getText = Sizzle.getText = function( elem ) {
    var i, node,
		nodeType = elem.nodeType,
		ret = "";

	if ( nodeType ) {
		if ( nodeType === 1 || nodeType === 9 ) {
			// Use textContent || innerText for elements
			if ( typeof elem.textContent === 'string' ) {
				return elem.textContent;
			} else if ( typeof elem.innerText === 'string' ) {
				// Replace IE's carriage returns
				return elem.innerText.replace( rReturn, '' );
			} else {
				// Traverse it's children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
	} else {

		// If no nodeType, this is expected to be an array
		for ( i = 0; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			if ( node.nodeType !== 8 ) {
				ret += getText( node );
			}
		}
	}
	return ret;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},

	leftMatch: {},

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: function( elem ) {
			return elem.getAttribute( "href" );
		},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rNonWord.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
		},

		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
		}
	},

	find: {
		ID: function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: function( match, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( match[1] );
			}
		}
	},
	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace( rBackslash, "" ) + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {
			return match[1].replace( rBackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1] = match[1].replace( rBackslash, "" );
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},
	
	filters: {
		enabled: function( elem ) {
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			return elem.checked === true;
		},
		
		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}
			
			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
		},

		radio: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
		},

		file: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
		},

		password: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
		},

		submit: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

		image: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
		},

		reset: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "reset" === elem.type;
		},

		button: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		},

		focus: function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		}
	},
	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var first, last,
				doneName, parent, cache,
				count, diff,
				type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					if ( type === "first" ) { 
						return true; 
					}

					node = elem;

				case "last":
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					return true;

				case "nth":
					first = match[2];
					last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					doneName = match[0];
					parent = elem.parentNode;
	
					if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {
						count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 

						parent[ expando ] = doneName;
					}
					
					diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: function( elem, match ) {
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
		},
		
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Sizzle.attr ?
					Sizzle.attr( elem, name ) :
					Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				!type && Sizzle.attr ?
				result != null :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function( array, results ) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
	makeArray = function( array, results ) {
		var i = 0,
			ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );

		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}

			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime(),
		root = document.documentElement;

	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);

				return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
			}
		};

		Expr.filter.ID = function( elem, match ) {
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );

	// release memory in IE
	root = form = null;
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function( match, context ) {
			var results = context.getElementsByTagName( match[1] );

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";

	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {

		Expr.attrHandle.href = function( elem ) {
			return elem.getAttribute( "href", 2 );
		};
	}

	// release memory in IE
	div = null;
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle,
			div = document.createElement("div"),
			id = "__sizzle__";

		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function( query, context, extra, seed ) {
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && !Sizzle.isXML(context) ) {
				// See if we find a selector to speed up
				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
				
				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
					// Speed-up: Sizzle("TAG")
					if ( match[1] ) {
						return makeArray( context.getElementsByTagName( query ), extra );
					
					// Speed-up: Sizzle(".CLASS")
					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
						return makeArray( context.getElementsByClassName( match[2] ), extra );
					}
				}
				
				if ( context.nodeType === 9 ) {
					// Speed-up: Sizzle("body")
					// The body element only exists once, optimize finding it
					if ( query === "body" && context.body ) {
						return makeArray( [ context.body ], extra );
						
					// Speed-up: Sizzle("#ID")
					} else if ( match && match[3] ) {
						var elem = context.getElementById( match[3] );

						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						if ( elem && elem.parentNode ) {
							// Handle the case where IE and Opera return items
							// by name instead of ID
							if ( elem.id === match[3] ) {
								return makeArray( [ elem ], extra );
							}
							
						} else {
							return makeArray( [], extra );
						}
					}
					
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test( query );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( /'/g, "\\$&" );
					}
					if ( relativeHierarchySelector && hasParent ) {
						context = context.parentNode;
					}

					try {
						if ( !relativeHierarchySelector || hasParent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
						}

					} catch(pseudoError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		// release memory in IE
		div = null;
	})();
}

(function(){
	var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

	if ( matches ) {
		// Check to see if it's possible to do matchesSelector
		// on a disconnected node (IE 9 fails this)
		var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
			pseudoWorks = false;

		try {
			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( document.documentElement, "[test!='']:sizzle" );
	
		} catch( pseudoError ) {
			pseudoWorks = true;
		}

		Sizzle.matchesSelector = function( node, expr ) {
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			if ( !Sizzle.isXML( node ) ) {
				try { 
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						var ret = matches.call( node, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || !disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9, so check for that
								node.document && node.document.nodeType !== 11 ) {
							return ret;
						}
					}
				} catch(e) {}
			}

			return Sizzle(expr, null, null, [node]).length > 0;
		};
	}
})();

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function( match, context, isXML ) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	// release memory in IE
	div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem[ expando ] = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem[ expando ] = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context, seed ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet, seed );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
Sizzle.selectors.attrMap = {};
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.filters;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})();


var runtil = /Until$/,
	rparentsprev = /^(?:parents|prevUntil|prevAll)/,
	// Note: This RegExp should be improved, or likely pulled from Sizzle
	rmultiselector = /,/,
	isSimple = /^.[^:#\[\.,]*$/,
	slice = Array.prototype.slice,
	POS = jQuery.expr.match.POS,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var self = this,
			i, l;

		if ( typeof selector !== "string" ) {
			return jQuery( selector ).filter(function() {
				for ( i = 0, l = self.length; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			});
		}

		var ret = this.pushStack( "", "find", selector ),
			length, n, r;

		for ( i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jQuery.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( n = length; n < ret.length; n++ ) {
					for ( r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var targets = jQuery( target );
		return this.filter(function() {
			for ( var i = 0, l = targets.length; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && ( 
			typeof selector === "string" ?
				// If this is a positional selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				POS.test( selector ) ? 
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var ret = [], i, l, cur = this[0];
		
		// Array (deprecated as of jQuery 1.7)
		if ( jQuery.isArray( selectors ) ) {
			var level = 1;

			while ( cur && cur.ownerDocument && cur !== context ) {
				for ( i = 0; i < selectors.length; i++ ) {

					if ( jQuery( cur ).is( selectors[ i ] ) ) {
						ret.push({ selector: selectors[ i ], elem: cur, level: level });
					}
				}

				cur = cur.parentNode;
				level++;
			}

			return ret;
		}

		// String
		var pos = POS.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( i = 0, l = this.length; i < l; i++ ) {
			cur = this[i];

			while ( cur ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;

				} else {
					cur = cur.parentNode;
					if ( !cur || !cur.ownerDocument || cur === context || cur.nodeType === 11 ) {
						break;
					}
				}
			}
		}

		ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	andSelf: function() {
		return this.add( this.prevObject );
	}
});

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return jQuery.nth( elem, 2, "nextSibling" );
	},
	prev: function( elem ) {
		return jQuery.nth( elem, 2, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( elem.parentNode.firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.makeArray( elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, slice.call( arguments ).join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	nth: function( cur, result, dir, elem ) {
		result = result || 1;
		var num = 0;

		for ( ; cur; cur = cur[dir] ) {
			if ( cur.nodeType === 1 && ++num === result ) {
				break;
			}
		}

		return cur;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem, i ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem, i ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}




function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
	safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style)/i,
	rnocache = /<(?:script|object|embed|option|style)/i,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")", "i"),
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /\/(java|ecma)script/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/,
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	},
	safeFragment = createSafeFragment( document );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE can't serialize <link> and <script> tags normally
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "div<div>", "</div>" ];
}

jQuery.fn.extend({
	text: function( text ) {
		if ( jQuery.isFunction(text) ) {
			return this.each(function(i) {
				var self = jQuery( this );

				self.text( text.call(this, i, self.text()) );
			});
		}

		if ( typeof text !== "object" && text !== undefined ) {
			return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );
		}

		return jQuery.text( this );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		} else if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			set.push.apply( set, this.toArray() );
			return this.pushStack( set, "before", arguments );
		}
	},

	after: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		} else if ( arguments.length ) {
			var set = this.pushStack( this, "after", arguments );
			set.push.apply( set, jQuery.clean(arguments) );
			return set;
		}
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( elem.getElementsByTagName("*") );
					jQuery.cleanData( [ elem ] );
				}

				if ( elem.parentNode ) {
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( elem.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		if ( value === undefined ) {
			return this[0] && this[0].nodeType === 1 ?
				this[0].innerHTML.replace(rinlinejQuery, "") :
				null;

		// See if we can take a shortcut and just use innerHTML
		} else if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
			(jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value )) &&
			!wrapMap[ (rtagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {

			value = value.replace(rxhtmlTag, "<$1></$2>");

			try {
				for ( var i = 0, l = this.length; i < l; i++ ) {
					// Remove element nodes and prevent memory leaks
					if ( this[i].nodeType === 1 ) {
						jQuery.cleanData( this[i].getElementsByTagName("*") );
						this[i].innerHTML = value;
					}
				}

			// If using innerHTML throws an exception, use the fallback method
			} catch(e) {
				this.empty().append( value );
			}

		} else if ( jQuery.isFunction( value ) ) {
			this.each(function(i){
				var self = jQuery( this );

				self.html( value.call(this, i, self.html()) );
			});

		} else {
			this.empty().append( value );
		}

		return this;
	},

	replaceWith: function( value ) {
		if ( this[0] && this[0].parentNode ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jQuery( value ).detach();
			}

			return this.each(function() {
				var next = this.nextSibling,
					parent = this.parentNode;

				jQuery( this ).remove();

				if ( next ) {
					jQuery(next).before( value );
				} else {
					jQuery(parent).append( value );
				}
			});
		} else {
			return this.length ?
				this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
				this;
		}
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {
		var results, first, fragment, parent,
			value = args[0],
			scripts = [];

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) {
			return this.each(function() {
				jQuery(this).domManip( args, table, callback, true );
			});
		}

		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call(this, i, table ? self.html() : undefined);
				self.domManip( args, table, callback );
			});
		}

		if ( this[0] ) {
			parent = value && value.parentNode;

			// If we're in a fragment, just use that instead of building a new one
			if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
				results = { fragment: parent };

			} else {
				results = jQuery.buildFragment( args, this, scripts );
			}

			fragment = results.fragment;

			if ( fragment.childNodes.length === 1 ) {
				first = fragment = fragment.firstChild;
			} else {
				first = fragment.firstChild;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );

				for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++ ) {
					callback.call(
						table ?
							root(this[i], first) :
							this[i],
						// Make sure that we do not leak memory by inadvertently discarding
						// the original fragment (which might have attached data) instead of
						// using it; in addition, use the original fragment object for the last
						// item instead of first because it can end up being emptied incorrectly
						// in certain situations (Bug #8070).
						// Fragments from the fragment cache must always be cloned and never used
						// in place.
						results.cacheable || ( l > 1 && i < lastIndex ) ?
							jQuery.clone( fragment, true, true ) :
							fragment
					);
				}
			}

			if ( scripts.length ) {
				jQuery.each( scripts, evalScript );
			}
		}

		return this;
	}
});

function root( elem, cur ) {
	return jQuery.nodeName(elem, "table") ?
		(elem.getElementsByTagName("tbody")[0] ||
		elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
		elem;
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type + ( events[ type ][ i ].namespace ? "." : "" ) + events[ type ][ i ].namespace, events[ type ][ i ], events[ type ][ i ].data );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function cloneFixAttributes( src, dest ) {
	var nodeName;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	// clearAttributes removes the attributes, which we don't want,
	// but also removes the attachEvent events, which we *do* want
	if ( dest.clearAttributes ) {
		dest.clearAttributes();
	}

	// mergeAttributes, in contrast, only merges back on the
	// original attributes, not the events
	if ( dest.mergeAttributes ) {
		dest.mergeAttributes( src );
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 fail to clone children inside object elements that use
	// the proprietary classid attribute value (rather than the type
	// attribute) to identify the type of content to display
	if ( nodeName === "object" ) {
		dest.outerHTML = src.outerHTML;

	} else if ( nodeName === "input" && (src.type === "checkbox" || src.type === "radio") ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set
		if ( src.checked ) {
			dest.defaultChecked = dest.checked = src.checked;
		}

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}

	// Event data gets referenced instead of copied if the expando
	// gets copied too
	dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, nodes, scripts ) {
	var fragment, cacheable, cacheresults, doc,
	first = args[ 0 ];

	// nodes may contain either an explicit document object,
	// a jQuery collection or context object.
	// If nodes[0] contains a valid object to assign to doc
	if ( nodes && nodes[0] ) {
		doc = nodes[0].ownerDocument || nodes[0];
	}

	// Ensure that an attr object doesn't incorrectly stand in as a document object
	// Chrome and Firefox seem to allow this to occur and will throw exception
	// Fixes #8950
	if ( !doc.createDocumentFragment ) {
		doc = document;
	}

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	// Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
	if ( args.length === 1 && typeof first === "string" && first.length < 512 && doc === document &&
		first.charAt(0) === "<" && !rnocache.test( first ) &&
		(jQuery.support.checkClone || !rchecked.test( first )) &&
		(jQuery.support.html5Clone || !rnoshimcache.test( first )) ) {

		cacheable = true;

		cacheresults = jQuery.fragments[ first ];
		if ( cacheresults && cacheresults !== 1 ) {
			fragment = cacheresults;
		}
	}

	if ( !fragment ) {
		fragment = doc.createDocumentFragment();
		jQuery.clean( args, doc, fragment, scripts );
	}

	if ( cacheable ) {
		jQuery.fragments[ first ] = cacheresults ? fragment : 1;
	}

	return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var ret = [],
			insert = jQuery( selector ),
			parent = this.length === 1 && this[0].parentNode;

		if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
			insert[ original ]( this[0] );
			return this;

		} else {
			for ( var i = 0, l = insert.length; i < l; i++ ) {
				var elems = ( i > 0 ? this.clone(true) : this ).get();
				jQuery( insert[i] )[ original ]( elems );
				ret = ret.concat( elems );
			}

			return this.pushStack( ret, name, insert.selector );
		}
	};
});

function getAll( elem ) {
	if ( typeof elem.getElementsByTagName !== "undefined" ) {
		return elem.getElementsByTagName( "*" );

	} else if ( typeof elem.querySelectorAll !== "undefined" ) {
		return elem.querySelectorAll( "*" );

	} else {
		return [];
	}
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( elem.type === "checkbox" || elem.type === "radio" ) {
		elem.defaultChecked = elem.checked;
	}
}
// Finds all inputs and passes them to fixDefaultChecked
function findInputs( elem ) {
	var nodeName = ( elem.nodeName || "" ).toLowerCase();
	if ( nodeName === "input" ) {
		fixDefaultChecked( elem );
	// Skip scripts, get other children
	} else if ( nodeName !== "script" && typeof elem.getElementsByTagName !== "undefined" ) {
		jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
	}
}

// Derived From: http://www.iecss.com/shimprove/javascript/shimprove.1-0-1.js
function shimCloneNode( elem ) {
	var div = document.createElement( "div" );
	safeFragment.appendChild( div );

	div.innerHTML = elem.outerHTML;
	return div.firstChild;
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var srcElements,
			destElements,
			i,
			// IE<=8 does not properly clone detached, unknown element nodes
			clone = jQuery.support.html5Clone || !rnoshimcache.test( "<" + elem.nodeName ) ?
				elem.cloneNode( true ) :
				shimCloneNode( elem );

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

			cloneFixAttributes( elem, clone );

			// Using Sizzle here is crazy slow, so we use getElementsByTagName instead
			srcElements = getAll( elem );
			destElements = getAll( clone );

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
			for ( i = 0; srcElements[i]; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					cloneFixAttributes( srcElements[i], destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			cloneCopyEvent( elem, clone );

			if ( deepDataAndEvents ) {
				srcElements = getAll( elem );
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) {
					cloneCopyEvent( srcElements[i], destElements[i] );
				}
			}
		}

		srcElements = destElements = null;

		// Return the cloned set
		return clone;
	},

	clean: function( elems, context, fragment, scripts ) {
		var checkScriptType;

		context = context || document;

		// !context.createElement fails in IE with an error but returns typeof 'object'
		if ( typeof context.createElement === "undefined" ) {
			context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
		}

		var ret = [], j;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}

			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" ) {
				if ( !rhtml.test( elem ) ) {
					elem = context.createTextNode( elem );
				} else {
					// Fix "XHTML"-style tags in all browsers
					elem = elem.replace(rxhtmlTag, "<$1></$2>");

					// Trim whitespace, otherwise indexOf won't work as expected
					var tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase(),
						wrap = wrapMap[ tag ] || wrapMap._default,
						depth = wrap[0],
						div = context.createElement("div");

					// Append wrapper element to unknown element safe doc fragment
					if ( context === document ) {
						// Use the fragment we've already created for this document
						safeFragment.appendChild( div );
					} else {
						// Use a fragment created with the owner document
						createSafeFragment( context ).appendChild( div );
					}

					// Go to html and back, then peel off extra wrappers
					div.innerHTML = wrap[1] + elem + wrap[2];

					// Move to the right depth
					while ( depth-- ) {
						div = div.lastChild;
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						var hasBody = rtbody.test(elem),
							tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
									div.childNodes :
									[];

						for ( j = tbody.length - 1; j >= 0 ; --j ) {
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}
					}

					// IE completely kills leading whitespace when innerHTML is used
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
					}

					elem = div.childNodes;
				}
			}

			// Resets defaultChecked for any radios and checkboxes
			// about to be appended to the DOM in IE 6/7 (#8060)
			var len;
			if ( !jQuery.support.appendChecked ) {
				if ( elem[0] && typeof (len = elem.length) === "number" ) {
					for ( j = 0; j < len; j++ ) {
						findInputs( elem[j] );
					}
				} else {
					findInputs( elem );
				}
			}

			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
				ret = jQuery.merge( ret, elem );
			}
		}

		if ( fragment ) {
			checkScriptType = function( elem ) {
				return !elem.type || rscriptType.test( elem.type );
			};
			for ( i = 0; ret[i]; i++ ) {
				if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
					scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );

				} else {
					if ( ret[i].nodeType === 1 ) {
						var jsTags = jQuery.grep( ret[i].getElementsByTagName( "script" ), checkScriptType );

						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
					}
					fragment.appendChild( ret[i] );
				}
			}
		}

		return ret;
	},

	cleanData: function( elems ) {
		var data, id,
			cache = jQuery.cache,
			special = jQuery.event.special,
			deleteExpando = jQuery.support.deleteExpando;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
				continue;
			}

			id = elem[ jQuery.expando ];

			if ( id ) {
				data = cache[ id ];

				if ( data && data.events ) {
					for ( var type in data.events ) {
						if ( special[ type ] ) {
							jQuery.event.remove( elem, type );

						// This is a shortcut to avoid jQuery.event.remove's overhead
						} else {
							jQuery.removeEvent( elem, type, data.handle );
						}
					}

					// Null the DOM reference to avoid IE6/7/8 leak (#7054)
					if ( data.handle ) {
						data.handle.elem = null;
					}
				}

				if ( deleteExpando ) {
					delete elem[ jQuery.expando ];

				} else if ( elem.removeAttribute ) {
					elem.removeAttribute( jQuery.expando );
				}

				delete cache[ id ];
			}
		}
	}
});

function evalScript( i, elem ) {
	if ( elem.src ) {
		jQuery.ajax({
			url: elem.src,
			async: false,
			dataType: "script"
		});
	} else {
		jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "/*$0*/" ) );
	}

	if ( elem.parentNode ) {
		elem.parentNode.removeChild( elem );
	}
}




var ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity=([^)]*)/,
	// fixed for IE9, see #8346
	rupper = /([A-Z]|^ms)/g,
	rnumpx = /^-?\d+(?:px)?$/i,
	rnum = /^-?\d/,
	rrelNum = /^([\-+])=([\-+.\de]+)/,

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssWidth = [ "Left", "Right" ],
	cssHeight = [ "Top", "Bottom" ],
	curCSS,

	getComputedStyle,
	currentStyle;

jQuery.fn.css = function( name, value ) {
	// Setting 'undefined' is a no-op
	if ( arguments.length === 2 && value === undefined ) {
		return this;
	}

	return jQuery.access( this, name, value, true, function( elem, name, value ) {
		return value !== undefined ?
			jQuery.style( elem, name, value ) :
			jQuery.css( elem, name );
	});
};

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity", "opacity" );
					return ret === "" ? "1" : ret;

				} else {
					return elem.style.opacity;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, origName = jQuery.camelCase( name ),
			style = elem.style, hooks = jQuery.cssHooks[ origName ];

		name = jQuery.cssProps[ origName ] || origName;

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( +( ret[1] + 1) * +ret[2] ) + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value )) !== undefined ) {
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra ) {
		var ret, hooks;

		// Make sure that we're working with the right name
		name = jQuery.camelCase( name );
		hooks = jQuery.cssHooks[ name ];
		name = jQuery.cssProps[ name ] || name;

		// cssFloat needs a special treatment
		if ( name === "cssFloat" ) {
			name = "float";
		}

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks && (ret = hooks.get( elem, true, extra )) !== undefined ) {
			return ret;

		// Otherwise, if a way to get the computed value exists, use that
		} else if ( curCSS ) {
			return curCSS( elem, name );
		}
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var old = {};

		// Remember the old values, and insert the new ones
		for ( var name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}
	}
});

// DEPRECATED, Use jQuery.css() instead
jQuery.curCSS = jQuery.css;

jQuery.each(["height", "width"], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			var val;

			if ( computed ) {
				if ( elem.offsetWidth !== 0 ) {
					return getWH( elem, name, extra );
				} else {
					jQuery.swap( elem, cssShow, function() {
						val = getWH( elem, name, extra );
					});
				}

				return val;
			}
		},

		set: function( elem, value ) {
			if ( rnumpx.test( value ) ) {
				// ignore negative width and height values #1599
				value = parseFloat( value );

				if ( value >= 0 ) {
					return value + "px";
				}

			} else {
				return value;
			}
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( parseFloat( RegExp.$1 ) / 100 ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			if ( value >= 1 && jQuery.trim( filter.replace( ralpha, "" ) ) === "" ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there there is no filter style applied in a css rule, we are done
				if ( currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery(function() {
	// This hook cannot be added until DOM ready because the support test
	// for it is not run until after DOM ready
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				var ret;
				jQuery.swap( elem, { "display": "inline-block" }, function() {
					if ( computed ) {
						ret = curCSS( elem, "margin-right", "marginRight" );
					} else {
						ret = elem.style.marginRight;
					}
				});
				return ret;
			}
		};
	}
});

if ( document.defaultView && document.defaultView.getComputedStyle ) {
	getComputedStyle = function( elem, name ) {
		var ret, defaultView, computedStyle;

		name = name.replace( rupper, "-$1" ).toLowerCase();

		if ( (defaultView = elem.ownerDocument.defaultView) &&
				(computedStyle = defaultView.getComputedStyle( elem, null )) ) {
			ret = computedStyle.getPropertyValue( name );
			if ( ret === "" && !jQuery.contains( elem.ownerDocument.documentElement, elem ) ) {
				ret = jQuery.style( elem, name );
			}
		}

		return ret;
	};
}

if ( document.documentElement.currentStyle ) {
	currentStyle = function( elem, name ) {
		var left, rsLeft, uncomputed,
			ret = elem.currentStyle && elem.currentStyle[ name ],
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret === null && style && (uncomputed = style[ name ]) ) {
			ret = uncomputed;
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		if ( !rnumpx.test( ret ) && rnum.test( ret ) ) {

			// Remember the original values
			left = style.left;
			rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ( ret || 0 );
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

curCSS = getComputedStyle || currentStyle;

function getWH( elem, name, extra ) {

	// Start with offset property
	var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		which = name === "width" ? cssWidth : cssHeight,
		i = 0,
		len = which.length;

	if ( val > 0 ) {
		if ( extra !== "border" ) {
			for ( ; i < len; i++ ) {
				if ( !extra ) {
					val -= parseFloat( jQuery.css( elem, "padding" + which[ i ] ) ) || 0;
				}
				if ( extra === "margin" ) {
					val += parseFloat( jQuery.css( elem, extra + which[ i ] ) ) || 0;
				} else {
					val -= parseFloat( jQuery.css( elem, "border" + which[ i ] + "Width" ) ) || 0;
				}
			}
		}

		return val + "px";
	}

	// Fall back to computed then uncomputed css if necessary
	val = curCSS( elem, name, name );
	if ( val < 0 || val == null ) {
		val = elem.style[ name ] || 0;
	}
	// Normalize "", auto, and prepare for extra
	val = parseFloat( val ) || 0;

	// Add padding, border, margin
	if ( extra ) {
		for ( ; i < len; i++ ) {
			val += parseFloat( jQuery.css( elem, "padding" + which[ i ] ) ) || 0;
			if ( extra !== "padding" ) {
				val += parseFloat( jQuery.css( elem, "border" + which[ i ] + "Width" ) ) || 0;
			}
			if ( extra === "margin" ) {
				val += parseFloat( jQuery.css( elem, extra + which[ i ] ) ) || 0;
			}
		}
	}

	return val + "px";
}

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		var width = elem.offsetWidth,
			height = elem.offsetHeight;

		return ( width === 0 && height === 0 ) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rselectTextarea = /^(?:select|textarea)/i,
	rspacesAjax = /\s+/,
	rts = /([?&])_=[^&]*/,
	rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Document location
	ajaxLocation,

	// Document location segments
	ajaxLocParts,

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = ["*/"] + ["*"];

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		if ( jQuery.isFunction( func ) ) {
			var dataTypes = dataTypeExpression.toLowerCase().split( rspacesAjax ),
				i = 0,
				length = dataTypes.length,
				dataType,
				list,
				placeBefore;

			// For each dataType in the dataTypeExpression
			for ( ; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) {

	dataType = dataType || options.dataTypes[ 0 ];
	inspected = inspected || {};

	inspected[ dataType ] = true;

	var list = structure[ dataType ],
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters ),
		selection;

	for ( ; i < length && ( executeOnly || !selection ); i++ ) {
		selection = list[ i ]( options, originalOptions, jqXHR );
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) {
			if ( !executeOnly || inspected[ selection ] ) {
				selection = undefined;
			} else {
				options.dataTypes.unshift( selection );
				selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
		selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};
	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}
}

jQuery.fn.extend({
	load: function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );

		// Don't do a request if no elements are being requested
		} else if ( !this.length ) {
			return this;
		}

		var off = url.indexOf( " " );
		if ( off >= 0 ) {
			var selector = url.slice( off, url.length );
			url = url.slice( 0, off );
		}

		// Default to a GET request
		var type = "GET";

		// If the second parameter was provided
		if ( params ) {
			// If it's a function
			if ( jQuery.isFunction( params ) ) {
				// We assume that it's the callback
				callback = params;
				params = undefined;

			// Otherwise, build a param string
			} else if ( typeof params === "object" ) {
				params = jQuery.param( params, jQuery.ajaxSettings.traditional );
				type = "POST";
			}
		}

		var self = this;

		// Request the remote document
		jQuery.ajax({
			url: url,
			type: type,
			dataType: "html",
			data: params,
			// Complete callback (responseText is used internally)
			complete: function( jqXHR, status, responseText ) {
				// Store the response as specified by the jqXHR object
				responseText = jqXHR.responseText;
				// If successful, inject the HTML into all the matched elements
				if ( jqXHR.isResolved() ) {
					// #4825: Get the actual response in case
					// a dataFilter is present in ajaxSettings
					jqXHR.done(function( r ) {
						responseText = r;
					});
					// See if a selector was specified
					self.html( selector ?
						// Create a dummy div to hold the results
						jQuery("<div>")
							// inject the contents of the document in, removing the scripts
							// to avoid any 'Permission Denied' errors in IE
							.append(responseText.replace(rscript, ""))

							// Locate the specified elements
							.find(selector) :

						// If not, just inject the full result
						responseText );
				}

				if ( callback ) {
					self.each( callback, [ responseText, status, jqXHR ] );
				}
			}
		});

		return this;
	},

	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},

	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray( this.elements ) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				( this.checked || rselectTextarea.test( this.nodeName ) ||
					rinput.test( this.type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val, i ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jQuery.fn[ o ] = function( f ){
		return this.on( o, f );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
});

jQuery.extend({

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		if ( settings ) {
			// Building a settings object
			ajaxExtend( target, jQuery.ajaxSettings );
		} else {
			// Extending ajaxSettings
			settings = target;
			target = jQuery.ajaxSettings;
		}
		ajaxExtend( target, settings );
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		traditional: false,
		headers: {},
		*/

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			text: "text/plain",
			json: "application/json, text/javascript",
			"*": allTypes
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// List of data converters
		// 1) key format is "source_type destination_type" (a single space in-between)
		// 2) the catchall symbol "*" can be used for source_type
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			context: true,
			url: true
		}
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// ifModified key
			ifModifiedKey,
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// The jqXHR state
			state = 0,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						var lname = name.toLowerCase();
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || "abort";
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, nativeStatusText, responses, headers ) {

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			var isSuccess,
				success,
				error,
				statusText = nativeStatusText,
				response = responses ? ajaxHandleResponses( s, jqXHR, responses ) : undefined,
				lastModified,
				etag;

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					if ( ( lastModified = jqXHR.getResponseHeader( "Last-Modified" ) ) ) {
						jQuery.lastModified[ ifModifiedKey ] = lastModified;
					}
					if ( ( etag = jqXHR.getResponseHeader( "Etag" ) ) ) {
						jQuery.etag[ ifModifiedKey ] = etag;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					try {
						success = ajaxConvert( s, response );
						statusText = "success";
						isSuccess = true;
					} catch(e) {
						// We have a parsererror
						statusText = "parsererror";
						error = e;
					}
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = "" + ( nativeStatusText || statusText );

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.add;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for ( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.then( tmp, tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax );

		// Determine if a cross-domain request is in order
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefiler, stop there
		if ( state === 2 ) {
			return false;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already
				jqXHR.abort();
				return false;

		}

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		return jqXHR;
	},

	// Serialize an array of form elements or a set of
	// key/values into a query string
	param: function( a, traditional ) {
		var s = [],
			add = function( key, value ) {
				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : value;
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			});

		} else {
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( var prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	}
});

function buildParams( prefix, obj, traditional, add ) {
	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && obj != null && typeof obj === "object" ) {
		// Serialize object item.
		for ( var name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// This is still on the jQuery object... for now
// Want to move this to jQuery.ajax some day
jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields,
		ct,
		type,
		finalDataType,
		firstDataType;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	var dataTypes = s.dataTypes,
		converters = {},
		i,
		key,
		length = dataTypes.length,
		tmp,
		// Current and previous dataTypes
		current = dataTypes[ 0 ],
		prev,
		// Conversion expression
		conversion,
		// Conversion function
		conv,
		// Conversion functions (transitive conversion)
		conv1,
		conv2;

	// For each dataType in the chain
	for ( i = 1; i < length; i++ ) {

		// Create converters map
		// with lowercased keys
		if ( i === 1 ) {
			for ( key in s.converters ) {
				if ( typeof key === "string" ) {
					converters[ key.toLowerCase() ] = s.converters[ key ];
				}
			}
		}

		// Get the dataTypes
		prev = current;
		current = dataTypes[ i ];

		// If current is auto dataType, update it to prev
		if ( current === "*" ) {
			current = prev;
		// If no auto and dataTypes are actually different
		} else if ( prev !== "*" && prev !== current ) {

			// Get the converter
			conversion = prev + " " + current;
			conv = converters[ conversion ] || converters[ "* " + current ];

			// If there is no direct converter, search transitively
			if ( !conv ) {
				conv2 = undefined;
				for ( conv1 in converters ) {
					tmp = conv1.split( " " );
					if ( tmp[ 0 ] === prev || tmp[ 0 ] === "*" ) {
						conv2 = converters[ tmp[1] + " " + current ];
						if ( conv2 ) {
							conv1 = converters[ conv1 ];
							if ( conv1 === true ) {
								conv = conv2;
							} else if ( conv2 === true ) {
								conv = conv1;
							}
							break;
						}
					}
				}
			}
			// If we found no converter, dispatch an error
			if ( !( conv || conv2 ) ) {
				jQuery.error( "No conversion from " + conversion.replace(" "," to ") );
			}
			// If found converter is not an equivalence
			if ( conv !== true ) {
				// Convert with 1 or 2 converters accordingly
				response = conv ? conv( response ) : conv2( conv1(response) );
			}
		}
	}
	return response;
}




var jsc = jQuery.now(),
	jsre = /(\=)\?(&|$)|\?\?/i;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		return jQuery.expando + "_" + ( jsc++ );
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var inspectData = s.contentType === "application/x-www-form-urlencoded" &&
		( typeof s.data === "string" );

	if ( s.dataTypes[ 0 ] === "jsonp" ||
		s.jsonp !== false && ( jsre.test( s.url ) ||
				inspectData && jsre.test( s.data ) ) ) {

		var responseContainer,
			jsonpCallback = s.jsonpCallback =
				jQuery.isFunction( s.jsonpCallback ) ? s.jsonpCallback() : s.jsonpCallback,
			previous = window[ jsonpCallback ],
			url = s.url,
			data = s.data,
			replace = "$1" + jsonpCallback + "$2";

		if ( s.jsonp !== false ) {
			url = url.replace( jsre, replace );
			if ( s.url === url ) {
				if ( inspectData ) {
					data = data.replace( jsre, replace );
				}
				if ( s.data === data ) {
					// Add callback manually
					url += (/\?/.test( url ) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
				}
			}
		}

		s.url = url;
		s.data = data;

		// Install callback
		window[ jsonpCallback ] = function( response ) {
			responseContainer = [ response ];
		};

		// Clean-up function
		jqXHR.always(function() {
			// Set callback back to previous value
			window[ jsonpCallback ] = previous;
			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( previous ) ) {
				window[ jsonpCallback ]( responseContainer[ 0 ] );
			}
		});

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( jsonpCallback + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Delegate to script
		return "script";
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
});




var // #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject ? function() {
		// Abort all pending requests
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( 0, 1 );
		}
	} : false,
	xhrId = 0,
	xhrCallbacks;

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
(function( xhr ) {
	jQuery.extend( jQuery.support, {
		ajax: !!xhr,
		cors: !!xhr && ( "withCredentials" in xhr )
	});
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var xhr = s.xhr(),
						handle,
						i;

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( _ ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {

						var status,
							statusText,
							responseHeaders,
							responses,
							xml;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occured
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();
									responses = {};
									xml = xhr.responseXML;

									// Construct response list
									if ( xml && xml.documentElement /* #4958 */ ) {
										responses.xml = xml;
									}
									responses.text = xhr.responseText;

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					// if we're in sync mode or it's in cache
					// and has been retrieved directly (IE6 & IE7)
					// we need to manually fire the callback
					if ( !s.async || xhr.readyState === 4 ) {
						callback();
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback(0,1);
					}
				}
			};
		}
	});
}




var elemdisplay = {},
	iframe, iframeDoc,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
	timerId,
	fxAttrs = [
		// height animations
		[ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
		// width animations
		[ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
		// opacity animations
		[ "opacity" ]
	],
	fxNow;

jQuery.fn.extend({
	show: function( speed, easing, callback ) {
		var elem, display;

		if ( speed || speed === 0 ) {
			return this.animate( genFx("show", 3), speed, easing, callback );

		} else {
			for ( var i = 0, j = this.length; i < j; i++ ) {
				elem = this[ i ];

				if ( elem.style ) {
					display = elem.style.display;

					// Reset the inline display of this element to learn if it is
					// being hidden by cascaded rules or not
					if ( !jQuery._data(elem, "olddisplay") && display === "none" ) {
						display = elem.style.display = "";
					}

					// Set elements which have been overridden with display: none
					// in a stylesheet to whatever the default browser style is
					// for such an element
					if ( display === "" && jQuery.css(elem, "display") === "none" ) {
						jQuery._data( elem, "olddisplay", defaultDisplay(elem.nodeName) );
					}
				}
			}

			// Set the display of most of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				elem = this[ i ];

				if ( elem.style ) {
					display = elem.style.display;

					if ( display === "" || display === "none" ) {
						elem.style.display = jQuery._data( elem, "olddisplay" ) || "";
					}
				}
			}

			return this;
		}
	},

	hide: function( speed, easing, callback ) {
		if ( speed || speed === 0 ) {
			return this.animate( genFx("hide", 3), speed, easing, callback);

		} else {
			var elem, display,
				i = 0,
				j = this.length;

			for ( ; i < j; i++ ) {
				elem = this[i];
				if ( elem.style ) {
					display = jQuery.css( elem, "display" );

					if ( display !== "none" && !jQuery._data( elem, "olddisplay" ) ) {
						jQuery._data( elem, "olddisplay", display );
					}
				}
			}

			// Set the display of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				if ( this[i].style ) {
					this[i].style.display = "none";
				}
			}

			return this;
		}
	},

	// Save the old toggle function
	_toggle: jQuery.fn.toggle,

	toggle: function( fn, fn2, callback ) {
		var bool = typeof fn === "boolean";

		if ( jQuery.isFunction(fn) && jQuery.isFunction(fn2) ) {
			this._toggle.apply( this, arguments );

		} else if ( fn == null || bool ) {
			this.each(function() {
				var state = bool ? fn : jQuery(this).is(":hidden");
				jQuery(this)[ state ? "show" : "hide" ]();
			});

		} else {
			this.animate(genFx("toggle", 3), fn, fn2, callback);
		}

		return this;
	},

	fadeTo: function( speed, to, easing, callback ) {
		return this.filter(":hidden").css("opacity", 0).show().end()
					.animate({opacity: to}, speed, easing, callback);
	},

	animate: function( prop, speed, easing, callback ) {
		var optall = jQuery.speed( speed, easing, callback );

		if ( jQuery.isEmptyObject( prop ) ) {
			return this.each( optall.complete, [ false ] );
		}

		// Do not change referenced properties as per-property easing will be lost
		prop = jQuery.extend( {}, prop );

		function doAnimation() {
			// XXX 'this' does not always have a nodeName when running the
			// test suite

			if ( optall.queue === false ) {
				jQuery._mark( this );
			}

			var opt = jQuery.extend( {}, optall ),
				isElement = this.nodeType === 1,
				hidden = isElement && jQuery(this).is(":hidden"),
				name, val, p, e,
				parts, start, end, unit,
				method;

			// will store per property easing and be used to determine when an animation is complete
			opt.animatedProperties = {};

			for ( p in prop ) {

				// property name normalization
				name = jQuery.camelCase( p );
				if ( p !== name ) {
					prop[ name ] = prop[ p ];
					delete prop[ p ];
				}

				val = prop[ name ];

				// easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
				if ( jQuery.isArray( val ) ) {
					opt.animatedProperties[ name ] = val[ 1 ];
					val = prop[ name ] = val[ 0 ];
				} else {
					opt.animatedProperties[ name ] = opt.specialEasing && opt.specialEasing[ name ] || opt.easing || 'swing';
				}

				if ( val === "hide" && hidden || val === "show" && !hidden ) {
					return opt.complete.call( this );
				}

				if ( isElement && ( name === "height" || name === "width" ) ) {
					// Make sure that nothing sneaks out
					// Record all 3 overflow attributes because IE does not
					// change the overflow attribute when overflowX and
					// overflowY are set to the same value
					opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];

					// Set display property to inline-block for height/width
					// animations on inline elements that are having width/height animated
					if ( jQuery.css( this, "display" ) === "inline" &&
							jQuery.css( this, "float" ) === "none" ) {

						// inline-level elements accept inline-block;
						// block-level elements need to be inline with layout
						if ( !jQuery.support.inlineBlockNeedsLayout || defaultDisplay( this.nodeName ) === "inline" ) {
							this.style.display = "inline-block";

						} else {
							this.style.zoom = 1;
						}
					}
				}
			}

			if ( opt.overflow != null ) {
				this.style.overflow = "hidden";
			}

			for ( p in prop ) {
				e = new jQuery.fx( this, opt, p );
				val = prop[ p ];

				if ( rfxtypes.test( val ) ) {

					// Tracks whether to show or hide based on private
					// data attached to the element
					method = jQuery._data( this, "toggle" + p ) || ( val === "toggle" ? hidden ? "show" : "hide" : 0 );
					if ( method ) {
						jQuery._data( this, "toggle" + p, method === "show" ? "hide" : "show" );
						e[ method ]();
					} else {
						e[ val ]();
					}

				} else {
					parts = rfxnum.exec( val );
					start = e.cur();

					if ( parts ) {
						end = parseFloat( parts[2] );
						unit = parts[3] || ( jQuery.cssNumber[ p ] ? "" : "px" );

						// We need to compute starting value
						if ( unit !== "px" ) {
							jQuery.style( this, p, (end || 1) + unit);
							start = ( (end || 1) / e.cur() ) * start;
							jQuery.style( this, p, start + unit);
						}

						// If a +=/-= token was provided, we're doing a relative animation
						if ( parts[1] ) {
							end = ( (parts[ 1 ] === "-=" ? -1 : 1) * end ) + start;
						}

						e.custom( start, end, unit );

					} else {
						e.custom( start, val, "" );
					}
				}
			}

			// For JS strict compliance
			return true;
		}

		return optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},

	stop: function( type, clearQueue, gotoEnd ) {
		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var index,
				hadTimers = false,
				timers = jQuery.timers,
				data = jQuery._data( this );

			// clear marker counters if we know they won't be
			if ( !gotoEnd ) {
				jQuery._unmark( true, this );
			}

			function stopQueue( elem, data, index ) {
				var hooks = data[ index ];
				jQuery.removeData( elem, index, true );
				hooks.stop( gotoEnd );
			}

			if ( type == null ) {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && index.indexOf(".run") === index.length - 4 ) {
						stopQueue( this, data, index );
					}
				}
			} else if ( data[ index = type + ".run" ] && data[ index ].stop ){
				stopQueue( this, data, index );
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					if ( gotoEnd ) {

						// force the next step to be the last
						timers[ index ]( true );
					} else {
						timers[ index ].saveState();
					}
					hadTimers = true;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( !( gotoEnd && hadTimers ) ) {
				jQuery.dequeue( this, type );
			}
		});
	}

});

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout( clearFxNow, 0 );
	return ( fxNow = jQuery.now() );
}

function clearFxNow() {
	fxNow = undefined;
}

// Generate parameters to create a standard animation
function genFx( type, num ) {
	var obj = {};

	jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice( 0, num )), function() {
		obj[ this ] = type;
	});

	return obj;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx( "show", 1 ),
	slideUp: genFx( "hide", 1 ),
	slideToggle: genFx( "toggle", 1 ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.extend({
	speed: function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
			opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

		// normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}

		// Queueing
		opt.old = opt.complete;

		opt.complete = function( noUnmark ) {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			} else if ( noUnmark !== false ) {
				jQuery._unmark( this );
			}
		};

		return opt;
	},

	easing: {
		linear: function( p, n, firstNum, diff ) {
			return firstNum + diff * p;
		},
		swing: function( p, n, firstNum, diff ) {
			return ( ( -Math.cos( p*Math.PI ) / 2 ) + 0.5 ) * diff + firstNum;
		}
	},

	timers: [],

	fx: function( elem, options, prop ) {
		this.options = options;
		this.elem = elem;
		this.prop = prop;

		options.orig = options.orig || {};
	}

});

jQuery.fx.prototype = {
	// Simple function for setting a style value
	update: function() {
		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		( jQuery.fx.step[ this.prop ] || jQuery.fx.step._default )( this );
	},

	// Get the current size
	cur: function() {
		if ( this.elem[ this.prop ] != null && (!this.elem.style || this.elem.style[ this.prop ] == null) ) {
			return this.elem[ this.prop ];
		}

		var parsed,
			r = jQuery.css( this.elem, this.prop );
		// Empty strings, null, undefined and "auto" are converted to 0,
		// complex values such as "rotate(1rad)" are returned as is,
		// simple values such as "10px" are parsed to Float.
		return isNaN( parsed = parseFloat( r ) ) ? !r || r === "auto" ? 0 : r : parsed;
	},

	// Start an animation from one number to another
	custom: function( from, to, unit ) {
		var self = this,
			fx = jQuery.fx;

		this.startTime = fxNow || createFxNow();
		this.end = to;
		this.now = this.start = from;
		this.pos = this.state = 0;
		this.unit = unit || this.unit || ( jQuery.cssNumber[ this.prop ] ? "" : "px" );

		function t( gotoEnd ) {
			return self.step( gotoEnd );
		}

		t.queue = this.options.queue;
		t.elem = this.elem;
		t.saveState = function() {
			if ( self.options.hide && jQuery._data( self.elem, "fxshow" + self.prop ) === undefined ) {
				jQuery._data( self.elem, "fxshow" + self.prop, self.start );
			}
		};

		if ( t() && jQuery.timers.push(t) && !timerId ) {
			timerId = setInterval( fx.tick, fx.interval );
		}
	},

	// Simple 'show' function
	show: function() {
		var dataShow = jQuery._data( this.elem, "fxshow" + this.prop );

		// Remember where we started, so that we can go back to it later
		this.options.orig[ this.prop ] = dataShow || jQuery.style( this.elem, this.prop );
		this.options.show = true;

		// Begin the animation
		// Make sure that we start at a small width/height to avoid any flash of content
		if ( dataShow !== undefined ) {
			// This show is picking up where a previous hide or show left off
			this.custom( this.cur(), dataShow );
		} else {
			this.custom( this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur() );
		}

		// Start by showing the element
		jQuery( this.elem ).show();
	},

	// Simple 'hide' function
	hide: function() {
		// Remember where we started, so that we can go back to it later
		this.options.orig[ this.prop ] = jQuery._data( this.elem, "fxshow" + this.prop ) || jQuery.style( this.elem, this.prop );
		this.options.hide = true;

		// Begin the animation
		this.custom( this.cur(), 0 );
	},

	// Each step of an animation
	step: function( gotoEnd ) {
		var p, n, complete,
			t = fxNow || createFxNow(),
			done = true,
			elem = this.elem,
			options = this.options;

		if ( gotoEnd || t >= options.duration + this.startTime ) {
			this.now = this.end;
			this.pos = this.state = 1;
			this.update();

			options.animatedProperties[ this.prop ] = true;

			for ( p in options.animatedProperties ) {
				if ( options.animatedProperties[ p ] !== true ) {
					done = false;
				}
			}

			if ( done ) {
				// Reset the overflow
				if ( options.overflow != null && !jQuery.support.shrinkWrapBlocks ) {

					jQuery.each( [ "", "X", "Y" ], function( index, value ) {
						elem.style[ "overflow" + value ] = options.overflow[ index ];
					});
				}

				// Hide the element if the "hide" operation was done
				if ( options.hide ) {
					jQuery( elem ).hide();
				}

				// Reset the properties, if the item has been hidden or shown
				if ( options.hide || options.show ) {
					for ( p in options.animatedProperties ) {
						jQuery.style( elem, p, options.orig[ p ] );
						jQuery.removeData( elem, "fxshow" + p, true );
						// Toggle data is no longer needed
						jQuery.removeData( elem, "toggle" + p, true );
					}
				}

				// Execute the complete function
				// in the event that the complete function throws an exception
				// we must ensure it won't be called twice. #5684

				complete = options.complete;
				if ( complete ) {

					options.complete = false;
					complete.call( elem );
				}
			}

			return false;

		} else {
			// classical easing cannot be used with an Infinity duration
			if ( options.duration == Infinity ) {
				this.now = t;
			} else {
				n = t - this.startTime;
				this.state = n / options.duration;

				// Perform the easing function, defaults to swing
				this.pos = jQuery.easing[ options.animatedProperties[this.prop] ]( this.state, n, 0, 1, options.duration );
				this.now = this.start + ( (this.end - this.start) * this.pos );
			}
			// Perform the next step of the animation
			this.update();
		}

		return true;
	}
};

jQuery.extend( jQuery.fx, {
	tick: function() {
		var timer,
			timers = jQuery.timers,
			i = 0;

		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];
			// Checks the timer has not already been removed
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
	},

	interval: 13,

	stop: function() {
		clearInterval( timerId );
		timerId = null;
	},

	speeds: {
		slow: 600,
		fast: 200,
		// Default speed
		_default: 400
	},

	step: {
		opacity: function( fx ) {
			jQuery.style( fx.elem, "opacity", fx.now );
		},

		_default: function( fx ) {
			if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
				fx.elem.style[ fx.prop ] = fx.now + fx.unit;
			} else {
				fx.elem[ fx.prop ] = fx.now;
			}
		}
	}
});

// Adds width/height step functions
// Do not set anything below 0
jQuery.each([ "width", "height" ], function( i, prop ) {
	jQuery.fx.step[ prop ] = function( fx ) {
		jQuery.style( fx.elem, prop, Math.max(0, fx.now) + fx.unit );
	};
});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}

// Try to restore the default display value of an element
function defaultDisplay( nodeName ) {

	if ( !elemdisplay[ nodeName ] ) {

		var body = document.body,
			elem = jQuery( "<" + nodeName + ">" ).appendTo( body ),
			display = elem.css( "display" );
		elem.remove();

		// If the simple way fails,
		// get element's real default display by attaching it to a temp iframe
		if ( display === "none" || display === "" ) {
			// No iframe to use yet, so create it
			if ( !iframe ) {
				iframe = document.createElement( "iframe" );
				iframe.frameBorder = iframe.width = iframe.height = 0;
			}

			body.appendChild( iframe );

			// Create a cacheable copy of the iframe document on first call.
			// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
			// document to it; WebKit & Firefox won't allow reusing the iframe document.
			if ( !iframeDoc || !iframe.createElement ) {
				iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
				iframeDoc.write( ( document.compatMode === "CSS1Compat" ? "<!doctype html>" : "" ) + "<html><body>" );
				iframeDoc.close();
			}

			elem = iframeDoc.createElement( nodeName );

			iframeDoc.body.appendChild( elem );

			display = jQuery.css( elem, "display" );
			body.removeChild( iframe );
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return elemdisplay[ nodeName ];
}




var rtable = /^t(?:able|d|h)$/i,
	rroot = /^(?:body|html)$/i;

if ( "getBoundingClientRect" in document.documentElement ) {
	jQuery.fn.offset = function( options ) {
		var elem = this[0], box;

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		try {
			box = elem.getBoundingClientRect();
		} catch(e) {}

		var doc = elem.ownerDocument,
			docElem = doc.documentElement;

		// Make sure we're not dealing with a disconnected DOM node
		if ( !box || !jQuery.contains( docElem, elem ) ) {
			return box ? { top: box.top, left: box.left } : { top: 0, left: 0 };
		}

		var body = doc.body,
			win = getWindow(doc),
			clientTop  = docElem.clientTop  || body.clientTop  || 0,
			clientLeft = docElem.clientLeft || body.clientLeft || 0,
			scrollTop  = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop,
			scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
			top  = box.top  + scrollTop  - clientTop,
			left = box.left + scrollLeft - clientLeft;

		return { top: top, left: left };
	};

} else {
	jQuery.fn.offset = function( options ) {
		var elem = this[0];

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		var computedStyle,
			offsetParent = elem.offsetParent,
			prevOffsetParent = elem,
			doc = elem.ownerDocument,
			docElem = doc.documentElement,
			body = doc.body,
			defaultView = doc.defaultView,
			prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
			top = elem.offsetTop,
			left = elem.offsetLeft;

		while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
			if ( jQuery.support.fixedPosition && prevComputedStyle.position === "fixed" ) {
				break;
			}

			computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
			top  -= elem.scrollTop;
			left -= elem.scrollLeft;

			if ( elem === offsetParent ) {
				top  += elem.offsetTop;
				left += elem.offsetLeft;

				if ( jQuery.support.doesNotAddBorder && !(jQuery.support.doesAddBorderForTableAndCells && rtable.test(elem.nodeName)) ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}

				prevOffsetParent = offsetParent;
				offsetParent = elem.offsetParent;
			}

			if ( jQuery.support.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
				top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
				left += parseFloat( computedStyle.borderLeftWidth ) || 0;
			}

			prevComputedStyle = computedStyle;
		}

		if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
			top  += body.offsetTop;
			left += body.offsetLeft;
		}

		if ( jQuery.support.fixedPosition && prevComputedStyle.position === "fixed" ) {
			top  += Math.max( docElem.scrollTop, body.scrollTop );
			left += Math.max( docElem.scrollLeft, body.scrollLeft );
		}

		return { top: top, left: left };
	};
}

jQuery.offset = {

	bodyOffset: function( body ) {
		var top = body.offsetTop,
			left = body.offsetLeft;

		if ( jQuery.support.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
			left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
		}

		return { top: top, left: left };
	},

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[0] ) {
			return null;
		}

		var elem = this[0],

		// Get *real* offsetParent
		offsetParent = this.offsetParent(),

		// Get correct offsets
		offset       = this.offset(),
		parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
		offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
		parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( ["Left", "Top"], function( i, name ) {
	var method = "scroll" + name;

	jQuery.fn[ method ] = function( val ) {
		var elem, win;

		if ( val === undefined ) {
			elem = this[ 0 ];

			if ( !elem ) {
				return null;
			}

			win = getWindow( elem );

			// Return the scroll offset
			return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
				jQuery.support.boxModel && win.document.documentElement[ method ] ||
					win.document.body[ method ] :
				elem[ method ];
		}

		// Set the scroll offset
		return this.each(function() {
			win = getWindow( this );

			if ( win ) {
				win.scrollTo(
					!i ? val : jQuery( win ).scrollLeft(),
					 i ? val : jQuery( win ).scrollTop()
				);

			} else {
				this[ method ] = val;
			}
		});
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}




// Create width, height, innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function( i, name ) {

	var type = name.toLowerCase();

	// innerHeight and innerWidth
	jQuery.fn[ "inner" + name ] = function() {
		var elem = this[0];
		return elem ?
			elem.style ?
			parseFloat( jQuery.css( elem, type, "padding" ) ) :
			this[ type ]() :
			null;
	};

	// outerHeight and outerWidth
	jQuery.fn[ "outer" + name ] = function( margin ) {
		var elem = this[0];
		return elem ?
			elem.style ?
			parseFloat( jQuery.css( elem, type, margin ? "margin" : "border" ) ) :
			this[ type ]() :
			null;
	};

	jQuery.fn[ type ] = function( size ) {
		// Get window width or height
		var elem = this[0];
		if ( !elem ) {
			return size == null ? null : this;
		}

		if ( jQuery.isFunction( size ) ) {
			return this.each(function( i ) {
				var self = jQuery( this );
				self[ type ]( size.call( this, i, self[ type ]() ) );
			});
		}

		if ( jQuery.isWindow( elem ) ) {
			// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
			// 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
			var docElemProp = elem.document.documentElement[ "client" + name ],
				body = elem.document.body;
			return elem.document.compatMode === "CSS1Compat" && docElemProp ||
				body && body[ "client" + name ] || docElemProp;

		// Get document width or height
		} else if ( elem.nodeType === 9 ) {
			// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
			return Math.max(
				elem.documentElement["client" + name],
				elem.body["scroll" + name], elem.documentElement["scroll" + name],
				elem.body["offset" + name], elem.documentElement["offset" + name]
			);

		// Get or set width or height on the element
		} else if ( size === undefined ) {
			var orig = jQuery.css( elem, type ),
				ret = parseFloat( orig );

			return jQuery.isNumeric( ret ) ? ret : orig;

		// Set the width or height on the element (default to pixels if value is unitless)
		} else {
			return this.css( type, typeof size === "string" ? size : size + "px" );
		}
	};

});




// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}



})( window );

module.exports = jQuery;}, "spine/index": function(exports, require, module) {module.exports = require('./lib/spine');}, "spine/lib/spine": function(exports, require, module) {(function() {
  var $, Controller, Events, Log, Model, Module, Spine, guid, isArray, isBlank, makeArray, moduleKeywords;
  var __slice = Array.prototype.slice, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Events = {
    bind: function(ev, callback) {
      var calls, evs, name, _i, _len;
      evs = ev.split(' ');
      calls = this.hasOwnProperty('_callbacks') && this._callbacks || (this._callbacks = {});
      for (_i = 0, _len = evs.length; _i < _len; _i++) {
        name = evs[_i];
        calls[name] || (calls[name] = []);
        calls[name].push(callback);
      }
      return this;
    },
    one: function(ev, callback) {
      return this.bind(ev, function() {
        this.unbind(ev, arguments.callee);
        return callback.apply(this, arguments);
      });
    },
    trigger: function() {
      var args, callback, ev, list, _i, _len, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      ev = args.shift();
      list = this.hasOwnProperty('_callbacks') && ((_ref = this._callbacks) != null ? _ref[ev] : void 0);
      if (!list) {
        return false;
      }
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        callback = list[_i];
        if (callback.apply(this, args) === false) {
          break;
        }
      }
      return true;
    },
    unbind: function(ev, callback) {
      var cb, i, list, _len, _ref;
      if (!ev) {
        this._callbacks = {};
        return this;
      }
      list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
      if (!list) {
        return this;
      }
      if (!callback) {
        delete this._callbacks[ev];
        return this;
      }
      for (i = 0, _len = list.length; i < _len; i++) {
        cb = list[i];
        if (cb === callback) {
          list = list.slice();
          list.splice(i, 1);
          this._callbacks[ev] = list;
          break;
        }
      }
      return this;
    }
  };
  Log = {
    trace: true,
    logPrefix: '(App)',
    log: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!this.trace) {
        return;
      }
      if (typeof console === 'undefined') {
        return;
      }
      if (this.logPrefix) {
        args.unshift(this.logPrefix);
      }
      console.log.apply(console, args);
      return this;
    }
  };
  moduleKeywords = ['included', 'extended'];
  Module = (function() {
    Module.include = function(obj) {
      var included, key, value;
      if (!obj) {
        throw 'include(obj) requires obj';
      }
      for (key in obj) {
        value = obj[key];
        if (__indexOf.call(moduleKeywords, key) < 0) {
          this.prototype[key] = value;
        }
      }
      included = obj.included;
      if (included) {
        included.apply(this);
      }
      return this;
    };
    Module.extend = function(obj) {
      var extended, key, value;
      if (!obj) {
        throw 'extend(obj) requires obj';
      }
      for (key in obj) {
        value = obj[key];
        if (__indexOf.call(moduleKeywords, key) < 0) {
          this[key] = value;
        }
      }
      extended = obj.extended;
      if (extended) {
        extended.apply(this);
      }
      return this;
    };
    Module.proxy = function(func) {
      return __bind(function() {
        return func.apply(this, arguments);
      }, this);
    };
    Module.prototype.proxy = function(func) {
      return __bind(function() {
        return func.apply(this, arguments);
      }, this);
    };
    function Module() {
      if (typeof this.init === "function") {
        this.init.apply(this, arguments);
      }
    }
    return Module;
  })();
  Model = (function() {
    __extends(Model, Module);
    Model.extend(Events);
    Model.records = {};
    Model.attributes = [];
    Model.configure = function() {
      var attributes, name;
      name = arguments[0], attributes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this.className = name;
      this.records = {};
      if (attributes.length) {
        this.attributes = attributes;
      }
      this.attributes && (this.attributes = makeArray(this.attributes));
      this.attributes || (this.attributes = []);
      this.unbind();
      return this;
    };
    Model.toString = function() {
      return "" + this.className + "(" + (this.attributes.join(", ")) + ")";
    };
    Model.find = function(id) {
      var record;
      record = this.records[id];
      if (!record) {
        throw 'Unknown record';
      }
      return record.clone();
    };
    Model.exists = function(id) {
      try {
        return this.find(id);
      } catch (e) {
        return false;
      }
    };
    Model.refresh = function(values, options) {
      var record, records, _i, _len;
      if (options == null) {
        options = {};
      }
      if (options.clear) {
        this.records = {};
      }
      records = this.fromJSON(values);
      if (!isArray(records)) {
        records = [records];
      }
      for (_i = 0, _len = records.length; _i < _len; _i++) {
        record = records[_i];
        record.newRecord = false;
        record.id || (record.id = guid());
        this.records[record.id] = record;
      }
      this.trigger('refresh', !options.clear && records);
      return this;
    };
    Model.select = function(callback) {
      var id, record, result;
      result = (function() {
        var _ref, _results;
        _ref = this.records;
        _results = [];
        for (id in _ref) {
          record = _ref[id];
          if (callback(record)) {
            _results.push(record);
          }
        }
        return _results;
      }).call(this);
      return this.cloneArray(result);
    };
    Model.findByAttribute = function(name, value) {
      var id, record, _ref;
      _ref = this.records;
      for (id in _ref) {
        record = _ref[id];
        if (record[name] === value) {
          return record.clone();
        }
      }
      return null;
    };
    Model.findAllByAttribute = function(name, value) {
      return this.select(function(item) {
        return item[name] === value;
      });
    };
    Model.each = function(callback) {
      var key, value, _ref, _results;
      _ref = this.records;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(callback(value.clone()));
      }
      return _results;
    };
    Model.all = function() {
      return this.cloneArray(this.recordsValues());
    };
    Model.first = function() {
      var record;
      record = this.recordsValues()[0];
      return record != null ? record.clone() : void 0;
    };
    Model.last = function() {
      var record, values;
      values = this.recordsValues();
      record = values[values.length - 1];
      return record != null ? record.clone() : void 0;
    };
    Model.count = function() {
      return this.recordsValues().length;
    };
    Model.deleteAll = function() {
      var key, value, _ref, _results;
      _ref = this.records;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(delete this.records[key]);
      }
      return _results;
    };
    Model.destroyAll = function() {
      var key, value, _ref, _results;
      _ref = this.records;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(this.records[key].destroy());
      }
      return _results;
    };
    Model.update = function(id, atts) {
      return this.find(id).updateAttributes(atts);
    };
    Model.create = function(atts) {
      var record;
      record = new this(atts);
      return record.save();
    };
    Model.destroy = function(id) {
      return this.find(id).destroy();
    };
    Model.change = function(callbackOrParams) {
      if (typeof callbackOrParams === 'function') {
        return this.bind('change', callbackOrParams);
      } else {
        return this.trigger('change', callbackOrParams);
      }
    };
    Model.fetch = function(callbackOrParams) {
      if (typeof callbackOrParams === 'function') {
        return this.bind('fetch', callbackOrParams);
      } else {
        return this.trigger('fetch', callbackOrParams);
      }
    };
    Model.toJSON = function() {
      return this.recordsValues();
    };
    Model.fromJSON = function(objects) {
      var value, _i, _len, _results;
      if (!objects) {
        return;
      }
      if (typeof objects === 'string') {
        objects = JSON.parse(objects);
      }
      if (isArray(objects)) {
        _results = [];
        for (_i = 0, _len = objects.length; _i < _len; _i++) {
          value = objects[_i];
          _results.push(new this(value));
        }
        return _results;
      } else {
        return new this(objects);
      }
    };
    Model.fromForm = function() {
      var _ref;
      return (_ref = new this).fromForm.apply(_ref, arguments);
    };
    Model.recordsValues = function() {
      var key, result, value, _ref;
      result = [];
      _ref = this.records;
      for (key in _ref) {
        value = _ref[key];
        result.push(value);
      }
      return result;
    };
    Model.cloneArray = function(array) {
      var value, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        value = array[_i];
        _results.push(value.clone());
      }
      return _results;
    };
    Model.prototype.newRecord = true;
    function Model(atts) {
      Model.__super__.constructor.apply(this, arguments);
      this.ids = [];
      if (atts) {
        this.load(atts);
      }
    }
    Model.prototype.isNew = function() {
      return this.newRecord;
    };
    Model.prototype.isValid = function() {
      return !this.validate();
    };
    Model.prototype.validate = function() {};
    Model.prototype.load = function(atts) {
      var key, value;
      for (key in atts) {
        value = atts[key];
        if (typeof this[key] === 'function') {
          this[key](value);
        } else {
          this[key] = value;
        }
      }
      return this;
    };
    Model.prototype.attributes = function() {
      var key, result, _i, _len, _ref;
      result = {};
      _ref = this.constructor.attributes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        if (key in this) {
          if (typeof this[key] === 'function') {
            result[key] = this[key]();
          } else {
            result[key] = this[key];
          }
        }
      }
      if (this.id) {
        result.id = this.id;
      }
      return result;
    };
    Model.prototype.eql = function(rec) {
      var _ref, _ref2;
      return rec && rec.constructor === this.constructor && (rec.id === this.id || (_ref = this.id, __indexOf.call(rec.ids, _ref) >= 0) || (_ref2 = rec.id, __indexOf.call(this.ids, _ref2) >= 0));
    };
    Model.prototype.save = function() {
      var error, record;
      error = this.validate();
      if (error) {
        this.trigger('error', error);
        return false;
      }
      this.trigger('beforeSave');
      record = this.newRecord ? this.create() : this.update();
      this.trigger('save');
      return record;
    };
    Model.prototype.updateAttribute = function(name, value) {
      this[name] = value;
      return this.save();
    };
    Model.prototype.updateAttributes = function(atts) {
      this.load(atts);
      return this.save();
    };
    Model.prototype.changeID = function(id) {
      var records;
      this.ids.push(this.id);
      records = this.constructor.records;
      records[id] = records[this.id];
      delete records[this.id];
      this.id = id;
      return this.save();
    };
    Model.prototype.destroy = function() {
      this.trigger('beforeDestroy');
      delete this.constructor.records[this.id];
      this.destroyed = true;
      this.trigger('destroy');
      this.trigger('change', 'destroy');
      this.unbind();
      return this;
    };
    Model.prototype.dup = function(newRecord) {
      var result;
      result = new this.constructor(this.attributes());
      if (newRecord === false) {
        result.newRecord = this.newRecord;
      } else {
        delete result.id;
      }
      return result;
    };
    Model.prototype.clone = function() {
      return Object.create(this);
    };
    Model.prototype.reload = function() {
      var original;
      if (this.newRecord) {
        return this;
      }
      original = this.constructor.find(this.id);
      this.load(original.attributes());
      return original;
    };
    Model.prototype.toJSON = function() {
      return this.attributes();
    };
    Model.prototype.toString = function() {
      return "<" + this.constructor.className + " (" + (JSON.stringify(this)) + ")>";
    };
    Model.prototype.fromForm = function(form) {
      var key, result, _i, _len, _ref;
      result = {};
      _ref = $(form).serializeArray();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        result[key.name] = key.value;
      }
      return this.load(result);
    };
    Model.prototype.exists = function() {
      return this.id && this.id in this.constructor.records;
    };
    Model.prototype.update = function() {
      var clone, records;
      this.trigger('beforeUpdate');
      records = this.constructor.records;
      records[this.id].load(this.attributes());
      clone = records[this.id].clone();
      clone.trigger('update');
      clone.trigger('change', 'update');
      return clone;
    };
    Model.prototype.create = function() {
      var clone, records;
      this.trigger('beforeCreate');
      if (!this.id) {
        this.id = guid();
      }
      this.newRecord = false;
      records = this.constructor.records;
      records[this.id] = this.dup(false);
      clone = records[this.id].clone();
      clone.trigger('create');
      clone.trigger('change', 'create');
      return clone;
    };
    Model.prototype.bind = function(events, callback) {
      var binder, unbinder;
      this.constructor.bind(events, binder = __bind(function(record) {
        if (record && this.eql(record)) {
          return callback.apply(this, arguments);
        }
      }, this));
      this.constructor.bind('unbind', unbinder = __bind(function(record) {
        if (record && this.eql(record)) {
          this.constructor.unbind(events, binder);
          return this.constructor.unbind('unbind', unbinder);
        }
      }, this));
      return binder;
    };
    Model.prototype.trigger = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      args.splice(1, 0, this);
      return (_ref = this.constructor).trigger.apply(_ref, args);
    };
    Model.prototype.unbind = function() {
      return this.trigger('unbind');
    };
    return Model;
  })();
  Controller = (function() {
    __extends(Controller, Module);
    Controller.include(Events);
    Controller.include(Log);
    Controller.prototype.eventSplitter = /^(\S+)\s*(.*)$/;
    Controller.prototype.tag = 'div';
    function Controller(options) {
      this.release = __bind(this.release, this);
      var key, value, _ref;
      this.options = options;
      _ref = this.options;
      for (key in _ref) {
        value = _ref[key];
        this[key] = value;
      }
      if (!this.el) {
        this.el = document.createElement(this.tag);
      }
      this.el = $(this.el);
      if (this.className) {
        this.el.addClass(this.className);
      }
      this.release(function() {
        return this.el.remove();
      });
      if (!this.events) {
        this.events = this.constructor.events;
      }
      if (!this.elements) {
        this.elements = this.constructor.elements;
      }
      if (this.events) {
        this.delegateEvents();
      }
      if (this.elements) {
        this.refreshElements();
      }
      Controller.__super__.constructor.apply(this, arguments);
    }
    Controller.prototype.release = function(callback) {
      if (typeof callback === 'function') {
        return this.bind('release', callback);
      } else {
        return this.trigger('release');
      }
    };
    Controller.prototype.$ = function(selector) {
      return $(selector, this.el);
    };
    Controller.prototype.delegateEvents = function() {
      var eventName, key, match, method, selector, _ref, _results;
      _ref = this.events;
      _results = [];
      for (key in _ref) {
        method = _ref[key];
        if (typeof method !== 'function') {
          method = this.proxy(this[method]);
        }
        match = key.match(this.eventSplitter);
        eventName = match[1];
        selector = match[2];
        _results.push(selector === '' ? this.el.bind(eventName, method) : this.el.delegate(selector, eventName, method));
      }
      return _results;
    };
    Controller.prototype.refreshElements = function() {
      var key, value, _ref, _results;
      _ref = this.elements;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        _results.push(this[value] = this.$(key));
      }
      return _results;
    };
    Controller.prototype.delay = function(func, timeout) {
      return setTimeout(this.proxy(func), timeout || 0);
    };
    Controller.prototype.html = function(element) {
      this.el.html(element.el || element);
      this.refreshElements();
      return this.el;
    };
    Controller.prototype.append = function() {
      var e, elements, _ref;
      elements = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      elements = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = elements.length; _i < _len; _i++) {
          e = elements[_i];
          _results.push(e.el || e);
        }
        return _results;
      })();
      (_ref = this.el).append.apply(_ref, elements);
      this.refreshElements();
      return this.el;
    };
    Controller.prototype.appendTo = function(element) {
      this.el.appendTo(element.el || element);
      this.refreshElements();
      return this.el;
    };
    Controller.prototype.prepend = function() {
      var e, elements, _ref;
      elements = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      elements = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = elements.length; _i < _len; _i++) {
          e = elements[_i];
          _results.push(e.el || e);
        }
        return _results;
      })();
      (_ref = this.el).prepend.apply(_ref, elements);
      this.refreshElements();
      return this.el;
    };
    Controller.prototype.replace = function(element) {
      var previous, _ref;
      _ref = [this.el, element.el || element], previous = _ref[0], this.el = _ref[1];
      previous.replaceWith(this.el);
      this.delegateEvents();
      this.refreshElements();
      return this.el;
    };
    return Controller;
  })();
  $ = this.jQuery || this.Zepto || function(element) {
    return element;
  };
  if (typeof Object.create !== 'function') {
    Object.create = function(o) {
      var Func;
      Func = function() {};
      Func.prototype = o;
      return new Func();
    };
  }
  isArray = function(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
  };
  isBlank = function(value) {
    var key;
    if (!value) {
      return true;
    }
    for (key in value) {
      return false;
    }
    return true;
  };
  makeArray = function(args) {
    return Array.prototype.slice.call(args, 0);
  };
  guid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r, v;
      r = Math.random() * 16 | 0;
      v = c === 'x' ? r : r & 3 | 8;
      return v.toString(16);
    }).toUpperCase();
  };
  Spine = this.Spine = {};
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine;
  }
  Spine.version = '1.0.3';
  Spine.isArray = isArray;
  Spine.isBlank = isBlank;
  Spine.$ = $;
  Spine.Events = Events;
  Spine.Log = Log;
  Spine.Module = Module;
  Spine.Controller = Controller;
  Spine.Model = Model;
  Module.extend.call(Spine, Events);
  Module.create = Module.sub = Controller.create = Controller.sub = Model.sub = function(instances, statics) {
    var result;
    result = (function() {
      __extends(result, this);
      function result() {
        result.__super__.constructor.apply(this, arguments);
      }
      return result;
    }).call(this);
    if (instances) {
      result.include(instances);
    }
    if (statics) {
      result.extend(statics);
    }
    if (typeof result.unbind === "function") {
      result.unbind();
    }
    return result;
  };
  Model.setup = function(name, attributes) {
    var Instance;
    if (attributes == null) {
      attributes = [];
    }
    Instance = (function() {
      __extends(Instance, this);
      function Instance() {
        Instance.__super__.constructor.apply(this, arguments);
      }
      return Instance;
    }).call(this);
    Instance.configure.apply(Instance, [name].concat(__slice.call(attributes)));
    return Instance;
  };
  Module.init = Controller.init = Model.init = function(a1, a2, a3, a4, a5) {
    return new this(a1, a2, a3, a4, a5);
  };
  Spine.Class = Module;
}).call(this);
}, "spine/lib/local": function(exports, require, module) {(function() {
  if (typeof Spine === "undefined" || Spine === null) {
    Spine = require('spine');
  }
  Spine.Model.Local = {
    extended: function() {
      this.change(this.saveLocal);
      return this.fetch(this.loadLocal);
    },
    saveLocal: function() {
      var result;
      result = JSON.stringify(this);
      return localStorage[this.className] = result;
    },
    loadLocal: function() {
      var result;
      result = localStorage[this.className];
      return this.refresh(result || [], {
        clear: true
      });
    }
  };
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.Model.Local;
  }
}).call(this);
}, "spine/lib/ajax": function(exports, require, module) {(function() {
  var $, Ajax, Base, Collection, Extend, Include, Model, Singleton;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  if (typeof Spine === "undefined" || Spine === null) {
    Spine = require('spine');
  }
  $ = Spine.$;
  Model = Spine.Model;
  Ajax = {
    getURL: function(object) {
      return object && (typeof object.url === "function" ? object.url() : void 0) || object.url;
    },
    enabled: true,
    pending: false,
    requests: [],
    disable: function(callback) {
      this.enabled = false;
      callback();
      return this.enabled = true;
    },
    requestNext: function() {
      var next;
      next = this.requests.shift();
      if (next) {
        return this.request(next);
      } else {
        return this.pending = false;
      }
    },
    request: function(callback) {
      return (callback()).complete(__bind(function() {
        return this.requestNext();
      }, this));
    },
    queue: function(callback) {
      if (!this.enabled) {
        return;
      }
      if (this.pending) {
        this.requests.push(callback);
      } else {
        this.pending = true;
        this.request(callback);
      }
      return callback;
    }
  };
  Base = (function() {
    function Base() {}
    Base.prototype.defaults = {
      contentType: 'application/json',
      dataType: 'json',
      processData: false,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    };
    Base.prototype.ajax = function(params, defaults) {
      return $.ajax($.extend({}, this.defaults, defaults, params));
    };
    Base.prototype.queue = function(callback) {
      return Ajax.queue(callback);
    };
    return Base;
  })();
  Collection = (function() {
    __extends(Collection, Base);
    function Collection(model) {
      this.model = model;
      this.errorResponse = __bind(this.errorResponse, this);
      this.recordsResponse = __bind(this.recordsResponse, this);
    }
    Collection.prototype.find = function(id, params) {
      var record;
      record = new this.model({
        id: id
      });
      return this.ajax(params, {
        type: 'GET',
        url: Ajax.getURL(record)
      }).success(this.recordsResponse).error(this.errorResponse);
    };
    Collection.prototype.all = function(params) {
      return this.ajax(params, {
        type: 'GET',
        url: Ajax.getURL(this.model)
      }).success(this.recordsResponse).error(this.errorResponse);
    };
    Collection.prototype.fetch = function(params) {
      var id;
      if (params == null) {
        params = {};
      }
      if (id = params.id) {
        delete params.id;
        return this.find(id, params).success(__bind(function(record) {
          return this.model.refresh(record);
        }, this));
      } else {
        return this.all(params).success(__bind(function(records) {
          return this.model.refresh(records);
        }, this));
      }
    };
    Collection.prototype.recordsResponse = function(data, status, xhr) {
      return this.model.trigger('ajaxSuccess', null, status, xhr);
    };
    Collection.prototype.errorResponse = function(xhr, statusText, error) {
      return this.model.trigger('ajaxError', null, xhr, statusText, error);
    };
    return Collection;
  })();
  Singleton = (function() {
    __extends(Singleton, Base);
    function Singleton(record) {
      this.record = record;
      this.errorResponse = __bind(this.errorResponse, this);
      this.blankResponse = __bind(this.blankResponse, this);
      this.recordResponse = __bind(this.recordResponse, this);
      this.model = this.record.constructor;
    }
    Singleton.prototype.reload = function(params) {
      return this.queue(__bind(function() {
        return this.ajax(params, {
          type: 'GET',
          url: Ajax.getURL(this.record)
        }).success(this.recordResponse).error(this.errorResponse);
      }, this));
    };
    Singleton.prototype.create = function(params) {
      return this.queue(__bind(function() {
        return this.ajax(params, {
          type: 'POST',
          data: JSON.stringify(this.record),
          url: Ajax.getURL(this.model)
        }).success(this.recordResponse).error(this.errorResponse);
      }, this));
    };
    Singleton.prototype.update = function(params) {
      return this.queue(__bind(function() {
        return this.ajax(params, {
          type: 'PUT',
          data: JSON.stringify(this.record),
          url: Ajax.getURL(this.record)
        }).success(this.recordResponse).error(this.errorResponse);
      }, this));
    };
    Singleton.prototype.destroy = function(params) {
      return this.queue(__bind(function() {
        return this.ajax(params, {
          type: 'DELETE',
          url: Ajax.getURL(this.record)
        }).success(this.recordResponse).error(this.errorResponse);
      }, this));
    };
    Singleton.prototype.recordResponse = function(data, status, xhr) {
      this.record.trigger('ajaxSuccess', status, xhr);
      if (Spine.isBlank(data)) {
        return;
      }
      data = this.model.fromJSON(data);
      return Ajax.disable(__bind(function() {
        if (data.id && this.record.id !== data.id) {
          this.record.changeID(data.id);
        }
        return this.record.updateAttributes(data.attributes());
      }, this));
    };
    Singleton.prototype.blankResponse = function(data, status, xhr) {
      return this.record.trigger('ajaxSuccess', status, xhr);
    };
    Singleton.prototype.errorResponse = function(xhr, statusText, error) {
      return this.record.trigger('ajaxError', xhr, statusText, error);
    };
    return Singleton;
  })();
  Model.host = '';
  Include = {
    ajax: function() {
      return new Singleton(this);
    },
    url: function() {
      var base;
      base = Ajax.getURL(this.constructor);
      if (base.charAt(base.length - 1) !== '/') {
        base += '/';
      }
      base += encodeURIComponent(this.id);
      return base;
    }
  };
  Extend = {
    ajax: function() {
      return new Collection(this);
    },
    url: function() {
      return "" + Model.host + "/" + (this.className.toLowerCase()) + "s";
    }
  };
  Model.Ajax = {
    extended: function() {
      this.fetch(this.ajaxFetch);
      this.change(this.ajaxChange);
      this.extend(Extend);
      return this.include(Include);
    },
    ajaxFetch: function() {
      var _ref;
      return (_ref = this.ajax()).fetch.apply(_ref, arguments);
    },
    ajaxChange: function(record, type) {
      return record.ajax()[type]();
    }
  };
  Model.Ajax.Methods = {
    extended: function() {
      this.extend(Extend);
      return this.include(Include);
    }
  };
  Spine.Ajax = Ajax;
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Ajax;
  }
}).call(this);
}, "spine/lib/route": function(exports, require, module) {(function() {
  var $, escapeRegExp, hashStrip, namedParam, splatParam;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __slice = Array.prototype.slice;
  if (typeof Spine === "undefined" || Spine === null) {
    Spine = require('spine');
  }
  $ = Spine.$;
  hashStrip = /^#*/;
  namedParam = /:([\w\d]+)/g;
  splatParam = /\*([\w\d]+)/g;
  escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;
  Spine.Route = (function() {
    __extends(Route, Spine.Module);
    Route.extend(Spine.Events);
    Route.historySupport = "history" in window;
    Route.routes = [];
    Route.options = {
      trigger: true,
      history: false,
      shim: false
    };
    Route.add = function(path, callback) {
      var key, value, _results;
      if (typeof path === "object" && !(path instanceof RegExp)) {
        _results = [];
        for (key in path) {
          value = path[key];
          _results.push(this.add(key, value));
        }
        return _results;
      } else {
        return this.routes.push(new this(path, callback));
      }
    };
    Route.setup = function(options) {
      if (options == null) {
        options = {};
      }
      this.options = $.extend({}, this.options, options);
      if (this.options.history) {
        this.history = this.historySupport && this.options.history;
      }
      if (this.options.shim) {
        return;
      }
      if (this.history) {
        $(window).bind("popstate", this.change);
      } else {
        $(window).bind("hashchange", this.change);
      }
      return this.change();
    };
    Route.unbind = function() {
      if (this.history) {
        return $(window).unbind("popstate", this.change);
      } else {
        return $(window).unbind("hashchange", this.change);
      }
    };
    Route.navigate = function() {
      var args, lastArg, options, path;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      options = {};
      lastArg = args[args.length - 1];
      if (typeof lastArg === "object") {
        options = args.pop();
      } else if (typeof lastArg === "boolean") {
        options.trigger = args.pop();
      }
      options = $.extend({}, this.options, options);
      path = args.join("/");
      if (this.path === path) {
        return;
      }
      this.path = path;
      if (options.trigger) {
        this.matchRoute(this.path, options);
      }
      if (options.shim) {
        return;
      }
      if (this.history) {
        return history.pushState({}, document.title, this.getHost() + this.path);
      } else {
        return window.location.hash = this.path;
      }
    };
    Route.getPath = function() {
      return window.location.pathname;
    };
    Route.getHash = function() {
      return window.location.hash;
    };
    Route.getFragment = function() {
      return this.getHash().replace(hashStrip, "");
    };
    Route.getHost = function() {
      return (document.location + "").replace(this.getPath() + this.getHash(), "");
    };
    Route.change = function() {
      var path;
      path = this.history ? this.getPath() : this.getFragment();
      if (path === this.path) {
        return;
      }
      this.path = path;
      return this.matchRoute(this.path);
    };
    Route.matchRoute = function(path, options) {
      var route, _i, _len, _ref;
      _ref = this.routes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        route = _ref[_i];
        if (route.match(path, options)) {
          this.trigger("change", route, path);
          return route;
        }
      }
    };
    function Route(path, callback) {
      var match;
      this.path = path;
      this.callback = callback;
      this.names = [];
      if (typeof path === "string") {
        while ((match = namedParam.exec(path)) !== null) {
          this.names.push(match[1]);
        }
        path = path.replace(escapeRegExp, "\\$&").replace(namedParam, "([^\/]*)").replace(splatParam, "(.*?)");
        this.route = new RegExp('^' + path + '$');
      } else {
        this.route = path;
      }
    }
    Route.prototype.match = function(path, options) {
      var i, match, param, params, _len;
      if (options == null) {
        options = {};
      }
      match = this.route.exec(path);
      if (!match) {
        return false;
      }
      options.match = match;
      params = match.slice(1);
      if (this.names.length) {
        for (i = 0, _len = params.length; i < _len; i++) {
          param = params[i];
          options[this.names[i]] = param;
        }
      }
      return this.callback.call(null, options) !== false;
    };
    return Route;
  })();
  Spine.Route.change = Spine.Route.proxy(Spine.Route.change);
  Spine.Controller.include({
    route: function(path, callback) {
      return Spine.Route.add(path, this.proxy(callback));
    },
    routes: function(routes) {
      var key, value, _results;
      _results = [];
      for (key in routes) {
        value = routes[key];
        _results.push(this.route(key, value));
      }
      return _results;
    },
    navigate: function() {
      return Spine.Route.navigate.apply(Spine.Route, arguments);
    }
  });
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.Route;
  }
}).call(this);
}, "spine/lib/tmpl": function(exports, require, module) {(function() {
  var $;
  $ = typeof jQuery !== "undefined" && jQuery !== null ? jQuery : require("jqueryify");
  $.fn.item = function() {
    var item;
    item = $(this);
    item = item.data("item") || (typeof item.tmplItem === "function" ? item.tmplItem().data : void 0);
    return item != null ? typeof item.reload === "function" ? item.reload() : void 0 : void 0;
  };
  $.fn.forItem = function(item) {
    return this.filter(function() {
      var compare;
      compare = $(this).item();
      return (typeof item.eql === "function" ? item.eql(compare) : void 0) || item === compare;
    });
  };
}).call(this);
}, "spine/lib/list": function(exports, require, module) {(function() {
  var $;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  if (typeof Spine === "undefined" || Spine === null) {
    Spine = require('spine');
  }
  $ = Spine.$;
  Spine.List = (function() {
    __extends(List, Spine.Controller);
    List.prototype.events = {
      'click .item': 'click'
    };
    List.prototype.selectFirst = false;
    function List() {
      this.change = __bind(this.change, this);      List.__super__.constructor.apply(this, arguments);
      this.bind('change', this.change);
    }
    List.prototype.template = function() {
      return arguments[0];
    };
    List.prototype.change = function(item) {
      if (!item) {
        return;
      }
      this.current = item;
      this.children().removeClass('active');
      return this.children().forItem(this.current).addClass('active');
    };
    List.prototype.render = function(items) {
      if (items) {
        this.items = items;
      }
      this.html(this.template(this.items));
      this.change(this.current);
      if (this.selectFirst) {
        if (!this.children('.active').length) {
          return this.children(':first').click();
        }
      }
    };
    List.prototype.children = function(sel) {
      return this.el.children(sel);
    };
    List.prototype.click = function(e) {
      var item;
      item = $(e.currentTarget).item();
      this.trigger('change', item);
      return false;
    };
    return List;
  })();
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.List;
  }
}).call(this);
}, "spine/lib/manager": function(exports, require, module) {(function() {
  var $;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  if (typeof Spine === "undefined" || Spine === null) {
    Spine = require('spine');
  }
  $ = Spine.$;
  Spine.Manager = (function() {
    __extends(Manager, Spine.Module);
    Manager.include(Spine.Events);
    function Manager() {
      this.controllers = [];
      this.bind('change', this.change);
      this.add.apply(this, arguments);
    }
    Manager.prototype.add = function() {
      var cont, controllers, _i, _len, _results;
      controllers = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = controllers.length; _i < _len; _i++) {
        cont = controllers[_i];
        _results.push(this.addOne(cont));
      }
      return _results;
    };
    Manager.prototype.addOne = function(controller) {
      controller.bind('active', __bind(function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.trigger.apply(this, ['change', controller].concat(__slice.call(args)));
      }, this));
      controller.bind('release', __bind(function() {
        return this.controllers.splice(this.controllers.indexOf(controller), 1);
      }, this));
      return this.controllers.push(controller);
    };
    Manager.prototype.deactivate = function() {
      return this.trigger.apply(this, ['change', false].concat(__slice.call(arguments)));
    };
    Manager.prototype.change = function() {
      var args, cont, current, _i, _len, _ref, _results;
      current = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _ref = this.controllers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cont = _ref[_i];
        _results.push(cont === current ? cont.activate.apply(cont, args) : cont.deactivate.apply(cont, args));
      }
      return _results;
    };
    return Manager;
  })();
  Spine.Controller.include({
    active: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (typeof args[0] === 'function') {
        this.bind('active', args[0]);
      } else {
        args.unshift('active');
        this.trigger.apply(this, args);
      }
      return this;
    },
    isActive: function() {
      return this.el.hasClass('active');
    },
    activate: function() {
      this.el.addClass('active');
      return this;
    },
    deactivate: function() {
      this.el.removeClass('active');
      return this;
    }
  });
  Spine.Stack = (function() {
    __extends(Stack, Spine.Controller);
    Stack.prototype.controllers = {};
    Stack.prototype.routes = {};
    Stack.prototype.className = 'spine stack';
    function Stack() {
      var key, value, _fn, _ref, _ref2;
      Stack.__super__.constructor.apply(this, arguments);
      this.manager = new Spine.Manager;
      _ref = this.controllers;
      for (key in _ref) {
        value = _ref[key];
        this[key] = new value({
          stack: this
        });
        this.add(this[key]);
      }
      _ref2 = this.routes;
      _fn = __bind(function(key, value) {
        var callback;
        if (typeof value === 'function') {
          callback = value;
        }
        callback || (callback = __bind(function() {
          var _ref3;
          return (_ref3 = this[value]).active.apply(_ref3, arguments);
        }, this));
        return this.route(key, callback);
      }, this);
      for (key in _ref2) {
        value = _ref2[key];
        _fn(key, value);
      }
      if (this["default"]) {
        this[this["default"]].active();
      }
    }
    Stack.prototype.add = function(controller) {
      this.manager.add(controller);
      return this.append(controller);
    };
    return Stack;
  })();
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Spine.Manager;
  }
}).call(this);
}, "index": function(exports, require, module) {(function() {
  var $, App, Spine, jQuery;

  require('lib/setup');

  Spine = require('spine');

  jQuery = require("jqueryify");

  $ = jQuery;

  App = (function() {

    function App() {}

    App.prototype.go = function() {
      var Pen, pen;
      Pen = require("lib/pen/main");
      pen = new Pen($('#editor'), {
        worktime: 100
      });
      return 'joe';
    };

    return App;

  })();

  module.exports = App;

}).call(this);
}, "lib/pen/core/Cursor": function(exports, require, module) {(function() {
  var Cursor, Display;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Display = require('lib/pen/core/Display');

  Cursor = (function() {

    __extends(Cursor, Display);

    function Cursor() {
      this.restartBlink = __bind(this.restartBlink, this);
      this.onContextMenu = __bind(this.onContextMenu, this);
      this.coordsCharF = __bind(this.coordsCharF, this);
      Cursor.__super__.constructor.apply(this, arguments);
    }

    Cursor.prototype.goalColumn = null;

    Cursor.prototype.displayOffset = 0;

    Cursor.prototype.inputDiv = null;

    Cursor.prototype.input = null;

    Cursor.prototype.leaveInputAlone = null;

    Cursor.prototype.scroller = null;

    Cursor.prototype.cursor = null;

    Cursor.prototype.setCursorF = function(line, ch, user) {
      var pos;
      pos = this.clipPos({
        line: line,
        ch: ch || 0
      });
      if (user) {
        return this.setSelectionUser(pos, pos);
      } else {
        return this.setSelectionF(pos, pos);
      }
    };

    Cursor.prototype.clipLine = function(n) {
      return Math.max(0, Math.min(n, this.doc.size - 1));
    };

    Cursor.prototype.clipPos = function(pos) {
      var ch, linelen;
      if (pos.line < 0) {
        return {
          line: 0,
          ch: 0
        };
      }
      if (pos.line >= this.doc.size) {
        return {
          line: this.doc.size - 1,
          ch: this.getLine(this.doc.size - 1).text.length
        };
      }
      ch = pos.ch;
      linelen = this.getLine(pos.line).text.length;
      if (!(ch != null) || ch > linelen) {
        return {
          line: pos.line,
          ch: linelen
        };
      } else if (ch < 0) {
        return {
          line: pos.line,
          ch: 0
        };
      } else {
        return pos;
      }
    };

    Cursor.prototype.findPosH = function(dir, unit) {
      var ch, end, findNextLine, line, lineObj, moveOnce, sawWord;
      var _this = this;
      end = (this.sel.inverted ? this.sel.from : this.sel.to);
      line = end.line;
      ch = end.ch;
      lineObj = this.getLine(line);
      findNextLine = function() {
        var e, l, lo, _results;
        l = line + dir;
        e = (dir < 0 ? -1 : _this.doc.size);
        _results = [];
        while (l !== e) {
          lo = _this.getLine(l);
          if (!lo.hidden) {
            line = l;
            lineObj = lo;
            return true;
          }
          _results.push(l += dir);
        }
        return _results;
      };
      moveOnce = function(boundToLine) {
        if (ch === (dir < 0 ? 0 : lineObj.text.length)) {
          if (!boundToLine && findNextLine()) {
            ch = (dir < 0 ? lineObj.text.length : 0);
          } else {
            return false;
          }
        } else {
          ch += dir;
        }
        return true;
      };
      if (unit === "char") {
        moveOnce();
      } else if (unit === "column") {
        moveOnce(true);
      } else if (unit === "word") {
        sawWord = false;
        while (true) {
          if (!(dir < 0 ? moveOnce() : void 0)) break;
          if (this.isWordChar(lineObj.text.charAt(ch))) {
            sawWord = true;
          } else if (sawWord) {
            if (dir < 0) {
              dir = 1;
              moveOnce();
            }
            break;
          }
          if (!(dir > 0 ? moveOnce() : void 0)) break;
        }
      }
      return {
        line: line,
        ch: ch
      };
    };

    Cursor.prototype.moveHF = function(dir, unit) {
      var pos;
      pos = (dir < 0 ? this.sel.from : this.sel.to);
      if (this.shiftSelecting || this.posEq(this.sel.from, this.sel.to)) {
        pos = this.findPosH(dir, unit);
      }
      return this.setCursor(pos.line, pos.ch, true);
    };

    Cursor.prototype.deleteHF = function(dir, unit) {
      if (!this.posEq(this.sel.from, this.sel.to)) {
        this.replaceRange("", this.sel.from, this.sel.to);
      } else if (dir < 0) {
        this.replaceRange("", this.findPosH(dir, unit), this.sel.to);
      } else {
        this.replaceRange("", this.sel.from, this.findPosH(dir, unit));
      }
      return this.userSelChange = true;
    };

    Cursor.prototype.moveVF = function(dir, unit) {
      var dist, pos, target;
      dist = 0;
      pos = this.localCoords((this.sel.inverted ? this.sel.from : this.sel.to), true);
      if (this.goalColumn != null) pos.x = this.goalColumn;
      if (unit === "page") {
        dist = this.scroller.clientHeight;
      } else {
        if (unit === "line") dist = this.textHeight();
      }
      target = this.coordsCharF(pos.x, pos.y + dist * dir + 2);
      this.setCursor(target.line, target.ch, true);
      return this.goalColumn = pos.x;
    };

    Cursor.prototype.localCoords = function(pos, inLineWrap) {
      var lh, sp, x, y;
      x = void 0;
      lh = this.textHeight();
      console.log('heightAtLine');
      console.log(this.heightAtLine(this.doc, pos.line));
      console.log('end heightAtLine');
      y = lh * (this.heightAtLine(this.doc, pos.line) - (inLineWrap ? this.displayOffset : 0));
      if (pos.ch === 0) {
        x = 0;
      } else {
        sp = this.measureLine(this.getLine(pos.line), pos.ch);
        x = sp.left;
        if (this.options.lineWrapping) y += Math.max(0, sp.top);
      }
      return {
        x: x,
        y: y,
        yBot: y + lh
      };
    };

    Cursor.prototype.coordsCharF = function(x, y) {
      var cw, estX, estimated, from, fromX, getX, heightPos, innerOff, lineNo, lineObj, middle, middleX, text, th, to, toX, tw, _results;
      var _this = this;
      if (y < 0) y = 0;
      th = this.textHeight();
      cw = this.charWidth();
      heightPos = this.displayOffset + Math.floor(y / th);
      lineNo = this.lineAtHeight(this.doc, heightPos);
      if (lineNo >= this.doc.size) {
        return {
          line: this.doc.size - 1,
          ch: this.getLine(this.doc.size - 1).text.length
        };
      }
      lineObj = this.getLine(lineNo);
      text = lineObj.text;
      tw = this.options.lineWrapping;
      innerOff = (tw ? heightPos - this.heightAtLine(this.doc, lineNo) : 0);
      if (x <= 0 && innerOff === 0) {
        return {
          line: lineNo,
          ch: 0
        };
      }
      getX = function(len) {
        var off_, sp;
        sp = _this.measureLine(lineObj, len);
        if (tw) {
          off_ = Math.round(sp.top / th);
          return Math.max(0, sp.left + (off_ - innerOff) * _this.scroller.clientWidth);
        }
        return sp.left;
      };
      from = 0;
      fromX = 0;
      to = text.length;
      toX = void 0;
      estimated = Math.min(to, Math.ceil((x + innerOff * this.scroller.clientWidth * .9) / cw));
      while (true) {
        estX = getX(estimated);
        if (!(estX <= x && estimated < to)) {
          toX = estX;
          to = estimated;
          break;
        }
      }
      if (x > toX) {
        return {
          line: lineNo,
          ch: to
        };
      }
      estimated = Math.floor(to * 0.8);
      estX = getX(estimated);
      if (estX < x) {
        from = estimated;
        fromX = estX;
      }
      _results = [];
      while (true) {
        if (to - from <= 1) {
          return {
            line: lineNo,
            ch: (toX - x > x - fromX ? from : to)
          };
        }
        middle = Math.ceil((from + to) / 2);
        middleX = getX(middle);
        if (middleX > x) {
          to = middle;
          _results.push(toX = middleX);
        } else {
          from = middle;
          _results.push(fromX = middleX);
        }
      }
      return _results;
    };

    Cursor.prototype.pageCoords = function(pos) {
      var local, off_;
      local = this.localCoords(pos, true);
      off_ = this.eltOffset(this.lineSpace);
      return {
        x: off_.left + local.x,
        y: off_.top + local.y,
        yBot: off_.top + local.yBot
      };
    };

    Cursor.prototype.posFromMouse = function(e, liberal) {
      var offL, offW, x, y;
      offW = this.eltOffset(this.scroller, true);
      x = void 0;
      y = void 0;
      try {
        x = e.clientX;
        y = e.clientY;
      } catch (e) {
        return null;
      }
      if (!liberal && (x - offW.left > this.scroller.clientWidth || y - offW.top > this.scroller.clientHeight)) {
        return null;
      }
      offL = this.eltOffset(this.lineSpace, true);
      return this.coordsCharF(x - offL.left, y - offL.top);
    };

    Cursor.prototype.onContextMenu = function(e) {
      var mouseup, oldCSS, pos, rehide, val;
      var _this = this;
      pos = this.posFromMouse(e);
      if (!pos || window.opera) return;
      if (this.posEq(this.sel.from, this.sel.to) || this.posLess(pos, this.sel.from) || !this.posLess(pos, this.sel.to)) {
        this.operate(setCursor)(pos.line, pos.ch);
      }
      oldCSS = this.input.style.cssText;
      this.inputDiv.style.position = "absolute";
      this.input.style.cssText = "position: fixed; width: 30px; height: 30px; top: " + (e.clientY - 5) + "px; left: " + (e.clientX - 5) + "px; z-index: 1000; background: white; " + "border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";
      this.leaveInputAlone = true;
      val = this.input.value = this.getSelection();
      this.focusInput();
      this.input.select();
      rehide = function() {
        var newVal;
        newVal = _this.splitLines(_this.input.value).join("\n");
        if (newVal !== val) _this.operation(_this.replaceSelection)(newVal, "end");
        _this.inputDiv.style.position = "relative";
        _this.input.style.cssText = oldCSS;
        _this.leaveInputAlone = false;
        _this.resetInput(true);
        return _this.slowPoll();
      };
      if (this.gecko) {
        this.e_stop(e);
        return mouseup = this.connect(window, "mouseup", function() {
          mouseup();
          return setTimeout(rehide, 20);
        }, true);
      } else {
        return setTimeout(rehide, 50);
      }
    };

    Cursor.prototype.restartBlink = function() {
      var on_;
      var _this = this;
      clearInterval(this.blinker);
      on_ = true;
      this.cursorDiv.style.visibility = "";
      return this.blinker = setInterval(function() {
        return _this.cursorDiv.style.visibility = ((on_ = !on_) ? "" : "hidden");
      }, 650);
    };

    Cursor.prototype.editEnd = function(from, to) {
      var i, j;
      if (!to) return (from ? from.length : 0);
      if (!from) return to.length;
      i = from.length;
      j = to.length;
      while (i >= 0 && j >= 0) {
        if (from.charAt(i) !== to.charAt(j)) break;
        --i;
        --j;
      }
      return j + 1;
    };

    Cursor.prototype.indexOf = function(collection, elt) {
      var e, i;
      if (collection.indexOf) return collection.indexOf(elt);
      i = 0;
      e = collection.length;
      while (i < e) {
        if (collection[i] === elt) return i;
        ++i;
      }
      return -1;
    };

    Cursor.prototype.isWordChar = function(ch) {
      return /\w/.test(ch) || ch.toUpperCase() !== ch.toLowerCase();
    };

    Cursor.prototype.getCursor = function(start) {
      if (start == null) start = this.sel.inverted;
      return this.copyPos((start ? this.sel.from : this.sel.to));
    };

    return Cursor;

  })();

  module.exports = Cursor;

}).call(this);
}, "lib/pen/core/delayed": function(exports, require, module) {(function() {
  var Delayed;

  Delayed = (function() {

    Delayed.prototype.id = null;

    function Delayed() {}

    Delayed.prototype.set = function(ms, f) {
      clearTimeout(this.id);
      return this.id = setTimeout(f, ms);
    };

    return Delayed;

  })();

  module.exports = Delayed;

}).call(this);
}, "lib/pen/core/Display": function(exports, require, module) {(function() {
  var Display, Editor;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Editor = require('lib/pen/core/Editor');

  Display = (function() {

    __extends(Display, Editor);

    function Display() {
      this.patchDisplay = __bind(this.patchDisplay, this);
      Display.__super__.constructor.apply(this, arguments);
    }

    Display.prototype.mover = null;

    Display.prototype.code = null;

    Display.prototype.gutterDirty = null;

    Display.prototype.displayOffset = null;

    Display.prototype.lineDiv = null;

    Display.prototype.gutterDisplay = null;

    Display.prototype.lineSpace = null;

    Display.prototype.targetDocument = null;

    Display.prototype.showTo = 1;

    Display.prototype.showingFrom = 1;

    Display.prototype.updateDisplay = function(changes, suppressCallback) {
      var curNode, different, from, gutterDisplay, heightChanged, i, intact, intactLines, range, th, to, visible;
      var _this = this;
      if (!this.scroller.clientWidth) {
        this.showingFrom = this.showingTo = this.displayOffset = 0;
        return;
      }
      visible = this.visibleLines();
      if (changes !== true && changes.length === 0 && visible.from >= this.showingFrom && visible.to <= this.showingTo) {
        return;
      }
      from = Math.max(visible.from - 100, 0);
      to = Math.min(this.doc.size, visible.to + 100);
      if (this.showingFrom < from && from - this.showingFrom < 20) {
        from = this.showingFrom;
      }
      if (this.showingTo > to && this.showingTo - to < 20) {
        to = Math.min(this.doc.size, this.showingTo);
      }
      if (changes === true) {
        intact = [];
      } else {
        intact = this.computeIntact([
          {
            from: this.showingFrom,
            to: this.showingTo,
            domStart: 0
          }
        ], changes);
      }
      intactLines = 0;
      i = 0;
      while (i += 1 < intact.length) {
        range = intact[i];
        if (range.from < from) {
          range.domStart += from - range.from;
          range.from = from;
        }
        if (range.to > to) range.to = to;
        if (range.from >= range.to) {
          intact.splice(i--, 1);
        } else {
          intactLines += range.to - range.from;
        }
      }
      if (intactLines === to - from) return;
      intact.sort(function(a, b) {
        return a.domStart - b.domStart;
      });
      th = this.textHeight();
      gutterDisplay = this.gutter.style.display;
      this.lineDiv.style.display = this.gutter.style.display = "none";
      this.patchDisplay(from, to, intact);
      this.lineDiv.style.display = "";
      different = from !== this.showingFrom || to !== this.showingTo || this.lastSizeC !== this.scroller.clientHeight + th;
      if (different) this.lastSizeC = this.scroller.clientHeight + th;
      this.showingFrom = from;
      this.showingTo = to;
      this.displayOffset = this.heightAtLine(this.doc, from);
      this.mover.style.top = (this.displayOffset * th) + "px";
      this.code.style.height = (this.doc.height * th + 2 * this.paddingTop()) + "px";
      if (this.options.lineWrapping) {
        this.maxWidth = this.scroller.clientWidth;
        curNode = this.lineDiv.firstChild;
        heightChanged = false;
        this.doc.iter(this.showingFrom, this.showingTo, function(line) {
          var height;
          if (!line.hidden) {
            height = Math.round(curNode.offsetHeight / th) || 1;
            if (line.height !== height) {
              _this.updateLineHeight(line, height);
              _this.gutterDirty = heightChanged = true;
            }
          }
          return curNode = curNode.nextSibling;
        });
        if (heightChanged) {
          this.code.style.height = (this.doc.height * th + 2 * this.paddingTop()) + "px";
        }
      } else {
        if (this.maxWidth == null) this.maxWidth = this.stringWidth(this.maxLine);
        if (this.maxWidth > this.scroller.clientWidth) {
          this.lineSpace.style.width = this.maxWidth + "px";
          this.code.style.width = "";
          this.code.style.width = this.scroller.scrollWidth + "px";
        } else {
          this.lineSpace.style.width = this.code.style.width = "";
        }
      }
      this.gutter.style.display = gutterDisplay;
      if (different || this.gutterDirty) this.updateGutter();
      this.updateCursor();
      if (!this.suppressCallback && this.options.onUpdate) {
        this.options.onUpdate(this);
      }
      return true;
    };

    Display.prototype.computeIntact = function(intact, changes) {
      var change, diff, i, intact2, j, l, l2, range;
      i = 0;
      l = changes.length || 0;
      while (i < l) {
        change = changes[i];
        intact2 = [];
        diff = change.diff || 0;
        j = 0;
        l2 = intact.length;
        while (j < l2) {
          range = intact[j];
          if (change.to <= range.from && change.diff) {
            intact2.push({
              from: range.from + diff,
              to: range.to + diff,
              domStart: range.domStart
            });
          } else if (!(change.to <= range.from || change.from >= range.to)) {
            if (change.from > range.from) {
              intact2.push({
                from: range.from,
                to: change.from,
                domStart: range.domStart
              });
            }
            if (change.to < range.to) {
              intact2.push({
                from: change.to + diff,
                to: range.to + diff,
                domStart: range.domStart + (change.to - range.from)
              });
            }
          }
          ++j;
        }
        intact = intact2;
        ++i;
      }
      return intact;
    };

    Display.prototype.patchDisplay = function(from, to, intact) {
      var cur, curNode, domPos, e, i, inSel, j, killNode, n, newElt, nextIntact, scratch, sfrom, sto;
      var _this = this;
      if (!intact.length) {
        this.lineDiv.innerHTML = "";
      } else {
        killNode = function(node) {
          var tmp;
          tmp = node.nextSibling;
          node.parentNode.removeChild(node);
          return tmp;
        };
        domPos = 0;
        curNode = this.lineDiv.firstChild;
        n = void 0;
        i = 0;
        while (i < intact.length) {
          cur = intact[i];
          while (cur.domStart > domPos) {
            curNode = killNode(curNode);
            domPos++;
          }
          j = 0;
          e = cur.to - cur.from;
          while (j < e) {
            curNode = curNode.nextSibling;
            domPos++;
            ++j;
          }
          ++i;
        }
        while (curNode) {
          curNode = killNode(curNode);
        }
      }
      nextIntact = intact.shift();
      curNode = this.lineDiv.firstChild;
      j = from;
      sfrom = this.sel.from.line;
      sto = this.sel.to.line;
      inSel = sfrom < from && sto >= from;
      scratch = this.targetDocument.createElement("div");
      newElt = void 0;
      return this.doc.iter(from, to, function(line) {
        var ch1, ch2;
        ch1 = null;
        ch2 = null;
        if (inSel) {
          ch1 = 0;
          if (sto === j) {
            inSel = false;
            ch2 = _this.sel.to.ch;
          }
        } else if (sfrom === j) {
          if (sto === j) {
            ch1 = _this.sel.from.ch;
            ch2 = _this.sel.to.ch;
          } else {
            inSel = true;
            ch1 = _this.sel.from.ch;
          }
        }
        if (nextIntact && nextIntact.to === j) nextIntact = intact.shift();
        if (!nextIntact || nextIntact.from > j) {
          if (line.hidden) {
            scratch.innerHTML = "<pre></pre>";
          } else {
            scratch.innerHTML = line.getHTML(ch1, ch2, true, _this.tabText);
          }
          _this.lineDiv.insertBefore(scratch.firstChild, curNode);
        } else {
          curNode = curNode.nextSibling;
        }
        return ++j;
      });
    };

    return Display;

  })();

  module.exports = Display;

}).call(this);
}, "lib/pen/core/Editor": function(exports, require, module) {(function() {
  var Editor, Selection;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Selection = require('lib/pen/text/Selection');

  Editor = (function() {

    __extends(Editor, Selection);

    function Editor() {
      this.scrollCursorIntoView = __bind(this.scrollCursorIntoView, this);
      this.scrollEditorIntoView = __bind(this.scrollEditorIntoView, this);
      this.resetInput = __bind(this.resetInput, this);
      this.readInput = __bind(this.readInput, this);
      this.fastPoll = __bind(this.fastPoll, this);
      this.slowPoll = __bind(this.slowPoll, this);
      Editor.__super__.constructor.apply(this, arguments);
    }

    Editor.prototype.pollingFast = false;

    Editor.prototype.prevInput = "";

    Editor.prototype.poll = null;

    Editor.prototype.changed = null;

    Editor.prototype.missed = null;

    Editor.prototype.overwrite = false;

    Editor.prototype.input = null;

    Editor.prototype.focused = false;

    Editor.prototype.missed = false;

    Editor.prototype.leaveInputAlone = false;

    Editor.prototype.cursor = null;

    Editor.prototype.rect = null;

    Editor.prototype.scroller = null;

    Editor.prototype.mover = null;

    Editor.prototype.targetDocument = null;

    Editor.prototype.gutter = null;

    Editor.prototype.lineSpace = null;

    Editor.prototype.gutterDirty = null;

    Editor.prototype.scrolled = false;

    Editor.prototype.slowPoll = function() {
      var _this = this;
      if (this.pollingFast) return;
      return this.poll.set(this.options.pollInterval, function() {
        _this.startOperation();
        _this.readInput();
        if (_this.focused) _this.slowPoll();
        return _this.endOperation();
      });
    };

    Editor.prototype.fastPoll = function() {
      var missed, p;
      var _this = this;
      missed = false;
      this.pollingFast = true;
      p = function() {
        var changed;
        _this.startOperation();
        changed = _this.readInput();
        if (!changed && !missed) {
          missed = true;
          _this.poll.set(60, p);
        } else {
          _this.pollingFast = false;
          _this.slowPoll();
        }
        return _this.endOperation();
      };
      return this.poll.set(20, p);
    };

    Editor.prototype.readInput = function() {
      var l, same, text;
      if (this.leaveInputAlone || !this.focused || this.hasSelection(this.input) || this.options.readOnly) {
        return false;
      }
      text = this.input.value;
      if (text === this.prevInput) return false;
      this.shiftSelecting = null;
      same = 0;
      l = Math.min(this.prevInput.length, text.length);
      while (same < l && this.prevInput[same] === text[same]) {
        ++same;
      }
      if (same < this.prevInput.length) {
        this.sel.from = {
          line: this.sel.from.line,
          ch: this.sel.from.ch - (this.prevInput.length - same)
        };
      } else if (this.overwrite && this.posEq(this.sel.from, this.sel.to)) {
        this.sel.to = {
          line: this.sel.to.line,
          ch: Math.min(this.getLine(this.sel.to.line).text.length, this.sel.to.ch + (text.length - same))
        };
      }
      this.replaceSelection(text.slice(same), "end");
      this.prevInput = text;
      return true;
    };

    Editor.prototype.resetInput = function(user) {
      if (!this.posEq(this.sel.from, this.sel.to)) {
        this.prevInput = "";
        this.input.value = this.getSelection();
        return this.input.select();
      } else {
        if (user) return this.prevInput = this.input.value = "";
      }
    };

    Editor.prototype.focusInput = function() {
      if (!this.options.readOnly) return this.input.focus(this);
    };

    Editor.prototype.scrollEditorIntoView = function() {
      var rect, winH;
      if (!this.cursor.getBoundingClientRect) return;
      rect = this.cursor.getBoundingClientRect();
      if (this.ie && rect.top === rect.bottom) return;
      winH = window.innerHeight || Math.max(document.body.offsetHeight, document.documentElement.offsetHeight);
      if (rect.top < 0 || rect.bottom > winH) return this.cursor.scrollIntoView();
    };

    Editor.prototype.scrollCursorIntoView = function() {
      var x;
      this.cursor = this.localCoords((this.sel.inverted ? this.sel.from : this.sel.to));
      x = (this.options.lineWrapping ? Math.min(this.cursor.x, this.lineSpace.offsetWidth) : this.cursor.x);
      return this.scrollIntoView(x, this.cursor.y, x, this.cursor.yBot);
    };

    Editor.prototype.scrollIntoView = function(x1, y1, x2, y2) {
      var gutterw, lh, pl, pt, result, screen, screenleft, screentop, screenw, scrolled;
      pl = this.paddingLeft();
      pt = this.paddingTop();
      lh = this.textHeight();
      y1 += pt;
      y2 += pt;
      x1 += pl;
      x2 += pl;
      screen = this.scroller.clientHeight;
      screentop = this.scroller.scrollTop;
      scrolled = false;
      result = true;
      if (y1 < screentop) {
        this.scroller.scrollTop = Math.max(0, y1 - 2 * lh);
        scrolled = true;
      } else if (y2 > screentop + screen) {
        this.scroller.scrollTop = y2 + lh - screen;
        scrolled = true;
      }
      screenw = this.scroller.clientWidth;
      screenleft = this.scroller.scrollLeft;
      gutterw = (this.options.fixedGutter ? this.gutter.clientWidth : 0);
      if (x1 < screenleft + gutterw) {
        if (x1 < 50) x1 = 0;
        this.scroller.scrollLeft = Math.max(0, x1 - 10 - gutterw);
        scrolled = true;
      } else if (x2 > screenw + screenleft - 3) {
        this.scroller.scrollLeft = x2 + 10 - screenw;
        scrolled = true;
        if (x2 > this.code.clientWidth) result = false;
      }
      if (scrolled && this.options.onScroll) this.options.onScroll(this);
      return result;
    };

    Editor.prototype.updateGutter = function() {
      var firstNode, hEditor, hText, html, i, minwidth, pad, val;
      var _this = this;
      if (!this.options.gutter && !this.options.lineNumbers) return;
      hText = this.mover.offsetHeight;
      hEditor = this.scroller.clientHeight;
      this.gutter.style.height = (hText - hEditor < 2 ? hEditor : hText) + "px";
      html = [];
      i = this.showingFrom;
      this.doc.iter(this.showingFrom, Math.max(this.showingTo, this.showingFrom + 1), function(line) {
        var j, marker, text;
        if (line.hidden) {
          html.push("<pre></pre>");
        } else {
          marker = line.gutterMarker;
          text = (_this.options.lineNumbers ? i + _this.options.firstLineNumber : null);
          if (marker && marker.text) {
            text = marker.text.replace("%N%", (text != null ? text : ""));
          } else {
            if (text == null) text = " ";
          }
          html.push((marker && marker.style ? "<pre class=\"" + marker.style + "\">" : "<pre>"), text);
          j = 1;
          while (j < line.height) {
            html.push("<br/>&#160;");
            ++j;
          }
          html.push("</pre>");
        }
        return ++i;
      });
      this.gutter.style.display = "none";
      this.gutterText.innerHTML = html.join("");
      minwidth = String(this.doc.size).length;
      firstNode = this.gutterText.firstChild;
      val = this.eltText(firstNode);
      pad = "";
      while (val.length + pad.length < minwidth) {
        pad += " ";
      }
      if (pad) {
        firstNode.insertBefore(this.targetDocument.createTextNode(pad), firstNode.firstChild);
      }
      this.gutter.style.display = "";
      this.lineSpace.style.marginLeft = this.gutter.offsetWidth + "px";
      return this.gutterDirty = false;
    };

    Editor.prototype.updateCursor = function() {
      var head, lh, lineOff, pos, wrapOff;
      head = (this.sel.inverted ? this.sel.from : this.sel.to);
      lh = this.textHeight();
      pos = this.localCoords(head, true);
      console.log('head');
      console.log(head);
      console.log('end head');
      wrapOff = this.eltOffset(this.wrapper);
      lineOff = this.eltOffset(this.lineDiv);
      this.inputDiv.style.top = (pos.y + lineOff.top - wrapOff.top) + "px";
      this.inputDiv.style.left = (pos.x + lineOff.left - wrapOff.left) + "px";
      if (this.posEq(this.sel.from, this.sel.to)) {
        this.cursorDiv.style.top = pos.y + "px";
        this.cursorDiv.style.left = (this.options.lineWrapping ? Math.min(pos.x, this.lineSpace.offsetWidth) : pos.x) + "px";
        return this.cursorDiv.style.display = "";
      } else {
        return this.cursorDiv.style.display = "none";
      }
    };

    return Editor;

  })();

  module.exports = Editor;

}).call(this);
}, "lib/pen/core/Events": function(exports, require, module) {(function() {
  var Events, Frontend;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Frontend = require('lib/pen/core/Frontend');

  Events = (function() {

    __extends(Events, Frontend);

    function Events() {
      this.dragAndDrop = __bind(this.dragAndDrop, this);
      this.e_button = __bind(this.e_button, this);
      this.e_target = __bind(this.e_target, this);
      this.e_stop = __bind(this.e_stop, this);
      this.e_stopPropagation = __bind(this.e_stopPropagation, this);
      this.e_preventDefault = __bind(this.e_preventDefault, this);
      this.addStop = __bind(this.addStop, this);
      this.stopMethod = __bind(this.stopMethod, this);
      this.onBlur = __bind(this.onBlur, this);
      this.onFocus = __bind(this.onFocus, this);
      this.onDragStart = __bind(this.onDragStart, this);
      this.onDrop = __bind(this.onDrop, this);
      this.onDoubleClick = __bind(this.onDoubleClick, this);
      this.onMouseDown = __bind(this.onMouseDown, this);
      Events.__super__.constructor.apply(this, arguments);
    }

    Events.prototype.wrapper = null;

    Events.prototype.updateInput = null;

    Events.prototype.focused = null;

    Events.prototype.code = null;

    Events.prototype.mover = null;

    Events.prototype.gutterText = null;

    Events.prototype.dragAndDrop = false;

    Events.prototype.lineSpace = null;

    Events.prototype.targetDocument = null;

    Events.prototype.draggingText = false;

    Events.prototype.updateInput = false;

    Events.prototype.onMouseDown = function(e) {
      var extend, going, last, move, n, now, start, up;
      var _this = this;
      this.setShift(this.e_prop(e, "shiftKey"));
      n = this.e_target(e);
      while (n !== this.wrapper) {
        if (n.parentNode === this.code && n !== this.mover) return;
        n = n.parentNode;
      }
      n = this.e_target(e);
      while (n !== this.wrapper) {
        if (n.parentNode === this.gutterText) {
          if (this.options.onGutterClick) {
            this.options.onGutterClick(this, this.indexOf(this.gutterText.childNodes, n) + this.showingFrom, e);
          }
          return this.e_preventDefault(e);
        }
        n = n.parentNode;
      }
      start = this.posFromMouse(e);
      switch (this.e_button(e)) {
        case 3:
          if (this.gecko && !this.mac) this.onContextMenu(e);
          return;
        case 2:
          if (start) this.setCursor(start.line, start.ch, true);
          return;
      }
      if (!start) {
        if (this.e_target(e) === this.scroller) this.e_preventDefault(e);
        return;
      }
      if (!this.focused) this.onFocus();
      now = +(new Date);
      if (this.lastDoubleClick && this.lastDoubleClick.time > now - 400 && this.posEq(this.lastDoubleClick.pos, start)) {
        this.e_preventDefault(e);
        setTimeout(this.focusInput, 20);
        return this.selectLine(start.line);
      } else if (this.lastClick && this.lastClick.time > now - 400 && this.posEq(this.lastClick.pos, start)) {
        this.lastDoubleClick = {
          time: now,
          pos: start
        };
        this.e_preventDefault(e);
        return this.selectWordAt(start);
      } else {
        this.lastClick = {
          time: now,
          pos: start
        };
      }
      last = start;
      going = void 0;
      if (this.dragAndDrop && !this.options.readOnly && !this.posEq(this.sel.from, this.sel.to) && !this.posLess(start, this.sel.from) && !this.posLess(this.sel.to, start)) {
        if (this.webkit) this.lineSpace.draggable = true;
        up = this.connect(this.targetDocument, "mouseup", this.operation(function(e2) {
          if (_this.webkit) _this.lineSpace.draggable = false;
          _this.draggingText = false;
          up();
          if (Math.abs(e.clientX - e2.clientX) + Math.abs(e.clientY - e2.clientY) < 10) {
            _this.e_preventDefault(e2);
            _this.setCursor(start.line, start.ch, true);
            return _this.focusInput();
          }
        }), true);
        this.draggingText = true;
        return;
      }
      this.e_preventDefault(e);
      this.setCursor(start.line, start.ch, true);
      extend = function(e) {
        var cur, visible;
        cur = _this.posFromMouse(e, true);
        if (cur && !_this.posEq(cur, last)) {
          if (!_this.focused) _this.onFocus();
          last = cur;
          _this.setSelectionUser(start, cur);
          _this.updateInput = false;
          visible = _this.visibleLines();
          if (cur.line >= visible.to || cur.line < visible.from) {
            going = setTimeout(_this.operation(function() {
              return extend(e);
            }), 150);
            return ss;
          }
        }
      };
      move = this.connect(this.targetDocument, "mousemove", this.operation(function(e) {
        clearTimeout(going);
        _this.e_preventDefault(e);
        return extend(e);
      }), true);
      return up = this.connect(this.targetDocument, "mouseup", this.operation(function(e) {
        var cur;
        clearTimeout(going);
        cur = _this.posFromMouse(e);
        if (cur) _this.setSelectionUser(start, cur);
        _this.e_preventDefault(e);
        _this.focusInput();
        _this.updateInput = true;
        move();
        return up();
      }), true);
    };

    Events.prototype.onDoubleClick = function(e) {
      var n, start;
      n = this.e_target(e);
      while (n !== this.wrapper) {
        if (n.parentNode === this.gutterText) return this.e_preventDefault(e);
        n = n.parentNode;
      }
      start = this.posFromMouse(e);
      if (!start) return;
      this.lastDoubleClick = {
        time: +(new Date),
        pos: start
      };
      this.e_preventDefault(e);
      return this.selectWordAt(start);
    };

    Events.prototype.onDrop = function(e) {
      var curFrom, curTo, end, files, i, loadFile, n, pos, read, text, _results;
      var _this = this;
      e.preventDefault();
      pos = this.posFromMouse(e, true);
      files = e.dataTransfer.files;
      if (!pos || this.options.readOnly) return;
      if (files && files.length && window.FileReader && window.File) {
        loadFile = function(file, i) {
          var reader;
          reader = new FileReader;
          reader.onload = function() {
            text[i] = reader.result;
            if (++read === n) {
              pos = _this.clipPos(pos);
              return _this.operation(function() {
                var end;
                end = this.replaceRange(text.join(""), pos, pos);
                return this.setSelectionUser(pos, end);
              })();
            }
          };
          return reader.readAsText(file);
        };
        n = files.length;
        text = Array(n);
        read = 0;
        i = 0;
        _results = [];
        while (i < n) {
          loadFile(files[i], i);
          _results.push(++i);
        }
        return _results;
      } else {
        try {
          this.text = e.dataTransfer.getData("Text");
          if (this.text) {
            end = this.replaceRange(this.text, pos, pos);
            curFrom = this.sel.from;
            curTo = this.sel.to;
            this.setSelectionUser(pos, end);
            if (this.draggingText) this.replaceRange("", curFrom, curTo);
            return this.focusInput();
          }
        } catch (_error) {}
      }
    };

    Events.prototype.onDragStart = function(e) {
      var txt;
      txt = this.getSelection();
      this.htmlEscape(txt);
      e.dataTransfer.setDragImage(this.escapeElement, 0, 0);
      return e.dataTransfer.setData("Text", txt);
    };

    Events.prototype.onFocus = function(e) {
      if (this.options.readOnly) return;
      if (!this.focused) {
        if (this.options.onFocus) this.options.onFocus(this);
        this.focused = true;
        if (this.wrapper.className.search(/\Pen-focused\b/) === -1) {
          this.wrapper.className += " Pen-focused";
        }
        if (!this.leaveInputAlone) this.resetInput(true);
      }
      this.slowPoll();
      return this.restartBlink();
    };

    Events.prototype.onBlur = function(e) {
      if (this.focused) {
        if (this.options.onBlur) this.options.onBlur(this);
        this.focused = false;
        if (this.bracketHighlighted) {
          this.operation(function() {
            if (this.bracketHighlighted) {
              this.bracketHighlighted();
              return this.bracketHighlighted = null;
            }
          })();
        }
        this.wrapper.className = this.wrapper.className.replace(" Pen-focused", "");
      }
      clearInterval(this.blinker);
      return setTimeout((function() {
        if (!this.focused) return this.shiftSelecting = null;
      }), 150);
    };

    Events.prototype.stopMethod = function() {
      return this.e_stop(this);
    };

    Events.prototype.addStop = function(event) {
      if (!event.stop) event.stop = this.stopMethod;
      return event;
    };

    Events.prototype.e_preventDefault = function(e) {
      if (e.preventDefault) {
        return e.preventDefault();
      } else {
        return e.returnValue = false;
      }
    };

    Events.prototype.e_stopPropagation = function(e) {
      if (e.stopPropagation) {
        return e.stopPropagation();
      } else {
        return e.cancelBubble = true;
      }
    };

    Events.prototype.e_stop = function(e) {
      this.e_preventDefault(e);
      return this.e_stopPropagation(e);
    };

    Events.prototype.e_target = function(e) {
      return e.target || e.srcElement;
    };

    Events.prototype.e_button = function(e) {
      if (e.which) {
        return e.which;
      } else if (e.button & 1) {
        return 1;
      } else if (e.button & 2) {
        return 3;
      } else {
        if (e.button & 4) return 2;
      }
    };

    Events.prototype.e_prop = function(e, prop) {
      if (e.override) {
        return e.override[prop];
      } else {
        return e[prop];
      }
    };

    Events.prototype.dragAndDrop = function() {
      var div;
      if (/MSIE [1-8]\b/.test(navigator.userAgent)) return false;
      div = document.createElement("div");
      return "draggable" in div;
    };

    return Events;

  })();

  module.exports = Events;

}).call(this);
}, "lib/pen/core/Frontend": function(exports, require, module) {(function() {
  var Frontend, Helpers;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Helpers = require('lib/pen/misc/Helpers');

  Frontend = (function() {

    __extends(Frontend, Helpers);

    function Frontend() {
      this.eltOffset = __bind(this.eltOffset, this);
      Frontend.__super__.constructor.apply(this, arguments);
    }

    Frontend.prototype.scroller = null;

    Frontend.prototype.escapeElement = void 0;

    Frontend.prototype.htmlEscape = null;

    Frontend.prototype.themeChanged = function() {
      return this.scroller.className = this.scroller.className.replace(/\s*cm-s-\w+/g, "") + this.options.theme.replace(/(^|\s)\s*/g, " cm-s-");
    };

    Frontend.prototype.computedStyle = function(elt) {
      if (elt.currentStyle) return elt.currentStyle;
      return window.getComputedStyle(elt, null);
    };

    Frontend.prototype.eltOffset = function(node, screen) {
      var bod, e, n, ol, ot, skipBody, x, y;
      bod = node.ownerDocument.body;
      x = 0;
      y = 0;
      skipBody = false;
      n = node;
      while (n) {
        ol = n.offsetLeft;
        ot = n.offsetTop;
        if (n === bod) {
          x += Math.abs(ol);
          y += Math.abs(ot);
        } else {
          x += ol;
          y += ot;
        }
        if (screen && this.computedStyle(n).position === "fixed") skipBody = true;
        n = n.offsetParent;
      }
      e = (screen && !skipBody ? null : bod);
      n = node.parentNode;
      while (n !== e) {
        if (n.scrollLeft != null) {
          x -= n.scrollLeft;
          y -= n.scrollTop;
        }
        n = n.parentNode;
      }
      return {
        left: x,
        top: y
      };
    };

    if (document.documentElement.getBoundingClientRect != null) {
      Frontend.prototype.eltOffset = function(node, screen) {
        var box, t;
        try {
          box = node.getBoundingClientRect();
          box = {
            top: box.top,
            left: box.left
          };
        } catch (e) {
          box = {
            top: 0,
            left: 0
          };
        }
        if (!screen) {
          if (window.pageYOffset == null) {
            t = document.documentElement || document.body.parentNode;
            if (t.scrollTop == null) t = document.body;
            box.top += t.scrollTop;
            box.left += t.scrollLeft;
          } else {
            box.top += window.pageYOffset;
            box.left += window.pageXOffset;
          }
        }
        return box;
      };
    }

    Frontend.prototype.eltText = function(node) {
      return node.textContent || node.innerText || node.nodeValue || "";
    };

    Frontend.prototype.selectInput = function(node) {
      if (ios) {
        node.selectionStart = 0;
        return node.selectionEnd = node.value.length;
      } else {
        return node.select();
      }
    };

    Frontend.prototype.posEq = function(a, b) {
      return a.line === b.line && a.ch === b.ch;
    };

    Frontend.prototype.posLess = function(a, b) {
      return a.line < b.line || (a.line === b.line && a.ch < b.ch);
    };

    Frontend.prototype.copyPos = function(x) {
      return {
        line: x.line,
        ch: x.ch
      };
    };

    Frontend.prototype.htmlEscape = function(str) {
      if (!this.escapeElement) this.escapeElement = document.createElement("pre");
      this.escapeElement.textContent = str;
      return this.escapeElement.innerHTML;
    };

    if (document.documentElement.getBoundingClientRect != null) {
      Frontend.prototype.eltOffset = function(node, screen) {
        var box, t;
        try {
          box = node.getBoundingClientRect();
          box = {
            top: box.top,
            left: box.left
          };
        } catch (e) {
          box = {
            top: 0,
            left: 0
          };
        }
        if (!screen) {
          if (window.pageYOffset == null) {
            t = document.documentElement || document.body.parentNode;
            if (t.scrollTop == null) t = document.body;
            box.top += t.scrollTop;
            box.left += t.scrollLeft;
          } else {
            box.top += window.pageYOffset;
            box.left += window.pageXOffset;
          }
        }
        return box;
      };
    }

    Frontend.prototype.copyStyles = function(from, to, source, dest) {
      var end, i, part, pos, state, _results;
      i = 0;
      pos = 0;
      state = 0;
      _results = [];
      while (pos < to) {
        part = source[i];
        end = pos + part.length;
        if (state === 0) {
          if (end > from) {
            dest.push(part.slice(from - pos, Math.min(part.length, to - pos)), source[i + 1]);
          }
          if (end >= from) state = 1;
        } else if (state === 1) {
          if (end > to) {
            dest.push(part.slice(0, to - pos), source[i + 1]);
          } else {
            dest.push(part, source[i + 1]);
          }
        }
        pos = end;
        _results.push(i += 2);
      }
      return _results;
    };

    Frontend.prototype.addWidget = function(pos, node, scroll, vert, horiz) {
      var hspace, left, top, vspace;
      pos = this.localCoords(this.clipPos(pos));
      top = pos.yBot;
      left = pos.x;
      node.style.position = "absolute";
      this.code.appendChild(node);
      if (vert === "over") {
        top = pos.y;
      } else if (vert === "near") {
        vspace = Math.max(this.scroller.offsetHeight, this.doc.height * textHeight());
        hspace = Math.max(this.code.clientWidth, this.lineSpace.clientWidth) - paddingLeft();
        if (pos.yBot + this.node.offsetHeight > vspace && pos.y > node.offsetHeight) {
          top = pos.y - node.offsetHeight;
        }
        if (left + node.offsetWidth > hspace) left = hspace - node.offsetWidth;
      }
      node.style.top = (top + paddingTop()) + "px";
      node.style.left = node.style.right = "";
      if (horiz === "right") {
        left = this.code.clientWidth - node.offsetWidth;
        node.style.right = "0px";
      } else {
        if (horiz === "left") {
          left = 0;
        } else {
          if (horiz === "middle") {
            left = (this.code.clientWidth - node.offsetWidth) / 2;
          }
        }
        node.style.left = (left + paddingLeft()) + "px";
      }
      if (scroll) {
        return this.scrollIntoView(left, top, left + node.offsetWidth, top + node.offsetHeight);
      }
    };

    return Frontend;

  })();

  module.exports = Frontend;

}).call(this);
}, "lib/pen/core/Keys": function(exports, require, module) {(function() {
  var Cursor, Keys;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Cursor = require('lib/pen/core/Cursor');

  Keys = (function() {
    var keyNames;

    __extends(Keys, Cursor);

    function Keys() {
      this.onKeyPress = __bind(this.onKeyPress, this);
      this.onKeyDown = __bind(this.onKeyDown, this);
      Keys.__super__.constructor.apply(this, arguments);
    }

    Keys.prototype.mode = null;

    Keys.prototype.lastStoppedKey = null;

    Keys.prototype.keyMap = {};

    Keys.prototype.setupKeyMaps = function() {
      this.keyMap.basic = {
        Left: "goCharLeft",
        Right: "goCharRight",
        Up: "goLineUp",
        Down: "goLineDown",
        End: "goLineEnd",
        Home: "goLineStartSmart",
        PageUp: "goPageUp",
        PageDown: "goPageDown",
        Delete: "delCharRight",
        Backspace: "delCharLeft",
        Tab: "indentMore",
        "Shift-Tab": "indentLess",
        Enter: "newlineAndIndent",
        Insert: "toggleOverwrite"
      };
      this.keyMap.pcDefault = {
        "Ctrl-A": "selectAll",
        "Ctrl-D": "deleteLine",
        "Ctrl-Z": "undo",
        "Shift-Ctrl-Z": "redo",
        "Ctrl-Y": "redo",
        "Ctrl-Home": "goDocStart",
        "Alt-Up": "goDocStart",
        "Ctrl-End": "goDocEnd",
        "Ctrl-Down": "goDocEnd",
        "Ctrl-Left": "goWordLeft",
        "Ctrl-Right": "goWordRight",
        "Alt-Left": "goLineStart",
        "Alt-Right": "goLineEnd",
        "Ctrl-Backspace": "delWordLeft",
        "Ctrl-Delete": "delWordRight",
        "Ctrl-S": "save",
        "Ctrl-F": "find",
        "Ctrl-G": "findNext",
        "Shift-Ctrl-G": "findPrev",
        "Shift-Ctrl-F": "replace",
        "Shift-Ctrl-R": "replaceAll",
        fallthrough: "basic"
      };
      this.keyMap.macDefault = {
        "Cmd-A": "selectAll",
        "Cmd-D": "deleteLine",
        "Cmd-Z": "undo",
        "Shift-Cmd-Z": "redo",
        "Cmd-Y": "redo",
        "Cmd-Up": "goDocStart",
        "Cmd-End": "goDocEnd",
        "Cmd-Down": "goDocEnd",
        "Alt-Left": "goWordLeft",
        "Alt-Right": "goWordRight",
        "Cmd-Left": "goLineStart",
        "Cmd-Right": "goLineEnd",
        "Alt-Backspace": "delWordLeft",
        "Ctrl-Alt-Backspace": "delWordRight",
        "Alt-Delete": "delWordRight",
        "Cmd-S": "save",
        "Cmd-F": "find",
        "Cmd-G": "findNext",
        "Shift-Cmd-G": "findPrev",
        "Cmd-Alt-F": "replace",
        "Shift-Cmd-Alt-F": "replaceAll",
        fallthrough: ["basic", "emacsy"]
      };
      this.keyMap["default"] = (this.mac ? this.keyMap.macDefault : this.keyMap.pcDefault);
      return this.keyMap.emacsy = {
        "Ctrl-F": "goCharRight",
        "Ctrl-B": "goCharLeft",
        "Ctrl-P": "goLineUp",
        "Ctrl-N": "goLineDown",
        "Alt-F": "goWordRight",
        "Alt-B": "goWordLeft",
        "Ctrl-A": "goLineStart",
        "Ctrl-E": "goLineEnd",
        "Ctrl-V": "goPageUp",
        "Shift-Ctrl-V": "goPageDown",
        "Ctrl-D": "delCharRight",
        "Ctrl-H": "delCharLeft",
        "Alt-D": "delWordRight",
        "Alt-Backspace": "delWordLeft",
        "Ctrl-K": "killLine",
        "Ctrl-T": "transposeChars"
      };
    };

    keyNames = {
      3: "Enter",
      8: "Backspace",
      9: "Tab",
      13: "Enter",
      16: "Shift",
      17: "Ctrl",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Esc",
      32: "Space",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "Left",
      38: "Up",
      39: "Right",
      40: "Down",
      44: "PrintScrn",
      45: "Insert",
      46: "Delete",
      59: ";",
      91: "Mod",
      92: "Mod",
      93: "Mod",
      186: ";",
      187: "=",
      188: ",",
      189: "-",
      190: ".",
      191: "/",
      192: "`",
      219: "[",
      220: "\\",
      221: "]",
      222: "'",
      63276: "PageUp",
      63277: "PageDown",
      63275: "End",
      63273: "Home",
      63234: "Left",
      63232: "Up",
      63235: "Right",
      63233: "Down",
      63302: "Insert",
      63272: "Delete"
    };

    Keys.prototype.keyNames = keyNames;

    (function() {
      var i, _results;
      i = 0;
      while (i < 10) {
        keyNames[i + 48] = String(i);
        i++;
      }
      i = 65;
      while (i <= 90) {
        keyNames[i] = String.fromCharCode(i);
        i++;
      }
      i = 1;
      _results = [];
      while (i <= 12) {
        keyNames[i + 111] = keyNames[i + 63235] = "F" + i;
        _results.push(i++);
      }
      return _results;
    })();

    Keys.prototype.handleKeyBinding = function(e) {
      var bound, dropShift, handleNext, name, next, prevShift;
      name = this.keyNames[this.e_prop(e, "keyCode")];
      next = this.keyMap[this.options.keyMap].auto;
      bound = void 0;
      dropShift = void 0;
      handleNext = function() {
        if (next.call) {
          return next.call(null, this);
        } else {
          return next;
        }
      };
      if (!(name != null) || e.altGraphKey) {
        if (next) this.options.keyMap = handleNext();
        return null;
      }
      if (this.e_prop(e, "altKey")) name = "Alt-" + name;
      if (this.e_prop(e, "ctrlKey")) name = "Ctrl-" + name;
      if (this.e_prop(e, "metaKey")) name = "Cmd-" + name;
      if (this.e_prop(e, "shiftKey") && (bound = this.lookupKey("Shift-" + name, this.options.extraKeys, this.options.keyMap))) {
        dropShift = true;
      } else {
        bound = this.lookupKey(name, this.options.extraKeys, this.options.keyMap);
      }
      if (typeof bound === "string") {
        if (this.commands.propertyIsEnumerable(bound)) {
          bound = this.commands[bound];
        } else {
          bound = null;
        }
      }
      if (next && (bound || !this.isModifierKey(e))) {
        this.options.keyMap = handleNext();
      }
      if (!bound) return false;
      prevShift = this.shiftSelecting;
      try {
        if (this.options.readOnly) this.suppressEdits = true;
        if (dropShift) this.shiftSelecting = null;
        bound(this);
      } finally {
        this.shiftSelecting = prevShift;
        this.suppressEdits = false;
      }
      this.e_preventDefault(e);
      return true;
    };

    Keys.prototype.onKeyDown = function(e) {
      var code, handled;
      if (!this.focused) this.onFocus();
      code = this.e_prop(e, "keyCode");
      if (this.ie && code === 27) e.returnValue = false;
      this.setShift(code === 16 || this.e_prop(e, "shiftKey"));
      if (this.options.onKeyEvent && this.options.onKeyEvent(this, this.addStop(e))) {
        return;
      }
      handled = this.handleKeyBinding(e);
      if (window.opera) {
        this.lastStoppedKey = (handled ? e.keyCode : null);
        if (!handled && code === 88 && this.e_prop(e, (this.mac ? "metaKey" : "ctrlKey"))) {
          return this.replaceSelection("");
        }
      }
    };

    Keys.prototype.onKeyPress = function(e) {
      var ch, charCode, keyCode;
      keyCode = this.e_prop(e, "keyCode");
      charCode = this.e_prop(e, "charCode");
      if (window.opera && keyCode === this.lastStoppedKey) {
        this.lastStoppedKey = null;
        this.e_preventDefault(e);
        return;
      }
      if (this.options.onKeyEvent && this.options.onKeyEvent(this, addStop(e))) {
        return;
      }
      if (window.opera && !e.which && this.handleKeyBinding(e)) return;
      if (this.options.electricChars && this.mode.electricChars && this.options.smartIndent && !this.options.readOnly) {
        ch = String.fromCharCode((!(charCode != null) ? keyCode : charCode));
        if (this.mode.electricChars.indexOf(ch) > -1) {
          setTimeout(this.operation(function() {
            return this.indentLine(sel.to.line, "smart");
          }), 75);
        }
      }
      return this.fastPoll();
    };

    Keys.prototype.onKeyUp = function(e) {
      if (this.options.onKeyEvent && this.options.onKeyEvent(this, this.addStop(e))) {
        return;
      }
      if (this.e_prop(e, "keyCode") === 16) return this.shiftSelecting = null;
    };

    Keys.prototype.lookupKey = function(name, extraMap, map) {
      var lookup;
      var _this = this;
      lookup = function(name, map, ft) {
        var e, found, i;
        found = map[name];
        if (found != null) return found;
        if (ft == null) ft = map.fallthrough;
        if (ft == null) return map.catchall;
        if (typeof ft === "string") return lookup(name, _this.keyMap[ft]);
        i = 0;
        e = ft.length;
        while (i < e) {
          found = lookup(name, _this.keyMap[ft[i]]);
          if (found != null) return found;
          ++i;
        }
        return null;
      };
      if (extraMap) {
        return lookup(name, extraMap, map);
      } else {
        return lookup(name, this.keyMap[map]);
      }
    };

    Keys.prototype.isModifierKey = function(event) {
      var name;
      name = this.keyNames[event.keyCode];
      return name === "Ctrl" || name === "Alt" || name === "Shift" || name === "Mod";
    };

    return Keys;

  })();

  module.exports = Keys;

}).call(this);
}, "lib/pen/main": function(exports, require, module) {(function() {
  var $, BranchChunk, Delayed, History, LeafChunk, Line, Markdown, Marker, Pen, StringStream, Xml, jQuery;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  History = require('lib/pen/misc/history');

  BranchChunk = require('lib/pen/text/branch');

  LeafChunk = require('lib/pen/text/leaf');

  Line = require('lib/pen/text/line');

  Delayed = require('lib/pen/core/delayed');

  StringStream = require('lib/pen/marks/stringstream');

  Markdown = require('lib/pen/parsers/markdown/Markdown');

  Xml = require('lib/pen/parsers/xml/Xml');

  jQuery = require("jqueryify");

  $ = jQuery;

  Marker = require('lib/pen/marks/Marker');

  Pen = (function() {

    __extends(Pen, Marker);

    Pen.prototype.extensions = {};

    Pen.prototype.options = {};

    Pen.prototype.mode = null;

    Pen.prototype.modes = {};

    Pen.prototype.mimeModes = {};

    Pen.prototype.wrapper = null;

    Pen.prototype.inputDiv = null;

    Pen.prototype.input = null;

    Pen.prototype.scroller = null;

    Pen.prototype.code = null;

    Pen.prototype.mover = null;

    Pen.prototype.gutter = null;

    Pen.prototype.gutterText = null;

    Pen.prototype.lineSpace = null;

    Pen.prototype.measure = null;

    Pen.prototype.cursor = null;

    Pen.prototype.lineDiv = null;

    Pen.prototype.work = null;

    Pen.prototype.place = void 0;

    Pen.prototype.document = window.document;

    function Pen(place, options) {
      this.operate = __bind(this.operate, this);
      this.getMode = __bind(this.getMode, this);
      this.setupConnections = __bind(this.setupConnections, this);      this.place = place;
      this.setupSelection();
      this.setDefaults(options);
      this.setOptions(options);
      this.setupKeyMaps();
      this.wrapper = this.getWrapper();
      this.setElems();
      this.themeChanged();
      this.setInputStyles();
      this.checkStringWidth();
      this.setupMode();
      this.defineMode("null", function() {
        return {
          token: function(stream) {
            return stream.skipToEnd();
          }
        };
      });
      this.defineMIME("text/plain", "null");
      this.defineMIME("application/xml", "xml");
      this.defineMIME("text/html", {
        name: "xml",
        htmlMode: true
      });
      this.defineMIME("text/x-markdown", "markdown");
      this.defineMode("xml", new Xml(this, this.options, this.options.parserConfig));
      this.defineMode("markdown", new Markdown(this, this.options, this.options.parserConfig));
      this.loadMode();
      this.setupVars();
      this.setOperations();
      this.setupConnections();
      this.hasFocus = void 0;
      try {
        this.hasFocus = this.targetDocument.activeElement === this.input;
      } catch (_error) {}
      if (this.hasFocus) {
        setTimeout(this.onFocus, 20);
      } else {
        this.onBlur();
      }
      this.focusInput;
    }

    Pen.prototype.isLine = function(l) {
      return l >= 0 && l < this.doc.size;
    };

    Pen.prototype.setDefaults = function() {
      this.gecko = /gecko\/\d{7}/i.test(navigator.userAgent);
      this.ie = /MSIE \d/.test(navigator.userAgent);
      this.webkit = /WebKit\//.test(navigator.userAgent);
      this.mac = /Mac/i.test(navigator.platform);
      this.win = /Win/i.test(navigator.platform);
      return this.defaults = {
        value: " ",
        theme: "default",
        indentUnit: 2,
        indentWithTabs: false,
        tabSize: 4,
        keyMap: "default",
        extraKeys: null,
        electricChars: true,
        onKeyEvent: null,
        lineWrapping: false,
        lineNumbers: false,
        gutter: false,
        fixedGutter: false,
        firstLineNumber: 1,
        readOnly: false,
        onChange: null,
        onCursorActivity: null,
        onGutterClick: null,
        onHighlightComplete: null,
        onUpdate: null,
        onFocus: null,
        onBlur: null,
        onScroll: null,
        matchBrackets: false,
        workTime: 100,
        workDelay: 200,
        pollInterval: 100,
        undoDepth: 40,
        tabindex: null,
        document: window.document,
        mac: /Mac/i.test(navigator.platform),
        win: /Win/i.test(navigator.platform),
        mode: "markdown",
        parserConfig: {},
        mimeModes: {}
      };
    };

    Pen.prototype.setOptions = function(givenOptions) {
      var defaults, opt, _results;
      defaults = this.defaults;
      _results = [];
      for (opt in defaults) {
        if (defaults.hasOwnProperty(opt)) {
          _results.push(this.options[opt] = (givenOptions && givenOptions.hasOwnProperty(opt) ? givenOptions : defaults)[opt]);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Pen.prototype.getWrapper = function() {
      var wrapper;
      this.targetDocument = this.options["document"];
      wrapper = this.targetDocument.createElement("div");
      wrapper.className = "Pen" + (this.options.lineWrapping ? " Pen-wrap" : "");
      wrapper.innerHTML = this.getTemplate();
      if (this.place.appendChild) {
        this.place.appendChild(wrapper);
      } else if (this.place.append) {
        this.place.append(wrapper);
      } else {
        this.place(wrapper);
      }
      return wrapper;
    };

    Pen.prototype.setElems = function() {
      this.inputDiv = this.wrapper.firstChild;
      this.input = this.inputDiv.firstChild;
      this.scroller = this.wrapper.lastChild;
      this.code = this.scroller.firstChild;
      this.mover = this.code.firstChild;
      this.gutter = this.mover.firstChild;
      this.gutterText = this.gutter.firstChild;
      this.lineSpace = this.gutter.nextSibling.firstChild;
      this.measure = this.lineSpace.firstChild;
      this.cursor = this.measure.nextSibling;
      this.cursorDiv = this.measure.nextSibling;
      return this.lineDiv = this.cursor.nextSibling;
    };

    Pen.prototype.setInputStyles = function() {
      if (this.ios) this.input.style.width = "0px";
      if (/AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent)) {
        this.input.style.width = "0px";
      }
      if (!this.webkit) this.lineSpace.draggable = true;
      if (this.options.tabindex != null) {
        this.input.tabIndex = this.options.tabindex;
      }
      if (!this.options.gutter && !this.options.lineNumbers) {
        return this.gutter.style.display = "none";
      }
    };

    Pen.prototype.checkStringWidth = function() {
      try {
        return this.stringWidth("x");
      } catch (e) {
        if (e.message.match(/runtime/i)) {
          e = new Error("A Pen inside a P-style element does not work in Internet Explorer. (innerHTML bug)");
        }
        throw e;
      }
    };

    Pen.prototype.setupMode = function() {
      this.poll = new Delayed();
      this.highlight = new Delayed();
      this.blinker = void 0;
      this.mode = void 0;
      this.doc = new BranchChunk([new LeafChunk([new Line(this, "")])]);
      this.work = void 0;
      return this.focused = void 0;
    };

    Pen.prototype.loadMode = function() {
      this.mode = this.getMode(this.options, this.options.mode);
      this.doc.iter(0, this.doc.size, function(line) {
        return line.stateAfter = null;
      });
      this.work = [0];
      return this.startWorker();
    };

    Pen.prototype.setupSelection = function() {
      return this.sel = {
        from: {
          line: 0,
          ch: 0
        },
        to: {
          line: 0,
          ch: 0
        },
        inverted: false
      };
    };

    Pen.prototype.setupVars = function() {
      this.shiftSelecting = void 0;
      this.lastClick = void 0;
      this.lastDoubleClick = void 0;
      this.draggingText = void 0;
      this.lastScrollPos = 0;
      this.overwrite = false;
      this.suppressEdits = false;
      this.updateInput = void 0;
      this.userSelChange = void 0;
      this.changes = [];
      this.textChanged = void 0;
      this.selectionChanged = void 0;
      this.leaveInputAlone = void 0;
      this.gutterDirty = void 0;
      this.callbacks = void 0;
      this.displayOffset = 0;
      this.showingFrom = 0;
      this.showingTo = 0;
      this.lastSizeC = 0;
      this.bracketHighlighted = void 0;
      this.maxLine = "";
      this.maxWidth = void 0;
      this.tabText = this.computeTabText();
      this.escapeElement = document.createElement("pre");
      this.tempId = Math.floor(Math.random() * 0xffffff).toString(16);
      this.operate(function() {
        this.setValueF(this.options.value || " ");
        return this.updateInput = false;
      });
      return this.history = new History();
    };

    Pen.prototype.setOperations = function() {
      var _this = this;
      this.setValue = this.operation(this.setValueF);
      this.replaceSelection = this.operation(this.replaceSelectionF);
      this.undo = this.operation(this.undoF);
      this.redo = this.operation(this.redoF);
      this.indentLine = this.operation(function(n, dir) {
        if (_this.isLine(n)) {
          return _this.indentLineF(n, (!(dir != null) ? "smart" : (dir ? "add" : "subtract")));
        }
      });
      this.indentSelection = this.operation(this.indentSelected);
      this.matchBrackets = this.operation(function() {
        return this.matchBracketsF(true);
      });
      this.markText = this.operation(this.markTextF);
      this.setMarker = this.operation(this.addGutterMarker);
      this.clearMarker = this.operation(this.removeGutterMarker);
      this.replaceRange = this.operation(this.replaceRangeF);
      this.moveH = this.operation(this.moveHF);
      this.deleteH = this.operation(this.deleteHF);
      this.moveV = this.operation(this.moveVF);
      this.setLineClass = this.operation(this.setLineClassF);
      this.hideLine = this.operation(function(h) {
        return this.setLineHidden(h, true);
      });
      this.showLine = this.operation(function(h) {
        return _this.setLineHidden(h, false);
      });
      this.setLine = this.operation(function(line, text) {
        if (_this.isLine(line)) {
          return _this.replaceRange(text, {
            line: line,
            ch: 0
          }, {
            line: line,
            ch: _this.getLine(line).text.length
          });
        }
      });
      this.removeLine = this.operation(function(line) {
        if (this.isLine(line)) {
          return this.replaceRange("", {
            line: line,
            ch: 0
          }, this.clipPos({
            line: line + 1,
            ch: 0
          }));
        }
      });
      this.getTokenAt = this.operation(function(pos) {
        pos = this.clipPos(pos);
        return this.getLine(pos.line).getTokenAt(this.mode, this.getStateBefore(pos.line), pos.ch);
      });
      this.setCursor = this.operation(function(line, ch, user) {
        if (!(ch != null) && typeof line.line === "number") {
          return _this.setCursorF(line.line, line.ch, user);
        } else {
          return _this.setCursorF(line, ch, user);
        }
      });
      return this.setSelection = this.operation(function(from, to, user) {
        if (user) {
          return _this.setSelectionUser(_this.clipPos(from), _this.clipPos(to || from));
        } else {
          return _this.setSelectionF(_this.clipPos(from), _this.clipPos(to || from));
        }
      });
    };

    Pen.prototype.setupConnections = function() {
      var _this = this;
      $(this.scroller).mousedown(this.operation(this.onMouseDown));
      $(this.scroller).dblclick(this.operation(this.onDoubleClick));
      this.connect(this.lineSpace, "dragstart", this.onDragStart);
      this.connect(this.lineSpace, "selectstart", this.e_preventDefault);
      if (!this.gecko) {
        this.connect(this.scroller, "contextmenu", this.onContextMenu);
      }
      this.connect(this.scroller, "scroll", function() {
        _this.lastScrollPos = _this.scroller.scrollTop;
        _this.updateDisplay([]);
        if (_this.options.fixedGutter) {
          _this.gutter.style.left = _this.scroller.scrollLeft + "px";
        }
        if (_this.options.onScroll) return _this.options.onScroll(_this);
      });
      this.connect(window, "resize", function() {
        return _this.updateDisplay(true);
      });
      this.connect(this.input, "keyup", this.operation(this.onKeyUp));
      this.connect(this.input, "input", this.operation(this.fastPoll));
      this.connect(this.input, "keydown", this.operation(this.onKeyDown));
      this.connect(this.input, "keypress", this.operation(this.onKeyPress));
      this.connect(this.input, "focus", this.operation(this.onFocus));
      this.connect(this.input, "blur", this.onBlur);
      this.connect(this.scroller, "dragenter", this.e_stop);
      this.connect(this.scroller, "dragover", this.e_stop);
      this.connect(this.scroller, "drop", this.operation(this.onDrop));
      this.connect(this.scroller, "paste", function() {
        _this.focusInput();
        return _this.fastPoll();
      });
      this.connect(this.input, "paste", this.fastPoll);
      return this.connect(this.input, "cut", this.operation(function() {
        return _this.replaceSelection("");
      }));
    };

    Pen.prototype.defineMode = function(name, mode) {
      if (!this.defaults.mode && name !== "null") this.defaults.mode = name;
      return this.modes[name] = mode;
    };

    Pen.prototype.defineMIME = function(mime, spec) {
      return this.mimeModes[mime] = spec;
    };

    Pen.prototype.getMode = function(options, spec) {
      var config, mfactory, mname;
      if (typeof spec === "string" && this.mimeModes.hasOwnProperty(spec)) {
        spec = this.mimeModes[spec];
      }
      if (typeof spec === "string") {
        mname = spec;
        config = {};
      } else if (spec != null) {
        mname = spec.name;
        config = spec;
      }
      mfactory = this.modes[mname];
      if (!mfactory) {
        if (window.console) {
          console.warn("No mode " + mname + " found, falling back to plain text.");
        }
        return this.getMode(options, "text/plain");
      }
      if (typeof mfactory === "object") {
        return mfactory;
      } else {
        return new mfactory(options, config || {});
      }
    };

    Pen.prototype.listModes = function() {
      var list, m;
      list = [];
      for (m in this.modes) {
        if (this.modes.propertyIsEnumerable(m)) list.push(m);
      }
      return list;
    };

    Pen.prototype.listMIMEs = function() {
      var list, m;
      list = [];
      for (m in this.mimeModes) {
        if (this.mimeModes.propertyIsEnumerable(m)) {
          list.push({
            mime: m,
            mode: this.mimeModes[m]
          });
        }
      }
      return list;
    };

    Pen.prototype.defineExtension = function(name, func) {
      return this.extensions[name] = func;
    };

    Pen.prototype.focus = function() {
      this.focusInput();
      this.onFocus();
      return this.fastPoll();
    };

    Pen.prototype.setOption = function(option, value) {
      var oldVal;
      oldVal = this.options[option];
      this.options[option] = value;
      if (option === "mode" || option === "indentUnit") {
        this.loadMode();
      } else if (option === "readOnly" && value) {
        this.onBlur();
        this.input.blur();
      } else if (option === "theme") {
        this.themeChanged();
      } else if (option === "lineWrapping" && oldVal !== value) {
        this.operation(this.wrappingChanged)();
      } else {
        if (option === "tabSize") this.operation(this.tabsChanged)();
      }
      if (option === "lineNumbers" || option === "gutter" || option === "firstLineNumber" || option === "theme") {
        return this.operation(this.gutterChanged)();
      }
    };

    Pen.prototype.getOption = function(option) {
      return this.options[option];
    };

    Pen.prototype.historySize = function() {
      return {
        undo: this.history.done.length,
        redo: this.history.undone.length
      };
    };

    Pen.prototype.clearHistory = function() {
      return this.history = new History();
    };

    Pen.prototype.getStateAfter = function(line) {
      line = this.clipLine((!(line != null) ? this.doc.size - 1 : line));
      return this.getStateBefore(line + 1);
    };

    Pen.prototype.cursorCoords = function(start) {
      if (start == null) start = this.sel.inverted;
      return this.pageCoords((start ? this.sel.from : this.sel.to));
    };

    Pen.prototype.charCoords = function(pos) {
      return this.pageCoords(this.clipPos(pos));
    };

    Pen.prototype.coordsChar = function(coords) {
      var off_;
      off_ = this.eltOffset(this.lineSpace);
      return this.coordsCharF(coords.x - off_.left, coords.y - off_.top);
    };

    Pen.prototype.getRangeWrap = function(from, to) {
      return this.getRange(this.clipPos(from), this.clipPos(to));
    };

    Pen.prototype.execCommand = function(cmd) {
      return this.commands[cmd](this);
    };

    Pen.prototype.toggleOverwrite = function() {
      return this.overwrite = !this.overwrite;
    };

    Pen.prototype.posFromIndex = function(off_) {
      var ch, lineNo;
      var _this = this;
      lineNo = 0;
      ch = void 0;
      this.doc.iter(0, this.doc.size, function(line) {
        var sz;
        sz = line.text.length + 1;
        if (sz > off_) {
          ch = off_;
          return true;
        }
        off_ -= sz;
        return ++lineNo;
      });
      return this.clipPos({
        line: lineNo,
        ch: ch
      });
    };

    Pen.prototype.indexFromPos = function(coords) {
      var index;
      var _this = this;
      if (coords.line < 0 || coords.ch < 0) return 0;
      index = coords.ch;
      this.doc.iter(0, coords.line, function(line) {
        return index += line.text.length + 1;
      });
      return index;
    };

    Pen.prototype.operate = function(f) {
      return this.operation(f)();
    };

    Pen.prototype.refresh = function() {
      this.updateDisplay(true);
      if (this.scroller.scrollHeight > this.lastScrollPos) {
        return this.scroller.scrollTop = this.lastScrollPos;
      }
    };

    Pen.prototype.getInputField = function() {
      return this.input;
    };

    Pen.prototype.getWrapperElement = function() {
      return this.wrapper;
    };

    Pen.prototype.getScrollerElement = function() {
      return this.scroller;
    };

    Pen.prototype.getGutterElement = function() {
      return this.gutter;
    };

    Pen.prototype.copyState = function(mode, state) {
      var n, nstate, val;
      if (state === true) return state;
      if (mode.copyState) return mode.copyState(state);
      nstate = {};
      for (n in state) {
        val = state[n];
        if (val instanceof Array) val = val.concat([]);
        nstate[n] = val;
      }
      return nstate;
    };

    Pen.prototype.startState = function(mode, a1, a2) {
      if (!mode) return true;
      if (mode.startState) {
        return mode.startState(a1, a2);
      } else {
        return true;
      }
    };

    return Pen;

  })();

  module.exports = Pen;

}).call(this);
}, "lib/pen/marks/bookmark": function(exports, require, module) {(function() {
  var Bookmark;

  Bookmark = (function() {

    function Bookmark() {}

    Bookmark.prototype.line = null;

    Bookmark.prototype.from = null;

    Bookmark.prototype.to = null;

    Bookmark.prototype.pen = null;

    Bookmark.prototype.consructor = function(pen, pos) {
      this.pen = pen;
      this.from = pos;
      this.to = pos;
      return this.line = null;
    };

    Bookmark.prototype.attach = function(line) {
      return this.line = line;
    };

    Bookmark.prototype.detach = function(line) {
      if (this.line === line) return this.line = null;
    };

    Bookmark.prototype.split = function(pos, lenBefore) {
      if (pos < this.from) {
        this.from = this.to = (this.from - pos) + lenBefore;
        return this;
      }
    };

    Bookmark.prototype.isDead = function() {
      return this.from > this.to;
    };

    Bookmark.prototype.clipTo = function(fromOpen, from, toOpen, to, diff) {
      if ((fromOpen || from < this.from) && (toOpen || to > this.to)) {
        this.from = 0;
        return this.to = -1;
      } else {
        if (this.from > from) {
          return this.from = this.to = Math.max(to, this.from) + diff;
        }
      }
    };

    Bookmark.prototype.sameSet = function(x) {
      return false;
    };

    Bookmark.prototype.find = function() {
      if (!this.line || !this.line.parent) return null;
      return {
        line: this.pen.lineNo(this.line),
        ch: this.from
      };
    };

    Bookmark.prototype.clear = function() {
      var found;
      if (this.line) {
        found = this.pen.indexOf(this.line.marked, this);
        if (found !== -1) this.line.marked.splice(found, 1);
        return this.line = null;
      }
    };

    return Bookmark;

  })();

  module.exports = Bookmark;

}).call(this);
}, "lib/pen/marks/markedtext": function(exports, require, module) {(function() {
  var MarkedText;

  MarkedText = (function() {

    MarkedText.prototype.from = null;

    MarkedText.prototype.to = null;

    MarkedText.prototype.style = null;

    MarkedText.prototype.set = null;

    MarkedText.prototype.pen = null;

    function MarkedText(pen, from, to, className, set) {
      this.pen = pen;
      this.from = from;
      this.to = to;
      this.style = className;
      this.set = set;
    }

    MarkedText.prototype.attach = function(line) {
      return this.set.push(line);
    };

    MarkedText.prototype.detach = function(line) {
      var ix;
      ix = this.pen.indexOf(this.set, line);
      if (ix > -1) return this.set.splice(ix, 1);
    };

    MarkedText.prototype.split = function(pos, lenBefore) {
      var from, to;
      if (this.to <= pos && (this.to != null)) return null;
      from = (this.from < pos || !(this.from != null) ? null : this.from - pos + lenBefore);
      to = (!(this.to != null) ? null : this.to - pos + lenBefore);
      return new MarkedText(this.pen, from, to, this.style, this.set);
    };

    MarkedText.prototype.dup = function() {
      return new MarkedText(this.pen, null, null, this.style, this.set);
    };

    MarkedText.prototype.clipTo = function(fromOpen, from, toOpen, to, diff) {
      if ((this.from != null) && this.from >= from) {
        this.from = Math.max(to, this.from) + diff;
      }
      if ((this.to != null) && this.to > from) {
        this.to = (to < this.to ? this.to + diff : from);
      }
      if (fromOpen && to > this.from && (to < this.to || !(this.to != null))) {
        this.from = null;
      }
      if (toOpen && (from < this.to || !(this.to != null)) && (from > this.from || !(this.from != null))) {
        return this.to = null;
      }
    };

    MarkedText.prototype.isDead = function() {
      return (this.from != null) && (this.to != null) && this.from >= this.to;
    };

    MarkedText.prototype.sameSet = function(x) {
      return this.set === x.set;
    };

    return MarkedText;

  })();

  module.exports = MarkedText;

}).call(this);
}, "lib/pen/marks/Marker": function(exports, require, module) {(function() {
  var Bookmark, Commands, Marker;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Commands = require('lib/pen/misc/Commands');

  Bookmark = require('lib/pen/marks/bookmark');

  Marker = (function() {

    __extends(Marker, Commands);

    function Marker() {
      Marker.__super__.constructor.apply(this, arguments);
    }

    Marker.prototype.gutterDirty = false;

    Marker.prototype.markTextF = function(from, to, className) {
      var add, e, i, tm;
      var _this = this;
      from = this.clipPos(from);
      to = this.clipPos(to);
      tm = new TextMarker(this);
      add = function(line, from, to, className) {
        return _this.getLine(line).addMark(new MarkedText(_this, from, to, className, tm.set));
      };
      if (from.line === to.line) {
        add(from.line, from.ch, to.ch, className);
      } else {
        add(from.line, from.ch, null, className);
        i = from.line + 1;
        e = to.line;
        while (i < e) {
          add(i, null, null, className);
          ++i;
        }
        add(to.line, null, to.ch, className);
      }
      this.changes.push({
        from: from.line,
        to: to.line + 1
      });
      return tm;
    };

    Marker.prototype.setBookmark = function(pos) {
      var bm;
      pos = this.clipPos(pos);
      bm = new Bookmark(this, pos.ch);
      this.getLine(pos.line).addMark(bm);
      return bm;
    };

    Marker.prototype.addGutterMarker = function(line, text, className) {
      if (typeof line === "number") line = this.getLine(this.clipLine(line));
      line.gutterMarker = {
        text: text,
        style: className
      };
      this.gutterDirty = true;
      return line;
    };

    Marker.prototype.removeGutterMarker = function(line) {
      if (typeof line === "number") line = this.getLine(this.clipLine(line));
      line.gutterMarker = null;
      return this.gutterDirty = true;
    };

    return Marker;

  })();

  module.exports = Marker;

}).call(this);
}, "lib/pen/marks/stringstream": function(exports, require, module) {(function() {
  var StringStream;

  StringStream = (function() {
    var matching;

    StringStream.prototype.pos = null;

    StringStream.prototype.string = "";

    StringStream.prototype.tabSize = null;

    StringStream.prototype.start = 0;

    StringStream.prototype.bracketHighlighted = null;

    StringStream.prototype.sel = null;

    StringStream.prototype.pen = null;

    matching = {
      "(": ")>",
      ")": "(<",
      "[": "]>",
      "]": "[<",
      "{": "}>",
      "}": "{<"
    };

    function StringStream(pen, string, tabSize) {
      this.pen = pen;
      this.pos = this.start = 0;
      this.string = string;
      this.tabSize = tabSize || 8;
    }

    StringStream.prototype.eol = function() {
      return this.pos >= this.string.length;
    };

    StringStream.prototype.sol = function() {
      return this.pos === 0;
    };

    StringStream.prototype.peek = function() {
      return this.string.charAt(this.pos);
    };

    StringStream.prototype.next = function() {
      if (this.pos < this.string.length) return this.string.charAt(this.pos++);
    };

    StringStream.prototype.eat = function(match) {
      var ch, ok;
      ch = this.string.charAt(this.pos);
      if (typeof match === "string") {
        ok = ch === match;
      } else {
        ok = ch && (match.test ? match.test(ch) : match(ch));
      }
      if (ok) {
        ++this.pos;
        return ch;
      }
    };

    StringStream.prototype.eatWhile = function(match) {
      this.start = this.pos;
      while (eat(match)) {
        continue;
      }
      return this.pos > this.start;
    };

    StringStream.prototype.eatSpace = function() {
      this.start = this.pos;
      while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) {
        ++this.pos;
      }
      return this.pos > this.start;
    };

    StringStream.prototype.skipToEnd = function() {
      return this.pos = this.string.length;
    };

    StringStream.prototype.skipTo = function(ch) {
      var found;
      found = this.string.indexOf(ch, this.pos);
      if (found > -1) {
        this.pos = found;
        return true;
      }
    };

    StringStream.prototype.backUp = function(n) {
      return this.pos -= n;
    };

    StringStream.prototype.column = function() {
      return this.pen.countColumn(this.string, this.start, this.tabSize);
    };

    StringStream.prototype.indentation = function() {
      return this.pen.countColumn(this.string, null, this.tabSize);
    };

    StringStream.prototype.match = function(pattern, consume, caseInsensitive) {
      var cased, match;
      var _this = this;
      if (typeof pattern === "string") {
        cased = function(str) {
          if (caseInsensitive) {
            return str.toLowerCase();
          } else {
            return str;
          }
        };
        if (cased(this.string).indexOf(cased(pattern), this.pos) === this.pos) {
          if (consume !== false) this.pos += pattern.length;
          return true;
        }
      } else {
        match = this.string.slice(this.pos).match(pattern);
        if (match && consume !== false) this.pos += match[0].length;
        return match;
      }
    };

    StringStream.prototype.current = function() {
      return this.string.slice(this.start, this.pos);
    };

    return StringStream;

  })();

  module.exports = StringStream;

}).call(this);
}, "lib/pen/marks/textmarker": function(exports, require, module) {(function() {
  var TextMarker;

  TextMarker = (function() {

    TextMarker.prototype.pen = null;

    TextMarker.prototype.set = [];

    function TextMarker(pen, set) {
      this.pen = pen;
      this.set = set;
    }

    TextMarker.prototype.clear = TextMarker.pen.operation(function() {
      var e, i, j, line, lineN, max, min, mk;
      min = Infinity;
      max = -Infinity;
      i = 0;
      e = this.set.length;
      while (i < e) {
        line = this.set[i];
        mk = line.marked;
        if (!mk || !line.parent) continue;
        lineN = this.pen.lineNo(line);
        min = Math.min(min, lineN);
        max = Math.max(max, lineN);
        j = 0;
        while (j < mk.length) {
          if (mk[j].set === this.set) mk.splice(j--, 1);
          ++j;
        }
        ++i;
      }
      if (min !== Infinity) {
        return this.pen.changes.push({
          from: min,
          to: max + 1
        });
      }
    });

    TextMarker.prototype.find = function() {
      var e, found, from, i, j, line, mark, mk, to;
      from = void 0;
      to = void 0;
      i = 0;
      e = this.set.length;
      while (i < e) {
        line = this.set[i];
        mk = line.marked;
        j = 0;
        while (j < mk.length) {
          mark = mk[j];
          if (mark.set === this.set) {
            if ((mark.from != null) || (mark.to != null)) {
              found = this.pen.lineNo(line);
              if (found != null) {
                if (mark.from != null) {
                  from = {
                    line: found,
                    ch: mark.from
                  };
                }
                if (mark.to != null) {
                  to = {
                    line: found,
                    ch: mark.to
                  };
                }
              }
            }
          }
          ++j;
        }
        ++i;
      }
      return {
        from: from,
        to: to
      };
    };

    return TextMarker;

  })();

  module.exports = TextMarker;

}).call(this);
}, "lib/pen/misc/Commands": function(exports, require, module) {(function() {
  var Commands, Keys;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Keys = require('lib/pen/core/Keys');

  Commands = (function() {

    __extends(Commands, Keys);

    function Commands() {
      Commands.__super__.constructor.apply(this, arguments);
    }

    Commands.prototype.commands = {
      selectAll: function(cm) {
        return cm.setSelection({
          line: 0,
          ch: 0
        }, {
          line: cm.lineCount() - 1
        });
      },
      killLine: function(cm) {
        var from, sel, to;
        from = cm.getCursor(true);
        to = cm.getCursor(false);
        sel = !this.posEq(from, to);
        if (!sel && cm.getLine(from.line).length === from.ch) {
          return cm.replaceRange("", from, {
            line: from.line + 1,
            ch: 0
          });
        } else {
          return cm.replaceRange("", from, (sel ? to : {
            line: from.line
          }));
        }
      },
      deleteLine: function(cm) {
        var l;
        l = cm.getCursor().line;
        return cm.replaceRange("", {
          line: l,
          ch: 0
        }, {
          line: l
        });
      },
      undo: function(cm) {
        return cm.undo();
      },
      redo: function(cm) {
        return cm.redo();
      },
      goDocStart: function(cm) {
        return cm.setCursor(0, 0, true);
      },
      goDocEnd: function(cm) {
        return cm.setSelection({
          line: cm.lineCount() - 1
        }, null, true);
      },
      goLineStart: function(cm) {
        return cm.setCursor(cm.getCursor().line, 0, true);
      },
      goLineStartSmart: function(cm) {
        var cur, firstNonWS, text;
        cur = cm.getCursor();
        text = cm.getLine(cur.line);
        firstNonWS = Math.max(0, text.search(/\S/));
        return cm.setCursor(cur.line, (cur.ch <= firstNonWS && cur.ch ? 0 : firstNonWS), true);
      },
      goLineEnd: function(cm) {
        return cm.setSelection({
          line: cm.getCursor().line
        }, null, true);
      },
      goLineUp: function(cm) {
        return cm.moveV(-1, "line");
      },
      goLineDown: function(cm) {
        return cm.moveV(1, "line");
      },
      goPageUp: function(cm) {
        return cm.moveV(-1, "page");
      },
      goPageDown: function(cm) {
        return cm.moveV(1, "page");
      },
      goCharLeft: function(cm) {
        return cm.moveH(-1, "char");
      },
      goCharRight: function(cm) {
        return cm.moveH(1, "char");
      },
      goColumnLeft: function(cm) {
        return cm.moveH(-1, "column");
      },
      goColumnRight: function(cm) {
        return cm.moveH(1, "column");
      },
      goWordLeft: function(cm) {
        return cm.moveH(-1, "word");
      },
      goWordRight: function(cm) {
        return cm.moveH(1, "word");
      },
      delCharLeft: function(cm) {
        return cm.deleteH(-1, "char");
      },
      delCharRight: function(cm) {
        return cm.deleteH(1, "char");
      },
      delWordLeft: function(cm) {
        return cm.deleteH(-1, "word");
      },
      delWordRight: function(cm) {
        return cm.deleteH(1, "word");
      },
      indentAuto: function(cm) {
        return cm.indentSelection("smart");
      },
      indentMore: function(cm) {
        return cm.indentSelection("add");
      },
      indentLess: function(cm) {
        return cm.indentSelection("subtract");
      },
      insertTab: function(cm) {
        return cm.replaceSelection("\t", "end");
      },
      transposeChars: function(cm) {
        var cur, line;
        cur = cm.getCursor();
        line = cm.getLine(cur.line);
        if (cur.ch > 0 && cur.ch < line.length - 1) {
          return cm.replaceRange(line.charAt(cur.ch) + line.charAt(cur.ch - 1), {
            line: cur.line,
            ch: cur.ch - 1
          }, {
            line: cur.line,
            ch: cur.ch + 1
          });
        }
      },
      newlineAndIndent: function(cm) {
        cm.replaceSelection("\n", "end");
        return cm.indentLine(cm.getCursor().line);
      },
      toggleOverwrite: function(cm) {
        return cm.toggleOverwrite();
      }
    };

    return Commands;

  })();

  module.exports = Commands;

}).call(this);
}, "lib/pen/misc/Helpers": function(exports, require, module) {(function() {
  var Helpers;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Helpers = (function() {

    function Helpers() {
      this.operation = __bind(this.operation, this);
      this.endOperation = __bind(this.endOperation, this);
      this.startOperation = __bind(this.startOperation, this);
      this.connect = __bind(this.connect, this);
    }

    Helpers.prototype.nestedOperation = 0;

    Helpers.prototype.updateInput = null;

    Helpers.prototype.changes = [];

    Helpers.prototype.selectionChanged = false;

    Helpers.prototype.callbacks = [];

    Helpers.prototype.userSelChange = null;

    Helpers.prototype.textChanged = null;

    Helpers.prototype.reScroll = null;

    Helpers.prototype.updated = void 0;

    Helpers.prototype.gutterDirty = false;

    Helpers.prototype.leaveInputAlone = false;

    Helpers.prototype.bracketHighlighted = false;

    Helpers.prototype.connect = function(node, type, handler, disconnect) {
      var wrapHandler;
      var _this = this;
      if (typeof node.addEventListener === "function") {
        node.addEventListener(type, handler, false);
        if (disconnect) {
          return function() {
            return node.removeEventListener(type, handler, false);
          };
        }
      } else {
        wrapHandler = function(event) {
          return handler(event || window.event);
        };
        node.attachEvent("on" + type, wrapHandler);
        if (disconnect) {
          return function() {
            return node.detachEvent("on" + type, wrapHandle);
          };
        }
      }
    };

    Helpers.prototype.startOperation = function() {
      this.updateInput = this.userSelChange = this.textChanged = null;
      this.changes = [];
      this.selectionChanged = false;
      return this.callbacks = [];
    };

    Helpers.prototype.endOperation = function() {
      var cbs, i, reScroll, tc, updated;
      reScroll = false;
      updated = void 0;
      if (this.selectionChanged) reScroll = !this.scrollCursorIntoView();
      if (this.changes.length) {
        updated = this.updateDisplay(this.changes, true);
      } else {
        if (this.selectionChanged) this.updateCursor();
        if (this.gutterDirty) this.updateGutter();
      }
      if (reScroll) this.scrollCursorIntoView();
      if (this.selectionChanged) {
        this.scrollEditorIntoView();
        this.restartBlink();
      }
      if (this.focused && !this.leaveInputAlone && (this.updateInput === true || (this.updateInput !== false && this.selectionChanged))) {
        this.resetInput(this.userSelChange);
      }
      if (this.selectionChanged && this.options.matchBrackets) {
        setTimeout(this.operation(function() {
          if (this.bracketHighlighted) {
            this.bracketHighlighted();
            this.bracketHighlighted = null;
          }
          if (this.posEq(this.sel.from, this.sel.to)) {
            return this.matchBrackets(false);
          }
        }), 20);
      }
      tc = this.textChanged;
      cbs = this.callbacks;
      if (this.selectionChanged && this.options.onCursorActivity) {
        this.options.onCursorActivity(this);
      }
      if (tc && this.options.onChange && this) this.options.onChange(this, tc);
      i = 0;
      while (i < cbs.length) {
        cbs[i](this);
        ++i;
      }
      if (updated && this.options.onUpdate) return this.options.onUpdate(this);
    };

    Helpers.prototype.operation = function(f) {
      var _this = this;
      return function() {
        var result;
        if (!_this.nestedOperation++) _this.startOperation();
        try {
          result = f.apply(_this, arguments);
        } finally {
          if (!--_this.nestedOperation) _this.endOperation();
        }
        return result;
      };
    };

    Helpers.prototype.getTemplate = function(templateName) {
      var template;
      template = '<div style="overflow: hidden; position: relative; width: 3px; height: 0px;">';
      template = template + '<textarea id="Pen-input-shim" style="position: absolute; padding: 0; width: 1px;" wrap="off" autocorrect="off" autocapitalize="off"></textarea>';
      template = template + '</div>';
      template = template + '<div class="Pen-scroll" tabindex="-1">';
      template = template + '<div style="position: relative">';
      template = template + '<div style="position: relative">';
      template = template + '<div class="Pen-gutter"><div class="Pen-gutter-text"></div></div>';
      template = template + '<div class="Pen-lines"><div style="position: relative">';
      template = template + '<div style="position: absolute; width: 100%; height: 0; overflow: hidden; visibility: hidden"></div>';
      template = template + '<pre class="Pen-cursor">&#160;</pre>';
      template = template + '<div></div>';
      template = template + '</div></div></div></div></div>';
      return template;
    };

    return Helpers;

  })();

  module.exports = Helpers;

}).call(this);
}, "lib/pen/misc/history": function(exports, require, module) {(function() {
  var History;

  History = (function() {

    History.prototype.time = 0;

    History.prototype.done = [];

    History.prototype.undone = [];

    function History() {
      this.time = 0;
      this.done = [];
      this.undone = [];
    }

    History.prototype.addChange = function(start, added, old) {
      var e, i, last, oldoff, time;
      this.undone.length = 0;
      time = +(new Date);
      last = this.done[this.done.length - 1];
      if (time - this.time > 400 || !last || last.start > start + added || last.start + last.added < start - last.added + last.old.length) {
        this.done.push({
          start: start,
          added: added,
          old: old
        });
      } else {
        oldoff = 0;
        if (start < last.start) {
          i = last.start - start - 1;
          while (i >= 0) {
            last.old.unshift(old[i]);
            --i;
          }
          last.added += last.start - start;
          last.start = start;
        } else if (last.start < start) {
          oldoff = start - last.start;
          added += oldoff;
        }
        i = last.added - oldoff;
        e = old.length;
        while (i < e) {
          last.old.push(old[i]);
          ++i;
        }
        if (last.added < added) last.added = added;
      }
      return this.time = time;
    };

    return History;

  })();

  module.exports = History;

}).call(this);
}, "lib/pen/parsers/markdown/Markdown": function(exports, require, module) {(function() {
  var Markdown, Pen;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Pen = require("lib/pen/main");

  Markdown = (function() {

    Markdown.prototype.header = {
      style: "header",
      type: "h1",
      lineHeight: 26
    };

    Markdown.prototype.code = "comment";

    Markdown.prototype.quote = "quote";

    Markdown.prototype.list = {
      style: "string",
      type: "li",
      lineHeight: 12
    };

    Markdown.prototype.hr = "hr";

    Markdown.prototype.linktext = "link";

    Markdown.prototype.linkhref = "string";

    Markdown.prototype.em = "em";

    Markdown.prototype.strong = "strong";

    Markdown.prototype.emstrong = "emstrong";

    Markdown.prototype.hrRE = /^[*-=_]/;

    Markdown.prototype.ulRE = /^[*-+]\s+/;

    Markdown.prototype.olRE = /^[0-9]\.\s+/;

    Markdown.prototype.headerRE = /^(?:\={3,}|-{3,})$/;

    Markdown.prototype.codeRE = /^(k:\t|\s{4,})/;

    Markdown.prototype.textRE = /^[^\[*_\\<>`]+/;

    function Markdown(pen, config, parserConfig) {
      this.handleText = __bind(this.handleText, this);
      this.blockNormal = __bind(this.blockNormal, this);      this.pen = pen;
      this.config = config;
      this.parserConfig = parserConfig;
      this.htmlMode = this.pen.getMode(config, {
        name: "xml",
        htmlMode: true
      });
    }

    Markdown.prototype.switchInline = function(stream, state, f) {
      state.f = state.inline = f;
      return f(stream, state);
    };

    Markdown.prototype.switchBlock = function(stream, state, f) {
      state.f = state.block = f;
      return f(stream, state);
    };

    Markdown.prototype.blockNormal = function(stream, state) {
      var match;
      if (stream.match(this.codeRE)) {
        stream.skipToEnd();
        return this.code;
      }
      if (stream.eatSpace()) return null;
      if (stream.peek() === "#" || stream.match(this.headerRE)) {
        stream.skipToEnd();
        return this.header;
      }
      if (match = stream.match(this.ulRE, true) || stream.match(this.olRE, true)) {
        state.indentation += match[0].length;
        return this.list;
      }
      stream.skipToEnd();
      return null;
    };

    Markdown.prototype.htmlBlock = function(stream, state) {
      var style;
      style = this.htmlMode.token(stream, state.htmlState);
      if (style === "tag" && state.htmlState.type !== "openTag" && !state.htmlState.context) {
        state.f = this.inlineNormal;
        state.block = this.blockNormal;
      }
      return style;
    };

    Markdown.prototype.getType = function(state) {
      if (state.strong) {
        if (state.em) {
          return this.emstrong;
        } else {
          return strong;
        }
      } else {
        if (state.em) {
          return this.em;
        } else {
          return null;
        }
      }
    };

    Markdown.prototype.handleText = function(stream, state) {
      if (stream.match(this.textRE, true)) return this.getType(state);
      return 'undefined';
    };

    Markdown.prototype.inlineNormal = function(stream, state) {
      var ch, style, t;
      style = state.text(stream, state);
      if (typeof style !== "undefined") return style;
      ch = stream.next();
      if (ch === "\\") {
        stream.next();
        return this.getType(state);
      }
      if (ch === "`") {
        return this.switchInline(stream, state, this.inlineElement(code, "`"));
      }
      if (ch === "[") return this.switchInline(stream, state, this.linkText);
      if (ch === "<" && stream.match(/^\w/, false)) {
        stream.backUp(1);
        return this.switchBlock(stream, state, this.htmlBlock);
      }
      t = this.getType(state);
      if (ch === "*" || ch === "_") {
        if (stream.eat(ch)) {
          return ((state.strong = !state.strong) ? this.getType(state) : t);
        }
        return ((state.em = !state.em) ? this.getType(state) : t);
      }
      return this.getType(state);
    };

    Markdown.prototype.linkText = function(stream, state) {
      var ch;
      while (!stream.eol()) {
        ch = stream.next();
        if (ch === "\\") stream.next();
        if (ch === "]") {
          state.inline = state.f = this.linkHref;
          return this.linktext;
        }
      }
      return this.linktext;
    };

    Markdown.prototype.linkHref = function(stream, state) {
      var ch;
      stream.eatSpace();
      ch = stream.next();
      if (ch === "(" || ch === "[") {
        return this.switchInline(stream, state, this.inlineElement(this.linkhref, (ch === "(" ? ")" : "]")));
      }
      return "error";
    };

    Markdown.prototype.footnoteLink = function(stream, state) {
      if (stream.match(/^[^\]]*\]:/, true)) {
        state.f = this.footnoteUrl;
        return this.linktext;
      }
      return this.switchInline(stream, state, this.inlineNormal);
    };

    Markdown.prototype.footnoteUrl = function(stream, state) {
      stream.eatSpace();
      stream.match(/^[^\s]+/, true);
      state.f = state.inline = this.inlineNormal;
      return this.linkhref;
    };

    Markdown.prototype.inlineRE = function(endChar) {
      if (!this.inlineRE[endChar]) {
        this.inlineRE[endChar] = new RegExp("^(?:[^\\\\\\" + endChar + "]|\\\\.)*(?:\\" + endChar + "|$)");
      }
      return this.inlineRE[endChar];
    };

    Markdown.prototype.inlineElement = function(type, endChar, next) {
      next = next || this.inlineNormal;
      return function(stream, state) {
        stream.match(this.inlineRE(endChar));
        state.inline = state.f = next;
        return type;
      };
    };

    Markdown.prototype.startState = function() {
      return {
        f: this.blockNormal,
        block: this.blockNormal,
        htmlState: this.htmlMode.startState(),
        indentation: 0,
        inline: this.inlineNormal,
        text: this.handleText,
        em: false,
        strong: false
      };
    };

    Markdown.prototype.copyState = function(s) {
      return {
        f: s.f,
        block: s.block,
        htmlState: this.pen.copyState(this.htmlMode, s.htmlState),
        indentation: s.indentation,
        inline: s.inline,
        text: s.text,
        em: s.em,
        strong: s.strong
      };
    };

    Markdown.prototype.token = function(stream, state) {
      var currentIndentation, previousIndentation;
      if (stream.sol()) {
        state.f = state.block;
        previousIndentation = state.indentation;
        currentIndentation = 0;
        while (previousIndentation > 0) {
          if (stream.eat(" ")) {
            previousIndentation--;
            currentIndentation++;
          } else if (previousIndentation >= 4 && stream.eat("\t")) {
            previousIndentation -= 4;
            currentIndentation += 4;
          } else {
            break;
          }
        }
        state.indentation = currentIndentation;
        if (currentIndentation > 0) return null;
      }
      return state.f(stream, state);
    };

    return Markdown;

  })();

  module.exports = Markdown;

}).call(this);
}, "lib/pen/parsers/xml/Xml": function(exports, require, module) {(function() {
  var Xml;

  Xml = (function() {

    Xml.prototype.electricChars = "/";

    Xml.prototype.tagName = void 0;

    Xml.prototype.type = void 0;

    Xml.prototype.curState = void 0;

    Xml.prototype.setStyle = void 0;

    function Xml(pen, config, parserConfig) {
      var Kludges;
      this.pen = pen;
      this.config = config;
      this.parserConfig = parserConfig;
      this.indentUnit = this.config.indentUnit;
      Kludges = (this.parserConfig.htmlMode ? {
        autoSelfClosers: {
          br: true,
          img: true,
          hr: true,
          link: true,
          input: true,
          meta: true,
          col: true,
          frame: true,
          base: true,
          area: true
        },
        doNotIndent: {
          pre: true
        },
        allowUnquoted: true
      } : {
        autoSelfClosers: {},
        doNotIndent: {},
        allowUnquoted: false
      });
      this.alignCDATA = this.parserConfig.alignCDATA;
    }

    Xml.prototype.inText = function(stream, state) {
      var c, ch, chain, tagName, type;
      var _this = this;
      chain = function(parser) {
        state.tokenize = parser;
        return parser(stream, state);
      };
      ch = stream.next();
      if (ch === "<") {
        if (stream.eat("!")) {
          if (stream.eat("[")) {
            if (stream.match("CDATA[")) {
              return chain(inBlock("atom", "]]>"));
            } else {
              return null;
            }
          } else if (stream.match("--")) {
            return chain(inBlock("comment", "-->"));
          } else if (stream.match("DOCTYPE", true, true)) {
            stream.eatWhile(/[\w\._\-]/);
            return chain(doctype(1));
          } else {
            return null;
          }
        } else if (stream.eat("?")) {
          stream.eatWhile(/[\w\._\-]/);
          state.tokenize = inBlock("meta", "?>");
          return "meta";
        } else {
          type = (stream.eat("/") ? "closeTag" : "openTag");
          stream.eatSpace();
          tagName = "";
          c = void 0;
          while ((c = stream.eat(/[^\s\u00a0=<>\"\'\/?]/))) {
            tagName += c;
          }
          state.tokenize = inTag;
          return "tag";
        }
      } else if (ch === "&") {
        stream.eatWhile(/[^;]/);
        stream.eat(";");
        return "atom";
      } else {
        stream.eatWhile(/[^&<]/);
        return null;
      }
    };

    Xml.prototype.inTag = function(stream, state) {
      var ch, type;
      ch = stream.next();
      if (ch === ">" || (ch === "/" && stream.eat(">"))) {
        state.tokenize = inText;
        type = (ch === ">" ? "endTag" : "selfcloseTag");
        return "tag";
      } else if (ch === "=") {
        type = "equals";
        return null;
      } else if (/[\'\"]/.test(ch)) {
        state.tokenize = inAttribute(ch);
        return state.tokenize(stream, state);
      } else {
        stream.eatWhile(/[^\s\u00a0=<>\"\'\/?]/);
        return "word";
      }
    };

    Xml.prototype.inAttribute = function(quote) {
      var _this = this;
      return function(stream, state) {
        while (!stream.eol()) {
          if (stream.next() === quote) {
            state.tokenize = inTag;
            break;
          }
        }
        return "string";
      };
    };

    Xml.prototype.inBlock = function(style, terminator) {
      var _this = this;
      return function(stream, state) {
        while (!stream.eol()) {
          if (stream.match(terminator)) {
            state.tokenize = inText;
            break;
          }
          stream.next();
        }
        return style;
      };
    };

    Xml.prototype.doctype = function(depth) {
      var _this = this;
      return function(stream, state) {
        var ch;
        ch = void 0;
        while ((ch = stream.next()) != null) {
          if (ch === "<") {
            state.tokenize = doctype(depth + 1);
            return state.tokenize(stream, state);
          } else if (ch === ">") {
            if (depth === 1) {
              state.tokenize = inText;
              break;
            } else {
              state.tokenize = doctype(depth - 1);
              return state.tokenize(stream, state);
            }
          }
        }
        return "meta";
      };
    };

    Xml.prototype.pass = function() {
      var i, _results;
      i = arguments.length - 1;
      _results = [];
      while (i >= 0) {
        this.curState.cc.push(arguments[i]);
        _results.push(i--);
      }
      return _results;
    };

    Xml.prototype.cont = function() {
      this.pass.apply(null, arguments);
      return true;
    };

    Xml.prototype.pushContext = function(tagName, startOfLine) {
      this.noIndent = this.Kludges.doNotIndent.hasOwnProperty(this.tagName) || (this.curState.context && this.curState.context.noIndent);
      return this.curState.context = {
        prev: curState.context,
        tagName: tagName,
        indent: curState.indented,
        startOfLine: startOfLine,
        noIndent: noIndent
      };
    };

    Xml.prototype.popContext = function() {
      if (this.curState.context) {
        return this.curState.context = this.curState.context.prev;
      }
    };

    Xml.prototype.element = function(type) {
      var err, setStyle;
      if (type === "openTag") {
        curState.tagName = tagName;
        return cont(attributes, endtag(curState.startOfLine));
      } else if (type === "closeTag") {
        err = false;
        if (curState.context) {
          err = curState.context.tagName !== tagName;
        } else {
          err = true;
        }
        if (err) setStyle = "error";
        return cont(endclosetag(err));
      }
      return cont();
    };

    Xml.prototype.endtag = function(startOfLine) {
      return function(type) {
        if (type === "selfcloseTag" || (type === "endTag" && Kludges.autoSelfClosers.hasOwnProperty(curState.tagName.toLowerCase()))) {
          return cont();
        }
        if (type === "endTag") {
          pushContext(curState.tagName, startOfLine);
          return cont();
        }
        return cont();
      };
    };

    Xml.prototype.endclosetag = function(err) {
      return function(type) {
        var setStyle;
        if (err) setStyle = "error";
        if (type === "endTag") {
          popContext();
          return cont();
        }
        setStyle = "error";
        return cont(arguments.callee);
      };
    };

    Xml.prototype.attributes = function(type) {
      var setStyle;
      if (type === "word") {
        setStyle = "attribute";
        return cont(attributes);
      }
      if (type === "equals") return cont(attvalue, attributes);
      if (type === "string") {
        setStyle = "error";
        return cont(attributes);
      }
      return pass();
    };

    Xml.prototype.attvalue = function(type) {
      var setStyle;
      if (type === "word" && Kludges.allowUnquoted) {
        setStyle = "string";
        return cont();
      }
      if (type === "string") return cont(attvaluemaybe);
      return pass();
    };

    Xml.prototype.attvaluemaybe = function(type) {
      if (type === "string") {
        return this.cont(this.attvaluemaybe);
      } else {
        return this.pass();
      }
    };

    Xml.prototype.startState = function() {
      return {
        tokenize: this.inText,
        cc: [],
        indented: 0,
        startOfLine: true,
        tagName: null,
        context: null
      };
    };

    Xml.prototype.token = function(stream, state) {
      var comb, curState, setStyle, style, tagName, type;
      if (stream.sol()) {
        state.startOfLine = true;
        state.indented = stream.indentation();
      }
      if (stream.eatSpace()) return null;
      setStyle = type = tagName = null;
      style = state.tokenize(stream, state);
      state.type = type;
      if ((style || type) && style !== "comment") {
        curState = state;
        while (true) {
          comb = state.cc.pop() || element;
          if (comb(type || style)) break;
        }
      }
      state.startOfLine = false;
      return setStyle || style;
    };

    Xml.prototype.indent = function(state, textAfter, fullLine) {
      var context;
      context = state.context;
      if ((state.tokenize !== inTag && state.tokenize !== inText) || context && context.noIndent) {
        return (fullLine ? fullLine.match(/^(\s*)/)[0].length : 0);
      }
      if (alignCDATA && /<!\[CDATA\[/.test(textAfter)) return 0;
      if (context && /^<\//.test(textAfter)) context = context.prev;
      while (context && !context.startOfLine) {
        context = context.prev;
      }
      if (context) {
        return context.indent + indentUnit;
      } else {
        return 0;
      }
    };

    Xml.prototype.compareStates = function(a, b) {
      var ca, cb, _results;
      if (a.indented !== b.indented || a.tokenize !== b.tokenize) return false;
      ca = a.context;
      cb = b.context;
      _results = [];
      while (true) {
        if (!ca || !cb) return ca === cb;
        if (ca.tagName !== cb.tagName) return false;
        ca = ca.prev;
        _results.push(cb = cb.prev);
      }
      return _results;
    };

    return Xml;

  })();

  module.exports = Xml;

}).call(this);
}, "lib/pen/text/branch": function(exports, require, module) {(function() {
  var BranchChunk, LeafChunk;

  LeafChunk = require('lib/pen/text/leaf');

  BranchChunk = (function() {

    BranchChunk.prototype.children = void 0;

    BranchChunk.prototype.size = void 0;

    BranchChunk.prototype.height = void 0;

    BranchChunk.prototype.parent = null;

    BranchChunk.prototype.collaspe = null;

    function BranchChunk(children) {
      var ch, e, height, i, size;
      this.children = children;
      size = 0;
      height = 0;
      i = 0;
      e = children.length;
      while (i < e) {
        ch = children[i];
        size += ch.chunkSize();
        height += ch.height;
        ch.parent = this;
        ++i;
      }
      this.size = size;
      this.height = height;
      this.parent = null;
    }

    BranchChunk.prototype.chunkSize = function() {
      return this.size;
    };

    BranchChunk.prototype.remove = function(at, n, callbacks) {
      var child, i, lines, oldHeight, rm, sz;
      this.size -= n;
      i = 0;
      while (i < this.children.length) {
        child = this.children[i];
        sz = child.chunkSize();
        if (at < sz) {
          rm = Math.min(n, sz - at);
          oldHeight = child.height;
          child.remove(at, rm, callbacks);
          this.height -= oldHeight - child.height;
          if (sz === rm) {
            this.children.splice(i--, 1);
            child.parent = null;
          }
          if ((n -= rm) === 0) break;
          at = 0;
        } else {
          at -= sz;
        }
        ++i;
      }
      if (this.size - n < 25) {
        lines = [];
        this.collapse(lines);
        return this.children = [new LeafChunk(lines)];
      }
    };

    BranchChunk.prototype.collapse = function(lines) {
      var e, i, _results;
      i = 0;
      e = this.children.length;
      _results = [];
      while (i < e) {
        this.children[i].collapse(lines);
        _results.push(++i);
      }
      return _results;
    };

    BranchChunk.prototype.insert = function(at, lines) {
      var e, height, i;
      height = 0;
      i = 0;
      e = lines.length;
      while (i < e) {
        height += lines[i].height;
        ++i;
      }
      return this.insertHeight(at, lines, height);
    };

    BranchChunk.prototype.insertHeight = function(at, lines, height) {
      var child, e, i, newleaf, spilled, sz, _results;
      this.size += lines.length;
      this.height += height;
      i = 0;
      e = this.children.length;
      _results = [];
      while (i < e) {
        child = this.children[i];
        sz = child.chunkSize();
        if (at <= sz) {
          child.insertHeight(at, lines, height);
          if (child.lines && child.lines.length > 50) {
            while (child.lines.length > 50) {
              spilled = child.lines.splice(child.lines.length - 25, 25);
              newleaf = new LeafChunk(spilled);
              child.height -= newleaf.height;
              this.children.splice(i + 1, 0, newleaf);
              newleaf.parent = this;
            }
            this.maybeSpill();
          }
          break;
        }
        at -= sz;
        _results.push(++i);
      }
      return _results;
    };

    BranchChunk.prototype.maybeSpill = function() {
      var copy, me, myIndex, sibling, spilled;
      if (this.children.length <= 10) return;
      me = this;
      while (true) {
        spilled = me.children.splice(me.children.length - 5, 5);
        sibling = new BranchChunk(spilled);
        if (!me.parent) {
          copy = new BranchChunk(me.children);
          copy.parent = me;
          me.children = [copy, sibling];
          me = copy;
        } else {
          me.size -= sibling.size;
          me.height -= sibling.height;
          myIndex = this.pen.indexOf(me.parent.children, me);
          me.parent.children.splice(myIndex + 1, 0, sibling);
        }
        sibling.parent = me.parent;
        if (!(me.children.length > 10)) break;
      }
      return me.parent.maybeSpill();
    };

    BranchChunk.prototype.iter = function(from, to, op) {
      return this.iterN(from, to - from, op);
    };

    BranchChunk.prototype.iterN = function(at, n, op) {
      var child, e, i, sz, used, _results;
      i = 0;
      e = this.children.length;
      _results = [];
      while (i < e) {
        child = this.children[i];
        sz = child.chunkSize();
        if (at < sz) {
          used = Math.min(n, sz - at);
          if (child.iterN(at, used, op)) return true;
          if ((n -= used) === 0) break;
          at = 0;
        } else {
          at -= sz;
        }
        _results.push(++i);
      }
      return _results;
    };

    return BranchChunk;

  })();

  module.exports = BranchChunk;

}).call(this);
}, "lib/pen/text/leaf": function(exports, require, module) {(function() {
  var LeafChunk;

  LeafChunk = (function() {

    LeafChunk.prototype.lines = null;

    LeafChunk.prototype.parent = null;

    LeafChunk.prototype.height = 0;

    function LeafChunk(lines) {
      var e, height, i;
      this.lines = lines;
      this.parent = null;
      i = 0;
      e = lines.length;
      height = 0;
      while (i < e) {
        lines[i].parent = this;
        height += lines[i].height;
        ++i;
      }
      this.height = height;
    }

    LeafChunk.prototype.chunkSize = function() {
      return this.lines.length;
    };

    LeafChunk.prototype.remove = function(at, n, callbacks) {
      var e, i, j, line;
      i = at;
      e = at + n;
      while (i < e) {
        line = this.lines[i];
        this.height -= line.height;
        line.cleanUp();
        if (line.handlers) {
          j = 0;
          while (j < line.handlers.length) {
            callbacks.push(line.handlers[j]);
            ++j;
          }
        }
        ++i;
      }
      return this.lines.splice(at, n);
    };

    LeafChunk.prototype.collapse = function(lines) {
      return lines.splice.apply(lines, [lines.length, 0].concat(this.lines));
    };

    LeafChunk.prototype.insertHeight = function(at, lines, height) {
      var e, i, _results;
      this.height += height;
      this.lines.splice.apply(this.lines, [at, 0].concat(lines));
      i = 0;
      e = lines.length;
      _results = [];
      while (i < e) {
        lines[i].parent = this;
        _results.push(++i);
      }
      return _results;
    };

    LeafChunk.prototype.iterN = function(at, n, op) {
      var e;
      e = at + n;
      while (at < e) {
        if (op(this.lines[at]) === false) return false;
        ++at;
      }
      return true;
    };

    return LeafChunk;

  })();

  module.exports = LeafChunk;

}).call(this);
}, "lib/pen/text/line": function(exports, require, module) {(function() {
  var Line, StringStream;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  StringStream = require('lib/pen/marks/stringstream');

  Line = (function() {

    Line.prototype.styles = null;

    Line.prototype.text = null;

    Line.prototype.height = 0;

    Line.prototype.heightPX = 0;

    Line.prototype.marked = null;

    Line.prototype.gutterMarker = null;

    Line.prototype.className = null;

    Line.prototype.handlers = null;

    Line.prototype.stateAfter = null;

    Line.prototype.parent = null;

    Line.prototype.hidden = null;

    Line.prototype.changed = null;

    Line.prototype.curWord = null;

    Line.prototype.prevWord = null;

    Line.prototype.start = null;

    Line.prototype.end = null;

    Line.prototype.state = null;

    Line.prototype.pen = null;

    function Line(pen, text, styles) {
      this.getHTML = __bind(this.getHTML, this);      this.pen = pen;
      this.styles = styles || [text, null];
      this.text = text;
      this.height = 1;
      this.marked = this.gutterMarker = this.className = this.handlers = null;
      this.stateAfter = this.parent = this.hidden = null;
    }

    Line.inheritMarks = function(pen, text, orig) {
      var i, ln, mark, mk, newmk, nmark;
      ln = new Line(pen, text);
      mk = orig && orig.marked;
      if (mk) {
        i = 0;
        while (i < mk.length) {
          if (!(mk[i].to != null) && mk[i].style) {
            newmk = ln.marked || (ln.marked = []);
            mark = mk[i];
            nmark = mark.dup();
            newmk.push(nmark);
            nmark.attach(ln);
          }
          ++i;
        }
      }
      return ln;
    };

    Line.prototype.split = function(pos, textBefore) {
      var i, mark, mk, newmark, st, taken;
      st = [textBefore, null];
      mk = this.marked;
      this.pen.copyStyles(pos, this.text.length, this.styles, st);
      taken = new Line(this.pen, textBefore + this.text.slice(pos), st);
      if (mk) {
        i = 0;
        while (i < mk.length) {
          mark = mk[i];
          newmark = mark.split(pos, textBefore.length);
          if (newmark) {
            if (!taken.marked) taken.marked = [];
            taken.marked.push(newmark);
            newmark.attach(taken);
          }
          ++i;
        }
      }
      return taken;
    };

    Line.prototype.append = function(line) {
      var breakLoop1, breakloop1, i, j, mark, mk, mylen, mymark, mymk, _results;
      mylen = this.text.length;
      mk = line.marked;
      mymk = this.marked;
      this.text += line.text;
      this.pen.copyStyles(0, line.text.length, line.styles, this.styles);
      if (mymk) {
        i = 0;
        while (i < mymk.length) {
          if (mymk[i].to == null) mymk[i].to = mylen;
          ++i;
        }
      }
      if (mk && mk.length) {
        if (!mymk) this.marked = mymk = [];
        i = 0;
        _results = [];
        while (i < mk.length) {
          breakloop1 = false;
          mark = mk[i];
          if (!mark.from) {
            j = 0;
            while (j < mymk.length) {
              mymark = mymk[j];
              if (mymark.to === mylen && mymark.sameSet(mark)) {
                mymark.to = (!(mark.to != null) ? null : mark.to + mylen);
                if (mymark.isDead()) {
                  mymark.detach(this);
                  mk.splice(i--, 1);
                }
                breakLoop1 = true;
                break;
              }
              ++j;
            }
            if (!breakLoop1) continue;
          }
          mymk.push(mark);
          mark.attach(this);
          mark.from += mylen;
          if (mark.to != null) mark.to += mylen;
          _results.push(++i);
        }
        return _results;
      }
    };

    Line.prototype.fixMarkEnds = function(other) {
      var close, i, j, mark, mk, omk, _results;
      mk = this.marked;
      omk = other.marked;
      if (!mk) return;
      i = 0;
      _results = [];
      while (i < mk.length) {
        mark = mk[i];
        close = !(mark.to != null);
        if (close && omk) {
          j = 0;
          while (j < omk.length) {
            if (omk[j].sameSet(mark)) {
              close = false;
              break;
            }
            ++j;
          }
        }
        if (close) mark.to = this.text.length;
        _results.push(++i);
      }
      return _results;
    };

    Line.prototype.fixMarkStarts = function() {
      var i, mk, _results;
      mk = this.marked;
      if (!mk) return;
      i = 0;
      _results = [];
      while (i < mk.length) {
        if (mk[i].from == null) mk[i].from = 0;
        _results.push(++i);
      }
      return _results;
    };

    Line.prototype.addMark = function(mark) {
      var _this = this;
      mark.attach(this);
      if (this.marked == null) this.marked = [];
      this.marked.push(mark);
      return this.marked.sort(function(a, b) {
        return (a.from || 0) - (b.from || 0);
      });
    };

    Line.prototype.highlight = function(mode, state, tabSize) {
      var changed, pos, st, stream, style, substr;
      stream = new StringStream(this.pen, this.text, tabSize);
      st = this.styles;
      pos = 0;
      this.changed = false;
      this.curWord = st[0];
      this.prevWord = void 0;
      if (this.text === "" && mode.blankLine) mode.blankLine(state);
      while (!stream.eol()) {
        style = mode.token(stream, state);
        substr = this.text.slice(stream.start, stream.pos);
        stream.start = stream.pos;
        if (pos && st[pos - 1] === style) {
          st[pos - 2] += substr;
        } else if (substr) {
          if (!this.changed && (st[pos + 1] !== style || (pos && st[pos - 2] !== this.prevWord))) {
            this.changed = true;
          }
          st[pos++] = substr;
          st[pos++] = style;
          this.prevWord = this.curWord;
          this.curWord = st[pos];
        }
        if (stream.pos > 5000) {
          st[pos++] = this.text.slice(stream.pos);
          st[pos++] = null;
          break;
        }
      }
      if (st.length !== pos) {
        st.length = pos;
        changed = true;
      }
      if (pos && st[pos - 2] !== this.prevWord) this.changed = true;
      return this.changed || (st.length < 5 && this.text.length < 10 ? null : false);
    };

    Line.prototype.getTokenAt = function(mode, state, ch) {
      var stream, style, txt;
      txt = this.text;
      stream = new StringStream(this.pen, txt);
      while (stream.pos < ch && !stream.eol()) {
        stream.start = stream.pos;
        style = mode.token(stream, state);
      }
      return {
        start: stream.start,
        end: stream.pos,
        string: stream.current(),
        className: this.style || null,
        state: state
      };
    };

    Line.prototype.indentation = function(tabSize) {
      return this.pen.countColumn(this.text, null, tabSize);
    };

    Line.prototype.replace = function(from, to_, text) {
      var diff, i, mark, mk, st, to, _results;
      st = [];
      mk = this.marked;
      to = (!(to_ != null) ? this.text.length : to_);
      this.pen.copyStyles(0, from, this.styles, st);
      if (text) st.push(text, null);
      this.pen.copyStyles(to, this.text.length, this.styles, st);
      this.styles = st;
      this.text = this.text.slice(0, from) + text + this.text.slice(to);
      this.stateAfter = null;
      if (mk) {
        diff = text.length - (to - from);
        i = 0;
        _results = [];
        while (i < mk.length) {
          mark = mk[i];
          mark.clipTo(!(from != null), from || 0, !(to_ != null), to, diff);
          if (mark.isDead()) {
            mark.detach(this);
            mk.splice(i--, 1);
          }
          _results.push(++i);
        }
        return _results;
      }
    };

    Line.prototype.getHTML = function(sfrom, sto, includePre, tabText, endAt) {
      var allText, appliedStyle, ch, end, extraStyle, first, html, i, l, len, mark, marked, markpos, nextMark, pos, sg, span, st, str, style, text, upto;
      var _this = this;
      html = [];
      first = true;
      if (includePre) {
        html.push((this.className ? "<pre class=\"" + this.className + "\">" : "<pre>"));
      }
      span = function(text, style) {
        var style2, type;
        if (!text) return;
        if (first && _this.ie && text.charAt(0) === " ") {
          text = " " + text.slice(1);
        }
        first = false;
        if (style) {
          type = null;
          if (typeof style === "object") {
            style2 = style;
            style = style.style;
            type = style2.type;
            _this.heightPX = style2.lineHeight;
          }
          style = "cm-" + style;
          if (type) {
            return html.push("<" + type + " class=\"", style, "\">", _this.pen.htmlEscape(text).replace(/\t/g, tabText), "</" + type + ">");
          } else {
            return html.push("<span class=\"", style, "\">", _this.pen.htmlEscape(text).replace(/\t/g, tabText), "</span>");
          }
        } else {
          return html.push(_this.pen.htmlEscape(text).replace(/\t/g, tabText));
        }
      };
      st = this.styles;
      allText = this.text;
      marked = this.marked;
      if (sfrom === sto) sfrom = null;
      len = allText.length;
      if (endAt != null) len = Math.min(endAt, len);
      if (!allText && !(endAt != null)) {
        span(" ", ((sfrom != null) && !(sto != null) ? "Pen-selected" : null));
      } else if (!marked && !(sfrom != null)) {
        i = 0;
        ch = 0;
        while (ch < len) {
          str = st[i];
          style = st[i + 1];
          l = str.length;
          if (ch + l > len) str = str.slice(0, len - ch);
          ch += l;
          span(str, style);
          i += 2;
        }
      } else {
        pos = 0;
        i = 0;
        text = "";
        style = void 0;
        sg = 0;
        markpos = -1;
        mark = null;
        nextMark = function() {
          if (marked) {
            markpos += 1;
            return mark = (markpos < marked.length ? marked[markpos] : null);
          }
        };
        nextMark();
        while (pos < len) {
          upto = len;
          extraStyle = "";
          if (sfrom != null) {
            if (sfrom > pos) {
              upto = sfrom;
            } else if (!(sto != null) || sto > pos) {
              extraStyle = " Pen-selected";
              if (sto != null) upto = Math.min(upto, sto);
            }
          }
          while (mark && (mark.to != null) && mark.to <= pos) {
            nextMark();
          }
          if (mark) {
            if (mark.from > pos) {
              upto = Math.min(upto, mark.from);
            } else {
              extraStyle += " " + mark.style;
              if (mark.to != null) upto = Math.min(upto, mark.to);
            }
          }
          while (true) {
            end = pos + text.length;
            appliedStyle = style;
            if (extraStyle) {
              appliedStyle = (style ? style + extraStyle : extraStyle);
            }
            span((end > upto ? text.slice(0, upto - pos) : text), appliedStyle);
            if (end >= upto) {
              text = text.slice(upto - pos);
              pos = upto;
              break;
            }
            pos = end;
            text = st[i++];
            style = "cm-" + st[i++];
          }
        }
        if ((sfrom != null) && !(sto != null)) span(" ", "Pen-selected");
      }
      if (includePre) html.push("</pre>");
      return html.join("");
    };

    Line.prototype.cleanUp = function() {
      var e, i, _results;
      this.parent = null;
      if (this.marked) {
        i = 0;
        e = this.marked.length;
        _results = [];
        while (i < e) {
          this.marked[i].detach(this);
          _results.push(++i);
        }
        return _results;
      }
    };

    return Line;

  })();

  module.exports = Line;

}).call(this);
}, "lib/pen/text/Lines": function(exports, require, module) {(function() {
  var Events, Lines;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Events = require('lib/pen/core/Events');

  Lines = (function() {

    __extends(Lines, Events);

    function Lines() {
      this.onDeleteLine = __bind(this.onDeleteLine, this);
      this.splitLines = __bind(this.splitLines, this);
      this.highlightLines = __bind(this.highlightLines, this);
      this.lineInfo = __bind(this.lineInfo, this);
      this.updateLinesNoUndo = __bind(this.updateLinesNoUndo, this);
      this.updateLines = __bind(this.updateLines, this);
      Lines.__super__.constructor.apply(this, arguments);
    }

    Lines.prototype.gutterDirty = false;

    Lines.prototype.n = null;

    Lines.prototype.history = null;

    Lines.prototype.old = [];

    Lines.prototype.scroller = null;

    Lines.prototype.doc = null;

    Lines.prototype.code = null;

    Lines.prototype.sel = null;

    Lines.prototype.tabText = "";

    Lines.prototype.textChanged = null;

    Lines.prototype.recomputeMaxLength = false;

    Lines.prototype.work = null;

    Lines.prototype.tempId = Math.floor(Math.random() * 0xffffff).toString(16);

    Lines.prototype.lineSep = "\n";

    (function() {
      var te;
      te = document.createElement("textarea");
      te.value = "foo\nbar";
      if (te.value.indexOf("\r") > -1) return this.lineSep = "\r\n";
    })();

    Lines.prototype.updateLineHeight = function(line, height) {
      var diff, _results;
      this.gutterDirty = true;
      diff = height - line.height;
      this.n = line;
      _results = [];
      while (this.n) {
        this.n.height += diff;
        _results.push(this.n = n.parent);
      }
      return _results;
    };

    Lines.prototype.updateLines = function(from, to, newText, selFrom, selTo) {
      var old;
      if (this.suppressEdits) return;
      if (this.history) {
        old = [];
        this.doc.iter(from.line, to.line + 1, function(line) {
          return old.push(line.text);
        });
        this.history.addChange(from.line, newText.length, old);
        while (this.history.done.length > this.options.undoDepth) {
          this.history.done.shift();
        }
      }
      return this.updateLinesNoUndo(from, to, newText, selFrom, selTo);
    };

    Lines.prototype.updateLinesNoUndo = function(from, to, newText, selFrom, selTo) {
      var Line, added, changeObj, cur, e, firstLine, hlEnd, i, l, lastLine, lendiff, maxLineLength, newWork, nlines, perLine, prevLine, recomputeMaxLength, task, updateLine;
      var _this = this;
      Line = require('lib/pen/text/line');
      if (this.suppressEdits) return;
      recomputeMaxLength = false;
      maxLineLength = this.maxLine.length;
      if (!this.options.lineWrapping) {
        this.doc.iter(from.line, to.line, function(line) {
          if (line.text.length === maxLineLength) {
            recomputeMaxLength = true;
            return true;
          }
        });
      }
      if (from.line !== to.line || newText.length > 1) this.gutterDirty = true;
      nlines = to.line - from.line;
      firstLine = this.getLine(from.line);
      lastLine = this.getLine(to.line);
      if (from.ch === 0 && to.ch === 0 && newText[newText.length - 1] === "") {
        added = [];
        prevLine = null;
        if (from.line) {
          prevLine = this.getLine(from.line - 1);
          prevLine.fixMarkEnds(lastLine);
        } else {
          lastLine.fixMarkStarts();
        }
        i = 0;
        e = newText.length - 1;
        while (i < e) {
          added.push(Line.inheritMarks(this, newText[i], prevLine));
          ++i;
        }
        if (nlines) this.doc.remove(from.line, nlines, this.callbacks);
        if (added.length) this.doc.insert(from.line, added);
      } else if (firstLine === lastLine) {
        if (newText.length === 1) {
          firstLine.replace(from.ch, to.ch, newText[0]);
        } else {
          lastLine = firstLine.split(to.ch, newText[newText.length - 1]);
          firstLine.replace(from.ch, null, newText[0]);
          firstLine.fixMarkEnds(lastLine);
          added = [];
          i = 1;
          e = newText.length - 1;
          while (i < e) {
            added.push(Line.inheritMarks(this, newText[i], firstLine));
            ++i;
          }
          added.push(lastLine);
          this.doc.insert(from.line + 1, added);
        }
      } else if (newText.length === 1) {
        firstLine.replace(from.ch, null, newText[0]);
        lastLine.replace(null, to.ch, "");
        firstLine.append(lastLine);
        this.doc.remove(from.line + 1, nlines, this.callbacks);
      } else {
        added = [];
        firstLine.replace(from.ch, null, newText[0]);
        lastLine.replace(null, to.ch, newText[newText.length - 1]);
        firstLine.fixMarkEnds(lastLine);
        i = 1;
        e = newText.length - 1;
        while (i < e) {
          added.push(Line.inheritMarks(this, newText[i], firstLine));
          ++i;
        }
        if (nlines > 1) this.doc.remove(from.line + 1, nlines - 1, this.callbacks);
        this.doc.insert(from.line + 1, added);
      }
      if (this.options.lineWrapping) {
        perLine = this.scroller.clientWidth / this.charWidth() - 3;
        this.doc.iter(from.line, from.line + newText.length, function(line) {
          var guess;
          if (line.hidden) return;
          guess = Math.ceil(line.text.length / perLine) || 1;
          if (guess !== line.height) return _this.updateLineHeight(line, guess);
        });
      } else {
        this.doc.iter(from.line, i + newText.length, function(line) {
          var l;
          if (!line) return;
          l = line.text;
          if (l.length > maxLineLength) {
            _this.maxLine = l;
            maxLineLength = l.length;
            _this.maxWidth = null;
            return recomputeMaxLength = false;
          }
        });
        if (recomputeMaxLength) {
          maxLineLength = 0;
          this.maxLine = "";
          this.maxWidth = null;
          this.doc.iter(0, this.doc.size, function(line) {
            var l;
            l = line.text;
            if (l.length > maxLineLength) {
              maxLineLength = l.length;
              return _this.maxLine = l;
            }
          });
        }
      }
      newWork = [];
      lendiff = newText.length - nlines - 1;
      if (this.work) {
        i = 0;
        l = this.work.length;
        while (i < l) {
          task = this.work[i];
          if (task < from.line) {
            newWork.push(task);
          } else {
            if (task > to.line) newWork.push(task + lendiff);
          }
          ++i;
        }
      }
      hlEnd = from.line + Math.min(newText.length, 500);
      this.highlightLines(from.line, hlEnd);
      newWork.push(hlEnd);
      this.work = newWork;
      this.startWorker(100);
      this.changes.push({
        from: from.line,
        to: to.line + 1,
        diff: lendiff
      });
      changeObj = {
        from: from,
        to: to,
        text: newText
      };
      if (this.textChanged) {
        cur = this.textChanged;
        while (cur.next) {
          cur = cur.next;
        }
        cur.next = changeObj;
      } else {
        this.textChanged = changeObj;
      }
      updateLine = function(n) {
        if (n <= Math.min(to.line, to.line + lendiff)) {
          return n;
        } else {
          return n + lendiff;
        }
      };
      this.setSelectionF(selFrom, selTo, updateLine(this.sel.from.line), updateLine(this.sel.to.line));
      return this.code.style.height = (this.doc.height * this.textHeight() + 2 * this.paddingTop()) + "px";
    };

    Lines.prototype.unredoHelper = function(from, to) {
      var change, end, pos, replaced;
      change = from.pop();
      if (change) {
        replaced = [];
        end = change.start + change.added;
        this.doc.iter(change.start, end, function(line) {
          return replaced.push(line.text);
        });
        to.push({
          start: change.start,
          added: change.old.length,
          old: replaced
        });
        pos = this.clipPos({
          line: change.start + change.old.length - 1,
          ch: this.editEnd(replaced[replaced.length - 1], change.old[change.old.length - 1])
        });
        this.updateLinesNoUndo({
          line: change.start,
          ch: 0
        }, {
          line: end - 1,
          ch: this.getLine(end - 1).text.length
        }, change.old, pos, pos);
        return this.updateInput = true;
      }
    };

    Lines.prototype.undoF = function() {
      return this.unredoHelper(this.history.done, this.history.undone);
    };

    Lines.prototype.redoF = function() {
      return this.unredoHelper(this.history.undone, this.history.done);
    };

    Lines.prototype.visibleLines = function() {
      var from_height, lh, to_height, top;
      lh = this.textHeight();
      top = this.scroller.scrollTop - this.paddingTop();
      from_height = Math.max(0, Math.floor(top / lh));
      to_height = Math.ceil((top + this.scroller.clientHeight) / lh);
      return {
        from: this.lineAtHeight(this.doc, from_height),
        to: this.lineAtHeight(this.doc, to_height)
      };
    };

    Lines.prototype.changeLine = function(handle, op) {
      var line, no_;
      no_ = handle;
      line = handle;
      if (typeof handle === "number") {
        line = this.getLine(this.clipLine(handle));
      } else {
        no_ = this.lineNo(handle);
      }
      if (no_ == null) return null;
      if (op(line, no_)) {
        this.changes.push({
          from: no_,
          to: no_ + 1
        });
      } else {
        return null;
      }
      return line;
    };

    Lines.prototype.setLineClassF = function(handle, className) {
      var _this = this;
      return this.changeLine(handle, function(line) {
        if (line.className !== className) {
          line.className = className;
          return true;
        }
      });
    };

    Lines.prototype.setLineHidden = function(handle, hidden) {
      var _this = this;
      return this.changeLine(handle, function(line, no_) {
        if (line.hidden !== hidden) {
          line.hidden = hidden;
          _this.updateLineHeight(line, (hidden ? 0 : 1));
          if (hidden && (_this.sel.from.line === no_ || _this.sel.to.line === no_)) {
            _this.setSelectionF(_this.skipHidden(_this.sel.from, _this.sel.from.line, _this.sel.from.ch), _this.skipHidden(_this.sel.to, _this.sel.to.line, _this.sel.to.ch));
          }
          return _this.gutterDirty = true;
        }
      });
    };

    Lines.prototype.lineInfo = function(line) {
      var marker, n;
      if (typeof line === "number") {
        if (!this.isLine(line)) return null;
        n = line;
        line = this.getLine(line);
        if (!line) return null;
      } else {
        n = this.lineNo(line);
        if (n == null) return null;
      }
      marker = line.gutterMarker;
      return {
        line: n,
        handle: line,
        text: line.text,
        markerText: marker && marker.text,
        markerClass: marker && marker.style,
        lineClass: line.className
      };
    };

    Lines.prototype.measureLine = function(line, ch) {
      var backup, elt, end, extra, left, top;
      extra = "";
      if (this.options.lineWrapping) {
        end = line.text.indexOf(" ", ch + 2);
        extra = this.htmlEscape(line.text.slice(ch + 1, (end < 0 ? line.text.length : end + (this.ie ? 5 : 0))));
      }
      this.measure.innerHTML = "<pre>" + line.getHTML(null, null, false, this.tabText, ch) + "<span id=\"Pen-temp-" + this.tempId + "\">" + this.htmlEscape(line.text.charAt(ch) || " ") + "</span>" + extra + "</pre>";
      elt = document.getElementById("Pen-temp-" + this.tempId);
      top = elt.offsetTop;
      left = elt.offsetLeft;
      if (this.ie && ch && top === 0 && left === 0) {
        backup = document.createElement("span");
        backup.innerHTML = "x";
        elt.parentNode.insertBefore(backup, elt.nextSibling);
        top = backup.offsetTop;
      }
      return {
        top: top,
        left: left
      };
    };

    Lines.prototype.findStartLine = function(n) {
      var indented, lim, line, minindent, minline, search;
      minindent = void 0;
      minline = void 0;
      search = n;
      lim = n - 40;
      while (search > lim) {
        if (search === 0) return 0;
        line = this.getLine(search - 1);
        if (line.stateAfter) return search;
        indented = line.indentation(this.options.tabSize);
        if (!(minline != null) || minindent > indented) {
          minline = search - 1;
          minindent = indented;
        }
        --search;
      }
      return minline;
    };

    Lines.prototype.getStateBefore = function(n) {
      var start, state;
      var _this = this;
      start = this.findStartLine(n);
      state = start && this.getLine(start - 1).stateAfter;
      if (!state) {
        state = this.startState(this.mode);
      } else {
        state = this.copyState(this.mode, state);
      }
      this.doc.iter(start, n, function(line) {
        line.highlight(_this.mode, state, _this.options.tabSize);
        return line.stateAfter = _this.copyState(_this.mode, state);
      });
      if (start < n) {
        this.changes.push({
          from: start,
          to: n
        });
      }
      if (n < this.doc.size && !this.getLine(n).stateAfter) this.work.push(n);
      return state;
    };

    Lines.prototype.highlightLines = function(start, end) {
      var state;
      var _this = this;
      state = this.getStateBefore(start);
      return this.doc.iter(start, end, function(line) {
        line.highlight(_this.mode, state, _this.options.tabSize);
        return line.stateAfter = _this.copyState(_this.mode, state);
      });
    };

    Lines.prototype.highlightWorker = function() {
      var bail, compare, end, foundWork, i, realChange, start, state, task, unchanged;
      var _this = this;
      end = +(new Date) + this.options.workTime;
      foundWork = this.work.length;
      if (!this.showingFrom) this.showingFrom = 0;
      while (this.work.length) {
        if (!this.getLine(this.showingFrom).stateAfter) {
          task = this.showingFrom;
        } else {
          task = this.work.pop();
        }
        if (task >= this.doc.size) continue;
        start = this.findStartLine(task);
        state = start && this.getLine(start - 1).stateAfter;
        if (state) {
          state = this.copyState(this.mode, state);
        } else {
          state = this.startState(this.mode);
        }
        unchanged = 0;
        compare = this.mode.compareStates;
        realChange = false;
        i = start;
        bail = false;
        this.doc.iter(i, this.doc.size, function(line) {
          var changed, hadState;
          hadState = line.stateAfter;
          if (+(new Date) > end) {
            _this.work.push(i);
            _this.startWorker(_this.options.workDelay);
            if (realChange) {
              _this.changes.push({
                from: task,
                to: i + 1
              });
            }
            return (bail = true);
          }
          changed = line.highlight(_this.mode, state, _this.options.tabSize);
          if (changed) realChange = true;
          line.stateAfter = _this.copyState(_this.mode, state);
          if (compare) {
            if (hadState && compare(hadState, state)) return true;
          } else {
            if (changed !== false || !hadState) {
              unchanged = 0;
            } else {
              if (++unchanged > 3 && (!_this.mode.indent || _this.mode.indent(hadState, "") === _this.mode.indent(state, ""))) {
                return true;
              }
            }
          }
          return ++i;
        });
        if (bail) return;
        if (realChange) {
          this.changes.push({
            from: task,
            to: i + 1
          });
        }
      }
      if (foundWork && this.options.onHighlightComplete) {
        return this.options.onHighlightComplete(this);
      }
    };

    Lines.prototype.startWorker = function(time) {
      if (!this.work.length) return;
      return this.highlight.set(time, this.operation(this.highlightWorker));
    };

    Lines.prototype.getLineAt = function(chunk, n) {
      var child, i, sz;
      while (!chunk.lines) {
        i = 0;
        while (true) {
          child = chunk.children[i];
          sz = child.chunkSize();
          if (n < sz) {
            chunk = child;
            break;
          }
          n -= sz;
          ++i;
        }
      }
      return chunk.lines[n];
    };

    Lines.prototype.splitLines = function(string) {
      var nl, pos, result;
      if (string.length === 0 || !string) {
        return [""];
      } else if ("\n\nb".split(/\n/).length !== 3) {
        pos = 0;
        nl = void 0;
        result = [];
        while ((nl = string.indexOf("\n", pos)) > -1) {
          result.push(string.slice(pos, (string.charAt(nl - 1) === "\r" ? nl - 1 : nl)));
          pos = nl + 1;
        }
        result.push(string.slice(pos));
        result;
      } else {
        result = string.split(/\r?\n/);
      }
      return result;
    };

    Lines.prototype.getLineText = function(line) {
      if (this.isLine(line)) return this.getLineAt(this.doc, line).text;
    };

    Lines.prototype.getLine = function(line) {
      if (this.isLine(line)) return this.getLineAt(this.doc, line);
    };

    Lines.prototype.getLineHandle = function(line) {
      if (this.isLine(line)) return this.getLine(line);
    };

    Lines.prototype.onDeleteLine = function(line, f) {
      if (typeof line === "number") {
        if (!this.isLine(line)) return null;
        line = this.getLine(line);
      }
      (line.handlers || (line.handlers = [])).push(f);
      return line;
    };

    Lines.prototype.lineCount = function() {
      return this.doc.size;
    };

    Lines.prototype.lineNo = function(line) {
      var chunk, cur, e, i, no_;
      if (line.parent == null) return null;
      cur = line.parent;
      no_ = this.indexOf(cur.lines, line);
      chunk = cur.parent;
      while (chunk) {
        i = 0;
        e = chunk.children.length;
        while (true) {
          if (chunk.children[i] === cur) break;
          no_ += chunk.children[i].chunkSize();
          ++i;
        }
        cur = chunk;
        chunk = chunk.parent;
      }
      return no_;
    };

    Lines.prototype.lineAtHeight = function(chunk, h) {
      var breakloop1, ch, child, e, i, lh, line, n;
      n = 0;
      while (true) {
        breakloop1 = false;
        i = 0;
        e = chunk.children.length;
        while (i < e) {
          child = chunk.children[i];
          ch = child.height;
          if (h < ch) {
            chunk = child;
            breakloop1 = true;
            break;
          }
          h -= ch;
          n += child.chunkSize();
          ++i;
        }
        return n;
        if (!breakLoop1) continue;
        if (!!chunk.lines) break;
      }
      i = 0;
      e = chunk.lines.length;
      while (i < e) {
        line = chunk.lines[i];
        lh = line.height;
        if (h < lh) break;
        h -= lh;
        ++i;
      }
      return n + i;
    };

    Lines.prototype.heightAtLine = function(chunk, n) {
      var breakloop1, child, e, h, i, sz;
      h = 0;
      while (true) {
        breakloop1 = false;
        i = 0;
        e = chunk.children.length;
        while (i < e) {
          child = chunk.children[i];
          sz = child.chunkSize();
          if (n < sz) {
            chunk = child;
            breakloop1 = true;
            break;
          }
          n -= sz;
          h += child.height;
          ++i;
        }
        if (!breakloop1) continue;
        if (!!chunk.lines) break;
      }
      i = 0;
      while (i < n) {
        h += chunk.lines[i].height;
        ++i;
      }
      return h;
    };

    return Lines;

  })();

  module.exports = Lines;

}).call(this);
}, "lib/pen/text/Selection": function(exports, require, module) {(function() {
  var Selection, Text;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Text = require('lib/pen/text/Text');

  Selection = (function() {
    var _this = this;

    __extends(Selection, Text);

    function Selection() {
      this.replaceSelectionF = __bind(this.replaceSelectionF, this);
      this.replaceRangeF = __bind(this.replaceRangeF, this);
      Selection.__super__.constructor.apply(this, arguments);
    }

    Selection.prototype.shiftSelecting = null;

    Selection.prototype.hasSelection = (window.getSelection ? function(te) {
      try {
        return te.selectionStart !== te.selectionEnd;
      } catch (e) {
        return false;
      }
    } : function(te) {
      var range;
      try {
        range = te.ownerDocument.selection.createRange();
      } catch (_error) {}
      if (!range || range.parentElement() !== te) return false;
      return range.compareEndPoints("StartToEnd", range) !== 0;
    });

    Selection.prototype.somethingSelected = function() {
      return !this.posEq(this.sel.from, this.sel.to);
    };

    Selection.prototype.replaceRangeF = function(code, from, to) {
      var adjustPos, end;
      var _this = this;
      from = this.clipPos(from);
      if (!to) {
        to = from;
      } else {
        to = this.clipPos(to);
      }
      code = this.splitLines(code);
      adjustPos = function(pos) {
        var ch, line;
        if (_this.posLess(pos, from)) return pos;
        if (!_this.posLess(to, pos)) return end;
        line = pos.line + code.length - (to.line - from.line) - 1;
        ch = pos.ch;
        if (pos.line === to.line) {
          ch += code[code.length - 1].length - (to.ch - (to.line === from.line ? from.ch : 0));
        }
        return {
          line: line,
          ch: ch
        };
      };
      end = void 0;
      this.replaceRange1(code, from, to, function(end1) {
        end = end1;
        return {
          from: _this.adjustPos(_this.sel.from),
          to: _this.adjustPos(_this.sel.to)
        };
      });
      return end;
    };

    Selection.prototype.replaceSelectionF = function(code, collapse) {
      var _this = this;
      return this.replaceRange1(this.splitLines(code), this.sel.from, this.sel.to, function(end) {
        if (collapse === "end") {
          return {
            from: end,
            to: end
          };
        } else if (collapse === "start") {
          return {
            from: _this.sel.from,
            to: _this.sel.from
          };
        } else {
          return {
            from: _this.sel.from,
            to: end
          };
        }
      });
    };

    Selection.prototype.replaceRange1 = function(code, from, to, computeSel) {
      var endch, newSel;
      endch = (code.length === 1 ? code[0].length + from.ch : code[code.length - 1].length);
      newSel = computeSel({
        line: from.line + code.length - 1,
        ch: endch
      });
      return this.updateLines(from, to, code, newSel.from, newSel.to);
    };

    Selection.prototype.getRange = function(from, to) {
      var code, l1, l2;
      var _this = this;
      l1 = from.line;
      l2 = to.line;
      if (l1 === l2) return this.getLine(l1).text.slice(from.ch, to.ch);
      code = [this.getLine(l1).text.slice(from.ch)];
      this.doc.iter(l1 + 1, l2, function(line) {
        return code.push(line.text);
      });
      code.push(this.getLine(l2).text.slice(0, to.ch));
      return code.join("\n");
    };

    Selection.prototype.getSelection = function() {
      return this.getRangeWrap(this.sel.from, this.sel.to);
    };

    Selection.prototype.setShift = function(val) {
      if (val) {
        return this.shiftSelecting = this.shiftSelecting || (this.sel.inverted ? this.sel.to : this.sel.from);
      } else {
        return this.shiftSelecting = null;
      }
    };

    Selection.prototype.setSelectionUser = function(from, to) {
      var sh;
      sh = this.shiftSelecting && this.clipPos(this.shiftSelecting);
      if (sh) {
        if (this.posLess(sh, from)) {
          from = sh;
        } else {
          if (this.posLess(to, sh)) to = sh;
        }
      }
      this.setSelection(from, to);
      return this.userSelChange = true;
    };

    Selection.prototype.setSelectionF = function(from, to, oldFrom, oldTo) {
      var tmp;
      this.goalColumn = null;
      if (oldFrom == null) {
        oldFrom = this.sel.from.line;
        oldTo = this.sel.to.line;
      }
      if (this.posEq(this.sel.from, from) && this.posEq(this.sel.to, to)) return;
      if (this.posLess(to, from)) {
        tmp = to;
        to = from;
        from = tmp;
      }
      if (from.line !== oldFrom) {
        from = this.skipHidden(from, oldFrom, this.sel.from.ch);
      }
      if (to.line !== oldTo) to = this.skipHidden(to, oldTo, this.sel.to.ch);
      if (this.posEq(from, to)) {
        this.sel.inverted = false;
      } else if (this.posEq(from, this.sel.to)) {
        this.sel.inverted = false;
      } else {
        if (this.posEq(to, this.sel.from)) this.sel.inverted = true;
      }
      if (this.posEq(from, to)) {
        if (!this.posEq(this.sel.from, this.sel.to)) {
          this.changes.push({
            from: oldFrom,
            to: oldTo + 1
          });
        }
      } else if (this.posEq(this.sel.from, this.sel.to)) {
        this.changes.push({
          from: from.line,
          to: to.line + 1
        });
      } else {
        if (!this.posEq(from, this.sel.from)) {
          if (from.line < oldFrom) {
            this.changes.push({
              from: from.line,
              to: Math.min(to.line, oldFrom) + 1
            });
          } else {
            this.changes.push({
              from: oldFrom,
              to: Math.min(oldTo, from.line) + 1
            });
          }
        }
        if (!this.posEq(to, this.sel.to)) {
          if (to.line < oldTo) {
            this.changes.push({
              from: Math.max(oldFrom, from.line),
              to: oldTo + 1
            });
          } else {
            this.changes.push({
              from: Math.max(from.line, oldTo),
              to: to.line + 1
            });
          }
        }
      }
      this.sel.from = from;
      this.sel.to = to;
      return this.selectionChanged = true;
    };

    Selection.prototype.skipHidden = function(pos, oldLine, oldCh) {
      var getNonHidden, line;
      var _this = this;
      getNonHidden = function(dir) {
        var ch, end, lNo, line, _results;
        lNo = pos.line + dir;
        end = (dir === 1 ? _this.doc.size : -1);
        _results = [];
        while (lNo !== end) {
          line = _this.getLine(lNo);
          if (!line.hidden) {
            ch = pos.ch;
            if (ch > oldCh || ch > line.text.length) ch = line.text.length;
            return {
              line: lNo,
              ch: ch
            };
          }
          _results.push(lNo += dir);
        }
        return _results;
      };
      line = this.getLine(pos.line);
      if (!line.hidden) return pos;
      if (pos.line >= oldLine) {
        return getNonHidden(1) || getNonHidden(-1);
      } else {
        return getNonHidden(-1) || getNonHidden(1);
      }
    };

    Selection.prototype.stringWidth = function(str) {
      this.measure.innerHTML = "<pre><span>x</span></pre>";
      this.measure.firstChild.firstChild.firstChild.nodeValue = str;
      return this.measure.firstChild.firstChild.offsetWidth || 10;
    };

    Selection.prototype.charFromX = function(line, x) {
      var estX, estimated, from, fromX, getX, lineObj, middle, middleX, text, to, toX, _results;
      var _this = this;
      if (x <= 0) return 0;
      lineObj = this.getLine(line);
      text = lineObj.text;
      getX = function(len) {
        _this.measure.innerHTML = "<pre><span>" + lineObj.getHTML(null, null, false, _this.tabText, len) + "</span></pre>";
        return _this.measure.firstChild.firstChild.offsetWidth;
      };
      from = 0;
      fromX = 0;
      to = text.length;
      toX = void 0;
      estimated = Math.min(to, Math.ceil(x / this.charWidth()));
      while (true) {
        estX = getX(estimated);
        if (estX <= x && estimated < to) {
          estimated = Math.min(to, Math.ceil(estimated * 1.2));
        } else {
          toX = estX;
          to = estimated;
          break;
        }
      }
      if (x > toX) return to;
      estimated = Math.floor(to * 0.8);
      estX = getX(estimated);
      if (estX < x) {
        from = estimated;
        fromX = estX;
      }
      _results = [];
      while (true) {
        if (to - from <= 1) return (toX - x > x - fromX ? from : to);
        middle = Math.ceil((from + to) / 2);
        middleX = getX(middle);
        if (middleX > x) {
          to = middle;
          _results.push(toX = middleX);
        } else {
          from = middle;
          _results.push(fromX = middleX);
        }
      }
      return _results;
    };

    return Selection;

  }).call(this);

  module.exports = Selection;

}).call(this);
}, "lib/pen/text/Text": function(exports, require, module) {(function() {
  var Lines, Text;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Lines = require('lib/pen/text/Lines');

  Text = (function() {
    var matching;

    __extends(Text, Lines);

    function Text() {
      this.computeTabText = __bind(this.computeTabText, this);
      this.indentSelected = __bind(this.indentSelected, this);
      this.getValue = __bind(this.getValue, this);
      this.setValueF = __bind(this.setValueF, this);
      Text.__super__.constructor.apply(this, arguments);
    }

    Text.prototype.cachedHeight = void 0;

    Text.prototype.cachedHeightFor = void 0;

    Text.prototype.measureText = void 0;

    Text.prototype.cachedWidth = void 0;

    Text.prototype.cachedWidthFor = 0;

    Text.prototype.doc = null;

    Text.prototype.mode = null;

    Text.prototype.updateInput = false;

    Text.prototype.gutterDirty = false;

    Text.prototype.gutter = null;

    Text.prototype.lineDiv = null;

    Text.prototype.wrapper = null;

    Text.prototype.scroller = null;

    Text.prototype.updateDisplay = false;

    matching = {
      "(": ")>",
      ")": "(<",
      "[": "]>",
      "]": "[<",
      "{": "}>",
      "}": "{<"
    };

    Text.prototype.setValueF = function(code) {
      var top;
      if (code == null) return;
      top = {
        line: 0,
        ch: 0
      };
      this.updateLines(top, {
        line: this.doc.size - 1,
        ch: this.getLine(this.doc.size - 1).text.length
      }, this.splitLines(code), top, top);
      return this.updateInput = true;
    };

    Text.prototype.getValue = function(code) {
      var text;
      var _this = this;
      text = [];
      this.doc.iter(0, this.doc.size, function(line) {
        return text.push(line.text);
      });
      return text.join("\n");
    };

    Text.prototype.selectWordAt = function(pos) {
      var end, line, start;
      line = this.getLine(pos.line).text;
      start = pos.ch;
      end = pos.ch;
      while (start > 0 && this.isWordChar(line.charAt(start - 1))) {
        --start;
      }
      while (end < line.length && this.isWordChar(line.charAt(end))) {
        ++end;
      }
      return this.setSelectionUser({
        line: pos.line,
        ch: start
      }, {
        line: pos.line,
        ch: end
      });
    };

    Text.prototype.selectLine = function(line) {
      return this.setSelectionUser({
        line: line,
        ch: 0
      }, {
        line: line,
        ch: this.getLine(line).text.length
      });
    };

    Text.prototype.indentSelected = function(mode) {
      var e, i, _results;
      if (this.posEq(this.sel.from, this.sel.to)) {
        return this.indentLineF(this.sel.from.line, mode);
      }
      e = this.sel.to.line - (this.sel.to.ch ? 0 : 1);
      i = this.sel.from.line;
      _results = [];
      while (i <= e) {
        this.indentLineF(i, mode);
        _results.push(++i);
      }
      return _results;
    };

    Text.prototype.indentLineF = function(n, how) {
      var curSpace, curSpaceString, diff, i, indentString, indentation, line, pos, state;
      if (!how) how = "add";
      if (!(how === "smart" ? !this.mode.indent || !this.options.smartIndent : void 0)) {
        state = this.getStateBefore(n);
      }
      line = this.getLine(n);
      curSpace = line.indentation(this.options.tabSize);
      curSpaceString = line.text.match(/^\s*/)[0];
      indentation = void 0;
      if (how === "prev") {
        if (n) {
          indentation = this.getLine(n - 1).indentation(this.options.tabSize);
        } else {
          indentation = 0;
        }
      } else if (how === "smart") {
        indentation = this.mode.indent(state, line.text.slice(curSpaceString.length), line.text);
      } else if (how === "add") {
        indentation = curSpace + this.options.indentUnit;
      } else {
        if (how === "subtract") indentation = curSpace - this.options.indentUnit;
      }
      indentation = Math.max(0, indentation);
      diff = indentation - curSpace;
      if (!diff) {
        if (this.sel.from.line !== n && this.sel.to.line !== n) return;
        indentString = curSpaceString;
      } else {
        indentString = "";
        pos = 0;
        if (this.options.indentWithTabs) {
          i = Math.floor(indentation / this.options.tabSize);
          while (i) {
            pos += this.options.tabSize;
            indentString += "\t";
            --i;
          }
        }
        while (pos < indentation) {
          ++pos;
          indentString += " ";
        }
      }
      return this.replaceRange(indentString, {
        line: n,
        ch: 0
      }, {
        line: n,
        ch: curSpaceString.length
      });
    };

    Text.prototype.gutterChanged = function() {
      var visible;
      visible = this.options.gutter || this.options.lineNumbers;
      this.gutter.style.display = (visible ? "" : "none");
      if (visible) {
        return this.gutterDirty = true;
      } else {
        return this.lineDiv.parentNode.style.marginLeft = 0;
      }
    };

    Text.prototype.wrappingChanged = function(from, to) {
      var perLine;
      if (this.options.lineWrapping) {
        this.wrapper.className += " Pen-wrap";
        perLine = this.scroller.clientWidth / this.charWidth() - 3;
        this.doc.iter(0, this.doc.size, function(line) {
          var guess;
          if (line.hidden) return;
          guess = Math.ceil(line.text.length / perLine) || 1;
          if (guess !== 1) return this.updateLineHeight(line, guess);
        });
        this.lineSpace.style.width = this.code.style.width = "";
      } else {
        this.wrapper.className = this.wrapper.className.replace(" Pen-wrap", "");
        this.maxWidth = null;
        this.maxLine = "";
        this.doc.iter(0, this.doc.size, function(line) {
          if (line.height !== 1 && !line.hidden) this.updateLineHeight(line, 1);
          if (line.text.length > this.maxLine.length) {
            return this.maxLine = line.text;
          }
        });
      }
      return this.changes.push({
        from: 0,
        to: this.doc.size
      });
    };

    Text.prototype.computeTabText = function() {
      var i, str;
      str = "<span class=\"cm-tab\">";
      i = 0;
      while (i < this.options.tabSize) {
        str += " ";
        ++i;
      }
      return str + "</span>";
    };

    Text.prototype.tabsChanged = function() {
      this.tabText = this.computeTabText();
      return this.updateDisplay(true);
    };

    Text.prototype.countColumn = function(string, end, tabSize) {
      var i, n;
      if (end == null) {
        end = string.search(/[^\s\u00a0]/);
        if (end === -1) end = string.length;
      }
      i = 0;
      n = 0;
      while (i < end) {
        if (string.charAt(i) === "\t") {
          n += tabSize - (n % tabSize);
        } else {
          ++n;
        }
        ++i;
      }
      return n;
    };

    Text.prototype.textHeight = function() {
      var i, offsetHeight;
      if (this.measureText == null) {
        this.measureText = "<pre>";
        i = 0;
        while (i < 49) {
          this.measureText += "x<br/>";
          ++i;
        }
        this.measureText += "x</pre>";
      }
      offsetHeight = this.lineDiv.clientHeight;
      if (offsetHeight === this.cachedHeightFor) return this.cachedHeight;
      this.cachedHeightFor = offsetHeight;
      this.measure.innerHTML = this.measureText;
      this.cachedHeight = this.measure.firstChild.offsetHeight / 50 || 1;
      this.measure.innerHTML = "";
      console.log('cached height');
      console.log(this.cachedHeight);
      console.log('end cached height');
      return this.cachedHeight;
    };

    Text.prototype.charWidth = function() {
      if (this.scroller.clientWidth === this.cachedWidthFor) {
        return this.cachedWidth;
      }
      this.cachedWidthFor = this.scroller.clientWidth;
      return this.cachedWidth = this.stringWidth("x");
    };

    Text.prototype.paddingTop = function() {
      return this.lineSpace.offsetTop;
    };

    Text.prototype.paddingLeft = function() {
      return this.lineSpace.offsetLeft;
    };

    Text.prototype.matchBracketsF = function(autoclear) {
      var ch, clear, d, e, first, forward, found, head, i, line, match, off_, one, pos, re, scan, st, stack, style, two;
      var _this = this;
      head = (this.sel.inverted ? this.sel.from : this.sel.to);
      line = this.getLine(head.line);
      pos = head.ch - 1;
      match = (pos >= 0 && this.matching[line.text.charAt(pos)]) || this.matching[line.text.charAt(++pos)];
      if (!match) return;
      ch = match.charAt(0);
      forward = match.charAt(1) === ">";
      d = (forward ? 1 : -1);
      st = line.styles;
      off_ = pos + 1;
      i = 0;
      e = st.length;
      while (i < e) {
        if ((off_ -= st[i].length) <= 0) {
          style = st[i + 1];
          break;
        }
        i += 2;
      }
      stack = [line.text.charAt(pos)];
      re = /[(){}[\]]/;
      scan = function(line, from, to) {
        var cur, j, te, text, _results;
        if (!line.text) return;
        st = line.styles;
        pos = (forward ? 0 : line.text.length - 1);
        cur = void 0;
        i = (forward ? 0 : st.length - 2);
        e = (forward ? st.length : -2);
        _results = [];
        while (i !== e) {
          text = st[i];
          if ((st[i + 1] != null) && st[i + 1] !== style) {
            pos += d * text.length;
            continue;
          }
          j = (forward ? 0 : text.length - 1);
          te = (forward ? text.length : -1);
          while (j !== te) {
            if (pos >= from && pos < to && re.test(cur = text.charAt(j))) {
              match = _this.matching[cur];
              if ((match.charAt(1) === ">" && ">" === forward)) {
                stack.push(cur);
              } else if (stack.pop() !== match.charAt(0)) {
                return {
                  pos: pos,
                  match: false
                };
              } else if (!stack.length) {
                return {
                  pos: pos,
                  match: true
                };
              }
            }
            j += d;
            pos += d;
          }
          _results.push(i += 2 * d);
        }
        return _results;
      };
      i = head.line;
      e = (forward ? Math.min(i + 100, this.doc.size) : Math.max(-1, i - 100));
      while (i !== e) {
        line = this.getLine(i);
        first = i === head.line;
        found = scan(line, (first && forward ? pos + 1 : 0), (first && !forward ? pos : line.text.length));
        if (found) break;
        i += d;
      }
      if (!found) {
        found = {
          pos: null,
          match: false
        };
      }
      style = (found.match ? "Pen-matchingbracket" : "Pen-nonmatchingbracket");
      one = this.markText({
        line: head.line,
        ch: pos
      }, {
        line: head.line,
        ch: pos + 1
      }, style);
      two = (found.pos != null) && this.markText({
        line: i,
        ch: found.pos
      }, {
        line: i,
        ch: found.pos + 1
      }, style);
      clear = this.operation(function() {
        one.clear();
        return two && two.clear();
      });
      if (autoclear) {
        return setTimeout(clear, 800);
      } else {
        return this.bracketHighlighted = clear;
      }
    };

    return Text;

  })();

  module.exports = Text;

}).call(this);
}, "lib/setup": function(exports, require, module) {
  require("json2ify");

  require("es5-shimify");

  require("jqueryify");

  require("spine");

  require("spine/lib/local");

  require("spine/lib/ajax");

  require("spine/lib/manager");

  require("spine/lib/route");

  require("spine/lib/tmpl");
}, "lib/tests/markdown": function(exports, require, module) {(function() {
  var MarkdownExample;

  MarkdownExample = (function() {

    function MarkdownExample() {}

    MarkdownExample.prototype.sampleDoc = function() {
      var string;
      string = "       \n# hub: git + hub = github\n\n`hub` is a command line utility which adds GitHub knowledge to `git`.\n\nIt can be used on its own or as a `git` wrapper.\n\nNormal:\n\n    $ hub clone rtomayko/tilt\n\n    Expands to:\n    $ git clone git://github.com/rtomayko/tilt.git\n\nWrapping `git`:\n\n    $ git clone rack/rack\n\n    Expands to:\n    $ git clone git://github.com/rack/rack.git\n\nhub requires you have `git` installed and in your `$PATH`. It also\nrequires Ruby 1.8.6+ or Ruby 1.9.1+. No other libraries necessary.\n\n\n# Install\n\n## Standalone";
      return string;
    };

    return MarkdownExample;

  })();

  module.exports = MarkdownExample;

}).call(this);
}
});