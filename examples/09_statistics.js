'use strict';
//21/10/23

include('..\\main\\statistics\\statistics_xxx.js');
include('..\\main\\statistics\\statistics_xxx_menu.js');

window.DefinePanel('Statistics example 9', {author:'XXX', version: '1.0.0', features: {drag_n_drop: false}});

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
	
	In this example a timeline is shown..
*/
function getData(option = 'tf', tf = 'genre', query = 'ALL', arg) {
	let data;
	switch (option) {
		case 'tf': {
			const handleList = query.length && query !== 'ALL' ? fb.GetQueryItems(fb.GetLibraryItems(), query) : fb.GetLibraryItems();
			const libraryTags = fb.TitleFormat(_bt(tf)).EvalWithMetadbs(handleList).map((val) => {return val.split(',')}).flat(Infinity);
			const tagCount = new Map();
			libraryTags.forEach((tag) => {
				if (!tagCount.has(tag)) {tagCount.set(tag, 1);}
				else {tagCount.set(tag, tagCount.get(tag) + 1);}
			});
			data = [[...tagCount].map((point) => {return {x: point[0], y: point[1]};})];
			break;
		}
		case 'timeline': { // 3D {x, y, z}, x and z can be exchanged
			const handleList = query.length && query !== 'ALL' ? fb.GetQueryItems(fb.GetLibraryItems(), query) : fb.GetLibraryItems();
			const xTags = fb.TitleFormat(_bt(tf)).EvalWithMetadbs(handleList).map((val) => {return val.split(',')});
			const serieTags = fb.TitleFormat(_bt(arg)).EvalWithMetadbs(handleList).map((val) => {return val.split(',')});
			const dic = new Map();
			xTags.forEach((arr, i) => {
				arr.forEach((x) => {
					if (!dic.has(x)) {dic.set(x, {});}
					const val = dic.get(x);
					serieTags[i].forEach((serie, j) => {
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
				map.set(key, Object.entries(value).map((pair) => {return {key: pair[0], count: pair[1]};}).sort((a, b) => {return b.count - a.count;}));
			})
			data = [[...dic].map((points) => points[1].map((point) => {return {x: points[0], y: point.count, z: point.key};}))];
			break;
		}
		case 'most played': {
			const handleList = fb.GetLibraryItems();
			const libraryTags = fb.TitleFormat(_bt(tf)).EvalWithMetadbs(handleList);
			const playCount = fb.TitleFormat('%play_count%').EvalWithMetadbs(handleList);
			const tagCount = new Map();
			libraryTags.forEach((tag, i) => {
				if (!tagCount.has(tag)) {tagCount.set(tag, Number(playCount[i]));}
				else {tagCount.set(tag, tagCount.get(tag) + Number(playCount[i]));}
			});
			data = [[...tagCount].map((point) => {return {x: point[0], y: point[1]};})];
			break;
		}
		case 'most played proportional': {
			const handleList = fb.GetLibraryItems();
			const libraryTags = fb.TitleFormat(_bt(tf)).EvalWithMetadbs(handleList);
			const playCount = fb.TitleFormat('%play_count%').EvalWithMetadbs(handleList);
			const tagCount = new Map();
			const keyCount = new Map();
			libraryTags.forEach((tag, i) => {
				if (!tagCount.has(tag)) {tagCount.set(tag, Number(playCount[i]));}
				else {tagCount.set(tag, tagCount.get(tag) + Number(playCount[i]));}
				if (!keyCount.has(tag)) {keyCount.set(tag, 1);}
				else {keyCount.set(tag, keyCount.get(tag) + 1);}
			});
			keyCount.forEach((value, key) => {
				if (tagCount.has(key)) {tagCount.set(key, Math.round(tagCount.get(key) / keyCount.get(key)));}
			});
			data = [[...tagCount].map((point) => {return {x: point[0], y: point[1]};})];
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
		x: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 'auto', labels: true}, 
		y: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 5, labels: true}
	},
	x: 0,
	w: 0,
	y: 0,
	h: 0,
	tooltipText: '\n\n(Right click to configure chart)',
	configuration: {bSlicePerKey: true}
};

const newConfig = [
	[ // Row
		{
			data: getData('timeline', '$year(%date%)', 'DATE GREATER 1970 AND DATE LESS 1980', 'ALBUM ARTIST'),
			dataManipulation: {sort: (a, b) => {return a.x - b.x;}},
			graph: {type: 'bars', multi: true, borderWidth: _scale(1)},
			axis:{
				x: {key: 'date'}, 
				y: {key: 'tracks'}
			}
		},
	]
];

/* 
	Automatically draw new graphs using table above
*/
const rows = newConfig.length;
const columns = newConfig[0].length;
const nCharts = new Array(rows).fill(1).map((row) => {return new Array(columns).fill(1);}).map((row, i) => {
	return row.map((cell, j) => {
		const w = window.Width / columns;
		const h = window.Height / rows * (i + 1);
		const x = w * j;
		const y = window.Height / rows * i;
		const title = window.Name + ' - ' + 'Graph ' + (1 + rows * i + j) + ' {' + newConfig[i][j].axis.x.key + ' - ' + newConfig[i][j].axis.y.key + '}';
		return new _chart({...defaultConfig, x, y, w, h}).changeConfig({...newConfig[i][j], bPaint: false, title});
	});
});
const charts = nCharts.flat(Infinity);
charts.forEach((chart) => {bindMenu(chart);}); // Binds the generic right click menu to every chart

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
	const bFound = charts.some((chart) => {return chart.move(x,y);});
}

function on_mouse_leave(x, y, mask) {
	charts.forEach((chart) => {chart.leave();});
}

function on_mouse_rbtn_up(x, y) {
	charts.some((chart) => {return chart.rbtn_up(x,y);});
	return true; // left shift + left windows key will bypass this callback and will open default context menu.
}