'use strict';
//18/01/23

// Dummy file to load existing helpers or independent file
{
	let bIncludeRel = true;
	try {include('..\\..\\helpers\\helpers_xxx_dummy.js');} catch(e) {bIncludeRel = false;}
	if (bIncludeRel) {
		include('..\\..\\helpers\\helpers_xxx_UI.js');
		include('..\\..\\helpers\\helpers_xxx_UI_flip.js');
		include('..\\..\\helpers\\helpers_xxx.js');
		include('..\\..\\helpers\\helpers_xxx_prototypes.js');
	} else {
		include('statistics_xxx_helper_fallback.js');
	}
	function create_svg(crit) {
		const color = [];
		const radius = 35;
		const width = window.Width / 3;
		const height = window.Height;
		let offset = 0;
		const circumf = 2 * Math.PI * radius;
		color[1] = "lime";	color[2] = "fuchsia"; color[3] = "gold";
		var svg ='<svg xmlns="http://www.w3.org/2000/svg" height="' + height + '" width="' + width + '" viewBox="0 0 200 200" >\n';
		for (var i = 1 ; i < crit.length; i++) { //loop to draw all the slices
			var sliceAngle = crit[i] / crit[0] * circumf;
			svg +='<circle r="' + radius + '" cx="100" cy="100" fill="none"\n';
			svg +='stroke="' + color[i] + '"\n';
			svg +='stroke-width="'+radius * 2 + '"\n';
			svg +='stroke-dasharray="'+ sliceAngle + ' ' + circumf + '"\n';
			svg +='stroke-dashoffset="'+offset + '"\n';
			svg += 'transform="rotate(-90) translate(-200)"/>';
			offset -= sliceAngle;
			var perc = Math.round(crit[i] / crit[0] * 100).toFixed(0) + "%"; // percentage as text of the slice
			//// Below to calculate X/Y pos of the percentage in the pie //////
				var cum = 0; 
				var sav = 0; 
				for (var j = 1 ; j< i+1; j++) { 
					cum += crit[j];
				}
				sav = cum-crit[i] + (crit[i]/2);
				var angle = radians(360 * sav / crit[0] - 90);
				var xPos = 100 + Math.cos(angle) * radius/2 ;
				var yPos = 100 + Math.sin(angle) * radius/2 ;
			//// End of calculation //////////
			svg +='<text x = "'+xPos+'" y = "'+yPos+'" fill="Blue"  font-family="Segoe UI" font-size="13" font-weight="bold">' + perc + '</text>\n'; // put the percentage in the slice
			svg+= '<text x = "'+ (43 * i) +'" y = "183" fill="White"  font-family="Segoe UI" font-size="13" font-weight="bold">' + perc + '</text>\n'; // put the percentage below
			svg+= '<rect x = "'+ (43 * i) +'" y = "185" height="7" width="22" fill="' + color[i] + '"/>\n';
		}
		svg += '</svg>\n';
		//console.log(svg);
		return utils.LoadSVG(svg);
	}
	
	function radians(degrees) {
	  var pi = Math.PI;
	  return degrees * (pi/180);
	}
}