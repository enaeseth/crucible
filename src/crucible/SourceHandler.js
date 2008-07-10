/**
 * Constructs a new SourceHandler.
 * @class Abstract class; provides test enumeration or managment for a specific
 * kind of test source.
 * @param {Function} [class_] if provided, gives
 * {@link Crucible.SourceHandler#handles} a default implementation that checks
 * if the source is an instance of the given class
 */
Crucible.SourceHandler = function SourceHandler(class_) {
	if (typeof(class_) == 'function') {
		this.handles = function source_instance_of_handle(source) {
			return (source instanceof class_);
		}
	} else if (class_) {
		throw new TypeError('To generate a default "handles" method, the ' +
			'class_ parameter must be a function to which instanceof can be ' +
			'applied.');
	}
};

Crucible.augment(Crucible.SourceHandler.prototype,
	/** @lends Crucible.SourceHandler.prototype */
{
	/**
	 * Checks to see if this SourceHandler handles the given source.
	 * @param {Object} source the test source
	 * @return {Boolean} true if it can be handled, false if otherwise
	 */
	handles: function(source) {
		throw new Error('Abstract function.');
	},
	
	/**
	 * Gets an array of all tests provided by this source.
	 * @param {Object} source the test source
	 * @return {Crucible.Test[]} the tests
	 */
	getTests: function(source) {
		throw new Error('Abstract function.');
	},
	
	/**
	 * Runs all tests contained within the source.
	 * @param {Object} parent the source's parent, or null if there is none
	 * @param {Object} source the source whose tests should be run
	 * @param {Crucible.Runner} runner a runner to post event notices to
	 * @return {void}
	 */
	run: function(parent, source, runner) {
		throw new Error('Abstract function.');
	}
});
