// deprecated file to merge multiple .csv files created by backend/index.js together.
// @ts-check

import { readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';

const rl = createInterface(process.stdin, process.stdout);
const filePaths = [];

while(true){
    const newFile = (await rl.question('Enter path for a new input file (leave blank to end input): ')).trim();
    if(newFile == '.' || !newFile) break;
    else filePaths.push(newFile);
}

if(!filePaths.length) throw new Error('No inputs provided!');
const files = await Promise.all(filePaths.map(async file=>{
    const contents = (await readFile(file)).toString();
    return contents.replace(/\u000d/g,'').split('\n').map((a, i)=>a.split(',').map(n=>i==0?n:parseFloat(n)));
}));
const newFile = [files[0][0]];
const maxRows = maxLength(files);
for(let i = 1; i < maxRows; i++){
    let rows = files.map(file=>file[i] || []);
    let rowLength = maxLength(rows);
    let newRow = new Array(rowLength);
    for(let rowIndex = 0; rowIndex < rowLength; rowIndex++){
        let sum=0, numberCount = 0;
        for(let fileNumber = 0; fileNumber < rows.length; fileNumber++){
            let curr = rows[fileNumber][rowIndex];
            if(typeof curr === 'number' && !isNaN(curr)){
                numberCount += 1;
                sum += curr;
            }
        }
        newRow[rowIndex] = sum/numberCount;
    }
    newFile.push(newRow);
}
let newStr = newFile.map(row=>row.join(',')).join('\n').replace(/NaN/g, '');
let outFile = filePaths[0].replace(/_\d+.csv$/,'.csv');
outFile = await rl.question(`Outfile (default: ${outFile}): `) || outFile;
rl.close();
await writeFile(outFile, newStr);
/** @param {any[][]} arrs */
function maxLength(arrs){
    return arrs.reduce((prevMax, curr)=>prevMax < curr.length?curr.length:prevMax, 0);
}