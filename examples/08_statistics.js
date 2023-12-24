'use strict';
//24/08/23

include('..\\main\\statistics\\statistics_xxx.js');
include('..\\main\\statistics\\statistics_xxx_menu.js');

window.DefinePanel('Statistics example 3', {author:'XXX', version: '1.0.0', features: {drag_n_drop: false}});

/*
	Data to feed the charts:
	This may be arbitrary data in multiple series, with each point having x,y properties.
	Each serie will use a different color.
	[
		[{x, y}, ...], // Serie 1
		[{x, y}, ...], // Serie 2
		...
	]

	In this example doughnut and pie charts are used on a grid.
*/
function getData(option = 'tf', tf = 'genre') {
	let data;
	switch (option) {
		case 'tf': {
			const handleList = fb.GetLibraryItems();
			const libraryTags = fb.TitleFormat(_bt(tf)).EvalWithMetadbs(handleList).map((val) => {return val.split(',')}).flat(Infinity);
			const tagCount = new Map();
			libraryTags.forEach((tag) => {
				if (!tagCount.has(tag)) {tagCount.set(tag, 1);}
				else {tagCount.set(tag, tagCount.get(tag) + 1);}
			});
			data = [[...tagCount].map((point) => {return {x: point[0], y: point[1]};})];
			break;
		}
		case 'most played': {
			const handleList = fb.GetLibraryItems();
			const libraryTags = fb.TitleFormat(_bt(tf)).EvalWithMetadbs(handleList);
			const playCount = fb.TitleFormat('$max(%PLAY_COUNT%,%LASTFM_PLAY_COUNT%)').EvalWithMetadbs(handleList);
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
			const playCount = fb.TitleFormat('$max(%PLAY_COUNT%,%LASTFM_PLAY_COUNT%)').EvalWithMetadbs(handleList);
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
	dataManipulation: {sort: null, filter: null, slice: [0, 4], distribution: 'normal'},
	background: {color: RGB(200,200,200)},
	margin: {left: _scale(20), right: _scale(10), top: _scale(10), bottom: _scale(15)},
	axis: {
		x: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 'auto', labels: true, key: 'genre'},
		y: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 5, labels: true, key: 'tracks'}
	},
	x: 0,
	w: 0,
	y: 0,
	h: 0,
	tooltipText: '\n\n(Right click to configure chart)'
};

const newConfig = [
	[ // Row
		{
			data: Array(4).fill(...getData('tf', 'genre')), // 4 series
			graph: {type: 'bars', borderWidth: _scale(1)},
			axis:{
				x: {key: 'genre'},
				y: {key: 'tracks'}
			}
		},
		{
			data: [[{x:'A', y: 20},{x:'B', y: 4},{x:'C', y: 6},{x:'D', y: 7},{x:'E', y: 3}], [{x:'A', y: 3},{x:'B', y: 6},{x:'C', y: 7},{x:'D', y: 8},{x:'E', y: 5}]],
			dataManipulation: {sort: null, filter: null, slice: [0, 10]},
			graph: {type: 'pie', borderWidth: _scale(1)},
			chroma: {scheme: 'BuGn'},
			axis:{
				x: {key: 'Cities'},
				y: {key: 'Population'}
			}
		}
	],
	[ // Row
		{
			data: [[{x:'A', y: 20},{x:'B', y: 4},{x:'C', y: 6},{x:'D', y: 7},{x:'E', y: 3}], [{x:'A', y: 3},{x:'B', y: 6},{x:'C', y: 7},{x:'D', y: 8},{x:'E', y: 5}]],
			dataManipulation: {sort: null, filter: null, slice: [0, 10], distribution: null},
			graph: {type: 'doughnut', borderWidth: _scale(1)},
			chroma: {scheme: 'BuGn'},
			axis:{
				x: {key: 'Cities'},
				y: {key: 'Population'}
			}
		},
		{
			data: getData('tf', 'mood'),
			axis:{
				x: {key: 'mood'},
				y: {key: 'tracks'}
			}
		}
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