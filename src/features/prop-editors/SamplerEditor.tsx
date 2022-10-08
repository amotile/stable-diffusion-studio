import {PropEditor} from "@features/sequence-editor";
import {
    Button, Divider, Flex,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper
} from "@chakra-ui/react";
import {merge} from "@features/prop-editors/prompt-parsing/merge";
import {Sampler} from "@features/backend/shared-types";

export const samplers = ['Euler a', 'Euler', 'LMS', 'Heun', 'DPM2', 'DPM2 a', 'DDIM', 'PLMS']
export const samplerEditor: PropEditor<string,string> = {
    component: function SamplerEditor({value, set_value, onClose, enqueueVariations}) {
        return <Flex direction={"column"}>
            <Flex gap={2}>
                <Button onClick={()=>enqueueVariations(samplers.map(o => ({sampler:(o as Sampler)})))}>All</Button>
            </Flex>
            <Divider my={2}/>
            <Flex gap={2}>
            {samplers.map((option) => (
                <Button variant={value===option?"solid":"outline"} key={option} onClick={() => {
                    set_value(option)
                    onClose && onClose()
                }}>
                    {option}
                </Button>
            ))}
        </Flex>
        </Flex>
    },
    display: (v) => v,
    convert: v=>v,
    interpolate: (left, right, blend) => {
        return left
    }
}