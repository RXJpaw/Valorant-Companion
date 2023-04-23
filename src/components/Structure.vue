<template>
    <div class="structure">
        <Sidebar v-model:active-button="activeButton" v-model:match-history-tabs="matchHistoryTabs" v-model:active-match-history-tab="activeMatchHistoryTab" />
        <Content :active-button="activeButton" :match-history-tabs="matchHistoryTabs" :active-match-history-tab="activeMatchHistoryTab" />

        <Preferences v-model:active="showPreferences" />
        <AccountSwitcher v-model:active="showAccountSwitcher" />
    </div>
</template>

<script lang="ts">
import AccountSwitcher from '@/components/Structure/AccountSwitcher.vue'
import Preferences from '@/components/Structure/Preferences.vue'
import { ValorantInstance } from '@/scripts/valorant_instance'
import Content from '@/components/Structure/Content.vue'
import Sidebar from '@/components/Structure/Sidebar.vue'

const Valorant = ValorantInstance()
const PreferencesChannel = new BroadcastChannel('preferences')
const MatchHistoryChannel = new BroadcastChannel('match-history')
const AccountSwitcherChannel = new BroadcastChannel('account-switcher')

export default {
    name: 'Structure',
    components: {
        AccountSwitcher,
        Preferences,
        Content,
        Sidebar
    },
    data() {
        return {
            showPreferences: false,
            showAccountSwitcher: false,
            // activeButton: 'loadout-manager',
            activeButton: 'current-match',
            matchHistoryTabs: [],
            activeMatchHistoryTab: 0
        }
    },
    watch: {
        showPreferences(current) {
            if (!current) return
            this.showAccountSwitcher = false
        },
        showAccountSwitcher(current) {
            if (!current) return
            this.showPreferences = false
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

        AccountSwitcherChannel.onmessage = ({ data: message }) => {
            switch (message) {
                case 'close': {
                    this.showAccountSwitcher = false
                    break
                }
                case 'open': {
                    this.showAccountSwitcher = true
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
    overflow: hidden;
    top: 22px;

    height: calc(100% - 22px);
    width: 100%;

    background-color: #202225;
}
</style>
