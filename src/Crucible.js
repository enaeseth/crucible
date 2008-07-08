/**
 * @namespace Crucible: A JavaScript testing system.
 */
var Crucible = {
	/**
	 * The version of Crucible in use.
	 * @type String
	 */
	version: '0.0.1',
	
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
			if (!(name in b && Object.equal(a[name], b[name])))
				return false;
			seen[name] = true;
		}

		for (var name in b) {
			if (!(name in seen))
				return false;
		}

		return true;
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

#include "crucible/Failure.js"
#include "crucible/AsyncCompletion.js"
#include "crucible/UnexpectedError.js"
#include "crucible/Test.js"
#include "crucible/Fixture.js"
