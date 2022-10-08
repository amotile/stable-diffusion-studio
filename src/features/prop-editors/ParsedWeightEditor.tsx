import {JSONTree} from "react-json-tree";
import {
    Box,
    Flex, Grid, GridItem,
    Input, NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper
} from "@chakra-ui/react";
import _ from "lodash";
import {build, NodeVar} from "@features/prop-editors/prompt-parsing/build";
import {parse} from "@features/prop-editors/prompt-parsing/parser";
import {useRef, useState} from "react";

function VarEditor({ v, obj, set_obj, indent }: { indent: number, obj: any, v: NodeVar, set_obj: (obj: any) => void }) {
    let wPath = v.path + '.' + v.self;
    const realW = _.get(obj, wPath)
    let subObjPath = v.path + '.' + v.subObj;
    const subObj = _.get(obj, subObjPath)
    const [value, set_value] = useState(realW)
    const wRef = useRef(realW)
    if(wRef.current !== realW){
        wRef.current = realW
        setTimeout(()=>set_value(realW),0)
    }


    function setTheValue(newS: string, newN: number) {
        wRef.current = newS
        set_value(newS)
        if (!_.isNaN(newN)) {
            set_obj(_.set(obj, wPath, newS))
        }

    }

    return <>
        <GridItem alignSelf={"center"} pl={indent*20+ 'px'}> {v.name}</GridItem>
        <GridItem>
            <NumberInput value={value} onChange={setTheValue} min={0} allowMouseWheel width={"100px"}>
                <NumberInputField/>
                <NumberInputStepper>
                    <NumberIncrementStepper/>
                    <NumberDecrementStepper/>
                </NumberInputStepper>
            </NumberInput>
        </GridItem>
        {v.subVars?.map(sv => <VarEditor key={sv.path} indent={indent+1} obj={subObj} v={sv}
                                         set_obj={(newSubObj) => set_obj(_.set(obj, subObjPath, newSubObj))}/>)}

        </>
}

export function ParsedWeightEditor({ value, set_value }: { value: string, set_value: (newV: string) => void }) {
    // <JSONTree data={data}/>
    // <JSONTree data={built}/>
    let data = parse(value);
    let built = build(data);

    if(built.vars.length <= 1)
        return <></>
    return <Grid templateColumns={'auto 1fr'} gap={2} bg={"rgb(0,0,0,0.2)"} p={2} borderRadius={10} border={"1px solid black"} maxHeight={220+'px'} overflow={"auto"}>
        {built.vars.map(v => {
            return <VarEditor key={v.path} obj={data} v={v} set_obj={(newObj) => set_value(build(newObj).full)} indent={0}/>
        })}
    </Grid>
}