<template>
    <div class="structure">
        <Sidebar v-model:active-button="activeButton" v-model:match-history-tabs="matchHistoryTabs" v-model:active-match-history-tab="activeMatchHistoryTab" />
        <Content :active-button="activeButton" :match-history-tabs="matchHistoryTabs" :active-match-history-tab="activeMatchHistoryTab" />

        <transition-group>
            <Preferences v-if="showPreferences" />
        </transition-group>
    </div>
</template>

<script lang="ts">
import Preferences from '@/components/Content/Preferences.vue'
import { ValorantInstance } from '@/scripts/valorant_instance'
import Content from '@/components/Structure/Content.vue'
import Sidebar from '@/components/Structure/Sidebar.vue'

const Valorant = ValorantInstance()
const PreferencesChannel = new BroadcastChannel('preferences')
const MatchHistoryChannel = new BroadcastChannel('match-history')

export default {
    name: 'Structure',
    components: {
        Preferences,
        Content,
        Sidebar
    },
    data() {
        return {
            showPreferences: false,
            // activeButton: 'loadout-manager',
            activeButton: 'current-match',
            matchHistoryTabs: [],
            activeMatchHistoryTab: 0
        }
    },
    async created() {
        const { Client } = Valorant

        Client.on('ready', () => {
            const SelfSubject = Valorant.getSelfSubject()
            const Presence = Valorant.getCachePresences().find((presence) => presence.Subject === SelfSubject)

            if (Presence) {
                this.matchHistoryTabs[0] = {
                    GameName: Presence.GameName,
                    Subject: Presence.Subject,
                    Icon: `https://media.valorant-api.com/playercards/${Presence.playerCardId}/displayicon.png`
                }
            }
        })

        MatchHistoryChannel.onmessage = ({ data }) => {
            const Player = <any>data
            console.log()

            this.matchHistoryTabs.push({
                GameName: Player.GameName,
                Subject: Player.Subject,
                Icon: `https://media.valorant-api.com/playercards/${Player.PlayerCardID}/displayicon.png`
            })
        }

        PreferencesChannel.onmessage = ({ data: message }) => {
            switch (message) {
                case 'close': {
                    this.showPreferences = false
                    break
                }
                case 'open': {
                    this.showPreferences = true
                    break
                }
            }
        }

        Client.on('error', () => {
            this.matchHistoryTabs = []
        })
    }
}
</script>

<style scoped>
.structure {
    position: absolute;
    top: 22px;

    height: calc(100% - 22px);
    width: 100%;

    background-color: #202225;
}
</style>

<style>
.structure > .preferences:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
}
.structure > .preferences:is(.v-enter-from, .v-leave-to) > .window {
    scale: 0.66;
}

.structure > .preferences {
    transition: opacity 0.15s ease-in-out;
}
.structure > .preferences > .window {
    transition: scale 0.15s ease-in-out;
}
</style>
