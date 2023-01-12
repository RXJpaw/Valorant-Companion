declare module ValorantChatPresences {
    export type SessionLoopState = 'MENUS' | 'PREGAME' | 'INGAME'

    export interface Player {
        Subject: string
        GameName: string
        TagLine: string
        isValid: boolean
        sessionLoopState: SessionLoopState
        partyOwnerSessionLoopState: SessionLoopState
        customGameName: string
        customGameTeam: string
        partyOwnerMatchMap: string
        partyOwnerMatchCurrentTeam: string
        partyOwnerMatchScoreAllyTeam: number
        partyOwnerMatchScoreEnemyTeam: number
        partyOwnerProvisioningFlow: string
        provisioningFlow: string
        matchMap: string
        partyId: string
        isPartyOwner: boolean
        partyState: string
        partyAccessibility: string
        maxPartySize: number
        queueId: string
        partyLFM: boolean
        partyClientVersion: string
        partySize: number
        tournamentId: string
        rosterId: string
        partyVersion: any
        queueEntryTime: string
        playerCardId: string
        playerTitleId: string
        preferredLevelBorderId: string
        accountLevel: number
        competitiveTier: number
        leaderboardPosition: number
        isIdle: boolean
    }
}

type ValorantChatPresence = ValorantChatPresences.Player
