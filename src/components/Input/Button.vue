<template>
    <div class="button" ref="button" :class="{ disabled }" @mouseenter="hoverButton = true" @mouseleave="hoverButton = false">
        <div class="background" @click="$emit('click:primary')"></div>
        <div class="text">{{ text }}</div>
        <transition>
            <div v-if="alternative && hoverButton && !disabled" class="alternative" @click="$emit('click:secondary')">
                <div class="text">{{ alternative }}</div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
export default {
    name: 'Button',
    props: {
        text: String as () => string,
        disabled: Boolean as () => boolean,
        alternative: String as () => string
    },
    data() {
        return {
            hoverButton: false
        }
    }
}
</script>

<style scoped>
.button > .alternative:is(.v-enter-from, .v-leave-to) {
    margin-top: -11px;
    opacity: 0;
}

.button {
    --button-color: #43a047;
    --font-color: #eceff1;

    position: relative;

    width: fit-content;
    height: 29px;

    cursor: pointer;
    transform-style: preserve-3d;
}

.button > .alternative {
    position: absolute;
    margin-top: -6px;

    width: 100%;
    height: 35px;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;

    background-color: #1c1c1c;

    transform: translateZ(-1px);
    transition: filter 0.15s ease-in-out, opacity 0.15s ease-in-out, margin-top 0.15s ease-in-out;
}
.button > .alternative:hover {
    filter: brightness(1.5);
}
.button > .alternative > .text {
    margin-top: 6px;
    font-size: 13px;
    padding: 7px 14px;
    color: #737373;

    user-select: none;
    pointer-events: none;
}

.button.disabled {
    pointer-events: none;
}
.button.disabled > .text,
.button.disabled > .background {
    filter: opacity(0.666);
}
.button > .background {
    position: absolute;

    width: 100%;
    height: 100%;
    border-radius: 6px;

    background-color: var(--button-color);
    transition: filter 0.075s ease-in-out;
    transform: translateZ(0px);
}
.button > .text {
    font-size: 13px;
    padding: 7px 14px;
    color: var(--font-color);

    pointer-events: none;
    user-select: none;
    transition: filter 0.075s ease-in-out;
    transform: translateZ(1px);
}
</style>
