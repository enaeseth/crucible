#import "Runner.js"

// Class: Crucible.TableRunner
// A runner that shows its results in a nice table.
Crucible.TableRunner = Crucible.Class.create(Crucible.Runner, {
	icons: {
		waiting: {
			src: 'assets/icons/gear_disable.png',
			alt: 'Waiting to start.'
		},
		passing: {
			src: 'assets/icons/tick_circle_frame.png',
			alt: 'All tests passing.'
		},
		failing: {
			src: 'assets/icons/exclamation_frame.png',
			alt: 'One or more tests failed.'
		},
		errors: {
			src: 'assets/icons/cross_circle_frame.png',
			alt: 'One or more tests encountered errors.'
		}
	},
	
	// Constructor: TableRunner
	// Creates a new table runner.
	initialize: function TableRunner(product, tests) {
		var build = Crucible.Tools.element;
		var runner = this;
		TableRunner.superclass.call(this, product, tests);
		
		Crucible.Tools.addStyleSheet(Crucible.base +
			'/assets/css/table_runner.css');
		
		this.root = build('div', {id: 'crucible_results'});
		this.root.appendChild('h1', {}, this.product);
		
		this.statusIndicator = build('div', {id: 'crucible_status'},
			[this._statusIcon('waiting')]);
		this.root.appendChild(this.statusIndicator);
		
		this.startButton = build('div', {id: 'crucible_start'},
			'Start Testing');
		Crucible.observeEvent(this.startButton, 'click', function() {
			runner.run();
		});
		this.root.appendChild(this.startButton);
		
		this._listenForEvents();
		document.body.insertBefore(this.root, document.body.firstChild);
	},
	
	_listenForEvents: function _table_runner_listen_for_events() {
		var events = {
			run: 'Started',
			pass: 'Passed',
			fail: 'Failed',
			exception: 'ThrewException'
		};
		var name;
		for (name in events) {
			this.events[name].add(this, '_test' + events[name]);
		}
		this.events.started.add(this, '_startedTesting');
		this.events.finished.add(this, '_finishedTesting');
	},
	
	_startedTesting: function _started_testing() {
		var build = Crucible.Tools.element;
		this.table = build('table', {'class': 'tests'});
		this.startButton.parentNode.replaceChild(this.table, this.startButton);
	},
	
	_finishedTesting: function _finished_testing() {
		// TODO: build results table
	},
	
	_testStarted: function _test_started(test) {
		var build = Crucible.Tools.element;
		var row = build('tr', {'class': 'busy'});
		var cell = build('td', {'class': 'message'});
		cell.innerHTML = 'Running &ldquo;' + test.name + '&rdquo;&hellip;';
		row.appendChild(cell);
		this.currentRow = row;
	},
	
	_updateStatus: function _update_test_status(status, message) {
		this.currentRow.className = status;
		this.currentRow.firstChild.innerHTML = message;
	},
	
	_testPassed: function _test_passed(test) {
		this._updateStatus('pass', test.name);
	},
	
	_testFailed: function _test_failed(test, info) {
		this.updateStatus('fail', test.name + ': ' + info.description);
	},
	
	_testThrewException: function _test_threw_exception(test, ex) {
		this.updateStatus('exception', ex.name + ' in test &ldquo;' +
			test.name + '&rdquo;: ' + ex.message);
	},
	
	_statusIcon: function _make_status_icon(which) {
		var info = this.icons[which];
		return Crucible.Tools.element('img', {
			src: info.src,
			alt: info.alt,
			title: info.alt
		});
	},
	
	_changeGlobalStatus: function _change_global_status(status) {
		var n = this._statusIcon(status);
		var i = this.statusIndicator;
		i.replaceChild(n, i.firstChild);
	}
});
