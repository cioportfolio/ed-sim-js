function edSim(
        doctorsOnDuty, 
        treatmentTime, 
        MeanArrival, 
        triageTime, 
        Seed, 
        Simtime) 
{
    var sim = new Sim(); 
    var stats = new Sim.Population();
    var triageNurse = new Sim.Facility('triageNurse');
    var doctors = new Sim.Buffer('doctors', doctorsOnDuty);
    var random = new Random(Seed);
    
    var Patient = {
        start: function () {
            this.order();
            
            var nextPatientAt = random.exponential (1.0 / MeanArrival); 
            this.setTimer(nextPatientAt).done(this.start);
        },
        
        order: function () {
            sim.log("Patient ENTER at " + this.time());
            stats.enter(this.time());
            
            this.getBuffer(doctors, 1).done(function () {
                sim.log("Patient at triageNurse " + this.time() + " (entered at " + this.callbackData + ")");
                var serviceTime = random.exponential(1.0 / triageTime);
                this.useFacility(triageNurse, serviceTime).done(function () {
                    sim.log("Patient LEAVE at " + this.time() + " (entered at " + this.callbackData + ")");
                    stats.leave(this.callbackData, this.time());
                }).setData(this.callbackData);
            }).setData(this.time());
        }
    };
    
    var Doctor = {
        start: function () {
            this.putBuffer(doctors, doctorsOnDuty - doctors.current());
            this.setTimer(treatmentTime).done(this.start);
        }
    };
    
    sim.addEntity(Patient);
    sim.addEntity(Doctor);
    
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