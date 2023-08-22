'use strict';
//22/08/23

/* 
	helpers_xxx_UI.js 
*/
include(fb.ComponentPath + 'docs\\Flags.js');

const WshShellUI = new ActiveXObject('WScript.Shell');

// colorbrewer presets
const colorbrewer = {
	diverging: ['Spectral','RdYlGn','RdBu','PiYG','PRGn','RdYlBu','BrBG','RdGy','PuOr'],
	qualitative: ['Set2','Accent','Set1','Set3','Dark2','Paired','Pastel2','Pastel1'],
	sequential: ['OrRd','PuBu','BuPu','Oranges','BuGn','YlOrBr','YlGn','Reds','RdPu','Greens','YlGnBu','Purples','GnBu','Greys','YlOrRd','PuRd','Blues','PuBuGn'],
	colorBlind: [
		diverging: ['RdBu','PiYG','PRGn','RdYlBu','BrBG','PuOr'],
		qualitative: ['Set2','Dark2','Paired'],
		sequential: ['OrRd','PuBu','BuPu','Oranges','BuGn','YlOrBr','YlGn','Reds','RdPu','Greens','YlGnBu','Purples','GnBu','Greys','YlOrRd','PuRd','Blues','PuBuGn']
	}]
}

// Cache
const scaleDPI = {}; // Caches _scale() values;
const fonts = {notFound: []}; // Caches _gdifont() values;

function _scale(size, bRound = true) {
	if (!scaleDPI[size]) {
		let DPI;
		try {DPI = WshShellUI.RegRead('HKCU\\Control Panel\\Desktop\\WindowMetrics\\AppliedDPI');}
		catch (e) {DPI = 96;} // Fix for linux
		scaleDPI[size] = size * DPI / 72;
	}
	return (bRound ? Math.round(scaleDPI[size]) : scaleDPI[size]);
}

function _gdiFont(name, size, style) {
	let id = name.toLowerCase() + '_' + size + '_' + (style || 0);
	if (!fonts[id]) {
		fonts[id] = gdi.Font(name, size, style || 0);
	}
	if (fonts[id].Name !== name && fonts.notFound.indexOf(name) === -1) { // Display once per session, otherwise it floods the console with the same message...
		fonts.notFound.push(name);
		fb.ShowPopupMessage('Missing font: ' + name + '\n\nPlease install dependency found at:\n' + folders.xxx + '_resources', window.Name);
		console.log('Missing font: ' + name);
	}
	return fonts[id];
}

function _tt(value, font = 'Segoe UI', fontSize = _scale(10), width = 600) {
	this.tooltip = window.Tooltip;
	this.font = {name: font, size: fontSize};
	this.tooltip.SetFont(font, fontSize);
	this.width = width;
	this.tooltip.SetMaxWidth(width);
	this.text = this.tooltip.Text = value;
	this.oldDelay = this.tooltip.GetDelayTime(3); //TTDT_INITIAL
	this.bActive = false;
	
	this.SetValue = function (value,  bForceActivate = false) {
		if (value === null) {
			this.Deactivate();
			return;
		} else {
			if (this.tooltip.Text !== value) {
				this.tooltip.Text = value;
				this.Activate();
			}
			if (bForceActivate) {this.Activate();} // Only on force to avoid flicker
		}
	};
	
	this.SetFont = function (font_name, font_size_pxopt, font_styleopt) {
		this.tooltip.SetFont(font_name, font_size_pxopt, font_styleopt);
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
		this.tooltip.SetDelayTime(type, time) ;
    };
	
	this.GetDelayTime = function (type) {
		this.tooltip.GetDelayTime(type) ;
	};

}

function RGB(r, g, b) {
	return (0xff000000 | (r << 16) | (g << 8) | (b));
}

function RGBA(r, g, b, a) {
	let res = 0xff000000 | (r << 16) | (g << 8) | (b);
	if (typeof a !== 'undefined') {res = (res & 0x00ffffff) | (a << 24);}
	return res;
}

function toRGB(color) { // returns an array like [192, 0, 0]
	const a = color - 0xFF000000;
	return [a >> 16, a >> 8 & 0xFF, a & 0xFF];
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
	return (getBrightness(r,g,b) < 186);
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
	helpers_xxx_UI_flip.js
*/

String.prototype.flip = function() {
	const last = this.length - 1;
	let result = new Array(this.length)
	for (let i = last; i >= 0; --i) {
		let c = this.charAt(i);
		let r = flipTable[c.toLowerCase()];
		result[last - i] = r !== void(0) ? r : c;
	}
	return result.join('');
}

const flipTable = {
	a : '\u0250',
	b : 'q',
	c : '\u0254', 
	d : 'p',
	e : '\u01DD',
	f : '\u025F', 
	g : '\u0183',
	h : '\u0265',
	i : '\u0131', 
	j : '\u027E',
	k : '\u029E',
	//l : '\u0283',
	m : '\u026F',
	n : 'u',
	p : 'q',
	r : '\u0279',
	t : '\u0287',
	v : '\u028C',
	w : '\u028D',
	y : '\u028E',
	'.' : '\u02D9',
	'[' : ']',
	'(' : ')',
	'{' : '}',
	'?' : '\u00BF',
	'!' : '\u00A1',
	"\'" : ',',
	'<' : '>',
	'_' : '\u203E',
	';' : '\u061B',
	'\u203F' : '\u2040',
	'\u2045' : '\u2046',
	'\u2234' : '\u2235',
	'\r' : '\n' 
}
for (let i in flipTable) {flipTable[flipTable[i]] = i}

/* 
	helpers_xxx_prototypes.js
*/
const range = (start, stop, step) => new Array((stop - start) / step + 1).fill(void(0)).map((_, i) => start + (i * step));

function _p(value) {
	return '(' + value + ')';
}

function _b(value) {
	return '[' + value + ']';
}

function _t(tag) {
	return '%' + tag + '%';
}

function _bt(tag) {
	return _b(_t(tag));
}

function round(floatnum, decimals, eps = 10**-14){
	let result;
	if (decimals > 0) {
		if (decimals === 15) {result = floatnum;}
		else {result = Math.round(floatnum * Math.pow(10, decimals) + eps) / Math.pow(10, decimals);}
	} else {result =  Math.round(floatnum);}
	return result;
}

/* 
	helpers_xxx_basic_js.js
*/
let module = {}, exports = {};
module.exports = null;

function require(script) {
	include(newScript + '.js') ;
	return module.exports;
}

/* 
	helpers_xxx_prototypes_smp.js
*/
FbTitleFormat.prototype.EvalWithMetadbsAsync = function EvalWithMetadbsAsync(handleList, slice = 1000) {
	const size = handleList.Count;
	return new Promise(async (resolve) => {
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
					if (progress % 25 === 0 && progress > prevProgress) {prevProgress = progress; console.log('EvalWithMetadbsAsync ' + _p(this.Expression) + ' ' + progress + '%.');}
					resolve('done');
				}, 25);
			});
		}
		resolve(tags);
	});
}

{	// Augment fb.TitleFormat
	const old = fb.TitleFormat;
	fb.TitleFormat = function TitleFormat() {
		const that = old.apply(fb, [...arguments]);
		that.Expression = arguments[0];
		return that;
	}
}

{	// Augment FbTitleFormat
	const old = FbTitleFormat;
	FbTitleFormat = function FbTitleFormat() {
		const that = old(...arguments);
		that.Expression = arguments[0];
		return that;
	}
}