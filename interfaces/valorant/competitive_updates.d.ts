declare module ValorantCompetitiveUpdates {
    export interface Match {
        MatchID: string
        MapID: string
        SeasonID: string
        MatchStartTime: any
        TierAfterUpdate: number
        TierBeforeUpdate: number
        RankedRatingAfterUpdate: number
        RankedRatingBeforeUpdate: number
        RankedRatingEarned: number
        RankedRatingPerformanceBonus: number
        CompetitiveMovement: string
        AFKPenalty: number
    }
}

interface ValorantCompetitiveUpdates {
    Version: number
    Subject: string
    Matches: ValorantCompetitiveUpdates.Match[]
}
