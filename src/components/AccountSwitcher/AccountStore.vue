<template>
    <div class="store" ref="store" :class="{ closed: !open, grabbing: mouse_down }">
        <div v-if="was_opened && storefront_reset" class="offers" ref="offers">
            <div v-for="(offer, index) in storefront_offers" :key="offer.uuid" class="offer" :class="`${offer.category} ${offer.tier}`">
                <div class="name">{{ offer.skin.displayName }}</div>
                <div class="image" :style="`--bgi: url('${offer.skin.chromas[0].fullRender}')`">
                    <div class="sharpen"></div>
                </div>
                <div class="price">{{ offer.price }} VP</div>
            </div>
        </div>
        <div v-else class="offers">
            <div v-for="(_, index) in 4" class="offer" :class="`loading`">
                <div class="name"></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import * as ValorantAPI from '@/scripts/valorant_api'
import { RiotClient } from '@/scripts/riot_client'
import { parseDecimal } from '@/scripts/methods'

const Cache = {
    ContentTiers: ValorantAPI.getContentTiers(),
    WeaponSkins: ValorantAPI.mapWeaponSkins(),
    Weapons: ValorantAPI.getWeapons()
}

const Riot = RiotClient()
export default {
    name: 'AccountStore',
    props: {
        open: Boolean as () => boolean,
        subject: String as () => string
    },
    data() {
        return {
            last_mouse_down_x: 0,
            mouse_down: false,

            loading: false,
            was_opened: false,
            storefront_reset: 0,
            storefront_offers: [] as AccountStoreOffer[]
        }
    },
    watch: {
        subject: {
            handler(current) {
                Riot.setSubject(current)
            },
            immediate: true
        },
        open: {
            async handler(current) {
                this.was_opened = this.was_opened || current
                if (!current) return

                await this.processStorefrontOffers()
            },
            immediate: true
        }
    },
    mounted() {
        this.$refs.store.addEventListener('mousemove', this.MouseMoveListener)
        this.$refs.store.addEventListener('mousedown', this.MouseDownListener)
        window.addEventListener('mouseup', this.MouseUpListener)
    },
    beforeUnmount() {
        this.$refs.store.removeEventListener('mousemove', this.MouseMoveListener)
        this.$refs.store.removeEventListener('mousedown', this.MouseDownListener)
        window.removeEventListener('mouseup', this.MouseUpListener)
    },
    methods: {
        MouseUpListener(event: MouseEvent) {
            if (event.button !== 0) return

            this.mouse_down = false
        },
        MouseDownListener(event: MouseEvent) {
            if (event.button !== 0) return

            this.last_mouse_down_x = event.x
            this.mouse_down = true
        },
        MouseMoveListener(event: MouseEvent) {
            if (!this.mouse_down) return

            this.$refs.offers?.scrollBy({ left: -(event.x - this.last_mouse_down_x) })
            this.last_mouse_down_x = event.x
        },
        async processStorefrontOffers() {
            const { Items, Reset } = await Riot.getStorefontOffers()
            const ContentTiers = await Cache.ContentTiers
            const WeaponSkins = await Cache.WeaponSkins
            const Weapons = await Cache.Weapons

            for (const [index, Offer] of Items.entries()) {
                const Skin = WeaponSkins.find((skin) => skin.levels.find((level) => level.uuid === Offer.OfferID))!
                const Weapon = Weapons.find((weapon) => weapon.skins.find((skin) => skin.uuid === Skin.uuid))!
                const ContentTier = ContentTiers.find((tier) => tier.uuid === Skin.contentTierUuid)!

                if (this.storefront_offers[index]?.uuid === Skin.uuid) continue

                this.storefront_offers[index] = {
                    uuid: Skin.uuid,
                    skin: Skin,
                    tier: ContentTier.devName.toLowerCase(),
                    price: parseDecimal(Offer.Cost['85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741']),
                    category: Weapon.category.replace('EEquippableCategory::', '').toLowerCase()
                }
            }

            this.storefront_reset = Reset
        }
    }
}
</script>

<style scoped>
.store {
    overflow: hidden;

    position: absolute;

    width: 100%;
    height: 87px;
    padding-top: 6px;
    margin-top: -6px;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;

    background-color: #1c1c1c;

    visibility: visible;
    transition: height 0.333s ease-in-out, visibility 0.333s;
    user-select: none;
}
.store:not(.grabbing) {
    cursor: grab;
}
.store:is(.grabbing) {
    cursor: grabbing;
}

.store.closed {
    height: 0;

    visibility: hidden;
}

.store > .offers {
    overflow: var(--webkit-overlay);

    display: flex;
    gap: 11px;

    margin: 11px 11px 0;
    border-radius: 6px;

    pointer-events: none;
    padding-bottom: 11px;
}
.store > .offers > .offer {
    overflow: hidden;

    position: relative;

    min-width: 127px;
    min-height: 65px;
    border-radius: 6px;

    outline: 2px solid var(--tier-color);
    outline-offset: -2px;

    background-color: var(--background-tier-color);
}

.store > .offers > .offer.loading {
    --tier-color: #262626;
    --background-tier-color: #262626;
}
.store > .offers > .offer.select {
    --tier-color: #5a9fe1;
    --background-tier-color: #5a9fe133;
}
.store > .offers > .offer.deluxe {
    --tier-color: #009e81;
    --background-tier-color: #009e8133;
}
.store > .offers > .offer.premium {
    --tier-color: #d0558c;
    --background-tier-color: #d0558c33;
}
.store > .offers > .offer.ultra {
    --tier-color: #fad763;
    --background-tier-color: #fad76333;
}
.store > .offers > .offer.exclusive {
    --tier-color: #f4965a;
    --background-tier-color: #f4965a33;
}

.store > .offers > .offer > .price {
    position: absolute;
    right: 5px;
    top: 3px;

    color: var(--tier-color);
    font-size: 12px;
    line-height: 14px;
}

.store > .offers > .offer > .name {
    position: absolute;
    bottom: 3px;
    left: 5px;

    color: var(--tier-color);
    max-width: 116px;
    font-size: 12px;
    line-height: 14px;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.store > .offers > .offer > .image {
    --of: 1.25;

    position: absolute;
    left: calc((100% - var(--of) * var(--scale)) / 2);
    top: calc((100% - var(--of) * 100%) / 2);

    width: calc(var(--of) * var(--scale));
    height: calc(var(--of) * 100%);
    rotate: var(--rotation);

    background-image: var(--bgi);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}
.store > .offers > .offer.sidearm > .image {
    --rotation: 33deg;
    --scale: 50%;
}
.store > .offers > .offer.smg > .image,
.store > .offers > .offer.shotgun > .image {
    --rotation: 33deg;
    --scale: 82%;
}
.store > .offers > .offer.rifle > .image {
    --rotation: 33deg;
    --scale: 92%;
}
.store > .offers > .offer.sniper > .image,
.store > .offers > .offer.heavy > .image {
    --rotation: 33deg;
    --scale: 100%;
}
.store > .offers > .offer.melee > .image {
    --rotation: 53deg;
    --scale: 82%;
}

.store > .offers > .offer > .image > .sharpen {
    background-image: var(--bgi);

    height: 100%;

    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;

    image-rendering: pixelated;
}

.store > .offers::-webkit-scrollbar {
    width: 11px;
    height: 11px;
}
.store > .offers::-webkit-scrollbar-thumb {
    border: 3px solid #1c1c1c;
    background-color: #121212;
    border-radius: 10px;
}
</style>
