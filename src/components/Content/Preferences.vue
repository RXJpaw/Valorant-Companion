<template>
    <div class="preferences">
        <div class="background" @click="close"></div>
        <div class="window">
            <div class="sidebar">
                <div class="buttons">
                    <div class="button" @click="setting = 'update-server'">Update Server</div>
                </div>
            </div>
            <div class="content">
                <ContentUpdateServer v-if="setting === 'update-server'" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import ContentUpdateServer from '@/components/Preferences/ContentUpdateServer.vue'

const PreferencesChannel = new BroadcastChannel('preferences')

export default {
    name: 'Preferences',
    components: { ContentUpdateServer },
    data() {
        return {
            setting: 'update-server' as never as string
        }
    },
    methods: {
        close() {
            PreferencesChannel.postMessage('close')
        }
    }
}
</script>

<style scoped>
:root {
    --window-top: 0;
    --window-left: 0;
}

.preferences {
    position: absolute;

    height: 100%;
    width: 100%;
}

.preferences > .background {
    height: inherit;
    width: inherit;

    background-color: #000000d0;
}

.preferences > .window {
    --window-left: 176px;
    --window-top: 88px;

    position: absolute;
    left: var(--window-left);
    top: var(--window-top);

    width: calc(1280px - (var(--window-left) * 2));
    height: calc(720px - (var(--window-top) * 2) - 22px);

    background-color: #2f3136;
    border-radius: 6px;
    overflow: hidden;
}
.preferences > .window > .content {
    position: absolute;
    right: 0;
    top: 0;

    width: calc(100% - 256px);
    height: 100%;
}
.preferences > .window > .sidebar {
    position: absolute;

    background-color: #202225;

    width: 256px;
    height: calc(720px - (var(--window-top) * 2) - 22px);
}
.preferences > .window > .sidebar > .buttons {
    display: flex;
    flex-direction: column;
    gap: 5px;

    margin: 11px;
}
.preferences > .window > .sidebar > .buttons > .button {
    padding: 11px;

    font-size: 14px;
    line-height: 10px;
    text-align: left;

    border-radius: 6px;
    background-color: #18191c;

    cursor: pointer;

    transition: background-color 0.15s ease-in-out;
}
.preferences > .window > .sidebar > .buttons > .button:hover {
    background-color: #121314;
}
</style>
