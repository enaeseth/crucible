#import "Delegator.js"
#import "Assertions.js"

// Class: Crucible.Test
// Represents a unit test within Crucible.
Crucible.Test = Crucible.Class.create({
	// var: id
	// The test's short-name identifier.
	id: null,
	
	// var: name
	// The test's human-readable name.
	name: null,
	
	// var: context
	// The "this" context in which the test code will run. By default, this
	// object will include the contents of <Crucible.Assertions>. Test segments
	// will add an expect method and a reference to the current test at "test".
	context: null,
	
	// var: root
	// The test's root segment. (see <Crucible.Test.Segment>)
	root: null,
	
	events: null,
		
	// Constructor: Test
	// Creates a new test.
	//
	// Parameters:
	//     (String) id - the test's identifying string
	//     (String) name - the test's human-readable name
	//     (Function) body - the test code
	initialize: function Test(id, name, body) {
		this.id = id;
		this.name = name || id || null;
		this.context = new Crucible.Test.Context();
		this.root = new Crucible.Test.Segment(this, body);
		
		this.events = {
			run: new Crucible.Delegator("run test"),
			result: new Crucible.Delegator("test result available")
		};
	},
	
	run: function run_test() {
		this.events.run.call(this);
		this.root.run(this.context);
	},
	
	reportResult: function report_test_result(status, result) {
		this.events.result.call(this, status, result);
	}
});

// Function: parseID
// Parses a test ID.
Crucible.Test.parseID = function parse_test_id(id) {
	if (typeof(id) != 'string')
		throw new TypeError("Test ID must be a string.");
	var pos = id.indexOf(':');
	
	var name = (pos > -1) ?
		Crucible.Tools.trim(id.substr(pos + 1)) :
		null;
	id = Crucible.Tools.trim(id.substr(pos));
	
	var ret = [id, name];
	ret.id = id;
	ret.name = name;
	return ret;
};

// Class: Crucible.Test.Segment
// One synchronusly-executing part of a test.
Crucible.Test.Segment = Crucible.Class.create({
	// var: test
	// The test of which this segment is a part.
	test: null,
	
	// var: body
	// The segment's test function.
	body: null,
	
	// var: parent
	// The segment's parent, if any.
	parent: null,
	
	// var: expected
	// The exception that should be thrown from the segment body, if any.
	expected: null,
	
	// Constructor: Segment
	// Creates a new segment.
	//
	// Parameters:
	//     (Crucible.Test) test - the test of which this segment is a part
	//     (Function) body - the segment's body
	//     (Crucible.Test.Segment) [parent] - the segment's parent, if any
	initialize: function Segment(test, body, parent) {
		this.test = test;
		this.body = body;
		this.parent = parent || null;
		this.expected = null;
	},
	
	// Method: run
	// Runs the test segment.
	run: function run_segment(context) {
		this.context = context || null;
		
		try {
			this.context.expect = Crucible.bind(this.expect, this);
			this.context.test = this.test;
			this.body.call(this.context);
		} catch (e) {
			if (e.name == "Crucible.AsyncCompletion") {
				this.callback = this.context = null;
				return false;
			} else if (e._crucible_failure) {
				this.report('fail', e);
			} else if (this.wasExpected(e)) {
				this.report('pass', e);
			} else {
				this.report('exception', e);
			}
		}
		
		var which, article, exc;
		if (this.expected) {
			if (typeof(this.expected) == 'string') {
				article = (/^[aeiou]/i.test(expected)) ? 'an' : 'a';
				which = article + ' <code>' + this.expected + '</code>';
			} else {
				which = 'an exception';
			}
			
			exc = new Crucible.Failure(this.test, "Expected " + which +
				" to be thrown, but none was.");
			this.report('fail', exc);
		} else {
			this.report('pass');
		}
		
		this.callback = this.context = null;
		return true;
	},
	
	expect: function segment_expect_exception(name) {
		if (!name)
			name = true;
		this.expected = name;
	},
	
	wasExpected: function segment_exception_was_expected(exc) {
		if (!this.expected)
			return false;
		if (typeof(this.expected) == 'string')
			return (exc.name == this.expected);
		return true;
	}
	
	report: function report_segment_result(status, result) {
		this.test.reportResult(status, result || null);
	}
});

Crucible.Test.Context = function Context() {
	
};
Crucible.Test.Context.prototype = Crucible.Assertions;
