declare module ValorantPersonalizationPlayerLoadout {
    export interface Gun {
        ID: string
        SkinID: string
        SkinLevelID: string
        ChromaID: string
        CharmInstanceID: string
        CharmID: string
        CharmLevelID: string
        Attachments: any[]
    }

    export interface Spray {
        EquipSlotID: string
        SprayID: string
        SprayLevelID?: any
    }

    export interface IdentitySettings {
        PlayerCardID: string
        PlayerTitleID: string
        PreferredLevelBorderID: string
        HideAccountLevel: boolean
    }

    export interface Identity extends IdentitySettings {
        AccountLevel: number
    }
}

interface ValorantPersonalizationPlayerLoadoutSettings {
    Guns: ValorantPersonalizationPlayerLoadout.Gun[]
    Sprays: ValorantPersonalizationPlayerLoadout.Spray[]
    Identity: ValorantPersonalizationPlayerLoadout.IdentitySettings
    Incognito: boolean
}

interface ValorantPersonalizationPlayerLoadout extends ValorantPersonalizationPlayerLoadoutSettings {
    Subject: string
    Version: number
    Identity: ValorantPersonalizationPlayerLoadout.Identity
}
