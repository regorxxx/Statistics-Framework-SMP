# Statistics-Framework-SMP
[![version][version_badge]][changelog]
[![CodeFactor][codefactor_badge]](https://www.codefactor.io/repository/github/regorxxx/Statistics-Framework-SMP/overview/main)
[![CodacyBadge][codacy_badge]](https://www.codacy.com/gh/regorxxx/Statistics-Framework-SMP/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=regorxxx/Statistics-Framework-SMP&amp;utm_campaign=Badge_Grade)
![GitHub](https://img.shields.io/github/license/regorxxx/Statistics-Framework-SMP)  
A helper script for [Spider Monkey Panel](https://theqwertiest.github.io/foo_spider_monkey_panel) and [foobar2000](https://www.foobar2000.org) which allows to easily create customizable charts on demand, applying basic filtering, sorting and distribution settings.

## The problem with current SMP menus
Menus are usually coded at multiple places which must be linked by ID, storing and sharing the different variables for menus and submenus when you have multiple objects using them, etc. It leads to 2 clear problems: non readability and maintenance nightmare.

![carbon(1)](https://user-images.githubusercontent.com/83307074/117212019-49ad2000-ade9-11eb-8bc4-5fad9b359ea8.png)
![carbon(2)](https://user-images.githubusercontent.com/83307074/117212022-4b76e380-ade9-11eb-886f-e379d0d6ac32.png)

Using this framework it would translate into this:

![carbon(3)](https://user-images.githubusercontent.com/83307074/117212042-53368800-ade9-11eb-8d98-a238408b73d4.png)

## Features
- Creates menus on demand on panels without needing to create specific methods for every script, calculate IDs, etc.  
- Menus are pushed to a list and created automatically on demand, linking the entries to their idx without needing a 'switch' block or leaving holes to ensure idx get enough numbers to expand the script.  
- The main utility of this helper is greatly reducing coding for simple menus and having both, the menu logic creation and the menus' functions on the same place. Creation order is done following entry/menus addition.
- Can concatenate multiple menus on btn_up().

## Usage
First create the chart object. That's the main one and also includes a 'main menu' to append items to it:
```javascript
include('helpers\\statistics_xxx.js');
const chart = new _chart({
	data: [[{x:'A', y: 10},{x:'B', y: 4},{x:'C', y: 6},{x:'D', y: 7},{x:'E', y: 3}]],
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
	tooltipText: '\n\n(This is additional info)'
});
```

Then, you may want to associate it to the panel callbacks for painting, resizing, mouse...:
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

![menu_framework_01](https://user-images.githubusercontent.com/83307074/117211823-081c7500-ade9-11eb-9178-f063539809a4.gif)

There are more usage examples on the 'examples' folder.

## Other implementations
 1. [Playlist-Tools-SMP](https://github.com/regorxxx/Playlist-Tools-SMP): Different tools for [foobar2000](https://www.foobar2000.org). The dynamic configurable menu is built using this..

![Animation9](https://user-images.githubusercontent.com/83307074/116756215-44239480-a9fb-11eb-8489-b56a178c70f4.gif)

## Installation
Since the framework only requires 1 file, i.e. the main one, you can simply include it along any other script where you will use the charts. The helpers will be loaded automatically.

When using the extra menus, the [menu framework file](https://github.com/regorxxx/Menu-Framework-SMP) must be present too.

![carbon(5)](https://user-images.githubusercontent.com/83307074/118840446-ed510280-b8b6-11eb-894d-e7d834d4b3b9.png)

[changelog]: CHANGELOG.md
[version_badge]: https://img.shields.io/github/release/regorxxx/Statistics-Framework-SMP.svg
[codacy_badge]: https://api.codacy.com/project/badge/Grade/3e59f8dccd204721a7801197d6c336ed
[codefactor_badge]: https://www.codefactor.io/repository/github/regorxxx/Statistics-Framework-SMP/badge/main