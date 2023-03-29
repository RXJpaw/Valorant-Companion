import { project_version } from '../../package.json'
import localForage from 'localforage'

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
    //ValorantMatch
    CompetitiveUpdates: localForage.createInstance({ name: 'ValorantMatch', storeName: 'CompetitiveUpdates' }),
    MatchHistory: localForage.createInstance({ name: 'ValorantMatch', storeName: 'History' }),
    MatchDetails: localForage.createInstance({ name: 'ValorantMatch', storeName: 'Details' }),

    //Valorant
    EncounterHistory: localForage.createInstance({ name: 'Valorant', storeName: 'EncounterHistory' }),
    RiotIdHistory: localForage.createInstance({ name: 'Valorant', storeName: 'RiotIdHistory' })
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
