declare module ValorantAPIBuddy {
    export interface Level {
        uuid: string
        charmLevel: number
        displayName: string
        displayIcon: string
        assetPath: string
    }
}

interface ValorantAPIBuddy {
    uuid: string
    displayName: string
    isHiddenIfNotOwned: boolean
    themeUuid: string
    displayIcon: string
    assetPath: string
    levels: ValorantAPIBuddy.Level[]
}
