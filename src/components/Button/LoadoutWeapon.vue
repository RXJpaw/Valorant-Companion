<template>
    <div class="weapon" :class="{ [weapon.WeaponCategory]: true }">
        <div class="image" :style="`--bgi: url('${weapon.SkinImageURL}')`">
            <div class="sharpen"></div>
        </div>
        <div v-if="weapon.hasBuddy" class="buddy" :style="`--bgi: url('${weapon.BuddyImageURL}')`">
            <div class="sharpen"></div>
        </div>
        <div v-if="!hide_name" class="display-name">
            <div class="name">{{ weapon.SkinName }}</div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'LoadoutWeapon',
    props: {
        hide_name: Boolean as () => boolean,
        weapon: {
            required: true,
            type: Object as () => ProcessedLoadoutWeapon
        }
    }
}
</script>

<style scoped>
.weapon {
    --buddy-size: 26px;

    position: relative;

    border-radius: 6px;

    background-color: #202225;

    pointer-events: all;
    cursor: pointer;
}
.weapon * {
    pointer-events: none;
    user-select: none;
}
.weapon > .image {
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
.weapon > .buddy {
    position: absolute;
    bottom: 5px;
    left: 0;

    height: var(--buddy-size);
    width: var(--buddy-size);

    background-position: center;
    background-repeat: no-repeat;
    background-image: var(--bgi);
    background-size: contain;
}
.weapon > .display-name {
    display: flex;
    justify-content: center;

    position: absolute;
    bottom: -6px;
    left: 18px;

    height: 16px;
    width: calc(100% - 36px);
}
.weapon > .display-name > .name {
    height: 12px;
    padding: 2px 6px;
    border-radius: 6px;

    font-size: 11px;
    line-height: 12px;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    background-color: #18191c;
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
