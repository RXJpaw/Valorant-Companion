declare module ValorantWebsocketFriendRequest {
    export interface Player {
        game_name: string
        game_tag: string
        name: string
        note: string
        pid: string
        puuid: string
        region: string
        subscription: string
    }
}

type ValorantWebsocketFriendRequest = ValorantWebsocketFriendRequest.Player
