import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {
    Box,
    Button,
    ButtonGroup,
    Editable,
    EditableInput,
    EditablePreview,
    Flex,
    Icon,
    IconButton
} from "@chakra-ui/react";
import _ from "lodash";
import {ProcessingItemView} from "@features/generation/GenerationItemView";
import {FaPlus, FaTrash} from "react-icons/fa";
import {BiPlus} from "react-icons/bi";
import {createSequencesState, Sequence} from "@features/sequence-editor/state";
import {uId} from "@features/app";
import {x2imageDefaults} from "@features/playback";
import {randomSeed} from "@features/prop-editors/SeedEditor";
import {deleteKeyFrame} from "@features/sequence-editor";

export function createSequence() {
    updateTheStore(s => {
        let seqId = uId();
        const seq: Sequence = s.sequence[seqId] = {
            id: seqId,
            name: 'New Sequence',
            playPosition: 0,
            rows: [],
            lastOpen: Date.now()
        }

        s.currentSequence = seqId

        function addRow(key: string, label: string, type: string, value: any) {
            const rowId = uId();
            const initialFrameId = uId();

            s.sequenceRow[rowId] = {
                id: rowId,
                key,
                label,
                type,
                keyFrames: [initialFrameId]
            }
            s.sequenceKeyFrame[initialFrameId] = {
                id: initialFrameId,
                frame: 0,
                value
            }

            seq.rows.push(rowId)
        }


        addRow('prompt', "Prompt", 'prompt', x2imageDefaults.prompt)
        addRow('negativePrompt', "Negative Prompt", 'prompt', x2imageDefaults.negativePrompt)
        addRow('seed', "Seed", 'seed', randomSeed())
        addRow('steps', "Steps", 'steps', x2imageDefaults.steps)
        addRow('cfg', "Cfg Scale", 'cfg', x2imageDefaults.cfg)
        addRow('sampler', "Sampler", 'sampler', x2imageDefaults.sampler)

    })

}


export function Sequences() {
    let sequences = useTheStore(s => _.orderBy(Object.values(s.sequence), 'lastOpen', 'desc'));
    let genPerSeq = useTheStore(s => sequences.map(seq => {
        const outputItems = s.playback.potentialFrames[seq.id]?.map(f => ({
            pot: f,
            proc: s.processingItem[s.potentialToProcessing[f.id]]
        }))?.filter(item => !!item.proc?.output) || [];

        let frames = [];
        if (outputItems.length > 0) {
            const first = outputItems[0]
            frames.push(first.pot)
            const last = _.last(outputItems) || first
            if (last !== first) {
                const mid = outputItems[Math.floor(outputItems.length / 2)]
                if (mid !== last) {
                    frames.push(mid.pot)
                }
                frames.push(last.pot)
            }
        }


        return frames;
    }));
    return <Flex flexWrap={"wrap"} alignItems={"center"} gap={2}>
        <Button onClick={createSequence}><BiPlus/></Button>
        {sequences.map((seq, i) => <Flex direction={"column"} key={seq.id} borderRadius={10 + "px"} overflow={"hidden"}
                                         minWidth={200} minHeight={160}
                                         bg={"rgb(0,0,0,0.4)"} border={"1px solid rgb(255,255,255,0.2)"}

        >
            <Box p={2}>
                <Editable value={seq.name} onChange={(e) => updateTheStore(s => s.sequence[seq.id].name = e)}>
                    <EditablePreview flex={1} w={"100%"}/>
                    <EditableInput/>
                </Editable>
            </Box>
            <Flex flex={1} bg={"rgb(0,0,0, 0.5)"} minHeight={72+'px'}>
                {genPerSeq[i].map((pot, i) => <Flex key={i} w={64 + 'px'} h={64 + 'px'}
                                                    bg={"rgb(0,0,0, 0.1)"} flexShrink={0}
                                                    justifyContent={"center"} alignItems={"center"}>
                    <ProcessingItemView pot={pot}/>
                </Flex>)}
            </Flex>

            <ButtonGroup flex={1} isAttached variant={"outline"} mb={-2}>

                <Button flex={1} borderRadius={0} onClick={() => updateTheStore(s => {
                    s.currentSequence = seq.id
                    s.currentTab = 'playback'
                })}>Edit</Button>
                <IconButton borderRadius={0} onClick={() => updateTheStore(s => {
                    delete s.sequence[seq.id]
                    if (s.currentSequence === seq.id)
                        s.currentSequence = undefined
                })} icon={<Icon as={FaTrash}/>} color={"red"} aria-label={""}/>
            </ButtonGroup>

        </Flex>)}
    </Flex>
}