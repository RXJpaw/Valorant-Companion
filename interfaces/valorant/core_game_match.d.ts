declare module ValorantCoreGameMatch {
    export interface ConnectionDetails {
        GameServerHosts: string[]
        GameServerHost: string
        GameServerPort: number
        GameServerObfuscatedIP: number
        GameClientHash: number
        PlayerKey: string
    }

    export interface PlayerIdentity {
        Subject: string
        PlayerCardID: string
        PlayerTitleID: string
        AccountLevel: number
        PreferredLevelBorderID: string
        Incognito: boolean
        HideAccountLevel: boolean
    }

    export interface WinsByTier {
        3: number
        4: number
        5?: number
        0?: number
    }

    export interface SeasonalBadgeInfo {
        SeasonID: string
        NumberOfWins: number
        WinsByTier: WinsByTier
        Rank: number
        LeaderboardRank: number
    }

    export interface Player {
        Subject: string
        TeamID: string
        CharacterID: string
        PlayerIdentity: PlayerIdentity
        SeasonalBadgeInfo: SeasonalBadgeInfo
        IsCoach: boolean
        IsAssociated: boolean
    }

    export interface MatchmakingData {
        QueueID: string
        IsRanked: boolean
    }
}

interface ValorantCoreGameMatch {
    MatchID: string
    Version: number
    State: string
    MapID: string
    ModeID: string
    ProvisioningFlow: string
    GamePodID: string
    AllMUCName: string
    TeamMUCName: string
    TeamVoiceID: string
    IsReconnectable: boolean
    ConnectionDetails: ValorantCoreGameMatch.ConnectionDetails
    PostGameDetails?: any
    Players: ValorantCoreGameMatch.Player[]
    MatchmakingData: ValorantCoreGameMatch.MatchmakingData
}
