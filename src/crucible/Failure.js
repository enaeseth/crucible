/**
 * Thrown when a part of a Crucible test fails. This error should be caught by
 * the Crucible runner.
 * @param {Crucible.Test} test the test that failed
 * @param {String} message a message explaining the failure
 * @augments Error
 */
Crucible.Failure = function Failure(test, message) {
	var err = new Error('Failure in test "' + test.name + '": ' + message)
	
	err.name = "Crucible.Failure";
	err.description = message || null;
	err.test = test || null;
	
	err._crucible_failure = true;
	
	return err;
};