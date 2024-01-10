<template>
    <div v-if="Object.values(weapons).length === 19 && identity" class="loadout-manager" @click="clickOutside">
        <div class="identity">
            <div class="banner" :style="`--bgi: url('${identity.BannerImageURL}')`" @click="clickIdentity($event, 'banner')"></div>
            <div v-if="identity.TitleText" class="title">{{ identity.TitleText }}</div>
        </div>
        <div class="sprays">
            <div
                class="spray pre"
                :class="{ active: selected_identity.type === 'pre-spray' }"
                :style="`--bgi: url('${identity.PreRoundSprayImageURL}')`"
                @click="clickIdentity($event, 'pre-spray')"
            >
                <div class="display-name">
                    <div class="name">{{ identity.PreRoundSprayName.replace(/ Spray$/, '') }}</div>
                </div>
            </div>
            <div
                class="spray mid"
                :class="{ active: selected_identity.type === 'mid-spray' }"
                :style="`--bgi: url('${identity.MidRoundSprayImageURL}')`"
                @click="clickIdentity($event, 'mid-spray')"
            >
                <div class="display-name">
                    <div class="name">{{ identity.MidRoundSprayName.replace(/ Spray$/, '') }}</div>
                </div>
            </div>
            <div
                class="spray post"
                :class="{ active: selected_identity.type === 'post-spray' }"
                :style="`--bgi: url('${identity.PostRoundSprayImageURL}')`"
                @click="clickIdentity($event, 'post-spray')"
            >
                <div class="display-name">
                    <div class="name">{{ identity.PostRoundSprayName.replace(/ Spray$/, '') }}</div>
                </div>
            </div>
        </div>
        <div class="weapons">
            <LoadoutWeapon v-for="gun in getWeaponsArray()" :weapon="gun" @click="clickWeapon($event, gun.WeaponID)" />
        </div>
        <IdentitySelector
            :type="selected_identity.type"
            :active="!!selected_identity.identity"
            :identity="selected_identity.identity"
            :left="selected_identity.left"
            :top="selected_identity.top"
            :gap="selected_identity.gap"
            :Inventory="Inventory"
            :LoadoutManager="LoadoutManager"
            @update:LoadoutManager="LoadoutManagerUpdate"
        />
        <LoadoutSelector
            :active="!!selected_weapon.weapon"
            :weapon="selected_weapon.weapon"
            :left="selected_weapon.left"
            :top="selected_weapon.top"
            :gap="selected_weapon.gap"
            :Inventory="Inventory"
            :LoadoutManager="LoadoutManager"
            @update:LoadoutManager="LoadoutManagerUpdate"
        />
        <div class="buttons">
            <Button class="undo" :disabled="!has_changes" text="Discard Changes" @click="undoChanges" />
            <Button class="save" :disabled="!has_changes" text="Apply Loadout" @click="saveChanges" />
        </div>
    </div>
    <NotReady v-else text="Waiting for VALORANT loadout data..."></NotReady>
</template>

<script lang="ts">
import { InventoryInstance, LoadoutManagerInstance } from '@/scripts/loadout_manager'
import SPRAY_EQUIP_SLOTS from '@/assets/valorant_api/spray_equip_slots.json'
import IdentitySelector from '@/components/Browser/IdentitySelector.vue'
import LoadoutSelector from '@/components/Browser/LoadoutSelector.vue'
import LoadoutWeapon from '@/components/Button/LoadoutWeapon.vue'
import { ValorantInstance } from '@/scripts/valorant_instance'
import WEAPONS from '@/assets/valorant_api/weapons.json'
import NotReady from '@/components/Content/NotReady.vue'
import * as ValorantAPI from '@/scripts/valorant_api'
import Button from '@/components/Input/Button.vue'

const Valorant = ValorantInstance()

const Cache = {
    Themes: ValorantAPI.getThemes(),
    Sprays: ValorantAPI.getSprays(),
    Bundles: ValorantAPI.getBundles(),
    Weapons: ValorantAPI.getWeapons(),
    Buddies: ValorantAPI.getBuddies(),
    WeaponSkins: ValorantAPI.mapWeaponSkins(),
    ContentTiers: ValorantAPI.getContentTiers(),
    PlayerCards: ValorantAPI.getPlayerCards(),
    PlayerTitles: ValorantAPI.getPlayerTitles()
}

export default {
    name: 'LoadoutManager',
    components: { IdentitySelector, NotReady, Button, LoadoutSelector, LoadoutWeapon },
    props: {
        isVisible: Boolean as () => boolean
    },
    data() {
        return {
            selected_identity: {
                type: null as 'banner' | 'pre-spray' | 'mid-spray' | 'post-spray' | null,
                identity: null as ProcessedIdentity | null,
                left: 0,
                top: 0,
                gap: 0
            },

            selected_weapon: {
                weapon: null as ProcessedLoadoutWeapon | null,
                left: 0,
                top: 0,
                gap: 0
            },

            weapons: {} as { [weaponId: string]: ProcessedLoadoutWeapon },
            identity: null as ProcessedIdentity | null,

            has_changes: false,

            Inventory: null as never as InventoryInstance,
            LoadoutManager: null as never as LoadoutManagerInstance
        }
    },
    async created() {
        this.Inventory = await InventoryInstance()
        this.LoadoutManager = await LoadoutManagerInstance()

        await this.processIdentity()
        await this.processWeapons()
    },
    mounted() {
        window.addEventListener('keydown', this.WindowKeyDownListener)
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.WindowKeyDownListener)
    },
    methods: {
        WindowKeyDownListener(event: KeyboardEvent) {
            if (!this.isVisible) return

            if (event.key === 'Escape') {
                this.clearIdentity()
                this.clearWeapon()
            }
        },
        undoChanges() {
            this.LoadoutManager.reset()
            this.LoadoutManagerUpdate(this.LoadoutManager)
        },
        saveChanges() {
            this.LoadoutManager.apply()
            this.LoadoutManagerUpdate(this.LoadoutManager)
        },
        async LoadoutManagerUpdate(LoadoutManager: LoadoutManagerInstance) {
            this.LoadoutManager = LoadoutManager
            this.has_changes = LoadoutManager.hasChanges()

            await this.processIdentity()
            await this.processWeapons()

            if (this.selected_identity.identity) this.selected_identity.identity = this.identity
            if (this.selected_weapon.weapon) this.selected_weapon.weapon = this.weapons[this.selected_weapon.weapon.WeaponID]
        },
        clickOutside(event: PointerEvent) {
            if (event.target?.['className'] !== 'loadout-manager') return
            this.clearIdentity()
            this.clearWeapon()
        },
        clearIdentity() {
            this.selected_identity.type = null
            this.selected_identity.identity = null
        },
        clickIdentity(event: PointerEvent, type: string) {
            const Target = event.target as Element
            if (!Target?.classList.contains('banner') && !Target?.classList.contains('spray')) return

            this.clearWeapon()

            if (this.selected_identity.type === type) {
                this.clearIdentity()
            } else {
                this.selected_identity.type = type

                this.selected_identity.identity = this.identity
                this.selected_identity.left = event.x - event.offsetX
                this.selected_identity.top = event.y - event.offsetY
                this.selected_identity.gap = event.target?.['clientWidth']

                if (type === 'mid-spray') this.selected_identity.top -= 83
                if (type === 'post-spray') this.selected_identity.top -= 166
            }
        },
        clearWeapon() {
            this.selected_weapon.weapon = null
        },
        clickWeapon(event: PointerEvent, weaponId: string) {
            const Target = event.target as Element
            if (!Target?.classList.contains('weapon')) return

            this.clearIdentity()

            if (this.selected_weapon.weapon?.WeaponID === weaponId) {
                this.clearWeapon()
            } else {
                this.selected_weapon.weapon = this.weapons[weaponId]
                this.selected_weapon.left = event.x - event.offsetX
                this.selected_weapon.top = event.y - event.offsetY
                this.selected_weapon.gap = event.target?.['clientWidth']

                if ([WEAPONS.sheriff, WEAPONS.odin, WEAPONS.melee].includes(weaponId)) this.selected_weapon.top -= 51
            }
        },
        parseEquippableCategory(category: string) {
            return category.replace('EEquippableCategory::', '').toLowerCase()
        },
        getWeaponsArray() {
            const WeaponsOrder = Object.values(WEAPONS)
            const Weapons: ProcessedLoadoutWeapon[] = Object.values(this.weapons)

            return Weapons.sort((a, b) => {
                const indexA = WeaponsOrder.findIndex((uuid) => uuid === a.WeaponID)
                const indexB = WeaponsOrder.findIndex((uuid) => uuid === b.WeaponID)

                return indexA - indexB
            })
        },
        async processIdentity() {
            if (!this.LoadoutManager) return
            const Sprays = await Cache.Sprays
            const PlayerCards = await Cache.PlayerCards
            const PlayerTitles = await Cache.PlayerTitles

            const LoadoutManager: LoadoutManagerInstance = this.LoadoutManager
            const Loadout = LoadoutManager.getLoadout()

            const LoadoutSpraysMap = new Map(Loadout.Sprays.map((spray) => [spray.EquipSlotID, spray.SprayID]))
            const PlayerTitlesMap = new Map(PlayerTitles.map((title) => [title.uuid, title]))
            const PlayerCardsMap = new Map(PlayerCards.map((card) => [card.uuid, card]))
            const SpraysMap = new Map(Sprays.map((spray) => [spray.uuid, spray]))

            const PlayerTitle = PlayerTitlesMap.get(Loadout.Identity.PlayerTitleID) || PlayerTitlesMap.get('d13e579c-435e-44d4-cec2-6eae5a3c5ed4')!
            const PlayerCard = PlayerCardsMap.get(Loadout.Identity.PlayerCardID) || PlayerCardsMap.get('0819fbcd-4bd4-c379-5384-52803440f2b2')!

            const PreRoundSpray = SpraysMap.get(LoadoutSpraysMap.get(SPRAY_EQUIP_SLOTS.preround)!)!
            const MidRoundSpray = SpraysMap.get(LoadoutSpraysMap.get(SPRAY_EQUIP_SLOTS.midround)!)!
            const PostRoundSpray = SpraysMap.get(LoadoutSpraysMap.get(SPRAY_EQUIP_SLOTS.postround)!)!

            this.identity = {
                TitleID: PlayerTitle.uuid,
                TitleText: PlayerTitle.titleText,

                BannerID: PlayerCard.uuid,
                BannerImageURL: PlayerCard.largeArt,

                PreRoundSprayID: PreRoundSpray.uuid,
                PreRoundSprayName: PreRoundSpray.displayName,
                PreRoundSprayImageURL: PreRoundSpray.fullTransparentIcon || PreRoundSpray.displayIcon,

                MidRoundSprayID: MidRoundSpray.uuid,
                MidRoundSprayName: MidRoundSpray.displayName,
                MidRoundSprayImageURL: MidRoundSpray.fullTransparentIcon || MidRoundSpray.displayIcon,

                PostRoundSprayID: PostRoundSpray.uuid,
                PostRoundSprayName: PostRoundSpray.displayName,
                PostRoundSprayImageURL: PostRoundSpray.fullTransparentIcon || PostRoundSpray.displayIcon
            }
        },
        async processWeapons() {
            if (!this.LoadoutManager) return
            const Weapons = await Cache.Weapons
            const WeaponSkins = await Cache.WeaponSkins
            const ContentTiers = await Cache.ContentTiers

            const LoadoutManager: LoadoutManagerInstance = this.LoadoutManager
            const Loadout = LoadoutManager.getLoadout()

            for (const Gun of Loadout.Guns) {
                const Weapon = Weapons.find((w) => w.uuid === Gun.ID)
                if (!Weapon) continue
                const WeaponSkin = WeaponSkins.find((skin) => skin.uuid === Gun.SkinID)
                if (!WeaponSkin) continue
                const ContentTier = ContentTiers.find((tier) => tier.uuid === WeaponSkin.contentTierUuid)

                const Override = {
                    WeaponID: Gun.ID,
                    WeaponCategory: this.parseEquippableCategory(Weapon.category),

                    SkinID: Gun.SkinID,
                    SkinName: WeaponSkin.displayName,
                    SkinImageURL: `https://media.valorant-api.com/weaponskinchromas/${Gun.ChromaID}/fullrender.png`,

                    LevelID: Gun.SkinLevelID,
                    ChromaID: Gun.ChromaID,

                    hasBuddy: !!Gun.CharmID,
                    BuddyImageURL: `https://media.valorant-api.com/buddies/${Gun.CharmID}/displayicon.png`,

                    ContentTierName: ContentTier?.devName.toLowerCase(),
                    ContentTierRank: ContentTier?.rank || 0
                }

                this.weapons[Gun.ID] = Override
            }
        }
    }
}
</script>

<style scoped>
.loadout-manager {
    --banner-width: 120px; /* 120px*/
    --weapon-height: 72px; /*  72px*/

    position: relative;

    width: 100%;
    height: 100%;
}

.loadout-manager > .buttons {
    position: absolute;
    left: 765px;
    top: 647px;

    display: flex;
    gap: 7px;
}
.loadout-manager > .buttons > .undo {
    --button-color: #18191c;
}
.loadout-manager > .buttons > .save {
    --button-color: #388e3c;
}

.loadout-manager > .sprays {
    position: absolute;
    left: 22px;
    top: 326px;

    display: flex;
    flex-direction: column;
    gap: 22px;

    width: var(--banner-width);
}
.loadout-manager > .sprays > .spray {
    position: relative;

    width: 100%;
    height: 61px;
    border-radius: 6px;

    background-position: center;
    background-repeat: no-repeat;
    background-image: var(--bgi);
    background-size: 80%;

    background-color: #202225;

    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
}
.loadout-manager > .sprays > .spray.active {
    background-color: #18191c;
}
.loadout-manager > .sprays > .spray > .display-name {
    display: flex;
    justify-content: center;

    position: absolute;
    bottom: -6px;
    left: 6px;

    height: 16px;
    width: calc(100% - 12px);

    pointer-events: none;
}
.loadout-manager > .sprays > .spray > .display-name > .name {
    height: 12px;
    padding: 2px 6px;
    border-radius: 6px;

    font-size: 11px;
    line-height: 12px;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    background-color: #18191c;

    transition: background-color 0.15s ease-in-out;
}
.loadout-manager > .sprays > .spray.active > .display-name > .name {
    background-color: #121314;
}

/**
    banner-width: 268px

    banner-height: 640px | 2.38806
 */
.loadout-manager > .identity {
    position: absolute;
    left: 22px;
    top: 22px;

    height: calc(var(--banner-width) * 2.38806);
    width: var(--banner-width);

    pointer-events: none;
}
.loadout-manager > .identity > .banner {
    height: 98.5%;
    width: 100%;

    background-image: var(--bgi);
    background-size: cover;

    border-radius: 6px;

    cursor: pointer;
    pointer-events: all;
}
.loadout-manager > .identity > .title {
    overflow-wrap: break-word;

    position: absolute;
    bottom: 90px;

    width: 100%;
    padding: 2px 0;
    font-size: 11px;
    line-height: 10px;

    backdrop-filter: blur(2px) brightness(0.666);
}

/**
    default-height: 160px

    sidearm-width: 270px | 1.6875
        smg-width: 433px | 2.70625
    shotgun-width: 433px | 2.70625
      rifle-width: 487px | 3.04375
     sniper-width: 526px | 3.2875
      heavy-width: 526px | 3.2875
      melee-width: 526px | 3.2875
 */
.loadout-manager > .weapons {
    position: absolute;
    left: calc(var(--banner-width) + 22px);
    top: 0;

    --row1-width: calc(var(--weapon-height) * 1.6875);
    --row2-width: calc(var(--weapon-height) * 2.70625);
    --row3-width: calc(var(--weapon-height) * 3.04375);
    --row4-width: calc(var(--weapon-height) * 3.2875);

    display: grid;
    grid-auto-flow: column;
    grid-template-columns: var(--row1-width) var(--row2-width) var(--row3-width) var(--row4-width);
    grid-template-rows: repeat(5, var(--weapon-height));
    grid-column-gap: 22px;
    grid-row-gap: 22px;

    margin: 22px;

    pointer-events: none;
}
.loadout-manager > .weapons :nth-child(n + 6) {
    grid-column: 2;
}
.loadout-manager > .weapons :nth-child(n + 10) {
    grid-column: 3;
}
.loadout-manager > .weapons :nth-child(n + 15) {
    grid-column: 4;
}
</style>
