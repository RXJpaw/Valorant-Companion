<template>
    <transition>
        <div v-if="active" class="loadout-selector" :class="{ [weapon.WeaponCategory]: true }" :style="getSelectorStyle()">
            <div class="preview">
                <LoadoutWeapon :hide_name="true" :weapon="weapon" />
                <LoadoutChromaLevel
                    :weapon="weapon"
                    :owned_skins="skins"
                    :owned_levels="owned.levels"
                    :owned_chromas="owned.chromas"
                    @update:chroma="selectWeaponSkin(weapon.WeaponID, 'chroma', $event)"
                    @update:level="selectWeaponSkin(weapon.WeaponID, 'level', $event)"
                />
            </div>
            <div class="filter" :class="{ scrolled }">
                <div v-if="weapon.WeaponCategory !== 'melee'" class="switch" :class="selector === 'weapons' ? 'buddies' : 'weapons'" @click="toggleSelector">
                    {{ selector === 'weapons' ? 'Buddies' : 'Weapons' }}
                </div>
                <div class="query">
                    <input type="text" v-model="search_query" spellcheck="false" :placeholder="selector === 'weapons' ? 'Search Weapons' : 'Search Buddies'" />
                </div>
            </div>
            <div v-if="selector === 'weapons'" class="weapons" ref="items" @scroll="processSelectorScroll()">
                <LoadoutWeaponMini
                    v-for="skin in getSkinsQuery()"
                    :skin="skin"
                    :weapon_category="weapon.WeaponCategory"
                    @click="selectWeaponSkin(weapon.WeaponID, 'base', skin.entry.uuid)"
                    @addfav:skin="addFavourite($event)"
                    @delfav:skin="deleteFavourite($event)"
                />
            </div>
            <div v-else-if="selector === 'buddies'" class="buddies" ref="items" @scroll="processSelectorScroll()">
                <LoadoutBuddyMini
                    v-for="buddy in getBuddiesQuery()"
                    :buddy="buddy"
                    @update:buddy="selectBuddy(weapon.WeaponID, ...$event)"
                    @addfav:buddy="addFavourite($event)"
                    @delfav:buddy="deleteFavourite($event)"
                />
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import LoadoutChromaLevel from '@/components/Browser/LoadoutChromaLevel.vue'
import LoadoutWeaponMini from '@/components/Button/LoadoutWeaponMini.vue'
import LoadoutBuddyMini from '@/components/Button/LoadoutBuddyMini.vue'
import CONTENT_TIERS from '@/assets/valorant_api/content_tiers.json'
import LoadoutWeapon from '@/components/Button/LoadoutWeapon.vue'
import { ValorantInstance } from '@/scripts/valorant_instance'
import WEAPONS from '@/assets/valorant_api/weapons.json'
import * as ValorantAPI from '@/scripts/valorant_api'

const Valorant = ValorantInstance()

const Cache = {
    Weapons: ValorantAPI.getWeapons(),
    Buddies: ValorantAPI.getBuddies(),
    WeaponSkins: ValorantAPI.mapWeaponSkins()
}

export default {
    name: 'LoadoutSelector',
    components: { LoadoutChromaLevel, LoadoutBuddyMini, LoadoutWeapon, LoadoutWeaponMini },
    props: {
        active: Boolean as () => boolean,
        weapon: Object as () => ProcessedLoadoutWeapon,
        left: Number as () => number,
        top: Number as () => number,
        gap: Number as () => number,
        Inventory: Object as () => InventoryInstance,
        LoadoutManager: Object as () => LoadoutManagerInstance
    },
    data() {
        return {
            skins: {} as { [uuid: string]: ProcessedLoadoutSkin },
            buddies: {} as { [uuid: string]: ProcessedLoadoutBuddy },
            selector: 'weapons' as 'weapons' | 'buddies',

            scrolled: false,
            search_query: '',

            owned: {
                levels: [] as string[],
                chromas: [] as string[]
            }
        }
    },
    watch: {
        weapon: {
            handler(current?: ProcessedLoadoutWeapon, before?: ProcessedLoadoutWeapon) {
                if (!current) {
                    this.search_query = ''
                    this.selector = 'weapons'
                    this.scrolled = false
                } else {
                    this.processSkins(current.WeaponID)
                    this.processBuddies()

                    if (current.WeaponID === before?.WeaponID) return
                    if (current.WeaponCategory === 'melee') this.selector = 'weapons'
                    this.$refs.items?.scrollTo({ top: 0, behavior: 'auto' })
                    this.scrolled = false
                }
            },
            deep: true
        }
    },
    methods: {
        toggleSelector() {
            this.search_query = ''
            this.selector = this.selector === 'weapons' ? 'buddies' : 'weapons'
            this.scrolled = false
        },
        processSelectorScroll() {
            const scroll = this.$refs.items?.scrollTop
            if (scroll === 0 && !this.scrolled) return
            if (scroll > 0 && this.scrolled) return

            this.scrolled = scroll > 0
        },
        emitLoadoutManagerUpdate() {
            this.$emit('update:LoadoutManager', this.LoadoutManager)
        },
        getBuddiesQuery() {
            const Buddies: ProcessedLoadoutBuddy[] = Object.values(this.buddies)

            const FilteredBuddies = Buddies.filter((buddy) => buddy.entry.displayName.toLowerCase().includes(this.search_query.toLowerCase()))

            return FilteredBuddies.sort((a, b) => {
                const LocaleCompare = a.entry.displayName.localeCompare(b.entry.displayName)
                const Unequip = (b.entry.uuid === 'unequip' ? -10 : 0) - (a.entry.uuid === 'unequip' ? -10 : 0)
                const Fav = (b.fav ? 10 : 0) - (a.fav ? 10 : 0)

                return Fav + LocaleCompare + Unequip
            })
        },
        getSkinsQuery() {
            const Skins: ProcessedLoadoutSkin[] = Object.values(this.skins)

            const FilteredSkins = Skins.filter((skin) => skin.entry.displayName.toLowerCase().includes(this.search_query.toLowerCase()))

            return FilteredSkins.sort((a, b) => {
                const ContentTierCompare = CONTENT_TIERS[b.entry.contentTierUuid].juice - CONTENT_TIERS[a.entry.contentTierUuid].juice
                const LocaleCompare = a.entry.displayName.localeCompare(b.entry.displayName)
                const Fav = (b.fav ? 2000 : 0) - (a.fav ? 2000 : 0)

                return Fav + LocaleCompare + ContentTierCompare * 10
            })
        },
        addFavourite(itemId: string) {
            this.LoadoutManager.addFavourite(itemId)
            this.emitLoadoutManagerUpdate()
        },
        deleteFavourite(itemId: string) {
            this.LoadoutManager.deleteFavourite(itemId)
            this.emitLoadoutManagerUpdate()
        },
        async selectBuddy(weaponUuid: string, buddyUuid: string, levelUuid: string, instanceUuid: string, removeWeaponUuid?: string) {
            if (removeWeaponUuid) {
                this.LoadoutManager.getWeapon(removeWeaponUuid) //
                    .setBuddy(undefined!)
                    .setBuddyLevel(undefined!)
                    .setBuddyInstance(undefined!)
            }

            this.LoadoutManager.getWeapon(weaponUuid) //
                .setBuddy(buddyUuid)
                .setBuddyLevel(levelUuid)
                .setBuddyInstance(instanceUuid)

            this.emitLoadoutManagerUpdate()
        },
        async selectWeaponSkin(weaponUuid: string, type: 'base' | 'level' | 'chroma', typeUuid: string) {
            const WeaponSkins = await Cache.WeaponSkins

            if (type === 'base') {
                if (typeUuid === this.weapon.SkinID) return

                const Skin = WeaponSkins.find((skin) => skin.uuid === typeUuid)
                if (!Skin) throw { error: 'base_uuid_not_found' }

                this.LoadoutManager.getWeapon(weaponUuid) //
                    .setSkin(typeUuid)
                    .setSkinLevel(Skin.levels[0].uuid)
                    .setSkinChroma(Skin.chromas[0].uuid)
            } else if (type === 'level') {
                if (typeUuid === this.weapon.LevelID) return

                const Skin = WeaponSkins.find((skin) => skin.levels.find((level) => level.uuid === typeUuid))
                if (!Skin) throw { error: 'level_uuid_not_found' }

                this.LoadoutManager.getWeapon(weaponUuid) //
                    .setSkin(Skin.uuid)
                    .setSkinLevel(typeUuid)
                    .setSkinChroma(Skin.chromas[0].uuid)
            } else if (type === 'chroma') {
                if (typeUuid === this.weapon.ChromaID) return

                const Skin = WeaponSkins.find((skin) => skin.chromas.find((chroma) => chroma.uuid === typeUuid))
                if (!Skin) throw { error: 'chroma_uuid_not_found' }

                const HighestLevelUUID = Skin.levels.at(-1)!.uuid
                const OwnsHighestLevel = this.owned.levels.includes(HighestLevelUUID)
                const LevelUUID = OwnsHighestLevel ? HighestLevelUUID : Skin.levels[0].uuid
                const ChromaUUID = OwnsHighestLevel ? typeUuid : Skin.chromas[0].uuid

                this.LoadoutManager.getWeapon(weaponUuid) //
                    .setSkin(Skin.uuid)
                    .setSkinLevel(LevelUUID)
                    .setSkinChroma(ChromaUUID)
            }

            this.emitLoadoutManagerUpdate()
        },
        async processBuddies() {
            const Buddies = await Cache.Buddies
            const Inventory: InventoryInstance = this.Inventory
            const LoadoutManager: LoadoutManagerInstance = this.LoadoutManager

            const BuddiesMap = new Map(Buddies.map((buddy) => [buddy.levels[0].uuid, buddy]))
            const LoadoutMap = new Map(LoadoutManager.getLoadout().Guns.map((gun) => [gun.CharmInstanceID, gun]))
            const FavouritesMap = new Map(LoadoutManager.getFavourites().map((fav) => [fav, true]))

            const OwnedBuddies = {}
            for (const { ItemID: BuddyLevel, InstanceID: Instance } of Inventory.Buddies) {
                const Buddy = BuddiesMap.get(BuddyLevel)
                if (!Buddy) continue

                const Favourite = FavouritesMap.get(Buddy.uuid)

                if (!OwnedBuddies[Buddy.uuid]) OwnedBuddies[Buddy.uuid] = { entry: Buddy, fav: !!Favourite, instances: [] }
                const InstanceUsage = LoadoutMap.get(Instance)
                OwnedBuddies[Buddy.uuid].instances.push({ id: Instance, usage: InstanceUsage })
            }

            OwnedBuddies['unequip'] = {
                entry: {
                    uuid: 'unequip',
                    displayName: 'Unequip'
                },
                fav: null,
                instances: []
            }

            this.buddies = OwnedBuddies
        },
        async processSkins(weaponId: string) {
            const Weapons = await Cache.Weapons
            const Inventory: InventoryInstance = this.Inventory
            const LoadoutManager: LoadoutManagerInstance = this.LoadoutManager

            const Weapon = Weapons.find((weapon) => weapon.uuid === weaponId)
            if (!Weapon) return

            const SkinsMap = new Map(Weapon.skins.map((skin) => [skin.levels[0].uuid, skin]))
            const FavouritesMap = new Map(LoadoutManager.getFavourites().map((fav) => [fav, true]))

            const OwnedSkins = {}
            const OwnedLevels = [] as string[]
            for (const { ItemID: SkinLevel } of Inventory.SkinLevels) {
                OwnedLevels.push(SkinLevel)

                const Skin = SkinsMap.get(SkinLevel)
                if (!Skin) continue

                if (OwnedSkins[Skin.uuid]) continue

                //Melees are always exclusive skins, this is not representative.
                if (weaponId === WEAPONS.melee) {
                    if (Skin.displayName === 'Melee') Skin.displayName = 'Standard Melee'

                    for (const FindWeapon of Weapons.filter((w) => w.uuid !== WEAPONS.melee)) {
                        for (const FindSkin of FindWeapon.skins) {
                            if (FindSkin.themeUuid === Skin.themeUuid) {
                                Skin.contentTierUuid = FindSkin.contentTierUuid
                                break
                            }
                        }
                    }
                }

                const Favourite = FavouritesMap.get(Skin.chromas[0].uuid)

                OwnedSkins[Skin.uuid] = { entry: Skin, fav: !!Favourite }
            }

            const OwnedChromas = [] as string[]
            for (const { ItemID: SkinChroma } of Inventory.SkinChromas) {
                OwnedChromas.push(SkinChroma)
            }

            this.owned.chromas = OwnedChromas
            this.owned.levels = OwnedLevels
            this.skins = OwnedSkins
        },
        getSelectorStyle() {
            switch (this.weapon.WeaponCategory) {
                case 'sidearm': {
                    return { width: '488px', top: `${this.top}px`, left: `${this.left + this.gap + 11}px` }
                }
                case 'smg':
                case 'shotgun': {
                    return { width: '450px', top: `${this.top}px`, left: `${this.left + this.gap + 11}px` }
                }
                case 'rifle': {
                    return { width: '501px', top: `${this.top}px`, left: `${this.left - 501 - 11}px` }
                }
                case 'sniper':
                case 'heavy': {
                    return { width: '537px', top: `${this.top}px`, left: `${this.left - 537 - 11}px` }
                }
                case 'melee': {
                    return { width: '529px', top: `${this.top}px`, left: `${this.left - 529 - 11}px` }
                }
            }
        }
    }
}
</script>

<style scoped>
.loadout-selector:is(.sidearm, .smg, .shotgun):is(.v-enter-from, .v-leave-to) {
    margin-left: -11px;
    opacity: 0;
}
.loadout-selector:is(.rifle, .sniper, .heavy, .melee):is(.v-enter-from, .v-leave-to) {
    margin-left: 11px;
    opacity: 0;
}

.loadout-selector {
    position: fixed;
    z-index: 210;

    scale: 1;
    margin-left: 0;

    height: 340px;
    border-radius: 6px;

    outline: 3px solid #121314;
    outline-offset: -3px;
    background-color: #121314;

    transition: opacity ease-in-out 0.15s, left ease-in-out 0.15s, top ease-in-out 0.15s, width ease-in-out 0.15s, margin-left ease-in-out 0.15s;
}
.loadout-selector.v-leave-to {
    z-index: 200;
}

.loadout-selector > .filter {
    position: relative;

    display: flex;
    align-items: flex-end;
    justify-content: center;

    width: 100%;
    height: 25px;
    margin-bottom: 0;

    background-color: #121314;

    transition: height 0.15s ease-in-out, margin-bottom 0.15s ease-in-out;
}
.loadout-selector > .filter.scrolled {
    height: calc(25px - 3px);
    margin-bottom: 3px;
}

.loadout-selector > .filter > .query {
    position: relative;

    width: 134px;
    height: 10px;
    padding: 6px 8px 4px;
    border-radius: 6px 6px 0 0;

    background-color: #202225;

    transition: padding 0.15s ease-in-out, border-radius 0.15s ease-in-out;
}
.loadout-selector > .filter.scrolled > .switch,
.loadout-selector > .filter.scrolled > .query {
    padding: 6px 8px 6px;
    border-radius: 6px;
}

.loadout-selector > .filter > .query > input {
    position: relative;
    bottom: 5px;

    color: #f2f3f5;
    width: 100%;
    height: 200%;

    border: 0;
    outline: 0;
    padding: 0;
    background: transparent;
    font-family: inherit;
}
.loadout-selector > .filter > .query > input::placeholder {
    color: #6d6f78;
}
.loadout-selector > .filter > .switch {
    position: absolute;
    bottom: 0;
    left: 11px;

    color: #6d6f78;
    padding: 6px 8px 4px;
    font-size: 14px;
    line-height: 10px;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;

    background-color: #202225;

    user-select: none;
    transition: padding 0.15s ease-in-out, border-radius 0.15s ease-in-out;
    cursor: pointer;
}

.loadout-selector > .preview {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 11px;

    height: 93px;
    width: 100%;
}
.loadout-selector > .preview > .weapon {
    --weapon-height: 72px;

    width: var(--weapon-width);
    height: var(--weapon-height);

    background-color: #121314;

    pointer-events: none;
}
.loadout-selector > .preview > .weapon:is(.sidearm) {
    --weapon-width: calc(var(--weapon-height) * 1.6875);
}
.loadout-selector > .preview > .weapon:is(.smg, .shotgun) {
    --weapon-width: calc(var(--weapon-height) * 2.70625);
}
.loadout-selector > .preview > .weapon:is(.rifle) {
    --weapon-width: calc(var(--weapon-height) * 3.04375);
}
.loadout-selector > .preview > .weapon:is(.sniper, .heavy) {
    --weapon-width: calc(var(--weapon-height) * 3.2875);
}
.loadout-selector > .preview > .weapon:is(.melee) {
    --weapon-width: calc(var(--weapon-height) * 2.37037);
}

/*.loadout-selector > .weapons {*/
/*    display: flex;*/
/*    flex-wrap: wrap;*/
/*    align-content: flex-start;*/
/*    gap: 11px;*/
/*}*/

.loadout-selector > .buddies {
    --buddy-height: 70px;

    overflow-y: var(--webkit-overlay);
    overflow-x: hidden;

    display: grid;
    grid-auto-flow: row;
    grid-template-columns: repeat(var(--columns-amount), var(--buddy-width));
    grid-template-rows: repeat(auto-fit, var(--buddy-height));
    grid-column-gap: 11px;
    grid-row-gap: 11px;

    padding: 8px;
    min-height: 203px;
    max-height: 203px;
    margin-right: 3px;
    margin-left: 3px;

    background-color: #202225;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
}
.loadout-selector:is(.sidearm) > .buddies {
    --columns-amount: 4;
    --buddy-width: 108.2px;
}
.loadout-selector:is(.smg, .shotgun) > .buddies {
    --columns-amount: 4;
    --buddy-width: 98.7px;
}
.loadout-selector:is(.rifle) > .buddies {
    --columns-amount: 4;
    --buddy-width: 111.4px;
}
.loadout-selector:is(.sniper, .heavy) > .buddies {
    --columns-amount: 4;
    --buddy-width: 120.4px;
}
.loadout-selector:is(.melee) > .buddies {
    --columns-amount: 4;
    --buddy-width: 118.4px;
}

.loadout-selector > .weapons {
    --weapon-height: 50px;

    overflow-y: var(--webkit-overlay);
    overflow-x: hidden;

    display: grid;
    grid-auto-flow: row;
    grid-template-columns: repeat(var(--columns-amount), var(--weapon-width));
    grid-template-rows: repeat(auto-fit, var(--weapon-height));
    grid-column-gap: 11px;
    grid-row-gap: 11px;

    padding: 8px;
    min-height: 203px;
    max-height: 203px;
    margin-right: 3px;
    margin-left: 3px;

    background-color: #202225;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
}
.loadout-selector:is(.sidearm) > .weapons {
    --columns-amount: 5;
    --weapon-width: calc(var(--weapon-height) * 1.6875);
}
.loadout-selector:is(.smg, .shotgun) > .weapons {
    --columns-amount: 3;
    --weapon-width: calc(var(--weapon-height) * 2.70625);
}
.loadout-selector:is(.rifle) > .weapons {
    --columns-amount: 3;
    --weapon-width: calc(var(--weapon-height) * 3.04375);
}
.loadout-selector:is(.sniper, .heavy) > .weapons {
    --columns-amount: 3;
    --weapon-width: calc(var(--weapon-height) * 3.2875);
}
.loadout-selector:is(.melee) > .weapons {
    --columns-amount: 4;
    --weapon-width: calc(var(--weapon-height) * 2.37037);
}

.loadout-selector > .buddies::-webkit-scrollbar,
.loadout-selector > .weapons::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
.loadout-selector > .buddies::-webkit-scrollbar-thumb,
.loadout-selector > .weapons::-webkit-scrollbar-thumb {
    border: 2px solid #202225;
    background-color: #121314;
    border-radius: 10px;
}
</style>
