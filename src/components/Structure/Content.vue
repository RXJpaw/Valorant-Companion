<template>
    <div v-if="ready === true" class="content">
        <div class="match-history-tabs">
            <MatchHistory
                v-for="(tab, index) in matchHistoryTabs"
                v-show="activeButton === 'match-history' && activeMatchHistoryTab === index"
                :isVisible="activeButton === 'match-history' && activeMatchHistoryTab === index"
                :subject="tab.Subject"
            />
        </div>
        <CurrentMatch v-show="activeButton === 'current-match'" :isVisible="activeButton === 'current-match'" />
        <PlayerLookup v-show="activeButton === 'player-lookup'" />
        <LoadoutManager v-show="activeButton === 'loadout-manager'" :isVisible="activeButton === 'loadout-manager'" />
    </div>
    <div v-else class="content">
        <NotReady text="Waiting for VALORANT to start..." />
    </div>
</template>

<script lang="ts">
import LoadoutManager from '@/components/Content/LoadoutManager.vue'
import PlayerLookup from '@/components/Content/PlayerLookup.vue'
import CurrentMatch from '@/components/Content/CurrentMatch.vue'
import MatchHistory from '@/components/Content/MatchHistory.vue'
import { ValorantInstance } from '@/scripts/valorant_instance'
import NotReady from '@/components/Content/NotReady.vue'

const Valorant = ValorantInstance()

export default {
    name: 'Content',
    components: {
        LoadoutManager,
        PlayerLookup,
        CurrentMatch,
        NotReady,
        MatchHistory
    },
    props: {
        matchHistoryTabs: Array,
        activeMatchHistoryTab: Number,
        activeButton: String as () => string
    },
    data() {
        return {
            ready: null
        }
    },
    async created() {
        const { Client } = Valorant

        Client.on('ready', (data) => (this.ready = true))
        Client.on('error', (data) => (this.ready = false))

        await Client.login()
    }
}
</script>

<style scoped>
.content {
    position: absolute;
    top: 0;
    right: 0;

    height: 100%;
    width: calc(100% - 256px);

    background-color: #2f3136;

    border: solid 0;
    border-top-left-radius: 6px;

    overflow: var(--webkit-overlay);
}
</style>
