/**
 * @namespace Assertion functions.
 */
Crucible.Assertions = {
	assertEqual: function assert_equal(expected, actual, message) {
		if (!Crucible.equal(expected, actual)) {
			throw new Crucible.ExpectationFailure(this._test || null, expected,
				actual);
		}
	},
	
	assertSame: function assert_same(expected, actual, message) {
		if (expected !== actual) {
			throw new Crucible.ExpectationFailure(this._test || null, expected,
				actual);
		}
	},
	
	assertType: function assert_type(expected_type, object, message) {
		if (typeof(object) != expected_type) {
			throw new Crucible.Failure(this._test || null,
				message || 'Object should be of type "' + expected_type + '".');
		}
	},
	
	assertDefined: function assert_defined(object, message) {
		if (typeof(object) == 'undefined') {
			throw new Crucible.Failure(this._test || null,
				message || 'Object should not be undefined.');
		}
	},
	
	assertNull: function assert_null(object, message) {
		if (object !== null) {
			throw new Crucible.Failure(this._test || null,
				message || 'Object should be null.');
		}
	},
	
	assertNotNull: function assert_not_null(object, message) {
		if (object === null || typeof(object) == 'undefined') {
			throw new Crucible.Failure(this._test || null,
				message || 'Object should not be null.');
		}
	},
	
	assert: function assert(condition, message) {
		if (!condition) {
			throw new Crucible.Failure(this._test || null,
				message || '(unspecified reason)');
		}
	},
	
	assertFalse: function assert_false(condition, message) {
		if (condition) {
			throw new Crucible.Failure(this._test || null,
				message || '(unspecified reason)');
		}
	},
	
	fail: function fail(message) {
		throw new Crucible.Failure(this._test, message ||
			'(unspecified reason)');
	}
};
