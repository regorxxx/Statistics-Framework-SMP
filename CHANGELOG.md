# Changelog

## [Table of Contents]
- [Unreleased](#unreleased)
- [0.3.1](#031---2023-08-24)
- [0.3.0](#030---2023-08-24)
- [0.2.0](#020---2022-08-04)
- [0.1.0](#010---2022-06-21)

## [Unreleased][]
### Added
- UI: 'fill' chart type.
- 'graphSpecs' object argument to set graph type specifics variables. Currently only used for timeline to center X-label ticks ('graphSpecs.timeline.bAxisCenteredX').
- 'chroma.interpolation' for chroma schemes, now set to 'lrgb' by default. See [available modes here](https://regorxxx.github.io/chroma.js/#scalemode).
- 'graph.pointAlpha' to set transparency for data points on all chart types.
- '09_statistics.js' new example showing a timeline per artist/# tracks.
- 'timeline' graph type used specifically to display 3-D data along the new 'multi' graph variable (see below). Is a modified version of the 'bars' type.
- 'bAltLabels' axis variable for alternative drawing. For bars, displays the text in vertical (so it doesn't get cut on small width). For doughnut and pie charts, draws a line from the serie to the label.
- 'configuration.bPopupBackground' variable to display an overlay while loading Async data. Default behavior is false, i.e. only the text and animation is displayed.
- 'configuration.bProfile' variable to enable profiling logging on console.
- 'configuration.bSlicePerKey' variable to force slicing manipulation by total number of x asis keys, instead of values per series. For ex. 2 series may have different X values, resulting on an X axis longer than expected since slicing gets N values per serie, not the values associated to the first N X-keys shared by all series. This is now the default behavior.
- 'configuration.maxSliceOnDataChange' variable to force a max slice range when changing data (which is set to Infinity otherwise). Set to 50 by default.
- 'graph.multi' variable to display aggregated data per X-value, i.e. effectively displaying 3-dimensional data. For ex. number of tracks (Y) per Artist (Z) per Year (X), where artists will be grouped per year. This type of data is better displayed on bar graphs. Data should be passed with this schema: [[[{x1, y11, z11}, ...],[{x2, y21, z21}, ...], ...]], where a single serie contains multiple X-planes, each one being an array of points with same X-value. The framework will automatically manipulate the data to display the X-points of every X-plane array on different series. In case the X-plane arrays don't have the same number of points, output series may have different length, which is now handled by the 'bSlicePerKey' config above.
- Built-in 'natural', 'reverse', 'string natural', 'string reverse', 'random' (Fisher-Yates algorithm), 'radix' (https://github.com/aldo-gutierrez/bitmasksorterJS), 'radix reverse', 'radix int', 'radix int reverse' sorting methods, by setting dataManipulation.sort to those labels.
- 'dataManipulation.sort' may be assigned to an axis by adding the string method along the axis. For ex. 'natural|x' or 'reverse|y'. Note it's limited to a single axis. For more complex sorting just provide a function.
	+ Data: added setting to change how the Z-groups are sorted within the group (independently from the global data).
	+ Data: added setting to filter Z-groups points to either show all or non-zero values (on Y axis).
	+ Data: sorting routines have been changed and now multiple sorting is allowed (by every axis).
- 'dataManipulation.sort' function may now be a method present on the array prototype, like: ```dataManipulation.sort = Array.prototype.shuffle;``` instead of a compare function  used within .sort().
- 'dataManipulation.sort' function may be added as a pair [function, [args]], where the function is a method on array prototype and args is passed as array[function](...args). This may is usually used along Schwartzian transform for sorting; in fact the method is built-in and can be called with ```dataManipulation.sort = ['Schwartzian transform', [(point) => processPoint(point)]];``` or ```dataManipulation.sort = [Array.prototype.schwartzianSort, [(point) => processPoint(point)]];```, being equivalent. The second argument for the sorting method is the compare function, provided by default as natural sorting for numbers. Change as required for strings (for. ex. using localeCompare()).
- Scroll, zoom, settings and display settings buttons have been added; enabled by setting ```buttons = {xScroll: true , settings: true, display: true}```. Functionality is defined by ```callbacks = {settings: {/* onLbtnUp, onDblLbtn, onRbtnUp */}, display: {/* onLbtnUp, onDblLbtn, onRbtnUp */}}```. Scroll and zoom functionality is internally handled by default.
- Custom button has been added; enabled by setting ```buttons = {custom: true}```. Functionality is defined by ```callbacks = {custom: {/* onLbtnUp, onDblLbtn, onRbtnUp, tooltip */}}```. 'tooltip' should be a function or a string, to be used as tooltip text when mouse is over.
- Callback have been added, defined by ```{point: {/* onLbtnUp, onRbtnUp, onDblLbtn */}, focus: {/* onMouseWwheel, onRbtnUp */}, settings: {/* onLbtnUp, onRbtnUp, onDblLbtn */}, display: {/* onLbtnUp, onRbtnUp, onDblLbtn */}, zoom: {/* onLbtnUp, onRbtnUp, onDblLbtn */}, custom: {/* onLbtnUp, onRbtnUp, onDblLbtn, tooltip  */}, config: {/* change, backgroundColor */}}```. 'onMouseWwheel' functionality (while panel is on focus) is internally handled by default, unless explicitly set to null or replaced.
- Settings at'configuration.bDynColor' and 'configuration.bDynColorBW' to dynamically change the chart colors according to the callback's output set at 'callbacks.config.backgroundColor' (see above). See [Timeline-SMP](https://github.com/regorxxx/Timeline-SMP) for an example.
- Zoom functionality using the mouse wheel, which slices the data range to be smaller/bigger.
- Scroll functionality using mouse dragging while clicking, which slices the data to the left/right (not changing the range size).
### Changed
- Labels text is now split by '|', hidding anything after that. This is done so additional IDs may be used after that char at axis TF for deduplication purposes (for ex. artists with same name but different MusicBrainz Id).
- Sorting is now set by default to 'natural|x' when changing from distributions to standard graphs, unless a specific sorting method is provided. Sorting is forced to null when switching to distributions.
- 'tooltipText' may now be a function or a string. tooltipText(point, serieIdx).
- Adjusted mouse cursor over specific elements.
- Improved input menu entries with hints. For ex. transparency input menu entries now have a hint about which value is opaque and which transparent. 
- Improved chart menus with all new additions and code cleanup.
- Tooltip now also shows percentages on pie and doughnut modes.
- Background color can now be set to null to use it as overlay.
- Better Y axis tick management for auto mode.
- Series may now have different X-values and be drawn properly. i.e. not all X-keys must be present on every serie. In the case of 'lines' graph types, it will produce discontinuous lines.
- Replaced library [chroma.js with own version](https://regorxxx.github.io/chroma.js/).
- Optimized repainting to use less resources.
- Multiple improvements and new exposed settings to display menu
- Improved contrast between label backgrounds and text, using WCAG contrast ratio now. Previously it just inverted the label color to B&W.
- 'bars' and 'lines' chart types fallback to 'scatter' if the serie to drawn contains a single point, previously nothing was drawn.
- buttons are now smoothly hidden when panel is not on focus. Transparency may be adjusted from 0 to 255 by setting buttons.alpha, timer to hide them by setting buttons.timer.
- Scroll buttons are now only shown if the chart can be scrolled in such direction.
### Removed
### Fixed
- Axis colors not drawn when using a background color without dynamic colors enabled. It only affected the examples files.
- Points from different series on scatter and line charts were not selectable via mouse, only the first serie. Now are selected by the Y mouse position.
- Improved color checking for bad inputs.
- Improved data checking for bad inputs.
- Fix color scheme application when changing slice (since the scale changes).
- Y axis ticks were sometimes not properly set to respect the margins or panel size.
- Fixed some setting not being set in some cases while using the menu.
- Multiple minor UI fixes.
- Crash opening menu when palettes have been set to not use only colorblind schemes.
- Fixed wrong highlighting for scatter charts, it was smaller by a few px in some cases on both axis.
- Fixed last label background not being properly adjusted in some cases for 'bars', 'lines' and 'scatter' charts.
- Fixed minor UI background highlighting glitch when mouse was over a button but also over a point.
- Minor x-position fix on timeline and bars charts.
- Minor fixes.

## [0.3.1] - 2023-08-24
### Added
### Changed
### Removed
### Fixed
- Vertical text clear type fixing.

## [0.3.0] - 2023-08-24
### Added
- 'pie' graph type. Colors are set per data point, not only per serie. i.e. A serie with 4 values, requires at least 4 colors. Not setting one will fallback to a random Chroma Palette (per serie). In case of using multiple series to showcase the same categories, it's recommended to set a specific Chroma scheme (like 'BuGn'), so all series use the same palette.
- 'doughnut' graph type. Colors are set per data point, not only per serie. Read comments above about 'pie' graph type.
- 'singleLabels' axis variable to not draw multiple times the X labels per serie (only applicable to 'pie' graph type). This is the default behavior.
- 'dataAsync' variable to pass function returning a promise or a promise, resolving to data, to initialize a graph while calculating data without blocking the panel. Once the promise is resolved the chart is repaint with the data.
- 'configuration' variable to pass some chart exotic configurations. Currently allows 'bLoadAsyncData' key, which is set to true by default. i.e. when passing asynchronous data, it will be refreshed once available. Setting it to false will not try to repaint the chart with the data automatically.
- '05_statistics.js' and '06_statistics.js' new examples showing asynchronous loading.
- '07_statistics.js' and '08_statistics.js' new examples showing pie and doughnut graphs.
- Animation while loading asynchronous data.
### Changed
- Minor performance improvement (usually on subsequent calls) caching all TitleFormat expressions.
- Improvements to vertical text using image rotation instead of chars flipped. Old behavior may be used setting 'configuration.bAltVerticalText' to true.
- Minor fix to vertical text.
### Removed
### Fixed
- Crash when no data is available painting ticks on Y axis.
- Crash when no data is available.

## [0.2.0] - 2022-08-04
### Added
- '04_statistics.js' new example showing Chroma Palettes usage.
- Color palette entries added to built-in menu.
- New method to set default configuration 'setDefaults()'.
- New method to export current configuration as object 'exportConfig()' (to be saved on panel properties, etc.).
### Changed
- Missing colors are now set using Chroma Palettes. 'chroma.scheme' variable may be set to use 'diverging, qualitative, sequential or random'; schemes randomly use a palette found at [colorbrewer)(https://colorbrewer2.org/) for the matching type. An specific palette may also be set like 'OrRd' (sequential scheme). When setting it to 'random' the colors are randomly set without any consideration about color contrast.
- Qualitative scheme now replaces the previous default behavior for missing colors (random).
- Specific colors may be set for some series while leaving others to be randomly set. _chart({data, colors: [,RGB(255 , 255, 255),], ...}) will set the color for the second serie and fill the holes with the scheme used (see above). Previously holes were not allowed, so colors set were always applied to first series.
- Minor improvements on examples.
### Removed
### Fixed
- Variables not set at init for nested objects now also use default values (which was the intended behavior).
- Setting colors variable to null broke the chart generation, now forces an empty array by default (which is latter filled with colors according to the palette schemes).
- Fixed colors configuration on '03_statistics.js' example due to a wrong usage of default data variable.
- Fixed position configuration on '03_statistics.js' example. No visual changes, just in case it gets reused or expanded.

## [0.1.0] - 2022-06-21
### Added
- First release.
### Changed
### Removed
### Fixed

[Unreleased]: https://github.com/regorxxx/Statistics-Framework-SMP/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/regorxxx/Statistics-Framework-SMP/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/regorxxx/Statistics-Framework-SMP/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/regorxxx/Statistics-Framework-SMP/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/regorxxx/Statistics-Framework-SMP/compare/d28f441...v0.1.0