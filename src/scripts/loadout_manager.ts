import { ValorantInstance } from '@/scripts/valorant_instance'
import * as ValorantAPI from '@/scripts/valorant_api'

const Valorant = ValorantInstance()

export const InventoryInstance = async () => {
    const Entitlements = {
        Buddies: await Valorant.Entitlements.getBuddies(),
        SkinLevels: await Valorant.Entitlements.getSkinLevels(),
        SkinChromas: await Valorant.Entitlements.getSkinChromas()
    }

    return { ...Entitlements }
}

export const LoadoutManagerInstance = async () => {
    let RecoveryPoint = await Valorant.getSelfLoadout()
    let Loadout = structuredClone(RecoveryPoint)
    let GunIndex: number | null

    const WeaponBuilder = {
        setSkin: (uuid: string) => {
            if (!GunIndex) return
            Loadout.Guns[GunIndex].SkinID = uuid
            return WeaponBuilder
        },
        setSkinLevel: (uuid: string) => {
            if (!GunIndex) return
            Loadout.Guns[GunIndex].SkinLevelID = uuid
            return WeaponBuilder
        },
        setSkinChroma: (uuid: string) => {
            if (!GunIndex) return
            Loadout.Guns[GunIndex].ChromaID = uuid
            return WeaponBuilder
        },

        setBuddy: (uuid: string) => {
            if (!GunIndex) return
            Loadout.Guns[GunIndex].CharmID = uuid
            return WeaponBuilder
        },
        setBuddyLevel: (uuid: string) => {
            if (!GunIndex) return
            Loadout.Guns[GunIndex].CharmLevelID = uuid
            return WeaponBuilder
        },
        setBuddyInstance: (uuid: string) => {
            if (!GunIndex) return
            Loadout.Guns[GunIndex].CharmInstanceID = uuid
            return WeaponBuilder
        }
    }

    const Base = {
        setPlayerCardID: (uuid) => {
            Loadout.Identity.PlayerTitleID = uuid
        },
        setPlayerTitleID: (uuid) => {
            Loadout.Identity.PlayerTitleID = uuid
        },
        setAccountLevelVisibility: (visible: boolean) => {
            Loadout.Identity.HideAccountLevel = visible
        },
        getLoadout: () => structuredClone(Loadout),
        getWeapon: (uuid) => {
            const index = Loadout.Guns.findIndex((gun) => gun.ID === uuid)
            if (index === -1) throw Error('No Weapon found with UUID ' + uuid)

            GunIndex = index

            return WeaponBuilder
        },
        hasChanges: () => JSON.stringify(Loadout) !== JSON.stringify(RecoveryPoint),
        reset: () => {
            Loadout = structuredClone(RecoveryPoint)
        },
        apply: async () => {
            RecoveryPoint = structuredClone(Loadout)

            await Valorant.putSelfLoadout({
                Guns: Loadout.Guns,
                Sprays: Loadout.Sprays,
                Identity: {
                    PlayerCardID: Loadout.Identity.PlayerCardID,
                    HideAccountLevel: Loadout.Identity.HideAccountLevel,
                    PlayerTitleID: Loadout.Identity.PlayerTitleID,
                    PreferredLevelBorderID: Loadout.Identity.PreferredLevelBorderID
                },
                Incognito: Loadout.Incognito
            })
        }
    }

    return { ...Base }
}
