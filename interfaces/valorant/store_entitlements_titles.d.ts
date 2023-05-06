declare module ValorantStoreEntitlementsTitles {
    export interface Entitlement {
        TypeID: string
        ItemID: string
    }
}

interface ValorantStoreEntitlementsTitles {
    ItemTypeID: string
    Entitlements: ValorantStoreEntitlementsTitles.Entitlement[]
}
