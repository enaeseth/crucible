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
		this.name = name || null;
		
		if (typeof(spec) != 'object') {
			throw new Error('Fixture spec must be an object.');
		}
		
		name, tid, test;
		for (name in spec) {
			if (name == 'setUp' || name == 'set_up') {
				this.setUp = spec[name];
				delete spec[name];
			} else if (name == 'tearDown' || name == 'tear_down') {
				this.tearDown = spec[name];
				delete spec[name];
			} else {
				tid = Crucible.Test.parseID(name);
				id = [this.id, tid.id].join('.');
				test = Crucible.add(id, tid.name, spec[name]);
				test.events.run.add(this, '_beforeTest');
				test.events.result.add(this, '_afterTest');
			}
		}
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
