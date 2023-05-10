declare module ValorantAPISpray {
    export interface Level {
        uuid: string
        sprayLevel: number
        displayName: string
        displayIcon: string
        assetPath: string
    }
}

interface ValorantAPISpray {
    uuid: string
    displayName: string
    category?: any
    themeUuid?: any
    displayIcon: string
    fullIcon: string
    fullTransparentIcon: string
    animationPng?: any
    animationGif?: any
    assetPath: string
    levels: ValorantAPISprays.Level[]
}
