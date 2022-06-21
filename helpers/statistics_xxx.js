'use strict';
//21/06/22

include('statistics_xxx_helper.js');

function _chart({
				data /* [[{x, y}, ...]]*/,
				colors = [], /* [rgbSerie1, ...] */
				graph = {type: 'bars', borderWidth: _scale(1), point: null},
				dataManipulation = {sort: (a, b) => {return b.y - a.y;}, filter: null, slice: [0, 10], distribution: null},
				background = {color: RGB(255 , 255, 255), image: null},
				grid = {x: {show: false, color: RGB(0,0,0), width: _scale(1)}, y: {show: false, color: RGB(0,0,0), width: _scale(1)}},
				axis = {
						x: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 'auto', labels: true, key: ''},
						y: {show: true, color: RGB(0,0,0), width: _scale(2), ticks: 10, labels: true, key: 'tracks'}
				},
				margin = {left: _scale(20), right: _scale(20), top: _scale(20), bottom: _scale(20)},
				x = 0,
				y = 0,
				w = window.Width,
				h = window.Height,
				title = window.Name + ' {' + axis.x.key + ' - ' + axis.y.key + '}',
				tooltipText = ''
		} = {}) {
	// Global tooltip
	this.tooltip = new _tt(null);
	
	/*
		Paint
	*/
	this.paintBg = (gr) => {
		if (this.background.imageGDI) {
			gr.DrawImage(this.background.imageGDI, this.x, this.y, this.w, this.h, 0, 0, this.w, this.h);
		} else {
			gr.FillSolidRect(this.x, this.y, this.w, this.h, this.background.color);
		}
	};
	
	this.paintGraph = (gr) => {
		this.dataCoords = this.dataDraw.map((serie) => {return [];})
		let x, y, w, h;
		
		// Max Y value for all series
		let maxY = 0, minY = 0;
		this.dataDraw.forEach((serie) => {
			serie.forEach((value) => {
				if (value.y > maxY) {maxY = value.y;}
				if (value.y < minY) {minY = value.y;}
			});
		});
		this.stats.maxY = maxY;
		this.stats.minY = minY;
		// Ticks
		const ticks = this.steps(0, maxY, this.axis.y.ticks);
		const tickText = ticks.map((tick) => {return this.nFormatter(tick, 1);});
		// Retrieve all different label on all series
		const xAsisValues = new Set();
		this.dataDraw.forEach((serie) => {
			serie.forEach((value) => {xAsisValues.add(value.x);});
		});
		
		/*
			Draw for all graphs
		*/
		w = this.w - this.margin.right;
		h = this.y + this.margin.top;
		x = this.x + this.margin.leftAuto;
		y = this.h - this.margin.bottom;
		// Ticks
		if (this.axis.y.show && this.axis.y.labels) {
			tickText.forEach((tick) => {
				const yTickW = gr.CalcTextWidth(tick, this.gFont) + this.axis.y.width / 2 + _scale(4);
				if (this.margin.leftAuto <= yTickW) {this.margin.leftAuto += this.margin.left; x += this.margin.left;}
			});
		}
		// XY Axis
		if (this.axis.y.show) {
			gr.DrawLine(x, y, x, h, this.axis.y.width, this.axis.y.color);
		}
		if (this.axis.x.show) {
			gr.DrawLine(x, y - this.axis.x.width / 2, this.x + w, y - this.axis.x.width / 2, this.axis.x.width, this.axis.x.color);
		}
		x += this.axis.x.width / 2;
		w -= this.axis.y.width / 2;
		y -= this.axis.y.width;
		
		let tickW, barW, offsetTickText = 0;
		switch (this.graph.type) {
			case 'lines': {
				x -= this.axis.x.width * 1/2;
				tickW = (w - this.margin.leftAuto) / ((xAsisValues.size - 1) || 1);
				barW = 0;
				offsetTickText = - tickW / 2;
				const selBar = tickW;
				// Values
				const last = xAsisValues.size - 1;
				gr.SetSmoothingMode(4); // Antialias for lines
				this.dataDraw.forEach((serie, i) => {
					const xValues = x;
					let valH;
					const borderColor = RGBA(...toRGB(invert(this.colors[i], true)), getBrightness(...toRGB(this.colors[i])) < 50 ? 300 : 25);
					serie.forEach((value, j) => {
						valH = value.y / maxY * (y - h);
						const xPoint = xValues + j * tickW;
						const yPoint = y - valH;
						const bFocused = this.currPoint[0] === i && this.currPoint[1] === j;
						this.dataCoords[i][j] = {x: j > 0 ? xPoint - selBar / 2 : xPoint, y: yPoint, w: (j > 0 && j !== last ? selBar : selBar / 2), h: valH};
						const point = this.dataCoords[i][j];
						if (bFocused) {
							gr.FillSolidRect(point.x, point.y, point.w, point.h, borderColor)
						}
						if (j !== 0) {
							const paintPoint = (color) => {
								const newValH = serie[j - 1].y / maxY * (y - h);
								const newXPoint = xValues + (j - 1) * tickW;
								const newYPoint = y - newValH;
								gr.DrawLine(newXPoint, newYPoint, xPoint, yPoint, this.graph.borderWidth, color);
							};
							paintPoint(this.colors[i]);
							if (bFocused) {paintPoint(borderColor);}
						}
					});
				});
				gr.SetSmoothingMode(0);
				break;
			}
			case 'scatter': {
				x -= this.axis.x.width * 1/2;
				tickW = (w - this.margin.leftAuto) / ((xAsisValues.size - 1) || 1);
				barW = 0;
				offsetTickText = - tickW/ 2;
				const selBar = this.graph.borderWidth * 2;
				// Values
				gr.SetSmoothingMode(4); // Antialias for lines
				this.dataDraw.forEach((serie, i) => {
					const xValues = x;
					let valH;
					const borderColor = RGBA(...toRGB(invert(this.colors[i], true)), getBrightness(...toRGB(this.colors[i])) < 50 ? 300 : 25);
					serie.forEach((value, j) => {
						valH = value.y / maxY * (y - h);
						const xPoint = xValues + j * tickW;
						const yPoint = y - valH;
						const bFocused = this.currPoint[0] === i && this.currPoint[1] === j;
						if (bFocused) {
							gr.FillSolidRect(xPoint - selBar / 2, yPoint, selBar, valH, borderColor)
						}
						if (!this.graph.point || this.graph.point.toLowerCase() === 'circle') {
							this.dataCoords[i][j] = {x: xPoint, y: yPoint -  this.graph.borderWidth / 2, w: selBar, h: valH};
							const paintPoint = (color) => {
								gr.DrawEllipse(xPoint - this.graph.borderWidth / 2, yPoint - this.graph.borderWidth / 2, this.graph.borderWidth, this.graph.borderWidth, this.graph.borderWidth, color);
							};
							paintPoint(this.colors[i]);
							if (bFocused) {paintPoint(borderColor);}
						} else if (this.graph.point.toLowerCase() === 'crux') {
							this.dataCoords[i][j] = {x: xPoint, y: yPoint -  this.graph.borderWidth, w: selBar, h: valH};
							const paintPoint = (color) => {
								gr.DrawLine(xPoint - this.graph.borderWidth, yPoint - this.graph.borderWidth, xPoint + this.graph.borderWidth, yPoint + this.graph.borderWidth, this.graph.borderWidth, color);
								gr.DrawLine(xPoint - this.graph.borderWidth, yPoint + this.graph.borderWidth, xPoint + this.graph.borderWidth, yPoint - this.graph.borderWidth, this.graph.borderWidth, color);
							};
							paintPoint(this.colors[i]);
							if (bFocused) {paintPoint(borderColor);}
						}
					});
				});
				gr.SetSmoothingMode(0);
				break;
			}
			case 'bars':
			default: {
				tickW = (w - this.margin.leftAuto) / xAsisValues.size;
				barW = tickW / this.series;
				// Values
				this.dataDraw.forEach((serie, i) => {
					const xValues = x + i * barW;
					let valH;
					const borderColor = RGBA(...toRGB(invert(this.colors[i], true)), getBrightness(...toRGB(this.colors[i])) < 50 ? 300 : 25);
					serie.forEach((value, j) => {
						valH = value.y / maxY * (y - h);
						const xPoint = xValues + j * tickW;
						const yPoint = y - valH;
						const bFocused = this.currPoint[0] === i && this.currPoint[1] === j;
						this.dataCoords[i][j] = {x: xPoint, y: yPoint, w: barW, h: valH};
						const point = this.dataCoords[i][j];
						gr.FillSolidRect(point.x, point.y, point.w, point.h, this.colors[i]);
						if (bFocused) {gr.FillSolidRect(point.x, point.y, point.w, point.h, borderColor);}
						// Borders
						if (this.graph.borderWidth) {
							gr.DrawRect(point.x, point.y, point.w, point.h, this.graph.borderWidth, borderColor);
						}
					});
				});
			}
		}
		
		/*
			Draw for all graphs
		*/
		// Y Axis ticks
		if (this.axis.y.show) {
			ticks.forEach((tick, i) => {
				const yTick = y - tick / maxY * (y - h);
				gr.DrawLine(x - this.axis.x.width * 2, yTick, x + this.axis.x.width, yTick, this.axis.y.width / 2, this.axis.y.color);
				if (this.axis.y.labels) {
					const tickH = gr.CalcTextHeight(tickText[i], this.gFont);
					const yTickText = yTick - tickH / 2;
					const flags = DT_RIGHT | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
					gr.GdiDrawText(tickText[i], this.gFont, this.axis.y.color, this.x - this.axis.y.width / 2 - _scale(4), yTickText, this.margin.leftAuto, tickH, flags);
				}
			});
		}
		// X Axis ticks
		if (this.axis.x.show) {
			const last = xAsisValues.size - 1;
			[...xAsisValues].forEach((valueX,  i) => {
				const xLabel= x + i * tickW;
				if (this.axis.x.labels) {
					if (i === 0 && offsetTickText) { // Fix for first label position
						const xTickW = gr.CalcTextWidth(valueX, this.gFont);
						const flags = DT_LEFT | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
						const zeroW = xLabel + offsetTickText + tickW - this.x - this.margin.leftAuto / 2;
						gr.GdiDrawText(valueX, this.gFont, this.axis.x.color, this.x + this.margin.leftAuto / 2, y + this.axis.y.width, zeroW, this.h, flags);
					} else if (i === last) { // Fix for last label position
						const lastW = xLabel + offsetTickText + tickW > w - this.margin.right ? this.x + w - (xLabel + offsetTickText) + this.margin.right : tickW;
						const flags = DT_CENTER | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
						gr.GdiDrawText(valueX, this.gFont, this.axis.x.color, xLabel + offsetTickText, y + this.axis.y.width, lastW, this.h, flags);
					} else {
						const flags = DT_CENTER | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
						gr.GdiDrawText(valueX, this.gFont, this.axis.x.color, xLabel + offsetTickText, y + this.axis.y.width, tickW, this.h, flags);
					}
				}
				const xLine = xLabel + barW;
				gr.DrawLine(xLine, y + this.axis.x.width * 2, xLine, y - this.axis.x.width, this.axis.x.width / 2, this.axis.x.color);
			});
		}
		// Grid
		if (this.grid.y.show) {
			ticks.forEach((tick, i) => {
				const yTick = y - tick / maxY * (y - h);
				const flags = DT_RIGHT | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
				gr.DrawLine(x, yTick, w, yTick, this.grid.y.width, this.grid.y.color);
			});
		}
		if (this.grid.x.show) {
			[...xAsisValues].forEach((tick, i) => {
				const flags = DT_RIGHT | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
				const xLine = x + barW + i * tickW;
				gr.DrawLine(xLine, y - this.grid.y.width, xLine, h, this.grid.x.width, this.grid.x.color);
			});
		}
	};
	
	this.paint = (gr) => {
		this.paintBg(gr);
		this.paintGraph(gr);
	};
	
	/*
		Helpers
	*/
	this.steps = (min, max, num = 10) => {
		const step = Math.round((max - min) / num);
		return range(min, max, step || 1); 
	};
	
	this.randomColor = () => {
		return RGB(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
	};
	
	/*
		Callbacks
	*/
	this.tracePoint = (x, y) => {
		for (let i = 0;  i < this.series; i++) {
			const serie = this.dataCoords[i];
			const len = serie.length;
			for (let j = 0; j < len; j++) {
				const point = serie[j];
				if (x >= point.x && x <= point.x + point.w && y >= point.y && y <= point.y + point.h) {
					return [i, j];
				}
			}
		}
		return [-1, -1];
	};
	
	this.trace = (x, y) => {
		return (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
	};
	
	this.move = (x, y) => {
		if (this.trace(x,y)) {
			const [serie, idx] = this.tracePoint(x, y);
			const bPaint = this.currPoint[0] !== serie || this.currPoint[1] !== idx;
			this.currPoint = [serie, idx];
			if (bPaint) {window.RepaintRect(this.x, this.y, this.x + this.w, this.y + this.h);}
			if (this.currPoint[0] !== -1 && this.currPoint[1] !== -1) {
				const point = this.dataDraw[serie][idx];
				this.tooltip.SetValue(
					point.x + ': ' + point.y + (this.axis.y.key ?  ' ' + this.axis.y.key : '') + (this.tooltipText && this.tooltipText.length ? tooltipText : '')
				, true);
				return true;
			} else {
				this.tooltip.SetValue(null);
			}
		}
		this.leave();
		return false;
	};
	
	this.leave = () => {
		if (this.currPoint[0] !== -1 || this.currPoint[1] !== -1) {
			this.currPoint = [-1, -1];
			window.RepaintRect(this.x, this.y, this.x + this.w, this.y + this.h);
			return true;
		}
		return false;
	};
	
	/*
		Data manipulation
	*/
	this.sort = () => { // Sort points with user provided function
		if (!this.dataManipulation.sort) {return;}
		this.dataDraw = this.dataDraw.map((serie) => {return serie.sort(this.dataManipulation.sort)});
	};
	
	this.cleanData = () => { // Filter points without valid x or y values
		if (!this.dataDraw) {return;}
		this.dataDraw = this.dataDraw.map((serie) => {return serie.filter((point) => {
				return (point.hasOwnProperty('x') && point.x !== null && point.x !== '' && point.hasOwnProperty('y') && Number.isFinite(point.y));
			});
		});
	};
	
	this.filter = () => { // Filter points with user provided function
		if (!this.dataManipulation.filter) {return;}
		this.dataDraw = this.dataDraw.map((serie) => {return serie.filter(this.dataManipulation.filter)});
	};
	
	this.slice = () => { // Draw only selected points
		if (!this.dataManipulation.slice || !this.dataManipulation.slice.length === 2) {return;}
		// If end is greater than the length of the array, it uses the length of the array
		this.dataDraw = this.dataDraw.map((serie) => {return serie.slice(...this.dataManipulation.slice)});
	};

	this.normal = (bInverse = false) => { // Sort as normal distribution
		const sort = bInverse ? (a, b) => {return b.y - a.y;} : (a, b) => {return a.y - b.y;}
		this.dataDraw = this.dataDraw.map((serie) => {return serie.sort(sort).reduceRight((acc, val, i) => {return i % 2 === 0 ? [...acc, val] : [val, ...acc];}, []);});
		if (!this.dataManipulation.slice || !this.dataManipulation.slice.length === 2) {return;}
		this.dataDraw = this.dataDraw.map((serie) => {
			const center = Math.round(serie.length / 2) + this.dataManipulation.slice[0];
			const left = center - this.dataManipulation.slice[1];
			const rigth = center + this.dataManipulation.slice[1];
			return serie.slice(left - (bInverse ? 2 : 1), rigth);
		});
	};
	
	this.normalInverse = () => { // Tails of normal distribution
		this.normal(true);
	};
	
	this.distribution = (dist = this.dataManipulation.distribution || '') => { // Apply known distributions
		switch (dist.toLowerCase()) {
			case 'normal':
				this.normal();
				return true;
			case 'normal inverse':
				this.normalInverse();
				return true;
			case 'none':
			default: 
				return false;
		}
	};
	
	this.manipulateData = () => {
		this.dataDraw = this.data.map((serie) => {return [...serie];})
		this.cleanData();
		this.filter();
		if (!this.distribution()) {
			this.sort();
			this.slice();
		}
	};
	
	this.nFormatter = (num, digits) => { // Y axis formatter
		const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];
		const tier = Math.log10(Math.abs(num)) / 3 | 0;
		// if zero, we don't need a suffix
		if (tier === 0) {return num;}
		// get suffix and determine scale
		const suffix = SI_SYMBOL[tier];
		const scale = Math.pow(10, tier * 3);
		// scale the number
		const scaled = num / scale;
		// format number and add suffix
		return scaled.toFixed(1) + suffix;
	};
	
	/*
		Config related
	*/
	this.changeConfig = ({data, colors, graph, dataManipulation, background, grid, axis, margin, x, y, w, h, title, gFont, bPaint = true}) => {
		if (gFont) {this.gFont = gFont;}
		if (data) {this.data = data; this.dataDraw = data; this.series = data.length;}
		if (dataManipulation) {this.dataManipulation = {...this.dataManipulation, ...dataManipulation};}
		if (graph) {this.graph = {...this.graph, ...graph};}
		if (background) {this.background = {...this.background, ...background}; this.background.imageGDI = this.background.image ? gdi.Image(this.background.image) : null;}
		if (colors) {this.colors = colors; this.checkColors();}
		if (axis) {
			if (axis.x) {this.axis.x = {...this.axis.x, ...axis.x};}
			if (axis.y) {this.axis.y = {...this.axis.y, ...axis.y};}
		}
		if (grid) {
			if (grid.x) {this.grid.x = {...this.grid.x, ...grid.x};}
			if (grid.y) {this.grid.y = {...this.grid.y, ...grid.y};}
		}
		if (margin) {this.margin = {...this.margin, ...margin};}
		if (x) {this.x = x;}
		if (y) {this.y = y;}
		if (w) {this.w = w;}
		if (h) {this.h = h;}
		if (title) {this.title = title;}
		if (data || dataManipulation) {this.initData();}
		window.RepaintRect(this.x, this.y, this.x + this.w, this.y + this.h);
		return this;
	};
	
	this.cleanPoints = () => {
		this.dataCoords = this.dataDraw.map((serie) => {return [];})
		this.currPoint = [-1, -1];
		this.stats = {maxY: 0, minY: 0};
	};
	
	this.checkColors = () => {
		if (!this.colors) {this.colors = [];}
		if (this.colors.length !== this.series) {
			for (let i = this.colors.length; i < this.series; i++) {
				this.colors.push(this.randomColor());
			}
		}
	};
	
	this.initData = () => {
		// Missing colors
		this.checkColors();
		// Clean calculated offeset
		this.margin.leftAuto = this.margin.left;
		// Clean and manipulate data
		this.manipulateData();
		this.cleanPoints();
	}
	
	this.init = () => {
		// Bg Image
		this.background.imageGDI = this.background.image ? gdi.Image(this.background.image) : null;
		this.initData();
	};
	
	this.gFont = _gdiFont('Segoe UI', _scale(10))
	this.data = data;
	this.dataDraw = data;
	this.dataCoords = this.dataDraw.map((serie) => {return [];})
	this.dataManipulation = dataManipulation;
	this.series = data.length;
	this.graph = graph;
	this.background = background;
	this.colors = colors;
	this.axis = axis;
	this.grid = grid;
	this.margin = margin;
	this.currPoint = [-1, -1];
	this.stats = {maxY: 0, minY: 0};
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.title = title;
	this.tooltipText = tooltipText;
	this.init();
}