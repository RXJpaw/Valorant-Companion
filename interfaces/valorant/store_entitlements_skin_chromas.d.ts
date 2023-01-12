declare module ValorantStoreEntitlementsSkinChromas {
    export interface Entitlement {
        TypeID: string
        ItemID: string
    }
}

interface ValorantStoreEntitlementsSkinChromas {
    ItemTypeID: string
    Entitlements: ValorantStoreEntitlementsSkinChromas.Entitlement[]
}
