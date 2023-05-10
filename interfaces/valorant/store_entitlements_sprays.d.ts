declare module ValorantStoreEntitlementsSprays {
    export interface Entitlement {
        TypeID: string
        ItemID: string
    }
}

interface ValorantStoreEntitlementsSprays {
    ItemTypeID: string
    Entitlements: ValorantStoreEntitlementsSprays.Entitlement[]
}
