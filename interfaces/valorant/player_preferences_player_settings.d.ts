declare module ValorantAresPlayerSettings {
    export interface DataActionMappings {
        alt: boolean
        bindIndex: number
        characterName: string
        cmd: boolean
        ctrl: boolean
        key: string
        name: string
        shift: boolean
    }
    export interface DataAxisMappings {
        bindIndex: number
        characterName: string
        key: string
        name: string
        scale: number
    }
    export interface DataBoolSettings {
        settingEnum: string
        value: boolean
    }
    export interface DataFloatSettings {
        settingEnum: string
        value: number
    }
    export interface DataIntSettings {
        settingEnum: string
        value: number
    }
    export interface DataStringSettings {
        settingEnum: string
        value: string
    }
    export interface Data {
        actionMappings: DataActionMappings[]
        axisMappings: DataAxisMappings[]
        boolSettings: DataBoolSettings[]
        floatSettings: DataFloatSettings[]
        intSettings: DataIntSettings[]
        roamingSetttingsVersion: number
        settingsProfiles: string[]
        stringSettings: DataStringSettings[]
    }
}
interface ValorantAresPlayerSettings {
    data: ValorantAresPlayerSettings.Data
    modified: number
    type: string
}
