declare module ValorantStoreEntitlementsBuddies {
    export interface Entitlement {
        TypeID: string
        ItemID: string
        InstanceID: string
    }
}

interface ValorantStoreEntitlementsBuddies {
    ItemTypeID: string
    Entitlements: ValorantStoreEntitlementsBuddies.Entitlement[]
}
