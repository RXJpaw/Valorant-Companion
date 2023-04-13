import { project_version } from '../../package.json'
import localForage from 'localforage'
import path from 'path'

export const HandleError = (functionToHandle, ...args) => {
    try {
        return functionToHandle(...args)
    } catch (e) {
        return null
    }
}

const fs = window.require('fs/promises') as typeof import('fs/promises')
const zl = HandleError(window.require, 'zip-lib') as typeof import('zip-lib')

export const Store = {
    //PersistentCache
    PersistentCache: localForage.createInstance({ name: 'PersistentCache', storeName: 'Cache' }),
    RiotAccessToken: localForage.createInstance({ name: 'PersistentCache', storeName: 'RiotAccessToken' }),
    RiotEntitlementToken: localForage.createInstance({ name: 'PersistentCache', storeName: 'RiotEntitlementToken' }),

    //ValorantMatch
    CompetitiveUpdates: localForage.createInstance({ name: 'ValorantMatch', storeName: 'CompetitiveUpdates' }),
    MatchHistory: localForage.createInstance({ name: 'ValorantMatch', storeName: 'History' }),
    MatchDetails: localForage.createInstance({ name: 'ValorantMatch', storeName: 'Details' }),

    //Valorant
    EncounterHistory: localForage.createInstance({ name: 'Valorant', storeName: 'EncounterHistory' }),
    AccountDetails: localForage.createInstance({ name: 'Valorant', storeName: 'AccountDetails' }),
    InGameSettings: localForage.createInstance({ name: 'Valorant', storeName: 'InGameSettings' }),
    RiotIdHistory: localForage.createInstance({ name: 'Valorant', storeName: 'RiotIdHistory' })
}

export const PATH = {
    RiotClientPrivateSettings: `${window.env.LOCALAPPDATA}\\Riot Games\\Riot Client\\Data\\RiotGamesPrivateSettings.yaml`,
    RiotClientSettings: `${window.env.LOCALAPPDATA}\\Riot Games\\Riot Client\\Config\\RiotClientSettings.yaml`,
    RiotClientCookies: `${window.env.LOCALAPPDATA}\\Riot Games\\Riot Client\\Data\\Cookies\\Cookies`
}

export const sleep = (duration) => {
    return new Promise((resolve) => {
        setTimeout(resolve, duration)
    })
}

export const parseDecimal = (decimal: number) => {
    return decimal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

export const removeLastWord = (sentence: string) => {
    const lastIndex = sentence.lastIndexOf(' ')
    return sentence.substring(0, lastIndex)
}

export const RiotIdHistory = {
    getAll: async (subject: string, SetNewGameName?: string, SetNewTagLine?: string) => {
        let { Data: RiotIdHistoryList, Version } = (await Store.RiotIdHistory.getItem(subject)) as IndexedDbRiotIdHistory
        if (!RiotIdHistoryList) RiotIdHistoryList = []

        if (SetNewGameName && SetNewTagLine) {
            const setResult = await RiotIdHistory.set(subject, SetNewGameName, SetNewTagLine, { Data: RiotIdHistoryList, Version })

            if (RiotIdHistoryList[RiotIdHistoryList.length - 1]?.Version !== setResult.Version) RiotIdHistoryList.push(setResult)
        }

        return RiotIdHistoryList
    },
    set: async (subject: string, GameName: string, TagLine: string, IndexedDb?: IndexedDbRiotIdHistory) => {
        let { Data: RiotIdHistoryList } = (IndexedDb ? IndexedDb : ((await Store.RiotIdHistory.getItem(subject)) as IndexedDbRiotIdHistory)) ?? {}
        if (!RiotIdHistoryList) RiotIdHistoryList = []

        const latestName = structuredClone(RiotIdHistoryList[RiotIdHistoryList.length - 1]) ?? {}

        if (latestName.GameName !== GameName || latestName.TagLine !== TagLine) {
            latestName.GameName = GameName
            latestName.TagLine = TagLine
            latestName.Version = Date.now()

            RiotIdHistoryList.push(latestName)

            await Store.RiotIdHistory.setItem(subject, {
                Data: RiotIdHistoryList,
                Version: latestName.Version
            })
        }

        return latestName
    }
}

export const EncounterHistory = {
    get: async (subject: string) => {
        let { Data: EncounterHistory, Version } = ((await Store.EncounterHistory.getItem(subject)) as IndexedDbEncounterHistory) || {}
        if (!EncounterHistory) EncounterHistory = {}

        return {
            Matches: EncounterHistory || {},
            LastEncounter: Version || null
        }
    },
    add: async (subject: string, matchId: string, timestamp?: number) => {
        let { Data: EncounterHistory } = ((await Store.EncounterHistory.getItem(subject)) as IndexedDbEncounterHistory) || {}
        if (!EncounterHistory) EncounterHistory = {}

        const Version = timestamp || Date.now()
        EncounterHistory[matchId] = Version

        await Store.EncounterHistory.setItem(subject, {
            Data: EncounterHistory,
            Version
        })

        return {
            Matches: EncounterHistory,
            LastEncounter: Version
        }
    },
    clear: async () => {
        await Store.EncounterHistory.clear()
    }
}

/*
    cyrb53 (c) 2018 bryc (github.com/bryc)
    A fast and simple hash function with decent collision resistance.
    Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
    Public domain. Attribution appreciated.
*/
export const cyrb53 = (str: string, seed: number = 0) => {
    let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i)
        h1 = Math.imul(h1 ^ ch, 2654435761)
        h2 = Math.imul(h2 ^ ch, 1597334677)
    }

    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)

    return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

export const HandleMouseOnElement = (element: HTMLElement, event: MouseEvent): boolean | null => {
    if (event.target?.['className']?.['includes']?.('ignore-mouse-input')) return null
    if (!element) return null

    const Rects = element.getBoundingClientRect()

    if (event.x < Rects.x) return false
    if (event.y < Rects.y) return false
    if (event.x > Rects.x + Rects.width) return false
    if (event.y > Rects.y + Rects.height) return false

    return true
}

export const fileExists = async (path: string) => {
    return !!fs.stat(path).catch(() => false)
}

type DynamicPaths = 'riot-client' | 'valorant' | 'riot-cookies' | 'riot-client-settings' | 'riot-private-settings' | 'account-logins' | 'user-data'
export const getPath = async (key: DynamicPaths, sub?: string) => {
    switch (key) {
        case 'user-data': {
            return window.electron.ipcRenderer.invoke('get-path', 'userData')
        }
        case 'account-logins': {
            const UserDataPath = await getPath('user-data')
            return `${UserDataPath}\\Account Logins`
        }
        case 'riot-private-settings': {
            if (sub) {
                const AccountLoginsPath = await getPath('account-logins')
                return `${AccountLoginsPath}\\${sub}\\PrivateSettings.yaml`
            } else {
                return `${window.env.LOCALAPPDATA}\\Riot Games\\Riot Client\\Data\\RiotGamesPrivateSettings.yaml`
            }
        }
        case 'riot-client-settings': {
            if (sub) {
                const AccountLoginsPath = await getPath('account-logins')
                return `${AccountLoginsPath}\\${sub}\\ClientSettings.yaml`
            } else {
                return `${window.env.LOCALAPPDATA}\\Riot Games\\Riot Client\\Config\\RiotClientSettings.yaml`
            }
        }
        case 'riot-cookies': {
            if (sub) {
                const AccountLoginsPath = await getPath('account-logins')
                return `${AccountLoginsPath}\\${sub}\\Cookies.sl3`
            } else {
                return `${window.env.LOCALAPPDATA}\\Riot Games\\Riot Client\\Data\\Cookies\\Cookies`
            }
        }
        case 'valorant': {
            const ProductSettingsPath = 'C:\\ProgramData\\Riot Games\\Metadata\\valorant.live\\valorant.live.product_settings.yaml'
            const ProductSettings = await fs.readFile(ProductSettingsPath, 'utf-8').catch(() => null)
            if (!ProductSettings) return null

            const ValorantLivePath = ProductSettings.match(/product_install_full_path:.*?"(.*?)"/)?.[1]
            if (!ValorantLivePath) return null

            return path.normalize(path.join(ValorantLivePath, 'VALORANT.exe'))
        }
        case 'riot-client': {
            const InstallsPath = 'C:\\ProgramData\\Riot Games\\RiotClientInstalls.json'
            const Installs = await fs.readFile(InstallsPath, 'utf-8').catch(() => null)
            if (!Installs) return null

            const RiotClientDefaultPath = Installs.match(/"rc_default":.*?"(.*?)"/)?.[1]
            if (!RiotClientDefaultPath) return null

            return path.normalize(RiotClientDefaultPath)
        }
        default: {
            return null
        }
    }
}

export const getJwtPayload = async (JWT: string): Promise<any> => {
    const PayloadRegExp = /.*?\.(.*?)\./
    const PayloadMatch = JWT.match(PayloadRegExp)
    const Payload = PayloadMatch?.[1]
    if (!Payload) throw { error: 'malformed_token' }

    const DataBuffer = HandleError(Buffer.from, Payload, 'base64')
    if (!DataBuffer) throw { error: 'malformed_payload' }
    const Data = HandleError(JSON.parse, DataBuffer) as object
    if (!Data) throw { error: 'malformed_data' }

    return Data
}

export const killAllRiotProcesses = async () => {
    await Promise.all([
        window.taskkill('LoR.exe'),
        window.taskkill('VALORANT.exe'),
        window.taskkill('LeagueClient.exe'),
        window.taskkill('RiotClientUx.exe'),
        window.taskkill('RiotClientServices.exe')
    ])
}

export const deleteRiotLockFiles = async () => {
    await fs.rm(path.join(window.env.LOCALAPPDATA, 'VALORANT\\Saved\\Logs\\ShooterGame.log')).catch(() => {})
}

/* This should never be awaited. */
export const startRiotClient = async (and?: string) => {
    const RiotClientPath = await getPath('riot-client')
    if (!RiotClientPath) return

    let command = '"' + RiotClientPath + '"'
    if (and === 'valorant') {
        command = command + ' --launch-product=valorant --launch-patchline=live'
    }

    await window.exec(command)
}
