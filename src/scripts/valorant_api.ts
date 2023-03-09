import localForage from 'localforage'

const fetchData = async (path) => {
    return (await (await fetch(`${path}?timestamp=${Date.now()}`)).json())?.data
}

const Store = {
    ValorantAPIMaps: localForage.createInstance({ name: 'ValorantAPI', storeName: 'Cache' })
}

const cache = {
    Version: null as never as Promise<string>,
    Maps: null as never as Promise<ValorantAPIMap[]>,
    GameModes: null as never as Promise<ValorantAPIGameMode[]>,
    CompetitiveSeasons: null as never as Promise<ValorantAPICompetitiveSeason[]>,
    CompetitiveTiers: null as never as Promise<ValorantAPICompetitiveTiers[]>,
    LevelBorders: null as never as Promise<ValorantAPILevelBorder[]>,
    Weapons: null as never as Promise<ValorantAPIWeapon[]>,
    Buddies: null as never as Promise<ValorantAPIBuddy[]>,
    Themes: null as never as Promise<ValorantAPIThemes.Theme[]>,
    ContentTiers: null as never as Promise<ValorantAPIContentTiers.ContentTier[]>,
    Bundles: null as never as Promise<ValorantAPIBundles.Bundle[]>,
    Contracts: null as never as Promise<ValorantAPIContracts.Contract[]>
}

export const getMaps = async (): Promise<ValorantAPIMap[]> => {
    if (cache.Maps) return await cache.Maps
    cache.Maps = CacheManager('maps', 'https://valorant-api.com/v1/maps')
    return await cache.Maps
}

export const getGameModes = async () => {
    if (cache.GameModes) return await cache.GameModes
    cache.GameModes = CacheManager('gamemodes', 'https://valorant-api.com/v1/gamemodes')
    return await cache.GameModes
}

export const getCompetitiveSeasons = async () => {
    if (cache.CompetitiveSeasons) return await cache.CompetitiveSeasons
    cache.CompetitiveSeasons = CacheManager('competitive_seasons', 'https://valorant-api.com/v1/seasons/competitive')
    return await cache.CompetitiveSeasons
}

export const getCompetitiveTiers = async () => {
    if (cache.CompetitiveTiers) return await cache.CompetitiveTiers
    cache.CompetitiveTiers = CacheManager('competitivetiers', 'https://valorant-api.com/v1/competitivetiers')
    return await cache.CompetitiveTiers
}

export const getLevelBorders = async () => {
    if (cache.LevelBorders) return await cache.LevelBorders
    cache.LevelBorders = CacheManager('levelborders', 'https://valorant-api.com/v1/levelborders')
    return await cache.LevelBorders
}

export const getWeapons = async () => {
    if (cache.Weapons) return await cache.Weapons
    cache.Weapons = CacheManager('weapons', 'https://valorant-api.com/v1/weapons')
    return await cache.Weapons
}

export const getBuddies = async () => {
    if (cache.Buddies) return await cache.Buddies
    cache.Buddies = CacheManager('buddies', 'https://valorant-api.com/v1/buddies')
    return await cache.Buddies
}

export const getThemes = async () => {
    if (cache.Themes) return await cache.Themes
    cache.Themes = CacheManager('themes', 'https://valorant-api.com/v1/themes')
    return await cache.Themes
}

export const getContentTiers = async () => {
    if (cache.ContentTiers) return await cache.ContentTiers
    cache.ContentTiers = CacheManager('contenttiers', 'https://valorant-api.com/v1/contenttiers')
    return await cache.ContentTiers
}

export const getBundles = async () => {
    if (cache.Bundles) return await cache.Bundles
    cache.Bundles = CacheManager('bundles', 'https://valorant-api.com/v1/bundles')
    return await cache.Bundles
}

export const getContracts = async () => {
    if (cache.Contracts) return await cache.Contracts
    cache.Contracts = CacheManager('contracts', 'https://valorant-api.com/v1/contracts')
    return await cache.Contracts
}

export const mapWeaponSkins = async () => {
    const Weapons = await getWeapons()
    return Weapons.map((weapon) => weapon.skins).flat(1)
}

const CacheManager = async (key, url) => {
    if (!cache.Version) {
        cache.Version = new Promise((resolve) => {
            fetchData('https://valorant-api.com/v1/version').then((data) => resolve(data.version))
        })
    }

    const CurrentVersion = await cache.Version

    const StoreItem = (await Store.ValorantAPIMaps.getItem(key)) ?? ({} as any)
    if (StoreItem.Version !== CurrentVersion) {
        const StoreData = await fetchData(url)
        return (
            await Store.ValorantAPIMaps.setItem(key, {
                Version: CurrentVersion,
                Data: StoreData
            })
        ).Data
    } else {
        return StoreItem.Data
    }
}
