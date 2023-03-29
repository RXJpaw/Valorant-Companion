declare module ValorantAccountXp {
    export interface Progress {
        Level: number
        XP: number
    }
    export interface HistoryStartProgress {
        Level: number
        XP: number
    }
    export interface HistoryEndProgress {
        Level: number
        XP: number
    }
    export interface HistoryXPSources {
        ID: string
        Amount: number
    }
    export interface History {
        ID: string
        MatchStart: string
        StartProgress: HistoryStartProgress
        EndProgress: HistoryEndProgress
        XPDelta: number
        XPSources: HistoryXPSources[]
        XPMultipliers: any[]
    }
}

interface ValorantAccountXp {
    Version: number
    Subject: string
    Progress: ValorantAccountXp.Progress
    History: ValorantAccountXp.History
    LastTimeGrantedFirstWin: string
    NextTimeFirstWinAvailable: string
}
