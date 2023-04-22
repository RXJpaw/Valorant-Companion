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
import localForage from 'localforage'

const Store = {
    AccountDetails: localForage.createInstance({ name: 'Valorant', storeName: 'AccountDetails' })
}

const Valorant = ValorantInstance()
const AccountSwitcherChannel = new BroadcastChannel('account-switcher')
const GameStateChangeChannel = new BroadcastChannel('game-state-change')

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
        const instanceId = 'app'

        Client.on('ready', (data) => (data.length !== 0 ? console.debug('ready', structuredClone(data)) : null))
        Client.on('error', (data) => console.debug('error', structuredClone(data)))
        Client.on('friends', (data) => console.debug('friends', structuredClone(data)))
        Client.on('presences', (presences, eventType, affected) => console.debug('presences', structuredClone(presences), { [eventType]: affected }))

        GameStateChangeChannel.addEventListener('message', ({ data }) => {
            const { from, to } = data

            if (from === 'INGAME' && to === 'MENUS') {
                Valorant.getSelfLoadout(true)
                Valorant.getAccountXP(true)
                Valorant.getMMR(Valorant.getSelfSubject(), true)
            }
        })

        Client.on('presences', async (presences, eventType, affected) => {
            if (!['login', 'update', 'create', 'auth'].includes(eventType)) return
            const selfSubject = Valorant.getSelfSubject()
            if (!selfSubject) return

            if (['update', 'create'].includes(eventType) && affected?.includes(selfSubject)) return
            if (eventType === 'login' && affected !== instanceId) return
            if (!presences.length) return

            const Servers = Valorant.getServers()
            if (!Servers) return

            const Presence = presences.find((p) => p.Subject === selfSubject)
            if (!Presence) return

            const MMR = await Valorant.parseMMR(selfSubject)
            const Loadout = await Valorant.getSelfLoadout()
            const LevelBorder = await Valorant.getLevelBorder(Presence.accountLevel, Loadout.Identity.PreferredLevelBorderID)

            await Store.AccountDetails.setItem(selfSubject, {
                Subject: selfSubject,

                GameName: Presence.GameName,
                TagLine: Presence.TagLine,
                Level: Presence.accountLevel,

                Rank: MMR.CurrentRank,
                RR: MMR.CurrentRR,

                PlayerCardID: Presence.playerCardId,
                LevelBorderID: LevelBorder.uuid,

                Servers: Servers,
                Version: Date.now()
            })

            AccountSwitcherChannel.postMessage('update')
        })

        await Client.login(null, instanceId)
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
