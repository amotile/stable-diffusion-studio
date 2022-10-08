import {Node} from "./parser";
import _ from "lodash";

export type NodeVar = { name: string, path: string, self: string, subObj: string, subVars?: NodeVar[] }

type Tx = { key: string, full: string, vars: NodeVar[] }

export function build(nodes: Node[]): Tx {
    const res: Tx = {key: '', full: '', vars: []}


    function both(s: string) {
        res.key += s
        res.full += s
    }

    function key(s: string) {
        res.key += s
    }

    function full(s: string) {
        res.full += s
    }

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (typeof node === 'string') {
            both(node)
        } else if (node.type === 'weighted') {
            if(node.alts.length>1)
            both('{')
            let hasItems = false
            for (let j = 0; j < node.alts.length; j++) {
                const alt = node.alts[j];
                if (hasItems) {
                    both('|')
                } else {
                    hasItems = true
                }


                const a = build(alt.nodes)
                const w = build(alt.weight)
                // res.vars = [...res.vars, ...a.vars]
                key(a.key)
                full(a.full)

                let canSetWeight = false
                if (w.full) {
                    let parsed = parseFloat(w.full);
                    if (_.isNumber(parsed) && !_.isNaN(parsed))
                        canSetWeight = true
                } else {
                    canSetWeight = true
                }

                if (canSetWeight) {
                    res.vars.push({name: a.key, path: `[${i}].alts[${j}]`, self: 'weight[0]', subObj: 'nodes', subVars: a.vars})

                    if(node.alts.length>1 && w.full && w.full!=='1'){
                        full(':')
                        full(w.full)
                    }
                } else {

                    both(':')
                    both(w.full)
                }
            }
            if(node.alts.length>1)
                both('}')
        } else if (node.type === 'attention_remove') {
            both('[')
            both(build(node.nodes).full)
            both(']')
        } else if (node.type === 'attention_add') {
            const w_b= build(node.weight).full
            both('(')
            both(build(node.nodes).full)
            if(w_b){
                both(':'+w_b)
            }
            both(')')

        } else if (node.type === 'schedule') {
            const f = build(node.from).full
            const t = build(node.to).full
            const s = build(node.step).full
            both('[')
            both([f,t,s].join(':'))
            both(']')

        } else {
            both('...')
        }
    }
    return res
}