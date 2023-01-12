import { EventEmitter } from 'events'
const { WebSocket } = window

const Emitter = new EventEmitter()

let websocket = null as never as import('ws')
let presences = [] as ValorantChatPresences.Player[]
let friends = [] as ValorantChatFriends.Friend[]

export const connectWebSocket = (key, port, presetPresences: any[], presetFriends: any[]) => {
    friends = presetFriends
    presences = presetPresences
    websocket = new WebSocket(`wss://riot:${key}@localhost:${port}`, { rejectUnauthorized: false })

    console.debug('[val-ws]: connecting...')
    console.time('[val-ws]')

    websocket.on('open', async () => {
        await Promise.all([
            new Promise((resolve) => {
                websocket.send(JSON.stringify([5, 'OnJsonApiEvent_chat_v4_presences']), (err) => {
                    if (!err) console.debug('[val-ws] connected to presences!')
                    resolve(1)
                })
            }),
            new Promise((resolve) => {
                websocket.send(JSON.stringify([5, 'OnJsonApiEvent_chat_v3_friendrequests']), (err) => {
                    if (!err) console.debug('[val-ws] connected to friend requests!')
                    resolve(1)
                })
            }),

            new Promise((resolve) => {
                websocket.send(JSON.stringify([5, 'OnJsonApiEvent_chat_v4_friends']), (err) => {
                    if (!err) console.debug('[val-ws] connected to friends!')
                    resolve(1)
                })
            })
        ])
        console.timeEnd('[val-ws]')
    })

    websocket.on('message', (buffer) => {
        const data = buffer.toString()
        if (data === '') return

        const [code, eventName, payload] = JSON.parse(data)

        if (eventName === 'OnJsonApiEvent_chat_v4_presences') {
            const presences = payload?.data?.presences
            const eventType = payload?.eventType

            Emitter.emit('presences', processPresences(eventType, presences))
        }
        if (eventName === 'OnJsonApiEvent_chat_v3_friendrequests') {
            Emitter.emit('friendrequests', payload?.data?.requests)
        }
        if (eventName === 'OnJsonApiEvent_chat_v4_friends') {
            const friends = payload?.data?.friends
            const eventType = payload?.eventType

            Emitter.emit('friends', processFriends(eventType, friends))
        }
    })

    return {
        Client: Emitter,
        friends: friends,
        presences: presences
    }
}

const processFriends = (eventType: string, toProcessFriends: ValorantChatFriends.Friend[]): ValorantChatFriends.Friend[] => {
    toProcessFriends.forEach((friend) => {
        const index = friends.findIndex((old) => old.puuid === friend.puuid)

        if (eventType === 'Create') {
            friends.push(friend)
        }
        if (eventType === 'Update') {
            if (index === -1) {
                friends.push(friend)
            } else {
                friends[index] = friend
            }
        }
        if (eventType === 'Delete') {
            friends.splice(index, 1)
        }
    })

    return friends
}

const processPresences = (eventType: string, toProcessPresences: any[]): ValorantChatPresence[] => {
    toProcessPresences.forEach((presence) => {
        if (presence.product === 'valorant') {
            const index = presences.findIndex((old) => old.Subject === presence.puuid)

            const PRIVATE = JSON.parse(Buffer.from(presence.private, 'base64').toString('utf-8'))
            const newEntry = {
                Subject: presence.puuid,
                GameName: presence.game_name,
                TagLine: presence.game_tag,
                ...PRIVATE
            }

            if (eventType === 'Create') {
                presences.push(newEntry)
            }
            if (eventType === 'Update') {
                if (index === -1) {
                    presences.push(newEntry)
                } else {
                    presences[index] = newEntry
                }
            }
            if (eventType === 'Delete') {
                presences.splice(index, 1)
            }
        }
    })

    return presences
}
