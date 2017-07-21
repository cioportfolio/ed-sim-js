// Sample script to test the various component functions
// Run with:
// $ node test.js
// or similar

// Import a configuration script which defines how to generate realistic cases
var caseConfig = require("./scripts/case.js");

// Import a configuration script which defines the resources and staff available
var serviceConfig = require('./scripts/service.js');

// Import a tool which generates a sequence of cases
var caseGen = require("./scripts/genCases.js");

// Import a tools which generates staff movements on and off shift
var movGen = require("./scripts/genMovements.js");

// Create a case generator by providing the configuration details
var cases = new caseGen(caseConfig);

// Create a set of staff movement generators by providing the service details
var moves = new movGen(serviceConfig);

// Get and display the first case
var nextCase = cases.next().value;
console.log(JSON.stringify(nextCase, null, 2));

// Get and display the next case
nextCase = cases.next().value;
console.log(JSON.stringify(nextCase, null, 2));

// Get and display the first shift change
var nextShift = moves.next().value;
console.log(JSON.stringify(nextShift, null, 2));

// Get and display the next shift change
nextShift = moves.next().value;
console.log(JSON.stringify(nextShift, null, 2));

var edSim = require("./scripts/ed-sim-0.2.js");

console.log(JSON.stringify(edSim(console.log), null, 2));
