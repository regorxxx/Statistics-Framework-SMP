﻿'use strict';
//19/10/23

// Don't load this helper unless menu framework is also present
// https://github.com/regorxxx/Menu-Framework-SMP
try {include('..\\..\\helpers\\menu_xxx.js');} catch(e) {
	try {include('..\\..\\examples\\_statistics\\menu_xxx.js');} catch(e) {fb.ShowPopupMessage('Missing menu framework file', window.Name);}
}

function bindMenu(parent) {
	return _attachedMenu.call(parent, {rMenu: createStatisticsMenu.bind(parent), popup: parent.pop});
}

// Generic statistics menu which should work on almost any chart...
function createStatisticsMenu(bClear = true) {
	// Constants
	this.tooltip.SetValue(null);
	if (!this.menu) {this.menu = new _menu();}
	const menu = this.menu;
	if (bClear) {menu.clear(true);} // Reset on every call
	// helper
	const createMenuOption = (key, subKey, menuName = menu.getMainMenuName(), bCheck = true, addFunc = null) => {
		return function (option) {
			if (option.entryText === 'sep' && menu.getEntries().pop().entryText !== 'sep') {menu.newEntry({menuName, entryText: 'sep'}); return;} // Add sep only if any entry has been added
			if (option.isEq && option.key === option.value || !option.isEq && option.key !== option.value || option.isEq === null) {
				menu.newEntry({menuName, entryText: option.entryText, func: () => {
					if (addFunc) {addFunc(option);}
					if (subKey) {
						if (Array.isArray(subKey)) {
							const len = subKey.length - 1;
							const obj = {[key]: {}};
							let prev = obj[key];
							subKey.forEach((curr, i) => {
								prev[curr] = i === len ? option.newValue : {};
								prev = prev[curr];
							});
							this.changeConfig(obj);
						} else {
							this.changeConfig({[key]: {[subKey]: option.newValue}});
						}
					}
					else {this.changeConfig({[key]: option.newValue});}
				}});
				if (bCheck) {
					menu.newCheckMenu(menuName, option.entryText, void(0), () => {
						const val = subKey 
							? Array.isArray(subKey)
								? subKey.reduce((acc, curr) => acc[curr], this[key])
								: this[key][subKey] 
							: this[key];
						if (option.newValue && typeof option.newValue === 'function') {return !!(val && val.name === option.newValue.name);}
						if (option.newValue && typeof option.newValue === 'object') {
							if (Array.isArray(val)) {
								return !!(val && val.toString() === option.newValue.toString());
							} else if (val) {
								const keys = Object.keys(option.newValue);
								return keys.every((key) => val[key] === option.newValue[key]);
							}
						} else {
							return option.isEq === null && option.value === null && (option.newValue === true || option.newValue === false)
								? !!val
								: (val === option.newValue);
						}
					});
				}
			}
		}.bind(this);
	}
	const sortInv = (a, b) => {return b.y - a.y;};
	const sortNat = (a, b) => {return a.y - b.y;};
	const filtGreat = (num) => {return (a) => {return a.y > num;}};
	const filtLow = (num) => {return (a) => {return a.y < num;}};
	const fineGraphs = new Set(['bars', 'doughnut', 'pie']);
	const sizeGraphs = new Set(['scatter', 'lines']);
	// Header
	menu.newEntry({entryText: this.title, flags: MF_GRAYED});
	menu.newEntry({entryText: 'sep'});
	// Menus
	{
		const subMenu = menu.newMenu('Chart type...');
		[
			{isEq: null,	key: this.graph.type, value: null,				newValue: 'scatter',		entryText: 'Scatter'},
			{isEq: null,	key: this.graph.type, value: null,				newValue: 'bars',			entryText: 'Bars'},
			{isEq: null,	key: this.graph.type, value: null,				newValue: 'lines',			entryText: 'Lines'},
			{isEq: null,	key: this.graph.type, value: null,				newValue: 'doughnut',		entryText: 'Doughnut'},
			{isEq: null,	key: this.graph.type, value: null,				newValue: 'pie',			entryText: 'Pie'},
		].forEach(createMenuOption('graph', 'type', subMenu, void(0), (option) => {
			this.graph.borderWidth = fineGraphs.has(option.newValue) ? _scale(1) : _scale(4);
		}));
	}
	{
		const subMenu = menu.newMenu('Distribution...');
		[
			{isEq: null,	key: this.dataManipulation.distribution, value: null,				newValue: null,				entryText: 'Standard graph'},
			{isEq: null,	key: this.dataManipulation.distribution, value: null,				newValue: 'normal',			entryText: 'Normal distrib.'},
		].forEach(createMenuOption('dataManipulation', 'distribution', subMenu));
		menu.newEntry({entryText: 'sep'});
	}
	{
		const subMenu = menu.newMenu('Sorting...');
		if (this.dataManipulation.distribution === null) {
			[
				{isEq: null,	key: this.dataManipulation.sort, value: null,						newValue: sortNat,			entryText: 'Natural sorting'},
				{isEq: null,	key: this.dataManipulation.sort, value: null,						newValue: sortInv,			entryText: 'Inverse sorting'},
				{entryText: 'sep'},
				{isEq: null,	key: this.dataManipulation.sort, value: null,						newValue: null,				entryText: 'No sorting'}
			].forEach(createMenuOption('dataManipulation', 'sort', subMenu));
		} else {
			[
				{isEq: null,	key: this.dataManipulation.distribution, value: 'normal',			newValue:'normal inverse',	entryText: 'See tails'},
				{isEq: null,	key: this.dataManipulation.distribution, value: 'normal inverse',	newValue:'normal',			entryText: 'Mean centered'}
			].forEach(createMenuOption('dataManipulation', 'distribution', subMenu));
		}
		menu.newEntry({entryText: 'sep'});
	}
	{
		{
			const subMenu = menu.newMenu('Values shown...');
			[
				{isEq: false,	key: this.dataManipulation.slice, value: [0, 4],					newValue: [0, 4],			entryText: '4 values' + (this.dataManipulation.distribution ? ' per tail' : '')},
				{isEq: false,	key: this.dataManipulation.slice, value: [0, 10],					newValue: [0, 10],			entryText: '10 values' + (this.dataManipulation.distribution ? ' per tail' : '')},
				{isEq: false,	key: this.dataManipulation.slice, value: [0, 20],					newValue: [0, 20],			entryText: '20 values' + (this.dataManipulation.distribution ? ' per tail' : '')},
				{isEq: false,	key: this.dataManipulation.slice, value: [0, 50],					newValue: [0, 50],			entryText: '50 values' + (this.dataManipulation.distribution ? ' per tail' : '')},
				{entryText: 'sep'},
				{isEq: false,	key: this.dataManipulation.slice, value: [0, Infinity],				newValue: [0, Infinity],			entryText: 'Show all values'},
			].forEach(createMenuOption('dataManipulation', 'slice', subMenu));
		}
		{
			const subMenu = menu.newMenu('Filter...');
			const subMenuGreat = menu.newMenu('Greater than...', subMenu);
			const subMenuLow = menu.newMenu('Lower than...', subMenu);
			// Create a filter entry for each fraction of the max value (duplicates filtered)
			const parent = this;
			const options = [...new Set([this.stats.maxY, 1000, 100, 10, 10/2, 10/3, 10/5, 10/7].map((frac) => {
				return Math.round(this.stats.maxY / frac) || 1; // Don't allow zero
			}))];
			options.map((val) => {
				return {isEq: null, key: this.dataManipulation.filter, value: null, newValue: filtGreat(val), entryText: val};
			}).forEach(function (option, i){
				createMenuOption('dataManipulation', 'filter', subMenuGreat, false)(option);
				menu.newCheckMenu(subMenuGreat, option.entryText, void(0), () => {
					const filter = this.dataManipulation.filter;
					return !!(filter && filter({y: options[i] + 1}) && !filter({y: options[i]})); // Just a hack to check the current value is the filter
				});
			}.bind(parent));
			options.map((val) => {
				return {isEq: null, key: this.dataManipulation.filter, value: null, newValue: filtLow(val), entryText: val};
			}).forEach(function (option, i){
				createMenuOption('dataManipulation', 'filter', subMenuLow, false)(option);
				menu.newCheckMenu(subMenuLow, option.entryText, void(0), () => {
					const filter = this.dataManipulation.filter;
					return !!(filter && filter({y: options[i] + 1}) && !filter({y: options[i]})); // Just a hack to check the current value is the filter
				});
			}.bind(parent));
			[
				{entryText: 'sep'},
				{isEq: null,	key: this.dataManipulation.filter, value: null, newValue: null, entryText: 'No filter'},
			].forEach(createMenuOption('dataManipulation', 'filter', subMenu));
		}
		menu.newEntry({entryText: 'sep'});
	}
	{
		const subMenu = menu.newMenu('Axis & labels...');
		{
			const subMenuTwo = menu.newMenu('Axis...', subMenu);
			[
				{isEq: null,	key: this.axis.x.show, value: null,					newValue: {show: !this.axis.x.show},			entryText: (this.axis.x.show ? 'Hide' : 'Show') + ' X axis'}
			].forEach(createMenuOption('axis', 'x', subMenuTwo, false));
			[
				{isEq: null,	key: this.axis.y.show, value: null,					newValue: {show: !this.axis.y.show},			entryText: (this.axis.y.show ? 'Hide' : 'Show') + ' Y axis'}
			].forEach(createMenuOption('axis', 'y', subMenuTwo, false));
		}
		{
			const subMenuTwo = menu.newMenu('Labels...', subMenu);
			[
				{isEq: null,	key: this.axis.x.labels, value: null,					newValue: {labels: !this.axis.x.labels},			entryText: (this.axis.x.labels ? 'Hide' : 'Show') + ' X labels'}
			].forEach(createMenuOption('axis', 'x', subMenuTwo, false));
			[
				{isEq: null,	key: this.axis.y.labels, value: null,					newValue: {labels: !this.axis.y.labels},			entryText: (this.axis.y.labels ? 'Hide' : 'Show') + ' Y labels'}
			].forEach(createMenuOption('axis', 'y', subMenuTwo, false));
			menu.newEntry({menuName: subMenuTwo, entryText: 'sep'});
			[
				{isEq: null,	key: this.axis.x.bAltLabels, value: null,				newValue: !this.axis.x.bAltLabels,		entryText: 'Alt. X labels'},
			].forEach(createMenuOption('axis', ['x', 'bAltLabels'], subMenuTwo, true));
		}
		{
			const subMenuTwo = menu.newMenu('Titles...', subMenu);
			[
				{isEq: null,	key: this.axis.x.showKey, value: null,					newValue: {showKey: !this.axis.x.showKey},			entryText: (this.axis.x.showKey ? 'Hide' : 'Show') + ' X title'}
			].forEach(createMenuOption('axis', 'x', subMenuTwo, false));
			[
				{isEq: null,	key: this.axis.y.showKey, value: null,					newValue: {showKey: !this.axis.y.showKey},			entryText: (this.axis.y.showKey ? 'Hide' : 'Show') + ' Y title'}
			].forEach(createMenuOption('axis', 'y', subMenuTwo, false));
		}
	}
	{
		const subMenu = menu.newMenu('Color palette...');
		[
			{isEq: null,	key: this.chroma.scheme, value: null,				newValue: 'diverging',			entryText: 'Diverging'},
			{isEq: null,	key: this.chroma.scheme, value: null,				newValue: 'qualitative',		entryText: 'Qualitative'},
			{isEq: null,	key: this.chroma.scheme, value: null,				newValue: 'sequential',			entryText: 'Sequential'},
			{entryText: 'sep'},
			{isEq: null,	key: this.chroma.scheme, value: null,				newValue: 'random',				entryText: 'Random'},
		].forEach(createMenuOption('chroma', 'scheme', subMenu, true, () => {this.colors = [];})); // Remove colors to force new palette		
		menu.newEntry({menuName: subMenu, entryText: 'sep'});
		menu.newEntry({menuName: subMenu, entryText: 'Colorblind safe?', func: () => {
			this.colors = [];
			this.changeConfig({chroma: {colorBlindSafe: !this.chroma.colorBlindSafe}});
		}, flags: this.chroma.scheme === 'random' ? MF_GRAYED : MF_STRING});
		menu.newCheckMenu(subMenu, 'Colorblind safe?', void(0), () => {return this.chroma.colorBlindSafe;});
	}
	{
		const type = this.graph.type.toLowerCase();
		const subMenu = menu.newMenu('Other config...');
		{
			const configSubMenu = menu.newMenu((type === 'lines' ? 'Line' : 'Point') + ' size...', subMenu);
			[1, 2, 3, 4].map((val) => {
				return {isEq: null,	key: this.graph.borderWidth, value: null, newValue: _scale(val), entryText: val.toString()};
			}).forEach(createMenuOption('graph', 'borderWidth', configSubMenu));
		}
		if (type === 'scatter' || type === 'p-p plot') {
			const configSubMenu = menu.newMenu('Point type...', subMenu);
			['circle', 'circumference', 'cross', 'triangle', 'plus'].map((val) => {
				return {isEq: null, key: this.graph.point, value: null, newValue: val, entryText: val};
			}).forEach(createMenuOption('graph', 'point', configSubMenu));
		}
	}
	return menu;
}