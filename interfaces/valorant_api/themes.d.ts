declare module ValorantAPIThemes {
    export interface Theme {
        uuid: string
        displayName: string
        displayIcon: string
        storeFeaturedImage: string
        assetPath: string
    }
}

type ValorantAPIThemes = ValorantAPIThemes.Theme[]
