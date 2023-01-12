<template>
    <Titlebar />
    <Structure />
</template>

<script lang="ts">
import { ValorantInstance } from './scripts/valorant_instance'
import PersistentCache from './scripts/cache_manager'
import Structure from '@/components/Structure.vue'
import Titlebar from './components/Titlebar.vue'
import { sleep } from './scripts/methods'

const Valorant = ValorantInstance()

export default {
    components: {
        Structure,
        Titlebar
    },
    data() {
        return {}
    },
    async created() {
        const { Client } = Valorant

        Client.on('ready', (data) => (data.length !== 0 ? console.debug('ready', structuredClone(data)) : null))
        Client.on('error', (data) => console.debug('error', structuredClone(data)))
        Client.on('friends', (data) => console.debug('friends', structuredClone(data)))
        Client.on('presences', (data) => console.debug('presences', structuredClone(data)))

        await Client.login()
    },
    async mounted() {
        window.electron.show()

        await sleep(3000)
        await PersistentCache.delete_expired()
    }
}
</script>

<style>
@font-face {
    font-family: 'Valorant';
    src: url(~@/assets/fonts/valorant.woff2) format('woff2');
}

::-webkit-scrollbar {
    width: 11px;
    height: 11px;
}
::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: 10px;
}
::-webkit-scrollbar-thumb {
    border: 3px solid #2f3136;
    background-color: #121314;
    border-radius: 10px;
}

body {
    margin: 0;
}

#app {
    --webkit-fill-available: -webkit-fill-available;
    --webkit-optimize-contrast: -webkit-optimize-contrast;
    --webkit-overlay: overlay;
    image-rendering: var(--webkit-optimize-contrast);

    font-family: Valorant, Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;

    width: 100vw;
    height: 100vh;

    color: #ffffff;
    z-index: -1;
}

input {
    border: 0;
    background: transparent;
    font-family: inherit;
    color: inherit;
}

@keyframes fetching-animation {
    0% {
        background: #40444b;
    }
    10% {
        background: #40444b;
    }
    50% {
        background: #555a63;
    }
    90% {
        background: #40444b;
    }
    100% {
        background: #40444b;
    }
}
</style>
