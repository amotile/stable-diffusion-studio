import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {Box, Button, Flex, Progress, Textarea} from "@chakra-ui/react";
import {PotentialFrame, useGeneration} from "@features/generation";
import _ from "lodash";
import shallow from "zustand/shallow";
import {memo, useState} from "react";

export const PotentialFramesTools = memo(({seqId}: { seqId: string }) => {

    // import REACT_APP_HTTP_URL from ".env";
    const HTTP_URL = String(process.env.REACT_APP_HTTP_URL)

    let {enqueue, collectImages} = useGeneration();
    let potentialFrames = useTheStore(s => s.playback.potentialFrames[seqId] || []);
    let processing = useTheStore(s => potentialFrames.map(pot => s.processingItem[s.potentialToProcessing[pot.id]]), shallow)
    let [save_folder, set_save_folder] = useState("")
    let [isCollecting, set_isCollecting] = useState(false)


    async function add(count: number) {
        const picks: { index: number, pot: PotentialFrame }[] = []
        const blocked: any[] = [...processing]
        for (let c = 0; c < count; c++) {
            const candidates: { weight: number, index: number, pot: PotentialFrame }[] = []
            potentialFrames.forEach((pot, i) => {
                if (!blocked[i]) {
                    let weight = 0
                    for (let j = 0; j < potentialFrames.length; j++){
                        const otherFrameBlocked = blocked[j];
                        if(otherFrameBlocked){
                            const dist = Math.abs(i-j)
                            const distInv = potentialFrames.length-dist
                            weight += Math.pow(2, distInv)
                        }
                    }

                    candidates.push({weight, pot, index: i})
                }
            })

            let ordered = _.orderBy(candidates, 'weight', 'asc');
            let picked = ordered[0];
            if (!picked)
                break;
            blocked[picked.index] = true
            picks.push(picked)
        }
        await enqueue(picks.map(x => x.pot))
    }

    const files :string[] = potentialFrames.map((pot, i) => {
        const p = processing[i]
        return p?.output?.result
    }).filter(p=>p) as string[]


    return <Flex direction={"column"} gap={2} p={2}>
        <Flex gap={1}>
            <Button onClick={() => add(1)}>1</Button>
            <Button onClick={() => add(2)}>2</Button>
            <Button onClick={() => add(3)}>3</Button>
            <Button onClick={() => add(5)}>5</Button>
            <Button onClick={() => add(10)}>10</Button>
            <Button onClick={() => add(100000)}>All</Button>
        </Flex>
        <Flex flexWrap={"wrap"}>
            {potentialFrames.map((pot, i) => {
                let color = "#999"
                const p = processing[i]
                if (p?.error) {
                    color = "#ff1e61"
                } else if (p?.output) {
                    color = "#aaff5b"
                } else if (p?.processing) {
                    color = "#5becff"
                } else if (p) {
                    color = "#ffa35b"
                }
                return <Box
                    cursor={"pointer"}
                    onMouseOver={()=>updateTheStore(s=>s.playback.hovered = pot.id)}
                    onMouseOut={()=>updateTheStore(s=>s.playback.hovered = undefined)}
                    onClick={()=>updateTheStore(s=>s.sequence[s.currentSequence!].playPosition = i)}

                    key={i} w={"20px"} h={"20px"} m={"1px"} bg={color}/>
            })}

        </Flex>
        <Flex alignItems={"center"} gap={2}>
            <Button onClick={async () => {
                try{
                    set_isCollecting(true)
                    const x = await collectImages(files)
                    console.log(x)
                    set_save_folder(x.folder)

                } finally {
                    set_isCollecting(false)
                }
            }
            }>Collect Images ({files.length})</Button>
            {save_folder}
        </Flex>
        <a href={HTTP_URL + '/getZip'}>Download</a>
        {isCollecting && <Progress size={"sm"} w={"100%"} isIndeterminate/>}


    </Flex>
})