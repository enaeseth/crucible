/**
 * @class Test fixture.
 * @param {String} [name] an optional name for the test fixture
 */
Crucible.Fixture = function Fixture(name) {
	this.name = name || null;
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
	tests: [],
	
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
