declare module ValorantStoreEntitlementsAll {
    export interface Entitlement {
        TypeID: string
        ItemID: string
        InstanceID: string
    }

    export interface EntitlementsByType {
        ItemTypeID: string
        Entitlements: Entitlement[]
    }
}

interface ValorantStoreEntitlementsAll {
    EntitlementsByTypes: ValorantStoreEntitlementsAll.EntitlementsByType[]
}
