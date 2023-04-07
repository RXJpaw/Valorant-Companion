<template>
    <div class="sidebar">
        <div class="upper">
            <Profile />
            <div class="current-match">
                <StructureSidebarButton name="current-match" v-model:active="activeButton" text="Current Match" />
            </div>
            <div class="player-lookup">
                <StructureSidebarButton name="player-lookup" v-model:active="activeButton" text="Player Lookup" />
            </div>
            <div class="match-history">
                <StructureSidebarButton name="match-history" v-model:active="activeButton" text="Match History" />
                <div v-if="matchHistoryTabs.length > 1" class="tabs">
                    <StructureSidebarTab
                        v-for="(tab, index) in matchHistoryTabs"
                        group-name="match-history"
                        :index="index"
                        v-model:tabs="matchHistoryTabs"
                        v-model:active="activeMatchHistoryTab"
                        v-model:group-active="activeButton"
                        :text="tab.GameName"
                        :key="tab.Subject"
                    ></StructureSidebarTab>
                </div>
            </div>
            <div class="loadout-manager">
                <StructureSidebarButton name="loadout-manager" v-model:active="activeButton" text="Loadout Manager" />
            </div>
        </div>
        <div class="lower">
            <StructureSidebarUpdate />
            <div class="footer">
                <div class="version">Valorant Companion, Closed {{ version }}</div>
                <div class="copyright">Copyright © 2023 RXJpaw</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import StructureSidebarUpdate from '@/components/Button/StructureSidebarUpdate.vue'
import StructureSidebarButton from '@/components/Button/StructureSidebarButton.vue'
import StructureSidebarTab from '@/components/Button/StructureSidebarTab.vue'
import Profile from '@/components/Button/StructureSidebarProfile.vue'
import { project_version } from '../../../package.json'

export default {
    name: 'Sidebar',
    components: {
        Profile,
        StructureSidebarUpdate,
        StructureSidebarButton,
        StructureSidebarTab
    },
    props: {
        matchHistoryTabs: Array,
        activeMatchHistoryTab: Number,
        activeButton: String as () => string
    },
    watch: {
        activeButton(data, from) {
            this.$emit('update:active-button', data)
        },
        matchHistoryTabs(data, from) {
            this.$emit('update:match-history-tabs', data)
        },
        activeMatchHistoryTab(data, from) {
            this.$emit('update:active-match-history-tab', data)
        }
    },
    data() {
        return {
            version: project_version
        }
    },
    methods: {
        openExternal: window.electron.openExternal
    }
}
</script>

<style scoped>
.sidebar {
    z-index: 50;

    position: absolute;
    top: 0;
    left: 0;

    height: 100%;
    width: 256px;

    background-color: #202225;
}
.sidebar > .upper {
    position: absolute;
    top: 0;

    height: auto;
    width: inherit;
}

.sidebar > .lower {
    position: absolute;
    bottom: 0;

    height: auto;
    width: inherit;
}
.sidebar > .lower > .footer {
    display: flex;
    flex-direction: column;
    gap: 3px;

    margin: 22px 0;
}
.sidebar > .lower > .footer > * {
    color: #40444b;
    font-size: 12px;
    line-height: 12px;
    text-decoration: none;
}
.sidebar .tabs {
    max-height: 115px;
    overflow: auto;
    width: fit-content;
}

::-webkit-scrollbar {
    width: 15px;
    height: 15px;
}
::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: 10px;
}
::-webkit-scrollbar-thumb {
    border: 5px solid #202225;
    background-color: #121314;
    border-radius: 10px;
}
</style>
