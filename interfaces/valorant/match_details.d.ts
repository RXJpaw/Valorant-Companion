declare module ValorantMatchDetails {
    export type PartyRRPenalties = { [key: string]: number }

    export interface MatchInfo {
        matchId: string
        mapId: string
        gamePodId: string
        gameLoopZone: string
        gameServerAddress: string
        gameVersion: string
        gameLengthMillis: number
        gameStartMillis: number
        provisioningFlowID: string
        isCompleted: boolean
        customGameName: string
        forcePostProcessing: boolean
        queueID: string
        gameMode: string
        isRanked: boolean
        isMatchSampled: boolean
        seasonId: string
        completionState: string
        platformType: string
        partyRRPenalties: PartyRRPenalties
        shouldMatchDisablePenalties: boolean
    }

    export interface PlatformInfo {
        platformType: string
        platformOS: string
        platformOSVersion: string
        platformChipset: string
    }

    export interface AbilityCasts {
        grenadeCasts: number
        ability1Casts: number
        ability2Casts: number
        ultimateCasts: number
    }

    export interface Stats {
        score: number
        roundsPlayed: number
        kills: number
        deaths: number
        assists: number
        playtimeMillis: number
        abilityCasts: AbilityCasts
    }

    export interface RoundDamage {
        round: number
        receiver: string
        damage: number
    }

    export interface XpModification {
        Value: number
        ID: string
    }

    export interface BehaviorFactors {
        afkRounds: number
        collisions: number
        damageParticipationOutgoing: number
        friendlyFireIncoming: number
        friendlyFireOutgoing: number
        mouseMovement: number
        stayedInSpawnRounds: number
    }

    export interface BasicMovement {
        idleTimeMillis: number
        objectiveCompleteTimeMillis: number
    }

    export interface BasicGunSkill {
        idleTimeMillis: number
        objectiveCompleteTimeMillis: number
    }

    export interface AdaptiveBots {
        idleTimeMillis: number
        objectiveCompleteTimeMillis: number
        adaptiveBotAverageDurationMillisAllAttempts: number
        adaptiveBotAverageDurationMillisFirstAttempt: number
        killDetailsFirstAttempt?: any
    }

    export interface Ability {
        idleTimeMillis: number
        objectiveCompleteTimeMillis: number
    }

    export interface BombPlant {
        idleTimeMillis: number
        objectiveCompleteTimeMillis: number
    }

    export interface DefendBombSite {
        idleTimeMillis: number
        objectiveCompleteTimeMillis: number
        success: boolean
    }

    export interface SettingStatus {
        isMouseSensitivityDefault: boolean
        isCrosshairDefault: boolean
    }

    export interface NewPlayerExperienceDetails {
        basicMovement: BasicMovement
        basicGunSkill: BasicGunSkill
        adaptiveBots: AdaptiveBots
        ability: Ability
        bombPlant: BombPlant
        defendBombSite: DefendBombSite
        settingStatus: SettingStatus
    }

    export interface Player {
        subject: string
        gameName: string
        tagLine: string
        platformInfo: PlatformInfo
        teamId: string
        partyId: string
        characterId: string
        stats: Stats
        roundDamage: RoundDamage[]
        competitiveTier: number
        playerCard: string
        playerTitle: string
        preferredLevelBorder: string
        accountLevel: number
        sessionPlaytimeMinutes: number
        xpModifications: XpModification[]
        behaviorFactors: BehaviorFactors
        newPlayerExperienceDetails: NewPlayerExperienceDetails
    }

    export interface Team {
        teamId: string
        won: boolean
        roundsPlayed: number
        roundsWon: number
        numPoints: number
    }

    export interface Location {
        x: number
        y: number
    }

    export interface PlantPlayerLocation {
        subject: string
        viewRadians: number
        location: Location
    }

    export interface PlantLocation {
        x: number
        y: number
    }

    export interface Location2 {
        x: number
        y: number
    }

    export interface DefusePlayerLocation {
        subject: string
        viewRadians: number
        location: Location2
    }

    export interface DefuseLocation {
        x: number
        y: number
    }

    export interface VictimLocation {
        x: number
        y: number
    }

    export interface Location3 {
        x: number
        y: number
    }

    export interface PlayerLocation {
        subject: string
        viewRadians: number
        location: Location3
    }

    export interface FinishingDamage {
        damageType: string
        damageItem: string
        isSecondaryFireMode: boolean
    }

    export interface Kill {
        gameTime: number
        roundTime: number
        killer: string
        victim: string
        victimLocation: VictimLocation
        assistants: string[]
        playerLocations: PlayerLocation[]
        finishingDamage: FinishingDamage
    }

    export interface Damage {
        receiver: string
        damage: number
        legshots: number
        bodyshots: number
        headshots: number
    }

    export interface Economy {
        loadoutValue: number
        weapon: string
        armor: string
        remaining: number
        spent: number
    }

    export interface Ability2 {
        grenadeEffects?: any
        ability1Effects?: any
        ability2Effects?: any
        ultimateEffects?: any
    }

    export interface PlayerStat {
        subject: string
        kills: Kill[]
        damage: Damage[]
        score: number
        economy: Economy
        ability: Ability2
        wasAfk: boolean
        wasPenalized: boolean
        stayedInSpawn: boolean
    }

    export interface PlayerEconomy {
        subject: string
        loadoutValue: number
        weapon: string
        armor: string
        remaining: number
        spent: number
    }

    export interface PlayerScore {
        subject: string
        score: number
    }

    export interface RoundResult {
        roundNum: number
        roundResult: string
        roundCeremony: string
        winningTeam: string
        bombPlanter: string
        bombDefuser: string
        plantRoundTime: number
        plantPlayerLocations: PlantPlayerLocation[]
        plantLocation: PlantLocation
        plantSite: string
        defuseRoundTime: number
        defusePlayerLocations: DefusePlayerLocation[]
        defuseLocation: DefuseLocation
        playerStats: PlayerStat[]
        roundResultCode: string
        playerEconomies: PlayerEconomy[]
        playerScores: PlayerScore[]
    }

    export interface VictimLocation2 {
        x: number
        y: number
    }

    export interface Location4 {
        x: number
        y: number
    }

    export interface PlayerLocation2 {
        subject: string
        viewRadians: number
        location: Location4
    }

    export interface FinishingDamage2 {
        damageType: string
        damageItem: string
        isSecondaryFireMode: boolean
    }

    export interface Kill2 {
        gameTime: number
        roundTime: number
        round: number
        killer: string
        victim: string
        victimLocation: VictimLocation2
        assistants: string[]
        playerLocations: PlayerLocation2[]
        finishingDamage: FinishingDamage2
    }
}

interface ValorantMatchDetails {
    matchInfo: ValorantMatchDetails.MatchInfo
    players: ValorantMatchDetails.Player[]
    bots: any[]
    coaches: any[]
    teams: ValorantMatchDetails.Team[]
    roundResults: ValorantMatchDetails.RoundResult[]
    kills: ValorantMatchDetails.Kill2[]
    httpStatus?: string
}
