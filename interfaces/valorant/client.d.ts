declare module ValorantInstanceClient {
    export type ListenerReady = (data: string[]) => any
    export type ListenerError = (data: number) => any
    export type ListenerFriends = (data: ValorantChatFriends.Friend[]) => any
    export type ListenerPresences = (data: ValorantChatPresences.Player[]) => any
}

interface ValorantInstanceClient {
    on(eventType: 'ready', listener: ValorantInstanceClient.ListenerReady)
    on(eventType: 'error', listener: ValorantInstanceClient.ListenerError)
    on(eventType: 'friends', listener: ValorantInstanceClient.ListenerFriends)
    on(eventType: 'presences', listener: ValorantInstanceClient.ListenerPresences)

    once(eventType: 'ready', listener: ValorantInstanceClient.ListenerReady)
    once(eventType: 'error', listener: ValorantInstanceClient.ListenerError)
    once(eventType: 'friends', listener: ValorantInstanceClient.ListenerFriends)
    once(eventType: 'presences', listener: ValorantInstanceClient.ListenerPresences)

    off(eventType: 'ready', listener: ValorantInstanceClient.ListenerReady)
    off(eventType: 'error', listener: ValorantInstanceClient.ListenerError)
    off(eventType: 'friends', listener: ValorantInstanceClient.ListenerFriends)
    off(eventType: 'presences', listener: ValorantInstanceClient.ListenerPresences)

    login(noPresences: boolean = false): Promise
}
