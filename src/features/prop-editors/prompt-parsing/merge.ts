import {AttentionAddNode, Node, parse, ScheduleNode, WeightAlt, WeightedNode} from "./parser";
import {build} from "./build";
import _ from "lodash";
import {interpolate} from "../places";
import {throws} from "assert";

// import deepFreeze from "deep-freeze-strict";


export function merge(left: string, right: string, weight: [number, number]) {
    const l_nodes = parse(left)
    const r_nodes = parse(right)

    function wrap(nodes: Node[]): [WeightedNode] {
        return [{type: "weighted", alts: [{nodes, weight: []}]}]
    }

    // let ins = {l_nodes, r_nodes};
    // const stored = _.cloneDeep(ins)

    let nodes = mergeNodes(wrap(l_nodes), wrap(r_nodes), weight)!!;
    // let nodes = mergeNodes(deepFreeze(wrap(l_nodes)), deepFreeze(wrap(r_nodes)), weight)!!;
    // if (!_.isEqual(ins, stored)) {
    //     require('fs-extra').outputJSONSync(__dirname + '/test/a.json', ins, {spaces: 2})
    //     require('fs-extra').outputJSONSync(__dirname + '/test/b.json', stored, {spaces: 2})
    //     throw Error("Touched input")
    // }
    if (nodes.length === 1) {
        const n = nodes[0]
        if (typeof (n) !== 'string' && n.type === 'weighted' && n.alts.length === 1)
            nodes = n.alts[0].nodes
    }
    return {result: build(nodes).full, nodes}
}


function mergeInto(alt: WeightAlt, targets: WeightAlt[], weight: [number, number], onMerged: (nodes: Node[], targetIndex: number) => void): boolean {
    for (let tI = 0; tI < targets.length; tI++) {
        const target = targets[tI];
        try {
            const merged = mergeNodes(target.nodes, alt.nodes, weight)

            onMerged(merged, tI)
            return true
        } catch (e: any) {
        }
    }
    return false
}


function getV(nodes: Node[]) {
    let stringV = build(nodes).full || '1';
    let number = parseFloat(stringV)
    if (!_.isNaN(number)) {
        return stringV
    }
    throw Error("Unknown value")
}

function getW(alt: WeightAlt | AttentionAddNode) {
    return getV(alt.weight)
}

function getS(node: ScheduleNode) {
    return getV(node.step)
}

function add(left: string, right: string, weight: [number, number]) {
    return '' + (parseFloat(left) + parseFloat(right) * weight[0] / weight[1])
}

function failMerge(){
    throw Error("can't merge")
}
function mergeNodes(left: Node[], right: Node[], weight: [number, number]): Node[] {
    const result: Node[] = []
    for (let nI = 0; nI < left.length; nI++) {
        const l = left[nI];
        const r = right[nI];
        if (typeof l !== 'string' && typeof r !== 'string') {
            if (l.type === 'weighted' && r.type === l.type) {
                const leftRemains: WeightAlt[] = [...l.alts]
                const allMerged: WeightAlt[] = []
                const missed: WeightAlt[] = []

                for (const rAlt of r.alts) {
                    const rightW = getW(rAlt)
                    // if (mergeInto(rAlt, allMerged, weight, (merged, i) => {
                    //     allMerged[i].nodes = merged
                    //     allMerged[i].weight = [add(getW(allMerged[i]), getW(rAlt), weight)]
                    // })) {
                    //     // merged with already merged nodes
                    // } else
                    if (mergeInto(rAlt, leftRemains, weight, (merged, i) => {
                        const mergedAlt = leftRemains.splice(i, 1)[0];

                        const newW = interpolate(getW(mergedAlt), rightW, weight)
                        allMerged.push({nodes: merged, weight: [newW]})
                    })) {
                        // merged with unmerged left nodes
                    } else {
                        missed.push({...rAlt, weight: [interpolate("0", rightW, weight)]})
                    }
                }
                for (const lAlt of leftRemains) {
                    if (mergeInto(lAlt, allMerged, weight, (merged, i) => {
                        allMerged[i].nodes = merged
                    })) {
                        // merged with already merged nodes
                    } else {
                        missed.unshift({...lAlt, weight: [interpolate(getW(lAlt), "0", weight)]})
                    }
                }
                for (const alt of missed) {
                    allMerged.push(alt)
                }
                result.push({type: "weighted", alts: allMerged})
            } else if (l.type === 'attention_add' && r.type === l.type) {
                const l_b = build(l.nodes).full
                const r_b = build(r.nodes).full
                if (l_b === r_b) {
                    const newW = interpolate(getW(l), getW(r), weight)
                    result.push({type: 'attention_add', nodes: l.nodes, weight: ['' + newW]})
                } else
                    failMerge()
            } else if (l.type === 'schedule' && r.type === l.type) {
                const l_b = build(l.from).full + build(l.to).full
                const r_b = build(r.from).full + build(r.to).full
                if (l_b === r_b) {
                    const newS = interpolate(getS(l), getS(r), weight)
                    result.push({type: 'schedule', from: l.from, to: r.to, step: ['' + newS]})
                } else
                    failMerge()


            } else {
                const l_b = build([l]).full
                const r_b = build([r]).full
                if (l_b === r_b)
                    result.push(l_b)
                else
                    failMerge()
            }
        } else if (l === r) {
            result.push(l)
        } else failMerge()
    }

    return result
}
