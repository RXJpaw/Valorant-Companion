<template>
    <div
        class="weapon"
        :class="{
            [weapon.WeaponCategory]: weapon.WeaponCategory,
            [`${weapon.ContentTierName}-edition`]: !!weapon.ContentTierName,
            preview: preview,
            mini: mini
        }"
    >
        <div class="background">
            <div class="wallpaper" v-if="weapon.hasWallpaper" :style="`--bgi: url('${weapon.WallpaperURL}')`"></div>
        </div>
        <div class="image" :style="`--bgi: url('${weapon.DisplayIconURL}')`">
            <div class="sharpen"></div>
        </div>
        <div class="buddy" v-if="weapon.hasBuddy && !mini" :style="`--bgi: url('${weapon.BuddyIconURL}')`"></div>
        <div class="skin-name-flex">
            <div class="skin-name">{{ weapon.DisplayName }}</div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'LoadoutWeapon',
    props: {
        mini: Boolean as () => boolean,
        weapon: Object as () => object,
        preview: Boolean as () => boolean
    }
}
</script>

<style scoped>
.weapon {
    position: relative;

    background-color: #18191c;
    height: var(--weapon-height);
    width: var(--weapon-width);

    border: 0 solid;
    border-radius: 6px;
}
.weapon:not(.preview) {
    cursor: pointer;
}

.weapon > .buddy {
    position: absolute;
    bottom: 12px;
    left: 5px;

    background-image: var(--bgi);
    background-size: cover;

    height: 32px;
    width: 32px;
}
.weapon > .skin-name-flex {
    position: absolute;
    bottom: -8px;
    left: 6px;

    display: flex;
    justify-content: center;

    width: calc(100% - 12px);
    height: 17px;
}
.weapon.mini > .skin-name-flex {
    bottom: -5px;
    height: 11px;
}
.weapon > .skin-name-flex > .skin-name {
    position: relative;

    line-height: 13px;
    font-size: 13px;

    width: fit-content;
    padding: 2px 12px;
    background-color: #121314;

    border: 0 solid;
    border-radius: 6px;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.weapon.mini > .skin-name-flex > .skin-name {
    line-height: 9px;
    font-size: 9px;
}
.weapon > .background {
    overflow: hidden;
    position: absolute;

    border-radius: inherit;
    height: 100%;
    width: 100%;
}
.weapon > .background > .wallpaper {
    position: absolute;
    background-image: var(--bgi);

    background-size: cover;
    background-position: center;

    height: inherit;
    width: inherit;

    image-rendering: initial;
    filter: brightness(0.66) blur(3px);
}
.weapon > .background > .theme {
    position: absolute;
    background-image: var(--bgi);

    background-size: auto 200%;
    background-repeat: no-repeat;
    background-position: center;

    height: inherit;
    width: inherit;

    /*filter: var(--edition-color-filter) opacity(0.2);*/
    filter: brightness(0) opacity(0.25);
}
.weapon > .image {
    position: absolute;
    background-image: var(--bgi);

    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;

    width: calc(100% - 20px);
    height: calc(100% - 20px);
    margin: 10px;
}
/* HOW THE FUCK DOES LAYING THE SAME IMAGE OVER AN ELEMENT MAKE IT SHAPER BUT NOT PIXELATED, JUST SHARP?!?!?!?*/
.weapon > .image .sharpen {
    background-image: var(--bgi);

    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;

    image-rendering: pixelated;
    height: 100%;
}

.weapon.select-edition {
    --edition-color-filter: brightness(0) saturate(100%) invert(73%) sepia(23%) saturate(6595%) hue-rotate(183deg) brightness(93%) contrast(90%);
}
.weapon.deluxe-edition {
    --edition-color-filter: brightness(0) saturate(100%) invert(44%) sepia(57%) saturate(773%) hue-rotate(127deg) brightness(90%) contrast(101%);
}
.weapon.premium-edition {
    --edition-color-filter: brightness(0) saturate(100%) invert(76%) sepia(79%) saturate(5699%) hue-rotate(302deg) brightness(89%) contrast(82%);
}
.weapon.ultra-edition {
    --edition-color-filter: brightness(0) saturate(100%) invert(94%) sepia(30%) saturate(824%) hue-rotate(355deg) brightness(95%) contrast(97%);
}
.weapon.exclusive-edition {
    --edition-color-filter: brightness(0) saturate(100%) invert(92%) sepia(20%) saturate(5615%) hue-rotate(338deg) brightness(102%) contrast(89%);
}
</style>
