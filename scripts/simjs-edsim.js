// If in node.js then load modules
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	var Sim = require ("./sim-0.26.js").Sim;
	var Random = require("./sim-0.26.js").Random;
}

// Extend simjs priority queue so that we can use it for other purposes
// "afterfunction" needs to take two parameters, o1 and o2, which will be Request objects in the queue and return true if o1 should be processed after o2
// The Request objects will have a number of properties which can be used in the "afterFunction"
//  - an "order" property which tracks the order objects were added to the queue
//  - a "scheduledAt" property which records the time when the request was queued
//  - an "entity" property which is the Entity which this request is for
class edSimQ extends Sim.PQueue {
  constructor(afterFunction) {
    super();
    this.greater = afterFunction;
  }

  empty() {
	return this.data.length == 0;
  }
}

Sim.edSimQ = edSimQ;

//A variant of FCFS scheduling which will cope with changes to the number of servers
Sim.Facility.prototype.useEdSim = function (duration, ro) {

	if ( (this.maxqlen === 0 && !this.free)
	 		|| (this.maxqlen > 0 && this.queue.size() >= this.maxqlen)) {
		ro.msg = -1;
		ro.deliverAt = ro.entity.time();
		ro.entity.sim.queue.insert(ro);
		return;
	}
	
	ro.duration = duration;
	var now = ro.entity.time();
	this.stats.enter(now);
	this.queue.insert(ro);
	this.useEdSimSchedule(now); //Use the new scheduling function
};

//A variant of FCFS scheduling which will cope with changes to the number of servers
Sim.Facility.prototype.useEdSimSchedule = function (timestamp) {
	
	while (this.free > 0 && !this.queue.empty()) {
		var ro = this.queue.remove(); // TODO
		if (ro.cancelled) {
			continue;
		}
		for (var i = 0; i < this.freeServers.length; i++) {
			if (this.freeServers[i]) {
				this.freeServers[i] = false;
				ro.msg = i;
				break;
			};
		}

		this.free --;
		this.busyDuration += ro.duration;
		
		// cancel all other reneging requests
		ro.cancelRenegeClauses();
		
		var newro = new Sim.Request(this, timestamp, timestamp + ro.duration);
		newro.done(this.useEdSimCallback, this, ro); //Use the new callback function

		ro.entity.sim.queue.insert(newro);
	}
};

//A variant of FCFS scheduling which will cope with changes to the number of servers
Sim.Facility.prototype.useEdSimCallback = function (ro) {
	// One server has just become free but we may need to give it up if a request has been made to reduce the number of servers
	if (this.targetServers) {
		if (this.targetServers < this.servers) {
			// We have more servers than requested so give up this server
			this.servers --;
		} else {
			// We don't need to reduce servers so we can give this one to the free pool
			this.free ++;
		}
	} else {
	// There is no target set for this Facility so carry on as normal
	 this.free ++;
	}
	// Mark this server in the pool as free in case we add servers later on in the simulation
	this.freeServers[ro.msg] = true;

	this.stats.leave(ro.scheduledAt, ro.entity.time());
	
	// if there is someone waiting, schedule it now
	this.useEdSimSchedule(ro.entity.time());
	
	// restore the deliver function, and deliver
	ro.deliver();	
};

//Utility function to convert a FCFS Facility into a special edSimjs Facility
// "afterfunction" needs to take two parameters, o1 and o2, which will be Request objects in the queue and return true if o1 should be processed after o2
// The Request objects will have a number of properties which can be used in the "afterFunction"
//  - an "order" property which tracks the order objects were added to the queue
//  - a "scheduledAt" property which records the time when the request was queued
//  - an "entity" property which is the Entity which this request is for
Sim.Facility.prototype.makeEdSim = function (afterfunction) {
	// Switch from the standard function to our special edSimjs variant
	this.use = this.useEdSim;
	// Set the target number of servers to the current value
	this.targetServers = this.servers;
	this.queue = new  edSimQ (afterfunction);
};

//Utility function to add additional servers to an existing Facility during the simulation.
//This should be called from within an Entity prototype so that the current time can be provided
Sim.Facility.prototype.addServers = function (newServers, timestamp) {
	//Increase the targetted number of servers by the desired amount
	this.targetServers+=newServers;
	//Check if new servers are needed as we may not have reached the previous target following earlier changes
	if (this.servers < this.targetServers) {
		//Make all the new servers we need available and free
		this.free += this.targetServers - this.servers;
		this.servers = this.targetServers;
	}
	//Add new spaces in the server pool array if we don't already have enough
	for (var i = this.freeServers.length; i < this.targetServers; i++) {
		this.freeServers.push(true);
	}
	//Since we may have new servers we can check if there is work in the queue that can be scheduled
	this.useEdSimSchedule(timestamp);
};

//Utilty function to remove servers from an existing Facility during the simulation
//This should be called from within an Entity prototype
Sim.Facility.prototype.removeServers = function (surplusServers) {
	//Number of servers to remove cannot be more than the current target amount
	if (surplusServers > this.targetServers) {
		surplusServers = this.targetServers;
	}
	//Reduce the target by the desired amount
	this.targetServers-=surplusServers;
	//Calculate how many we actually need to remove as we may not have reached the previous target following earlier changes
	var excessServers = this.servers - this.targetServers;
	if (excessServers > 0) {
		//We need to remove servers so see if any are free
		if (this.free < excessServers) {
			//Some servers are free so take them out of the free pool
			this.servers-= this.free;
			this.free = 0;
		} else {
			//Lots of servers are free so just remove the amount we need and leave the others free
			this.free-= excessServers;
			this.servers-= excessServers;
		}
	}
};