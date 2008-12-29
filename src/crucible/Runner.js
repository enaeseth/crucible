// Class: Crucible.Runner
// Runs Crucible tests.
Crucible.Runner = Crucible.Class.create({
	product: null,
	tests: null,
	
	events: null,
	
	// Constructor: Runner
	// Creates a new test runner.
	//
	// Parameters:
	//     (Crucible.Test[]) tests - the tests to be run
	initialize: function Runner(product, tests) {
		this.product = product || '(unknown product)';
		this.tests = [];
		if (tests) {
			Crucible.forEach(tests, this.add, this);
		}
		
		this.events = {
			start: new Crucible.Delegator("started testing"),
			run: new Crucible.Delegator("test started"),
			pass: new Crucible.Delegator("test passed"),
			fail: new Crucible.Delegator("test failed"),
			exception: new Crucible.Delegator("test threw an exception"),
			result: new Crucible.Delegator("test finished"),
			finish: new Crucible.Delegator("finished testing")
		};
	},
	
	// Method: add
	// Adds a test to the runner.
	//
	// Parameters:
	//     (Crucible.Test) test - the test to add
	add: function add_to_runner(test) {
		test.events.result.add(this, '_processResult');
		this.tests.push(test);
	},
	
	// Method: run
	// Runs the tests.
	run: function run_tests() {
		if (this.running) {
			throw new Error('Already running!');
		}
		
		this.queue = this.tests.slice(0); // clone
		this.queue.reverse();
		this.running = true;
		
		this.events.start.call();
		this._runTest();
	},
	
	_runTest: function _runner_run_test() {
		if (this.queue.length == 0) {
			this.events.finish.call();
			this.running = false;
			delete this.queue;
			return;
		}
		
		var test = this.queue.pop();
		this.events.run.call(test);
		Crucible.defer(function() {
			test.run();
		});
	},
	
	_processResult: function _process_test_result(test, status, result) {
		this.events[status].call(test, result || null);
		this.events.result.call(test, status, result || null);
		Crucible.defer(function() {
			this._runTest();
		});
	}
});
