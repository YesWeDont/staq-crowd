# staq-crowd

Simulation source & demo repo

As stated, the code used for any data generation is open-sourced, so here you are!

## Using the online demo
Hop on [this GitHub Pages site](https://yeswedont.github.io/staq-crowd), twiddle with the options and press go! No setup required.
In the visualisation, red students try to exit the building, while blue students try to enter.

## Reusing the code
*Note: Use or remixing of any code in this repo must comply with the conditions stated in the MIT Licence (./LICENSE).*
This project was written using NodeJS, so please ensure you have it installed before trying to run the backend.
First clone the repo: `git clone https://github.com/YesWeDont/staq-crowd`.

The code used for turning the statistics collector data to readable .csv files is located in `backend/index.js`. Simply run `node backend` and all the options (including output location) can be customised.
Meanwhile, the characteristic flow graphs were generated using `backend/statless.js`; run `node backend/statless` and specify the options, then the file will be outputted to `./output.csv`. Note that if the output is open in Excel, the program will fail, losing all simulation data, **so ensure that `output.csv` is closed before running the program.**

If you want to modify the code, the core API for the model is exported as named export `Simulation` in `core.js`, which may be modified to simulate different crowds, and the statistics collector API (used for the number of students vs time graphs) for the model is exported as named export `Stats` in `sim.js`.

Enjoy!