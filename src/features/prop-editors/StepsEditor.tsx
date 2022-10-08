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

const options = [15, 30, 50, 75, 100]

export const stepsEditor: PropEditor<string, number> = {
    component: function StepsEditor({value, set_value, enqueueVariations}) {
        return <Flex direction={"column"}>
            <Flex gap={2}>
                {options.map((o,i)=><Button key={i} onClick={()=>enqueueVariations([{steps: o}])}>{o}</Button>)}
                <Button onClick={()=>enqueueVariations(options.map(o => ({steps:o})))}>All</Button>
            </Flex>
            <Divider my={2}/>
            <NumberInput value={value} onChange={(s, n) => set_value(s)} min={0} allowMouseWheel>
                <NumberInputField/>
                <NumberInputStepper>
                    <NumberIncrementStepper/>
                    <NumberDecrementStepper/>
                </NumberInputStepper>
            </NumberInput>
        </Flex>
    },
    display: (v) => v,
    convert: (v) => parseInt(v) || 15,
    interpolate: (left, right, [frame, maxFrames]) => {
        return Math.round(left + (right - left) * frame / maxFrames);
    }
}