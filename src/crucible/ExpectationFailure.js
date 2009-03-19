/**
 * Thrown when a sameness or equality assertion fails. This error should be
 * caught by the Crucible runner.
 * @param {Crucible.Test} test the test that failed
 * @param {Object} expected the object that was expected
 * @param {String} actual the actual object
 * @augments Crucible.Failure
 */
Crucible.ExpectationFailure =
	function ExpectationFailure(test, expected, actual, message) 
{
	var err;
	var expected_r = Crucible.Tools.inspect(expected);
	var actual_r = Crucible.Tools.inspect(actual);
	
	if (message) {
	    message = message.replace(/[?!.:;,]$/, '') + '; expected ';
	} else {
	    message += 'Expected ';
	}
	message += '<code>' + expected_r + '</code> but actually' +
		' got <code>' + actual_r + '</code>.';
	
	err = new Crucible.Failure(test, message);
	err.name = "Crucible.ExpectationFailure";
	
	return err;
};
