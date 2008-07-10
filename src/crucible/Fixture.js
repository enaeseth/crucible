/**
 * @class Test fixture.
 * @param {String} [name] an optional name for the test fixture
 */
Crucible.Fixture = function Fixture(name) {
	this.name = name || null;
	this.tests = [];
};

Crucible.augment(Crucible.Fixture.prototype,
	/** @lends Crucible.Fixture.prototype */
{
	/**
	 * The name of the test fixture.
	 * @type String
	 */
	name: null,
	
	/**
	 * All the tests that have been added to the fixture.
	 * @type Array
	 */
	tests: null,
	
	/**
	 * This function will be called when the fixture is added to a runner, and
	 * should perform any overall setup.
	 * @return {void}
	 */
	initialize: Crucible.emptyFunction,
	
	/**
	 * This function will be called when the runner completes, and should undo
	 * any setup that was performed in initialize.
	 * @return {void}
	 */
	uninitialize: Crucible.emptyFunction,
	
	/**
	 * This function should perform any setup that needs to be run before each
	 * test.
	 * @return {void}
	 */
	setUp: Crucible.emptyFunction,
	
	/**
	 * This function should undo any actions taken by setUp, restoring the
	 * fixture to a pristine state.
	 * @return {void}
	 */
	tearDown: Crucible.emptyFunction,
	
	add: function add_test_to_fixture(name, test, expected) {
		test.push((typeof(name) == 'object')
			? name
			: new Crucible.Test(name, test, expected));
	}
});

/**
 * Constructs a new FixtureHandler.
 * @class Source handler for Crucible fixtures.
 */
Crucible.Fixture.Handler = function FixtureHandler() {
	
};

Crucible.Fixture.Handler.prototype =
	new Crucible.SourceHandler(Crucible.Fixture);
Crucible.augment(Crucible.Fixture.Handler.prototype,
	/** @lends Crucible.Fixture.Handler.prototype */
{
	getTests: function get_tests_from_fixture(fixture) {
		return fixture.tests;
	},
	
	run: function run_fixture(parent, fixture, runner) {
		var cur_test = -1;
		
		runner.sourceOpened.call(parent, fixture);
		
		if (fixture.tests.length == 0) {
			runner.sourceClosed.call(parent, fixture);
			return;
		}
		
		fixture.testContext = {};
		fixture.initialize.call(fixture.testContext);
		
		function next_test() {
			cur_test++;
			if (cur_test >= fixture.tests.length) {
				return false;
			}
			
			fixture.setUp.call(fixture.testContext);
			
			Crucible.defer(function(test) {
				Crucible.getHandler(test).run(fixture, test, runner);
			}, null, fixture.test[cur_test]);
			return true;
		}
		
		function source_closed(source_parent, closed_source) {
			if (closed_source == fixture.tests[cur_test]) {
				fixture.tearDown.call(fixture.testContext);
				
				if (!next_test()) {
					fixture.uninitialize.call(fixture.testContext);
					runner.sourceClosed.remove(source_closed, fixture);
					runner.sourceClosed.call(parent, fixture);
				}
			}
		}
		runner.sourceClosed.add(source_closed, fixture);
		
		next_test();
	}
});

Crucible.addSourceHandler(new Crucible.Fixture.Handler());
