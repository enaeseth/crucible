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
	
	status: null,
	tallies: null,
	
	// Constructor: TableRunner
	// Creates a new table runner.
	initialize: function TableRunner(product, tests) {
		var build = Crucible.Tools.element;
		var runner = this;
		Crucible.TableRunner.superclass.call(this, product, tests);
		
		Crucible.determineBase();
		Crucible.Tools.addStyleSheet(Crucible.base +
			'/assets/css/table_runner.css');
		
		this.root = build('div', {id: 'crucible_results'});
		this.root.appendChild(build('h1', {}, this.product));
		
		this.statusIndicator = build('div', {id: 'crucible_status'},
			[this._statusIcon('waiting')]);
		this.status = 'waiting';
		this.root.appendChild(this.statusIndicator);
		
		this.startButton = build('div', {id: 'crucible_start'},
			'Start Testing');
		Crucible.observeEvent(this.startButton, 'click', function() {
			runner.run();
		});
		this.root.appendChild(this.startButton);
		
		this.tallies = {
			pass: 0,
			fail: 0,
			exception: 0
		};
		
		this._listenForEvents();
		document.body.insertBefore(this.root, document.body.firstChild);
	},
	
	_listenForEvents: function _table_runner_listen_for_events() {
		var events = {
			run: 'Started',
			pass: 'Passed',
			fail: 'Failed',
			result: 'Finished',
			exception: 'ThrewException'
		};
		var name;
		for (name in events) {
			this.events[name].add(this, '_test' + events[name]);
		}
		this.events.start.add(this, '_startedTesting');
		this.events.finish.add(this, '_finishedTesting');
		this.events.log.add(this, '_logMessage');
	},
	
	_startedTesting: function _started_testing() {
		var build = Crucible.Tools.element;
		this.table = build('table', {'class': 'tests'});
		this.table_body = build('tbody');
		this.table.appendChild(this.table_body);
		this.startButton.parentNode.replaceChild(this.table, this.startButton);
	},
	
	_finishedTesting: function _finished_testing() {
		function round(number) {
			// yes, it's ghetto... stfu
			try {
				return String(number).match(/\d+(\.\d)?/)[0];
			} catch (e) {
				return '0';
			}
		}
		var build = Crucible.Tools.element;
		
		var tallies = this.tallies;
		var total_tests = tallies.pass + tallies.fail + tallies.exception;
		
		function make_row(which, title) {
			var percent = (total_tests > 0) ?
				'(' + round(100 * (tallies[which] / total_tests)) + '%)' :
				'';
			
			var row = build('tr', {'class': which});
			row.appendChild(build('th', {}, title));
			row.appendChild(build('td', {}, String(tallies[which])));
			row.appendChild(build('td', {}, percent));
			return row;
		}
		
		var table = build('table', {id: 'crucible_tally'});
		var tbody = build('tbody');
		table.appendChild(tbody);
		
		var last;
		tbody.appendChild(make_row('pass', 'Passed'));
		tbody.appendChild(make_row('fail', 'Failed'));
		tbody.appendChild(last = make_row('exception', 'Errors'));
		
		this.root.appendChild(build('h2', {}, 'Test Results'));
		this.root.appendChild(table);
		last.scrollIntoView();
	},
	
	_logMessage: function _log_message(parts) {
		var message = [], i, length, arg, part;

		for (i = 0, length = parts.length; i < length; ++i) {
			arg = parts[i];
			part = (typeof(arg) == 'string') ?
				arg :
				Crucible.Tools.inspect(arg);

			part = Crucible.Tools.gsub(part, '<', '&lt;');
			part = Crucible.Tools.gsub(part, '>', '&gt;');

			if (typeof(arg) != 'string')
				part = '<code>' + part + '</code>';
			message.push(part);
		}

		this._createRow('log', message.join(' '));
	},
	
	_createRow: function _create_row(type, message) {
		var build = Crucible.Tools.element;
		var row = build('tr', {'class': type});
		var cell = build('td', {'class': 'message'});
		cell.innerHTML = message;
		row.appendChild(cell);
		this.table_body.appendChild(row);
		row.scrollIntoView();
		return row;
	},
	
	_testStarted: function _test_started(test) {
		this.currentRow = this._createRow('busy',
			'Running &ldquo;' + test.name + '&rdquo;&hellip;');
	},
	
	_updateStatus: function _update_test_status(status, message) {
		this.currentRow.className = status;
		this.currentRow.firstChild.innerHTML = message;
	},
	
	_testPassed: function _test_passed(test) {
		if (this.status == 'waiting')
			this._changeGlobalStatus('passing');
		this._updateStatus('pass', test.name);
	},
	
	_testFailed: function _test_failed(test, info) {
		if (this.status != 'errors')
			this._changeGlobalStatus('failing');
		this._updateStatus('fail', test.name + ': ' + info.description);
	},
	
	_testFinished: function _test_finished(test, status) {
		this.tallies[status]++;
	},
	
	_testThrewException: function _test_threw_exception(test, ex) {
		if (this.status != 'errors')
			this._changeGlobalStatus('errors');
		this._updateStatus('exception', ex.name + ' in test &ldquo;' +
			test.name + '&rdquo;: ' + ex.message);
	},
	
	_statusIcon: function _make_status_icon(which) {
		var info = this.icons[which];
		return Crucible.Tools.element('img', {
			src: Crucible.base + '/' + info.src,
			alt: info.alt,
			title: info.alt
		});
	},
	
	_changeGlobalStatus: function _change_global_status(status) {
		this.status = status;
		var n = this._statusIcon(status);
		var i = this.statusIndicator;
		i.replaceChild(n, i.firstChild);
	}
});
