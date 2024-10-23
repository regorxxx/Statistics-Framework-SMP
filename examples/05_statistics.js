'use strict';
//21/08/23

include('..\\main\\statistics\\statistics_xxx.js');
include('..\\main\\statistics\\statistics_xxx_menu.js');

window.DefinePanel('Statistics example 5', {author:'XXX', version: '1.0.0', features: {drag_n_drop: false}});

/*
	In this example only one serie and one chart are drawn. 15 Top genres.
	Data is passed async, so the chart is reloaded when all data is calculated.
*/
FbTitleFormat.prototype.EvalWithMetadbsAsync = function EvalWithMetadbsAsync(handleList) {
	const size = handleList.Count;
	const steps = 1000;
	return new Promise(async (resolve) => {
		const items = handleList.Convert();
		const count = items.length;
		const total = Math.ceil(size / steps);
		const tags = [];
		let prevProgress = -1;
		for (let i = 1; i <= total; i++) {
			await new Promise((resolve) => {
				setTimeout(() => {
					const iItems = new FbMetadbHandleList(items.slice((i - 1) * steps, i === total ? count : i * steps));
					tags.push(...this.EvalWithMetadbs(iItems));
					const progress = Math.round(i / total * 100);
					resolve('done');
				}, 25);
			});
		}
		resolve(tags);
	});
}

async function getDataAsync(tf = 'GENRE') {
	let data;
	const handleList = fb.GetLibraryItems();
	const libraryTags = (await fb.TitleFormat(_bt(tf)).EvalWithMetadbsAsync(handleList)).map((val) => {return val.split(',')}).flat(Infinity);
	const tagCount = new Map();
	libraryTags.forEach((tag) => {
		if (!tagCount.has(tag)) {tagCount.set(tag, 1);}
		else {tagCount.set(tag, tagCount.get(tag) + 1);}
	});
	data = [Array.from(tagCount, (point) => {return {x: point[0], y: point[1]};})];
	return data;
}

const chart = new _chart({
	dataAsync: () => getDataAsync('GENRE'),
	dataManipulation: {sort: (a, b) => b.y - a.y, filter: null, slice: [0,15], distribution: null},
	background: {color: RGB(200,200,200)},
	margin: {left: _scale(40), right: _scale(10), top: _scale(10), bottom: _scale(15)},
	axis: {
		x: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 'auto', labels: true, key: 'Genre'},
		y: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 5, labels: true, key: 'Tracks'}
	},
	x: 0,
	w: window.Width,
	y: 0,
	h: window.Height,
	title: window.Name + ' - ' + 'Graph 1 {Genre - tracks}',
	tooltipText: '\n\n(15 top genres)'
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