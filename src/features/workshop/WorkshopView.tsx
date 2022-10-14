import {ProcessingItemView} from "@features/generation/GenerationItemView";
import {
    Box,
    ButtonGroup, Divider,
    Flex, Icon, IconButton, Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Portal,
    Tag, useDisclosure
} from "@chakra-ui/react";
import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {deleteKeyFrame, getRowValueForFrame, useSortedKeyFrames} from "@features/sequence-editor";
import {doLookup, editors} from "@features/app";
import _, {random} from "lodash";
import {KeyFrameWidget} from "@features/sequence-editor/KeyFrameWidget";
import {InputItem} from "@features/backend/shared-types";
import {TbMovie} from "react-icons/tb";
import {IoDiceOutline, IoFlask} from "react-icons/io5";
import {FaDice, FaTrash} from "react-icons/fa";
import {useRef, useState} from "react";
import {useGeneration} from "@features/generation";
import {useWorkshop} from "@features/workshop/index";
import {randomSeed} from "@features/prop-editors/SeedEditor";
import {History} from "@features/workshop/History";
import {FieldEditor} from "@features/workshop/FieldEditor";



export function WorkshopView() {
    const {enqueueVariations} = useWorkshop()
    const sequence = useTheStore(s => s.sequence[s.currentSequence || ''])
    const rows = useTheStore(s => doLookup(sequence?.rows || [], s.sequenceRow))
    const rowLookup = _.keyBy(rows, 'key')

    const hover = useTheStore(s => s.workshop.items[s.workshop.hover || ''])
    const selected = useTheStore(s => s.workshop.items[s.workshop.selected || ''])

    const show = hover || selected

    function row(label: string, key: string) {
        let value = show.input[key as keyof InputItem];
        return sequence && <FieldEditor enqueueVariations={(variations)=>enqueueVariations(show.input, variations)} label={label} value={value} seqId={sequence.id} rowId={rowLookup[key].id}/>
    }

    return <Flex direction={"column"} gap={2}>
        <Flex minHeight={6} direction={"column"} gap={2}>
            {show && <>
                {row("Prompt", "prompt")}
                {row("- Prompt", "negativePrompt")}
            </>
            }
        </Flex>
        <Flex flex={1} gap={2}>
            <Flex direction={"column"} gap={2} minWidth={250 +"px"}>
                {show && <>
                    {row("Seed", "seed")}
                    {row("Steps", "steps")}
                    {row("Cfg Scale", "cfg")}
                    {row("Sampler", "sampler")}
                </>}
            </Flex>
            <Flex style={{width: 512, height: 512}} bg={"rgb(0,0,0, 0.1)"} alignItems={"center"} justifyContent={"center"}>
                {show && <ProcessingItemView pot={show}/>}
            </Flex>
            <Box flex={1}>
            <History/>
            </Box>

        </Flex>

    </Flex>

}