/**
 * Creates a new runner, setting up delegators for each possible event.
 * @class Abstract class; skeleton of a runner for Crucible tests.
 */
Crucible.Runner = function Runner() {
	var i, length, ev;
	this.sources = [];
	for (i = 0, length = Crucible.Runner.events.length; i < length; i++) {
		ev = Crucible.Runner.events[i];
		this[ev] = new Crucible.Delegator(ev);
	}
};

Crucible.augment(Crucible.Runner.prototype,
	/** @lends Crucible.Runner.prototype */
{
	sources: null,
	source_index: null,
	current_test: null,
	
	add: function add_test_source_to_runner(source) {
		this.sources.push(source);
	},
	
	doneAdding: function done_adding_sources_to_runner() {
		// default implementation does nothing
	},
	
	run: function runner_run() {
		this.sourceClosed.add(this._sourceClosed, this);
		
		this.started.call();
		this.runSource(0);
	},
	
	_sourceClosed: function _runner_source_closed(parent, source) {
		if (source == this.sources[this.source_index]) {
			this.runSource(this.source_index + 1);
		}
	},
	
	finish: function runner_cleanup() {
		this.sourceClosed.remove(this._sourceClosed, this);
		this.completed.call();
		this.source_index = null;
	},
	
	runSource: function runner_run_source(index) {
		this.source_index = index;
		if (this.source_index >= this.sources.length) {
			this.finish();
			return;
		}
		
		Crucible.getHandler(this.sources[index]).run(null, this.sources[index],
			this);
	},
	
	report: function report_result_to_runner(test, result) {
		this.testFinished.call(test, result);
		if (result === true) {
			this.testPassed.call(test);
		} else if (result.name == 'Crucible.Failure') {
			this.testFailed.call(test, result);
		} else if (result.name == 'Crucible.UnexpectedError') {
			this.testError.call(test, result);
		} else {
			throw new Error('Unable to understand test result: ' + result);
		}
	},
	
	displayMessage: function runner_display_message(message, buttons) {
		throw new Error('The base Crucible.Runner cannot display messages.');
	}
});

/** @ignore */
Crucible.Runner.events = ['started', 'sourceOpened', 'testStarted',
	'testFinished', 'testPassed', 'testFailed', 'testError',
	'sourceClosed', 'completed'];