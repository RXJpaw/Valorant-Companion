interface UnloadedCurrentMatchSubject {
    Subject: string | null
    TeamID: string | null
    loaded: false
}

interface LoadedCurrentMatchSubject {
    AgentIconURL: string
    PlayerCardURL: string
    LevelBorderURL: string
    HasFistBumpBuddy: boolean
    HasPresence: boolean

    Buddies: (string | null)[]
    SkinChromas: (string | null)[]

    LowestRankIconURL: string
    LowestRankName: string
    LowestRank: ValorantAPICompetitiveTiers.Tier
    CurrentRankIconURL: string
    CurrentRankName: string
    CurrentRank: ValorantAPICompetitiveTiers.Tier
    CurrentRR: number
    HighestRankIconURL: string
    HighestRankName: string
    HighestRank: ValorantAPICompetitiveTiers.Tier

    Level: number
    TagLine: string
    GameName: string

    Subject: string
    PartyID: number
    TeamID: any

    loaded: true
    index: number
}

type CurrentMatchSubject = UnloadedCurrentMatchSubject | LoadedCurrentMatchSubject
