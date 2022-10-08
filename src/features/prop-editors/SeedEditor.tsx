import {PropEditor} from "@features/sequence-editor";
import {
    Box,
    Button,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper
} from "@chakra-ui/react";
import {interpolate} from "./places";
import {enqueueWorkshopItem} from "@features/workshop";
import {ParsedWeightEditor} from "@features/prop-editors/ParsedWeightEditor";


export function randomSeed(): string {
    return '' + Math.floor(Math.random() * 4294967296)
}

interface WeightedSeed {
    seed: string,
    weight: string
}
function parse(seedString: string) : WeightedSeed[]{
    const result : WeightedSeed[] = []
    for (const string of seedString.split(',')) {
        const parts = string.split(':')
        const seed = parts[0]
        if(seed?.length>0){
            result.push({seed, weight: parts[1] || '1'})
        }
    }
    return result
}

export const seedEditor: PropEditor<string,string> = {
    component: function SeedEditor({value, set_value, enqueueVariations}) {
        return <Box>
            <Input value={value} onChange={(e)=>set_value(e.target.value)}/>
            {/*<ParsedWeightEditor value={'{' + value + '}'} set_value={(newV)=>set_value(newV.substring(1, newV.length-1))}/>*/}
        </Box>
    },
    display: (v) => "",
    convert: v=>v,
    interpolate: (left, right, blend) => {
        let l = parse(left);
        let r = parse(right);

        let res = []

        for (const rSeed of r) {
            const lSeedIndex = l.findIndex(lSeed => lSeed.seed == rSeed.seed)
            if(lSeedIndex>=0){
                const lSeed = r.splice(lSeedIndex,1)[0]
                res.push({seed: rSeed.seed, weight: interpolate(lSeed.weight, rSeed.weight, blend)})
            }else
                res.push({seed: rSeed.seed, weight: interpolate("0", rSeed.weight, blend)})
        }

        for (const lSeed of l) {
            res.push({seed: lSeed.seed, weight: interpolate(lSeed.weight, "0", blend)})
        }

        return res.map(r => {
            let str = r.seed
            if(r.weight!=='1')
                str+=':'+r.weight
            return str
        }).join(", ")
    }
}