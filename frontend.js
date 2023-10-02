// @ts-check
import { Simulation } from './core.js';
import { Stats } from './stats.js';

document.addEventListener('DOMContentLoaded', ()=>{
    let begun = false;
    const instance = new Simulation();
    instance.options.spawnInterval = 60;
    const {height, width, boundsX, boundsY} = instance.associatedDimensions;
    // instance.onDespawn = (x)=>{console.log(x); throw new Error('dead');}
    const stats = new Stats(instance, true);
    const ageSpan = unwrap(document.querySelector('span.age'));
    const despawnAgeSpan = unwrap(document.querySelector('span.despawn-age'));
    const timeElapsedSpan = unwrap(document.querySelector('span.t'));
    const redSpan = unwrap(document.querySelector('span.red'));
    const blueSpan = unwrap(document.querySelector('span.blue'));
    const countSpan = unwrap(document.querySelector('span.count'));
    const canvas = unwrap(document.querySelector('canvas'));
    canvas.width = boundsX*3;
    canvas.height = boundsY*3;
    const ctx = unwrap(canvas.getContext('2d'));
    ctx.scale(3,3);
    drawDoor();
    
    unwrap(document.querySelector('input#scount')).addEventListener('input', ({target})=>{
        if(begun) return;
        instance.options.spawnCount = parseInt((/** @type {HTMLInputElement} */ (target)).value);
        unwrap(document.querySelector('span.scount')).innerHTML = instance.options.spawnCount.toString();
    });

    unwrap(document.querySelector('input#interval')).addEventListener('input', ({target})=>{
        if(begun) return;
        instance.options.spawnInterval = parseInt((/** @type {HTMLInputElement} */ (target)).value);
        unwrap(document.querySelector('span.interval')).innerHTML = (instance.options.spawnInterval/60).toFixed(2).toString();
    });

    unwrap(document.querySelector('input#etiquette')).addEventListener('input', ({target})=>{
        if(begun) return;
        instance.options.ettique = ((/** @type {HTMLInputElement} */ (target)).checked);
        unwrap(document.querySelector('span.etiquette')).innerHTML = instance.options.ettique.toString();
    });

    unwrap(document.querySelector('input#width')).addEventListener('input', ({target})=>{
        if(begun) return;
        instance.dimensions.vertDoorWidth = instance.dimensions.horizDoorWidth = parseInt((/** @type {HTMLInputElement} */ (target)).value);
        unwrap(document.querySelector('span.width')).innerHTML = (instance.dimensions.vertDoorWidth/10).toString();
        drawDoor();
    });
    
    unwrap(document.querySelector('input[type=submit]')).addEventListener('click', ({target})=>{
        (/** @type {HTMLInputElement} */ (target)).disabled = true;
        (/** @type {HTMLInputElement} */ (unwrap(document.querySelector('input#scount')))).disabled = true;
        (/** @type {HTMLInputElement} */ (unwrap(document.querySelector('input#interval')))).disabled = true;
        (/** @type {HTMLInputElement} */ (unwrap(document.querySelector('input#etiquette')))).disabled = true;
        (/** @type {HTMLInputElement} */ (unwrap(document.querySelector('input#width')))).disabled = true;
        begun = true;
        tick();
    })
    function tick(){
        let speed = 4;
        for(let i = 0; i<speed;i++) instance.tick();
        drawDoor();
        for(let [x, y, r, v, date, out] of instance.bubbles){
            if(out) ctx.fillStyle = "#f005";
            else ctx.fillStyle = "#00f5";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI*2);
            ctx.fill();
        }
        let results = stats.compute();
        // ctx.fillStyle="#0f0";
        // ctx.beginPath();
        // ctx.arc(results.comX, results.comY, 3, 0, Math.PI*2);
        // ctx.fill();
        if(!isNaN(results.ageAverage)) ageSpan.innerHTML = (results.ageAverage).toFixed(1).toString().padStart(5, ' ');
        despawnAgeSpan.innerHTML = (results.despawnAge).toFixed(1).toString().padStart(5, ' ');
        timeElapsedSpan.innerHTML = (instance.tickNumber/60).toFixed(1).toString().padStart(5, ' ');
        redSpan.innerHTML = (results.redCount).toString().padStart(3, '0');
        blueSpan.innerHTML = (results.blueCount).toString().padStart(3, '0');
        countSpan.innerHTML = (results.blueCount + results.redCount).toString().padStart(5, ' ');
        if(!instance.done) requestAnimationFrame(tick);
        else alert('Done!')
    }
    function drawDoor(){
        const {vertDoorBottom, vertDoorTop, horizDoorLeft, horizDoorRight} = instance.associatedDimensions;
        ctx.clearRect(0,0, boundsX, boundsY);
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(horizDoorLeft, height);
        ctx.moveTo(horizDoorRight, height);
        ctx.lineTo(width, height);
        ctx.lineTo(width, vertDoorBottom);
        ctx.moveTo(width, vertDoorTop);
        ctx.lineTo(width, 0);
        ctx.stroke();
    }
});
/** @template T @param {T} x @returns {NonNullable<T>} */
function unwrap(x){
    if(x) return x;
    else throw new Error('Undefined');
}