# ed-sim-js

A&E simulation based upon [simjs](simjs.com)

sim-0.26.js is a modified download from the simjs site. Only changes are the addition of these two lines at the end to expose the simulator and random classes to node.js

```
module.exports.Random = Random;
module.exports.Sim = Sim;
```

Download or clone the repository files and then the simulation can be run without any server - just launch index.html in a browser.

Scripts can be run directly with:

```
$ node <script file name.js>
```

Master pushed to github will appear at [https://ed-sim.github.io/ed-sim-js/index.html](https://ed-sim.github.io/ed-sim-js/index.html)

## Development in progress

- Structure to define cases which can be generated using stocastic functions or from actual historical records. See case.js

- Case generator using stocastic functions to generate artificial, but realistic demand. See genCases.js and case.js

- Case reader to load historic records into a format to be used in a simulation. Not yet done. Can be a simple JSON file load

- Structure to define staff and facilities so medical teams and facilities can be generated or loaded from historical records

- Staff and facilities generator to manage available resources in a simulation

- Rota reader to load historic records into a format to be used in a simulation

- Flexible simulation core using case, staff and facility profiles