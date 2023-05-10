<template>
    <div class="weapon-mini" :class="{ [weapon_category]: true, fav: skin.fav }" @mouseenter="enterSkin" @mouseleave="leaveSkin">
        <div
            v-if="skin.entry.contentTierUuid"
            class="content-tier"
            :style="`--bgi: url('https://media.valorant-api.com/contenttiers/${skin.entry.contentTierUuid}/displayicon.png')`"
        ></div>
        <div class="image" :style="`--bgi: url('${skin.entry.chromas[0].fullRender}')`">
            <div class="sharpen"></div>
        </div>
        <div class="display-name">
            <div class="name">{{ skin.entry.displayName }}</div>
        </div>
        <Icon v-if="skin.fav" class="fav is" icon="star" size="16px" @click="deleteFavourite" />
        <Icon v-else-if="hover" class="fav" icon="star-outline" size="16px" @click="addFavourite" />
    </div>
</template>

<script lang="ts">
import Icon from '@/components/Misc/Icon.vue'

export default {
    name: 'LoadoutWeaponMini',
    components: { Icon },
    props: {
        weapon_category: String as () => string,
        skin: Object as () => ProcessedLoadoutSkin
    },
    data() {
        return {
            hover: false
        }
    },
    methods: {
        enterSkin() {
            this.hover = true
        },
        leaveSkin() {
            this.hover = false
        },
        addFavourite(event: PointerEvent) {
            event.stopPropagation()
            const Skin = this.skin.entry
            this.$emit('addfav:skin', Skin.chromas[0].uuid)
        },
        deleteFavourite(event: PointerEvent) {
            event.stopPropagation()
            const Skin = this.skin.entry
            this.$emit('delfav:skin', Skin.chromas[0].uuid)
        }
    }
}
</script>

<style scoped>
.weapon-mini {
    --weapon-height: 50px;

    position: relative;
    height: var(--weapon-height);
    width: var(--weapon-width);

    border-radius: 6px;
    background-color: #18191c;

    cursor: pointer;
}
.weapon-mini * {
    pointer-events: none;
    user-select: none;
}

.weapon-mini:is(.sidearm) {
    --weapon-width: calc(var(--weapon-height) * 1.6875);
    --content-tier-size: 120px;
}
.weapon-mini:is(.smg, .shotgun) {
    --weapon-width: calc(var(--weapon-height) * 2.70625);
    --content-tier-size: 180px;
}
.weapon-mini:is(.rifle) {
    --weapon-width: calc(var(--weapon-height) * 3.04375);
    --content-tier-size: 200px;
}
.weapon-mini:is(.sniper, .heavy) {
    --weapon-width: calc(var(--weapon-height) * 3.2875);
    --content-tier-size: 215px;
}
.weapon-mini:is(.melee) {
    --weapon-width: calc(var(--weapon-height) * 2.37037);
    --content-tier-size: 165px;
}

.weapon-mini.fav {
    --fav-color: #fbc02d99; /*#fbc02d4d*/

    outline: 1px solid var(--fav-color);
    outline-offset: -1px;
}
.weapon-mini.fav > .display-name > .name {
    outline: 1px solid var(--fav-color);
}

.weapon-mini > .fav {
    position: absolute;
    right: 0;
    top: 0;

    width: 17px;
    height: 17px;
    padding: 3px;

    pointer-events: all;
}
.weapon-mini > .fav:not(.is) {
    color: #ffffff33;
}
.weapon-mini > .fav:is(.is) {
    color: var(--fav-color);
}
.weapon-mini > .fav:hover {
    opacity: 0.666;
}

.weapon-mini > .image {
    position: absolute;
    left: 11px;
    top: 11px;

    height: calc(100% - 22px);
    width: calc(100% - 22px);

    background-position: center;
    background-repeat: no-repeat;
    background-image: var(--bgi);
    background-size: contain;
}
.weapon-mini > .content-tier {
    position: absolute;
    left: 0;
    top: 0;

    width: 100%;
    height: 100%;
    opacity: 0.03;
    border-radius: 6px;

    background-position: center;
    background-repeat: no-repeat;
    background-image: var(--bgi);
    background-size: var(--content-tier-size);
    image-rendering: auto;
}
.weapon-mini > .display-name {
    display: flex;
    justify-content: center;

    position: absolute;
    bottom: -4px;
    left: 3px;

    height: 13px;
    width: calc(100% - 6px);
}
.weapon-mini > .display-name > .name {
    height: 11px;
    padding: 1px 5px;
    border-radius: 6px;

    font-size: 10px;
    line-height: 11px;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    background-color: #121314;
}

.sharpen {
    height: 100%;
    width: 100%;

    background-position: center;
    background-repeat: no-repeat;
    background-image: var(--bgi);
    background-size: contain;

    image-rendering: pixelated;
}
</style>
