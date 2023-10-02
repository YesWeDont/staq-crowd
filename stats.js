// @ts-check
export class Stats{
    #despawned = [];
    #despawnAge = 0.0;
    instance;
    /** @param {import('./core.js').Simulation} instance*/
    constructor(instance, cacheDespawnAge=false){
        this.instance = instance;
        instance.onDespawn = decorate(instance.onDespawn, this._despawnHook.bind(this));
        this.cacheDespawnAge = cacheDespawnAge;
    }
    _despawnHook(bub){ this.#despawned.push(bub); }
    compute(){
        let len = this.instance.bubbles.length;
        let ageSum = 0;
        this.instance.bubbles.forEach(([x, y, r, v, age])=>ageSum += age);
        let _despawnAge = this.#despawned.reduce((prev, curr)=>prev+curr[4], 0)/this.#despawned.length;
        if(!this.cacheDespawnAge || !isNaN(_despawnAge)) this.#despawnAge = _despawnAge;
        let redCount = this.instance.bubbles.reduce((prev, curr)=>curr[5]?prev+1:prev, 0);
        let blueCount = len - redCount;
        this.#despawned = [];

        // let comX=0, comY=0;
        // for(let j=0; j<len;j++){ comX += this.instance.bubbles[j][0]; comY += this.instance.bubbles[j][1]; }
        // comX/=len; comY/=len;

        return {
            time: this.instance.tickNumber,
            despawnAge: this.#despawnAge,
            ageAverage: ageSum/len,
            redCount, blueCount,
            // comX, comY
        };
    }
}
function decorate(init, add){
    return function(){
        init(...arguments);
        add(...arguments);
    }
}