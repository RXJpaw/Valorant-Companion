declare module ValorantAPIMap {
    export interface Location {
        x: number
        y: number
    }

    export interface Callout {
        regionName: string
        superRegionName: string
        location: Location
    }
}

interface ValorantAPIMap {
    uuid: string
    displayName: string
    coordinates: string
    displayIcon: string
    listViewIcon: string
    splash: string
    assetPath: string
    mapUrl: string
    xMultiplier: number
    yMultiplier: number
    xScalarToAdd: number
    yScalarToAdd: number
    callouts: ValorantAPIMap.Callout[]
}
