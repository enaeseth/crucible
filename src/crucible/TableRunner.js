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
		TableRunner.superclass.initialize.call(this, product, tests);
		
		this.root = build('div', {id: 'crucible_results'});
		this.root.appendChild('h1', {}, this.product);
		
		this.statusIndicator = build('div', {id: 'crucible_status'},
			[this._statusIcon('waiting')]);
		this.root.appendChild(this.statusIndicator);
		
		this.startButton = build('div', {id: 'crucible_start'},
			'Start Testing');
		this.root.appendChild(this.startButton);
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
