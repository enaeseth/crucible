/**
 * Thrown when a part of a Crucible test fails. This error should be caught by
 * the Crucible runner.
 * @param {Crucible.Test} test the test that failed
 * @param {String} message a message explaining the failure
 * @augments Error
 */
Crucible.Failure = function Failure(test, message) {
	Error.call(this, 'Failure in test "' + test.name + '": ' + message);
	this.name = "Crucible.Failure";
	this.description = message;
	this.test = test;
};

Crucible.Failure.prototype = new Error(null);
