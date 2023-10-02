// @ts-check

function randRange(min, max){return min + (max-min)*Math.random();}
function clamp(val, min, max){ return val<min?min:val>max?max:val }
/** @typedef {[number, number, number, number, number, boolean]} Bubble x y r v time goingOut */
export class Simulation{
    /** @type {Bubble[]} */
    bubbles = [];
    done = false;
    /** @type {(bubble: Bubble)=>void} */
    onDespawn = ()=>{};
    options = {
        subTickCount: 8,
        spawnInterval: 30,
        spawnCount: 100,
        ettique: false,
        despawnBounds: 1.5
    };

    dimensions = {
        height: 150,
        width: 150,
        vertDoorWidth: 40,
        horizDoorWidth: 40,
    };

    tickNumber = 0;
    // bubblesGone = 0;

    reset(){ this.bubbles = []; return this; }

    get associatedDimensions(){
        let {height, width, vertDoorWidth, horizDoorWidth} = this.dimensions;

        return {
            height, width,
            vertDoorTop: (height - vertDoorWidth)/2,
            vertDoorBottom: (height + vertDoorWidth)/2,
            horizDoorLeft: (width - horizDoorWidth)/2,
            horizDoorRight: (width + horizDoorWidth)/2,
            boundsX: width * this.options.despawnBounds,
            boundsY: height * this.options.despawnBounds,
        }
    }

    tick(){
        // let {
        //     height, width,
        //     vertDoorTop, vertDoorBottom,
        //     horizDoorLeft, horizDoorRight,
        //     boundsX, boundsY
        // } = this.associatedDimensions,
            
        //     tickNumber = this.tickNumber,
        //     ettique = this.options.ettique,
        //     spawnInterval = this.options.spawnInterval;

        // if(this.bubblesGone == this.options.spawnCount) { this.done = true; return true;}
        // if(tickNumber % spawnInterval == 0){
        //     this.bubbles.push([boundsX, randRange(0, height), randRange(4, 6), randRange(12, 16), 0, true]);
        //     this.bubbles.push([randRange(0, width), boundsY, randRange(4, 6), randRange(12, 16), 0, false]);
        // }

        let {
            height, width,
            vertDoorTop, vertDoorBottom,
            horizDoorLeft, horizDoorRight,
            boundsX, boundsY
        } = this.associatedDimensions,
            
            tickNumber = this.tickNumber,
            ettique = this.options.ettique,
            spawnInterval = this.options.spawnInterval,
            ticksNeeded = this.options.spawnCount * spawnInterval;

        if(tickNumber % spawnInterval == 0 && tickNumber < ticksNeeded){
            this.bubbles.push([boundsX, randRange(0, height), randRange(4, 6), randRange(12, 16), 0, true]);
            this.bubbles.push([randRange(0, width), boundsY, randRange(4, 6), randRange(12, 16), 0, false]);
        }
        if(this.bubbles.length == 0 && tickNumber >= ticksNeeded){
            this.done = true;
            return true;
        }
        this.tickNumber = tickNumber+1;
        
        tick: for(let i = 0; i < this.options.subTickCount; i++){
            /** @type {Bubble[]} */
            let newBubbles = [];
            // Natural movement
            moving: for(let [x, y, r, v, time, out] of this.bubbles){
                // find target
                let destX, destY;
                if(out){
                    if(x > width){ // in RC, try to head toward foyer exit door directly
                        destX = width-r;
                        // if(ettique) destY = vertDoorBottom - r;
                        // else{
                        //     let yCoordOnDoor = y-(x-width)/(x-horizDoorRight)*(y-height);
                        //     if((yCoordOnDoor > vertDoorTop+r) && (yCoordOnDoor < vertDoorBottom - r)) destY = yCoordOnDoor; // head directly there
                        //     else destY = clamp(y, vertDoorTop+r, vertDoorBottom-r); // meanie strat kicks in
                        // }
                        destY = ettique ? vertDoorBottom - r : clamp(y, vertDoorTop + r, vertDoorBottom - r);
                    } else if(y < height) { // foyer
                        destX = ettique ? horizDoorRight - r : clamp(x, horizDoorLeft + r, horizDoorRight - r);
                        destY = height + r;
                    } else if(y < boundsY) {
                        destX = x;
                        destY = boundsY*2; // move out as far as possible
                    } else { // despawn hooks
                        this.onDespawn([x, y, r, v, time, out]);
                        // this.bubblesGone++;
                        continue moving;
                    }
                } else{
                    if(y > height){ // outside RC, head towards doors
                        destY = height-r;
                        // if(ettique) destX = vertDoorBottom - r;
                        // else{
                        //     let xCoordOnDoor = x-(y-height)/(y-vertDoorBottom)*(x-width);
                        //     if((xCoordOnDoor > horizDoorLeft+r) && (xCoordOnDoor < horizDoorRight - r)) destX = xCoordOnDoor; // head directly there
                        //     else destX = clamp(x, horizDoorLeft+r, horizDoorRight-r); // meanie strat kicks in
                        // }
                        destX = ettique ? horizDoorLeft + r : clamp(x, horizDoorLeft + r, horizDoorRight - r);
                    } else if(x < width){ // foyer
                        destX = width + r;
                        destY = ettique ? vertDoorTop + r : clamp(y, vertDoorTop + r, vertDoorBottom - r);
                    } else if(x < boundsX) {
                        destX = boundsX*2; // move out as far as possible
                        destY = y;
                    } else {// despawn hooks
                        this.onDespawn([x, y, r, v, time, out]);
                        // this.bubblesGone++;
                        continue moving
                    }
                }
                // newBubbles.push([x, y, r, v, time, out]);
                // move towards target
                let coverable = v/this.options.subTickCount/60;
                let dx = destX - x, dy = destY - y;
                let d = Math.hypot(dx, dy);
                if(d < coverable) newBubbles.push([destX, destY, r, v, time, out]);
                let dx2 = dx/d*coverable, dy2 = dy/d*coverable;
                newBubbles.push([x+dx2, y+dy2, r, v, time, out]);
            }

            let len = newBubbles.length;

            // if(len){
            //     let comX=0, comY=0;
            //     for(let j=0; j<len;j++){ comX += newBubbles[j][0]; comY += newBubbles[j][1]; }
            //     comX/=len; comY/=len;
            //     comRepel: for(let i = 0, [x, y]=newBubbles[i];i<len; i++){
            //         let dx = x-comX, dy=y-comY;
            //         if(dx==0 && dy ==0) continue comRepel;;
            //         let dist = Math.hypot(dx, dy);
            //         newBubbles[i][0] += dx/dist/this.options.subTickCount/5;
            //         newBubbles[i][1] += dy/dist/this.options.subTickCount/5;
            //     }
            // }


            // anti-collision
            /** @type {[number, number][]} */
            const bubbleInfulences = new Array(len).fill([0, 0]);
            collision: for(let i = 0; i < len; i++){
                let bubble1 = newBubbles[i],
                    [x1, y1, r1] = bubble1;
                if(isNaN(x1) || isNaN(y1)) continue;
                if(i != len-1)
                    pairwise: for(let j = i; j < len; j++){
                        let [x2, y2, r2] = newBubbles[j];
                        if(isNaN(x2) || isNaN(y2)) continue;
                        let combinedRad = r1+r2;
                        let distX = x1-x2;
                        let distY = y1-y2;
                        if((distX == 0 || distY == 0) || (distX > combinedRad) || (distY > combinedRad)) continue pairwise;
                        let distSqr = distX*distX + distY * distY;
                        if(distSqr > combinedRad * combinedRad) continue pairwise;
                        let dist = Math.sqrt(distSqr);
                        let toMove = dist - combinedRad;
                        let dx = distX/dist*toMove*0.1;
                        let dy = distY/dist*toMove*0.1;
                        bubbleInfulences[i] = [bubbleInfulences[i][0]-dx, bubbleInfulences[i][1]-dy];
                        bubbleInfulences[j] = [bubbleInfulences[j][0]+dx, bubbleInfulences[j][1]+dy];
                    }
                let collidedXWise = true, collidedYWise = true;
                // wall collision
                if(!(y1 < vertDoorBottom && y1 > vertDoorTop)){
                    if(x1 > width && x1 < (width + r1)) x1 = (width + r1);
                    else if(x1 < width && x1 > (width - r1)) x1 = (width - r1);
                    else collidedXWise = false;
                } else collidedXWise = false;
                if(!(x1 < horizDoorRight && x1 > horizDoorLeft)){
                    if(y1 > height && y1 < (height + r1)) y1 = (height + r1);
                    else if(y1 < height && y1 > (height - r1)) y1 = (height - r1);
                    else collidedYWise = false;
                } else collidedYWise = false;
                //apply influences
                if(!collidedXWise) x1 += bubbleInfulences[i][0];
                if(!collidedYWise) y1 += bubbleInfulences[i][1];
                newBubbles[i][0] = x1;
                newBubbles[i][1] = y1;
            }
            // and we're done!
            this.bubbles = newBubbles;
        }
        this.bubbles.forEach((bubble)=>bubble[4]+=1/60);
        return false;
    }
}