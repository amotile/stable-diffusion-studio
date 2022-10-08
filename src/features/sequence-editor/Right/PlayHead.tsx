import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {useDragRef} from "@features/ui-components/useDrag";
import {Box, Flex} from "@chakra-ui/react";
import {frameToPix, pixToFrame} from "@features/sequence-editor/Right/Right";

export function PlayHead({ id, trackHeight }: { id: string, trackHeight: number }) {
    const sequence = useTheStore(s => s.sequence[id])

    const ref = useDragRef({
        onDragStart: () => {
            const start = sequence.playPosition
            return {
                onDrag: (totalX, totalY, event) => {
                    updateTheStore(s => s.sequence[id].playPosition = Math.max(0, Math.round(start + pixToFrame(totalX))))
                }
            }
        }
    })

    return <Flex direction={"column"} position={"absolute"} alignItems={"center"} top={0} bottom={0}
                 style={{ left: frameToPix(sequence.playPosition) }}
                 pointerEvents={'none'}
    >
        <Flex ref={ref}  w={frameToPix(1) + 'px'} h={trackHeight + 'px'} pointerEvents={'auto'} justifyContent={"center"} cursor={"ew-resize"} >
            <Box bg={'#27beff'} w={frameToPix(0.5) + 'px'} h={trackHeight + 'px'}></Box>
        </Flex>
        <Box flex={1} bg={'#27beff'} w={1 + 'px'}/>
        <Box fontSize={"small"} top={0 + "px"} position={"absolute"} left={frameToPix(1)+10+'px'}>{sequence.playPosition.toFixed(0)}</Box>

    </Flex>
}