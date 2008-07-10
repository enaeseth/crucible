/**
 * Creates a new pretty test runner.
 * @param {String} product the name of the "product" being tested
 * @class Runs Crucible tests, displaying the results graphically in the browser
 * window.
 * @augments Crucible.Runner
 */
Crucible.PrettyRunner = function PrettyRunner(product) {
	Crucible.Runner.call(this);
	if (product)
		this.product = product;
		
	for (var name in this._eventListeners) {
		this[name].add(this._eventListeners[name], this);
	}
	
	this._test_messages = [];
		
	this.draw();
};

Crucible.PrettyRunner.prototype = new Crucible.Runner();

Crucible.augment(Crucible.PrettyRunner.prototype,
	/** @lends Crucible.PrettyRunner.prototype */
{
	/**
	 * PrettyRunner status.
	 * @type String
	 */
	status: null,
	
	/**
	 * The product that the PrettyRunner is testing.
	 */
	product: 'the product',
	
	doneAdding: function done_adding_tasks_to_pretty_runner() {
		var msg;
		this._done_adding = true;
		
		if (!this.root) {
			Crucible.defer(Crucible.bind(this.doneAdding, this));
			return;
		}
		
		function start() {
			this.tallies = {pass: 0, fail: 0, error: 0};
			this.run();
		}
		
		msg = this.addMessage('prompt', "Crucible is ready to test " +
			this.product + ".", {'Start': Crucible.bind(start, this)});
	},
	
	displayMessage: function pr_display_message(message, buttons) {
		this.addMessage('prompt', message, buttons);
	},
	
	_getMessage: function _get_message_for_test(test, remove) {
		var i, len, entry, message;
		for (i = 0, len = this._test_messages.length; i < len; ++i) {
			entry = this._test_messages[i];
			if (entry && entry.test == test) {
				message = entry.message;
				if (remove)
					this._test_messages.splice(i, 1);
				return message;
			}
		}
		
		return null;
	},
	
	_setMessage: function _set_message_for_test(test, message) {
		var old = this._getMessage(test, true);
		if (old && old.remove)
			old.remove();
		this._test_messages.push({test: test, message: message});
		return message;
	},
	
	_eventListeners: {
		testStarted: function pr_test_started(test) {
			var msg = this.addMessage('running', 'Testing &ldquo;' + test.name +
				'&rdquo;&hellip;');
			this._setMessage(test, msg);
		},
	
		testPassed: function pr_test_succeeded(test) {
			var message = this._getMessage(test);
			message.setType('pass');
			message.setMessage(test.name);
			this.tallies.pass++;
		},
	
		testFailed: function pr_test_failed(test, failure) {
			var message = this._getMessage(test);
			message.setType('fail');
			message.setMessage(test.name + ': ' + failure.description);
			if (this.status == 'ok')
				this.setStatus('failure');
			this.tallies.fail++;
		},
	
		testError: function pr_test_error(test, error) {
			var message = this._getMessage(test);
			message.setType('error');
			message.setMessage('Test &ldquo;' + test.name + '&rdquo; ' +
				'had an <b>error</b>: ' + error.error.toString());
			this.setStatus('error');
			this.tallies.error++;
		},
	
		completed: function pr_run_completed() {
			var doc = this.body.ownerDocument;
			var frag = doc.createDocumentFragment();
			var message = doc.createElement('P');
			var tally_table = doc.createElement('TABLE');
			var tallies = this.tallies;
			var total_tests = tallies.pass + tallies.fail + tallies.error;
			tally_table.id = "pr_tally";
			
			function round(number) {
				try {
					return String(number).match(/\d+(\.\d)?/)[0];
				} catch (e) {
					return '0';
				}
			}
			
			function make_row(title, count) {
				var row = doc.createElement('TR');
				var head = doc.createElement('TH');
				var number;
				var percent;
				head.appendChild(doc.createTextNode(title));
				row.appendChild(head);
				
				number = doc.createElement('TD');
				number.innerHTML = count + ' tests';
				row.appendChild(number);
				
				percent = doc.createElement('TD');
				percent.innerHTML =  '(' + round(100 * (count / total_tests)) +
					'%)';
				row.appendChild(percent);
				tally_table.appendChild(row);
			}
			
			message.innerHTML = "Crucible has finished testing "
				+ this.product + "."
			frag.appendChild(message);
			
			make_row('Passed:', tallies.pass);
			make_row('Failed:', tallies.fail);
			make_row('Errors:', tallies.error);
			frag.appendChild(tally_table);
			
			this.addMessage('done', frag);
		}
	},
	
	/**
	 * @type Boolean
	 * @private
	 */
	_drawn: false,
	
	/**
	 * @type Boolean
	 * @private
	 */
	_done_adding: false,
	
	/**
	 * @type Object[]
	 * @private
	 */
	_test_messages: null,
	
	/**
	 * @type Object
	 * @private
	 */
	tallies: null,
	
	/**
	 * @type String
	 * @private
	 */
	base: null,
	
	/**
	 * The root runner window.
	 * @type HTMLDivElement
	 * @private
	 */
	root: null,
	
	/**
	 * The runner window title bar.
	 * @type HTMLDivElement
	 * @private
	 */
	titlebar: null,
	
	/**
	 * The status icon in the title bar.
	 * @type HTMLImageElement
	 * @private
	 */
	status_icon: null,
	
	/**
	 * The runner window main body.
	 * @type HTMLDivElement
	 * @private
	 */
	body: null,
	
	/**
	 * The results table.
	 * @type HTMLTableElement
	 * @private
	 */
	results: null,
	
	addMessage: function add_message_to_table(type, message, buttons) {
		var doc, row, icon_cell, icon, message_cell, button_cell;
		var mo;
		var runner = this;
		if (!this.results)
			this.createResultTable();
		
		doc = this.results.ownerDocument;
		row = this.results.insertRow(-1);
		
		icon_cell = row.insertCell(-1);
		icon_cell.className = 'pr_result_icon';
		icon = document.createElement('IMG');
		icon_cell.appendChild(icon);
		
		message_cell = row.insertCell(-1);
		message_cell.className = 'pr_result_body';
		
		mo = {
			setType: function set_pr_message_type(type) {
				var params, path;
				if (!(params = Crucible.PrettyRunner._type_params[type]))
					throw new Error('Unknown message type "' + type + '".');
				path = runner.base + 'assets/icons/' + params.icon;
				row.className = params.row_class;
				icon.src = path;
				if (/MSIE 6/.test(navigator.userAgent)) {
					icon.style.filter = "progid:" +
						"DXImageTransform.Microsoft.AlphaImageLoader(src='" +
					    path + "', sizingMethod='image')";
				}
			},
			
			setMessage: function set_pr_message_text(message) {
				if (typeof(message) == 'string') {
					message_cell.innerHTML = message;
				} else {
					while (message_cell.firstChild)
						message_cell.removeChild(message_cell.firstChild);
					message_cell.appendChild(message);
				}
			},
			
			setButtons: function set_pr_message_buttons(buttons) {
				var button;
				function click_listener(button) {
					return function (ev) {
						if (typeof(button.pr_action) == 'function')
							button.pr_action.call(null);
						else
							button.pr_action.run(runner);
						mo.remove();
						ev.preventDefault();
					};
				}
				
				message_cell.colSpan = (buttons) ? 1 : 2;
				
				if (!buttons && button_cell) {
					button_cell.parentNode.removeChild(button_cell);
					button_cell = null;
				} else if (buttons) {
					if (button_cell) {
						while (button_cell.firstChild)
							button_cell.removeChild(button_cell.firstChild);
					} else {
						button_cell = row.insertCell(-1);
						button_cell.className = 'pr_result_buttons';
					}
					
					for (var label in buttons) {
						button = doc.createElement('A');
						button.href = '#';
						button.innerHTML = label;
						button.pr_action = buttons[label];
						Crucible.observeEvent(button, 'click', 
							click_listener(button));
						button_cell.appendChild(button);
					}
				}
			},
			
			remove: function remove_pr_message() {
				row.parentNode.removeChild(row);
				row = null;
			}
		};
		
		mo.setType(type);
		mo.setMessage(message);
		mo.setButtons(buttons);
		
		row.scrollIntoView();
		return mo;
	},
	
	/**
	 * Sets the status icon.
	 * @private
	 * @return {void}
	 */
	setStatus: function set_pretty_runner_status_icon(status) {
		var base = this.base + 'assets/icons/';
		switch (status) {
			case 'ok':
				this.status_icon.src = base + 'ok.png';
				this.status_icon.alt = 'OK';
				this.status_icon.title = 'No errors.';
				break;
			case 'failure':
				this.status_icon.src = base + 'error.png';
				this.status_icon.alt = 'Failure(s)';
				this.status_icon.title = 'One or more tests have failed.';
				break;
			case 'error':
				this.status_icon.src = base + 'exclamation.png';
				this.status_icon.alt = 'Error(s)';
				this.status_icon.title = 'One or more tests have encountered ' +
					'errors.';
				break;
			default:
				throw new Error('Unknown runner status code "' + status + '".');
		}
		this.status = status;
	},
	
	/**
	 * Creates the runner interface.
	 * @private
	 * @return {void}
	 */
	draw: function add_pretty_runner_stylesheet() {
		var base;
		
		if (this._drawn)
			return;
		
		if (!document.body) {
			Crucible.defer(this.draw, this);
			return;
		}
		
		this._drawn = true;
		
		base = this.base = Crucible.determineBase();
		Crucible.addStyleSheet(base + 'assets/css/pretty_runner.css');
		
		//this.appendUI();
		Crucible.defer(this.appendUI, this);
	},
	
	/**
	 * Creates the runner UI elements and appends them to the document.
	 * @private
	 * @return {void}
	 */
	appendUI: function append_pretty_runner_ui() {
		if (this.root && this.titlebar && this.status_icon && this.body)
			return; // guard
		
		this.root = document.createElement('DIV');
		this.root.id = "pretty_runner";
		
		this.titlebar = document.createElement('DIV');
		this.titlebar.id = "pretty_runner_title";
		this.titlebar.title = 'Click to open.';
		
		this.status_icon = document.createElement('IMG');
		this.status_icon.className = 'pr_status';
		this.setStatus('ok');
		this.titlebar.appendChild(this.status_icon)
		this.titlebar.appendChild(document.createTextNode("\nCrucible"));
		this.root.appendChild(this.titlebar);
		
		Crucible.observeEvent(this.titlebar, 'click', Crucible.bind(function() {
			var row;
			
			this.body.className = (!this.body.className)
				? 'pr_active'
				: '';
			this.titlebar.title = (this.body.className == 'pr_active')
				? 'Click to close.'
				: 'Click to open.';
			if (this.body.className == 'pr_active' && this.results) {
				row = this.results.rows[this.results.rows.length-1];
				Crucible.defer(function() {
					row.scrollIntoView();
				});
			}
		}, this));
		
		this.body = document.createElement('DIV');
		this.body.id = 'pretty_runner_body';
		this.root.appendChild(this.body);
		
		document.body.appendChild(this.root);
	},
	
	/**
	 * Creates the results table.
	 * @private
	 * @return {void}
	 */
	createResultTable: function create_pretty_runner_result_table() {
		this.results = this.root.ownerDocument.createElement('TABLE');
		this.results.id = "pretty_runner_results";
		this.results.cellSpacing = 0;
		this.body.appendChild(this.results);
	}
});

Crucible.augment(Crucible.PrettyRunner, {
	_window_loaded: false,
	_pending_runners: [],
	
	_window_load: function _pretty_runner_onload() {
		var pending, i;
		
		Crucible.PrettyRunner._window_loaded = true;
		
		pending = Crucible.PrettyRunner._pending_runners;
		Crucible.PrettyRunner._pending_runners = [];
		for (i = 0; i < pending.count; i++) {
			pending[i].draw();
		}
	},
	
	_type_params: {
		'prompt': {
			row_class: 'pr_message',
			icon: 'bullet_go.png'
		},
		'running': {
			row_class: 'pr_running',
			icon: 'bullet_yellow.png'
		},
		'pass': {
			row_class: 'pr_passed',
			icon: 'tick.png'
		},
		'fail': {
			row_class: 'pr_failed',
			icon: 'cross.png'
		},
		'error': {
			row_class: 'pr_error',
			icon: 'exclamation.png'
		},
		'done': {
			row_class: 'pr_done',
			icon: 'flag_blue.png'
		}
	}
});

Crucible.observeEvent(window, 'load', Crucible.PrettyRunner._window_load);
