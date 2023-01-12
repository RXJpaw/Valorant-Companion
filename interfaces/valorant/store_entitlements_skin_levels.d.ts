declare module ValorantStoreEntitlementsSkinLevels {
    export interface Entitlement {
        TypeID: string
        ItemID: string
    }
}

interface ValorantStoreEntitlementsSkinLevels {
    ItemTypeID: string
    Entitlements: ValorantStoreEntitlementsSkinLevels.Entitlement[]
}
