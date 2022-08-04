'use strict';
//21/06/22

include('..\\helpers\\statistics_xxx.js');
include('..\\helpers\\statistics_xxx_menu.js')

window.DefinePanel('Statistics example 2', {author:'XXX', version: '1.0.0', features: {drag_n_drop: false}});

/* 
	Data to feed the charts:
	This may be arbitrary data in multiple series, with each point having x,y properties.
	Each serie will use a different color.
	[
		[{x, y}, ...], // Serie 1
		[{x, y}, ...], // Serie 2
		...
	]
	
	In this example only one serie is drawn at the same time for all charts, except the first one.
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
	Set the configuration for all charts using a default template
	Colors are not being set. One should be required per serie.
	color: [rgbSerie1, ...]
	
	In this example only one serie is drawn at the same time, except the first one. 
	Any color not set is set randomly at startup.
*/

const defaultConfig = {
	data: getData('tf', 'genre'),
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

const chartA = new _chart({
	...defaultConfig,
	data: [...getData('tf', 'genre'), ...getData('tf', 'genre')], // 2 series
	x: 0,
	w: window.Width / 2,
	y: 0,
	h: window.Height / 2,
	title: window.Name + ' - ' + 'Graph 1 {genre - tracks}'
});

const chartB = new _chart({
	...defaultConfig,
	data: getData('tf', 'style'),
	graph: {type: 'scatter', borderWidth: _scale(3), point: 'crux'},
	axis: {
		x: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 'auto', labels: true, key: 'style'}, 
		y: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 5, labels: true, key: 'tracks'}
	},
	x: window.Width / 2,
	w: window.Width / 2,
	y: 0,
	h: window.Height / 2,
	title: window.Name + ' - ' + 'Graph 2 {style - tracks}'
});

const chartC = new _chart({
	...defaultConfig,
	data: getData('most played proportional', 'artist'),
	graph: {type: 'lines', borderWidth: _scale(3)},
	dataManipulation: {sort: null, filter: (a) => {return a.y;}, slice: [0, 2], distribution: 'normal'},
	axis: {
		x: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 'auto', labels: true, key: 'artist'}, 
		y: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 5, labels: true, key: 'plays per track'}
	},
	x: 0,
	w: window.Width / 2,
	y: window.Height / 2,
	h: window.Height,
	title: window.Name + ' - ' + 'Graph 2 {artist - plays per track}'
});

const chartD = new _chart({
	...defaultConfig,
	data: getData('tf', 'mood'),
	dataManipulation: {sort: null, filter: null, slice: [0, 4], distribution: 'normal'},
	axis: {
		x: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 'auto', labels: true, key: 'mood'}, 
		y: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 5, labels: true, key: 'tracks'}
	},
	x: window.Width / 2,
	w: window.Width / 2,
	y: window.Height / 2,
	h: window.Height,
	title: window.Name + ' - ' + 'Graph 2 {mood - tracks}'
});

/* 
	Put together for easy iteration later...
*/
const rows = 2, columns = 2;
const charts = [chartA, chartB, chartC, chartD];
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
	[[0, 0],[0, 1],[1, 0],[1, 1]].forEach((pair, k) => {
		const [i, j] = pair;
		const w = window.Width / rows;
		const h = window.Height / columns * (i + 1);
		const x = w * j;
		const y = window.Height / columns * i;
		charts[k].changeConfig({x, y, w, h, bPaint: false});
	});
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