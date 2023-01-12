declare module ValorantPreGameMatch {
    export interface PlayerIdentity {
        Subject: string
        PlayerCardID: string
        PlayerTitleID: string
        AccountLevel: number
        PreferredLevelBorderID: string
        Incognito: boolean
        HideAccountLevel: boolean
    }

    export type WinsByTier = { [tier: number]: number }

    export interface SeasonalBadgeInfo {
        SeasonID: string
        NumberOfWins: number
        WinsByTier: WinsByTier
        Rank: number
        LeaderboardRank: number
    }

    export interface Player {
        Subject: string
        CharacterID: string
        CharacterSelectionState: string
        PregamePlayerState: string
        CompetitiveTier: number
        PlayerIdentity: PlayerIdentity
        SeasonalBadgeInfo: SeasonalBadgeInfo
        IsCaptain: boolean
    }

    export interface Team {
        TeamID: string
        Players: Player[]
    }

    export interface PlayerIdentity2 {
        Subject: string
        PlayerCardID: string
        PlayerTitleID: string
        AccountLevel: number
        PreferredLevelBorderID: string
        Incognito: boolean
        HideAccountLevel: boolean
    }

    export type WinsByTier2 = { [tier: number]: number }

    export interface SeasonalBadgeInfo2 {
        SeasonID: string
        NumberOfWins: number
        WinsByTier: WinsByTier2
        Rank: number
        LeaderboardRank: number
    }

    export interface Player2 {
        Subject: string
        CharacterID: string
        CharacterSelectionState: string
        PregamePlayerState: string
        CompetitiveTier: number
        PlayerIdentity: PlayerIdentity2
        SeasonalBadgeInfo: SeasonalBadgeInfo2
        IsCaptain: boolean
    }

    export interface AllyTeam {
        TeamID: string
        Players: Player2[]
    }

    export interface CastedVotes {}
}

interface ValorantPreGameMatch {
    ID: string
    Version: number
    Teams: ValorantPreGameMatch.Team[]
    AllyTeam: ValorantPreGameMatch.AllyTeam
    EnemyTeam?: any
    ObserverSubjects: any[]
    MatchCoaches: any[]
    EnemyTeamSize: number
    EnemyTeamLockCount: number
    PregameState: string
    LastUpdated: Date
    MapID: string
    MapSelectPool: any[]
    BannedMapIDs: any[]
    CastedVotes: ValorantPreGameMatch.CastedVotes
    MapSelectSteps: any[]
    MapSelectStep: number
    Team1: string
    GamePodID: string
    Mode: string
    VoiceSessionID: string
    MUCName: string
    QueueID: string
    ProvisioningFlowID: string
    IsRanked: boolean
    PhaseTimeRemainingNS: number
    StepTimeRemainingNS: number
    altModesFlagADA: boolean
    TournamentMetadata?: any
}
