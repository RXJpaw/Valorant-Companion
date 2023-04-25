<template>
    <transition>
        <div v-if="loaded && active" class="preferences">
            <div class="settings-background"></div>
            <div class="settings-window" ref="settings">
                <div class="settings">
                    <div class="setting ingame-settings">
                        <div class="header">In-Game Settings</div>
                        <div class="inputs" style="flex-direction: row; flex-wrap: wrap">
                            <TextInput
                                ref="ingame-settings-preset-name-input"
                                :disabled="!game_ready || ingame_settings.working"
                                class="preset-name-input input"
                                width="253px"
                                :placeholder="getAddPresetPlaceholder()"
                                v-model:input="ingame_settings.new_preset_name"
                                type="text"
                            />
                            <Button
                                :disabled="!game_ready || ingame_settings.working || ingame_settings.new_preset_name.trim().length < 2"
                                class="button"
                                text="Add Preset"
                                style="min-width: 90px; margin: 2px 0"
                                @click="clickAddPresetInGameSettings"
                            />
                            <DropdownInput
                                ref="ingame-settings-select-preset-input"
                                :disabled="!game_ready || ingame_settings.working || !ingame_settings.preset_list.length"
                                class="select-preset-input input"
                                v-model:input="ingame_settings.preset_list"
                                v-model:index="ingame_settings.selected"
                                width="227px"
                                :placeholder="getUsePresetPlaceholder()"
                                :modifiable="true"
                                @splice="splicePresetIngameSettings"
                            ></DropdownInput>
                            <Button
                                :disabled="!game_ready || ingame_settings.working || ingame_settings.selected === null"
                                class="button"
                                text="Apply & Restart"
                                :alternative="ingame_settings.apply_alternate_text"
                                style="min-width: 116px; margin: 2px 0"
                                @click:primary="clickUsePresetInGameSettings(true)"
                                @click:secondary="clickUsePresetInGameSettings"
                                @mouseenter="hoverUsePresetEasterEgg"
                            />
                        </div>
                    </div>
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
                                :disabled="auto_updating.testing"
                                class="button"
                                :text="auto_updating.tested ? 'Save Server' : 'Test Server'"
                                @click="auto_updating.tested ? clickSaveAutoUpdating() : clickTestAutoUpdating()"
                            />
                        </div>
                    </div>
                    <div class="setting database-backup">
                        <div class="header">Database Backup</div>
                        <div class="inputs"></div>
                        <div class="buttons">
                            <CheckboxInput
                                class="input"
                                text="Ex-/Import folders"
                                :reverse="true"
                                :disabled="!database_backup.can_import || database_backup.has_dialog_open || database_backup.processing_backup"
                                v-model:input="database_backup.use_folder_import"
                            />
                            <Button
                                class="button"
                                :disabled="!database_backup.can_import || database_backup.has_dialog_open || database_backup.processing_backup"
                                text="Import"
                                @click="importBackup"
                            />
                            <Button
                                class="button"
                                :disabled="database_backup.has_dialog_open || database_backup.processing_backup"
                                text="Export"
                                @click="exportBackup"
                            />
                        </div>
                    </div>
                    <transition>
                        <div v-if="database_backup.processing_backup" class="progress-bar database-backup">
                            <div class="progress" :style="{ width: `${database_backup.processing_percent * 100}%` }"></div>
                        </div>
                    </transition>
                    <div class="notifications database-backup">
                        <div v-if="!database_backup.can_import" class="notice important">
                            <div class="icon">
                                <Icon icon="warning" size="16px" />
                            </div>
                            <div class="text">
                                Imports will be available once you rebuild the client. Before rebuilding make sure you "Export" a backup to guarantee your
                                progress is saved in case of data loss. From version 2.8.0 this is no longer an issue.
                            </div>
                        </div>
                        <div v-if="!database_backup.can_import" class="notice warning">
                            <div class="icon">
                                <Icon icon="warning" size="16px" />
                            </div>
                            <div class="text">
                                Exports will save in "C:/Valorant Companion Backups/" due to the limitations of auto-updating. You'll be able to select your
                                preferred backup destination once you rebuilt the client. We recommend making a backup first.
                            </div>
                        </div>
                    </div>
                    <div class="setting fidget-toys">
                        <div class="header">Fidget-Toys</div>
                        <div class="inputs">
                            <TextInput
                                ref="fidget-toy-input"
                                class="fidget-toy-input input"
                                width="100%"
                                placeholder="I-I don't even like you, baka!"
                                type="text"
                            />
                        </div>
                        <div class="buttons">
                            <Button class="button" text="Noo! >w< Don't click me! :3" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { deleteRiotLockFiles, killAllRiotProcesses, sleep, startRiotClient } from '@/scripts/methods'
import DropdownInput from '@/components/Input/DropdownInput.vue'
import CheckboxInput from '@/components/Input/CheckboxInput.vue'
import { ValorantInstance } from '@/scripts/valorant_instance'
import TextInput from '@/components/Input/TextInput.vue'
import Button from '@/components/Input/Button.vue'
import Icon from '@/components/Misc/Icon.vue'
import Animation from '@/scripts/animations'
import { Backup } from '@/scripts/backup'
import localForage from 'localforage'

const Store = {
    InGameSettings: localForage.createInstance({ name: 'Valorant', storeName: 'InGameSettings' })
}

const Valorant = ValorantInstance()
const PreferencesChannel = new BroadcastChannel('preferences')

export default {
    name: 'Preferences',
    components: { DropdownInput, CheckboxInput, Icon, Button, TextInput },
    props: {
        active: Boolean as () => boolean
    },
    data() {
        return {
            loaded: false,
            game_ready: false,
            ingame_settings: {
                apply_alternate_text: 'Exit Instead',
                new_preset_name: '',
                preset_list: [],
                selected: null,
                working: false
            },
            auto_updating: {
                testing: false,
                tested: false,
                server_address: '',
                server_password: ''
            },
            database_backup: {
                can_import: false,
                use_folder_import: false,
                has_dialog_open: false,
                processing_backup: false,
                processing_percent: 0
            }
        }
    },
    async created() {
        const { Client } = Valorant
        Client.on('ready', () => (this.game_ready = true))
        Client.on('error', () => (this.game_ready = false))

        this.ingame_settings.preset_list = await Store.InGameSettings.keys()

        this.database_backup.can_import = Backup.AcceptedFormats.includes('zip')
        this.database_backup.use_folder_import = !this.database_backup.can_import

        await this.getUpdaterSource()

        this.loaded = true

        window.addEventListener('keydown', (event) => {
            if (event.code === 'Escape') this.disableActive()

            if (event.code === 'F1') {
                if (this.active) {
                    this.disableActive()
                } else {
                    this.enableActive()
                }
            }
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
        enableActive() {
            if (this.active) return
            this.$emit('update:active', true)
        },
        disableActive() {
            if (!this.active) return
            this.$emit('update:active', false)
        },
        getAddPresetPlaceholder() {
            if (!this.game_ready) {
                return 'Start VALORANT first'
            } else {
                return 'New Preset Name'
            }
        },
        getUsePresetPlaceholder() {
            if (!this.game_ready) {
                return 'Start VALORANT first'
            } else if (!this.ingame_settings.preset_list.length) {
                return 'Add a Preset first'
            } else {
                return 'Select Preset'
            }
        },
        async clickAddPresetInGameSettings() {
            this.ingame_settings.working = true

            try {
                const NewPresetName = this.ingame_settings.new_preset_name.trim()
                const PlayerSettings = await Valorant.getAresPlayerSettings()

                await Store.InGameSettings.setItem(NewPresetName, {
                    Data: PlayerSettings,
                    Version: Date.now()
                })

                this.ingame_settings.new_preset_name = ''
                this.ingame_settings.preset_list = (await Store.InGameSettings.keys()).sort()
            } finally {
                this.ingame_settings.working = false
            }
        },
        async splicePresetIngameSettings(element: string[]) {
            await Store.InGameSettings.removeItem(element[0])
        },
        async clickUsePresetInGameSettings(restart: boolean) {
            this.ingame_settings.working = true

            try {
                if (this.ingame_settings.selected === null) return

                const Selected = this.ingame_settings.preset_list[this.ingame_settings.selected]
                const Settings = await Store.InGameSettings.getItem(Selected)
                const Data = (<any>Settings)?.Data.data
                if (!Data) return

                this.ingame_settings.selected = null

                await Valorant.putAresPlayerSettings(Data)
                await sleep(500)
                await killAllRiotProcesses()
                await sleep(500)
                await deleteRiotLockFiles()

                if (!restart) return
                await sleep(500)
                startRiotClient('valorant').then()
            } finally {
                this.ingame_settings.working = false
            }
        },
        async hoverUsePresetEasterEgg() {
            this.ingame_settings.apply_alternate_text = Math.random() <= 0.04 ? "Apply'n'Bye bye" : 'Exit Instead'
        },
        async importBackup() {
            this.database_backup.has_dialog_open = true

            const DialogProperties: any[] = []
            const DialogFilters: any[] = []
            if (this.database_backup.use_folder_import) {
                DialogProperties.push('openDirectory')
            } else {
                DialogProperties.push('openFile')
                DialogFilters.push({ name: 'Valorant Companion Backup', extensions: ['vcb'] })
            }

            const { filePaths } = await window.electron.ipcRenderer.invoke('show-open-dialog', { properties: DialogProperties, filters: DialogFilters })

            this.database_backup.has_dialog_open = false
            if (!filePaths[0]) return
            this.database_backup.processing_backup = true

            const Import = Backup.importIndexedDb(filePaths[0], false, false)
            Import.Client.on('progress', (progress) => {
                this.database_backup.processing_percent = progress
            })
            Import.Client.on('error', (error) => {
                console.error('Backup/importIndexedDb', error)
            })
            Import.Client.on('end', () => {
                this.database_backup.processing_backup = false
                this.database_backup.processing_percent = 0

                location.reload()
            })

            Import.execute()
        },
        async exportBackup() {
            this.database_backup.has_dialog_open = true

            let filePath = 'C:/Valorant Companion Backups/'
            if (this.database_backup.can_import) {
                const Dialog = await window.electron.ipcRenderer.invoke('show-open-dialog', { properties: ['openDirectory'] })
                filePath = Dialog?.filePaths[0]
            }

            this.database_backup.has_dialog_open = false
            if (!filePath) return
            this.database_backup.processing_backup = true

            const Export = Backup.exportIndexedDb(filePath, this.database_backup.use_folder_import)
            Export.Client.on('progress', (progress) => {
                this.database_backup.processing_percent = progress
            })
            Export.Client.on('error', (error) => {
                console.error('Backup/exportIndexedDb', error)
            })
            Export.Client.on('end', () => {
                this.database_backup.processing_backup = false
                this.database_backup.processing_percent = 0
            })

            Export.execute()
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
.progress-bar:is(.v-enter-from, .v-leave-to) {
    margin-top: -33px;
}
.preferences {
    position: relative;
    z-index: 280;

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
.progress-bar {
    z-index: 1250;

    position: relative;
    margin: -28px 22px 22px;

    min-height: 11px;
    background-color: #1c1c1c;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;

    transition: margin-top 0.15s ease-in-out;
}
.progress-bar > .progress {
    height: 100%;
    border-radius: 6px;
    background-color: var(--lighter);
}
.notifications {
    display: flex;
    flex-direction: column;
    gap: 22px;

    margin-left: 22px;
    margin-right: 22px;
}
.notifications:not(:has(div)) {
    display: none;
}
.notifications > :not(:last-child) {
    box-shadow: 0 1px 6px 0 #0a0a0a;
}
.notifications > .notice {
    display: flex;

    margin-top: -28px;

    border-bottom-right-radius: 6px;
    border-bottom-left-radius: 6px;
}
.notifications > .notice.warning {
    color: #0a0a0a;
    background-color: #fb8c00;
}
.notifications > .notice.important {
    color: #0a0a0a;
    background-color: #f44336;
}
.notifications > .notice > .icon {
    margin-left: 3px;
    margin-top: 6px;
    padding: 3px;
}
.notifications > .notice > .text {
    margin-top: 6px;
    padding: 3px 9px 3px 3px;

    font-size: 14px;
    text-align: left;
    line-height: 16px;
}
.settings {
    position: relative;
    margin-top: 22px;

    display: flex;
    flex-direction: column;

    width: 100%;
    height: calc(100% - 44px);

    overflow: var(--webkit-overlay);
}
.settings > :not(.progress-bar):not(:last-child) {
    margin-bottom: 22px;
}
.settings > .setting {
    padding: 11px 22px 22px;
    margin-left: 22px;
    margin-right: 22px;
    border-radius: 6px;

    background-color: #121212;
}
.settings > *.ingame-settings {
    --lighter: #90a4ae;
    --darker: #78909c;
    --darkest: #607d8b;
}
.settings > *.auto-updating {
    --lighter: #9575cd;
    --darker: #7e57c2;
    --darkest: #673ab7;
}
.settings > *.database-backup {
    --lighter: #7986cb;
    --darker: #5c6bc0;
    --darkest: #3f51b5;
}
.settings > *.fidget-toys {
    --lighter: #aed581;
    --darker: #8bc34a;
    --darkest: #689f38;
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
.settings > .setting > * > .input {
    --background-color: #1c1c1c;
    --placeholder-font-color: #737373;
    --vibrant-color: var(--lighter);
    --checked-color: var(--darkest);
}
.settings > .setting > .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 11px;
    margin-top: 11px;
}
.settings > .setting > .inputs > .button,
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

.notifications > :nth-child(1) {
    z-index: 1199;
}
.notifications > :nth-child(2) {
    z-index: 1198;
}
.notifications > :nth-child(3) {
    z-index: 1197;
}
.notifications > :nth-child(4) {
    z-index: 1196;
}
.notifications > :nth-child(5) {
    z-index: 1195;
}
.notifications > :nth-child(6) {
    z-index: 1194;
}
.notifications > :nth-child(7) {
    z-index: 1193;
}

.settings > .setting:nth-child(1) {
    z-index: 1499;
}
.settings > .setting:nth-child(2) {
    z-index: 1498;
}
.settings > .setting:nth-child(3) {
    z-index: 1497;
}
.settings > .setting:nth-child(4) {
    z-index: 1496;
}
.settings > .setting:nth-child(5) {
    z-index: 1495;
}
.settings > .setting:nth-child(6) {
    z-index: 1494;
}
.settings > .setting:nth-child(7) {
    z-index: 1493;
}
.settings > .setting:nth-child(8) {
    z-index: 1492;
}
.settings > .setting:nth-child(9) {
    z-index: 1491;
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
