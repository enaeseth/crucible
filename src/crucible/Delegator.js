/**
 * Constructs a new Delegator.
 * @class A function proxy that transmits calls to all registered listeners.
 */
Crucible.Delegator = function Delegator(name) {
	if (name)
		this.name = name;
};

Crucible.augment(Crucible.Delegator.prototype,
	/** @lends Crucible.Delegator.prototype */
{
	/**
	 * The delegator's name, or null if it is anonymous.
	 * @type String
	 */
	name: null,
	
	/**
	 * All listening functions.
	 * @type Object[]
	 * @private
	 */
	listeners: [],
	
	/**
	 * Calls all listeners.
	 * @return {void}
	 */
	call: function call_delegates() {
		var i, len, l;
		for (i = 0, len = this.listeners.length; i < len; i++) {
			l = this.listeners[i];
			if (typeof(l.listener) == 'function')
				l.listener.apply(l.context, arguments);
			else
				l.listener[l.context].apply(l.listener, arguments);
		}
	},
	
	/**
	 * Adds a new function as a listener.
	 * @param {Function|Object} listener
	 * @param {Object|Function} [context=null]
	 * @return {void}
	 */
	add: function add_listener_to_delegator(listener, context) {
		if (typeof(listener) == 'function') {
			this.listeners.push({
				listener: listener,
				context: context || null
			});
		} else if (typeof(listener) == 'object') {
			this.listeners.push({
				listener: listener,
				context: context || 'handleEvent'
			});
		} else {
			throw new TypeError('Cannot add a "' + typeof(listener) + '" ' +
				'as a delegation listener.');
		}
	},
	
	/**
	 * Removes a listener.
	 * @param {Function|Object} listener
	 * @param {Object|Function} [context=null]
	 * @return {Boolean} true if a matching listener was found and removed,
	 *         false if otherwise
	 */
	remove: function remove_listener_from_delegator(listener, context) {
		var i, l;
		
		if (typeof(listener) == 'function') {
			if (!context)
				context = null;
		} else if (typeof(listener) == 'object') {
			if (!context)
				context = 'handleEvent';
		} else {
			return false;
		}
		
		for (i = 0; i < this.listeners.length; i++) {
			l = this.listeners[i];
			if (l.listener == listener && l.context == context) {
				this.listeners.splice(i, 1);
				return true;
			}
		}
		
		return false;
	}
});


 