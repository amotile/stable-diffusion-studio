import {PropEditor} from "@features/sequence-editor";
import {
    Box,
    Button, Flex,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper
} from "@chakra-ui/react";
import {build} from "@features/prop-editors/prompt-parsing/build";
import {parse} from "@features/prop-editors/prompt-parsing/parser";
import {merge} from "@features/prop-editors/prompt-parsing/merge";
import {randomSeed} from "@features/prop-editors/SeedEditor";
import {JSONTree} from "react-json-tree";
import _ from "lodash";
import {ParsedWeightEditor} from "@features/prop-editors/ParsedWeightEditor";

export const promptEditor: PropEditor<string,string> = {
    component: function PromptEditor({value, set_value, enqueueVariations}) {
        return <Flex gap={2} direction={"column"}>
            <Input minWidth={ 80 + "vw"} value={value} onChange={(e) => set_value(e.target.value)}/>
            <ParsedWeightEditor value={value} set_value={set_value}/>
        </Flex>


    },
    display: (v) => "",
    convert: v=>v,
    interpolate: (left, right, blend) => {
        debugger
        const result = merge(left, right, blend).result
        return result
    }
}