/**
 * @namespace Crucible: A JavaScript testing system.
 */
var Crucible = {
	/**
	 * The version of Crucible in use.
	 * @type String
	 */
	version: CRUCIBLE_VERSION,
	
	/**
	 * The Crucible base URI. Normally autodetected.
	 * @type String
	 */
	base: null,
	
	defaultRunner: null,
	tests: [],
	_doneAdding: false,
	_windowReady: false,
	
	settings: {
		runner_class: 'TableRunner',
		autorun: true
	},
	
	add: function crucible_add(id, name, body) {
		var key, tid, tests;
		
		if (typeof(id) == 'object') {
			if (id instanceof Crucible.Test) {
				this.tests.push(id);
				return;
			}
			
			tests = id;
			for (key in tests) {
				tid = Crucible.Test.parseID(key);
				Crucible.add(tid[0], tid[1], tests[key]);
			}
			return;
		} else if (typeof(name) == 'object' && name !== null) {
			tests = name;
			for (key in tests) {
				key = [id, key].join('.');
				tid = Crucible.Test.parseID(key);
				Crucible.add(tid[0], tid[1], tests[key]);
			}
			return;
		} else if (typeof(name) == 'function') {
			body = name;
			name = null;
		} else if (typeof(id) != 'string') {
			throw new Error('Must identify the test being added.');
		}
		
		var test = new Crucible.Test(id, name, body);
		this.tests.push(test);
		return test;
	},
	
	addFixture: function crucible_add_fixture(id, name, spec) {
		if (typeof(name) == 'object') {
			spec = name;
			name = null;
		} else if (typeof(id) != 'string') {
			throw new Error('Must identify the fixture being added.');
		}
		
		return new Crucible.Fixture(id, name, spec);
	},
	
	doneAdding: function crucible_done_adding() {
		Crucible._doneAdding = true;
		if (Crucible._windowReady) {
			Crucible._createRunner();
		}
	},
	
	_createRunner: function crucible_create_runner() {
		var Runner = Crucible[Crucible.settings.runner_class];
		Crucible.defaultRunner = new Runner(Crucible.product || null,
			Crucible.tests);
		
		if (Crucible.settings.autorun)
			Crucible.run();
		
		return Crucible.defaultRunner;
	},
	
	run: function crucible_run() {
		Crucible.defaultRunner.run();
	},
	
	/**
	 * Copies all properties from the source object to the destination.
	 * @param {Object} destination the object to which the properties are copied
	 * @param {Object} source the object from which the properties are copied
	 * @param {Boolean} [overwrite=true] if false, will not overwrite properties
	 *        in the destination object
	 * @return {Object} destination
	 */
	augment: function augment_object(destination, source, overwrite) {
		if (typeof(overwrite) == 'undefined' || overwrite === null)
			overwrite = true;
		for (var name in source) {
			if (overwrite || !(name in destination))
				destination[name] = source[name];
		}
		return destination;
	},
	
	/**
	 * Determines if two values are equal.
	 * @return {Boolean}
	 */
	equal: function objects_equal(a, b) {
		var seen;
		if (typeof(a) != 'object') {
			return (typeof(b) == 'object')
				? false
				: (a == b);
		} else if (typeof(b) != 'object') {
			return false;
		}

		seen = {};

		for (var name in a) {
			if (name in Object.prototype)
				continue;
			if (!(name in b && Crucible.equal(a[name], b[name])))
				return false;
			seen[name] = true;
		}

		for (var name in b) {
			if (name in Object.prototype)
				continue;
			if (!(name in seen))
				return false;
		}

		return true;
	},
	
	arrayFrom: function array_from_iterable(iterable) {
		if (!iterable) return [];

		var length = iterable.length || 0
		var results = new Array(length);
		for (var i = 0; i < length; i++)
			results[i] = iterable[i];
		return results;
	},
	
	observeEvent: function observe_event(target, name, handler) {
		if (target.addEventListener) {
			target.addEventListener(name, handler, false);
		} else if (target.attachEvent) {
			function ie_event_wrapper(ev) {
				if (!ev)
					ev = window.event;
				if (!ev.target && ev.srcElement)
					ev.target = ev.srcElement;
				if (!ev.relatedTarget) {
					if (ev.type == 'mouseover' && ev.fromElement)
						ev.relatedTarget = ev.fromElement;
					else if (ev.type == 'mouseout' && ev.toElement)
						ev.relatedTarget = ev.toElement;
				}
				if (!ev.stopPropagation) {
					ev.stopPropagation = function() {
						this.cancelBubble = true;
					}
				}
				if (!ev.preventDefault) {
					ev.preventDefault = function() {
						this.returnValue = false;
					}
				}
				
				handler.call(this, ev);
			}
			target.attachEvent('on' + name, ie_event_wrapper);
		} else {
			throw new Error('No modern event API available.');
		}
	},
	
	bind: function bind_function(function_, thisp) {
		if (!thisp)
			return function_; // no wrapping needed
		return function binder() {
			return function_.apply(thisp, arguments);
		};
	},
	
	delay: function delay_function(function_, timeout, thisp) {
		var args = Crucible.arrayFrom(arguments).slice(3);
		return window.setTimeout(function delayer() {
			return function_.apply(thisp || null, args);
		}, timeout * 1000);
	},
	
	defer: function defer_function(function_, thisp) {
		var args = [function_, 0.01, thisp || null], i;
		for (i = 2; i < arguments.length; i++)
			args.push(arguments[i]);
		return Crucible.delay.apply(Crucible, args);
	},
	
	determineBase: function determine_base_uri() {
		if (Crucible.base)
			return Crucible.base;
		
		var scripts = document.getElementsByTagName('SCRIPT');
		var pattern = /\bcrucible\.js(\?[^#]*)?(#\S+)?$/;
		
		for (var i = 0; i < scripts.length; i++) {
			if (pattern.test(scripts[i].src)) {
				// Found Crucible!
				Crucible.base = scripts[i].src.replace(pattern, '');
				if (/build\/?$/.test(Crucible.base)) {
					Crucible.base = Crucible.base.replace(/build\/?$/, '');
				}
				if (Crucible.base.charAt(Crucible.base.length - 1) == '/') {
					Crucible.base = Crucible.base.substr(0,
						Crucible.base.length - 1);
				}
				return Crucible.base;
			}
		}
		
		throw new Error('Unable to automatically determine the Crucible base ' +
			'URI. Please explicitly set the Crucible.base property.');
	},
	
	/**
	 * Returns the keys (i.e., property names) of the object.
	 * @param {Object} obj any object
	 * @return {String[]} the object's keys
	 */
	objectKeys: function object_keys(obj) {
		var keys = [];
		for (var name in obj)
			keys.push(name);
		return keys;
	},
	
	forEach: function for_each(iterable, fn, context) {
		if (!context)
			context = null;
		
		var i, length = iterable.length;
		for (i = 0; i < length; i++) {
			if (i in iterable)
				fn.call(context, iterable[i], i, iterable);
		}
	},
	
	/**
	 * A function that does nothing. Useful as a standin.
	 * @return {void}
	 */
	emptyFunction: function() {
		// do nothing
	},
	
	/**
	 * A function that accepts one argument and returns it unmodified.
	 * @param {Object} value anything
	 * @return {Object} the value that was passed in
	 */
	constantFunction: function(value) {
		return value;
	}
};

Crucible.observeEvent(window, 'load', function _crucible_window_loaded() {
	Crucible._windowReady = true;
	if (Crucible._doneAdding) {
		Crucible._createRunner();
	}
});

#import "crucible/Class.js"
#import "crucible/Failure.js"
#import "crucible/ExpectationFailure.js"
#import "crucible/AsyncCompletion.js"
#import "crucible/UnexpectedError.js"
#import "crucible/Tools.js"
#import "crucible/Delegator.js"
#import "crucible/Assertions.js"
#import "crucible/Preferences.js"
#import "crucible/Fixture.js"
#import "crucible/TableRunner.js"
