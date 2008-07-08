/**
 * Thrown when a Crucible test unexpectedly throws an exception.
 * @param {Crucible.Test} test the test that failed
 * @param {Error} error the unexpected exception that was thrown
 * @augments Error
 */
Crucible.UnexpectedError = function UnexpectedError(test, error) {
	Error.call(this, 'Unexpected ' + error.name + ' thrown from test "' +
		test.name + '": ' + error.message);
	this.name = "Crucible.UnexpectedError";
	this.error = error;
};

Crucible.UnexpectedError.prototype = new Error(null);