/* Object class which interprets a service profile and uses it to generate a stream of staff movements e.g. arriving and leaving shifts
Structure of the configuration object:
{
// Useful referent information stored with the result. Could include source of case data, name of scenarios etc
	meta: {
		data: "Reference information to be stored with the results"
	},
// Facilities and services
	assets: [
		{
			label: "asset1", // Will be used for variable and object names internally
			name: "...", // Will be used for logs and displays
			count: 1
		},{
			asset2
		},
		...
		{
			assetn
		}
	],
// Types of staff
	staff: [
	// Definitions of types of staff
		{
			label: "type1", // Will be used for variables and object names internally
			name: "...", // Will be referenced in logs and displays
		},{
			type2
		},
		...
		{
			typen
		}
	],
// Shift pattern for staff and other specialists
	rota: [
	// list of shifts which will repeat indefinitely but could be generated from historic staffing data
	// Constants or functions can be used in the configuration file for repetative configurations e.g. one pattern repeated 5 times for working days and a different pattern for weekends
		{
			label: "shift1", // Will be used for internal variables
			name: "...", // Will be used for logs and displays
			duration: X, // In minutes
		// Needs to have the same staff types in the same order. Intention is to model groups of staff types but could model individuals (1 of each "type") if data where available
		// Constants or functions can ben used in the configuration file for repetative configurations
			staff: [
				X, // Number of staff of the first type available on this shift,
				Y,
				...
				Z
			]
		},{
			shift2 // Needs to have the same staff types in the same order
		}
		...
		{
			shiftn
		}
	]}
 */

function movGen (config) {
// Definition of the generator function for a staff type
	function* moveGenDef (config) {
		var count = [];
		for (var i = 0; i < config.staff.length; i++){
			count.push(0);
		};
		var time = 0.0;
		// repeat the rota indefinitely
		while (true) {
			// loop through each shift in the rota
			for (var i = 0; i < config.rota.length; i++){
				// calculate the change in staffing level for this staff type
				var movement = [];
				for (var j = 0; j < count.length; j++) {
					movement.push(config.rota[i].staff[j] - count[j]);
					count[j] += movement[j];
				}
				// if something has changed emit this as an event
				yield {
					time: time,
					movement: movement
				};
				// Keep track of the time and current staff levels
				time += config.rota[i].duration;
			}
		}
	}

// generator objects
	this.generator = moveGenDef(config);
	this.next = function() {
		return this.generator.next();
	};
}
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = movGen;
}