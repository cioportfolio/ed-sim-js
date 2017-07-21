// Define convenient functions and constants for this service profile

// Main shifts
var dayStaff = [10, 1, 1];
var nightStaff = [5, 1, 1];

var serviceConfig = {
// Useful referent information stored with the result. Could include source of case data, name of scenarios etc
	meta: {
		data: "Reference information to be stored with the results"
	},
// Facilities and services
	assets: [
		{
			label: "xrays",
			name: "X-ray services",
			count: 1
		},{
			label: "bays",
			name: "Medical bays",
			count: 5
		},{
			label: "seats",
			name: "Waiting room seats",
			count: 30
		}
	],
	staff: [
	// Definitions of types of staff
		{
			label: "doctors",
			name: "Consultants",
		},{
			label: "triage",
			name: "Main reception triage nurses",
		},{
			label: "triageA",
			name: "Ambulance triage nurses",
		}
	],
// Shift pattern for staff and other specialists
	rota: [
	// list of shifts which will repeat indefinitely
		{
			label: "night",
			name: "Night shift",
			duration: 8.0 * 60.0,
			staff: nightStaff
		},{
			label: "day",
			name: "Day shift",
			duration: 16.0 * 60.0,
			staff: dayStaff
		}
	]
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = serviceConfig;
}