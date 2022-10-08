import {PropEditor} from "@features/sequence-editor";
import {
    Button, Divider,
    Flex,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper
} from "@chakra-ui/react";
import _ from "lodash";
import {interpolate} from "@features/prop-editors/places";

const options = ['2', '5', '7', '10', '12', '15']


export const cfgEditor: PropEditor<string, string> = {
    component: function CfgEditor({value, set_value, enqueueVariations}) {
        return <Flex direction={"column"}>
            <Flex gap={2}>
                {options.map((o, i) => <Button key={i} onClick={() => enqueueVariations([{cfg: o}])}>{o}</Button>)}
                <Button onClick={() => enqueueVariations(options.map(o => ({cfg: o})))}>All</Button>
            </Flex>
            <Divider my={2}/>
            <NumberInput value={value} onChange={(e, n) => set_value(e)} min={1} max={15} step={0.5} allowMouseWheel>
                <NumberInputField/>
                <NumberInputStepper>
                    <NumberIncrementStepper/>
                    <NumberDecrementStepper/>
                </NumberInputStepper>
            </NumberInput>
        </Flex>
    },
    display: (v) => v,
    convert: (v) => v,
    interpolate: interpolate
}