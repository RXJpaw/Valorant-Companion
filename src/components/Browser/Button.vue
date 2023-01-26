<template>
    <div
        v-if="text.length > 0"
        ref="button"
        class="button"
        :class="`${disabled ? 'disabled' : ''} ${small ? 'small' : ''}`"
        :style="{
            ['--text-color']: textColor || '#ffffff',
            ['--button-color']: buttonColor || '#448aff',
            ['--animation-color']: animationColor || '#2962ff'
        }"
    >
        <div
            v-if="animationVisible"
            class="animation"
            :style="{
                top: `${animationTop}px`,
                left: `${animationLeft}px`,
                width: `${animationSize}px`,
                height: `${animationSize}px`,
                opacity: animationOpacity
            }"
        ></div>
        <div class="text">{{ text }}</div>
    </div>
</template>

<script lang="ts">
import { sleep } from '@/scripts/methods'

export default {
    name: 'Button',
    data() {
        return {
            animationTop: 0,
            animationLeft: 0,
            animationSize: 0,
            animationOpacity: 0,
            animationVisible: false,
            currentAnimationId: null
        }
    },
    props: {
        disabled: Boolean as () => boolean,
        small: Boolean as () => boolean,

        text: String as () => string,
        textColor: String as () => string,
        buttonColor: String as () => string,
        animationColor: String as () => string
    },
    mounted() {
        const Button = this.$refs.button

        Button.addEventListener('mousedown', this.ButtonMouseDownListener)
    },
    beforeUnmount() {
        const Button = this.$refs.button

        Button.removeEventListener('mousedown', this.ButtonMouseDownListener)
    },
    methods: {
        async ButtonMouseDownListener(event) {
            const AnimationID = crypto['randomUUID']()
            this.currentAnimationId = AnimationID

            const Button = this.$refs.button
            let mouseStillOver = true

            const MouseLeaveListener = () => {
                Button.removeEventListener('mouseleave', MouseLeaveListener)
                Button.removeEventListener('mouseup', MouseLeaveListener)

                this.animationOpacity = 0
                mouseStillOver = false
            }
            Button.addEventListener('mouseleave', MouseLeaveListener)
            Button.addEventListener('mouseup', MouseLeaveListener)

            //
            this.animationVisible = false
            this.animationOpacity = 0.5
            this.animationSize = 0
            this.animationLeft = event.offsetX
            this.animationTop = event.offsetY

            await sleep(5)
            this.animationVisible = true

            await sleep(5)
            this.animationOpacity = 1
            //

            while (true) {
                if (AnimationID !== this.currentAnimationId) break
                if (!mouseStillOver && this.animationSize > Button.clientWidth * 2) break

                this.animationSize = Math.min(this.animationSize + 36, Math.max(Button.clientWidth * 3, Button.clientHeight * 3)) //a multiplier of 2 would show edges caused by border-radius: 100%
                await sleep(25)
            }
        }
    }
}
</script>

<style scoped>
:root {
    --text-color: OwO;
    --button-color: UwU;
    --animation-color: Furry;
}

.button {
    border: 0 solid;
    border-radius: 6px;
    background-color: var(--button-color);

    cursor: pointer;
    overflow: hidden;
    transition: opacity 150ms ease-in-out;
}

.button.disabled {
    opacity: 0.75;
    pointer-events: none;
}

.button > .text {
    color: var(--text-color);

    pointer-events: none;
    user-select: none;
    transform: translateZ(0px);
}
.button:not(.small) > .text {
    line-height: 10px;
    font-size: 14px;
    padding: 11px 22px;
}
.button.small > .text {
    line-height: 8px;
    font-size: 11px;
    padding: 4px;
}

.button > .animation {
    position: absolute;

    transform: translateY(-50%) translateX(-50%) translateZ(10px);
    border-radius: 100%;
    background-color: var(--animation-color);
    transition: height 25ms linear, width 25ms linear, opacity 250ms ease-in-out;

    pointer-events: none;
    user-select: none;
}
</style>
