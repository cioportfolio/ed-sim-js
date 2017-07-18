// Parameters for the simulation. Moved here to make experimentation easier. Once the parameters are stable they could supplied through a user interface or database */
const doctorsOnDuty = 4.0;
const treatmentTime = 60.0; // mean time in minutes
const patientsPerDay = 150 // mean
const MeanArrival = 24 * 60 / patientsPerDay; // In minutes. Minutes in a day = 24 x 60
const triageTime = 5.0; // mean time in minutes
// const Seed = 1234.0; No currently used. Default seed is based upon machine date and time
const Simtime = 24 * 60; // Duration of simulation in minutes. Currenty 1 day

function edSim() 
{
// Create a new instance of simjs
    var sim = new Sim(); 
// Create a simjs statistics object for recording basic patient arrivals and departures
    var stats = new Sim.Population();
// Create a simjs "Facility" to model a single triage nurse. Patients wait if the single nurse is busy
    var triageNurse = new Sim.Facility('triageNurse');
// Create a simjs "Facility" to model a team of A&E doctors. Patients wait if all of the doctors are busy
// Allocation model is first-come-first-served. Will need to use another approach to model dealing with patients in priority order
// Will need more investigation but simjs tools such as events and messages can probably achieve this.
    var doctors = new Sim.Facility('doctors', Sim.Facility.FCFS, doctorsOnDuty);
// Create a source of random numbers. For sophisticated modelling several independent sources can be created
    var random = new Random();

// Define a simjs "Entity" to model the flow of patients.       
    var Patient = {
        start: function () {
            this.triage();

            var nextPatientAt = random.exponential (1.0 / MeanArrival); 
            this.setTimer(nextPatientAt).done(this.triage);
        },
        
        triage: function () {
            sim.log("Patient ENTER at " + this.time());
            stats.enter(this.time());
            
            this.useFacility(triageNurse, random.normal(triageTime, triageTime/2)).done(function () {
                sim.log("Patient triaged at " + this.time() + " (started at " + this.callbackData + ")");
                this.treatment();
            }).setData(this.time());
        },

        treatment: function () {
            sim.log("Patient treated at " + this.time());
            
            this.useFacility(doctors, random.normal(treatmentTime,treatmentTime/2)).done(function () {
                sim.log("Patient treated at " + this.time() + " (started at " + this.callbackData + ")");
                stats.leave(this.callbackData, this.time());
                
            }).setData(this.time());
        }
    };
        
    sim.addEntity(Patient);
    
//  Uncomment these line to display logging information
//    sim.setLogger(function (msg) {
//        document.write(msg);
//    });
    
    sim.simulate(Simtime);
    
    return [stats.durationSeries.average(),
            stats.durationSeries.deviation(),
            stats.sizeSeries.average(),
            stats.sizeSeries.deviation()];
    
}