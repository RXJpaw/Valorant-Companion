declare module ValorantAPICompetitiveTiers {
    export interface Tier {
        tier: number
        tierName: string
        division: string
        divisionName: string
        color: string
        backgroundColor: string
        smallIcon: string
        largeIcon: string
        rankTriangleDownIcon: string
        rankTriangleUpIcon: string
    }
}

interface ValorantAPICompetitiveTiers {
    uuid: string
    assetObjectName: string
    tiers: ValorantAPICompetitiveTiers.Tier[]
    assetPath: string
}
