/**
 * Creates a new pretty test runner.
 * @param {String} product the name of the "product" being tested
 * @class Runs Crucible tests, displaying the results graphically in the browser
 * window.
 * @augments Crucible.Runner
 */
Crucible.PrettyRunner = function PrettyRunner(product) {
	this.product = product;
	
	// if (Crucible.PrettyRunner._window_loaded)
		this.draw();
	// else
	// 	Crucible.PrettyRunner._pending_runners.push(this);
};

Crucible.PrettyRunner.prototype = new Crucible.Runner();

Crucible.augment(Crucible.PrettyRunner.prototype,
	/** @lends Crucible.PrettyRunner.prototype */
{
	doneAdding: function done_adding_tasks_to_pretty_runner() {
		
	},
	
	/**
	 * @type Boolean
	 * @private
	 */
	_drawn: false,
	
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
		var doc, params, row, icon_cell, icon, message_cell, button_cell;
		var label, button;
		if (!this.results)
			this.createResultTable();
			
		if (!(params = Crucible.PrettyRunner._type_params[type])) // assignment
			throw new Error('Unknown message type "' + type + '".');
		
		doc = this.results.ownerDocument;
		row = this.results.insertRow(-1);
		row.className = params.row_class;
		
		icon_cell = row.insertCell(-1);
		icon_cell.className = 'pr_result_icon';
		icon = doc.createElement('IMG');
		icon.src = this.base + 'assets/icons/' + params.icon;
		icon_cell.appendChild(icon);
		
		message_cell = row.insertCell(-1);
		message_cell.className = 'pr_result_body';
		message_cell.innerHTML = message;
		message_cell.colSpan = (buttons) ? 1 : 2;
		
		if (buttons) {
			button_cell = row.insertCell(-1);
			button_cell.className = 'pr_result_buttons';
			
			for (var label in buttons) {
				button = doc.createElement('A');
				button.href = '#';
				button.innerHTML = label;
				button.pr_action = buttons[label];
				Crucible.observeEvent(button, 'click', function (ev) {
					if (typeof(button.pr_action) == 'function')
						button.pr_action.call(null);
					else
						button.pr_action.run();
					ev.preventDefault();
				});
				button_cell.appendChild(button);
			}
		}
		
		row.scrollIntoView();
		return row;
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
		this._drawn = true;
		
		base = this.base = Crucible.determineBase();
		Crucible.addStyleSheet(base + 'assets/css/pretty_runner.css');
		
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
			this.body.className = (!this.body.className)
				? 'pr_active'
				: '';
			this.titlebar.title = (this.body.className == 'pr_active')
				? 'Click to close.'
				: 'Click to open.';
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
		this.body.appendChild(this.results);
	}
});

Crucible.augment(Crucible.PrettyRunner, {
	_window_loaded: false,
	_pending_runners: [],
	
	_window_load: function _pretty_runner_onload() {
		var pending, i;
		
		if (Crucible.PrettyRunner._window_loaded)
			return;
		Crucible.PrettyRunner._window_loaded = true;
		
		pending = Crucible.PrettyRunner._pending_runners;
		for (i = 0; i < pending.count; i++) {
			pending[i].draw();
		}
		pending = [];
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
			icon: 'cross.png',
		},
		'error': {
			row_class: 'pr_error',
			icon: 'exclamation.png'
		}
	}
});

Crucible.observeEvent(window, 'load', Crucible.PrettyRunner._window_load);
