/**
 * @namespace Debugging tools for Crucible tests.
 */
Crucible.Tools = {
	/**
	 * Inspects an object, returning a readble, evaluatable representation of
	 * it.
	 * @param obj any JavaScript value
	 * @return {String} a representation of the value
	 */
	inspect: function inspect_object(obj) {
		return Crucible.Tools.inspect.handlers[typeof(obj)](obj);
	},
	
	/**
	 * Replace all occurences of pattern in the string with the replacement.
	 * @param {String} source the original source string
	 * @param {String|RegExp} pattern the text to search for (do not use the
	 *        "g" flag if the pattern is a regular expression)
	 * @param {String|Function} the replacement text, or a function that
	 *        returns it
	 * @return {String} the resulting string
	 */
	gsub: function gsub(source, pattern, replacement) {
		var result = '', match, after;
		
		while (source.length > 0) {
			match = source.match(pattern)
			if (match) {
				result += source.slice(0, match.index);
				after = (typeof(replacement) == 'function')
					? replacement(match)
					: replacement;

				if (after)
					result += after;
				source = source.slice(match.index + match[0].length);
			} else {
				result += source;
				source = '';
			}
		}
		
		return result;
	}
};

Crucible.Tools.inspect.handlers = {
	string: function(s) {
		for (var sp_char in this.string.chars) {
			s = Crucible.Tools.gsub(s, sp_char, this.string.chars[sp_char]);
		}
		return '"' + s + '"';
	},
	
	number: function(n) {
		return String(n);
	},
	
	boolean: function(b) {
		return String(b);
	},
	
	'function': function(f) {
		return 'function' + (f.name ? ' ' + f.name : '') + '()';
	},
	
	'object': function(o) {
		var reprs = [];
		
		if (o === null)
			return 'null';
		
		for (var name in o) {
			reprs.push(name + ': ' + Crucible.Tools.inspect(o[name]));
		}
		
		return '{' + reprs.join(', ') + '}';
	}
};

Crucible.Tools.inspect.handlers.string.chars = {
	"\b": '\\b',
	"\t": '\\t',
	"\n": '\\n',
	"\v": '\\v',
	"\f": '\\f',
	"\r": '\\r',
	'"': '\\"'
};
