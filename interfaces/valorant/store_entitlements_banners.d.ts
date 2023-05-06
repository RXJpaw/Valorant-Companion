declare module ValorantStoreEntitlementsBanners {
    export interface Entitlement {
        TypeID: string
        ItemID: string
    }
}

interface ValorantStoreEntitlementsBanners {
    ItemTypeID: string
    Entitlements: ValorantStoreEntitlementsBanners.Entitlement[]
}
