'use strict';
//18/11/25

include('..\\main\\statistics\\statistics_xxx.js');
/* global _chart:readable */
/* global RGB:readable, _scale:readable, _bt:readable, _gdiFont:readable */
include('..\\main\\statistics\\statistics_xxx_menu.js');
/* global createStatisticsMenu:readable, _menu:readable */

window.DefinePanel('Statistics example 9', {author:'XXX', version: '1.1.0', features: {drag_n_drop: false}});

/*
	Data to feed the charts:
	This may be arbitrary data in a single series, with each point having x,y,z properties.
	[
		[
			[{x1, y11, z11}, ...],
			[{x2, y21, z21}, ...],
			...
		]
	]
	Data is then automatically manipulated into different series:
	[
		[
			{x1, y11, z11}, {x2, y21, z21}, ...
		],
		[
			{x1, y12, z12}, {x2, y22, z22}, ...
		],
		[
			...
		]
	]

	In this example a timeline is shown.
*/
function getData(option = 'tf', tf = 'genre', query = 'ALL', arg) {
	let data;
	switch (option) {
		case 'timeline': { // 3D {x, y, z}, x and z can be exchanged
			const handleList = query.length && query !== 'ALL' ? fb.GetQueryItems(fb.GetLibraryItems(), query) : fb.GetLibraryItems();
			const xTags = fb.TitleFormat(_bt(tf)).EvalWithMetadbs(handleList).map((val) => val.split(','));
			const serieTags = fb.TitleFormat(_bt(arg)).EvalWithMetadbs(handleList).map((val) => val.split(','));
			const dic = new Map();
			xTags.forEach((arr, i) => {
				arr.forEach((x) => {
					if (!dic.has(x)) {dic.set(x, {});}
					const val = dic.get(x);
					serieTags[i].forEach((serie) => {
						if (val.hasOwnProperty(serie)) {
							val[serie]++;
						} else {
							val[serie] = 1;
						}
					});
					dic.set(x, val);
				});
			});
			dic.forEach((value, key, map) => {
				map.set(key, Object.entries(value).map((pair) => {return {key: pair[0], count: pair[1]};}).sort((a, b) => b.count - a.count));
			});
			data = [Array.from(dic, (points) => points[1].map((point) => {return {x: points[0], y: point.count, z: point.key};}))];
			break;
		}
	}
	return data;
}


/*
	Set the configuration for all charts using a default template and a table
	Colors are not being set. One should be required per serie.
	color: [rgbSerie1, ...]

	In this example only one serie is drawn at the same time, except the first one.
	Any color not set is set randomly at startup.
*/
const defaultConfig = {
	data: [], // No data is added by default to set no colors on first init
	dataManipulation: {sort: null, filter: null, slice: [0, 10], distribution: null},
	background: {color: RGB(200,200,200)},
	margin: {left: _scale(20), right: _scale(10), top: _scale(10), bottom: _scale(15)},
	axis: {
		x: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 'auto', labels: true, bAltLabels: true},
		y: {show: false, color: RGB(0,0,0), width: _scale(2), ticks: 5, labels: true}
	},
	x: 0,
	w: 0,
	y: 0,
	h: 0,
	tooltipText: '\n\n(Right click to configure chart)',
	configuration: {bSlicePerKey: true},
	gFont: _gdiFont('Segoe UI', _scale(12))
};

const newConfig = [
	[ // Row
		{
			data: getData('timeline', '$year(%DATE%)', 'ALL', 'ALBUM ARTIST'),
			dataManipulation: {sort: (a, b) => {return a.x - b.x;}, group: 2},
			graph: {type: 'timeline', multi: true, borderWidth: _scale(1)},
			axis:{
				x: {key: 'Date'},
				y: {key: 'Tracks'}
			}
		},
	]
];

/*
	Automatically draw new graphs using table above
*/
const rows = newConfig.length;
const columns = newConfig[0].length;
const nCharts = Array.from({length: rows}, (row, i) => {
	return Array.from({length: columns}, (cell, j) => {
		const w = window.Width / columns;
		const h = window.Height / rows * (i + 1);
		const x = w * j;
		const y = window.Height / rows * i;
		const title = window.Name + ' - ' + 'Graph ' + (1 + rows * i + j) + ' {' + newConfig[i][j].axis.x.key + ' - ' + newConfig[i][j].axis.y.key + '}';
		return new _chart({...defaultConfig, x, y, w, h}).changeConfig({...newConfig[i][j], bPaint: false, title});
	});
});
const charts = nCharts.flat(Infinity);
charts.forEach((chart) => _menu.bindInstance(chart, createStatisticsMenu)); // Binds the generic right click menu to every chart

/*
	Callbacks
*/
function on_paint(gr) {
	if (!window.ID) {return;}
	if (!window.Width || !window.Height) {return;}
	charts.forEach((chart) => {chart.paint(gr);});
}

function on_size() {
	if (!window.ID) {return;}
	if (!window.Width || !window.Height) {return;}
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < columns; j++) {
			const w = window.Width / columns;
			const h = window.Height / rows * (i + 1);
			const x = w * j;
			const y = window.Height / rows * i;
			nCharts[i][j].changeConfig({x, y, w, h, bPaint: false});
		}
	}
	window.Repaint();
}


function on_mouse_move(x, y, mask) {
	if (!window.ID) {return;}
	charts.some((chart) => chart.move(x,y));
}

function on_mouse_leave(x, y, mask) {
	charts.forEach((chart) => chart.leave());
}

function on_mouse_rbtn_up(x, y) {
	charts.some((chart) => chart.rbtn_up(x,y));
	return true; // left shift + left windows key will bypass this callback and will open default context menu.
}