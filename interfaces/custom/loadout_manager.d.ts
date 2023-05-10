type LoadoutManagerWeaponBuilder = {
    setSkin: (uuid: string) => LoadoutManagerWeaponBuilder
    setSkinLevel: (uuid: string) => LoadoutManagerWeaponBuilder
    setSkinChroma: (uuid: string) => LoadoutManagerWeaponBuilder
    setBuddy: (uuid: string) => LoadoutManagerWeaponBuilder
    setBuddyLevel: (uuid: string) => LoadoutManagerWeaponBuilder
    setBuddyInstance: (uuid: string) => LoadoutManagerWeaponBuilder
}

type LoadoutManagerInstance = {
    getLoadout: () => ValorantPersonalizationPlayerLoadout
    setPlayerCardID: (uuid: string) => void
    setPlayerTitleID: (uuid: string) => void
    setAccountLevelVisibility: (visible: boolean) => void
    setPreSpray: (uuid: string) => void
    setMidSpray: (uuid: string) => void
    setPostSpray: (uuid: string) => void
    getWeapon: (uuid: string) => LoadoutManagerWeaponBuilder
    getFavourites: () => string[]
    addFavourite: (itemId: string) => Promise<void>
    deleteFavourite: (itemId: string) => Promise<void>
    hasChanges: () => boolean
    reset: () => void
    apply: () => Promise<void>
}

type InventoryInstance = {
    Titles: ValorantStoreEntitlementsTitles.Entitlement[]
    Sprays: ValorantStoreEntitlementsSprays.Entitlement[]
    Banners: ValorantStoreEntitlementsBanners.Entitlement[]
    Buddies: ValorantStoreEntitlementsBuddies.Entitlement[]
    SkinLevels: ValorantStoreEntitlementsSkinLevels.Entitlement[]
    SkinChromas: ValorantStoreEntitlementsSkinChromas.Entitlement[]
}

//LoadoutManagerV1.vue
type ProcessedLoadoutWeapon = {
    WeaponID: string
    WeaponCategory: any
    SkinID: string
    SkinName: string
    SkinImageURL: string
    LevelID: string
    ChromaID: string
    hasBuddy: boolean
    BuddyImageURL: string
    ContentTierName: string
    ContentTierRank: number
}

type ProcessedIdentity = {
    TitleID: string
    TitleText: string

    BannerID: string
    BannerImageURL: string

    PreRoundSprayID: string
    PreRoundSprayName: string
    PreRoundSprayImageURL: string

    MidRoundSprayID: string
    MidRoundSprayName: string
    MidRoundSprayImageURL: string

    PostRoundSprayID: string
    PostRoundSprayName: string
    PostRoundSprayImageURL: string
}

type ProcessedLoadoutBuddyInstance = { id: string; usage: ValorantPersonalizationPlayerLoadout.Gun | undefined }
type ProcessedLoadoutBuddy = {
    entry: ValorantAPIBuddy
    fav: boolean
    instances: ProcessedLoadoutBuddyInstance[]
}

type ProcessedLoadoutSkin = {
    entry: ValorantAPIWeapon.Skin
    fav: boolean
}

type ProcessedIdentityBanner = {
    entry: ValorantAPIPlayerCard
    fav: boolean
}

type ProcessedIdentitySpray = {
    entry: ValorantAPISpray
    fav: boolean
}

type ProcessedIdentityTitle = {
    entry: ValorantAPIPlayerTitle
    fav: boolean
}
