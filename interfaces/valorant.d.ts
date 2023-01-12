type LogFileData = { version: any; glzServer: any; pdServer: any; sharedServer: any } | null
type AuthFileData = { client: any; PID: any; port: any; key: any; protocol: any; basic: string } | null
type GameAuthData = {
    entitlements: any
    requestURL: string
    subject: any
    accessToken: any
    exp: number
    iat: number
    platform: string
    issuer: any
    token: any
} | null
type AuthHeaders = { Authorization: string; 'X-Riot-Entitlements-JWT': any; 'X-Riot-ClientPlatform': any; 'X-Riot-ClientVersion': any; 'User-Agent': string }

interface ValorantSubjectMatchDetails {
    WinningTeam: ValorantMatchDetails.Team | null
    LosingTeam: ValorantMatchDetails.Team
    SubjectDetails: ValorantMatchDetails.Player
    SubjectStats: ValorantMatchDetails.Stats
    MapBannerURL: string
    SubjectAgentIconURL: string
    SubjectTeamWin: boolean
    GameModeIconURL: string
    RankIconURL: string
    MMRChange: number
}
interface ValorantMatchHistoryWithSubjectMatchDetails extends ValorantMatchHistory.History {
    MatchDetails: ValorantSubjectMatchDetails
}
type ValorantMatchHistoryWithSubjectMatchDetailsList = { [key: string]: ValorantMatchHistoryWithSubjectMatchDetails }
type ValorantMatchHistoryList = { [key: string]: ValorantMatchHistory.History }
type ValorantCompetitiveUpdatesList = { [key: string]: ValorantCompetitiveUpdates.Match }

interface ValorantFriendFromGnT {
    Subject: string | null
    GameName: string | null
    TagLine: string | null
}

interface ValorantFriendAndRequest extends ValorantFriendFromGnT {
    friend_request(): Promise<ValorantFriendFromGnT | null>
}

interface ValorantMatchHistoryFunctionParams {
    startIndex?: number
    endIndex?: number
    queue?: 'competitive' | 'custom' | 'deathmatch' | 'ggteam' | 'newmap' | 'onefa' | 'snowball' | 'spikerush' | 'unrated'
}
