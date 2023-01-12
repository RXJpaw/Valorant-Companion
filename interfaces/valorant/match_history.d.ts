declare module ValorantMatchHistory {
    export interface History {
        MatchID: string
        GameStartTime: any
        QueueID: string
    }
}

interface ValorantMatchHistory {
    Subject: string
    BeginIndex: number
    EndIndex: number
    Total: number
    History: ValorantMatchHistory.History[]
}
