/* Object class which interprets a configuration profile and uses it to generate a stream of cases
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
		attribute2: valie2, //Normally the start time - in minutes from the start of the simulation
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
} */

function caseGenerator (config) {
// Definition of the generator function
	function* caseGenDef (config) {
	//If the configuration includes a list of cases then the generator will release these one by one
		if (config.cases) {
			var caseIndex = 0;
			while (caseIndex < config.cases.length) {
				yield config.cases[caseIndex++];
			}
		} else {
	//Otherwise the profile will be used to create a perpetual stream
			while (true) {
				var newCase = {};
				config.profile.forEach(function (attribute) {
					if (attribute.type === "const") {
						newCase[attribute.name] = attribute.value;
					} else {
						newCase[attribute.name] = attribute.value();
					}
				});
				yield newCase;
			}
		}
	}

// Actual generator object
	this.generator = caseGenDef(config);

// Convenient function to access the generator
	this.next = function () {
		return this.generator.next();
	};
}

module.exports = caseGenerator;
