/**
 * @class Abstract class; skeleton of a runner for Crucible tests.
 */
Crucible.Runner = function Runner() {
	
};

Crucible.augment(Crucible.Runner.prototype,
	/** @lends Crucible.Runner.prototype */
{
	tasks: [],
	task_index: null,
	fixture_test_index: null,
	current_test: null,
	
	add: function add_task_to_runner(task) {
		if (task.run || (task.tests && task.setUp)) {
			this.tasks.push(task);
		} else {
			throw new TypeError('Only tests or test fixtures can be added to ' +
				'a runner.');
		}
	},
	
	doneAdding: function done_adding_tasks_to_runner() {
		// default implementation does nothing
	},
	
	run: function runner_run() {
		this.task_index = 0;
		this.started();
		this.nextTest();
	},
	
	nextTest: function runner_next_test() {
		var task, test;
		
		function run_test(test) {
			this.testStarted(test);
			this.current_test = test;
			test.run(this);
		}
		
		function finish() {
			this.task_index = null;
			this.completed();
		}
		
		this.current_test = null;
		if (this.task_index === null) {
			throw new Error("Runner is in an invalid state; cannot proceed " +
				"to next test.");
		} else if (this.task_index >= this.tasks.length) {
			finish.call(this);
			return;
		}
		
		task = this.tasks[this.task_index];
		if (task.tests && this.fixture_test_index >= task.tests.length) {
			task.tearDown();
			this.fixtureClosed(task);
			this.task_index++;
			
			if (this.task_index >= this.tasks.length) {
				finish.call(this);
				return;
			} else {
				task = this.tasks[this.task_index];
			}
		}
		
		if (!task.run && task.tests && task.setUp) {
			if (this.fixture_test_index === null) {
				this.fixture_test_index = 0;
				task.initialize();
				this.fixtureOpened(task);
			}
			
			test = task.tests[this.fixture_test_index++];
		} else {
			test = task;
			this.task_index++;
		}
		
		Crucible.defer(run_test, this, test);
	},
	
	report: function report_result_to_runner(test, result) {
		this.testFinished(test, result);
		if (result === true) {
			this.testSucceeded(test);
		} else if (result.name == 'Crucible.Failure') {
			this.testFailed(test, result);
		} else if (result.name == 'Crucible.UnexpectedError') {
			this.testError(test, result);
		} else {
			throw new Error('Unable to understand test result: ' + result);
		}
		
		this.nextTest();
	},
	
	displayMessage: function runner_display_message(message, buttons) {
		throw new Error('The base Crucible.Runner cannot display messages.');
	},
	
	// listeners
	started: Crucible.emptyFunction,
	fixtureOpened: Crucible.emptyFunction,
	testStarted: Crucible.emptyFunction,
	testFinished: Crucible.emptyFunction,
	testSucceeded: Crucible.emptyFunction,
	testFailed: Crucible.emptyFunction,
	testError: Crucible.emptyFunction,
	fixtureClosed: Crucible.emptyFunction,
	completed: Crucible.emptyFunction
});
