import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {useDragRef} from "@features/ui-components/useDrag";
import {frameToPix, pixToFrame} from "@features/sequence-editor/Right/Right";
import {Box, Flex} from "@chakra-ui/react";
import {useState} from "react";


export function DragTest(){
    const [pos, set_pos] = useState(0)


    const ref = useDragRef({
        onDragStart: () => {
            const start = pos
            return {
                onDrag: (totalX, totalY, event) => {
                    set_pos(start+totalX)
                }
            }
        }
    })

    return <Box  position={"relative"}

                 pointerEvents={'none'}
    >
        <Flex position={"relative"} style={{ left: pos }}  top={0} bottom={0} ref={ref}  w={10} h={10} pointerEvents={'auto'} cursor={"resize"} bg={'#27beff'} >
        </Flex>


    </Box>

}

