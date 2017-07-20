//Function to use a collection of assets and a stream of staff movements to handle a stream of patients
var Sim = require ("./sim-0.26.js").Sim;
var Random = require("./sim-0.26.js").Random;

// Import a configuration script which defines how to generate realistic cases
var caseConfig = require("./case.js");
console.log(JSON.stringify(caseConfig.meta));
// Import a configuration script which defines the resources and staff available
var serviceConfig = require('./service.js');
console.log(JSON.stringify(serviceConfig.meta));

// Import a tool which generates a sequence of cases
var caseGen = require("./genCases.js");

// Import a tools which generates staff movements on and off shift
var movGen = require("./genMovements.js");

// Create a case generator by providing the configuration details
// Get next case cases.next().value;
var cases = new caseGen(caseConfig);

// Create a set of staff movement generators by providing the service details
// Get next shift change staffing.next().value;
var staffing = new movGen(serviceConfig);

const Simtime = 24 * 60; // Duration of simulation in minutes. Currenty 1 day

function edSim() 
{
// Create a new instance of simjs
    var sim = new Sim(); 
// Create a source of random numbers. For sophisticated modelling several independent sources can be created
    var random = new Random();
// Create a simjs statistics object for recording basic patient arrivals and departures
    var stats = new Sim.Population();

// Utility function to calculate a delay so that a timer can be set for a target time
    function calcDelay (entity, target) {
    	var delay = target - entity.time();
    	return (delay < 0) ? 0 : delay;
    }

// Wrapping the assignment in a function means each entity references its own details rather than the local, temporary variable
    function saveDetails (entity, details) {
    	entity.details = details;
    }

// Patter for an Entity to model the patients going through the ED       
    var Patient = {
        start: function () {
            // Get the next incident details
            this.details = cases.next().value;
            // Wait until the incident is due to start
            this.setTimer(calcDelay(this, this.details.incidentTime)).done(function () {
                sim.log("Time: %s Patient %s starting", this.time(), this.details.caseReference);
                // Kick off the next patient
                patient = sim.addEntity(Patient);
                this.travel();
            });
        },
        
        travel: function () {
            sim.log("Time: %s Patient %s travelling to ED %s", this.time(), this.details.caseReference, (this.details.arriveByAmbulance)? "in an ambulance" : "in private or public transport");
            // Set a timer to simulate journey to the ED
            // Could be extended to model Ambulance service at some point
            this.setTimer(calcDelay(this, this.details.travelDuration)).done(this.triage);
        },

        triage: function () {
            sim.log("Time: %s Patent %s queuing for triage", this.time(), this.details.caseReference);
            this.enterTime = this.time();
            stats.enter(this.enterTime); //These stats will show wait times

            //Got through appropriate triage route depending upon transport
            var nurseType = (this.details.arriveByAmbulance) ? "triageA" : "triage";
            // Wait in queue then see the triage nurse
            this.useFacility(serviceElements[nurseType], this.details.triageDuration).done(this.consultation());
        },

        consultation: function () {
            sim.log("Time: %s Patent %s queuing to see a doctor", this.time(), this.details.caseReference);
            this.useFacility(serviceElements[doctors], this.details.consultationTime).done(function () {
                sim.log("Time: %s Patent %s leaving the ED", this.time(), this.details.caseReference);
                stats.leave(this.enterTime, this.time()); //These stats will show wait times
            });
        }
    };

// Object to hold objects for assets and staff
    var serviceElements = {};

// Have not yet built a model for raising and lowering staff on shifts so just use fixed ones for now
    for (var i =0; i < serviceConfig.staff.length; i++) {
        // Model staff types as Facilities. Will need to add a priority order feature for doctors
        serviceElements[serviceConfig.staff[i].label] = Sim.Facility(serviceConfig.staff[i].name, Sim.Facility.FCFS, (i===0) ? 5 : 1);
    }

    for (i=0; i < serviceConfig.assets.length; i++) {
        // Model assets as Facilities. Will need to use alternatives when combining e.g. doctors and resus units
        serviceElements[serviceConfig.assets[i].label] = Sim.Facility(serviceConfig.assets[i].name, Sim.Facility.FCFS, serviceConfig.assets[i].count);
    }

/*
// To be developed. Will read shift movement and adjust the staffing levels in the model. Will need to extend "sim.addFacility" to handle this
    var StaffDispatcher = {
    	start: function() {
    		var shift = staffing.next().value;
            this.setTimer(calcDelay(this, shift.time)).done(function() {
            // adjust the number of staff
            });
    	}
    };

    sim.addEntity(StaffDispathcher); */

    
//  Uncomment these line to display logging information
    sim.setLogger(function (msg) {
        console.log(msg);
    });
    
// Add the first patient
    sim.addEntity(Patient);

    sim.simulate(Simtime);
    
    return [stats.durationSeries.average(),
            stats.durationSeries.deviation(),
            stats.sizeSeries.average(),
            stats.sizeSeries.deviation()];
    
}

module.exports = edSim;