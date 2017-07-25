// Define convenient functions and constants for this service profile

// Main shift change times
const startTime = 0.0;
const twoAM = 2 * 60;
const nineAM = 9 * 60;
const twoPM = 14 * 60;
const fivePM = 17 * 60;
const elevenPM = 23 * 60;
const endTime = 24 * 60;

var startShift = [6, 0, 1, 1, 1, 6];
var fromTwoAM = [3, 0, 1, 1, 1, 6];
var fromNine = [3, 1, 1, 1, 1, 6];
var fromTwoPM = [4, 1, 1, 1, 1, 6];
var fromFive = [4, 0, 1, 1, 1, 6];
var fromEleven = [6, 0, 1, 1, 1, 6];

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
			label: "cubicles",
			name: "Cubicles",
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
			label: "junior",
			name: "Junor Doctors",
		},{
			label: "consultants",
			name: "Consultants"
		},{
			label: "triage",
			name: "Main reception triage nurses",
		},{
			label: "triageA",
			name: "Ambulance triage nurses",
		},{
			label: "advanced",
			name: "Advanced nurser practitioners"
		},{
			label: "nurses",
			name: "Other nursers"
		}
	],
// Shift pattern for staff and other specialists
	rota: [
	// list of shifts which will repeat indefinitely
		{
			label: "first",
			name: "Night and Late Shift",
			duration: twoAM - startTime,
			staff: startShift
		},{
			label: "fromTwoAM",
			name: "Night Shift Only",
			duration: nineAM - twoAM,
			staff: fromTwoAM
		},{
			label: "fromNineAM",
			name: "Day Shift Only",
			duration: twoPM - nineAM,
			staff: fromNine
		},{
			label: "fromTwoPM",
			name: "Day and Back Shift",
			duration: fivePM - twoPM,
			staff: fromTwoPM
		},{
			label: "fromFivePM",
			name: "Back and Late Shift",
			duration: elevenPM - fivePM,
			staff: fromFive
		},{
			label: "fromElevenPM",
			name: "Night and Late Shift",
			duration: endTime - elevenPM,
			staff: fromEleven
		}
	]
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = serviceConfig;
}