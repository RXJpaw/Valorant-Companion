<template>
    <div v-if="holdingFile" class="file-drag-layer"></div>
    <transition>
        <div v-if="loaded && active" class="account-switcher">
            <div class="accounts-background"></div>
            <div class="accounts-window" ref="account-window" :class="{ drag_outside: !!drag.subject && drag.outside }">
                <div class="accounts" ref="accounts">
                    <div
                        v-for="(account, index) in getAccountArray()"
                        class="account-wrapper"
                        :class="{
                            dragging: drag.subject === account.Subject && !account.Fake,
                            fake: account.Fake && !drag.outside,
                            hide: account.Fake && drag.outside,
                            [`dropdown-${dropdown.which}`]: dropdown.subject === account.Subject
                        }"
                        :style="{ 'z-index': 1500 - index, ...getDragStyle(account.Subject, account.Fake) }"
                        :key="account.Subject"
                        @mousedown.left="startDrag(account.Subject, $event)"
                    >
                        <div v-if="!['RAC', 'Fake-RAC'].includes(account.Subject)" class="account">
                            <div class="avatar" :style="`--bgi: url('https://media.valorant-api.com/playercards/${account.PlayerCardID}/smallart.png`"></div>
                            <div class="riot-id-flex">
                                <div class="riot-id">
                                    <div class="username">{{ account.GameName }}</div>
                                    <div class="tag">#{{ account.TagLine }}</div>
                                </div>
                                <div v-if="account.hasLogin" class="rank">
                                    <div class="icon" :style="`--bgi: url('${account.Rank.smallIcon}')`"></div>
                                </div>
                            </div>
                            <div
                                class="level-border"
                                :style="`--bgi: url('https://media.valorant-api.com/levelborders/${account.LevelBorderID}/levelnumberappearance.png')`"
                            ></div>
                            <div class="level">
                                <div v-for="number in String(account.Level).split('')" :class="number === '1' ? 'num1' : null">
                                    {{ number }}
                                </div>
                            </div>
                            <div v-if="account.hasLogin" class="play" :class="{ disabled: !can_login }" @click="switchToAccount(account.Subject)">
                                <Icon icon="play" size="23px" />
                            </div>
                            <div v-if="account.hasLogin" class="buttons">
                                <div class="button" @click="clickDropdownButton('store', account.Subject)">
                                    <Icon icon="val-store" size="18px" style="margin-right: 2px; margin-top: 1px" />
                                </div>
                                <div v-if="night_market" class="button" @click="clickDropdownButton('bonus', account.Subject)">
                                    <Icon icon="val-bonus" size="19px" />
                                </div>
                                <div class="button" @click="clickDropdownButton('export', account.Subject)">
                                    <Icon icon="import-export" size="23px" style="margin: -2px" />
                                </div>
                            </div>
                            <div v-else class="warning">No saved login data!</div>
                        </div>
                        <div v-else class="account rac">
                            <div class="header">Riot Account Import</div>
                            <TextInput
                                ref="rac-password-input"
                                class="password-input"
                                type="password"
                                width="251px"
                                :disabled="rac_importing"
                                v-model:input="rac_password"
                                placeholder="Enter Account Secret"
                                @keydown.enter="importAccount"
                            ></TextInput>
                            <Button
                                class="import-account"
                                :disabled="!rac_password.trim().length || rac_importing"
                                text="Import Account"
                                @click="importAccount"
                            ></Button>
                        </div>
                        <div class="dropdown">
                            <AccountStore :subject="dropdown.subject" :open="dropdown.subject === account.Subject && dropdown.which === 'store'" />
                            <AccountBonus
                                :subject="dropdown.subject"
                                :open="night_market && dropdown.subject === account.Subject && dropdown.which === 'bonus'"
                            />
                            <AccountExport
                                :subject="dropdown.subject"
                                :open="dropdown.subject === account.Subject && dropdown.which === 'export'"
                                @update:subject="dropdown.subject = $event"
                            />
                        </div>
                    </div>
                    <div class="uwu-luken-so-cute" :class="{ [dropdown.which]: !!dropdown.subject }"></div>
                </div>

                <div v-if="can_login" class="add-account" :class="{ playing: game_ready, new_login }" @click="addAccount()">
                    <div v-if="new_login" class="text">Remember to 'Stay signed in' before proceeding!</div>
                    <div v-else-if="game_ready" class="text">Accounts can be added when Valorant is closed!</div>
                    <Icon v-else icon="plus" size="29px" />
                </div>

                <div class="deletion-zone" ref="deletion-zone">
                    <Icon class="icon" icon="delete" size="192px" />
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import {
    deleteRiotLockFiles,
    fileExists,
    getPath,
    HandleError,
    HandleMouseOnElement,
    killAllRiotProcesses,
    sleep,
    startRiotClient,
    Store
} from '@/scripts/methods'
import AccountExport from '@/components/AccountSwitcher/AccountExport.vue'
import AccountBonus from '@/components/AccountSwitcher/AccountBonus.vue'
import AccountStore from '@/components/AccountSwitcher/AccountStore.vue'
import { ValorantInstance } from '@/scripts/valorant_instance'
import TextInput from '@/components/Input/TextInput.vue'
import Button from '@/components/Input/Button.vue'
import { RiotClient } from '@/scripts/riot_client'
import Icon from '@/components/Misc/Icon.vue'
import Animation from '@/scripts/animations'

const fs = window.require('fs/promises') as typeof import('fs/promises')

const Valorant = ValorantInstance()
const AccountSwitcherChannel = new BroadcastChannel('account-switcher')

export default {
    name: 'AccountSwitcher',
    components: { AccountExport, Button, TextInput, AccountBonus, AccountStore, Icon },
    props: {
        active: Boolean as () => boolean
    },
    data() {
        return {
            loaded: false,
            accounts: {},
            dropdown: {
                which: null,
                subject: null
            },
            game_ready: true,
            new_login: false,
            can_login: true,

            night_market: false,

            holdingFile: false,
            rac_password: '',
            rac_importing: false,

            drag: {
                outside: false,
                subject: null,
                index: 0,
                x: 0,
                y: 0,
                timeout: null as NodeJS.Timeout | null
            }
        }
    },
    async created() {
        this.updateAccounts().then()
        this.checkForNightMarket().then()

        const { Client } = Valorant
        Client.on('ready', (ready) => {
            if (ready.includes('auth')) this.new_login = false

            this.game_ready = true
        })
        Client.on('error', () => (this.game_ready = false))

        AccountSwitcherChannel.onmessage = ({ data: message }) => {
            if (message === 'update') this.updateAccounts()
        }

        Valorant.Client.on('ready', async (data) => {
            if (!data.includes('auth')) return

            const SaveResult = await this.saveCurrentLogin()
            console.debug('[account-switcher]', SaveResult)

            await this.updateAccounts()
        })

        this.loaded = true
    },
    mounted() {
        //keyboard events
        window.addEventListener('keydown', (event) => {
            if (event.code === 'F2') {
                if (this.active) {
                    this.disableActive()
                } else {
                    this.enableActive()
                }
            }

            if (!this.loaded || !this.active) return

            if (event.code === 'Escape') {
                if (this.drag.subject) {
                    this.stopDrag(true)
                } else {
                    this.disableActive()
                }
            }
        })

        //mouse events
        window.addEventListener('mousedown', (event) => {
            if (!this.loaded || !this.active) return

            const MouseDownHandle = HandleMouseOnElement(this.$refs['account-window'], event)
            if (MouseDownHandle === false) this.disableActive()
        })
        window.addEventListener('mousemove', (event) => {
            if (!this.loaded || !this.active) return

            this.moveDrag(event)
        })
        window.addEventListener('mouseup', (event) => {
            if (!this.loaded || !this.active) return

            if (event.button !== 0) return
            this.stopDrag(this.drag.outside)
        })

        //dragging events
        window.addEventListener('dragenter', (event) => {
            if (!this.loaded || !this.active) return
            if (event.dataTransfer?.items.length !== 1) return
            if (event.dataTransfer?.items[0].kind !== 'file') return
            event.preventDefault()

            const targetClassName = event.target?.['className']
            if (targetClassName !== 'file-drag-layer') {
                delete this.accounts['RAC']
                this.accounts['RAC'] = { Subject: 'RAC', index: Object.keys(this.accounts).length }
                this.holdingFile = true

                this.startDrag('RAC', { x: event.x, y: event.y } as MouseEvent)
            }
        })
        window.addEventListener('dragleave', (event) => {
            if (!this.loaded || !this.active) return
            event.preventDefault()

            const targetClassName = event.target?.['className']
            if (targetClassName === 'file-drag-layer') {
                delete this.accounts['RAC']
                this.holdingFile = false

                this.stopDrag(true)
            }
        })
        window.addEventListener('dragover', (event) => {
            if (!this.loaded || !this.active || !this.holdingFile) return
            event.preventDefault()

            this.moveDrag({ x: event.x, y: event.y } as MouseEvent)
        })
        window.addEventListener('drop', async (event) => {
            if (!this.loaded || !this.active || !this.holdingFile) return
            this.holdingFile = false

            const filePath = event.dataTransfer?.files[0]?.path
            const RAC = await RiotClient().testRAC(filePath)
            if (!RAC) {
                delete this.accounts['RAC']
                await this.stopDrag(true)
            } else {
                const AccountLogins = await getPath('account-logins', '.rac')
                await fs.cp(filePath!, AccountLogins)
                await this.stopDrag(this.drag.outside)
            }
        })
    },
    methods: {
        enableActive() {
            if (this.active) return
            this.$emit('update:active', true)
        },
        disableActive() {
            if (!this.active) return
            this.stopDrag(true, true)
            this.$emit('update:active', false)
        },
        scrollDrag() {
            if (!this.drag.subject) return
            this.drag.timeout = setTimeout(this.scrollDrag, 10)

            const Rect = this.$refs['account-window'].getBoundingClientRect()

            if (this.drag.x < Rect.x) return
            if (this.drag.x > Rect.x + Rect.width) return

            const ScrollSize = 175

            if (this.drag.y > Rect.y + Rect.height - ScrollSize /*&& this.drag.y < Rect.y + Rect.height*/) {
                const Down = this.drag.y - Rect.y - Rect.height + ScrollSize
                const Scroll = Math.round(Down * 0.08)
                this.$refs['accounts'].scrollBy({ top: Scroll, behavior: 'auto' })
            } else if (this.drag.y < Rect.y + ScrollSize /*&& this.drag.y > Rect.y*/) {
                const Up = ScrollSize - (this.drag.y - Rect.y)
                const Scroll = Math.round(Up * 0.08)
                this.$refs['accounts'].scrollBy({ top: -Scroll, behavior: 'auto' })
            }

            this.moveDrag({ x: this.drag.x, y: this.drag.y } as MouseEvent)
        },
        startDrag(subject: string, event: MouseEvent) {
            const targetClassName = event.target?.['className']
            if (subject !== 'RAC' && targetClassName !== 'avatar') return
            if (subject === 'RAC' && (targetClassName || 'header') !== 'header') return

            window.getSelection()?.removeAllRanges()
            this.dropdown.subject = null
            this.dropdown.which = null

            this.drag.x = event.x
            this.drag.y = event.y
            this.drag.index = this.getAccountArray().findIndex((acc) => acc.Subject === subject)
            this.drag.subject = subject

            const handle = HandleMouseOnElement(this.$refs['account-window'], event)
            this.drag.outside = !handle

            this.drag.timeout = setTimeout(this.scrollDrag, 10)
        },
        moveDrag(event: MouseEvent) {
            if (!this.drag.subject) return
            this.drag.x = event.x
            this.drag.y = event.y

            const handle = HandleMouseOnElement(this.$refs['account-window'], event)
            if (!handle) return (this.drag.outside = true)
            this.drag.outside = false

            const Rect = this.$refs.accounts.getBoundingClientRect()
            this.drag.index = Math.max(0, Math.min(this.getAccountArray().length - 1, Math.floor((this.drag.y - Rect.y + this.$refs.accounts.scrollTop) / 109)))
        },
        async stopDrag(cancel?: boolean, force_no_deletion?: boolean) {
            if (!this.drag.subject) return
            const Subject = this.drag.subject

            this.drag.subject = null
            clearTimeout(this.drag.timeout)

            if (cancel) {
                if (!force_no_deletion) {
                    const DeletionZoneHandler = HandleMouseOnElement(this.$refs['deletion-zone'], { x: this.drag.x, y: this.drag.y } as MouseEvent)
                    if (DeletionZoneHandler) {
                        delete this.accounts[Subject]
                        await Store.AccountDetails.removeItem(Subject)
                    }
                }

                await this.applyOrder(this.accounts)
                await this.updateAccounts()
            } else {
                const Accounts = this.accounts
                const NewIndex = this.drag.index
                const PrevIndex = Accounts[Subject].index

                const AccountsArray = Object.values(Accounts).sort((a: any, b: any) => a.index - b.index)
                const Account = AccountsArray[PrevIndex]
                AccountsArray.splice(PrevIndex, 1)
                AccountsArray.splice(NewIndex, 0, Account)

                for (const AccountSubject in Accounts) {
                    Accounts[AccountSubject].index = AccountsArray.findIndex((a: any) => a.Subject === AccountSubject)
                }

                this.accounts = Accounts

                const OrderedSubjects = AccountsArray.map((a: any) => a.Subject)
                await Store.AccountSwitcherSettings.setItem('order', OrderedSubjects)
            }
        },
        getDragStyle(subject: string, fake?: boolean) {
            if (fake || subject !== this.drag.subject) return {}

            const Left = subject === 'RAC' ? 93 : 66
            const Top = subject === 'RAC' ? 21 : 43

            return {
                position: 'fixed',
                'z-index': 10000,
                left: this.drag.x - Left + 'px',
                top: this.drag.y - Top + 'px'
            }
        },
        getAccountArray() {
            const Array = Object.values(this.accounts).sort((a: any, b: any) => a.index - b.index)

            if (this.drag.subject) {
                const Add = this.drag.index >= this.accounts[this.drag.subject].index ? 1 : 0
                Array.splice(this.drag.index + Add, 0, { ...this.accounts[this.drag.subject], Subject: 'Fake-' + this.drag.subject, Fake: true })
            }

            return Array
        },
        clickDropdownButton(which: string, subject: string) {
            if (this.dropdown.subject === subject && this.dropdown.which === which) {
                this.dropdown.subject = null
                this.dropdown.which = null
                return
            }

            this.dropdown.subject = subject
            this.dropdown.which = which
        },
        async addAccount() {
            if (this.new_login || this.game_ready) return
            this.new_login = true

            await killAllRiotProcesses()
            await sleep(500)
            await deleteRiotLockFiles()
            await sleep(500)
            await Promise.all([
                fs.rm(await getPath('riot-private-settings')).catch(() => true),
                fs.rm(await getPath('riot-client-settings')).catch(() => true),
                fs.rm(await getPath('riot-cookies')).catch(() => true)
            ])
            await sleep(500)
            startRiotClient('valorant').then()
        },
        async switchToAccount(subject: string) {
            if (!this.can_login) return
            this.can_login = false

            setTimeout(() => (this.can_login = true), 14000)

            const PrivateSettingsPath = await getPath('riot-private-settings')
            const ClientSettingsPath = await getPath('riot-client-settings')
            const CookiesPath = await getPath('riot-cookies')

            await killAllRiotProcesses()
            await sleep(500)
            await deleteRiotLockFiles()
            await sleep(500)
            await Promise.all([
                fs.cp(await getPath('riot-private-settings', subject), PrivateSettingsPath, { recursive: true }).catch(() => true),
                fs.cp(await getPath('riot-client-settings', subject), ClientSettingsPath, { recursive: true }).catch(() => true),
                fs.cp(await getPath('riot-cookies', subject), CookiesPath, { recursive: true }).catch(() => true)
            ])
            await sleep(500)
            startRiotClient('valorant').then()
        },
        async saveCurrentLogin() {
            const SelfSubject = Valorant.getSelfSubject()
            if (!SelfSubject) return { error: 'not_logged_in' }

            const PrivateSettingsPath = await getPath('riot-private-settings')
            const ClientSettingsPath = await getPath('riot-client-settings')
            const CookiesPath = await getPath('riot-cookies')

            const PrivateYAML = await fs.readFile(PrivateSettingsPath, 'utf-8').catch(() => null)
            if (!PrivateYAML) return { error: 'login_private_settings_not_found' }

            const matchStaySignedIn = /domain: "auth\.riotgames\.com"[^]*?name: "ssid"[^]*?value: ".*\.(.*)\..+"/
            const Matches = PrivateYAML.match(matchStaySignedIn)
            const Match = Matches?.[1]
            if (!Match) return { error: 'not_stay_sign_in' }

            const FromBase64 = HandleError(Buffer.from, Match, 'base64')
            const SSID = HandleError(JSON.parse, FromBase64)
            if (!SSID) return { error: 'ssid_malformed' }

            if (SSID?.sub !== SelfSubject) return { error: 'ssid_mismatch_sub' }

            const LoginFiles = await Promise.all([
                fs.cp(PrivateSettingsPath, await getPath('riot-private-settings', SelfSubject), { recursive: true }).catch(() => true),
                fs.cp(ClientSettingsPath, await getPath('riot-client-settings', SelfSubject), { recursive: true }).catch(() => true),
                fs.cp(CookiesPath, await getPath('riot-cookies', SelfSubject), { recursive: true }).catch(() => true)
            ])

            if (LoginFiles[0]) return { error: 'login_private_settings_not_found' }
            if (LoginFiles[1]) return { error: 'login_client_settings_not_found' }
            if (LoginFiles[2]) return { error: 'login_cookies_not_found' }

            return true
        },
        async hasLogin(subject: string) {
            const PrivateSettings = await fileExists(await getPath('riot-private-settings', subject))
            if (!PrivateSettings) return null
            const ClientSettings = await fileExists(await getPath('riot-client-settings', subject))
            if (!ClientSettings) return null
            const Cookies = await fileExists(await getPath('riot-cookies', subject))
            if (!Cookies) return null

            return true
        },
        async updateAccounts() {
            const SelfSubject = Valorant.getSelfSubject()
            const Subjects = await Store.AccountDetails.keys()

            if (this.accounts['RAC']) Subjects.push('RAC')

            const Order: string[] = (await Store.AccountSwitcherSettings.getItem('order')) ?? []
            const OrderedSubjects = Subjects.sort((a: string, b: string) => Order.findIndex((s) => s === a) - Order.findIndex((s) => s === b))

            for (const [i, Subject] of OrderedSubjects.entries()) {
                if (!this.accounts[Subject] || (SelfSubject && SelfSubject === Subject)) {
                    const AccountDetails = await Store.AccountDetails.getItem(Subject)
                    if (!(typeof AccountDetails === 'object')) continue

                    this.accounts[Subject] = {
                        ...AccountDetails,
                        hasLogin: await this.hasLogin(Subject),
                        index: i
                    }
                } else {
                    this.accounts[Subject].index = i
                }
            }
        },
        async applyOrder(accounts: {}[]) {
            const AccountsArray = Object.values(accounts).sort((a: any, b: any) => a.index - b.index)
            const OrderedSubjects = AccountsArray.map((a: any) => a.Subject)
            await Store.AccountSwitcherSettings.setItem('order', OrderedSubjects)
        },
        async importAccount() {
            const element = this.$refs['rac-password-input']?.[0]?.$el as HTMLElement
            if (!element) return

            this.rac_importing = true

            try {
                const Password = this.rac_password.trim()
                if (!Password.length) throw { error: 'password_too_short' }

                const AccountLogins = await getPath('account-logins', '.rac')
                const { Subject, AccountDetails } = await RiotClient().importRAC(AccountLogins, Password)

                const RAC = this.accounts['RAC']
                delete this.accounts['RAC']

                this.accounts[Subject] = {
                    ...AccountDetails,
                    hasLogin: true,
                    index: RAC.index
                }

                await Store.AccountDetails.setItem(Subject, AccountDetails)
                await this.applyOrder(this.accounts)
                await this.updateAccounts()

                this.rac_password = ''
            } catch (e) {
                console.debug('[rac-import]', e)
                element.animate(Animation.headShake, 750)
            } finally {
                this.rac_importing = false
            }
        },
        async checkForNightMarket() {
            const NightMarketUntil: number | null = await Store.AccountSwitcherSettings.getItem('night.market')
            const DateNow = Date.now()

            if (NightMarketUntil && NightMarketUntil - DateNow > 3000) {
                this.night_market = true

                setTimeout(this.checkForNightMarket, NightMarketUntil - DateNow)
            } else {
                this.night_market = false

                setTimeout(this.checkForNightMarket, 1000)
            }
        }
    }
}
</script>

<style scoped>
.account-switcher:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
}

.file-drag-layer {
    position: fixed;
    z-index: 20000;
    left: 0;
    top: 0;

    height: 100%;
    width: 100%;
}

.account-switcher {
    position: relative;
    z-index: 280;

    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    transition: opacity 0.15s ease-in-out;
}

.accounts-background {
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

.accounts-window {
    position: relative;
    z-index: 320;

    width: 442px;
    height: 654px;

    outline: 0 solid;
    border-radius: 6px;

    background-color: #0a0a0a;
}

.accounts-window > .deletion-zone {
    position: absolute;
    left: calc(100% + 44px);
    top: 44px;

    width: 331px;
    height: 566px;
    border-radius: 6px;

    background-color: #0000;
    outline: 0 solid #2f313645;
    outline-offset: -2px;

    transition: background-color 0.15s ease-in-out, outline 0.15s ease-in-out;
}
.accounts-window.drag_outside > .deletion-zone {
    background-color: #2f313630;
    outline: 2px solid #2f313645;
}
.accounts-window > .deletion-zone > .icon {
    color: #2f313645;
    margin-top: 55%;
}

.accounts-window > .add-account {
    position: absolute;
    z-index: 1600;
    bottom: 44px;
    left: 22px;

    width: 354px;
    height: 29px;
    margin-left: 22px;
    margin-right: 22px;
    border-radius: 6px;

    background-color: #1c1c1c;

    user-select: none;
}
.accounts-window > .add-account:is(.playing) {
    color: #808080;
    cursor: not-allowed;
    outline: 1px solid #4d4d4d;
    outline-offset: -1px;
}
.accounts-window > .add-account:is(.new_login) {
    color: #f9a825;
    cursor: not-allowed;
    outline: 1px solid #f9a825;
    outline-offset: -1px;
}
.accounts-window > .add-account:not(.playing, .new_login) {
    color: #808080;
    cursor: pointer;
    outline: 1px solid #4d4d4d;
    outline-offset: -1px;
}
.accounts-window > .add-account > .text {
    font-size: 16px;
    margin-top: 9px;
    line-height: 11px;
}

.accounts {
    overflow-anchor: none;

    position: relative;
    margin-top: 22px;

    display: flex;
    flex-direction: column;

    width: 100%;
    height: calc(100% - 44px);

    overflow: var(--webkit-overlay);
}
.accounts > :not(:last-child) {
    margin-bottom: 22px;
}

.accounts > .uwu-luken-so-cute {
    min-height: calc(200px + 29px + 22px);

    transition: min-height 0.333s ease-in-out;
}
.accounts > .uwu-luken-so-cute:is(.store) {
    min-height: calc(200px + 29px + 22px - 87px);
}
.accounts > .uwu-luken-so-cute:is(.bonus) {
    min-height: calc(200px + 29px + 22px - 152px);
}
.accounts > .uwu-luken-so-cute:is(.export) {
    min-height: calc(200px + 29px + 22px - 87px);
}
.accounts > .account-wrapper {
    width: 442px;

    transform-style: preserve-3d;
    user-select: none;
}
.accounts > .account-wrapper.fake {
    pointer-events: none;
    opacity: 0.333;
}
.accounts > .account-wrapper.hide {
    display: none;
}
.accounts > .account-wrapper {
    --dropdown-height: 0px;
}
.accounts > .account-wrapper:is(.dropdown-store) {
    --dropdown-height: 87px;
}
.accounts > .account-wrapper:is(.dropdown-bonus) {
    --dropdown-height: 152px;
}
.accounts > .account-wrapper:is(.dropdown-export) {
    --dropdown-height: 87px;
}

.accounts > .account-wrapper > .account.rac > .header {
    position: absolute;
    left: 11px;
    top: 11px;

    font-size: 13px;
    text-align: left;
    line-height: 9px;

    width: fit-content;
    padding: 6px;
    margin-bottom: 11px;

    color: #7e57c2;
    outline: 1px solid #7e57c2;
    outline-offset: -1px;
    border-radius: 6px;
}
.accounts > .account-wrapper > .account.rac > .password-input {
    position: absolute;
    bottom: 11px;
    left: 11px;

    --vibrant-color: #9575cd;
    --background-color: #1c1c1c;
}
.accounts > .account-wrapper > .account.rac > .import-account {
    position: absolute;
    bottom: 13px;
    right: 11px;

    --button-color: #673ab7;
}

.accounts > .account-wrapper > .account {
    position: relative;
    z-index: 1300;

    min-height: 65px;

    padding: 11px;
    margin-left: 22px;
    margin-right: 22px;
    border-radius: 6px;

    background-color: #121212;
}
.accounts > .account-wrapper > .dropdown {
    position: relative;

    height: var(--dropdown-height);
    margin-left: 22px;
    margin-right: 22px;

    transform: translateZ(-1px);
    transition: height 0.333s ease-in-out;
}
.accounts > .account-wrapper > .account > .warning {
    position: absolute;
    bottom: 11px;
    left: 87px;

    color: #808080;
    padding: 4px 8px;
    line-height: 19px;
    border-radius: 6px;

    outline: 1px solid #4d4d4d;
    outline-offset: -1px;

    background-color: #1c1c1c;
}
.accounts > .account-wrapper > .account > .buttons {
    display: flex;
    gap: 11px;

    position: absolute;
    bottom: 11px;
    left: 87px;

    height: 27px;
}
.accounts > .account-wrapper > .account > .buttons > .button {
    color: #b9bbbe;
    width: 19px;
    height: 19px;
    padding: 5px;
    border-radius: 6px;

    background-color: #1c1c1c;

    cursor: pointer;
}
.accounts > .account-wrapper > .account > .buttons > .button > svg {
    pointer-events: none;
}
.accounts > .account-wrapper > .account > .play {
    position: absolute;
    bottom: 11px;
    right: 11px;

    width: 23px;
    height: 23px;
    padding: 2px;
    border-radius: 6px;

    background-color: #388e3c;

    transition: opacity 0.15s ease-in-out;
    cursor: pointer;
}
.accounts > .account-wrapper > .account > .play.disabled {
    opacity: 0.666;
    pointer-events: none;
}
.accounts > .account-wrapper > .account > .avatar {
    position: absolute;

    height: 65px;
    width: 65px;

    background-image: var(--bgi);
    background-size: cover;
    border-radius: 6px;
}
.accounts > .account-wrapper:not(.dragging) > .account > .avatar {
    cursor: grab;
}
.accounts > .account-wrapper:is(.dragging) > .account > .avatar {
    cursor: grabbing;
}
.accounts > .account-wrapper > .account > .riot-id-flex {
    display: flex;
    gap: 11px;

    position: absolute;
    left: 87px;
    top: 11px;

    user-select: text;
}
.accounts > .account-wrapper > .account > .riot-id-flex > .rank {
    width: 27px;
    height: 27px;
    border-radius: 6px;

    background-color: #1c1c1c;
}
.accounts > .account-wrapper > .account > .riot-id-flex > .rank > .icon {
    height: calc(100% - 6px);
    width: calc(100% - 6px);

    background-image: var(--bgi);
    background-size: cover;
    border-radius: 6px;
    margin: 3px;
}
.accounts > .account-wrapper > .account > .riot-id-flex > .riot-id {
    display: flex;

    height: 19px;
    padding: 4px 8px;
    border-radius: 6px;

    background-color: #1c1c1c;
}
.accounts > .account-wrapper > .account > .riot-id-flex > .riot-id > :is(.tag, .username) {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.accounts > .account-wrapper > .account > .riot-id-flex > .riot-id > .username {
    color: #ffffff;
    font-size: 16px;
    line-height: 19px;

    max-width: 155px;
}
.accounts > .account-wrapper > .account > .riot-id-flex > .riot-id > .tag {
    color: #b9bbbe;
    font-size: 16px;
    line-height: 19px;

    max-width: 89px;
}
.accounts > .account-wrapper > .account > .level {
    display: flex;
    justify-content: center;

    position: absolute;
    bottom: -1px;
    left: 15px;

    width: 57px;
    margin: 8px 0;
    font-size: 11px;
    line-height: 8px;

    user-select: text;
}
.accounts > .account-wrapper > .account > .level > .num1 {
    position: relative;
    margin: 0 1px;
    width: 2.5px;
    right: 1.5px;
}

.accounts > .account-wrapper > .account > .level-border {
    position: absolute;
    bottom: -1px;
    left: 15px;

    width: 57px;
    height: 24px;

    background-image: var(--bgi);
    background-size: contain;
    background-repeat: no-repeat;

    pointer-events: none;
}

.accounts::-webkit-scrollbar {
    width: 22px;
    height: 22px;
}
.accounts::-webkit-scrollbar-thumb {
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
