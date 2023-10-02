// @ts-check
import { writeFile } from 'fs/promises';
import { Simulation } from '../core.js';

import { Stats } from '../stats.js'
import { createInterface } from 'node:readline/promises';
import { writeFileSync } from 'fs';
process.stdout.write(' ');
const options = {};

const rl = createInterface({input: process.stdin, output: process.stdout});
const moveUp = '\u001b[F\u001b[0K';

//options.spawnInterval = parseFloat(await rl.question('Ticks between each spawn (default:30) -> ')) || 30;
//console.log(moveUp+'Pairs spawn every', options.spawnInterval, 'ticks');

options.spawnCount = parseInt(await rl.question('Number of bubble pairs to spawn (default:100) -> ')) || 100;
console.log(moveUp+'Spawning', options.spawnCount, 'bubble pairs');

options.ettique = (await rl.question('Ettique mode (y/N) -> ')).toLowerCase() == 'y';
console.log(moveUp+'Ettique mode', options.ettique);

const doorWidth = parseFloat(await rl.question('Door width (default:40): -> ')) || 40;
console.log(moveUp+'Door width', doorWidth);

rl.close();
console.log('Let\'s begin!');

// let data = [];
let output = "";
const start = Date.now();
tick: for(let spawnInterval = 10; spawnInterval <= 90; spawnInterval+=10){    
    let tries = 0;
    output += spawnInterval;
    test: while(tries < 10){
        const sim = new Simulation();
        sim.options = {...sim.options, ...options};
        sim.options.spawnInterval = spawnInterval;
        sim.dimensions.horizDoorWidth = sim.dimensions.vertDoorWidth = doorWidth;
        const maxTicks = 3 * options.spawnInterval*options.spawnCount;
        
        while (!sim.tick()){
            if(sim.tickNumber > maxTicks) { console.log('t=%ds: Run %s took too long, resetting...', (Date.now()-start)/1000, tries); continue test; }
            if(sim.bubbles.reduce((p, a)=>p+a[4], 0)/sim.bubbles.length > 200) { console.log('t=%ds: Bubbles too old, resetting run %d...', (Date.now()-start)/1000, tries); continue test; }
        }
        // data.push(sim.tickNumber);
        tries++;
        console.log('t=%ds spawnFreq=%d: trial %d done', (Date.now()-start)/1000, spawnInterval, tries);
        output += "," + sim.tickNumber;
    }
    output += "\n";
}
writeFileSync("output.csv", output);