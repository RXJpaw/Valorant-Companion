<template>
    <div v-if="weapons.length > 0" class="loadout-manager">
        <div class="weapons">
            <LoadoutWeapon v-for="(weapon, index) in weapons" :weapon="weapon" @click="openSelector(weapon.WeaponUUID, $event.target)" />
        </div>
        <div class="interactions">
            <div class="buttons">
                <div class="button discard" :class="{ disabled: !hasChanges }" @click="discardLoadout">Discard Changes</div>
                <div class="button apply" :class="{ disabled: !hasChanges }" @click="applyLoadout">Apply Loadout</div>
            </div>
        </div>

        <transition-group>
            <div v-if="selector_show" class="selection-menu-background" @click="selector_show = false"></div>
            <div v-if="selector_show" class="selection-menu" :style="`transform-origin: ${selector_last_click}`">
                <div class="selected-weapon-flex">
                    <div class="selected-weapon">
                        <LoadoutWeapon :weapon="selected_weapon" :preview="true" />
                        <div v-if="selected_weapon.Levels.length > 1" class="levels">
                            <div class="button">
                                <div class="level">Level {{ selected_weapon.LevelIndex + 1 }}</div>
                            </div>
                        </div>
                        <div v-if="selected_weapon.Chromas.length > 1" class="chromas">
                            <div
                                class="button"
                                v-for="(chroma, index) in selected_weapon.Chromas"
                                :class="{ disabled: index !== 0 && !selected_weapon.ChromasOwned.find((c) => c === chroma.uuid) }"
                                @click="setSelectedSkinLevel(selected_weapon.Levels.at(-1).uuid, chroma.uuid)"
                            >
                                <div class="chroma" :style="`--bgi: url('${chroma.swatch}')`"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="entitlements-wrapper">
                    <div class="entitlements weapon mini" :class="selected_weapon.WeaponCategory">
                        <LoadoutWeapon
                            v-for="(entitlement, index) in entitlements"
                            :weapon="entitlement"
                            :mini="true"
                            @click="setSelectedSkin(entitlement.WeaponSkin)"
                        />
                    </div>
                </div>
            </div>
        </transition-group>
    </div>
    <NotReady v-else text="Waiting for VALORANT loadout data..."></NotReady>
</template>

<script lang="ts">
import { InventoryInstance, LoadoutManagerInstance } from '@/scripts/loadout_manager'
import LoadoutWeapon from '@/components/Browser/LoadoutWeapon.vue'
import { ValorantInstance } from '@/scripts/valorant_instance'
import WEAPONS from '@/assets/valorant_api/weapons.json'
import NotReady from '@/components/Content/NotReady.vue'
import * as ValorantAPI from '@/scripts/valorant_api'

const Valorant = ValorantInstance()

const Cache = {
    Themes: ValorantAPI.getThemes(),
    Bundles: ValorantAPI.getBundles(),
    Weapons: ValorantAPI.getWeapons(),
    Buddies: ValorantAPI.getBuddies(),
    WeaponSkins: ValorantAPI.mapWeaponSkins(),
    ContentTiers: ValorantAPI.getContentTiers()
}

export default {
    name: 'LoadoutManager',
    components: { LoadoutWeapon, NotReady },
    props: {
        isVisible: Boolean as () => boolean
    },
    data() {
        return {
            weapons: [],
            entitlements: [],
            hasChanges: false,
            inventory: InventoryInstance(),
            loadout_manager: LoadoutManagerInstance(),
            selector_last_click: '0 0',
            selected_weapon: {},
            selector_show: false
        }
    },
    async created() {
        window.addEventListener('keydown', this.KeyDownListener)

        this.weapons = await this.getWeapons()
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.KeyDownListener)
    },
    methods: {
        KeyDownListener(event: KeyboardEvent) {
            if (!this.isVisible) return

            if (event.key === 'Escape') {
                this.selector_show = false
            }
        },
        async openSelector(weapon_uuid, ref: Element) {
            const ElementRect = ref.getBoundingClientRect()

            this.selector_last_click = `${-256 + ElementRect.x + ElementRect.width / 2}px ${-32 + ElementRect.y}px`
            this.selected_weapon = this.weapons.find((weapon) => weapon.WeaponUUID === weapon_uuid)
            this.selector_show = true

            this.entitlements = await this.getEntitlements(weapon_uuid)
        },
        parseEquippableCategory(category: string) {
            return category.replace('EEquippableCategory::', '').toLowerCase()
        },
        async applyLoadout() {
            if (!this.hasChanges) return
            this.hasChanges = false

            const LoadoutManager = await this.loadout_manager
            await LoadoutManager.apply()
        },
        async discardLoadout() {
            if (!this.hasChanges) return
            this.hasChanges = false

            const LoadoutManager = await this.loadout_manager
            LoadoutManager.reset()

            this.weapons = await this.getWeapons()
        },
        async setSelectedSkinLevel(level, chroma) {
            const SelectedWeapon = this.selected_weapon
            const Inventory = await this.inventory
            if (SelectedWeapon.Chromas[0].uuid !== chroma && !Inventory.SkinChromas.find((c) => c.ItemID === chroma)) return
            if (SelectedWeapon.Levels[0].uuid !== level && !Inventory.SkinLevels.find((l) => l.ItemID === level)) return

            const LoadoutManager = await this.loadout_manager

            LoadoutManager.getWeapon(SelectedWeapon.WeaponUUID) //
                .setSkin(SelectedWeapon.WeaponSkin)
                .setSkinLevel(level)
                .setSkinChroma(chroma)

            this.weapons = await this.getWeapons()
            this.selected_weapon = this.weapons.find((weapon) => weapon.WeaponUUID === SelectedWeapon.WeaponUUID)
        },
        async setSelectedSkin(skin) {
            const SelectedWeapon = this.selected_weapon
            const WeaponSkins = await Cache.WeaponSkins

            const LoadoutManager = await this.loadout_manager
            const WeaponSkin = WeaponSkins.find((s) => s.uuid === skin)
            if (!WeaponSkin) return

            LoadoutManager.getWeapon(SelectedWeapon.WeaponUUID) //
                .setSkin(skin)
                .setSkinLevel(WeaponSkin.levels[0].uuid)
                .setSkinChroma(WeaponSkin.chromas[0].uuid)

            this.weapons = await this.getWeapons()
            this.selected_weapon = this.weapons.find((weapon) => weapon.WeaponUUID === SelectedWeapon.WeaponUUID)
        },
        async getWeapons() {
            const Themes = await Cache.Themes
            const Bundles = await Cache.Bundles
            const Weapons = await Cache.Weapons
            const WeaponSkins = await Cache.WeaponSkins
            const ContentTiers = await Cache.ContentTiers

            const LoadoutManager = await this.loadout_manager
            const Inventory = await this.inventory
            const Loadout = LoadoutManager.getLoadout()
            this.hasChanges = LoadoutManager.hasChanges()

            const WeaponsOrder = Object.values(WEAPONS)
            const LoadoutWeapons = Loadout.Guns.sort((a, b) => {
                const indexA = WeaponsOrder.findIndex((uuid) => uuid === a.ID)
                const indexB = WeaponsOrder.findIndex((uuid) => uuid === b.ID)

                return indexA - indexB
            })

            return LoadoutWeapons.map((entitlement) => {
                const WeaponSkin = WeaponSkins.find((skin) => skin.uuid === entitlement.SkinID)
                if (!WeaponSkin) return

                const Weapon = Weapons.find((w) => w.uuid === entitlement.ID)
                if (!Weapon) return

                // const Theme = Themes.find((theme) => theme.uuid === WeaponSkin.themeUuid)
                // const Bundle = Bundles.find((bundle) => Valorant.compareThemeAndBundleAssetPath(Theme?.assetPath, bundle.assetPath))
                const ContentTier = ContentTiers.find((tier) => tier.uuid === WeaponSkin.contentTierUuid)

                return {
                    WeaponUUID: entitlement.ID,
                    WeaponSkin: entitlement.SkinID,
                    DisplayName: WeaponSkin.displayName,
                    WeaponCategory: this.parseEquippableCategory(Weapon.category),

                    hasBuddy: !!entitlement.CharmID,
                    hasWallpaper: !!WeaponSkin.wallpaper,

                    Levels: WeaponSkin.levels,
                    LevelIndex: WeaponSkin.levels.findIndex((level) => level.uuid === entitlement.SkinLevelID),
                    LevelsOwned: Inventory.SkinLevels.filter((level) => WeaponSkin.levels.find((l) => l.uuid === level.ItemID)).map((T) => T.ItemID),
                    Chromas: WeaponSkin.chromas,
                    ChromaIndex: WeaponSkin.chromas.findIndex((chroma) => chroma.uuid === entitlement.ChromaID),
                    ChromasOwned: Inventory.SkinChromas.filter((chroma) => WeaponSkin.chromas.find((c) => c.uuid === chroma.ItemID)).map((T) => T.ItemID),

                    WallpaperURL: WeaponSkin.wallpaper,
                    BuddyIconURL: `https://media.valorant-api.com/buddies/${entitlement.CharmID}/displayicon.png`,
                    DisplayIconURL: `https://media.valorant-api.com/weaponskinchromas/${entitlement.ChromaID}/fullrender.png`,
                    ContentTierName: ContentTier?.devName.toLowerCase(),
                    ContentTierRank: ContentTier?.rank || 0
                }
            })
        },
        async getEntitlements(weapon_uuid) {
            const Themes = await Cache.Themes
            const Bundles = await Cache.Bundles
            const Weapons = await Cache.Weapons
            const ContentTiers = await Cache.ContentTiers

            const Weapon = Weapons.find((weapon) => weapon.uuid === weapon_uuid)
            if (!Weapon) return

            const WeaponSkins = Weapon.skins

            const Inventory = await this.inventory
            const Skins = Inventory.SkinLevels.map((level) => WeaponSkins.find((skin) => skin.levels[0].uuid === level.ItemID)).filter((T) => T)

            return Skins.map((skin) => {
                // const Theme = Themes.find((theme) => theme.uuid === skin.themeUuid)
                // const Bundle = Bundles.find((bundle) => Valorant.compareThemeAndBundleAssetPath(Theme?.assetPath, bundle.assetPath))
                const WeaponSkin = WeaponSkins.find((s) => s.uuid === skin.uuid)
                if (!WeaponSkin) return

                const ContentTier = ContentTiers.find((tier) => tier.uuid === skin.contentTierUuid)

                return {
                    WeaponUUID: weapon_uuid,
                    WeaponSkin: skin.uuid,
                    DisplayName: skin.displayName,
                    ContentTier: skin.contentTierUuid,
                    WeaponCategory: this.parseEquippableCategory(Weapon.category),

                    hasBuddy: null,
                    hasWallpaper: !!WeaponSkin.wallpaper,

                    WallpaperURL: WeaponSkin.wallpaper,
                    BuddyIconURL: null,
                    DisplayIconURL: skin.chromas[0].fullRender,
                    ContentTierName: ContentTier?.devName.toLowerCase(),
                    ContentTierRank: ContentTier?.rank || 0
                }
            }).sort((a, b) => {
                const scoreA = a.ContentTierRank * 100
                const scoreB = b.ContentTierRank * 100

                return a.DisplayName.localeCompare(b.DisplayName) + scoreB - scoreA
            })
        }
    }
}
</script>

<style scoped>
.selection-menu-background:is(.v-enter-active, .v-leave-active) {
    transition: opacity 0.3s ease;
}
.selection-menu-background:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
}
.selection-menu:is(.v-enter-active, .v-leave-active) {
    transition: transform 0.15s ease, opacity 0.15s ease;
}
.selection-menu:is(.v-enter-from, .v-leave-to) {
    transform: scale(0.5);
    opacity: 0;
}

.loadout-manager {
}

.loadout-manager > .selection-menu-background {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    background-color: #000000d0;
}

.loadout-manager > .selection-menu {
    overflow: hidden;
    position: absolute;
    top: 44px;
    left: 44px;

    width: 936px;
    height: 610px;
    background-color: #2f3136;

    border: 0 solid;
    border-radius: 6px;
}
.loadout-manager > .selection-menu > .selected-weapon-flex {
    position: absolute;
    top: 0;
    left: 0;

    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 142px;
    background: #202225;
}
.loadout-manager > .selection-menu > .selected-weapon-flex > .selected-weapon {
    position: relative;
}
.loadout-manager > .selection-menu > .selected-weapon-flex > .selected-weapon > .chromas {
    position: absolute;
    top: 30px;
    left: 100%;

    display: flex;
    align-content: flex-start;
    flex-wrap: wrap;
    gap: 10px;

    margin-left: 10px;
    height: 30px;
    width: max-content;
}
.loadout-manager > .selection-menu > .selected-weapon-flex > .selected-weapon > .levels {
    position: absolute;
    top: 0;
    left: 100%;

    margin-left: 10px;
    height: 20px;
    width: max-content;
}
.loadout-manager > .selection-menu > .selected-weapon-flex > .selected-weapon > .levels > .button,
.loadout-manager > .selection-menu > .selected-weapon-flex > .selected-weapon > .chromas > .button {
    background-color: #121314;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
}
.loadout-manager > .selection-menu > .selected-weapon-flex > .selected-weapon > .levels > .button {
    height: 20px;
    width: 150px;
}
.loadout-manager > .selection-menu > .selected-weapon-flex > .selected-weapon > .chromas > .button {
    height: 30px;
    width: 30px;
}
.loadout-manager > .selection-menu > .selected-weapon-flex > .selected-weapon > .levels > .button > .level {
    font-size: 14px;
    line-height: 10px;
    margin: 5px 0;
}
.loadout-manager > .selection-menu > .selected-weapon-flex > .selected-weapon > .chromas > .button > .chroma {
    transition: filter 0.05s ease-in-out, background-image 0.05s ease-in-out;

    background-image: var(--bgi);
    background-size: cover;

    height: 100%;
    width: 100%;
}
.loadout-manager > .selection-menu > .selected-weapon-flex > .selected-weapon > .chromas > .button.disabled {
    cursor: not-allowed;
}
.loadout-manager > .selection-menu > .selected-weapon-flex > .selected-weapon > .chromas > .button.disabled > .chroma {
    filter: blur(4px) brightness(0.5) grayscale(1);
}

.loadout-manager > .selection-menu > .entitlements-wrapper {
    overflow: var(--webkit-overlay);
    position: absolute;
    top: 142px;

    width: 100%;
    height: calc(100% - 142px);
}

.loadout-manager > .selection-menu > .entitlements-wrapper > .entitlements {
    position: absolute;

    display: grid;
    grid-template-columns: repeat(auto-fill, var(--weapon-width));
    grid-template-rows: repeat(auto-fill, 64px);
    justify-content: center;
    gap: 22px;

    width: calc(100% - 44px);
    margin: 22px;
    padding-bottom: 22px;
}
.loadout-manager > .interactions {
    position: absolute;
    bottom: 0;
    left: 0;

    margin: 22px;
    height: 32px;
    width: 980px;
}
.loadout-manager > .interactions > .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 22px;
}
.loadout-manager > .interactions > .buttons > .button {
    font-size: 14px;
    line-height: 10px;

    padding: 11px;
    border-radius: 6px;

    transition: background-color 0.15s ease-in-out, opacity 0.15s ease-in-out;
    cursor: pointer;
}
.loadout-manager > .interactions > .buttons > .button.apply {
    background-color: #2e8048;
    width: 100px;
}
.loadout-manager > .interactions > .buttons > .button:not(.disabled).apply:active {
    background-color: #205932;
}
.loadout-manager > .interactions > .buttons > .button.discard {
    background-color: #202225;
    width: 114px;
}
.loadout-manager > .interactions > .buttons > .button:not(.disabled).discard:active {
    background-color: #18191c;
}
.loadout-manager > .interactions > .buttons > .button.disabled {
    cursor: not-allowed;
    filter: opacity(0.75);
    background-color: #202225;
}

.loadout-manager > .weapons {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 142px 232px 260px 280px;
    grid-template-rows: repeat(5, 98px);
    grid-column-gap: 22px;
    grid-row-gap: 22px;

    margin: 22px;
}
.loadout-manager > .weapons :nth-child(n + 6) {
    grid-column: 2;
}
.loadout-manager > .weapons :nth-child(n + 10) {
    grid-column: 3;
}
.loadout-manager > .weapons :nth-child(n + 14) {
    grid-column: 4;
}

.weapon:not(.mini) {
    --weapon-height: 98px;
}
.weapon:not(.mini).sidearm {
    --weapon-width: 142px;
}
.weapon:not(.mini).smg {
    --weapon-width: 232px;
}
.weapon:not(.mini).shotgun {
    --weapon-width: 232px;
}
.weapon:not(.mini).rifle {
    --weapon-width: 260px;
}
.weapon:not(.mini).sniper {
    --weapon-width: 280px;
}
.weapon:not(.mini).heavy {
    --weapon-width: 280px;
}
.weapon:not(.mini).melee {
    --weapon-width: 280px;
}
.weapon.mini {
    --weapon-height: 64px;
}
.weapon.mini.sidearm {
    --weapon-width: 94px;
}
.weapon.mini.smg {
    --weapon-width: 154px;
}
.weapon.mini.shotgun {
    --weapon-width: 154px;
}
.weapon.mini.rifle {
    --weapon-width: 172px;
}
.weapon.mini.sniper {
    --weapon-width: 186px;
}
.weapon.mini.heavy {
    --weapon-width: 186px;
}
.weapon.mini.melee {
    --weapon-width: 186px;
}
</style>
