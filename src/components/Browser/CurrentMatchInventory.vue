<template>
    <div class="inventory" :style="`left: ${left}px; top: ${top}px;`">
        <div class="weapons">
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
    } //446
}
</script>

<style scoped>
.inventory {
    --uwu: 0.5;
    position: absolute;

    border-radius: 6px;
    background-color: #202225;
}
.inventory > .weapons {
    display: grid;
    grid-auto-flow: column;
    /*grid-template-columns: 52px 86px 95px 103px; !* scaled to 0.368 *!*/
    /*grid-template-columns: calc(142px * var(--uwu)) calc(232px * var(--uwu)) calc(260px * var(--uwu)) calc(280px * var(--uwu));*/
    grid-template-columns: 71px 116px 130px 140px; /* scaled to 0.5 */
    grid-template-rows: repeat(5, 49px);
    grid-column-gap: 11px;
    grid-row-gap: 11px;

    margin: 11px;
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
