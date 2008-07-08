/**
 * @class A test.
 * @param {String} name the test's name
 * @param {Function} test the test function
 * @param {String|Boolean} [expected=false] an exception that this test must
 *        generate in order to pass
 */
Crucible.Test = function Test(name, test, expected) {
	if (!name) {
		throw new Error("Cannot create a test with no name.");
	} else if (typeof(name) != 'string') {
		throw new TypeError("A test's name must be a string.");
	} else if (!test) {
		throw new Error("Cannot create a test with no test code.");
	} else if (typeof(test) != 'function') {
		throw new TypeError("A function must be provided as the test routine.");
	} else if (expected) {
		if (expected !== true && typeof(expected) != 'string') {
			throw new TypeError("Indicate that a test expects an exception " +
				"to be thrown by passing either a boolean true or the name " +
				"of the exception as the option.");
		}
	}
	
	this.name = name;
	this.test = test;
	this.expected = expected || false;
};

Crucible.augment(Crucible.Test.prototype,
	/** @lends Crucible.Test.prototype */
{
	/**
	 * The test's name.
	 * @type String
	 */
	name: null,
	
	/**
	 * The exception that the test is expecting.
	 * @type String|Boolean
	 */
	expected: false,
	
	/**
	 * The test code itself.
	 * @type Function
	 */
	test: null,
	
	/**
	 * The Crucible runner object.
	 * @protected
	 * @type Object
	 */
	runner: null,
	
	/**
	 * Runs the test.
	 * @param {Function} a function that will be called with the test's result
	 * @throws {Crucible.Failure} if an assertion in the test fails
	 * @throws {Crucible.UnexpectedError} if the test code generates an
	 *         unexpected exception
	 * @return {void}
	 */
	run: function run_test(runner) {
		var ex_desc;
		
		if (typeof(callback) != 'function') {
			throw new TypeError("Cannot run a test without a callback " +
				"function to pass the results to.");
		}
		
		this.runner = runner;
		
		try {
			try {
				this.test();
			} catch (e) {
				if (e.name == 'Crucible.Failure') {
					return this.runner.report(this, e);
				} else if (e.name == 'Crucible.AsyncCompletion') {
					return;
				} else if (this.expected === true || this.expected == e.name) {
					return this.runner.report(this, true);
				} else {
					return this.runner.report(this,
						new Crucible.UnexpectedError(this, e));
				}
			}
	
			if (this.expected) {
				ex_desc = (this.expected === true)
					? "an exception"
					: 'a "' + this.expected + '" exception';
				return this.runner.report(this, new Crucible.Failure(this,
					"The test was expecting " + ex_desc + " to be thrown, " +
					"but none was."));
			}
			
			this.runner.report(this, true);
		} finally {
			this.runner = null; // cleanup
		}
	},
	
	/**
	 * Asynchronusly reports the test results.
	 * @param {Boolean|Error} result true if the test was successful, or a
	 *        Crucible error if it was not
	 * @return {void}
	 */
	finish: function finish_test(result) {
		try {
			this._callback(result);
		} finally {
			this._callback = null;
		}
	},
	
	/**
	 * Creates a clone of this test with the same name and runner, but different
	 * test code and a different expected exception.
	 * @param {Function} test the test function
	 * @param {String|Boolean} [expected=false] an exception that this test must
	 *        generate in order to pass
	 * @return {Crucible.Test} the spawned test
	 */
	spawn: function spawn_test(test, expected) {
		var test;
		
		if (!this.runner)
			throw new Error("Can only spawn a test while it is being run.");
		
		test = new Crucible.Test(this.name, test, expected);
		test.runner = this.runner;
		return test;
	}
});