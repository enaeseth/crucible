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
			log: new Crucible.Delegator("message logged"),
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
	run: function run_tests(filters) {
		if (this.running) {
			throw new Error('Already running!');
		}
		
		this.queue = this._filter(this.tests, filters);
		this.queue.reverse();
		this.running = true;
		
		this.events.start.call();
		this._runTest();
	},
	
	log: function runner_log() {
		this.events.log.call(arguments);
	},
	
	_filter: function _runner_apply_filters(tests, filters) {
	    var filtered, filter_regexp_parts, filter;
	    
	    function glob_to_regexp(glob) {
	        // Temporarily convert the glob "*" character to something that's
	        // not a special regular expression character.
	        glob = glob.replace('*', '__WILDCARD__');
	        glob = Crucible.escapeRegexp(glob);
	        return '(?:' + glob.replace('__WILDCARD__', '.*') + ')';
	    }
	    
	    if (!filters) {
	        return tests.slice(0); // slice makes a shallow clone of the list
	    } else {
	        filter_regexp_parts = [];
	        Crucible.forEach(filters, function compile_filter(filter) {
	            filter_regexp_parts.push(glob_to_regexp(filter));
	        });
	        filter = new RegExp('^' + filter_regexp_parts.join('|') + '$', 'i');
	        
	        filtered = [];
	        Crucible.forEach(tests, function filter_test(test) {
	            if (filter.test(test.id))
	                filtered.push(test);
	        }, this);
	        return filtered;
	    }
	},
	
	_runTest: function _runner_run_test() {
		if (!this.queue) {
			return;
		} else if (this.queue.length == 0) {
			this.events.finish.call();
			this.running = false;
			delete this.queue;
			return;
		}
		
		var test = this.queue.pop();
		this.events.run.call(test);
		Crucible.defer(function run_test_later() {
			test.run(this);
		}, this);
	},
	
	_processResult: function _process_test_result(test, status, result) {
		this.events[status].call(test, result || null);
		this.events.result.call(test, status, result || null);
		Crucible.defer(function run_next_test_later() {
			this._runTest();
		}, this);
	}
});
