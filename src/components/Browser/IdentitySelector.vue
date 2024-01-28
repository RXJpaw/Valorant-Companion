<template>
    <transition>
        <div v-if="active" class="identity-selector" :style="getSelectorStyle()">
            <div class="filter" :class="{ scrolled }">
                <div class="query">
                    <input type="text" v-model="search_query" spellcheck="false" :placeholder="getQueryPlaceholder()" />
                </div>
            </div>
            <div v-if="type === 'banner'" class="banners" ref="items" @scroll="processSelectorScroll()">
                <IdentityBannerMini
                    v-for="(banner, index) in getBannersQuery()"
                    :key="banner.entry.uuid"
                    :banner="banner"
                    :initiallyInvisible="true"
                    @click="selectBanner(banner.entry.uuid)"
                    @mount="ItemMount"
                    @unmount="ItemUnmount"
                    @addfav:banner="addFavourite($event)"
                    @delfav:banner="deleteFavourite($event)"
                />
            </div>
            <div v-else-if="type?.endsWith('spray')" class="sprays" ref="items" @scroll="processSelectorScroll()">
                <IdentitySprayMini
                    v-for="(spray, index) in getSpraysQuery()"
                    :key="spray.entry.uuid"
                    :spray="spray"
                    :initiallyInvisible="true"
                    @click="selectSpray(spray.entry.uuid)"
                    @mount="ItemMount"
                    @unmount="ItemUnmount"
                    @addfav:spray="addFavourite($event)"
                    @delfav:spray="deleteFavourite($event)"
                />
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import IdentityBannerMini from '@/components/Button/IdentityBannerMini.vue'
import IdentitySprayMini from '@/components/Button/IdentitySprayMini.vue'
import * as ValorantAPI from '@/scripts/valorant_api'

const Cache = {
    Sprays: ValorantAPI.getSprays(),
    PlayerCards: ValorantAPI.getPlayerCards(),
    PlayerTitles: ValorantAPI.getPlayerTitles()
}

export default {
    name: 'IdentitySelector',
    components: { IdentitySprayMini, IdentityBannerMini },
    props: {
        type: String as () => 'banner' | 'pre-spray' | 'mid-spray' | 'post-spray' | null,
        active: Boolean as () => boolean,
        identity: Object as () => ProcessedIdentity | null,
        left: Number as () => number,
        top: Number as () => number,
        gap: Number as () => number,
        Inventory: Object as () => InventoryInstance,
        LoadoutManager: Object as () => LoadoutManagerInstance
    },
    data() {
        return {
            banners: {} as { [uuid: string]: ProcessedIdentityBanner },
            sprays: {} as { [uuid: string]: ProcessedIdentitySpray },

            scrolled: false,
            search_query: '',

            observers: {
                intersection: null as IntersectionObserver | null
            }
        }
    },
    watch: {
        type: {
            async handler(current?: string, before?: string) {
                const IsAndWasSpray = current?.endsWith('spray') && before?.endsWith('spray')
                if (current !== before && !IsAndWasSpray && this.observers.intersection) {
                    this.observers.intersection.disconnect()
                    this.observers.intersection = null

                    if (current) {
                        this.$refs.items?.scrollTo({ top: 0, behavior: 'auto' })
                        this.scrolled = false
                    }
                }

                if (!current) return
                await this.$nextTick()

                this.observers.intersection = new IntersectionObserver(
                    (entries, observer) => {
                        entries.forEach((entry) => {
                            if (entry.intersectionRatio === 0) return
                            entry.target.classList.add('was-visible')
                            observer.unobserve(entry.target)
                        })
                    },
                    {
                        root: this.$refs.items,
                        rootMargin: '61px',
                        threshold: 0.01
                    }
                )
            }
        },
        identity: {
            handler(current?: ProcessedIdentity, before?: ProcessedIdentity) {
                if (!current) {
                    this.search_query = ''
                    this.scrolled = false
                } else {
                    this.processBanners()
                    this.processSprays()

                    if (before) return

                    this.$refs.items?.scrollTo({ top: 0, behavior: 'auto' })
                    this.scrolled = false
                }
            },
            deep: true
        }
    },
    methods: {
        processSelectorScroll() {
            const scroll = this.$refs.items?.scrollTop
            if (scroll === 0 && !this.scrolled) return
            if (scroll > 0 && this.scrolled) return

            this.scrolled = scroll > 0
        },
        emitLoadoutManagerUpdate() {
            this.$emit('update:LoadoutManager', this.LoadoutManager)
        },
        async ItemMount(element: Element) {
            await this.$nextTick()
            if (!this.observers.intersection) return
            this.observers.intersection.observe(element)
        },
        async ItemUnmount(element: Element) {
            if (!this.observers.intersection) return
            this.observers.intersection.unobserve(element)
        },
        getQueryPlaceholder() {
            switch (this.type) {
                case 'banner':
                    return 'Search Banners'
                case 'pre-spray':
                    return 'Search Pre-Round Sprays'
                case 'mid-spray':
                    return 'Search Mid-Round Sprays'
                case 'post-spray':
                    return 'Search Post-Round Sprays'
            }
        },
        getBannersQuery() {
            const Banners: ProcessedIdentityBanner[] = Object.values(this.banners)

            const FilteredBanners = Banners.filter((banner) => banner.entry.displayName.toLowerCase().includes(this.search_query.toLowerCase()))

            return FilteredBanners.sort((a, b) => {
                const LocaleCompare = a.entry.displayName.localeCompare(b.entry.displayName)
                const Fav = (b.fav ? 10 : 0) - (a.fav ? 10 : 0)

                return Fav + LocaleCompare
            })
        },
        getSpraysQuery() {
            const Sprays: ProcessedIdentitySpray[] = Object.values(this.sprays)

            const EligibleSprays = this.type === 'mid-spray' ? Sprays.filter((spray) => spray.entry.category !== 'EAresSprayCategory::Contextual') : Sprays
            const FilteredSprays = EligibleSprays.filter((spray) => spray.entry.displayName.toLowerCase().includes(this.search_query.toLowerCase()))

            return FilteredSprays.sort((a, b) => {
                const LocaleCompare = a.entry.displayName.localeCompare(b.entry.displayName)
                const Fav = (b.fav ? 10 : 0) - (a.fav ? 10 : 0)

                return Fav + LocaleCompare
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
        async selectBanner(bannerUuid: string) {
            this.LoadoutManager.setPlayerCardID(bannerUuid)
            this.emitLoadoutManagerUpdate()
        },
        async selectSpray(sprayUuid: string) {
            switch (this.type) {
                case 'pre-spray': {
                    this.LoadoutManager.setPreSpray(sprayUuid)
                    break
                }
                case 'mid-spray': {
                    this.LoadoutManager.setMidSpray(sprayUuid)
                    break
                }
                case 'post-spray': {
                    this.LoadoutManager.setPostSpray(sprayUuid)
                    break
                }
            }
            this.emitLoadoutManagerUpdate()
        },
        async processBanners() {
            const Banners = await Cache.PlayerCards
            const Inventory: InventoryInstance = this.Inventory
            const LoadoutManager: LoadoutManagerInstance = this.LoadoutManager

            const BannersMap = new Map(Banners.map((banner) => [banner.uuid, banner]))
            const FavouritesMap = new Map(LoadoutManager.getFavourites().map((fav) => [fav, true]))

            const OwnedBanners = {}
            for (const { ItemID: BannerID } of Inventory.Banners) {
                const Banner = BannersMap.get(BannerID)
                if (!Banner) continue

                if (OwnedBanners[Banner.uuid]) continue

                const Favourite = FavouritesMap.get(Banner.uuid)

                OwnedBanners[Banner.uuid] = { entry: Banner, fav: !!Favourite }
            }

            this.banners = OwnedBanners
        },
        async processSprays() {
            const Sprays = await Cache.Sprays
            const Inventory: InventoryInstance = this.Inventory
            const LoadoutManager: LoadoutManagerInstance = this.LoadoutManager

            const SpraysMap = new Map(Sprays.map((spray) => [spray.uuid, spray]))
            const FavouritesMap = new Map(LoadoutManager.getFavourites().map((fav) => [fav, true]))

            const OwnedSprays = {}
            for (const { ItemID: SprayID } of Inventory.Sprays) {
                const Spray = SpraysMap.get(SprayID)
                if (!Spray) continue

                if (OwnedSprays[Spray.uuid]) continue

                const Favourite = FavouritesMap.get(Spray.uuid)

                OwnedSprays[Spray.uuid] = { entry: Spray, fav: !!Favourite }
            }

            this.sprays = OwnedSprays
        },
        getSelectorStyle() {
            if (this.type?.endsWith('spray')) {
                return { width: '558px', top: `${this.top}px`, left: `${this.left + this.gap + 11}px` }
            } else {
                return { width: '574px', top: `${this.top}px`, left: `${this.left + this.gap + 11}px` }
            }
        }
    }
}
</script>

<style scoped>
.identity-selector:is(.v-enter-from, .v-leave-to) {
    margin-left: -11px;
    opacity: 0;
}

.identity-selector {
    position: fixed;
    z-index: 210;

    scale: 1;
    margin-left: 0;

    height: 310px;
    border-radius: 6px;

    outline: 3px solid #121314;
    outline-offset: -3px;
    background-color: #121314;

    transition: opacity ease-in-out 0.15s, left ease-in-out 0.15s, top ease-in-out 0.15s, width ease-in-out 0.15s, margin-left ease-in-out 0.15s;
}
.identity-selector.v-leave-to {
    z-index: 200;
}

.identity-selector > .filter {
    position: relative;

    display: flex;
    align-items: flex-end;
    justify-content: center;

    width: 100%;
    height: 25px;
    margin-top: 3px;
    margin-bottom: 0;

    background-color: #121314;

    transition: height 0.15s ease-in-out, margin-bottom 0.15s ease-in-out;
}
.identity-selector > .filter.scrolled {
    height: calc(25px - 3px);
    margin-bottom: 3px;
}

.identity-selector > .filter > .query {
    position: relative;

    width: 160px;
    height: 10px;
    padding: 6px 8px 4px;
    border-radius: 6px 6px 0 0;

    background-color: #202225;

    transition: padding 0.15s ease-in-out, border-radius 0.15s ease-in-out;
}
.identity-selector > .filter.scrolled > .query {
    padding: 6px 8px 6px;
    border-radius: 6px;
}

.identity-selector > .filter > .query > input {
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
.identity-selector > .filter > .query > input::placeholder {
    color: #6d6f78;
}

.identity-selector > .banners {
    --columns-amount: 3;
    --banner-height: 50px;
    --banner-width: calc(var(--banner-height) * 3.53125);

    /* TODO: replace auto */
    overflow-y: auto;
    overflow-x: hidden;

    display: grid;
    grid-auto-flow: row;
    grid-template-columns: repeat(var(--columns-amount), var(--banner-width));
    grid-template-rows: repeat(auto-fit, var(--banner-height));
    grid-column-gap: 11px;
    grid-row-gap: 11px;

    padding: 8px;
    min-height: 263px;
    max-height: 263px;
    margin-right: 3px;
    margin-left: 3px;

    background-color: #202225;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
}

.identity-selector > .sprays {
    --columns-amount: 5;
    --banner-height: 50px;
    --banner-width: calc(var(--banner-height) * 1.96721);

    /* TODO: replace auto */
    overflow-y: auto;
    overflow-x: hidden;

    display: grid;
    grid-auto-flow: row;
    grid-template-columns: repeat(var(--columns-amount), var(--banner-width));
    grid-template-rows: repeat(auto-fit, var(--banner-height));
    grid-column-gap: 11px;
    grid-row-gap: 11px;

    padding: 8px;
    min-height: 263px;
    max-height: 263px;
    margin-right: 3px;
    margin-left: 3px;

    background-color: #202225;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
}
.identity-selector > .sprays::-webkit-scrollbar,
.identity-selector > .banners::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
.identity-selector > .sprays::-webkit-scrollbar-thumb,
.identity-selector > .banners::-webkit-scrollbar-thumb {
    border: 2px solid #202225;
    background-color: #121314;
    border-radius: 10px;
}
</style>
