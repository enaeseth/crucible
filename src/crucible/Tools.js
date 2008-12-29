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
	
	trim: function trim_string(str) {
		str = str.replace(/^\s+/, '');
		for (var i = str.length - 1; i >= 0; i--) {
			if (/\S/.test(str.charAt(i))) {
				str = str.substring(0, i + 1);
				break;
			}
		}
		return str;
	},
	
	/**
	 * Returns the attributes of an element.
	 * @param {Element}	elem
	 * @return {Object}	an object whose keys are attribute names and whose
	 *					values are the corresponding values
	 */
	getAttributes: function get_element_attributes(elem)
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
	},
	
	element: function create_element(name, attrs, children)
	{
		var e = document.createElement(name.toUpperCase());

		function collapse(i, dom_text)
		{
			switch (typeof(i)) {
				case 'function':
					return collapse(i(), dom_text);
				case 'string':
					return (dom_text) ? document.createTextNode(i) : i;
				default:
					return i;
			}
		}

		function dim(dimension)
		{
			return (typeof(dimension) == 'number') ?
				dimension + 'px' :
				dimension;
		}

		var style = {};

		for (var name in attrs || {}) {
			var dest_name = name;

			switch (name) {
				case 'className':
				case 'class':
					var klass = attrs[name];

					// Allow an array of classes to be passed in.
					if (typeof(klass) != 'string' && klass.join)
						klass = klass.join(' ');

					e.className = klass;
					continue; // note that this continues the for loop!
				case 'htmlFor':
					dest_name = 'for';
					break;
				case 'style':
					if (typeof(style) == 'object') {
						style = attrs.style;
						continue; // note that this continues the for loop!
					}
			}

			var a = attrs[name];
			if (typeof(a) == 'boolean') {
				if (a)
					e.setAttribute(dest_name, dest_name);
				else
					continue;
			} else {
				e.setAttribute(dest_name, collapse(a, false));
			}
		}

		for (var name in style) {
			// Special cases
			switch (name) {
				case 'box':
					var box = style[name];
					e.style.left = dim(box[0]);
					e.style.top = dim(box[1]);
					e.style.width = dim(box[2]);
					e.style.height = dim(box[3] || box[2]);
					break;
				case 'left':
				case 'top':
				case 'right':
				case 'bottom':
				case 'width':
				case 'height':
					e.style[name] = dim(style[name]);
					break;
				default:
					e.style[name] = style[name];
			}
		}
		
		if (typeof(children) == 'string')
			children = [children];
		Crucible.forEach(children || [], function(c) {
			e.appendChild(collapse(c, true));
		});

		return e;
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
