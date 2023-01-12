declare module ValorantMMR {
    export type WinsByTier = { [tier: number]: number } | null

    export interface SeasonalInfo {
        SeasonID: string
        NumberOfWins: number
        NumberOfWinsWithPlacements: number
        NumberOfGames: number
        Rank: number
        CapstoneWins: number
        LeaderboardRank: number
        CompetitiveTier: number
        RankedRating: number
        WinsByTier: WinsByTier
        GamesNeededForRating: number
        TotalWinsNeededForRank: number
    }

    export type SeasonalInfoBySeasonID = { [season_id: string]: SeasonalInfo }

    export interface Competitive {
        TotalGamesNeededForRating: number
        TotalGamesNeededForLeaderboard: number
        CurrentSeasonGamesNeededForRating: number
        SeasonalInfoBySeasonID: SeasonalInfoBySeasonID
    }
    export interface Custom {
        TotalGamesNeededForRating: number
        TotalGamesNeededForLeaderboard: number
        CurrentSeasonGamesNeededForRating: number
        SeasonalInfoBySeasonID: SeasonalInfoBySeasonID
    }

    export interface Deathmatch {
        TotalGamesNeededForRating: number
        TotalGamesNeededForLeaderboard: number
        CurrentSeasonGamesNeededForRating: number
        SeasonalInfoBySeasonID: SeasonalInfoBySeasonID
    }

    export interface Ggteam {
        TotalGamesNeededForRating: number
        TotalGamesNeededForLeaderboard: number
        CurrentSeasonGamesNeededForRating: number
        SeasonalInfoBySeasonID: SeasonalInfoBySeasonID
    }

    export interface Newmap {
        TotalGamesNeededForRating: number
        TotalGamesNeededForLeaderboard: number
        CurrentSeasonGamesNeededForRating: number
        SeasonalInfoBySeasonID: SeasonalInfoBySeasonID
    }

    export interface Onefa {
        TotalGamesNeededForRating: number
        TotalGamesNeededForLeaderboard: number
        CurrentSeasonGamesNeededForRating: number
        SeasonalInfoBySeasonID: SeasonalInfoBySeasonID
    }

    export interface Seeding {
        TotalGamesNeededForRating: number
        TotalGamesNeededForLeaderboard: number
        CurrentSeasonGamesNeededForRating: number
        SeasonalInfoBySeasonID: SeasonalInfoBySeasonID
    }

    export interface Snowball {
        TotalGamesNeededForRating: number
        TotalGamesNeededForLeaderboard: number
        CurrentSeasonGamesNeededForRating: number
        SeasonalInfoBySeasonID: SeasonalInfoBySeasonID
    }

    export interface Spikerush {
        TotalGamesNeededForRating: number
        TotalGamesNeededForLeaderboard: number
        CurrentSeasonGamesNeededForRating: number
        SeasonalInfoBySeasonID: SeasonalInfoBySeasonID
    }

    export interface Unrated {
        TotalGamesNeededForRating: number
        TotalGamesNeededForLeaderboard: number
        CurrentSeasonGamesNeededForRating: number
        SeasonalInfoBySeasonID: SeasonalInfoBySeasonID
    }

    export interface QueueSkills {
        competitive: Competitive
        custom: Custom
        deathmatch: Deathmatch
        ggteam: Ggteam
        newmap: Newmap
        onefa: Onefa
        seeding: Seeding
        snowball: Snowball
        spikerush: Spikerush
        unrated: Unrated
    }

    export interface LatestCompetitiveUpdate {
        MatchID: string
        MapID: string
        SeasonID: string
        MatchStartTime: number
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

interface ValorantMMR {
    Version: number
    Subject: string
    NewPlayerExperienceFinished: boolean
    QueueSkills: ValorantMMR.QueueSkills
    LatestCompetitiveUpdate: ValorantMMR.LatestCompetitiveUpdate
    IsLeaderboardAnonymized: boolean
    IsActRankBadgeHidden: boolean
}
