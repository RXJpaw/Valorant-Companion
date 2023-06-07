<template>
    <div class="bonus" ref="bonus" :class="{ closed: !open, grabbing: mouse_down }">
        <div v-if="was_opened && storefront_reset" class="offers" ref="offers">
            <div v-for="(offer, index) in storefront_bonus" :key="offer.uuid" class="offer" :class="`${offer.category} ${offer.tier}`">
                <div class="name">{{ offer.skin.displayName }}</div>
                <div class="image" :style="`--bgi: url('${offer.skin.chromas[0].fullRender}')`">
                    <div class="sharpen"></div>
                </div>
                <div class="price">{{ offer.price }} VP</div>
                <div class="discount">-{{ offer.discount }}%</div>
            </div>
        </div>
        <div v-else class="offers">
            <div v-for="(_, index) in 6" class="offer" :class="`loading`">
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
    name: 'AccountBonus',
    props: {
        open: Boolean as () => boolean,
        subject: String as () => string | null
    },
    data() {
        return {
            last_mouse_down_x: 0,
            mouse_down: false,

            loading: false,
            was_opened: false,
            storefront_reset: 0,
            storefront_bonus: [] as AccountStoreBonus[]
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
        this.$refs.bonus.addEventListener('mousedown', this.MouseDownListener)
        window.addEventListener('mousemove', this.MouseMoveListener)
        window.addEventListener('mouseup', this.MouseUpListener)
    },
    beforeUnmount() {
        this.$refs.bonus.removeEventListener('mousedown', this.MouseDownListener)
        window.removeEventListener('mousemove', this.MouseMoveListener)
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
            const { Items, Reset } = await Riot.getStorefontBonus()
            if (!Items || !Reset) return

            const ContentTiers = await Cache.ContentTiers
            const WeaponSkins = await Cache.WeaponSkins
            const Weapons = await Cache.Weapons

            for (const [index, Bonus] of Items.entries()) {
                const Skin = WeaponSkins.find((skin) => skin.levels.find((level) => level.uuid === Bonus.Offer.OfferID))!
                const Weapon = Weapons.find((weapon) => weapon.skins.find((skin) => skin.uuid === Skin.uuid))!
                const ContentTier = ContentTiers.find((tier) => tier.uuid === Skin.contentTierUuid)!

                if (this.storefront_bonus[index]?.uuid === Skin.uuid) continue

                this.storefront_bonus[index] = {
                    uuid: Skin.uuid,
                    skin: Skin,
                    tier: ContentTier.devName.toLowerCase(),
                    price: parseDecimal(Bonus.DiscountCosts['85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741']),
                    discount: Bonus.DiscountPercent,
                    category: Weapon.category.replace('EEquippableCategory::', '').toLowerCase()
                }
            }

            this.storefront_reset = Reset
        }
    }
}
</script>

<style scoped>
.bonus {
    overflow: hidden;

    position: absolute;

    width: 100%;
    height: 152px;
    padding-top: 6px;
    margin-top: -6px;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;

    background-color: #1c1c1c;

    visibility: visible;
    transition: height 0.333s ease-in-out, visibility 0.333s;
    user-select: none;
}
.bonus:not(.grabbing) {
    cursor: grab;
}
.bonus:is(.grabbing) {
    cursor: grabbing;
}

.bonus.closed {
    height: 0;

    visibility: hidden;
}

.bonus > .offers {
    overflow: var(--webkit-overlay);

    display: flex;
    gap: 11px;

    margin: 11px 11px 0;
    border-radius: 6px;

    pointer-events: none;
    padding-bottom: 11px;
}
.bonus > .offers > .offer {
    overflow: hidden;

    position: relative;

    min-width: 100px;
    min-height: 130px;
    border-radius: 6px;

    outline: 2px solid var(--tier-color);
    outline-offset: -2px;

    background-color: var(--background-tier-color);
}

.bonus > .offers > .offer.loading {
    --tier-color: #262626;
    --background-tier-color: #262626;
}
.bonus > .offers > .offer.select {
    --tier-color: #5a9fe1;
    --background-tier-color: #5a9fe133;
}
.bonus > .offers > .offer.deluxe {
    --tier-color: #009e81;
    --background-tier-color: #009e8133;
}
.bonus > .offers > .offer.premium {
    --tier-color: #d0558c;
    --background-tier-color: #d0558c33;
}
.bonus > .offers > .offer.ultra {
    --tier-color: #fad763;
    --background-tier-color: #fad76333;
}
.bonus > .offers > .offer.exclusive {
    --tier-color: #f4965a;
    --background-tier-color: #f4965a33;
}

.bonus > .offers > .offer > .price {
    position: absolute;
    right: 5px;
    top: 3px;

    color: var(--tier-color);
    font-size: 12px;
    line-height: 14px;
}
.bonus > .offers > .offer > .discount {
    position: absolute;
    right: 5px;
    top: 15px;

    color: var(--tier-color);
    opacity: 0.75;
    font-size: 12px;
    line-height: 14px;
}

.bonus > .offers > .offer > .name {
    position: absolute;
    bottom: 3px;
    left: 5px;

    color: var(--tier-color);
    max-width: 91px;
    font-size: 12px;
    line-height: 14px;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.bonus > .offers > .offer > .image {
    --of: 0.75;

    position: absolute;
    left: calc((100% - var(--of) * var(--scale) * 2.54) / 2);
    top: calc((100% - var(--of) * 100%) / 2);

    width: calc(var(--of) * var(--scale) * 2.54);
    height: calc(var(--of) * 100%);
    rotate: var(--rotation);

    background-image: var(--bgi);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}
.bonus > .offers > .offer.sidearm > .image {
    --rotation: 43deg;
    --scale: 50%;
}
.bonus > .offers > .offer.smg > .image,
.bonus > .offers > .offer.shotgun > .image {
    --rotation: 43deg;
    --scale: 82%;
}
.bonus > .offers > .offer.rifle > .image {
    --rotation: 43deg;
    --scale: 92%;
}
.bonus > .offers > .offer.sniper > .image,
.bonus > .offers > .offer.heavy > .image {
    --rotation: 43deg;
    --scale: 100%;
}
.bonus > .offers > .offer.melee > .image {
    --rotation: 63deg;
    --scale: 62%;
}

.bonus > .offers > .offer > .image > .sharpen {
    background-image: var(--bgi);

    height: 100%;

    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;

    image-rendering: pixelated;
}

.bonus > .offers::-webkit-scrollbar {
    width: 11px;
    height: 11px;
}
.bonus > .offers::-webkit-scrollbar-thumb {
    border: 3px solid #1c1c1c;
    background-color: #121212;
    border-radius: 10px;
}
</style>
