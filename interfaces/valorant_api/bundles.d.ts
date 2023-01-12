declare module ValorantAPIBundles {
    export interface Bundle {
        uuid: string
        displayName: string
        displayNameSubText: string
        description: string
        extraDescription: string
        promoDescription: string
        useAdditionalContext: boolean
        displayIcon: string
        displayIcon2: string
        verticalPromoImage: string
        assetPath: string
    }
}

type ValorantAPIBundles = ValorantAPIBundles.Bundle[]
