# ed-sim-js

## About this project

One of the piches at a recent [#NHS Hack Day]() concerned modelling or simulating an emergency department (commonly known as accident and emergency or just 'A&E') to help health professionals and others to get them to work more effectively. There is a lot more information on the [project site](ed-sim.github.io).

A common challenge for this kind of project is keeping up the momentum after the event and being able to take on and develop the prototypes that are created. This is an experiment to see if using a well documented library ([simjs](simjs.com)) and a portable programming language (javascript) might make it easier to continue the great work that the team started.

## Outline of this variant of the Emergency Department Simulator

The simulator consists of a set of javascript programs built on top of [simjs](simjs.com). The scripts will run in almost any modern web browser and a bare bones web page is included to start a simulation without needing any kind of server. You can try the [demonstration](https://ed-sim.github.io/ed-sim-js/index.html) now. The scripts will also run on a server using [node.js] which means it can be run on pretty much any personal computer, server (windows or unix) or cloud service. This might be needed for more demanding uses e.g. very large models or many parallel simulations.

## Usage

A version of the simulator is available [online](https://ed-sim.github.io/ed-sim-js/index.html) but most users will want to try out different configurations, e.g. see the effect of changing staff rotas etc. There are two ways to do this.

The easiest approach is to clone the repository and modify the configuration files. The simulation can be run by opening the basic web page included in the repository.

A more sophisticated approach is to build a web site which provided a user interface for setting the configuration parameters (or loading them from other data sources such as patient and staff records from a deparment), construct the configuration objects in javascript and use these in place of the configuration files.

## Development in progress

- PARTIALLY DONE - Flexible simulation core using case, staff and facility profiles. See ed-sim-0.2.js
	- DONE Created a subclass of the simjs PQueue to use for priority queueing of patients based upon a user supplied ordering function
	- PARTIALLY DONE Created an variant of the simjs Facility which uses a priority queue and allows the number of servers to be varied during the simulation. Need to change default behaviour if there are no servers. If the initial number of servers is 0 simjs overrides this and adds 1 server.
    - Patients only queue for a single thing (e.g. a doctor or an resus room) using simjs tools such as Facilities and Buffers. The base simjs classes can be extended to handle AND/OR combinations such as wait for one of a number of facilities to become free (OR logic) or wait for two of more Facility to be free at the same time (AND logic). Alternatively existing simjs Buffers, Stores, Events and Messages could be used together to achieve the same effect.

- DONE - Structure to define cases which can be generated using stocastic functions or from actual historical records. See case.js

- DONE - Staff movements generator to manage available staff in a simulation. See genMovements.js

- DONE - Case generator using stocastic functions to generate artificial, but realistic demand. See genCases.js and case.js

- DONE - Structure to define staff and facilities so medical teams and facilities can be generated or loaded from historical records. See service.js

- Case reader to load historic records into a format to be used in a simulation. Not yet done. Can be a simple JSON file load

- Rota reader to load historic records into a format to be used in a simulation

## Main components

### index.html

A bare bones web page which loads the javascript files and provides a minimal user interface to start a simulation and show the results. If you have a copy of the repository on your PC you can run the simulation just by opening this file in a browser.

### test.js

A bare bones script to perform tests and can be used to run the simulation in a node.js server.

```bash
$ node test.js
```

### scripts/ed-sim-0.2.js

The main simulation function. This reads the configuration scripts, builds a model using the elements available in simjs including a simulated stream of patients. ed-sim.js was the first prototype but is not now used.

### scripts/genCases.js

A utility function which reads the case profile (structured in the same way as case.js) and generates a stream of events to simulate the arrival of patients.

### scripts/getMovements.js

A utility function which reads the staff and rota profile (structured in the same way as service.js) and generates a stream of events to simulate the arrival and departure of staff according to the shift rota.

### scripts/service.js

A configuration script to define the emergency department that will be simulated.

```javascript
// Structure of the configuration object:
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
				X, // Number of staff of type1 available on this shift,
				Y, // Number of staff of type2
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
```

### scripts/case.js

A configuration script to define a flow of cases that the simulated emergency department will receive.

```javascript
Structure of the configuration object:
{
// Optional referent information which could be stored with the simulation result.
	// Could include source of case data, name of scenarios etc
	meta: {
		data: "Reference information to be stored with the results"
	},
	// Optional list of preprepared cases which the generator will feed to the simulation
	cases:[{
		attribute1: value1, //Normally a case id of some kind
		attribute2: value2, //Normally the start time - in minutes from the start of the simulation
		...
		attributen: valuen
	},{
		case2
	},
	...
	{
		casen
	}],
	// Optional definition for stocastic generation of cases
	profile: [{
		// List of attributes for each case. Can be constant value to can be generated for each case with an arbitrary function
		name: "attribute name",
		type: "const or function",
		value: expression or function definition
	},{
		Attribute2
	},
	...
	{
		Atrributen
	}]
}
```

### scripts/simjs-edsim.js

Defines some extensions to the base simjs classes.
- Sim.edSimQ is a subclass of the base Sim.PQueue class which can be used for any request object. The only extensions are:
    - The constructor takes a comparison function as a parameter to define the order of processing
    - An empty function to indicate when the queue is empty

- Sim.makeEdSim (and supporting functions) to convert a default simjs Facility into a special edsim one which uses a priority queue rather than a firt-in-first-out queue and provides functions to change the number of servers during the simulation.

### scripts/sim-0.26.js 

This is a slightly modified version of the simjs library that is available on the main simjs site. The only changes are the addition of these lines at the end to expose the simulator and random classes for use in node.js as there is not a file import or include feature in node.js at the moment.

```javascript
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports.Random = Random;
	module.exports.Sim = Sim;
}
```

