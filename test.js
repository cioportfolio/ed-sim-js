// Sample script to test the various component functions

// Import a configuration script which defines how to generate realistic cases
var config = require("./scripts/case.js");

// Impirt a tool which generates a sequence of cases
var caseGen = require("./scripts/genCases.js");

// Create a case generator by providing the configuration details
var cases = new caseGen(config);

// Get and display the first case
var nextCase = cases.next().value;
console.log(JSON.stringify(nextCase));

// Get and display the next case
nextCase = cases.next().value;
console.log(JSON.stringify(nextCase));
