'use strict';
//21/06/22

// Don't load this helper unless menu framework is also present
// https://github.com/regorxxx/Menu-Framework-SMP
try {include('menu_xxx.js');} catch(e) {
	try {include('..\\examples\\_statistics\\menu_xxx.js');} catch(e) {fb.ShowPopupMessage('Missing menu framework file', window.Name);}
}

function bindMenu(parent) {
	return _attachedMenu.call(parent, {rMenu: createStatisticsMenu.bind(parent)});
}

// Generic statistics menu which should work on almost any chart...
function createStatisticsMenu() {
	// Constants
	this.tooltip.SetValue(null);
	if (!this.menu) {this.menu = new _menu();}
	const menu = this.menu;
	menu.clear(true); // Reset on every call
	// helper
	const createMenuOption = (key, subKey, menuName = menu.getMainMenuName(), bCheck = true) => {
		return function (option) {
			if (option.entryText === 'sep' && menu.getEntries().pop().entryText !== 'sep') {menu.newEntry({menuName, entryText: 'sep'}); return;} // Add sep only if any entry has been added
			if (option.isEq && option.key === option.value || !option.isEq && option.key !== option.value || option.isEq === null) {
				menu.newEntry({menuName, entryText: option.entryText, func: () => {
					if (subKey) {this.changeConfig({[key]: {[subKey]: option.newValue}});}
					else {this.changeConfig({[key]: option.newValues});}
				}});
				if (bCheck) {
					menu.newCheckMenu(menuName, option.entryText, void(0), () => {
						const val = subKey ? this[key][subKey] : this[key];
						if (option.newValue && typeof option.newValue === 'function') {return val && val.name === option.newValue.name;}
						if (option.newValue && typeof option.newValue === 'object') {return val && val.toString() === option.newValue.toString();}
						else {return val === option.newValue;}
					});
				}
			}
		}.bind(this);
	}
	const sortInv = (a, b) => {return b.y - a.y;};
	const sortNat = (a, b) => {return a.y - b.y;};
	const filtGreat = (num) => {return (a) => {return a.y > num;}};
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
			{entryText: 'sep'},
		].forEach(createMenuOption('graph', 'type', subMenu));
		const configMenu = menu.newMenu('Other config...', subMenu);
		{
			const configSubMenu = menu.newMenu('Point size...', configMenu);
			[1, 2, 3, 4].map((val) => {
				return {isEq: null,	key: this.graph.borderWidth, value: null, newValue: _scale(val), entryText: val.toString()};
			}).forEach(createMenuOption('graph', 'borderWidth', configSubMenu));
		}
		if (this.graph.type.toLowerCase() === 'scatter') {
			const configSubMenu = menu.newMenu('Point type...', configMenu);
			['circle', 'crux'].map((val) => {
				return {isEq: null, key: this.graph.point, value: null, newValue: val, entryText: val};
			}).forEach(createMenuOption('graph', 'point', configSubMenu));
		}
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
			// Create a filter entry for each fraction of the max value (duplicates filtered)
			[...new Set([this.stats.maxY, 1000, 100, 10, 10/2, 10/3, 10/5, 10/7].map((frac) => {
				return Math.round(this.stats.maxY / frac) || 1; // Don't allow zero
			}))].map((val) => {
				return {isEq: null,	key: this.dataManipulation.filter, value: null, newValue: filtGreat(val), entryText: 'Greater than ' + val};
			}).forEach(createMenuOption('dataManipulation', 'filter', subMenu));
			[
				{entryText: 'sep'},
				{isEq: null,	key: this.dataManipulation.filter, value: null, newValue: null, entryText: 'No filter'},
			].forEach(createMenuOption('dataManipulation', 'filter', subMenu));
		}
		menu.newEntry({entryText: 'sep'});
	}
	{
		const subMenu = menu.newMenu('Axis...');
		[
			{isEq: null,	key: this.axis.x.labels, value: null,					newValue: {labels: !this.axis.x.labels},			entryText: (this.axis.x.labels ? 'Hide' : 'Show') + ' X labels'}
		].forEach(createMenuOption('axis', 'x', subMenu, false));
		[
			{isEq: null,	key: this.axis.y.labels, value: null,					newValue: {labels: !this.axis.y.labels},			entryText: (this.axis.y.labels ? 'Hide' : 'Show') + ' Y labels'}
		].forEach(createMenuOption('axis', 'y', subMenu, false));
	}
	return menu;
}