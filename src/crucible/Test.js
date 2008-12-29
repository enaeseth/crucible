// Class: Crucible.Test
// Represents a unit test within Crucible.
Crucible.Test = Crucible.Class.create({
	// var: id
	// The test's short-name identifier.
	id: null,
	
	// var: name
	// The test's human-readable name.
	name: null,
	
	// var: fixture
	// A reference to the test's fixture, if any.
	fixture: null,
	
	// var: helpers
	helpers: null,
	
	// var: root
	// The test's root segment. (see <Crucible.Test.Segment>)
	root: null,
		
	// Constructor: Test
	// Creates a new test.
	//
	// Parameters:
	//     (String) id - the test's identifying string
	//     (String) name - the test's human-readable name
	//     (Crucible.Fixture) fixture - the test's fixture, or null if none
	//     (Function) body - the test code
	initialize: function Test(id, name, fixture, body) {
		this.id = id;
		this.name = name || id || null;
		this.fixture = fixture || null;
		this.helpers = [];
		this.root = new Crucible.Test.Segment(this, body);
	},
	
	getContext: function get_test_context_object() {
		if (!this.context) {
			if (this.fixture)
				this.context = this.fixture.getContext() || {};
			else
				this.context = {};

			Crucible.forEach(this.helpers, function(helper) {
				if (typeof(helper) == 'function')
					helper = new helper();
				Crucible.augment(this.context, helper);
			}, this);
		}

		return this.context;
	}
});

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
	run: function run_segment(callback, context) {
		this.callback = callback;
		this.context = context || null;
		
		try {
			var body_context = this.test.getContext();
			body_context.expect = Crucible.bind(this.expect, this);
			this.body.call(body_context);
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
		this.callback.call(this.context, this.test, status, result || null);
	}
});
