<template>
    <transition>
        <div v-if="loaded && active" class="preferences">
            <div class="settings-background"></div>
            <div class="settings-window" ref="settings">
                <div class="settings">
                    <div class="setting auto-updating">
                        <div class="header">Update-Server Preferences</div>
                        <div class="inputs">
                            <TextInput
                                ref="auto-updating-server-address-input"
                                class="server-address-input input"
                                width="100%"
                                placeholder="Server Address"
                                v-model:input="auto_updating.server_address"
                                type="text"
                            />
                            <TextInput
                                ref="auto-updating-server-password-input"
                                class="server-password-input input"
                                width="100%"
                                placeholder="Server Password"
                                v-model:input="auto_updating.server_password"
                                type="password"
                            />
                        </div>
                        <div class="buttons">
                            <Button
                                v-if="!auto_updating.tested"
                                :disabled="auto_updating.testing"
                                class="button"
                                text="Test Server"
                                @click="clickTestAutoUpdating"
                            />
                            <Button
                                v-if="auto_updating.tested"
                                :disabled="auto_updating.testing"
                                class="button"
                                text="Save Server"
                                @click="clickSaveAutoUpdating"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import TextInput from '@/components/Browser/TextInput.vue'
import Button from '@/components/Browser/Button.vue'
import Animation from '@/scripts/animations'
import { sleep } from '@/scripts/methods'

const PreferencesChannel = new BroadcastChannel('preferences')

export default {
    name: 'Preferences',
    components: { Button, TextInput },
    props: {
        active: Boolean as () => boolean
    },
    data() {
        return {
            loaded: false,
            auto_updating: {
                testing: false,
                tested: false,
                server_address: '',
                server_password: ''
            }
        }
    },
    async created() {
        await this.getUpdaterSource()
        this.loaded = true

        window.addEventListener('keydown', (event) => {
            if (event.code === 'Escape') this.disableActive()
        })
        window.addEventListener('mousedown', (event) => {
            if (!this.loaded || !this.active || !this.$refs.settings) return
            const settingsRects = this.$refs.settings.getBoundingClientRect()

            if (event.x < settingsRects.x) return this.disableActive()
            if (event.y < settingsRects.y) return this.disableActive()
            if (event.x > settingsRects.x + settingsRects.width) return this.disableActive()
            if (event.y > settingsRects.y + settingsRects.height) return this.disableActive()
        })
    },
    methods: {
        disableActive() {
            if (!this.active) return
            this.$emit('update:active', false)
        },
        async testUpdaterSource() {
            this.auto_updating.testing = true

            const source = this.auto_updating.server_address.match(/https:\/\/api\.github\.com\/repos\/.+\/releases\/latest/gm) ? 'github' : 'custom'
            const response = await fetch(`${this.auto_updating.server_address}?key=${this.auto_updating.server_password}`).catch(() => {})
            if (!response?.ok) return (this.auto_updating.testing = false)

            try {
                const json = await response.json()
                if (source === 'github') {
                    if (!json.tag_name || !json.name || !json.assets.find((a) => a.name === 'update.bin')) return (this.auto_updating.testing = false)

                    this.auto_updating.testing = false
                    this.auto_updating.tested = true
                } else {
                    if (!json.electron || !json.project || !json.asarURL || !json.download) return (this.auto_updating.testing = false)

                    this.auto_updating.testing = false
                    this.auto_updating.tested = true
                }
            } finally {
                this.auto_updating.testing = false
            }

            this.auto_updating.testing = false
        },
        async getUpdaterSource() {
            const result = await window.electron.ipcRenderer.invoke('get-updater-source')

            this.auto_updating.server_address = result.url
            this.auto_updating.server_password = result.key
        },
        async setUpdaterSource() {
            if (!this.auto_updating.tested) return
            this.auto_updating.testing = true

            window.electron.ipcRenderer.send('change-updater-source', {
                url: this.auto_updating.server_address,
                key: this.auto_updating.server_password
            })

            await sleep(500)
            await this.getUpdaterSource()

            this.auto_updating.testing = false
            this.auto_updating.tested = false
        },
        async clickTestAutoUpdating() {
            await this.testUpdaterSource()
            if (this.auto_updating.tested) return

            this.$refs['auto-updating-server-address-input'].$refs.input.animate(Animation.headShake, 750)
            this.$refs['auto-updating-server-password-input'].$refs.input.animate(Animation.headShake, 750)
        },
        async clickSaveAutoUpdating() {
            await this.setUpdaterSource()
        }
    }
}
</script>

<style scoped>
.preferences:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
}
.preferences {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    transition: opacity 0.15s ease-in-out;
}

.settings-background {
    z-index: 300;

    position: absolute;
    left: 0;
    top: 0;

    height: 100%;
    width: 100%;

    background-color: #00000099;
    backdrop-filter: blur(4px);

    animation: backdrop-filter-animation 0.3s linear;
}

.settings-window {
    z-index: 320;

    width: 442px;
    height: 654px;

    outline: 0 solid;
    border-radius: 6px;

    background-color: #0a0a0a;
}
.settings {
    position: relative;
    left: 22px;
    top: 22px;

    display: flex;
    flex-direction: column;
    gap: 22px;

    width: calc(100% - 22px);
    max-height: calc(100% - 44px);

    overflow: var(--webkit-overlay);
}
.settings > .setting {
    padding: 11px 22px 22px;
    margin-right: 22px;
    border-radius: 6px;

    background-color: #121212;
}
.settings > .setting.auto-updating {
    --lighter: #9575cd;
    --darker: #7e57c2;
    --darkest: #673ab7;
}
.settings > .setting > .header {
    font-size: 13px;
    text-align: left;
    line-height: 9px;

    width: fit-content;
    padding: 6px;
    margin-bottom: 11px;

    color: var(--darker);
    outline: 1px solid var(--darker);
    outline-offset: -1px;
    border-radius: 6px;
}
.settings > .setting > .inputs {
    display: flex;
    flex-direction: column;
    gap: 11px;
}
.settings > .setting > .inputs > .input {
    --background-color: #1c1c1c;
    --placeholder-font-color: #737373;
    --vibrant-color: var(--lighter);
}
.settings > .setting > .buttons {
    display: flex;
    justify-content: space-between;
    flex-direction: row-reverse;
    margin-top: 11px;
}
.settings > .setting > .buttons > .button {
    --button-color: var(--darkest);
}

.settings::-webkit-scrollbar {
    width: 22px;
    height: 22px;
}
.settings::-webkit-scrollbar-thumb {
    border: 7px solid #0a0a0a;
    background-color: #1c1c1c;
    border-radius: 10px;
}

@keyframes backdrop-filter-animation {
    from {
        backdrop-filter: blur(0px);
    }
    25% {
        backdrop-filter: blur(1px);
    }
    50% {
        backdrop-filter: blur(2px);
    }
    75% {
        backdrop-filter: blur(3px);
    }
    to {
        backdrop-filter: blur(4px);
    }
}
</style>
