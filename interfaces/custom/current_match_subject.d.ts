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
    Incognito: boolean

    EncounterAmount: number
    LastEncounter: number

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

    CompetitiveUpdates: ValorantCompetitiveUpdates.Match[]
    Triangles: { [actUuid: string]: { NameShort: string; BestRank: ValorantAPICompetitiveTiers.Tier } }

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
