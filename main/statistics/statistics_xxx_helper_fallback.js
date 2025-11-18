'use strict';
//01/10/25

/* exported colorbrewer, opaqueColor, invert, chars, isFunction, range, cyclicOffset, getAlpha, _bt, _qCond, round, require, throttle, _button, exports, memoryPrint, Input, isArrayEqual */

/*
	helpers_xxx_UI.js
*/
include(fb.ComponentPath + 'docs\\Flags.js');
/* global SF_CENTRE:readable, IDC_HAND */

const WshShellUI = new ActiveXObject('WScript.Shell');

// colorbrewer presets
const colorbrewer = {
	diverging: ['Spectral', 'RdYlGn', 'RdBu', 'PiYG', 'PRGn', 'RdYlBu', 'BrBG', 'RdGy', 'PuOr'],
	qualitative: ['Set2', 'Accent', 'Set1', 'Set3', 'Dark2', 'Paired', 'Pastel2', 'Pastel1'],
	sequential: ['OrRd', 'PuBu', 'BuPu', 'Oranges', 'BuGn', 'YlOrBr', 'YlGn', 'Reds', 'RdPu', 'Greens', 'YlGnBu', 'Purples', 'GnBu', 'Greys', 'YlOrRd', 'PuRd', 'Blues', 'PuBuGn'],
	colorBlind: {
		diverging: ['RdBu', 'PiYG', 'PRGn', 'RdYlBu', 'BrBG', 'PuOr'],
		qualitative: ['Set2', 'Dark2', 'Paired'],
		sequential: ['OrRd', 'PuBu', 'BuPu', 'Oranges', 'BuGn', 'YlOrBr', 'YlGn', 'Reds', 'RdPu', 'Greens', 'YlGnBu', 'Purples', 'GnBu', 'Greys', 'YlOrRd', 'PuRd', 'Blues', 'PuBuGn']
	}
};

// Cache
const scaleDPI = { factor: -1, reference: 72 }; // Caches _scale() values;
const fonts = { notFound: [] }; // Caches _gdiFont() values;

function _scale(size, bRound = true) {
	if (scaleDPI.factor === -1) {
		if (typeof window.DPI === 'number') {
			scaleDPI.factor = window.DPI / scaleDPI.reference;
		} else {
			try {
				scaleDPI.factor = Number(WshShellUI.RegRead('HKCU\\Control Panel\\Desktop\\WindowMetrics\\AppliedDPI')) / scaleDPI.reference;
			} catch (e) { // eslint-disable-line no-unused-vars
				try {
					scaleDPI.factor = Number(WshShellUI.RegRead('HKCU\\Control Panel\\Desktop\\LogPixels')) / scaleDPI.reference;
				} catch (e) { // eslint-disable-line no-unused-vars
					try {
						scaleDPI.factor = Number(WshShellUI.RegRead('HKCU\\Software\\System\\CurrentControlSet\\Hardware Profiles\\Current\\Software\\Fonts\\LogPixels')) / scaleDPI.reference;
					} catch (e) { // eslint-disable-line no-unused-vars
						try {
							scaleDPI.factor = Number(WshShellUI.RegRead('HKLM\\Software\\Microsoft\\Windows NT\\CurrentVersion\\FontDPI\\LogPixels')) / scaleDPI.reference;
						} catch (e) { // eslint-disable-line no-unused-vars
							try {
								scaleDPI.factor = Number(WshShellUI.RegRead('HKLM\\System\\CurrentControlSet\\Hardware Profiles\\Current\\Software\\Fonts\\LogPixels')) / scaleDPI.reference;
							} catch (e) { // eslint-disable-line no-unused-vars
								scaleDPI.factor = 1;
							}
						}
					}
				}
			}
		}
	}
	return (bRound ? Math.round(size * scaleDPI.factor) : size * scaleDPI.factor);
}

function _gdiFont(name, size, style) {
	let id = name.toLowerCase() + '_' + size + '_' + (style || 0);
	if (!fonts[id]) {
		fonts[id] = gdi.Font(name, size, style || 0);
	}
	if (fonts[id].Name !== name && !fonts.notFound.includes(name)) { // Display once per session, otherwise it floods the console with the same message...
		fonts.notFound.push(name);
		fb.ShowPopupMessage('Missing font: ' + name + '\n\nPlease install the required fonts found at:\nhttps://github.com/regorxxx/foobar2000-assets/tree/main/Fonts\n\nA restart is required after installation!', window.Name + ' (' + window.ScriptInfo.Name + ')');
		console.log('Missing font: ' + name);
	}
	return fonts[id];
}

function _tt(value, font = 'Segoe UI', fontSize = _scale(10), width = 600) {
	this.tooltip = window.Tooltip;
	this.font = { name: font, size: fontSize };
	this.tooltip.SetFont(font, fontSize);
	this.width = width;
	this.tooltip.SetMaxWidth(width);
	this.text = this.tooltip.Text = value;
	this.oldDelay = this.tooltip.GetDelayTime(3); //TTDT_INITIAL
	this.bActive = false;

	this.SetValue = function (value, bForceActivate = false) {
		if (value === null) {
			this.Deactivate();
		} else {
			if (this.tooltip.Text !== value) {
				this.tooltip.Text = value;
				this.Activate();
			}
			if (bForceActivate) { this.Activate(); } // Only on force to avoid flicker
		}
	};

	this.SetFont = function (font_name, font_size_pxOpt, font_styleOpt) {
		this.tooltip.SetFont(font_name, font_size_pxOpt, font_styleOpt);
	};

	this.SetMaxWidth = function (width) {
		this.tooltip.SetMaxWidth(width);
	};

	this.Activate = function () {
		this.tooltip.Activate();
		this.bActive = true;
	};

	this.Deactivate = function () {
		this.tooltip.Deactivate();
		this.bActive = false;
	};

	this.SetDelayTime = function (type, time) {
		this.tooltip.SetDelayTime(type, time);
	};

	this.GetDelayTime = function (type) {
		this.tooltip.GetDelayTime(type);
	};

}

function RGB(r, g, b) {
	return (0xff000000 | (r << 16) | (g << 8) | (b));
}

function RGBA(r, g, b, a) {
	let res = 0xff000000 | (r << 16) | (g << 8) | (b);
	if (typeof a !== 'undefined') { res = (res & 0x00ffffff) | (a << 24); }
	return res;
}

function toRGB(color) { // returns an array like [192, 0, 0]
	const a = color - 0xFF000000;
	return [a >> 16 & 0xFF, a >> 8 & 0xFF, a & 0xFF];
}


function getAlpha(color) {
	return ((color >> 24) & 0xff);
}

function getRed(color) {
	return ((color >> 16) & 0xff);
}

function getGreen(color) {
	return ((color >> 8) & 0xff);
}

function getBlue(color) {
	return (color & 0xff);
}

function getBrightness(r, g, b) { // https://www.w3.org/TR/AERT/#color-contrast
	return (r * 0.299 + g * 0.587 + b * 0.114);
}

function isDark(r, g, b) {
	return (getBrightness(r, g, b) < 186);
}

function opaqueColor(color, percent) {
	return RGBA(...toRGB(color), Math.min(255, 255 * (percent / 100)));
}

function invert(color, bBW = false) {
	const [r, g, b] = [getRed(color), getGreen(color), getBlue(color)];
	if (bBW) {
		return (isDark(r, g, b) ? RGB(255, 255, 255) : RGB(0, 0, 0));
	} else {
		return RGB(255 - r, 255 - g, 255 - b);
	}
}

/*
	helpers_xxx_UI_chars.js
*/

const chars = {
	cogs: '\uf085',
	chartV2: '\uf080',
	// Carets
	left: '\uf053',
	right: '\uf054',
	up: '\uf077',
	down: '\uf078',
	// Utilities
	searchPlus: '\uf00e',
	searchMinus: '\uf010',
};

/*
	helpers_xxx_UI_flip.js
*/

String.prototype.flip = function () { // NOSONAR
	const last = this.length - 1;
	let result = new Array(this.length);
	for (let i = last; i >= 0; --i) {
		let c = this.charAt(i);
		let r = flipTable[c.toLowerCase()];
		result[last - i] = r !== void (0) ? r : c;
	}
	return result.join('');
};

const flipTable = {
	a: '\u0250',
	b: 'q',
	c: '\u0254',
	d: 'p',
	e: '\u01DD',
	f: '\u025F',
	g: '\u0183',
	h: '\u0265',
	i: '\u0131',
	j: '\u027E',
	k: '\u029E',
	//l : '\u0283',
	m: '\u026F',
	n: 'u',
	p: 'q',
	r: '\u0279',
	t: '\u0287',
	v: '\u028C',
	w: '\u028D',
	y: '\u028E',
	'.': '\u02D9',
	'[': ']',
	'(': ')',
	'{': '}',
	'?': '\u00BF',
	'!': '\u00A1',
	'\'': ',',
	'<': '>',
	'_': '\u203E',
	';': '\u061B',
	'\u203F': '\u2040',
	'\u2045': '\u2046',
	'\u2234': '\u2235',
	'\r': '\n'
};
for (let i in flipTable) { flipTable[flipTable[i]] = i; }

/*
	helpers_xxx_prototypes.js
*/
function isArrayEqual(arrayA, arrayB) {
	return new Set(arrayA).isEqual(new Set(arrayB));
}

function roughSizeOfObject(object) {
	const objectList = new Set([]);
	const stack = [object];
	let bytes = 0;
	while (stack.length) {
		const value = stack.pop();
		const type = typeof value;
		if (type === 'boolean') {
			bytes += 4;
		} else if (type === 'string') {
			bytes += value.length * 2;
		} else if (type === 'number') {
			bytes += 8;
		} else if (type === 'object' && value === null) {
			bytes += 4;
		} else if (type === 'object' && value instanceof FbMetadbHandleList) {
			bytes += 8;
			value.Convert().forEach((handle) => {
				bytes += 24;
				bytes += handle.Path.length * 2;
				bytes += handle.RawPath.length * 2;
			});
		} else if (type === 'object' && value instanceof FbTitleFormat) {
			bytes += 8;
			bytes += value.Expression.length * 2;
		} else if (type === 'object' && toType(value) === 'FbMetadbHandle') {
			bytes += 24;
			bytes += value.Path.length * 2;
			bytes += value.RawPath.length * 2;
		} else if (type === 'object' && (value instanceof Set || Array.isArray(value))) {
			if (!objectList.has(value)) {
				objectList.add(value);
				for (const subVal of value) {
					stack.push(subVal);
				}
			}
		} else if (type === 'object' && value instanceof Map) {
			if (!objectList.has(value)) {
				objectList.add(value);
				for (const [key, subVal] of value) {
					stack.push(key, subVal);
				}
			}
		} else if (type === 'object') {
			if (!objectList.has(value)) {
				objectList.add(value);
				for (const prop in value) {
					if (Object.hasOwn(value, prop)) {
						stack.push(value[prop]);
					}
				}
			}
		}
	}
	return bytes;
}

function toType(a) {
	// Get fine type (object, array, function, null, error, date ...)
	return ({}).toString.call(a).match(/([a-z]+)(:?\])/i)[1];
}

function isFunction(obj) {
	return !!(obj && obj.constructor && obj.call && obj.apply);
}

// Randomly rearranges the items in an array, modifies original. Fisher-Yates algorithm
Array.prototype.shuffle = function () { // NOSONAR
	let last = this.length, n;
	while (last > 0) {
		n = Math.floor(Math.random() * last--);
		[this[n], this[last]] = [this[last], this[n]];
	}
	return this;
};

// https://github.com/aldo-gutierrez/bitmasksorterJS
const bitmask = require('..\\helpers-external\\bitmasksorterjs\\bitmasksorterjs');
Array.prototype.radixSort = function (bReverse = false, start, end) { // NOSONAR
	return bReverse //NOSONAR
		? bitmask.sortNumber.call(this, this, start, end).reverse()
		: bitmask.sortNumber.call(this, this, start, end);
};
Array.prototype.radixSortInt = function (bReverse = false, start, end) { // NOSONAR
	return bReverse //NOSONAR
		? bitmask.sortInt.call(this, this, start, end).reverse()
		: bitmask.sortInt.call(this, this, start, end);
};

// https://en.wikipedia.org/wiki/Schwartzian_transform
// or (a, b) => {return a[1].localeCompare(b[1]);}
Array.prototype.schwartzianSort = function (processFunc, sortFunc = (a, b) => a[1] - b[1]) { // NOSONAR
	return this.map((x) => [x, processFunc(x)]).sort(sortFunc).map((x) => x[0]); // NOSONAR
};

const range = (start, stop, step) => Array.from({ length: Math.round((stop - start) / step + 1) }, (_, i) => start + (i * step));

// Adds/subtracts 'offset' to 'reference' considering the values must follow cyclic logic within 'limits' range (both values included)
// Ex: [1,8], x = 5 -> x + 4 = 1 <=> cyclicOffset(5, 4, [1,8])
function cyclicOffset(reference, offset, limits) {
	if (offset && reference >= limits[0] && reference <= limits[1]) {
		reference += offset;
		if (reference < limits[0]) { reference += limits[1]; }
		if (reference > limits[1]) { reference -= limits[1]; }
	}
	return reference;
}

const cutRegex = {};
String.prototype.cut = function cut(c) { // NOSONAR
	if (!Object.hasOwn(cutRegex, c)) { cutRegex[c] = new RegExp('^(.{' + c + '}).{2,}', 'g'); }
	return this.replace(cutRegex[c], '$1…');
};

function _p(value) {
	return '(' + value + ')';
}

function _b(value) {
	return '[' + value + ']';
}

function _t(tag) {
	return tag.includes('%') ? tag : '%' + tag + '%';
}

function _bt(tag) {
	return _b(_t(tag));
}

function _q(value) {
	return '"' + value + '"';
}

function _qCond(tag, bUnquote = false) {
	return bUnquote //NOSONAR
		? tag.replace(/(^")(?:.*\$+.*)("$)/g, '')
		: tag.includes('$')
			? _q(tag)
			: tag;
}

function round(floatNum, decimals, eps = 10 ** -14) {
	let result;
	if (decimals > 0) {
		if (decimals === 15) { result = floatNum; }
		else { result = Math.round(floatNum * Math.pow(10, decimals) + eps) / Math.pow(10, decimals); }
	} else { result = Math.round(floatNum); }
	return result;
}

/*
	helpers_xxx_basic_js.js
*/
let module = {}, exports = {};
module.exports = null;

function require(script) { // Must be path relative to this file, not the parent one
	let newScript = script;
	['helpers-external', 'main', 'examples', 'buttons'].forEach((folder) => { newScript.replace(new RegExp('^\\.\\\\' + folder + '\\\\', 'i'), '..\\' + folder + '\\'); });
	['helpers'].forEach((folder) => { newScript.replace(new RegExp('^\\.\\\\' + folder + '\\\\', 'i'), ''); });
	include(newScript + '.js');
	return module.exports;
}

const debounce = (fn, delay, immediate = false, parent = this) => {
	let timerId;
	return (...args) => {
		const boundFunc = fn.bind(parent, ...args);
		clearTimeout(timerId);
		if (immediate && !timerId) { boundFunc(); }
		const calleeFunc = immediate ? () => { timerId = null; } : boundFunc;
		timerId = setTimeout(calleeFunc, delay);
		return timerId;
	};
};

const throttle = (fn, delay, immediate = false, parent = this) => {
	let timerId;
	return (...args) => {
		const boundFunc = fn.bind(parent, ...args);
		if (timerId) { return; }
		if (immediate && !timerId) { boundFunc(); }
		timerId = setTimeout(() => {
			if (!immediate) {
				boundFunc();
			}
			timerId = null;
		}, delay);
	};
};

/*
	helpers_xxx_prototypes_smp.js
*/


// Add ES2022 method
// https://github.com/tc39/proposal-accessible-object-hasownproperty
if (!Object.hasOwn) {
	Object.defineProperty(Object, 'hasOwn', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function (object, property) {
			if (object === null) {
				throw new TypeError('Cannot convert undefined or null to object');
			}
			return Object.prototype.hasOwnProperty.call(Object(object), property); // NOSONAR
		}
	});
}
FbTitleFormat.prototype.EvalWithMetadbsAsync = function EvalWithMetadbsAsync(handleList, slice = 1000) {
	const size = handleList.Count;
	// eslint-disable-next-line no-async-promise-executor
	return new Promise(async (resolve) => { // NOSONAR
		const items = handleList.Convert();
		const count = items.length;
		const total = Math.ceil(size / slice);
		const tags = [];
		let prevProgress = -1;
		for (let i = 1; i <= total; i++) {
			await new Promise((resolve) => {
				setTimeout(() => {
					const iItems = new FbMetadbHandleList(items.slice((i - 1) * slice, i === total ? count : i * slice));
					tags.push(...this.EvalWithMetadbs(iItems));
					const progress = Math.round(i / total * 100);
					if (progress % 25 === 0 && progress > prevProgress) { prevProgress = progress; console.log('EvalWithMetadbsAsync ' + _p(this.Expression) + ' ' + progress + '%.'); }
					resolve('done');
				}, 25);
			});
		}
		resolve(tags);
	});
};

{	// Augment fb.TitleFormat
	const old = fb.TitleFormat;
	fb.TitleFormat = function TitleFormat() {
		const that = old.apply(fb, [...arguments]);
		that.Expression = arguments[0];
		return that;
	};
}

{	// Augment FbTitleFormat
	const old = FbTitleFormat;
	FbTitleFormat = function FbTitleFormat() { // NOSONAR
		const that = old(...arguments);
		that.Expression = arguments[0];
		return that;
	};
}

/*
	window_xxx_button.js
*/
function _button({
	text = '',
	x, y, w, h,
	isVisible = (time, timer) => this.hover || Date.now() - time < (timer || this.timer),
	notVisibleMode = 'invisible', // invisible | alpha
	lbtnFunc = () => void (0),
	lbtnDblFunc = () => void (0),
	rbtnFunc = () => void (0),
	scrollSpeed = 60, // ms
	scrollSteps = 3, // ms
	timer = 1500, // ms
	bTimerOnVisible = false, // ms
	tt = '',
	iDoubleClickTimer = 250, // ms
} = {}) {
	this.paint = (gr, color) => {
		if (this.w <= 1) { return; }
		// Smooth visibility switch
		let bLastStep = false;
		if (this.isVisible && !this.isVisible(this.time, this.timer)) {
			if (this.bVisible) {
				this.bVisible = false;
			} else {
				switch (this.notVisibleMode) { // NOSONAR
					case 'invisible': return;
					default: {
						color = RGBA(...toRGB(color), this.notVisibleMode);
						bLastStep = true;
					}
				}
			}
		}
		if (!this.hover) { color = RGBA(...toRGB(color), getBrightness(...toRGB(color)) < 50 ? 100 : 25); }
		gr.SetTextRenderingHint(4);
		const text = this.text && this.text.constructor && this.text.call && this.text.apply ? this.text.call(this, this) : this.text; // NOSONAR [support both this]
		gr.DrawString(text, this.font, color, this.x, this.y, this.w, this.h, SF_CENTRE);
		gr.SetTextRenderingHint(0);
		if (!bLastStep && this.isVisible) { this.repaint(this.timer); } // Smooth visibility switch
	};
	const debounced = {
		[this.timer]: debounce(window.RepaintRect, this.timer, false, window)
	};
	this.repaint = (timeout = 0) => {
		if (timeout === 0) { window.RepaintRect(this.x, this.y, this.x + this.w, this.y + this.h); }
		else {
			if (!Object.hasOwn(debounced, timeout)) { debounced[timeout] = debounce(window.RepaintRect, timeout, false, window); }
			debounced[timeout](this.x, this.y, this.x + this.w, this.y + this.h, true);
		}
	};
	this.trace = (x, y) => {
		return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h && this.isVisible();
	};
	this.move = (x, y) => {
		if (this.trace(x, y)) {
			this.time = Date.now();
			window.SetCursor(IDC_HAND);
			this.hover = true;
			if (this.hover && this.tt) {
				if (this.tooltip.Text) { this.tooltip.Deactivate(); }
				this.tooltip.SetValue(this.tt, true);
			}
			return true;
		} else {
			if (this.tooltip.Text) { this.tooltip.SetValue(null); }
			if (this.bTimerOnVisible && this.isVisible()) { this.time = Date.now(); }
			this.hover = this.bDown = false;
			return false;
		}
	};
	let downFunc = null;
	let draggingTime = 0;
	this.lbtn_down = (x, y, mask, parent) => {
		if (!this.scrollSpeed) { return false; }
		if (this.trace(x, y)) {
			this.bHover = true;
			if (this.bHover) {
				this.bDown = true;
				if (this.lbtnFunc) {
					draggingTime = 0;
					downFunc = setInterval(() => {
						if (this.bDown) {
							const delta = 1 + (draggingTime > this.scrollSpeed * 3 ? Math.log(draggingTime / this.scrollSpeed) * this.scrollSteps : 0);
							this.lbtnFunc.call(parent, x, y, mask, parent, delta);
							this.repaint();
						}
						draggingTime += this.scrollSpeed;
					}, this.scrollSpeed);
				}
			}
			this.repaint();
			return true;
		} else {
			this.bHover = this.bDown = false;
		}
		return false;
	};
	this.lbtn_up = (x, y, mask, parent) => {
		this.bDown = false;
		if (downFunc) { clearInterval(downFunc); downFunc = null; draggingTime = 0; }
		if (this.trace(x, y)) {
			if (this.lbtnFunc) {
				if (!this.bDblClk) {
					if (parent) {
						this.timeoutLClick = setTimeout(() => this.lbtnFunc.call(parent, x, y, mask, parent, 1), this.iDoubleClickTimer);
					} else {
						this.timeoutLClick = setTimeout(() => this.lbtnFunc(x, y, mask, 1), this.iDoubleClickTimer);
					}
				} else { this.bDblClk = false; }
			}
			return true;
		} else {
			return false;
		}
	};
	this.rbtn_up = (x, y, mask, parent) => {
		if (this.trace(x, y)) {
			if (this.rbtnFunc) {
				if (parent) {
					this.rbtnFunc.call(parent, x, y, mask, parent);
				} else {
					this.rbtnFunc(x, y, mask);
				}
			}
			return true;
		} else {
			return false;
		}
	};
	this.lbtn_dblclk = (x, y, mask, parent) => {
		if (this.trace(x, y)) {
			if (!this.hover || !this.isVisible()) { return false; }
			else if (this.lbtnDblFunc) {
				if (parent) {
					this.lbtnDblFunc.call(parent, x, y, mask, parent);
				} else {
					this.lbtnDblFunc(x, y, mask);
				}
			}
			this.bDblClk = true;
			clearTimeout(this.timeoutLClick);
			this.timeoutLClick = null;
			return true;
		}
		return false;
	};
	this.hover = false;
	this.bDown = false;
	this.text = text;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.isVisible = isVisible;
	this.notVisibleMode = notVisibleMode;
	this.bTimerOnVisible = bTimerOnVisible;
	this.bVisible = true;
	this.lbtnFunc = lbtnFunc;
	this.lbtnDblFunc = lbtnDblFunc;
	this.rbtnFunc = rbtnFunc;
	this.tt = tt;
	this.font = _gdiFont('FontAwesome', this.h);
	this.tooltip = new _tt(null, void (0), void (0), 600);
	this.time = Date.now();
	this.timer = timer;
	this.bDblClk = false;
	this.scrollSpeed = scrollSpeed;
	this.scrollSteps = scrollSteps;
	this.iDoubleClickTimer = iDoubleClickTimer;
	this.timeoutLClick = null;
}

/*
	helpers_xxx_foobar.js
*/
function memoryPrint(text, obj) {
	console.log(
		window.Name + ' (' + window.ScriptInfo.Name + ')' + (text ? ' - ' + text : '') +
		(
			typeof obj !== 'undefined'
				? '\n\t Panel memory usage: ' + roughSizeOfObject(obj)
				: ''
		) +
		'\n\t Panel memory usage: ' + utils.FormatFileSize(window.JsMemoryStats.MemoryUsage) +
		'  /  Total memory usage:: ' + utils.FormatFileSize(window.JsMemoryStats.TotalMemoryLimit)
	);
}

// Helpers for input popup and checking proper values are provided
// Provides extensive error popups on output to give feedback to the user
// Returns null when default value (oldVal) matches output
// Ex input.json('array numbers', [0, 2], 'Input an Array of numbers:', 'Input', JSON.stringify([0, 2])),
const Input = Object.seal(Object.freeze({
	// Data validation
	data: Object.seal({ last: null, lastInput: null }),
	/**
	 * Checks if last input is equal to the last default value
	 *
	 * @method
	 * @name (get) isLastEqual
	 * @kind property
	 * @memberof Input
	 * @returns {boolean}
	*/
	get isLastEqual() {
		if (typeof this.data.last === 'object') {
			return (JSON.stringify(this.data.last) === JSON.stringify(this.data.lastInput));
		} else {
			return (this.data.last === this.data.lastInput);
		}
	},
	/**
	 * Retrieves last default value as a raw value
	 *
	 * @method
	 * @name (get) lastInput
	 * @kind property
	 * @memberof Input
	 * @returns {any}
	*/
	get lastInput() {
		return this.data.lastInput;
	},
	/**
	 * Retrieves last user input as a raw value
	 *
	 * @method
	 * @name (get) lastInput
	 * @kind property
	 * @memberof Input
	 * @returns {any}
	*/
	get previousInput() {
		return this.data.last;
	},
	// Input methods
	/**
	 * Handles input validation for json values.
	 *
	 * @property
	 * @name json
	 * @kind method
	 * @memberof Input
	 * @param {'array'|'array numbers'|'array strings'|'array booleans'|'object'} type
	 * @param {Object} oldVal
	 * @param {String} message
	 * @param {String} title
	 * @param {String} example
	 * @param {Function[]} checks?
	 * @param {Boolean} bFilterFalse?
	 * @returns {null|Object}
	 */
	json: function (type, oldVal, message, title, example, checks = [], bFilterFalse = false) {
		const types = new Set(['array', 'array numbers', 'array strings', 'array booleans', 'object']);
		this.data.last = oldVal; this.data.lastInput = null;
		if (!types.has(type)) { throw new Error('Invalid type: ' + type); }
		let input, newVal;
		const oldValStr = JSON.stringify(oldVal);
		try {
			input = utils.InputBox(window.ID, message, title, oldVal ? JSON.stringify(oldVal) : '', true);
			if (!input || typeof input === 'string' && !input.length) { throw new Error('Invalid type'); }
			else { newVal = JSON.parse(input); }
			if (typeof newVal !== 'object') { throw new Error('Invalid type'); }
			if (type.startsWith('array') && !Array.isArray(newVal)) { throw new Error('Invalid type'); }
			switch (type) {
				case 'array': {
					newVal = bFilterFalse
						? newVal.filter((n) => n)
						: newVal.filter((n) => (n === '' || n === 0 || n));
					break;
				}
				case 'array numbers': {
					newVal = newVal.map((n) => Number(n));
					newVal = bFilterFalse
						? newVal.filter((n) => n)
						: newVal.filter((n) => (n === 0 || n));
					break;
				}
				case 'array strings': {
					newVal = newVal.map((n) => String(n));
					newVal = bFilterFalse
						? newVal.filter((n) => n)
						: newVal.filter((n) => (n === '' || n));
					break;
				}
				case 'array booleans': {
					newVal = newVal.map((n) => Boolean(n));
					if (bFilterFalse) { newVal = newVal.filter((n) => n); }
					break;
				}
				case 'object': {
					if (Array.isArray(newVal)) { throw new Error('Invalid type'); }
					break;
				}
			}
			if (checks && checks.length) {
				if (type.startsWith('array')) {
					if (!newVal.some((row) => !checks.some((check) => check.call(this, row)))) {
						throw new Error('Invalid checks');
					}
				} else if (type.startsWith('object')) {
					for (const key in newVal) {
						if (!checks.some((check) => check.call(this, newVal[key]))) {
							throw new Error('Invalid checks');
						}
					}
				}
			}
		}
		catch (e) {
			if (e.message === 'Invalid type' || e.name === 'SyntaxError') {
				fb.ShowPopupMessage('Value is not valid:\n' + input + '\n\nValue must be an ' + type.toUpperCase() + '\n\nExample:\n' + example, title);
			} else if (e.message === 'Invalid checks') {
				fb.ShowPopupMessage('Value is not valid:\n' + input + '\n\nValue must pass these checks:\n' + checks.map(f => this.cleanCheck(f)).join('\n') + '\n\nExample:\n' + example, title);
			} else if (e.message !== 'InputBox failed:\nDialog window was closed') {
				fb.ShowPopupMessage(e.name + '\n\n' + e.message, title);
			}
			return null;
		}
		this.data.lastInput = newVal;
		if (oldValStr === JSON.stringify(newVal)) { return null; }
		return newVal;
	},
	/**
	 * Handles input validation for number values.
	 *
	 * @property
	 * @name number
	 * @kind method
	 * @memberof Input
	 * @param {'int'|'int positive'|'int negative'|'float'|'float positive'|'float negative'|'real'|'real positive'|'real negative'} type
	 * @param {Number} oldVal
	 * @param {String} message
	 * @param {String} title
	 * @param {Number} example
	 * @param {Function[]} checks?
	 * @returns {null|Number}
	 */
	number: function (type, oldVal, message, title, example, checks = []) {
		const types = new Set(['int', 'int positive', 'int negative', 'float', 'float positive', 'float negative', 'real', 'real positive', 'real negative']);
		this.data.last = oldVal; this.data.lastInput = null;
		if (type && type.length) { type = type.replace('/integer/gi', 'int'); }
		if (!types.has(type)) { throw new Error('Invalid type: ' + type); }
		let input, newVal;
		try {
			input = utils.InputBox(window.ID, message, title, oldVal !== null && typeof oldVal !== 'undefined' ? oldVal : '', true);
			if (input === null || typeof input === 'undefined' || typeof input === 'string' && !input.length) { throw new Error('Invalid type'); }
			else { newVal = Number(input); }
			if (newVal.toString() !== input) { throw new Error('Invalid type'); } // No fancy number checks, just allow proper input
			if (type.startsWith('int') && Number.isFinite(newVal) && !Number.isInteger(newVal)) { throw new Error('Invalid type'); }
			else if (type.startsWith('float') && Number.isFinite(newVal) && Number.isInteger(newVal)) { throw new Error('Invalid type'); } // NOSONAR[more clear errors]
			switch (type) {
				case 'float':
				case 'real':
				case 'int': {
					break;
				}
				case 'float positive':
				case 'real positive':
				case 'int positive': {
					if (newVal < 0) { throw new Error('Invalid type'); }
					break;
				}
				case 'float negative':
				case 'real negative':
				case 'int negative': {
					if (newVal > 0) { throw new Error('Invalid type'); }
					break;
				}
			}
			if (checks && checks.length && !checks.some((check) => check.call(this, newVal))) {
				throw new Error('Invalid checks');
			}
		}
		catch (e) {
			if (e.message === 'Invalid type' || e.name === 'SyntaxError') {
				fb.ShowPopupMessage('Value is not valid:\n' + input + '\n\nValue must be an ' + type.toUpperCase() + '\n\nExample:\n' + example, title);
			} else if (e.message === 'Invalid checks') {
				fb.ShowPopupMessage('Value is not valid:\n' + input + '\n\nValue must pass these checks:\n' + checks.map(f => this.cleanCheck(f)).join('\n') + '\n\nExample:\n' + example, title);
			} else if (e.message !== 'InputBox failed:\nDialog window was closed') {
				fb.ShowPopupMessage(e.name + '\n\n' + e.message, title);
			}
			return null;
		}
		this.data.lastInput = newVal;
		if (oldVal === newVal) { return null; }
		return newVal;
	},
	/**
	 * Handles input validation for string values.
	 *
	 * @property
	 * @name string
	 * @kind method
	 * @memberof Input
	 * @param {'string'|'trimmed string'|'unicode'|'path'|'file'|'url'|'file|url'} type
	 * @param {String} oldVal
	 * @param {String} message
	 * @param {String} title
	 * @param {String} example
	 * @param {Function[]} checks?
	 * @param {boolean} bFilterEmpty?
	 * @returns {null|String}
	 */
	string: function (type, oldVal, message, title, example, checks = [], bFilterEmpty = false) {
		const types = new Set(['string', 'trimmed string', 'unicode', 'path', 'file', 'url', 'file|url']);
		this.data.last = oldVal; this.data.lastInput = null;
		if (!types.has(type)) { throw new Error('Invalid type: ' + type); }
		let input, newVal;
		let uOldVal = null;
		if (type === 'unicode') { uOldVal = oldVal.split(' ').map((s) => s !== '' ? s.codePointAt(0).toString(16) : '').join(' '); }
		try {
			input = utils.InputBox(window.ID, message, title, oldVal !== null && typeof oldVal !== 'undefined' ? uOldVal || oldVal : '', true);
			if (input === null || typeof input === 'undefined') { throw new Error('Invalid type'); }
			else { newVal = String(input); }
			switch (type) {
				case 'string': {
					if (bFilterEmpty && !newVal.length) { throw new Error('Empty'); }
					break;
				}
				case 'trimmed string': {
					newVal = newVal.trim();
					if (bFilterEmpty && !newVal.length) { throw new Error('Empty'); }
					break;
				}
				case 'unicode': { // https://www.rapidtables.com/code/text/unicode-characters.html
					if (bFilterEmpty && !newVal.length) { throw new Error('Empty'); }
					newVal = newVal.split(' ').map((s) => s !== '' ? String.fromCharCode(parseInt(s, 16)) : '').join(' ');
					break;
				}
				case 'file|url':
				case 'url': {
					if (!newVal.length) {
						if (bFilterEmpty) { throw new Error('Empty'); }
					}
					if (type === 'file|url' && !/https?:\/\/|www./.test(newVal)) {
						newVal = this.sanitizePath(newVal);
					}
					break;
				}
				case 'file':
				case 'path': {
					if (!newVal.length) {
						if (bFilterEmpty) { throw new Error('Empty'); }
					} else if (type === 'path' && !newVal.endsWith('\\')) { newVal += '\\'; }
					newVal = this.sanitizePath(newVal);
					break;
				}
			}
			if (checks) {
				if (!Array.isArray(checks)) {
					throw new Error('Invalid checks argument');
				} else if (checks.length && !checks.some((check) => check.call(this, newVal))) {
					throw new Error('Invalid checks');
				}
			}
		}
		catch (e) {
			if (e.message === 'Invalid type' || e.name === 'SyntaxError') {
				fb.ShowPopupMessage('Value is not valid:\n' + input + '\n\nValue must be an ' + type.toUpperCase() + '\n\nExample:\n' + example, title);
			} else if (e.message === 'Empty') {
				fb.ShowPopupMessage('Value is not valid:\n' + input + '\n\nValue must be a non zero length string.\n\nExample:\n' + example, title);
			} else if (e.message === 'Invalid checks argument') {
				fb.ShowPopupMessage('Checks is not an array:\n' + checks, title);
			} else if (e.message === 'Invalid checks') {
				fb.ShowPopupMessage('Value is not valid:\n' + input + '\n\nValue must pass these checks:\n' + checks.map(f => this.cleanCheck(f)).join('\n') + '\n\nExample:\n' + example, title);
			} else if (e.message !== 'InputBox failed:\nDialog window was closed') {
				fb.ShowPopupMessage(e.name + '\n\n' + e.message, title);
			}
			return null;
		}
		this.data.lastInput = newVal;
		if (oldVal === newVal) { return null; }
		return newVal;
	},
	query: function (oldVal, message, title, example, checks = [], bFilterEmpty = false) {
		let newVal;
		this.data.last = oldVal; this.data.lastInput = null;
		try {
			newVal = this.string('string', oldVal, message, title, example);
			if (newVal === null) { throw new Error('Invalid string'); }
			if (!newVal.length && bFilterEmpty) { newVal = 'ALL'; }
			try { // Sanity check
				fb.GetQueryItems(new FbMetadbHandleList(), newVal);
				fb.GetQueryItems(new FbMetadbHandleList(), '* HAS \'\' AND (' + newVal + ')');
			} catch (e) { throw new Error('Invalid query'); } // eslint-disable-line no-unused-vars
			if (bFilterEmpty && fb.GetQueryItems(fb.GetLibraryItems(), newVal).Count === 0) { throw new Error('Zero items query'); }
			if (checks && checks.length && !checks.some((check) => check.call(this, newVal))) {
				throw new Error('Invalid checks');
			}
		}
		catch (e) {
			if (e.message === 'Invalid query') {
				fb.ShowPopupMessage('Query not valid:\n' + newVal + '\n\nValue must follow query syntax:\nhttps://wiki.hydrogenaud.io/index.php?title=Foobar2000:Query_syntax', title);
			} else if (e.message === 'Zero items query') {
				fb.ShowPopupMessage('Query returns no items (on current library):\n' + newVal, title);
			} else if (e.message === 'Invalid checks') {
				fb.ShowPopupMessage('Query is not valid:\n' + newVal + '\n\nQuery must pass these checks:\n' + checks.map(f => this.cleanCheck(f)).join('\n') + '\n\nExample:\n' + example, title);
			} else if (e.message !== 'InputBox failed:\nDialog window was closed') {
				fb.ShowPopupMessage(e.name + '\n\n' + e.message, title);
			}
			return null;
		}
		this.data.lastInput = newVal;
		if (oldVal === newVal) { return null; }
		return newVal;
	},
	// Internal helpers
	cleanCheck: function (func) {
		return func.toString().replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '').replace(/^.*=> /, '');
	},
	sanitizePath: function (value) { // Sanitize illegal chars but skip drive
		if (!value || !value.length) { return ''; }
		const disk = (value.match(/^\w:\\/g) || [''])[0];
		return disk + (disk && disk.length ? value.replace(disk, '') : value).replace(/\//g, '\\').replace(/[|–‐—-]/g, '-').replace(/\*/g, 'x').replace(/"/g, '\'\'').replace(/[<>]/g, '_').replace(/[?:]/g, '').replace(/(?! )\s/g, '');
	}
}));

// Augment FbProfiler() constructor
{
	const old = FbProfiler;
	FbProfiler = function FbProfiler() { // NOSONAR
		const that = old(...arguments);
		Object.defineProperty(that, 'CheckPoints', {
			enumerable: true,
			configurable: false,
			writable: false,
			value: []
		});
		that.CheckPoint = (function CheckPoint(name) {
			let point = this.CheckPoints.find((check) => check.name.toLowerCase() === name.toLowerCase());
			if (point) {
				point.time = this.Time;
			} else {
				point = { name, time: this.Time, acc: 0 };
				this.CheckPoints.push(point);
			}
			return point;
		}).bind(that);
		that.CheckPointStep = (function CheckPointStep(name) {
			const point = this.CheckPoints.find((check) => check.name.toLowerCase() === name.toLowerCase());
			if (point) {
				const now = this.Time;
				point.acc += now - point.time;
				point.time = now;
			}
			return point ? point.acc : null;
		}).bind(that);
		that.ElapsedTimeSince = (function ElapsedTimeSince(name) {
			const point = this.CheckPoints.find((check) => check.name.toLowerCase() === name.toLowerCase());
			return (point ? this.Time - point.time : null);
		}).bind(that);
		that.CheckPointPrint = (function CheckPointStep(name, message) {
			const point = this.CheckPoints.find((check) => check.name.toLowerCase() === name.toLowerCase());
			if (point) { console.log('profiler (' + this.Name + '): ' + name + ' ' + point.acc + ' ms' + (message || '')); return true; }
			return null;
		}).bind(that);
		return that;
	};
}