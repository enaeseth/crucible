// Class: Loki.Runner
// Runs Crucible tests.
Loki.Runner = Loki.Class.create({
	tests: null,
	
	events: null,
	
	// Constructor: Runner
	// Creates a new test runner.
	//
	// Parameters:
	//     (Crucible.Test[]) tests - the tests to be run
	initialize: function Runner(tests) {
		this.tests = tests;
		
		this.events = {
			run: new Crucible.Delegator("test started"),
			pass: new Crucible.Delegator("test passed"),
			fail: new Crucible.Delegator("test failed"),
			exception: new Crucible.Delegator("test threw an exception"),
			result: new Crucible.Delegator("test finished"),
			finish: new Crucible.Delegator("finished testing")
		};
	}
});
