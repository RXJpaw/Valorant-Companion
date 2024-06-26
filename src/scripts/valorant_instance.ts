import { DivisionOrder, fetchGameAuthData, fetchHelp, getAuthFileData, getHeaders, getLogFileData } from './valorant'
import { EncounterHistory, RiotIdHistory, sleep } from '@/scripts/methods'
import ENTITLEMENTS from '@/assets/valorant_api/entitlements.json'
import { connectWebSocket } from '@/scripts/valorant_websocket'
import * as ValorantAPI from '@/scripts/valorant_api'
import PersistentCache from './cache_manager'
import { EventEmitter } from 'events'
import Pako from 'pako'

const Emitter = new EventEmitter()

const connection = {
    pid: null as number | null, //VALORANT PID
    auth: null as never as AuthFileData,
    server: null as never as LogFileData,
    token: null as never as GameAuthData,
    websocket: null as never as EventEmitter,
    presences: [] as ValorantChatPresences.Player[],
    friends: [] as ValorantChatFriends.Friend[],
    ready: false as never as number | any[],
    hadFirstPresences: false as boolean,
    reset() {
        connection.websocket?.removeAllListeners()

        connection.pid = null
        connection.auth = null
        connection.server = null
        connection.token = null
        connection.websocket = <never>null
        connection.presences = []
        connection.friends = []
        connection.ready = 0
        connection.hadFirstPresences = false

        Emitter.emit('presences', connection.presences, 'reset')

        Cache.ContentServiceContent = undefined
        Cache.CoreGameMatch = {}
        Cache.CoreGameLoadouts = {}
        Cache.PreGameMatch = {}
        Cache.PreGameLoadouts = {}

        Cache.SelfLoadout = undefined
        Cache.AccountXP = undefined

        Cache.Seasons = ValorantAPI.getSeasons()
        Cache.LevelBorders = ValorantAPI.getLevelBorders()
        Cache.CompetitiveTiers = ValorantAPI.getCompetitiveTiers()
        Cache.CompetitiveSeasons = ValorantAPI.getCompetitiveSeasons()
    }
}

const Cache = {
    CoreGameMatch: {} as { [id: string]: Promise<ValorantCoreGameMatch> | undefined },
    CoreGameLoadouts: {} as { [id: string]: Promise<ValorantCoreGameLoadouts> | undefined },
    PreGameMatch: {} as { [id: string]: Promise<ValorantPreGameMatch> | undefined },
    PreGameLoadouts: {} as { [id: string]: Promise<ValorantPreGameLoadouts> | undefined },
    // NameService: {} as { [id: string]: ValorantNameService },
    // MMR: {} as { [id: string]: Promise<ValorantMMR> | undefined },

    ContentServiceContent: undefined as Promise<ValorantContentServiceContent> | undefined,
    SelfLoadout: undefined as Promise<ValorantPersonalizationPlayerLoadout> | undefined,
    AccountXP: undefined as Promise<ValorantAccountXp> | undefined,

    Seasons: ValorantAPI.getSeasons(),
    LevelBorders: ValorantAPI.getLevelBorders(),
    CompetitiveTiers: ValorantAPI.getCompetitiveTiers(),
    CompetitiveSeasons: ValorantAPI.getCompetitiveSeasons()
}

const connect = async () => {
    let { pid, auth, server, token } = connection
    let refreshed = <string[]>[]

    if (!pid) {
        const Console = await window.exec('tasklist /FI "IMAGENAME eq VALORANT.exe" | findstr /I /C:"VALORANT.exe"', true)
        if (!Console) return -1

        const PIDMatch = Console.match(/VALORANT\.exe.*?(\d+)/)
        if (!PIDMatch) return -11

        const PID = Number(PIDMatch[1])
        if (!PID) return -12

        pid = PID

        refreshed.push('pid')
    }

    if (!window.isRunning(pid)) {
        connection.reset()
        return -2
    }

    if (!auth) {
        auth = getAuthFileData()
        if (!auth) return 0
        refreshed.push('auth')
    }

    if (!window.isRunning(auth.PID)) {
        connection.reset()
        return -3
    }

    if (!server) {
        server = getLogFileData()
        if (!server) return 1
        refreshed.push('server')
        console.debug('help', await fetchHelp(auth.port, auth.basic))
    }
    if (!token || token.exp - Date.now() < 30000) {
        token = await fetchGameAuthData(auth.port, auth.basic)
        if (!token) return 2
        refreshed.push('token')
    }

    connection.pid = pid
    connection.auth = auth
    connection.server = server
    connection.token = token

    if (refreshed.includes('token')) {
        console.debug(`entitlement token will be refreshed in ${((token.exp - Date.now()) / 60000).toFixed(1)} minutes`)
    }
    if (refreshed.includes('auth')) {
        const Valorant = ValorantInstance()

        const websocket = connectWebSocket(auth.key, auth.port, await Valorant.getChatPresences(), await Valorant.getFriendList())

        connection.websocket = websocket.Client
        connection.presences = websocket.presences
        connection.friends = websocket.friends

        Emitter.emit('presences', connection.presences, 'auth')
        connection.hadFirstPresences = true

        connection.websocket.on('presences', (presences, eventType, affected) => {
            Emitter.emit('presences', presences, eventType, affected)
            connection.presences = presences
        })
        connection.websocket.on('friends', (data) => {
            Emitter.emit('friends', data)
            connection.friends = data
        })
        connection.websocket.on('friendrequests', (data) => {
            Emitter.emit('friendrequests', data)
        })
    }
    if (refreshed.includes('pid')) {
        console.debug('VALORANT running with PID', pid)
    }

    return refreshed
}

let isLoginLoopRunning = false
const login = async (noPresences: boolean | null = false, instanceId?: string) => {
    if (!isLoginLoopRunning) {
        isLoginLoopRunning = true

        connection.ready = await connect()
        setInterval(async () => {
            connection.ready = await connect()
            await login(true)
        }, 2000)
    }

    const result = connection.ready
    if (typeof result === 'number') Emitter.emit('error', result)
    if (typeof result === 'object') Emitter.emit('ready', result)

    if (!noPresences) Emitter.emit('presences', connection.presences, 'login', instanceId)
    if (!noPresences) Emitter.emit('friends', connection.friends, 'login', instanceId)

    return result
}

export const ValorantInstance = () => {
    const request = async (
        method: string,
        valorant_server: 'local' | 'pd' | 'glz' | 'shared' | 'custom',
        path: string,
        body?: any
    ): Promise<object | any | null> => {
        const { server, token, auth } = connection

        if (typeof (await connect()) !== 'object') return null

        let requestURL: string

        switch (valorant_server) {
            case 'local': {
                requestURL = token!.requestURL
                break
            }
            case 'pd': {
                requestURL = server!.pdServer
                break
            }
            case 'glz': {
                requestURL = server!.glzServer
                break
            }
            case 'shared': {
                requestURL = server!.sharedServer
                break
            }
            case 'custom': {
                requestURL = ''
                break
            }
        }

        const headers = valorant_server === 'local' ? { Authorization: `Basic ${auth!.basic}` } : getHeaders(connection.token, connection.server!.version)

        if (body) headers['Content-Type'] = 'application/json'

        const do_request = () => {
            return fetch(requestURL + path, {
                method: method.toUpperCase(),
                headers: headers,
                body: JSON.stringify(body)
            })
        }

        let request = await do_request()

        //Handling rare Rate Limitations. This happens... whenever idk, never probably.
        if (request.status === 429) {
            const retry_after = Number(request.headers.get('retry-after'))
            await sleep(retry_after * 1000 || 60000)

            request = await do_request()
        }

        //Not handling errors on request.json() because errors shouldn't be handled here.
        return request.headers.get('content-length') === '0' || request.status === 204 ? {} : await request.json()
    }

    const getServers = () => {
        const pd = connection.server?.pdServer || null
        const glz = connection.server?.glzServer || null
        const shared = connection.server?.sharedServer || null

        return pd && glz && shared ? { pd, glz, shared } : null
    }

    const getChatPresences = async (): Promise<ValorantChatPresence[]> => {
        const { presences: chatPresences } = await request('get', 'local', '/chat/v4/presences')

        if (chatPresences instanceof Array) {
            return chatPresences
                .filter((presence) => presence.product === 'valorant')
                .map((presence) => {
                    const PRIVATE = JSON.parse(Buffer.from(presence.private, 'base64').toString('utf-8'))

                    return {
                        Subject: presence.puuid,
                        GameName: presence.game_name,
                        TagLine: presence.game_tag,
                        ...PRIVATE
                    }
                })
        }

        return []
    }

    const getKnownRiotIDs = () => {
        const Presences = getCachePresences()
        const FriendList = getCacheFriends()

        const PresencesRiotIDs = Presences.map((presence) => `${presence.GameName}#${presence.TagLine}`)
        const FriendListRiotIDs = FriendList.map((friend) => `${friend.game_name}#${friend.game_tag}`)

        return Array.from(new Set([...PresencesRiotIDs, ...FriendListRiotIDs]))
    }

    const compareThemeAndBundleAssetPath = (themeAssetPath: string = '', bundleAssetPath: string = '') => {
        const bundle = bundleAssetPath //
            .replace(/ShooterGame\/Content\/UI\/OutOfGame\/MainMenu\/Store\/Bundles\/StorefrontItem_?/gim, '')
            .replace(/_?ThemeBundle_DataAsset/gim, '')
            .toLowerCase()
        const theme = themeAssetPath //
            .replace(/ShooterGame\/Content\/Themes\/Theme_?/gim, '')
            .replace(/_?PrimaryAsset/gim, '')
            .toLowerCase()

        return bundle === theme
    }

    const getFriendFromGnT = async (GameName, TagLine): Promise<ValorantFriendAndRequest> => {
        const friend_request = async (): Promise<ValorantFriendFromGnT | null> => {
            const objective = new Promise(async (resolve) => {
                const friendRequests = await getFriendRequests()
                const friendRequest = friendRequests.find((player) => player.gameName === GameName && player.tagLine === TagLine)
                if (friendRequest)
                    return resolve({
                        Subject: friendRequest.puuid,
                        GameName: friendRequest.gameName,
                        TagLine: friendRequest.tagLine
                    })

                const FriendRequestListener = async (data: ValorantWebsocketFriendRequest[]) => {
                    console.debug(`Received Friend-Request during Player-Lookup, in ${Date.now() - FriendRequestStart}ms.`)

                    const friendRequest = data.find((player) => {
                        const FriendRequestGameName = player.game_name.replace(/ /gm, '')
                        const FriendRequestTagLine = player.game_tag.replace(/ /gm, '')
                        const QueryGameName = GameName.replace(/ /gm, '')
                        const QueryTagLine = TagLine.replace(/ /gm, '')

                        const matchGameName = FriendRequestGameName.localeCompare(QueryGameName, [], { sensitivity: 'base' }) === 0
                        const matchTagLine = FriendRequestTagLine.localeCompare(QueryTagLine, [], { sensitivity: 'base' }) === 0

                        return matchGameName && matchTagLine
                    })

                    if (friendRequest) {
                        Emitter.off('friendrequests', FriendRequestListener)
                        revokeFriendRequest(friendRequest.puuid).then()

                        return resolve({
                            Subject: friendRequest.puuid,
                            GameName: friendRequest.game_name,
                            TagLine: friendRequest.game_tag
                        })
                    }
                }

                const FriendRequestStart = Date.now()
                Emitter.on('friendrequests', FriendRequestListener)

                await sendFriendRequest(GameName, TagLine)
                await sleep(2500)
                Emitter.off('friendrequests', FriendRequestListener)
            })

            const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 3000))

            return (await Promise.race([objective, timeout])) as never
        }

        const playerPresence = getCachePresences().find((player) => player.GameName === GameName && player.TagLine === TagLine)
        if (playerPresence)
            return {
                Subject: playerPresence.Subject,
                GameName: playerPresence.GameName,
                TagLine: playerPresence.TagLine,
                friend_request
            }

        const friendList = getCacheFriends()
        const friend = friendList.find((player) => player.game_name === GameName && player.game_tag === TagLine)
        if (friend)
            return {
                Subject: friend.puuid,
                GameName: friend.game_name,
                TagLine: friend.game_tag,
                friend_request
            }

        return {
            Subject: null,
            GameName: null,
            TagLine: null,
            friend_request
        }
    }

    const getFriendList = async (): Promise<ValorantChatFriends.Friend[]> => {
        const friends = await request('get', 'local', '/chat/v4/friends')
        return friends?.friends
    }

    const getFriendRequests = async (): Promise<ValorantChatFriendRequests.Request[]> => {
        const friendRequests = await request('get', 'local', '/chat/v5/friendrequests')
        return friendRequests?.requests
    }

    const sendFriendRequest = async (GameName, GameTag): Promise<void> => {
        return await request('post', 'local', '/chat/v4/friendrequests', {
            game_name: GameName,
            game_tag: GameTag
        })
    }
    const revokeFriendRequest = async (Subject): Promise<void> => {
        return await request('delete', 'local', '/chat/v4/friendrequests', {
            puuid: Subject
        })
    }

    const getAresPlayerSettings = async (): Promise<ValorantAresPlayerSettings> => {
        const PlayerPreferences = await request('get', 'custom', 'https://playerpreferences.riotgames.com/playerPref/v3/getPreference/Ares.PlayerSettings')
        const DataDeflated = Buffer.from(PlayerPreferences.data, 'base64')
        const DataInflated = Pako.inflateRaw(DataDeflated, { to: 'string' })

        return {
            data: JSON.parse(DataInflated as string),
            modified: PlayerPreferences.modified,
            type: PlayerPreferences.type
        }
    }

    const putAresPlayerSettings = async (settings: ValorantAresPlayerSettings.Data): Promise<any> => {
        const DataInflated = JSON.stringify(settings)
        const DataDeflated = Pako.deflateRaw(DataInflated)

        const PlayerPreferences = {
            type: 'Ares.PlayerSettings',
            data: Buffer.from(DataDeflated as ArrayBuffer).toString('base64')
        }

        return request('put', 'custom', 'https://playerpreferences.riotgames.com/playerPref/v3/savePreference', PlayerPreferences)
    }

    const getAccountXP = async (force?: boolean): Promise<ValorantAccountXp> => {
        if (!force && Cache.AccountXP) return await Cache.AccountXP

        Cache.AccountXP = request('get', 'pd', `/account-xp/v1/players/${getSelfSubject()}`)

        return await Cache.AccountXP
    }

    const getMatchHistory = async (player_uuid, parameters?: ValorantMatchHistoryFunctionParams): Promise<ValorantMatchHistory> => {
        const query = new URLSearchParams(<never>parameters)

        return await request('get', 'pd', `/match-history/v1/history/${player_uuid}?${query}`)
    }

    const getMatchDetails = async (match_id, process_encounters?: boolean): Promise<ValorantMatchDetails> => {
        const MatchDetails: ValorantMatchDetails = await request('get', 'pd', `/match-details/v1/matches/${match_id}`)

        if (process_encounters) {
            for (const player of MatchDetails.players) {
                await EncounterHistory.add(
                    player.subject,
                    MatchDetails.matchInfo.matchId,
                    MatchDetails.matchInfo.gameStartMillis + MatchDetails.matchInfo.gameLengthMillis
                )
            }
        }

        return MatchDetails
    }

    const getCompetitiveUpdates = async (player_uuid, parameters?: ValorantMatchHistoryFunctionParams): Promise<ValorantCompetitiveUpdates> => {
        const query = new URLSearchParams(<never>parameters)

        return await request('get', 'pd', `/mmr/v1/players/${player_uuid}/competitiveupdates?${query}`)
    }
    const getCachedCompetitiveUpdates = async (player_uuid, force?: boolean): Promise<ValorantCompetitiveUpdates> => {
        const query = new URLSearchParams(<never>{ endIndex: 10, queue: 'competitive' })

        return await PersistentCache.get(
            `competitive-updates_${player_uuid}`,
            () => request('get', 'pd', `/mmr/v1/players/${player_uuid}/competitiveupdates?${query}`),
            { delay: 250, force }
        )
    }

    const getContentServiceContent = async (force?: boolean): Promise<ValorantContentServiceContent> => {
        if (!force && Cache.ContentServiceContent) return await Cache.ContentServiceContent!

        Cache.ContentServiceContent = request('get', 'shared', `/content-service/v3/content`)

        return await Cache.ContentServiceContent
    }

    const getPreGameMatch = async (pregame_match_id, force?: boolean): Promise<ValorantPreGameMatch> => {
        if (pregame_match_id === 'mock') return require('../assets/mock/pregame.json')

        if (!force && Cache.PreGameMatch[pregame_match_id]) return await Cache.PreGameMatch[pregame_match_id]!

        Cache.PreGameMatch[pregame_match_id] = request('get', 'glz', `/pregame/v1/matches/${pregame_match_id}`)

        return await Cache.PreGameMatch[pregame_match_id]!
    }

    const getPreGameLoadouts = async (pregame_match_id, force?: boolean): Promise<ValorantPreGameLoadouts> => {
        if (pregame_match_id === 'mock') return require('../assets/mock/pregame_loadouts.json')

        if (!force && Cache.PreGameLoadouts[pregame_match_id]) return await Cache.PreGameLoadouts[pregame_match_id]!

        Cache.PreGameLoadouts[pregame_match_id] = request('get', 'glz', `/pregame/v1/matches/${pregame_match_id}/loadouts`)

        return await Cache.PreGameLoadouts[pregame_match_id]!
    }

    const getPreGameMatchId = async (): Promise<string> => {
        const { MatchID } = await request('get', 'glz', `/pregame/v1/players/${connection.token?.subject}`)

        return MatchID
    }

    const quitPreGameMatch = async (): Promise<void> => {
        const currentPreGameMatchId = await getPreGameMatchId()

        return request('post', 'glz', `/pregame/v1/matches/${currentPreGameMatchId}/quit`)
    }

    const getCoreGameMatch = async (ingame_match_id, force?: boolean): Promise<ValorantCoreGameMatch> => {
        if (ingame_match_id === 'mock') return require('../assets/mock/coregame.json')

        if (!force && Cache.CoreGameMatch[ingame_match_id]) return await Cache.CoreGameMatch[ingame_match_id]!

        Cache.CoreGameMatch[ingame_match_id] = request('get', 'glz', `/core-game/v1/matches/${ingame_match_id}`)

        return await Cache.CoreGameMatch[ingame_match_id]!
    }

    const getCoreGameLoadouts = async (ingame_match_id, force?: boolean): Promise<ValorantCoreGameLoadouts> => {
        if (ingame_match_id === 'mock') return require('../assets/mock/coregame_loadouts.json')

        if (!force && Cache.CoreGameLoadouts[ingame_match_id]) return await Cache.CoreGameLoadouts[ingame_match_id]!

        Cache.CoreGameLoadouts[ingame_match_id] = request('get', 'glz', `/core-game/v1/matches/${ingame_match_id}/loadouts`)

        return await Cache.CoreGameLoadouts[ingame_match_id]!
    }

    const getCoreGameMatchId = async (): Promise<string> => {
        const { MatchID } = await request('get', 'glz', `/core-game/v1/players/${connection.token?.subject}`)

        return MatchID
    }

    const getNameService = async (subjects: string[]): Promise<{ [subject: string]: ValorantNameService }> => {
        const cache_requests = subjects.map(async (subject) => await PersistentCache.get(`name-service_${subject}`))
        const cache_resolved = await Promise.all(cache_requests)
        const cache = cache_resolved.filter((T) => T) as ValorantNameService[]

        const not_cached = subjects.filter((subject) => !cache.find((c) => c.Subject === subject))

        if (not_cached.length > 0) {
            const name_service = await request('put', 'pd', `/name-service/v2/players`, [...not_cached])
            const cache_requests = name_service.map(async (service) => await PersistentCache.set(`name-service_${service.Subject}`, service))
            const cache_resolved = await Promise.all(cache_requests)

            cache.push(...cache_resolved)
        }

        const newEntry = {}
        for (let i = 0; i < cache.length; i++) {
            const service = cache[i]
            newEntry[service.Subject] = service

            await RiotIdHistory.set(service.Subject, service.GameName, service.TagLine)
        }

        return newEntry
    }

    const getMMR = async (subject, force?: boolean): Promise<ValorantMMR> => {
        return await PersistentCache.get(`mmr_${subject}`, () => request('get', 'pd', `/mmr/v1/players/${subject}`), { delay: 250, force })
    }

    const parseMMR = async (subject, force?: boolean) => {
        const MMR = await getMMR(subject, force)
        const CurrentSeason = await getCurrentSeason()

        const CompetitiveSeasons = await Cache.CompetitiveSeasons
        const CompetitiveTiers = await Cache.CompetitiveTiers

        const CompetitiveSeason = CompetitiveSeasons.find((season) => season.seasonUuid === CurrentSeason.ID)!
        const CompetitiveTier = CompetitiveTiers.find((tier) => tier.uuid === CompetitiveSeason.competitiveTiersUuid)!
        const CurrentRank =
            CompetitiveTier.tiers.find((t) => t.tier === MMR.QueueSkills?.competitive.SeasonalInfoBySeasonID?.[CurrentSeason.ID]?.CompetitiveTier) ??
            CompetitiveTier.tiers[0]
        const CurrentRR = MMR.QueueSkills?.competitive.SeasonalInfoBySeasonID?.[CurrentSeason.ID]?.RankedRating ?? 0

        let Tiers = [] as { best: ValorantAPICompetitiveTiers.Tier; worst: ValorantAPICompetitiveTiers.Tier }[]
        if (MMR.QueueSkills?.competitive.SeasonalInfoBySeasonID) {
            Tiers = Object.values(MMR.QueueSkills?.competitive.SeasonalInfoBySeasonID)
                .filter((info) => info.NumberOfWins)
                .map((info) => {
                    const CompetitiveSeason = CompetitiveSeasons.find((season) => season.seasonUuid === info.SeasonID)!
                    const CompetitiveTier = CompetitiveTiers.find((tier) => tier.uuid === CompetitiveSeason.competitiveTiersUuid)!

                    const WinsByTier = Object.keys(info.WinsByTier ?? { 0: 0 })
                        .map((e) => Number(e))
                        .filter((e) => e !== 0)
                    const Ranks = WinsByTier.sort((a, b) => b - a)

                    return {
                        best: CompetitiveTier.tiers.find((t) => t.tier === Ranks[0]) ?? CompetitiveTier.tiers[0],
                        worst: CompetitiveTier.tiers.find((t) => t.tier === Ranks[Ranks.length - 1]) ?? CompetitiveTier.tiers[0]
                    }
                })
        }

        if (Tiers.length < 1) {
            Tiers.push({
                best: CompetitiveTier.tiers[0],
                worst: CompetitiveTier.tiers[0]
            })
        }
        if (CurrentRank.tier !== 0) {
            Tiers.push({
                best: CurrentRank,
                worst: CurrentRank
            })
        }

        const BestRank = Tiers.sort((a, b) => {
            const divisionA = a.best.divisionName
            const divisionB = b.best.divisionName

            return DivisionOrder[divisionB] + b.best.tier - (DivisionOrder[divisionA] + a.best.tier)
        })[0].best
        const WorstRank = Tiers.sort((a, b) => {
            const divisionA = a.worst.divisionName
            const divisionB = b.worst.divisionName

            return DivisionOrder[divisionA] + a.best.tier - (DivisionOrder[divisionB] + b.best.tier)
        })[0].worst

        return { BestRank, WorstRank, CurrentRank, CurrentRR }
    }

    const parseTriangles = async (subject, force?: boolean) => {
        const MMR = await getMMR(subject, force)

        const Seasons = await Cache.Seasons
        const CompetitiveTiers = await Cache.CompetitiveTiers
        const CompetitiveSeasons = await Cache.CompetitiveSeasons

        const Acts = Seasons
            //Seasons include future Seasons and therefore needs to be filtered first.
            .filter((s) => s.type === 'EAresSeasonType::Act' && new Date(s.startTime).getTime() <= Date.now())
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        const Triangles = {}

        for (const Act of Acts) {
            const CompetitiveSeason = CompetitiveSeasons.find((season) => season.seasonUuid === Act.uuid)!
            const CompetitiveTier = CompetitiveTiers.find((tier) => tier.uuid === CompetitiveSeason.competitiveTiersUuid)!

            const SubjectSeason = MMR.QueueSkills?.competitive.SeasonalInfoBySeasonID?.[Act.uuid]
            const EpisodeAct = Act.assetPath.match(/ShooterGame\/Content\/Seasons\/Season_Episode(\d+)_Act(\d+)_DataAsset/)
            const WinsByTier = SubjectSeason?.WinsByTier ?? { 0: 0 }

            const BestRankTier = Number(Object.keys(WinsByTier).sort((a, b) => Number(b) - Number(a))[0])
            const LastRankTier = SubjectSeason?.CompetitiveTier ?? 0

            Triangles[Act.uuid] = {
                NameShort: EpisodeAct ? `Ep. ${EpisodeAct[1]}, Act ${EpisodeAct[2]}` : Act.displayName,
                BestRank: CompetitiveTier.tiers.find((t) => t.tier === BestRankTier)!,
                LastRank: CompetitiveTier.tiers.find((t) => t.tier === LastRankTier)!
            }
        }

        return Triangles
    }

    const getCurrentSeason = async () => {
        const Content = await getContentServiceContent()

        return Content.Seasons.find((season) => season.Type === 'act' && season.IsActive)!
    }

    const getLevelBorder = async (level: number, level_border_id?: string) => {
        const LevelBorders = await Cache.LevelBorders

        const FoundLevelBorder = LevelBorders.find((border) => border.uuid === level_border_id)
        if (FoundLevelBorder) return FoundLevelBorder

        return LevelBorders.filter((border) => border.startingLevel <= level) //
            .sort((a, b) => b.startingLevel - a.startingLevel)[0]
    }

    const getSelfSubject = (): string | null => connection.token?.subject || null
    const hasSelfPresence = (): boolean => connection.presences.findIndex((p) => p.Subject === connection.token?.subject) === -1
    const getCachePresences = (): ValorantChatPresences.Player[] => connection.presences
    const getCacheFriends = (): ValorantChatFriends.Friend[] => connection.friends

    const Entitlements = {
        /** @deprecated
         * This method will return all ever owned entitlements instead of those you currently have.
         * Use the other Entitlement-methods to get your current entitlements at the price of Rate-Limit.
         */
        getAll: async (): Promise<ValorantStoreEntitlementsAll.EntitlementsByType[]> => {
            const { EntitlementsByTypes } = await request('get', 'pd', `/store/v1/entitlements/${getSelfSubject()}`)

            return EntitlementsByTypes
        },
        getTitles: async (): Promise<ValorantStoreEntitlementsTitles.Entitlement[]> => {
            // const { Entitlements } = await request('get', 'pd', `/store/v1/entitlements/${getSelfSubject()}/${ENTITLEMENTS.titles}`)

            return []
        },
        getSprays: async (): Promise<ValorantStoreEntitlementsSprays.Entitlement[]> => {
            const { Entitlements } = await request('get', 'pd', `/store/v1/entitlements/${getSelfSubject()}/${ENTITLEMENTS.sprays}?sprays`)

            return Entitlements
        },
        getBanners: async (): Promise<ValorantStoreEntitlementsBanners.Entitlement[]> => {
            const { Entitlements } = await request('get', 'pd', `/store/v1/entitlements/${getSelfSubject()}/${ENTITLEMENTS.banners}?banners`)

            return Entitlements
        },
        getBuddies: async (): Promise<ValorantStoreEntitlementsBuddies.Entitlement[]> => {
            const { Entitlements } = await request('get', 'pd', `/store/v1/entitlements/${getSelfSubject()}/${ENTITLEMENTS.buddies}?buddies`)

            return Entitlements
        },
        getSkinLevels: async (): Promise<ValorantStoreEntitlementsSkinLevels.Entitlement[]> => {
            const { Entitlements } = await request('get', 'pd', `/store/v1/entitlements/${getSelfSubject()}/${ENTITLEMENTS.skin_levels}?skin-levels`)

            return Entitlements
        },
        getSkinChromas: async (): Promise<ValorantStoreEntitlementsSkinChromas.Entitlement[]> => {
            const { Entitlements } = await request('get', 'pd', `/store/v1/entitlements/${getSelfSubject()}/${ENTITLEMENTS.skin_chromas}?skin-chromas`)

            return Entitlements
        }
    }

    const getSelfLoadout = async (force?: boolean): Promise<ValorantPersonalizationPlayerLoadout> => {
        if (!force && Cache.SelfLoadout) return await Cache.SelfLoadout

        Cache.SelfLoadout = request('get', 'pd', `/personalization/v2/players/${getSelfSubject()}/playerloadout`)

        return await Cache.SelfLoadout
    }
    const putSelfLoadout = async (PlayerLoadout: ValorantPersonalizationPlayerLoadoutSettings) => {
        return await request('put', 'pd', `/personalization/v2/players/${getSelfSubject()}/playerloadout`, PlayerLoadout)
    }

    const getFavourites = async (): Promise<string[]> => {
        const Favourites: ValorantFavorites = await request('get', 'pd', `/favorites/v1/players/${getSelfSubject()}/favorites`)
        return Object.values(Favourites.FavoritedContent).map((fav) => fav.ItemID)
    }
    const addFavourite = async (itemId: string) => {
        return await request('post', 'pd', `/favorites/v1/players/${getSelfSubject()}/favorites`, { ItemID: itemId })
    }
    const deleteFavourite = async (itemId: string) => {
        return await request('delete', 'pd', `/favorites/v1/players/${getSelfSubject()}/favorites/${itemId}`)
    }

    const getContracts = async () => {
        return await request('get', 'pd', `/contracts/v1/contracts/${getSelfSubject()}`)
    }
    const getStorefront = async (force?: boolean): Promise<ValorantStoreStorefront> => {
        const subject = getSelfSubject()

        return await PersistentCache.get(`storefront_${subject}`, () => request('get', 'pd', `/store/v2/storefront/${subject}`), { force })
    }

    const Client: ValorantInstanceClient = {
        on: (event, listener) => Emitter.on(event, listener),
        once: (event, listener) => Emitter.once(event, listener),
        off: (event, listener) => Emitter.off(event, listener),
        login
    }

    return {
        Client,
        getServers,
        raw: request,
        Entitlements,
        getSelfLoadout,
        putSelfLoadout,

        getFavourites,
        addFavourite,
        deleteFavourite,

        getFriendList,
        getFriendRequests,
        sendFriendRequest,
        revokeFriendRequest,

        getChatPresences,
        getAresPlayerSettings,
        putAresPlayerSettings,

        getKnownRiotIDs,
        getFriendFromGnT,
        compareThemeAndBundleAssetPath,

        getMatchHistory,
        getMatchDetails,
        getCompetitiveUpdates,
        getCachedCompetitiveUpdates,
        getContentServiceContent,
        getAccountXP,
        getContracts,
        getStorefront,

        getPreGameMatch,
        getCoreGameMatch,
        getPreGameMatchId,
        getCoreGameMatchId,
        getPreGameLoadouts,
        getCoreGameLoadouts,
        quitPreGameMatch,

        getMMR,
        parseMMR,
        parseTriangles,
        getLevelBorder,
        getNameService,

        getSelfSubject,
        hasSelfPresence,
        getCachePresences,
        getCacheFriends
    }
}

window['ValorantInstance'] = ValorantInstance
