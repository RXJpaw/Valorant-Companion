declare module ValorantAPIContracts {
    export interface Reward {
        type: string
        uuid: string
        amount: number
        isHighlighted: boolean
    }

    export interface Level {
        reward: Reward
        xp: number
        vpCost: number
        isPurchasableWithVP: boolean
    }

    export interface FreeReward {
        type: string
        uuid: string
        amount: number
        isHighlighted: boolean
    }

    export interface Chapter {
        isEpilogue: boolean
        levels: Level[]
        freeRewards: FreeReward[]
    }

    export interface Content {
        relationType: string
        relationUuid: string
        chapters: Chapter[]
        premiumRewardScheduleUuid: string
        premiumVPCost: number
    }

    export interface Contract {
        uuid: string
        displayName: string
        displayIcon: string
        shipIt: boolean
        freeRewardScheduleUuid: string
        content: Content
        assetPath: string
    }
}

type ValorantAPIContracts = ValorantAPIContracts.Contract[]
