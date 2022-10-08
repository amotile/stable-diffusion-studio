import React, {memo} from "react";
import {Box, Button, Flex, Icon, Tab, TabList, TabPanel, TabPanels, Tabs} from "@chakra-ui/react";
import SequenceEditor, {
    PropEditor,
} from "@features/sequence-editor";
import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {Sequence} from "@features/sequence-editor/state";
import {cfgEditor} from "@features/prop-editors/CfgEditor";
import {stepsEditor} from "@features/prop-editors/StepsEditor";
import {FrameViewer, x2imageDefaults} from "@features/playback";
import {promptEditor} from "@features/prop-editors/PromptEditor";
import {SequenceHeader} from "@features/app/SequenceHeader";
import {useGeneration} from "@features/generation";
import {randomSeed, seedEditor} from "@features/prop-editors/SeedEditor";
import {samplerEditor} from "@features/prop-editors/SamplerEditor";
import {Workshop} from "@features/workshop";
import {possibleTabs} from "@features/app/appState";
import {Sequences} from "@features/sequences";
import {GiAnvilImpact} from "react-icons/gi";
import {IoFlask} from "react-icons/io5";
import {TbMovie} from "react-icons/tb";
import {IoMdFiling} from "react-icons/io";
import {ConnectionBox} from "@features/app/ConnectionBox";


export type Lookup<T> = Record<string, T>

export function uId(): string {
    return Math.random().toString(36).substring(2)
}
export function doLookup<T>(ids: string[], lookup: Lookup<T>): T[] {
    return ids.map(id => lookup[id])
}



export const editors: Lookup<PropEditor<any,any>> = {
    steps: stepsEditor,
    cfg: cfgEditor,
    prompt: promptEditor,
    seed: seedEditor,
    sampler: samplerEditor,
}


export default memo(function App() {
    let {status} = useGeneration();
    const sequenceId = useTheStore(s => s.currentSequence)
    const currentTab = useTheStore(s => s.currentTab)



    return <Flex direction={"column"} height={"100vh"} position={"relative"}>
        {/*<DragTest/>*/}
        <ConnectionBox/>
        {/*<Box bg={"red"} position={"absolute"} right={0} top={0}>*/}
        {/*    {status}*/}


        {/*    Above content*/}
        {/*    <Button onClick={() => {*/}
        {/*        localStorage.setItem("stored", "{}")*/}
        {/*        location.reload();*/}
        {/*    }*/}
        {/*    }>Clear local_storage and reload</Button>*/}
        {/*    /!*<Button onClick={() => {*!/*/}
        {/*    /!*    backendConnection.txt2img("test" + Math.random(), {...x2imgDefault, seed: '1234'})*!/*/}
        {/*    /!*}*!/*/}
        {/*    /!*}>generate</Button>*!/*/}
        {/*</Box>*/}
        <Tabs flex={1} index={possibleTabs.indexOf(currentTab)} onChange={(newTab)=>updateTheStore(s => s.currentTab = possibleTabs[newTab])}>
            <TabList>
                <Tab><Icon as={IoMdFiling} mr={3}/>Sequences</Tab>
                <Tab><Icon as={TbMovie} mr={3}/> Playback</Tab>
                <Tab><Icon as={IoFlask} mr={3}/> Workshop</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <Sequences/>
                </TabPanel>
                <TabPanel  p={0}>
                    {sequenceId && <FrameViewer seqId={sequenceId}/>}
                </TabPanel>
                <TabPanel>
                    <Workshop/>
                </TabPanel>
            </TabPanels>
        </Tabs>
        <Box flexShrink={0}  color={"#ccc"}>
            {sequenceId && <SequenceHeader id={sequenceId} editors={editors}/>}
            {sequenceId && <SequenceEditor id={sequenceId} editors={editors}/>}
        </Box>
    </Flex>
})
