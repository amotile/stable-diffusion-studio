import _ from "lodash";

function getPlaces(n: string){
    let index = n.indexOf('.');
    if(index<0){
        return 0
    }
    return n.length- index-1
}

function neededPlaces(n: number){
    n = Math.abs(n)
    if(n==0)
        return 0
    let places = 0
    while(n<1 && places<3){
        places++
        n*=10
    }
    return places
}

export function interpolate(left: string, right:string, [frame, maxFrames]: [number, number]){

    const l = Number(left)
    const r = Number(right)
    const diff = r-l
    let places = _.max([getPlaces(left), getPlaces(right), neededPlaces(diff/maxFrames)]);

    const blend = frame/maxFrames
    return  (l + (diff) * blend).toFixed(places);

}
