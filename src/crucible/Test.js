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
	 * Runs the test.
	 * @param {Object} runner test runner
	 * @param {Object} [context] test context
	 * @throws {Crucible.Failure} if an assertion in the test fails
	 * @throws {Crucible.UnexpectedError} if the test code generates an
	 *         unexpected exception
	 * @return {void}
	 */
	run: function test_run(runner, context) {
		var unit;
		this.context = context || null;
		unit = new Crucible.Test.Unit(this, this.test, this.expected);
		unit.run(runner);
	}
});

/**
 * @class One contigiously-executing block of a test.
 */
Crucible.Test.Unit = function TestUnit(test, unit, expected) {
	this.test = test;
	this.unit = unit;
	this.expected = expected;
	
	if (test.context)
		Crucible.augment(this, test.context);
};

Crucible.augment(Crucible.Test.Unit.prototype,
	/** @lends Crucible.Test.Unit.prototype */
{
	/**
	 * The Crucible runner object.
	 * @protected
	 * @type Object
	 */
	runner: null,
	
	/**
	 * Runs the test unit.
	 * @param {Object} test runner
	 * @throws {Crucible.Failure} if an assertion in the test fails
	 * @throws {Crucible.UnexpectedError} if the test code generates an
	 *         unexpected exception
	 * @return {void}
	 */
	run: function run_test_unit(runner) {
		var ex_desc;
		var test = this.test;
		
		if (typeof(runner) != 'object' || typeof(runner.report) != 'function') {
			throw new TypeError("Cannot run a test without a Crucible test " +
				"runner to pass the results to.");
		}
		
		this.runner = runner;
		
		function pass() {
			this.runner.report(test, true);
		}
		function fail(message) {
			this.runner.report(test, new Crucible.Failure(test, message));
		}
		function unexpected_error(error) {
			this.runner.report(test, new Crucible.UnexpectedError(test, error));
		}
		
		try {
			try {
				this.unit();
			} catch (e) {
				if (e.name == 'Crucible.Failure') {
					this.runner.report(this.test, e);
					return;
				} else if (e.name == 'Crucible.AsyncCompletion') {
					return;
				} else if (this.expected) {
					if (this.expected === true) {
						pass();
					} else if (this.expected == e.name) {
						pass();
					} else {
						fail('Expected a "' + this.expected + '" exception, ' +
							'but the test threw ' + e.toString() + ' instead.');
					}
					return;
				} else {
					unexpected_error(e);
				}
			}
	
			if (this.expected) {
				ex_desc = (this.expected === true)
					? "an exception"
					: 'a "' + this.expected + '" exception';
				fail("Expected " + ex_desc + ' to be thrown, but none ' +
					'was.');
				return;
			}
			
			this.runner.report(this.test, true);
		} finally {
			this.runner = null; // cleanup
		}
	},
	
	assertEqual: function assert_equal(expected, actual, message) {
		if (!Crucible.equal(expected, actual)) {
			throw new Crucible.Failure(this.test, message ||
				'Expected ' + expected + ' but got ' + actual + '.');
		}
	},
	
	assertNull: function assert_null(object, message) {
		if (object !== null) {
			throw new Crucible.Failure(this.test, message ||
				'Object should be null.');
		}
	},
	
	assertNotNull: function assert_not_null(object, message) {
		if (object === null || typeof(object) == 'undefined') {
			throw new Crucible.Failure(this.test, message ||
				'Object should not be null.');
		}
	},
	
	assert: function assert(condition, message) {
		if (!condition) {
			throw new Crucible.Failure(this.test, message ||
				'(unspecified reason)');
		}
	},
	
	assertFalse: function assert_false(condition, message) {
		if (condition) {
			throw new Crucible.Failure(this.test, message ||
				'(unspecified reason)');
		}
	},
	
	fail: function fail(message) {
		throw new Crucible.Failure(this.test, message ||
			'(unspecified reason)');
	},
	
	forked: function forked() {
		throw new Crucible.AsyncCompletion();
	},
	
	promptUser: function prompt_user(message, on_accept, label, expected) {
		var buttons = {};
		
		if (!message)
			throw new Error('No message to prompt with.');
		else if (typeof(on_accept) != 'function')
			throw new Error('Must provide a post-accept function for prompt.');
			
		buttons[label || 'OK'] = new Crucible.Test.Unit(this.test, on_accept,
			expected || null);
		
		this.runner.displayMessage(message, buttons);
		throw new Crucible.AsyncCompletion();
	},
	
	verify: function verify(question, on_ok, labels, description, expected) {
		var buttons = {};
		
		if (!question)
			throw new Error('No question to verify.');
		else if (typeof(on_ok) != 'function')
			throw new Error('Must provide something to do upon verification.');
		
		if (!labels)
			labels = ['Yes', 'No'];
			
		function fail() {
			this.fail(description || 'Verification failed.');
		}
		
		buttons[labels[0]] = new Crucible.Test.Unit(this.test, on_ok,
			expected || null);
		buttons[labels[1]] = new Crucible.Test.Unit(this.test, fail);
		
		this.runner.displayMessage(question, buttons);
		throw new Crucible.AsyncCompletion();
	}
});

/**
 * Constructs a new TestHandler.
 * @class Source handler for Crucible tests.
 */
Crucible.Test.Handler = function TestHandler() {
	
};

Crucible.Test.Handler.prototype = new Crucible.SourceHandler(Crucible.Test);
Crucible.augment(Crucible.Test.Handler.prototype,
	/** @lends Crucible.Test.Handler.prototype */
{
	getTests: function get_tests_from_test(test) {
		return [test];
	},
	
	run: function run_test(parent, test, runner) {
		runner.sourceOpened.call(parent, test);
		
		function test_finished(finished_test) {
			if (finished_test == test) {
				runner.testFinished.remove(test_finished, test);
				runner.sourceClosed.call(parent, test);
			}
		}
		
		runner.testFinished.add(test_finished, test);
		runner.testStarted.call(test);
		test.run(runner, (parent && parent.testContext) || null);
	}
});

Crucible.addSourceHandler(new Crucible.Test.Handler());
