import {InputItem} from "@features/backend/shared-types";
import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {generateFrameId, PotentialFrame, useGeneration} from "@features/generation";
import {ProcessingItemView} from "@features/generation/GenerationItemView";
import {doLookup} from "@features/app";
import {Box, Flex} from "@chakra-ui/react";
import {WorkshopView} from "@features/workshop/WorkshopView";
import {createPotentialFrame} from "@features/playback";
import _ from "lodash";

export function enqueueWorkshopItem(input: InputItem, enqueue: (potentialFrame: PotentialFrame) => void) {
    const id = generateFrameId(input)

    updateTheStore(s => {
        s.workshop.history.push(id)
    })

    enqueue({id, input})
}

export function useWorkshop() {
    let generation = useGeneration();

    function enqueue(pots: PotentialFrame[]) {
        updateTheStore(s => {
            for (const pot of pots) {
                s.workshop.history.push(pot.id)
                s.workshop.items[pot.id] = pot
            }
        })
        generation.enqueue(pots)
    }

    return {
        genEnqueue: generation.enqueue,
        enqueue,
        enqueueVariations(baseInput: InputItem, variations: Partial<InputItem>[]) {
            let potentialFrames = variations.map(variation => {
                const newInput : InputItem = {...baseInput, ...variation} as InputItem
                const id = generateFrameId(newInput)
                return {id, input: newInput};
            });

            updateTheStore(s => {
                s.currentTab = 'workshop'
                s.workshop.selected = _.last(potentialFrames)?.id
            })
            return enqueue(potentialFrames)
        }
    }
}

export function Workshop() {

    return <WorkshopView/>

}