/**
 * Thrown when a sameness or equality assertion fails. This error should be
 * caught by the Crucible runner.
 * @param {Crucible.Test} test the test that failed
 * @param {Object} expected the object that was expected
 * @param {String} actual the actual object
 * @augments Crucible.Failure
 */
Crucible.ExpectationFailure =
	function ExpectationFailure(test, expected, actual) 
{
	var err;
	var expected_r = Crucible.Tools.inspect(expected);
	var actual_r = Crucible.Tools.inspect(actual);
	var message = 'Expected ' + expected_r + ' but actually got ' +
		actual_r + '.';
	var html_message = 'Expected <code>' + expected_r + '</code> but actually' +
		' got <code>' + actual_r + '</code>.';
	
	err = new Crucible.Failure(test, message);
	err.htmlDescription = html_message;
	err.name = "Crucible.ExpectationFailure";
	err.description = message;
	err.test = test;
	
	return err;
};
