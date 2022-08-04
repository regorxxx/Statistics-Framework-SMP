'use strict';
//21/06/22

include('..\\helpers\\statistics_xxx.js');
include('..\\helpers\\statistics_xxx_menu.js');

window.DefinePanel('Statistics example 1', {author:'XXX', version: '1.0.0', features: {drag_n_drop: false}});

/* 
	Data to feed the charts:
	This may be arbitrary data in multiple series, with each point having x,y properties.
	Each serie will use a different color.
	[
		[{x, y}, ...], // Serie 1
		[{x, y}, ...], // Serie 2
		...
	]
	
	Colors are not being set. One should be required per serie.
	color: [rgbSerie1, ...]
	Any color not set is set randomly at startup.
	
	In this example only two series are drawn and one chart.
*/
const chart = new _chart({
	data: [[{x:'A', y: 10},{x:'B', y: 4},{x:'C', y: 6},{x:'D', y: 7},{x:'E', y: 3}], [{x:'A', y: 3},{x:'B', y: 7},{x:'C', y: 4},{x:'D', y: 2},{x:'E', y: 5}]],
	dataManipulation: {sort: null, filter: null, slice: null, distribution: null},
	background: {color: RGB(200,200,200)},
	margin: {left: _scale(20), right: _scale(10), top: _scale(10), bottom: _scale(15)},
	axis: {
		x: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 'auto', labels: true, key: 'Cities'}, 
		y: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 5, labels: true, key: 'Population'}
	},
	x: 0,
	w: window.Width,
	y: 0,
	h: window.Height,
	title: window.Name + ' - ' + 'Graph 1 {cities - population}',
	tooltipText: '\n\n(This is additional info)'
});

/* 
	Callbacks
*/
function on_paint(gr) {
	if (!window.Width || !window.Height) {return;}
	chart.paint(gr);
}

function on_size() {
	const w = window.Width;
	const h = window.Height;
	const x = 0;
	const y = 0;
	if (!w || !h) {return;}
	chart.changeConfig({x, y, w, h});
}

function on_mouse_move(x, y, mask) {
	chart.move(x,y);
}

function on_mouse_leave(x, y, mask) {
	chart.leave();
};

/* 
	Bind menu
*/

bindMenu(chart);
function on_mouse_rbtn_up(x, y) {
	chart.rbtn_up(x,y);
	return true; // left shift + left windows key will bypass this callback and will open default context menu.
};