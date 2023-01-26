<template>
    <div v-if="presence" class="profile" @mouseenter="hover = true" @mouseleave="hover = false">
        <div class="avatar" :style="`--bgi: url('${presence.AvatarURL}')`"></div>
        <div class="riot-id-flex">
            <div class="username">{{ presence.GameName }}</div>
            <div class="tag">#{{ presence.TagLine }}</div>
        </div>
        <div class="level-border" :style="`--bgi: url('${presence.LevelBorderURL}')`"></div>
        <div class="level">{{ presence.AccountLevel }}</div>
        <div class="idle-status" :class="presence.isIdle ? 'idle' : 'online'">{{ presence.isIdle ? 'Away' : 'Available' }}</div>

        <transition>
            <div v-if="hover" class="drop-down">
                <div class="header">
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
import { ValorantInstance } from '@/scripts/valorant_instance'
import Icon from '@/components/Misc/Icon.vue'

const Valorant = ValorantInstance()

export default {
    name: 'Profile',
    components: { Icon },
    props: {
        presences: Array as () => ValorantChatPresences.Player[]
    },
    data() {
        return {
            firstLoadComplete: false,
            presence: null,
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
        async processSelfPresence(presence: ValorantChatPresences.Player, firstLoad?: boolean) {
            if (!this.firstLoadComplete && presence && firstLoad !== false) {
                this.firstLoadComplete = true
                firstLoad = true
            }

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

            const LevelBorder = firstLoad || !presence ? null : await Valorant.getLevelBorder(presence.accountLevel, presence.preferredLevelBorderId)

            this.presence = {
                Subject: presence.Subject,

                LevelBorderURL: LevelBorder
                    ? LevelBorder.levelNumberAppearance
                    : 'https://media.valorant-api.com/levelborders/ebc736cd-4b6a-137b-e2b0-1486e31312c9/levelnumberappearance.png',
                AvatarURL: `https://media.valorant-api.com/playercards/${presence.playerCardId}/smallart.png`,

                PlayerCardID: presence.playerCardId,
                AccountLevel: presence.accountLevel,
                GameName: presence.GameName,
                TagLine: presence.TagLine,

                isIdle: presence.isIdle
            }

            if (firstLoad) {
                await this.processSelfPresence(presence, false)
            }
        }
    },
    async created() {
        this.processSelfPresence(null!, true).then()

        const { Client } = Valorant

        Client.on('presences', (data) => {
            this.processSelfPresence(data.find((p) => p.Subject === Valorant.getSelfSubject()))
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
    height: 196px;

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
    height: calc(100% - 30px);
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
}
.profile > .level {
    display: flex;
    justify-content: center;

    position: absolute;
    bottom: -8px;
    left: -6px;

    line-height: 8px;
    font-size: 8px;

    width: 56px;
    margin: 8px 0;
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
