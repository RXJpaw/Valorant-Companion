declare module ValorantPreGameLoadouts {
    export interface Loadout {
        Sprays: LoadoutSprays
        Items: LoadoutItems
    }

    export interface LoadoutSprays {
        SpraySelections: LoadoutSpraysSpraySelection[]
    }
    export interface LoadoutSpraysSpraySelection {
        SocketID: string
        SprayID: string
        LevelID: string
    }

    export interface LoadoutItems {
        [weaponUUID: string]: LoadoutItem | undefined
    }
    export interface LoadoutItem {
        ID: string
        TypeID: string
        Sockets: LoadoutItemSockets
    }
    export interface LoadoutItemSockets {
        [socketUUID: string]: LoadoutItemSocket | undefined
    }
    export interface LoadoutItemSocket {
        ID: string
        Item: LoadoutItemSocketItem
    }
    export interface LoadoutItemSocketItem {
        ID: string
        TypeID: string
    }
}

interface ValorantPreGameLoadouts {
    Loadouts: ValorantPreGameLoadouts.Loadout[]
    LoadoutsValid: boolean
}
