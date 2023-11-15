# Statistics-Framework-SMP
[![version][version_badge]][changelog]
[![CodeFactor][codefactor_badge]](https://www.codefactor.io/repository/github/regorxxx/Statistics-Framework-SMP/overview/main)
[![CodacyBadge][codacy_badge]](https://www.codacy.com/gh/regorxxx/Statistics-Framework-SMP/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=regorxxx/Statistics-Framework-SMP&amp;utm_campaign=Badge_Grade)
![GitHub](https://img.shields.io/github/license/regorxxx/Statistics-Framework-SMP)  
A helper script for [Spider Monkey Panel](https://theqwertiest.github.io/foo_spider_monkey_panel) and [foobar2000](https://www.foobar2000.org) which allows to easily create customizable charts on demand, applying basic filtering, sorting and distribution settings.

![image](https://user-images.githubusercontent.com/83307074/174877709-ec45cb0c-9114-417b-b308-8f954fe970f6.png)

## Features
- Create charts: bars, scatter, line.  
- Colors, axis, background, margins, labels and points are customizable.
- Built-in color palettes using [Chroma](https://gka.github.io/chroma.js/) and [ColorBrewer](https://colorbrewer2.org), also colorblind friendly presets.
- Data may be filtered, sorted or sliced on the fly.
- Data may be fit to a distribution or shown 'as is' (with selected sorting).
- Multiple series can be drawn on the same chart.
- Built-in menus to customize charts.

![statistics1](https://user-images.githubusercontent.com/83307074/174884116-4dd83189-392b-45c4-be24-c819bbd5a204.gif)

## Usage
First create the chart object. In this case 2 series are added:
```javascript
const chart = new _chart({
	data: [
		[{x:'A', y: 10},{x:'B', y: 4},{x:'C', y: 6},{x:'D', y: 7},{x:'E', y: 3}], 
		[{x:'A', y: 3},{x:'B', y: 7},{x:'C', y: 4},{x:'D', y: 2},{x:'E', y: 5}]
	],
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
```

Then, you may want to associate it to the panel callbacks or [event listeners](https://github.com/regorxxx/Callbacks-Framework-SMP) for painting, resizing, mouse...:
```javascript
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
```

A menu can also be added:
```javascript
include('helpers\\statistics_xxx_menu.js'); // menu_xxx.js must also be present!
bindMenu(chart);
function on_mouse_rbtn_up(x, y) {
	chart.rbtn_up(x,y);
	return true; // left shift + left windows key will bypass this callback and will open default context menu.
}
```
![statistics3](https://user-images.githubusercontent.com/83307074/174886889-e5cb7a2c-6afa-4a2e-bffa-a416b71bf1d2.gif)

There are more usage examples on the 'examples' folder.

## Other implementations
 1. [Timeline-SMP](https://github.com/regorxxx/Timeline-SMP): Interactive Timeline of your library. Configurable by Title Format.
 2. [Playlist-Manager-SMP](https://github.com/regorxxx/Playlist-Manager-SMP): A playlist manager for foobar2000.
 3. [World-Map-SMP](https://github.com/regorxxx/World-Map-SMP): Displays current artist's country on the world map. 

## Installation
Since the framework only requires 1 file, i.e. the main one, you can simply include it along any other script where you will use the charts. The helpers will be loaded automatically.

When using the extra menus, the [menu framework file](https://github.com/regorxxx/Menu-Framework-SMP) must be present too.

![carbon](https://user-images.githubusercontent.com/83307074/174885023-4eb84284-1047-4773-bc01-2b10beea04bd.png)

[changelog]: CHANGELOG.md
[version_badge]: https://img.shields.io/github/release/regorxxx/Statistics-Framework-SMP.svg
[codacy_badge]: https://api.codacy.com/project/badge/Grade/3e59f8dccd204721a7801197d6c336ed
[codefactor_badge]: https://www.codefactor.io/repository/github/regorxxx/Statistics-Framework-SMP/badge/main
