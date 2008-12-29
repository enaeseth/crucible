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
	},
	
	/**
	 * Returns the attributes of an element.
	 * @param {Element}	elem
	 * @return {Object}	an object whose keys are attribute names and whose
	 *					values are the corresponding values
	 */
	get_attributes: function get_element_attributes(elem)
	{
		var attrs = {};
		
		if (typeof(elem) != 'object' || !elem) {
			throw new TypeError('Cannot get the attributes of a non-object.');
		}
		
		if (elem.nodeType != 1 || !elem.hasAttributes())
			return attrs;
		
		for (var i = 0; i < elem.attributes.length; i++) {
			var a = elem.attributes[i];
			if (!a.specified || a.nodeName in attrs)
				continue;
			
			var v;
			try {
				v = a.nodeValue.toString();
			} catch (e) {
				v = a.nodeValue;
			}
			
			switch (a.nodeName) {
				case 'class':
					attrs.className = v;
					break;
				case 'for':
					attrs.htmlFor = v;
					break;
				default:
					attrs[a.nodeName] = v;
			}
		}
		
		return attrs;
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
		
		if (o.nodeType) {
			if (o.nodeType == 3)
				return this.string(o.nodeValue);
			else if (o.nodeType == 1)
				return this.element(o);
			else if (o.nodeType == 8)
				return this.comment(o);
			else if (o.nodeType == 9)
				return this.document(o);
			else
				return '[Node]';
		}
		
		if (typeof(o.length) == 'number' && o.length >= 0)
			return this.array(o);
		
		for (var name in o) {
			if (name in Object.prototype)
				continue;
			reprs.push(name + ': ' + Crucible.Tools.inspect(o[name]));
		}
		
		return '{' + reprs.join(', ') + '}';
	},
	
	'array': function(a) {
		var reprs = [];
		
		for (var i = 0; i < a.length; i++) {
			reprs.push(Crucible.Tools.inspect(a[i]));
		}
		
		return '[' + reprs.join(', ') + ']';
	},
	
	'undefined': function() {
		return 'undefined';
	},
	
	element: function(el) {
		var attrs, name, tag;
		
		tag = '<' + el.tagName.toLowerCase();
		
		attrs = Crucible.Tools.get_attributes(el);
		for (var name in attrs) {
			tag += ' ' + name + '="' + attrs[name] + '"';
		}
		
		return tag + '>';
	},
	
	comment: function(node) {
		return '<!-- ' + node.nodeValue + ' -->';
	},
	
	document: function(document) {
		return '[Document]';
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
