<template>
    <div class="button" ref="button" :class="{ disabled }" @mouseenter="hoverButton = true" @mouseleave="hoverButton = false">
        <div class="background" @click="clickPrimary" @mousedown="queueAnimation"></div>
        <div
            v-for="animation in getAnimationsArray()"
            class="background-animation"
            :key="animation.id"
            :style="{
                top: `${animation.top - animation.size / 2}px`,
                left: `${animation.left - animation.size / 2}px`,

                width: `${animation.size}px`,
                height: `${animation.size}px`,

                opacity: animation.opacity,
                '--animation-time': `${animation.time}s`
            }"
        ></div>
        <div class="text">{{ text }}</div>
        <transition>
            <div v-if="alternative && hoverButton && !disabled" class="alternative" @click="clickSecondary">
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
            hoverButton: false,
            animations: {}
        }
    },
    mounted() {},
    beforeUnmount() {},
    methods: {
        clickPrimary() {
            this.$emit('click:primary')
        },
        clickSecondary() {
            this.$emit('click:secondary')
        },
        queueAnimation(event: MouseEvent) {
            const clientWidth = event.target?.['clientWidth']
            const animationTime = 0.0025 * clientWidth

            const uuid = crypto.randomUUID()
            this.animations[uuid] = {
                id: uuid,
                top: event.offsetY,
                left: event.offsetX,
                size: 0,
                time: animationTime,
                opacity: 1,
                timestamp: Date.now()
            }

            window.addEventListener(
                'mouseup',
                () => {
                    setTimeout(() => (this.animations[uuid].opacity = 0), animationTime * 500)
                    setTimeout(() => delete this.animations[uuid], animationTime * 1500)
                },
                { once: true }
            )

            setTimeout(() => (this.animations[uuid].size = clientWidth * 2), 5)
        },
        getAnimationsArray() {
            return Object.values(this.animations).sort((a: any, b: any) => b.timestamp - a.timestamp)
        }
    }
}
</script>

<style scoped>
:root {
    --animation-time: UwU;
}

.button > .alternative:is(.v-enter-from, .v-leave-to) {
    margin-top: -11px;
    opacity: 0;
}

.button > .background-animation {
    position: absolute;
    overflow: hidden;

    border-radius: 100%;

    transition: height var(--animation-time) ease-in-out, width var(--animation-time) ease-in-out, top var(--animation-time) ease-in-out,
        left var(--animation-time) ease-in-out, opacity var(--animation-time) ease-in-out;
    background-color: var(--animation-color);

    user-select: none;
    pointer-events: none;
}

.button {
    --animation-color: #00000026;
    --button-color: #43a047;
    --font-color: #eceff1;

    position: relative;
    overflow: hidden;

    width: fit-content;
    height: 29px;
    border-radius: 6px;

    cursor: pointer;
    transform-style: preserve-3d;

    user-select: none;
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
