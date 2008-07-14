/**
 * @namespace Saves Crucible user preferences.
 */
Crucible.Preferences = {
	_values: {},
	
	get: function get_preference(name) {
		var self = Crucible.Preferences;
		var process, value;
		
		if (self._values[name])
			return self._values[name];
			
		process = self._get_processor(name, 'get');
		value = self._get_cookie('crucible_' + name);
		
		return (value) ? process(value) : self._prefs[name].value;
	},
	
	set: function set_preference(name, value) {
		var self = Crucible.Preferences;
		var process;
		
		process = self._get_processor(name, 'set');
		
		self._values[name] = value;
		self._set_cookie('crucible_' + name, process(value), 730);
	},
	
	_get_cookie: function _get_cookie(name) {
		var cookies = document.cookie.split(';');
		var cookie_pattern = /(\S+)=(.+)$/;
		var i, match;
		
		for (i = 0; i < cookies.length; i++) {
			match = cookie_pattern.exec(cookies[i]);
			if (!match || !match[1] || !match[2])	
				continue;
			
			if (name && match[1] == name)
				return match[2];
		}
		
		return null;
	},
	
	_set_cookie: function _set_cookie(name, value, days) {
		var expires = '';
		
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			
			expires = '; expires=' + date.toGMTString();
		}
		
		document.cookie = name + '=' + value + expires + '; path=/';
	},
	
	_get_processor: function _get_preference_processor(pref_name, which) {
		var pref = Crucible.Preferences._prefs[pref_name];
		var proc;
		
		if (!pref) {
			throw new Error('Unknown preference "' + pref_name + '".');
		}
		
		proc = pref.processor || 'string';
		
		if (which != 'get' && which != 'set')
			throw new Error('Invalid preference direction "' + which + '".');
		
		if (typeof(proc) == 'string') {
			if (!Crucible.Preferences._default_processors[proc]) {
				throw new Error('Unknown default preference processor "' +
					proc + '".');
			}
			proc = Crucible.Preferences._default_processors[proc];
		}
		
		if (!proc[which]) {
			throw new Error('Invalid preference processor for "' + pref_name +
				'".');
		}
		
		return proc[which];
	},
	
	_prefs: {
		pr_status: {
			value: 'closed'
		}
	},
	
	_default_processors: {
		'string': {
			get: Crucible.constantFunction,
			set: Crucible.constantFunction
		}
	}
};
