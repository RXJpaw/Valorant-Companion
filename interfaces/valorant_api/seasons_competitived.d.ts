declare module ValorantAPICompetitiveSeason {
    export interface Border {
        uuid: string
        level: number
        winsRequired: number
        displayIcon: string
        smallIcon: string
        assetPath: string
    }
}

interface ValorantAPICompetitiveSeason {
    uuid: string
    startTime: Date
    endTime: Date
    seasonUuid: string
    competitiveTiersUuid: string
    borders: ValorantAPICompetitiveSeason.Border[]
    assetPath: string
}
