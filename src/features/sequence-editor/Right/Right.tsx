import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {useDragRef} from "@features/ui-components/useDrag";
import {
    Box, Button, ButtonGroup, Divider,
    Flex, Icon, IconButton,
    Popover,
    PopoverArrow, PopoverBody,
    PopoverContent,
    PopoverTrigger, Portal, useDisclosure, usePopper
} from "@chakra-ui/react";
import _ from "lodash";
import {PlayHead} from "@features/sequence-editor/Right/PlayHead";
import {Lookup} from "@features/app";
import {deleteKeyFrame, PropEditor, useSortedKeyFrames} from "@features/sequence-editor";
import {InputItem} from "@features/backend/shared-types";
import {createPotentialFrame} from "@features/playback";
import {useWorkshop} from "@features/workshop";
import {memo} from "react";
import {FaTrash} from "react-icons/fa";
import {IoDiceOutline, IoFlask} from "react-icons/io5";
import {TbMovie} from "react-icons/tb";
import {randomSeed} from "@features/prop-editors/SeedEditor";

const frameSize = 15

export function frameToPix(frame: number) {
    return frame * frameSize
}

export function pixToFrame(pix: number) {
    return pix / frameSize
}

const SequenceKeyFrameView = memo(({id, seqId, rowId, editor}: { seqId: string, rowId: string,  id: string, editor?: PropEditor<any, any> }) => {
    const {enqueueVariations: enqueueVariationsInWorkshop, genEnqueue: enqueueInPlayback} = useWorkshop()
    const keyFrame = useTheStore(s => s.sequenceKeyFrame[id])
    const row = useTheStore(s => s.sequenceRow[rowId])
    const {isOpen, onToggle, onClose} = useDisclosure()
    const ref = useDragRef({
        disabled: keyFrame.locked,
        onDragStart: () => {
            const start = keyFrame.frame
            return {
                onDrag: (totalX, totalY, event) => {
                    updateTheStore(s => s.sequenceKeyFrame[id].frame = Math.round(start + pixToFrame(totalX)))
                    if(Math.abs(totalY) > 150){
                        deleteKeyFrame(rowId, id)
                    }
                },
                onClick: onToggle
            }
        }
    })

    const Editor = editor!!.component


    function enqueueVariations(variations: Partial<InputItem>[] ){
        let baseFrame = createPotentialFrame(seqId, keyFrame.frame, {});
        return enqueueVariationsInWorkshop(baseFrame.input, variations)
    }

    function triggerInWorkshop(variation: any ={}){
        return enqueueVariations([variation])
    }

    function triggerInPlayback(){
        let potentialFrame = createPotentialFrame(seqId, keyFrame.frame, {});

        updateTheStore(s=>{
            s.currentTab = 'playback'
            // s.playback.selected = potentialFrame.id
        })
        return enqueueInPlayback([potentialFrame])
    }

    return <Popover isOpen={isOpen} onClose={onClose} variant={"responsive"} placement={"top"}>
        <PopoverTrigger>
            <Box onClick={onToggle} ref={ref} w={frameSize + 'px'} h={frameSize + 'px'} position={"absolute"} title={''+keyFrame.frame}
                 cursor={"ew-resize"}
                 style={{left: keyFrame.frame * frameSize, top: 0}}>
                <Box w={frameSize + 'px'} h={frameSize + 'px'} transform={"rotate(45deg) scale(0.7)"} bg={'#30b4a6'}
                     _hover={{
                         border: "2px solid white",
                         bg: "#70fce9"
                     }}

                ></Box>
            </Box>
        </PopoverTrigger>
        <Portal>
            <PopoverContent mx={3}>
                <PopoverArrow/>
                <PopoverBody >
                    <Flex alignItems={"center"} gap={5}>
                        <Box flex={1}>{row.label} @ {keyFrame.frame}</Box>
                        <ButtonGroup isAttached variant={"outline"}>
                            <IconButton icon={<Icon as={TbMovie}/>} onClick={triggerInPlayback} aria-label="" />
                            <IconButton icon={<Icon as={IoFlask}/>} onClick={()=>triggerInWorkshop()} aria-label="" />
                            <IconButton icon={<Icon as={IoDiceOutline}/>} onClick={()=>triggerInWorkshop({seed: randomSeed()})} aria-label=""/>

                        </ButtonGroup>

                        <IconButton isDisabled={row.keyFrames.length === 1} onClick={()=>deleteKeyFrame(rowId, keyFrame.id)} icon={<Icon as={FaTrash}/>} color={"red"} aria-label={""}/>


                    </Flex>
                    <Divider my={2}/>

                    <Editor
                        enqueueVariations={enqueueVariations}
                        onClose={onClose}
                        value={keyFrame.value}
                        set_value={(newV) => updateTheStore(s => s.sequenceKeyFrame[id].value = newV)}/>
                </PopoverBody>
            </PopoverContent>
        </Portal>
    </Popover>
})

const SequenceLineView = memo(({from, to}: { from: string, to: string }) => {
    const fromKeyFrame = useTheStore(s => s.sequenceKeyFrame[from])
    const toKeyFrame = useTheStore(s => s.sequenceKeyFrame[to])

    const w = toKeyFrame.frame - fromKeyFrame.frame

    const ref = useDragRef({
        onDragStart: () => {
            const startFrom = fromKeyFrame.frame
            const startTo = toKeyFrame.frame
            const toId = to

            return {
                onDrag: (totalX, totalY, event) => {
                    updateTheStore(s => {
                        if (!s.sequenceKeyFrame[from].locked)
                            s.sequenceKeyFrame[from].frame = Math.round(startFrom + pixToFrame(totalX))
                        if (!s.sequenceKeyFrame[toId].locked)
                            s.sequenceKeyFrame[toId].frame = Math.round(startTo + pixToFrame(totalX))
                    })
                }
            }
        }
    })

    const marginY = 4

    return <Box ref={ref} w={w * frameSize + 'px'} h={frameSize-marginY*2 + 'px'}
                position={"absolute"} bg={"#198576"} cursor={"ew-resize"}
                _hover={{bg: "#8cfce1"}}
                style={{left: (fromKeyFrame.frame+0.5) * frameSize, top: marginY}}
    ></Box>
})


const SequenceRowView = memo(({rowId, seqId, editors}: { seqId: string, rowId: string, editors: Lookup<PropEditor<any, any>> }) => {
    const row = useTheStore(s => s.sequenceRow[rowId])

    let sortedFrames = useSortedKeyFrames(rowId, false);
    const lastFrame =_.last(sortedFrames)?.frame||0

    const editor = editors[row.type]

    return <Box minW={(lastFrame + 30) * frameSize} h={8} pt={2}>
        <Box position={"relative"}>
            {sortedFrames.map((k, i) => sortedFrames[i + 1] &&
                <SequenceLineView key={k.id} from={k.id} to={sortedFrames[i + 1].id}/>)}

            {sortedFrames.map(k => <SequenceKeyFrameView key={k.id} seqId={seqId} rowId={rowId} id={k.id} editor={editor}/>)}

        </Box>
    </Box>

});


export const Right = memo(({trackHeight, seqId, editors}: { seqId: string, editors: Lookup<PropEditor<any, any>>, trackHeight: number }) => {
    const rows = useTheStore(s => s.sequence[seqId].rows)

    return <Flex flex={1} overflow={'auto'} direction={"column"} position={"relative"} bg={"dope_right"}>
        <Box bg={"dope_track"} h={trackHeight + 'px'}></Box>
        <Flex direction={"column"}>
            {rows.map(r => <SequenceRowView key={r} seqId={seqId} rowId={r} editors={editors}/>)}
        </Flex>
        <PlayHead id={seqId} trackHeight={trackHeight}/>
    </Flex>


})