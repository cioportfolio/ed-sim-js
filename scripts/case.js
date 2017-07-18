var Sim = require ("./sim-0.26.js").Sim;
var Random = require("./sim-0.26.js").Random;
var random = new Random();

// Define convenient constants for this profile of cases
const casesPerDay = 150.0;
const proportionAmbulance = 0.5;
const proportionXRay = 0.5;

// Defines a convenient generator function to make the code in the case profile a little easier to read
// Each time incidentTime.next() is called it will generate the time of the next case
function* timeGen() {
	var nextTime = 0
	const meanArrival = 24.0*60.0/casesPerDay;

	while (true) {
		nextTime += random.exponential(1.0/meanArrival);
		yield nextTime;
	}
}

var incidentTime = timeGen();

function* refGen() {
	var nextRef = 0
	while (true) {
		yield nextRef++;
	}
}

var incidentRef = refGen();

var caseCongiguration = {
// Useful referent information stored with the result. Could include source of case data, name of scenarios etc
	meta: {
		data: "Reference information to be stored with the results"
	},
//	"cases": [], Optional list of preprepared cases
	profile: [ // Optional definition for stocastic generation of cases
	// List of attributes for each case. Can be constant value to can be generated for each case with an arbitrary function
		{
			name: "caseReferece",
			type: "function",
			value: function() {
				return incidentRef.next().value;
			}
		},{
			// Start time for the case. Uses generator to created a random flow of cases
			name: "incidentTime",
			type: "function",
			value: function() {
				return incidentTime.next().value;
			}
		},{
			// Time that will be spent in triage. Could be changed to a random function
			name: "triageDuration",
			type: "const",
			value: 5.0
		},{
			// Time that will be spent consulting a doctor
			name: "consultationTime",
			type: "function",
			value: function () {
				return random.normal(20.0, 10.0);
			}
		},{
			// Flag for cases which arrive by ambulance
			name: "arriveByAmbulance",
			type: "function",
			value: function () {
				return random.random() < proportionAmbulance
			}
		},{
			// Random severity rating between 1 and 4
			name: "severity",
			type: "function",
			value: function () {
				return Math.ceil(random.random()*4);
			}
		},{
			// Flag for cases which will need an Xray
			name: "needXRay",
			type: "function",
			value: function () {
				return random.random() < proportionXRay;
			}
		}
	]
};

module.exports = caseCongiguration;
