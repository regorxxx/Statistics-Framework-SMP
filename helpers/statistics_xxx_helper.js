'use strict';
//19/06/22

// Dummy file to load existing helpers or independent file
{
	let bIncludeRel = true;
	try {include('helpers_xxx_dummy.js');} catch(e) {bIncludeRel = false;}
	if (bIncludeRel) {
		include('helpers_xxx_UI.js');
		include('helpers_xxx.js');
		include('helpers_xxx_prototypes.js');
	} else {
		include('statistics_xxx_helper_fallback.js');
	}
}