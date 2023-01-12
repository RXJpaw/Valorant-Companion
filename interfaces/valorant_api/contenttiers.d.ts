declare module ValorantAPIContentTiers {
    export interface ContentTier {
        uuid: string
        displayName: string
        devName: string
        rank: number
        juiceValue: number
        juiceCost: number
        highlightColor: string
        displayIcon: string
        assetPath: string
    }
}

type ValorantAPIContentTiers = ValorantAPIContentTiers.ContentTier[]
