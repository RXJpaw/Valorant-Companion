import { project_version } from '../../package.json'
import localForage from 'localforage'

const Store = {
    CompetitiveUpdates: localForage.createInstance({ name: 'ValorantMatch', storeName: 'CompetitiveUpdates' }),
    MatchHistory: localForage.createInstance({ name: 'ValorantMatch', storeName: 'History' }),

    RiotIdHistory: localForage.createInstance({ name: 'Valorant', storeName: 'RiotIdHistory' }),
    EncounterHistory: localForage.createInstance({ name: 'Valorant', storeName: 'EncounterHistory' })
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
    add: async (subject: string, matchId: string) => {
        let { Data: EncounterHistory } = ((await Store.EncounterHistory.getItem(subject)) as IndexedDbEncounterHistory) || {}
        if (!EncounterHistory) EncounterHistory = {}

        const Version = Date.now()
        EncounterHistory[matchId] = Version

        await Store.EncounterHistory.setItem(subject, {
            Data: EncounterHistory,
            Version
        })

        return {
            Matches: EncounterHistory,
            LastEncounter: Version
        }
    }
}

window['exportIndexedDB'] = async () => {
    const match_history_keys = await Store.MatchHistory.keys()
    const competitive_updates_keys = await Store.CompetitiveUpdates.keys()

    const export_object = {
        version: project_version,
        match_history: {},
        competitive_updates: {}
    }
    for (let i = 0; i < match_history_keys.length; i++) {
        const key = match_history_keys[i]
        export_object.match_history[key] = await Store.MatchHistory.getItem(key)
    }
    for (let i = 0; i < competitive_updates_keys.length; i++) {
        const key = competitive_updates_keys[i]
        export_object.competitive_updates[key] = await Store.CompetitiveUpdates.getItem(key)
    }

    const export_base64 = Buffer.from(JSON.stringify(export_object)).toString('base64')

    console.log(`Please focus outside the console to export ${(export_base64.length / 1024).toFixed(1)} KB of data to your clipboard.`)

    const FocusListener = async () => {
        window.removeEventListener('focus', FocusListener)
        await navigator.clipboard.writeText(export_base64)

        console.log(`Wrote ${(export_base64.length / 1024).toFixed(1)} KB of data to your clipboard.`)
    }

    window.addEventListener('focus', FocusListener)
}

window['importIndexedDB'] = (allow_mismatched_version) => {
    console.log(`Please focus outside the console to import data from your clipboard.`)

    const FocusListener = async () => {
        window.removeEventListener('focus', FocusListener)
        const import_base64 = await navigator.clipboard.readText()

        console.log(`Read ${(import_base64.length / 1024).toFixed(1)} KB of data from your clipboard.`)

        const import_object = JSON.parse(Buffer.from(import_base64, 'base64').toString('utf-8'))
        await import_data(import_object)
    }

    window.addEventListener('focus', FocusListener)

    const import_data = async (import_object) => {
        if (!allow_mismatched_version && import_object.version !== project_version) {
            console.log(`Mismatched Version. Use Parameter 'true' to bypass this Error.`)
            return null
        }
        if (typeof import_object.match_history !== 'object' || typeof import_object.competitive_updates !== 'object') {
            console.log('Malformed Data.')
            return null
        }

        for (const key in import_object.match_history) {
            const MatchHistory = import_object.match_history[key]
            await Store.MatchHistory.setItem(key, MatchHistory)
        }
        for (const key in import_object.competitive_updates) {
            const CompetitiveUpdates = import_object.competitive_updates[key]
            await Store.CompetitiveUpdates.setItem(key, CompetitiveUpdates)
        }

        location.reload()
    }
}
