#import "Test.js"

// Class: Crucible.Fixture
// A collection of tests with an associated context and set-up and tear-down
// routines.
Crucible.Fixture = Crucible.Class.create({
	// var: id
	id: null,
	
	// var: name
	name: null,
	
	// Constructor: Fixture
	// Creates a new fixture.
	//
	// Parameters:
	//     (String) id - the base of the identifying string for the fixture's
	//                   tests
	//     (String) name - the fixture's human-readable name
	//     (Object) spec - the fixture specification
	initialize: function Fixture(id, name, spec) {
		this.id = id;
		this.name = name || id || null;
		
		if (typeof(spec) != 'object') {
			throw new Error('Fixture spec must be an object.');
		}
		
		var name, tid;
		for (name in spec) {
			if (name == 'setUp' || name == 'set_up') {
				this.setUp = spec[name];
			} else if (name == 'tearDown' || name == 'tear_down') {
				this.tearDown = spec[name];
			} else {
				tid = Crucible.Test.parseID(name);
				this.add(tid.id, tid.name, spec[name]);
			}
		}
	},
	
	add: function add_to_fixture(id, name, body) {
		var key, tests, tid, test;
		if (typeof(id) == 'object') {
			tests = id;
			for (key in tests) {
				tid = Crucible.Test.parseID(key);
				this.add(tid[0], tid[1], tests[key]);
			}
			return;
		} else if (typeof(name) == 'object') {
			tests = name;
			for (key in tests) {
				tid = Crucible.Test.parseID([id, key].join('.'));
				this.add(tid[0], tid[1], tests[key]);
			}
			return;
		} else if (typeof(name) == 'function') {
			body = name;
			name = null;
		} else if (typeof(id) != 'string') {
			throw new Error('Must identify the test being added.');
		}
		
		tid = Crucible.Test.parseID([this.id, id].join('.'));
		if (tid.name)
			name = tid.name;
		test = Crucible.add(tid.id, name, body);
		test.events.run.add(this, '_beforeTest');
		test.events.result.add(this, '_afterTest');
		return test;
	},
	
	_beforeTest: function _fixture_do_set_up(test) {
		this.setUp(test);
	},
	
	_afterTest: function _fixture_do_tear_down(test) {
		this.tearDown(test);
	},
	
	setUp: Crucible.emptyFunction,
	tearDown: Crucible.emptyFunction
});
