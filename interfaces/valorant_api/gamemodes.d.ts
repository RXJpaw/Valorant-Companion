declare module ValorantAPIGameMode {
    export interface GameFeatureOverride {
        featureName: string
        state: boolean
    }

    export interface GameRuleBoolOverride {
        ruleName: string
        state: boolean
    }
}

interface ValorantAPIGameMode {
    uuid: string
    displayName: string
    duration: string
    allowsMatchTimeouts: boolean
    isTeamVoiceAllowed: boolean
    isMinimapHidden: boolean
    orbCount: number
    teamRoles: string[]
    gameFeatureOverrides: ValorantAPIGameMode.GameFeatureOverride[]
    gameRuleBoolOverrides: ValorantAPIGameMode.GameRuleBoolOverride[]
    displayIcon: string
    assetPath: string
}
