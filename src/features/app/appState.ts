
type PossibleTab = 'sequences'| 'playback' | 'workshop'
export const possibleTabs : PossibleTab[] = ['sequences', 'playback', 'workshop']

export interface AppState {
    currentTab: PossibleTab
}

export function createAppState(): AppState {
    return {
        currentTab: 'sequences'
    }
}

