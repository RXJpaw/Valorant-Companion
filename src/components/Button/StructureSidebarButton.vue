<template>
    <div class="button" ref="button" :class="active === name ? 'active' : null" @click="clickButton" @mousedown="mouseDownButton">
        <div
            v-if="animation"
            class="background-animation"
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
    </div>
</template>

<script lang="ts">
export default {
    name: 'StructureSidebarButton',
    props: {
        name: String as () => string,
        active: String as () => string,
        text: String as () => string
    },
    data() {
        return {
            animation: null
        }
    },
    watch: {
        active(current) {
            if (this.animation && this.animation.opacity !== 0 && current !== this.name) {
                const id = this.animation.id
                this.animation.opacity = 0

                setTimeout(() => {
                    if (this.animation.id !== id) return
                    this.animation = null
                }, this.animation.time * 1000)
            } else if (!this.animation && current === this.name) {
                const clientWidth = this.$refs.button.clientWidth
                const animationTime = 0.00167 * clientWidth

                const uuid = crypto.randomUUID()
                this.animation = {
                    id: uuid,
                    top: 0,
                    left: 0,
                    size: clientWidth * 2,
                    time: animationTime,
                    opacity: 0
                }

                setTimeout(() => (this.animation.opacity = 1), 5)
            }
        }
    },
    methods: {
        clickButton() {
            this.$emit('update:active', this.name)
        },
        mouseDownButton(event: MouseEvent) {
            const clientWidth = event.target?.['clientWidth']
            const animationTime = 0.00167 * clientWidth

            const uuid = crypto.randomUUID()
            this.animation = {
                id: uuid,
                top: event.offsetY,
                left: event.offsetX,
                size: 0,
                time: animationTime,
                opacity: 1
            }

            window.addEventListener(
                'mouseup',
                (event) => {
                    if (this.$refs.button.isEqualNode(event.target)) return
                    const id = this.animation.id
                    this.animation.opacity = 0

                    setTimeout(() => {
                        if (this.animation.id !== id) return
                        this.animation = null
                    }, this.animation.time * 1000)
                },
                { once: true }
            )

            setTimeout(() => (this.animation.size = clientWidth * 2), 5)
        }
    }
}
</script>

<style scoped>
.button > .background-animation {
    position: absolute;
    overflow: hidden;

    border-radius: 100%;

    transition: height var(--animation-time) ease-in-out, width var(--animation-time) ease-in-out, top var(--animation-time) ease-in-out,
        left var(--animation-time) ease-in-out, opacity var(--animation-time) ease-in-out;
    background-color: #121314;

    user-select: none;
    pointer-events: none;
}

.button {
    position: relative;
    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: center;

    margin: 0 22px 5px;
    height: 32px;

    border: 0 solid;
    border-radius: 6px;
    background-color: #18191c;

    cursor: pointer;
    user-select: none;
    transform-style: preserve-3d;
}

.button > .text {
    font-size: 16px;
    line-height: 16px;

    transform: translateZ(1px);
    user-select: none;
    pointer-events: none;
}
</style>
