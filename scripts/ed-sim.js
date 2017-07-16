const doctorsOnDuty = 5.0;
const treatmentTime = 20.0;
const MeanArrival = 15.0;
const triageTime = 5.0;
const Seed = 1234.0;
const Simtime = 1440.0;


function edSim(
) 
{
    var sim = new Sim(); 
    var stats = new Sim.Population();
    var triageNurse = new Sim.Facility('triageNurse');
    var doctors = new Sim.Facility('doctors', Sim.Facility.FCFS, doctorsOnDuty);
    var random = new Random(Seed);
    
    var Patient = {
        start: function () {
            this.triage();
            
            var nextPatientAt = random.exponential (1.0 / MeanArrival); 
            this.setTimer(nextPatientAt).done(this.start);
        },
        
        triage: function () {
            sim.log("Patient ENTER at " + this.time());
            stats.enter(this.time());
            
            this.useFacility(triageNurse, triageTime).done(function () {
                sim.log("Patient triaged at " + this.time() + " (started at " + this.callbackData + ")");
                this.treatment();
            }).setData(this.time());
        },

        treatment: function () {
            sim.log("Patient treated at " + this.time());
            
            this.useFacility(doctors, treatmentTime).done(function () {
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