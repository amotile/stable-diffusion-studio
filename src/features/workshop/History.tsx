

import {Box, Button, Flex, Text} from "@chakra-ui/react";
import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {ProcessingItemView} from "@features/generation/GenerationItemView";
import {doLookup} from "@features/app";

export function History(){
    const workshopHistory = useTheStore(s => doLookup(s.workshop.history, s.workshop.items).reverse())
    const hover = useTheStore(s => s.workshop.items[s.workshop.hover || ''])
    const selected = useTheStore(s => s.workshop.items[s.workshop.selected || ''])
    const c = "rgb(0,0,0,0.5)"
    const s = "2xs"
    return <Flex flexWrap={"wrap"}>
        {workshopHistory.map(h => {
            let border = '1px solid black'
            if (hover?.id === h.id)
                border = "1px solid #1B5169"
            if (selected?.id === h.id){
                border = "1px solid #16d3ff"
                // if (hover?.id === h.id)
                //     border = "1px solid #36f3ff"
            }



            const bSize= 100
            return <Flex
                pr={4+"px"} pb={4+"px"}
                style={{width: bSize+4, height: bSize+4}}
                onMouseOver={() => updateTheStore(s => s.workshop.hover = h.id)}
                onMouseOut={() => updateTheStore(s => s.workshop.hover = undefined)}
                onClick={() => updateTheStore(s => s.workshop.selected = h.id)}
                cursor={"pointer"}>
                <Flex flex={1} bg={"rgb(0,0,0, 0.1)"} border={border} alignItems={"center"} justifyContent={"center"} position={"relative"}>
                     <Box position={"absolute"} top={0} left={0} bg={c} color={"white"} p={1}
                          fontSize={s}>{false ? `img2img (${0})` : 'txt2img'}</Box>
                     <Box position={"absolute"} top={0} right={0} bg={c} color={"white"} p={1}
                         fontSize={s}>{h.input.steps}</Box>
                     <Box position={"absolute"} bottom={0} left={0} bg={c} color={"white"} p={1}
                          fontSize={s}>{h.input.cfg}</Box>
                     <Box position={"absolute"} bottom={0} right={0} bg={c} color={"white"} p={1}
                          fontSize={s}>{h.input.sampler}</Box>
                    <ProcessingItemView pot={h}/>
                </Flex>

            </Flex>
        })}
        {workshopHistory.length > 0 && <Flex direction={"column"} justifyContent={"center"} gap={1} bg={c} w={100} p={2} borderRadius={7} mb={1}>
            <Text fontSize={"small"}>Clear</Text>
            <Button size={"xs"} onClick={()=>updateTheStore(s=>{
                s.workshop.history = s.workshop.history.filter(h => !s.processingItem[s.potentialToProcessing[h]]?.error)
            })}>Failed</Button>
            <Button size={"xs"} onClick={()=>updateTheStore(s=>{
                s.workshop.history = []
                s.workshop.hover = undefined
                s.workshop.selected = undefined
            })}>All</Button>

        </Flex>}
    </Flex>
}