import SPRAY_EQUIP_SLOTS from '@/assets/valorant_api/spray_equip_slots.json'
import DEFAULT_SKINS from '@/assets/valorant_api/default_skins.json'
import RANDOM_SKINS from '@/assets/valorant_api/random_skins.json'
import ENTITLEMENTS from '@/assets/valorant_api/entitlements.json'
import { ValorantInstance } from '@/scripts/valorant_instance'
import * as ValorantAPI from '@/scripts/valorant_api'

const Valorant = ValorantInstance()

export const InventoryInstance = async () => {
    const Entitlements = {
        Titles: Valorant.Entitlements.getTitles(),
        Sprays: Valorant.Entitlements.getSprays(),
        Banners: Valorant.Entitlements.getBanners(),
        Buddies: Valorant.Entitlements.getBuddies(),
        SkinLevels: Valorant.Entitlements.getSkinLevels(),
        SkinChromas: Valorant.Entitlements.getSkinChromas()
    }

    const Titles = await Entitlements.Titles
    const Sprays = await Entitlements.Sprays
    const Banners = await Entitlements.Banners
    const Buddies = await Entitlements.Buddies
    const SkinLevels = await Entitlements.SkinLevels
    const SkinChromas = await Entitlements.SkinChromas

    //Default Items
    Sprays.push({ TypeID: ENTITLEMENTS.sprays, ItemID: '0a6db78c-48b9-a32d-c47a-82be597584c1' })
    Banners.push({ TypeID: ENTITLEMENTS.banners, ItemID: '9fb348bc-41a0-91ad-8a3e-818035c4e561' })

    const DefaultLevels = Object.values(DEFAULT_SKINS).map((skin) => {
        return { TypeID: ENTITLEMENTS.skin_levels, ItemID: skin.level }
    })
    const DefaultChromas = Object.values(DEFAULT_SKINS).map((skin) => {
        return { TypeID: ENTITLEMENTS.skin_chromas, ItemID: skin.chroma }
    })
    const RandomLevels = Object.values(RANDOM_SKINS).map((skin) => {
        return { TypeID: ENTITLEMENTS.skin_levels, ItemID: skin.level }
    })
    const RandomChromas = Object.values(RANDOM_SKINS).map((skin) => {
        return { TypeID: ENTITLEMENTS.skin_chromas, ItemID: skin.chroma }
    })

    return {
        Titles: Titles,
        Sprays: Sprays,
        Banners: Banners,
        Buddies: Buddies,
        SkinLevels: SkinLevels.concat(DefaultLevels, RandomLevels),
        SkinChromas: SkinChromas.concat(DefaultChromas, RandomChromas)
    }
}

export const LoadoutManagerInstance = async () => {
    let RecoveryPoint = await Valorant.getSelfLoadout()
    let Favourites = await Valorant.getFavourites()
    let Loadout = structuredClone(RecoveryPoint)

    const WeaponBuilder = (GunIndex: number) => {
        return {
            setSkin: (uuid: string) => {
                Loadout.Guns[GunIndex].SkinID = uuid
                return WeaponBuilder(GunIndex)
            },
            setSkinLevel: (uuid: string) => {
                Loadout.Guns[GunIndex].SkinLevelID = uuid
                return WeaponBuilder(GunIndex)
            },
            setSkinChroma: (uuid: string) => {
                Loadout.Guns[GunIndex].ChromaID = uuid
                return WeaponBuilder(GunIndex)
            },

            setBuddy: (uuid: string) => {
                Loadout.Guns[GunIndex].CharmID = uuid
                return WeaponBuilder(GunIndex)
            },
            setBuddyLevel: (uuid: string) => {
                Loadout.Guns[GunIndex].CharmLevelID = uuid
                return WeaponBuilder(GunIndex)
            },
            setBuddyInstance: (uuid: string) => {
                Loadout.Guns[GunIndex].CharmInstanceID = uuid
                return WeaponBuilder(GunIndex)
            }
        }
    }

    const Base = {
        getLoadout: (): ValorantPersonalizationPlayerLoadout => structuredClone(Loadout),
        setPlayerCardID: (uuid: string) => {
            Loadout.Identity.PlayerCardID = uuid
        },
        setPlayerTitleID: (uuid: string) => {
            Loadout.Identity.PlayerTitleID = uuid
        },
        setAccountLevelVisibility: (visible: boolean) => {
            Loadout.Identity.HideAccountLevel = visible
        },
        setPreSpray: (uuid: string) => {
            const SprayIndex = Loadout.Sprays.findIndex((spray) => spray.EquipSlotID === SPRAY_EQUIP_SLOTS.preround)
            if (SprayIndex === -1) throw { error: 'Pre-Round Spray not found.', detail: uuid }

            Loadout.Sprays[SprayIndex].SprayID = uuid
        },
        setMidSpray: (uuid: string) => {
            const SprayIndex = Loadout.Sprays.findIndex((spray) => spray.EquipSlotID === SPRAY_EQUIP_SLOTS.midround)
            if (SprayIndex === -1) throw { error: 'Mid-Round Spray not found.', detail: uuid }

            Loadout.Sprays[SprayIndex].SprayID = uuid
        },
        setPostSpray: (uuid: string) => {
            const SprayIndex = Loadout.Sprays.findIndex((spray) => spray.EquipSlotID === SPRAY_EQUIP_SLOTS.postround)
            if (SprayIndex === -1) throw { error: 'Post-Round Spray not found.', detail: uuid }

            Loadout.Sprays[SprayIndex].SprayID = uuid
        },
        getWeapon: (uuid: string) => {
            const GunIndex = Loadout.Guns.findIndex((gun) => gun.ID === uuid)
            if (GunIndex === -1) throw { error: 'Weapon not found.', detail: uuid }

            return WeaponBuilder(GunIndex)
        },
        getFavourites: () => {
            return Favourites
        },
        addFavourite: async (itemId: string) => {
            Favourites.push(itemId)
            await Valorant.addFavourite(itemId)
        },
        deleteFavourite: async (itemId: string) => {
            const itemIndex = Favourites.findIndex((fav) => fav === itemId)
            if (itemIndex === -1) return

            Favourites.splice(itemIndex, 1)
            await Valorant.deleteFavourite(itemId)
        },
        hasChanges: () => {
            return JSON.stringify(Loadout) !== JSON.stringify(RecoveryPoint)
        },
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
