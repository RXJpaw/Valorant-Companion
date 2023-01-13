<template>
    <div
        class="inventory"
        :style="`left: ${left}px; top: ${top}px;`"
        @mouseenter="mouseOver = true"
        @mouseleave="mouseOver = false"
        @mousemove="MouseMoveListener"
    >
        <div class="weapons" :style="`transform: scale(${scale}); transform-origin: ${x}px ${y}px;`">
            <div v-for="(chroma, index) in subject.SkinChromas" class="weapon">
                <div class="background"></div>
                <div
                    v-if="subject.SkinChromas[index]"
                    class="image"
                    :style="`--bgi: url('https://media.valorant-api.com/weaponskinchromas/${subject.SkinChromas[index]}/fullrender.png')`"
                >
                    <div class="sharpen"></div>
                </div>
                <div
                    v-if="subject.Buddies[index]"
                    class="buddy"
                    :style="`--bgi: url('https://media.valorant-api.com/buddies/${subject.Buddies[index]}/displayicon.png')`"
                >
                    <div class="sharpen"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'CurrentMatchInventory',
    props: {
        subject: Object as () => LoadedCurrentMatchSubject,
        top: 0,
        left: 0
    }, //446
    data() {
        return {
            mouseOver: false,
            scale: 1,
            x: 0,
            y: 0
        }
    },
    created() {
        window.addEventListener('wheel', this.WheelListener)
    },
    beforeUnmount() {
        window.removeEventListener('wheel', this.WheelListener)
    },
    methods: {
        async WheelListener(event: WheelEvent) {
            if (!this.mouseOver) return

            if (event.deltaY < 0) {
                //zoom in

                this.scale = Math.min(3, this.scale + 1 / 3)
            } else {
                //zoom out

                this.scale = Math.max(1, this.scale - 1 / 3)
            }
        },
        MouseMoveListener(event: MouseEvent) {
            const x = event.offsetX * 1.2 - 52
            const y = event.offsetY * 1.2 - 32

            this.x = Math.min(512, Math.max(0, x))
            this.y = Math.min(311, Math.max(0, y))
        }
    }
}
</script>

<style scoped>
.inventory {
    --uwu: 0.5;
    position: absolute;

    width: 512px;
    height: 311px;

    border-radius: 6px;
    background-color: #202225;

    overflow: hidden;
}
.inventory > .weapons {
    transition: transform 0.1s linear;

    display: grid;
    grid-auto-flow: column;
    /*grid-template-columns: 52px 86px 95px 103px; !* scaled to 0.368 *!*/
    /*grid-template-columns: calc(142px * var(--uwu)) calc(232px * var(--uwu)) calc(260px * var(--uwu)) calc(280px * var(--uwu));*/
    grid-template-columns: 71px 116px 130px 140px; /* scaled to 0.5 */
    grid-template-rows: repeat(5, 49px);
    grid-column-gap: 11px;
    grid-row-gap: 11px;

    padding: 11px;
}
.inventory > .weapons :nth-child(n + 6) {
    grid-column: 2;
}
.inventory > .weapons :nth-child(n + 10) {
    grid-column: 3;
}
.inventory > .weapons :nth-child(n + 14) {
    grid-column: 4;
}
.inventory > .weapons > .weapon {
    position: relative;
    background: #121314;
    border-radius: 6px;

    pointer-events: none;
}

.inventory > .weapons > .weapon > .background {
    overflow: hidden;
    position: absolute;
    border-radius: inherit;
    height: 100%;
    width: 100%;
}

.inventory > .weapons > .weapon > .image {
    position: absolute;
    background-image: var(--bgi);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: calc(100% - 10px);
    height: calc(100% - 10px);
    margin: 5px;
}

.inventory > .weapons > .weapon > .buddy {
    position: absolute;
    bottom: 3px;
    left: -1px;

    background-image: var(--bgi);
    background-size: cover;

    height: 19px;
    width: 19px;
}

.sharpen {
    background-image: var(--bgi);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    image-rendering: pixelated;
    height: 100%;
}
</style>
