# Changelog

## [Table of Contents]
- [Unreleased](#unreleased)
- [0.3.1](#031---2023-08-24)
- [0.3.0](#030---2023-08-24)
- [0.2.0](#020---2022-08-04)
- [0.1.0](#010---2022-06-21)

## [Unreleased][]
### Added
- 'bAltLabels' axis variable for alternative drawing. For bars, displays the text in vertical (so it doesn't get cut on small width). For doughnut and pie charts, draws a line from the serie to the label.
- 'bPopupBackground' configuration variable to display an overlay while loading Async data. Default behavior is false, i.e. only the text and animation is displayed.
- 'bProfile' configuration variable to enable profiling logging on console.
- 'bSlicePerKey' configuration variable to force slicing manipulation by total number of x asis keys, instead of values per series. For ex. 2 series may have different X values, resulting on an X axis longer than expected since slicing gets N values per serie, not the values associated to the first N X-keys shared by all series. This is now the default behavior.
- 'multi' graph variable to display aggregated data per X-value, i.e. effectively displaying 3-dimensional data. For ex. number of tracks (Y) per Artist (Z) per Year (X), where artists will be grouped per year. This type of data is better displayed on bar graphs. Data should be passed with this schema: [[[{x1, y11, z11}, ...],[{x2, y21, z21}, ...], ...]], where a single serie contains multiple X-planes, each one being an array of points with same X-value. The framework will automatically manipulate the data to display the X-points of every X-plane array on different series. In case the X-plane arrays don't have the same number of points, output series may have different length, which is now handled by the 'bSlicePerKey' config above.
### Changed
- Tooltip now also shows percentages on pie and doughnut modes.
- Background color can now be set to null to use it as overlay.
- Better Y axis tick management for auto mode.
- Series may now have different X-values and be drawn properly. i.e. not all X-keys must be present on every serie. In the case of 'lines' graph types, it will produce discontinuous lines.
### Removed
### Fixed
- Improved color checking for bad inputs.
- Improved data checking for bad inputs.
- Y axis ticks were sometimes not properly set to respect the margins or panel size.
- Fixed some setting not being set in some cases while using the menu.

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