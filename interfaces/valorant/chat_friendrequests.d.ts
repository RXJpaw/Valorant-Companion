declare module ValorantChatFriendRequests {
    export interface Request {
        gameName: string
        note: string
        puuid: string
        subscription: string
        tagLine: string
    }
}

interface ValorantChatFriendRequests {
    requests: ValorantChatFriendRequests.Request[]
}
