<template>
    <div v-if="presence" class="profile" :class="{ hover }" @mouseenter="hover = true" @mouseleave="hover = false">
        <div class="avatar" :style="`--bgi: url('${presence.AvatarURL}')`"></div>
        <div class="riot-id-flex">
            <div class="username">{{ presence.GameName }}</div>
            <div class="tag">#{{ presence.TagLine }}</div>
        </div>
        <div class="level-border" :style="`--bgi: url('${account.level_border_url}')`"></div>
        <AbsoluteCenterHelper name="level" :text="presence.AccountLevel" />
        <div class="idle-status" :class="presence.isIdle ? 'idle' : 'online'">{{ presence.isIdle ? 'Away' : 'Available' }}</div>

        <transition>
            <div v-if="hover" class="drop-down">
                <div class="header">
                    <div class="experience">
                        <div class="progress-bar">
                            <div class="progress" :style="{ width: `${(account.exp / 5000) * 100}%` }"></div>
                        </div>
                        <div class="level">Level {{ account.level }}</div>
                        <div class="exp">{{ account.exp }} / 5000</div>
                    </div>
                    <div class="entry" @click="openExternal('https://account.riotgames.com/')">
                        <div class="text">Account Management</div>
                        <div class="icon">
                            <icon icon="external-url" />
                        </div>
                    </div>
                    <div class="entry" @click="openExternal('https://support-valorant.riotgames.com/hc/en-us/requests')">
                        <div class="text">Support Requests</div>
                        <div class="icon">
                            <icon icon="external-url" />
                        </div>
                    </div>
                    <div class="entry" @click="openExternal('https://support-valorant.riotgames.com/hc/en-us/articles/360045674593')">
                        <div class="text">Request A Refund</div>
                        <div class="icon">
                            <icon icon="external-url" />
                        </div>
                    </div>
                    <div class="entry" @click="openExternal('https://support-valorant.riotgames.com/hc/en-us/articles/360045132434')">
                        <div class="text">Purchase History</div>
                        <div class="icon">
                            <icon icon="external-url" />
                        </div>
                    </div>
                    <div class="entry" @click="openAccountSwitcher">
                        <div class="text">Switch Account</div>
                    </div>
                    <div class="entry" @click="openPreferences">
                        <div class="text">Preferences</div>
                    </div>
                    <div class="entry" @click="copyToClipboard(presence.Subject)">
                        <div class="text">Copy ID</div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
    <div v-else class="profile"></div>
</template>

<script lang="ts">
import AbsoluteCenterHelper from '@/components/Misc/AbsoluteCenterHelper.vue'
import { ValorantInstance } from '@/scripts/valorant_instance'
import Icon from '@/components/Misc/Icon.vue'

const Valorant = ValorantInstance()
const PreferencesChannel = new BroadcastChannel('preferences')
const AccountSwitcherChannel = new BroadcastChannel('account-switcher')

export default {
    name: 'Profile',
    components: { AbsoluteCenterHelper, Icon },
    props: {
        presences: Array as () => ValorantChatPresences.Player[]
    },
    data() {
        return {
            presence: null as any,
            account: {
                level_border_url: 'https://media.valorant-api.com/levelborders/ebc736cd-4b6a-137b-e2b0-1486e31312c9/levelnumberappearance.png',
                level: 1,
                exp: 0
            },
            hover: false
        }
    },
    methods: {
        openExternal: window.electron.openExternal,
        copyToClipboard(text?: string) {
            if (!text) return

            navigator.clipboard.writeText(text)

            if (this.hover) this.hover = false
        },
        openPreferences() {
            PreferencesChannel.postMessage('open')
            if (this.hover) this.hover = false
        },
        openAccountSwitcher() {
            AccountSwitcherChannel.postMessage('open')
            if (this.hover) this.hover = false
        },
        async processAccount() {
            if (!this.presence?.Subject) {
                this.account = {
                    level_border_url: 'https://media.valorant-api.com/levelborders/ebc736cd-4b6a-137b-e2b0-1486e31312c9/levelnumberappearance.png',
                    level: 1,
                    exp: 0
                }

                return
            }

            const AccountXp = await Valorant.getAccountXP()
            const SelfLoadout = await Valorant.getSelfLoadout()
            const LevelBorder = await Valorant.getLevelBorder(AccountXp.Progress.Level, SelfLoadout.Identity.PreferredLevelBorderID)

            this.account = {
                level_border_url: LevelBorder.levelNumberAppearance,
                level: AccountXp.Progress.Level,
                exp: AccountXp.Progress.XP
            }
        },
        processSelfPresence(presence: ValorantChatPresences.Player) {
            if (!presence) {
                presence = {
                    Subject: null,
                    playerCardId: '0819fbcd-4bd4-c379-5384-52803440f2b2',
                    accountLevel: 1,
                    preferredLevelBorderId: null,
                    GameName: 'Player',
                    TagLine: '00000',
                    isIdle: true
                } as any
            }

            this.presence = {
                Subject: presence.Subject,

                AvatarURL: `https://media.valorant-api.com/playercards/${presence.playerCardId}/smallart.png`,

                PlayerCardID: presence.playerCardId,
                AccountLevel: presence.accountLevel,
                GameName: presence.GameName,
                TagLine: presence.TagLine,

                isIdle: presence.isIdle
            }
        }
    },
    async created() {
        const { Client } = Valorant

        Client.on('presences', (data) => {
            const SelfPresence = data.find((p) => p.Subject === Valorant.getSelfSubject())

            this.processSelfPresence(SelfPresence)
            this.processAccount()
        })

        await Client.login()
    }
}
</script>

<style scoped>
.profile > .drop-down:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
    margin-top: -5px;
}

.profile {
    position: relative;

    height: 44px;
    margin: 0 22px 22px;

    border-radius: 22px;
    background-color: #18191c;

    transform: translateZ(10px);
    transition: background-color 0.15s ease-in-out;
    transform-style: preserve-3d;
}

.profile:hover {
    background-color: #121314;
}

.profile > .drop-down {
    position: absolute;
    top: 22px;
    left: 0;

    width: 206px;

    border: 3px solid #121314;

    transform: translateZ(-1px);
    background-color: #18191c;

    border-bottom-right-radius: 22px;
    border-bottom-left-radius: 22px;

    transition: opacity 0.15s ease-in-out, margin-top 0.15s ease-in-out;
}

.profile > .drop-down > .header {
    display: flex;
    flex-direction: column;
    gap: 7px;

    margin-top: 30px;
    margin-bottom: 13px;
}

.profile > .drop-down > .header > .experience {
    position: relative;

    margin: 0 18px;
    height: 16px;
}
.profile > .drop-down > .header > .experience > .progress-bar {
    overflow: hidden;

    position: absolute;
    bottom: 0;
    height: 5px;
    width: 100%;
    background-color: #202225;
    border-radius: 3px;
}
.profile > .drop-down > .header > .experience > .progress-bar > .progress {
    height: 100%;
    border-radius: 3px;
    background-color: #30c7ab;
}
.profile > .drop-down > .header > .experience > .level {
    position: absolute;
    bottom: 5px;
    left: 1px;

    font-size: 11px;
    line-height: 13px;
}
.profile > .drop-down > .header > .experience > .exp {
    position: absolute;
    bottom: 5px;
    right: 1px;

    font-size: 11px;
    line-height: 13px;
}

.profile > .drop-down > .header > .entry {
    display: flex;
    align-items: center;
    justify-content: space-between;

    height: 11px;
    margin: 0 4px;
    padding: 7px 14px;

    border-radius: 6px;

    transition: background-color 0.15s ease-in-out;
    user-select: none;

    cursor: pointer;
}

.profile > .drop-down > .header > .entry:hover {
    background-color: #121314;
}

.profile > .drop-down > .header > .entry > .text {
    font-size: 15px;
    line-height: 11px;
}

.profile > .drop-down > .header > .entry > .icon {
    margin-right: -1px;
    height: 15px;
    width: 15px;
}

.profile > .drop-down > .footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 7px;

    margin: 7px;
}
.profile > .drop-down > .footer > .entry {
    color: #40444b;
    font-size: 10px;
    line-height: 7px;
}

.profile > .level-border {
    position: absolute;
    bottom: -4px;
    left: 1px;

    width: 42px;
    height: 18px;

    background-image: var(--bgi);
    background-size: contain;
    background-repeat: no-repeat;

    transition: opacity 0.15s ease-in-out;
}
.profile.hover > .level-border {
    opacity: 0;
}
.profile > .level-flex.even-width {
    --width-adjustment: 0px;
}
.profile > .level-flex.odd-width {
    --width-adjustment: -0.5px;
}
.profile > .level-flex {
    position: absolute;
    bottom: -4px;
    left: 1px;

    display: flex;
    justify-content: center;
    align-items: center;

    width: calc(42px + var(--width-adjustment));
    height: 18px;

    transition: opacity 0.15s ease-in-out;
}
.profile > .level-flex:deep(.level) {
    font-family: BRAVEdigits, BRAVE, sans-serif;
    line-height: 6px;
    font-size: 8.2px;
    width: fit-content;

    user-select: text;
}

.profile.hover > .level-flex {
    opacity: 0;
}

.profile > .avatar {
    position: absolute;

    margin: 5px;
    height: 34px;
    width: 34px;

    background-image: var(--bgi);
    background-size: cover;
    border-radius: 100px;
}

.profile > .riot-id-flex {
    position: absolute;
    top: 5px;
    left: 44px;

    display: flex;

    padding: 2px;
}
.profile > .riot-id-flex > .username,
.profile > .riot-id-flex > .tag {
    font-size: 13px;
    line-height: 13px;
}
.profile > .riot-id-flex > .username {
    color: #ffffff;

    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 92px;
    overflow: hidden;
}
.profile > .riot-id-flex > .tag {
    color: #b9bbbe;
}

.profile > .idle-status {
    position: absolute;
    bottom: 5px;
    left: 44px;

    padding: 2px;
    font-size: 13px;
    line-height: 13px;
}
.profile > .idle-status.online {
    color: #6dc8b8;
}
.profile > .idle-status.idle {
    color: #f1ac82;
}
</style>
