'use strict';
//19/06/22

/* 
	helpers_xxx_UI.js 
*/
include(fb.ComponentPath + 'docs\\Flags.js');

const WshShellUI = new ActiveXObject('WScript.Shell');

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
	// helpers_xxx_prototypes.js
*/
const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));

function _b(value) {
	return '[' + value + ']';
}

function _t(tag) {
	return '%' + tag + '%';
}

function _bt(tag) {
	return _b(_t(tag));
}
