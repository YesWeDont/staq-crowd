// @ts-check
import { writeFile } from 'fs/promises';
import { Simulation } from '../core.js';

import { Stats } from '../stats.js'
import { createInterface } from 'node:readline/promises';
process.stdout.write(' ');
const sim = new Simulation();

const rl = createInterface({input: process.stdin, output: process.stdout});
const moveUp = '\u001b[F\u001b[0K';

sim.options.spawnInterval = parseFloat(await rl.question('Ticks between each spawn (default:30) -> ')) || 30;
console.log(moveUp+'Pairs spawn every', sim.options.spawnInterval, 'ticks');

sim.options.spawnCount = parseInt(await rl.question('Number of bubble pairs to spawn (default:100) -> ')) || 100;
console.log(moveUp+'Spawning', sim.options.spawnCount, 'bubble pairs');

sim.options.ettique = (await rl.question('Ettique mode (y/N) -> ')).toLowerCase() == 'y';
console.log(moveUp+'Ettique mode', sim.options.ettique);

sim.dimensions.vertDoorWidth = sim.dimensions.horizDoorWidth = parseFloat(await rl.question('Door width (default:40): -> ')) || 40;
console.log(moveUp+'Door width', sim.dimensions.vertDoorWidth);

let outfile = `./results/x${sim.options.spawnCount}_${sim.options.spawnInterval}-tps_width-${sim.dimensions.vertDoorWidth}_${sim.options.ettique?'yes':'no'}-et_${Date.now()}.csv`;
outfile = (await rl.question(`Output file (default:'${outfile}') ->`)).trim() || outfile;
console.log(moveUp+'Writing results to\u001b[33m', outfile, '\u001b[0m');

rl.close();
console.log('Let\'s begin!');

const start = Date.now();
const stats = new Stats(sim);
const results = [];
const maxTicks = 5 * sim.options.spawnInterval*sim.options.spawnCount;

while (!sim.tick()){
    let tickNumber = sim.tickNumber;
    if(tickNumber % 40 == 0) results.push(stats.compute());
    if(tickNumber % 1000 == 0) {
        let elapsed = ((Date.now()-start)/1000).toFixed(2);
        console.log(moveUp+'t=%ds: %d ticks out of %d expected done', elapsed, tickNumber, maxTicks/5);
    }
    if(tickNumber > maxTicks) { console.log('That is taking WAYYY too long. Stopping run here...'); break; }
}
results.splice(results.length-2, 2); // last two results are faulty?

const headings = Object.keys(results[0]).join(',')+'\n';
const final = results.reduce((prev, curr)=>prev+Object.values(curr).join(',').replace(/NaN/g, '')+'\n', headings);
console.log('Writing results...');
await writeFile(outfile, final);

console.log('That took %ds', ((Date.now()-start)/1000));