/**
 * Thrown by assertions that spawn asynchronus tests, signalling the
 * inconclusive end of the current test.
 * @augments Error
 */
Crucible.AsyncCompletion = function AsyncCompletion() {
	Error.call(this, 'Test will be completed asynchronusly. (Not an error.)');
	this.name = "Crucible.AsyncCompletion";
};

Crucible.AsyncCompletion.prototype = new Error(null);
