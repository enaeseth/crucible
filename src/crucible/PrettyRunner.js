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
	}
});

Crucible.observeEvent(window, 'load', Crucible.PrettyRunner._window_load);
