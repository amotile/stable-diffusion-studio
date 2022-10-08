import {InputItem, ProcessingItem} from "@features/backend/shared-types";
import {Lookup} from "@features/app";
import {ConnectionStatus} from "@features/backend";
import {PotentialFrame} from "@features/generation";

export interface WorkshopState {
    workshop: {
        hover?: string
        selected?: string
        history: string[] // reference processingItem
        items: Lookup<PotentialFrame> // needs to store before we get the real one back
    }
}

export function createWorkshopState(): WorkshopState {
    return {
        workshop:{
            history: [],
            items:{}
        }
    }
}
