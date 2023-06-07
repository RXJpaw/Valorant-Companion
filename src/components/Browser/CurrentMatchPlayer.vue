<template>
    <div
        v-if="subject"
        class="player"
        :class="`${enemy ? 'enemy' : 'ally'} team-${subject.TeamID?.toLowerCase()} subject-${subject.Subject}`"
        @mouseenter="hoverOverCard(true)"
        @mouseleave="hoverOverCard(false)"
        ref="this"
    >
        <transition>
            <div v-if="subject.PartyID" class="party-indicator" :class="`party-${subject.PartyID}`"></div>
        </transition>

        <div v-if="!subject.loaded" class="agent-wrapper loading"></div>
        <div v-else class="agent-wrapper">
            <div class="agent-icon" :style="`--bgi: url('${subject.AgentIconURL}')`"></div>
            <div class="level-border" :style="`--bgi: url('${subject.LevelBorderURL}')`"></div>
            <AbsoluteCenterHelper name="level" :text="subject.Level" />

            <transition>
                <div v-if="!subject.HasPresence" class="no-presence-indicator"></div>
            </transition>
        </div>

        <div v-if="!subject.loaded" class="banner-wrapper loading"></div>
        <div v-else class="banner-wrapper">
            <div class="banner" :style="`--bgi: url('${subject.PlayerCardURL}')`"></div>
            <div class="preview-rank-flex">
                <div class="preview-rank" :class="hover ? 'hover' : null" @mouseenter="hover = true" @mouseleave="hover = false">
                    <div class="icon" :style="`--bgi: url('${subject.HighestRankIconURL}');`"></div>
                    <div class="name">{{ subject.HighestRankName }}</div>

                    <transition>
                        <div v-if="hover" class="ranks-dropdown">
                            <div class="rank highest">
                                <div class="tag">HIGH</div>
                                <div class="icon" :style="`--bgi: url('${subject.HighestRankIconURL}');`"></div>
                                <div class="name">{{ subject.HighestRankName }}</div>
                            </div>
                            <div class="rank current">
                                <div class="tag">NOW</div>
                                <div class="icon" :style="`--bgi: url('${subject.CurrentRankIconURL}')`"></div>
                                <div class="name">{{ subject.CurrentRankName }}</div>
                            </div>
                            <div class="rank lowest">
                                <div class="tag">LOW</div>
                                <div class="icon" :style="`--bgi: url('${subject.LowestRankIconURL}');`"></div>
                                <div class="name">{{ subject.LowestRankName }}</div>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
            <div class="riot-id-flex">
                <div class="riot-id">
                    <div class="username">{{ subject.GameName }}</div>
                    <div class="tag">#{{ subject.TagLine }}</div>
                </div>
                <div v-if="subject.Incognito" class="badge incognito">
                    <svg viewBox="0 0 24 24">
                        <path
                            d="M12 7c2.76 0 5 2.24 5 5c0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28l.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22L21 20.73L3.27 3L2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65c0 1.66 1.34 3 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53c-2.76 0-5-2.24-5-5c0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15l.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                            fill="currentColor"
                        ></path>
                    </svg>
                </div>
                <div v-if="subject.HasFistBumpBuddy" class="badge fist-bump">
                    <div class="icon"></div>
                </div>
            </div>
            <div v-if="isOverCard && subject.EncounterAmount > 0" class="encounters">
                {{ subject.EncounterAmount }} {{ subject.EncounterAmount === 1 ? 'Meetup' : 'Meetups' }}
            </div>
            <div v-if="isOverCard || anySideMenuOpen()" class="side-menu">
                <div v-if="game_state === 'INGAME'" class="side-button inventory" @click="clickInventoryIcon()">
                    <svg
                        v-if="inventory_subject?.Subject !== subject?.Subject"
                        fill="currentColor"
                        style="width: 15px; height: 15px; margin-top: 1px"
                        viewBox="0 0 24.95 22.57"
                    >
                        <path d="M281.3,418.52v8.14s-2.94-1.4-2.94-4.34A4.14,4.14,0,0,1,281.3,418.52Z" transform="translate(-278.36 -405.8)" />
                        <polygon points="14.83 0 12.48 0 10.12 0 7.99 2.13 9.74 2.13 10.23 1.63 12.48 1.63 14.72 1.63 15.22 2.13 16.96 2.13 14.83 0" />
                        <path d="M290.83,409.56h-9.37v4s7.13,1.49,7.13,4.92h4.49c0-3.43,7.13-4.92,7.13-4.92v-4Z" transform="translate(-278.36 -405.8)" />
                        <path
                            d="M294.31,420.55h-6.95s-.21-4-4-4v11.86h15V416.51C294.52,416.51,294.31,420.55,294.31,420.55Z"
                            transform="translate(-278.36 -405.8)"
                        />
                        <path d="M300.37,418.52v8.14s2.94-1.4,2.94-4.34A4.14,4.14,0,0,0,300.37,418.52Z" transform="translate(-278.36 -405.8)" />
                    </svg>
                    <svg v-else aria-hidden="false" width="12" height="12" style="width: 13px; height: 13px; margin: 0 1px" viewBox="0 0 12 12">
                        <polygon
                            fill="currentColor"
                            fill-rule="evenodd"
                            points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"
                        ></polygon>
                    </svg>
                </div>
                <div class="side-button history" @click="clickHistoryIcon()">
                    <svg
                        v-if="history_subject?.Subject !== subject?.Subject"
                        fill="currentColor"
                        style="width: 15px; height: 15px; margin-top: 1px"
                        viewBox="0 -1.5 22.55 32.17"
                    >
                        <polygon points="0 0 10.08 0 10.08 12.94 7.33 13.26 0 7.46 0 0" />
                        <polygon points="22.55 0 12.47 0 12.47 12.94 15.22 13.26 22.55 7.46 22.55 0" />
                        <path
                            d="m11.34,15.08c-4.17,0-7.54,3.38-7.54,7.54s3.38,7.54,7.54,7.54,7.54-3.38,7.54-7.54-3.38-7.54-7.54-7.54Zm0,11.18l-3.72-3.72,3.72-3.72,3.72,3.72-3.72,3.72Z"
                        />
                    </svg>
                    <svg v-else aria-hidden="false" width="12" height="12" style="width: 13px; height: 13px; margin: 0 1px" viewBox="0 0 12 12">
                        <polygon
                            fill="currentColor"
                            fill-rule="evenodd"
                            points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"
                        ></polygon>
                    </svg>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import AbsoluteCenterHelper from '@/components/Misc/AbsoluteCenterHelper.vue'
import Icon from '@/components/Misc/Icon.vue'
export default {
    name: 'CurrentMatchPlayer',
    components: { AbsoluteCenterHelper, Icon },
    props: {
        history_subject: Object as () => LoadedCurrentMatchSubject | null,
        history_left: Number as () => number,
        history_top: Number as () => number,
        inventory_subject: Object as () => LoadedCurrentMatchSubject | null,
        inventory_left: Number as () => number,
        inventory_top: Number as () => number,
        game_state: String as () => string,
        subject: Object as unknown as () => CurrentMatchSubject,
        enemy: Boolean as () => boolean
    },
    data() {
        return {
            hover: false,
            isOverCard: false
        }
    },
    methods: {
        anySideMenuOpen() {
            return this.inventory_subject?.Subject === this.subject?.Subject || this.history_subject?.Subject === this.subject?.Subject
        },
        hoverOverCard(isOver: boolean) {
            this.isOverCard = isOver
        },
        clickHistoryIcon() {
            if (this.history_subject?.Subject === this.subject?.Subject) {
                this.$emit('update:history_subject', null)
                return
            }

            this.$emit('update:inventory_subject', null)

            const Div = this.$refs['this'] as HTMLDivElement
            const Rect = Div.getBoundingClientRect()

            let left = this.enemy ? Rect.left - 256 + 69 - 35 : Rect.left + 256 - 55
            let top = Math.min(490, Rect.top - 22)

            this.$emit('update:history_subject', this.subject)
            this.$emit('update:history_left', left)
            this.$emit('update:history_top', top)
        },
        clickInventoryIcon() {
            if (this.inventory_subject?.Subject === this.subject?.Subject) {
                this.$emit('update:inventory_subject', null)
                return
            }

            this.$emit('update:history_subject', null)

            const Div = this.$refs['this'] as HTMLDivElement
            const Rect = Div.getBoundingClientRect()

            let left = this.enemy ? Rect.left - 256 - 77 - 35 : Rect.left + 256 - 55
            let top = Math.min(376, Rect.top - 22)

            this.$emit('update:inventory_subject', this.subject)
            this.$emit('update:inventory_left', left)
            this.$emit('update:inventory_top', top)
        }
    }
}
</script>

<style scoped>
/* transitions */
.ranks-dropdown:is(.v-enter-active, .v-leave-active) {
}
.ranks-dropdown:is(.v-enter-from, .v-leave-to) {
}

.party-indicator:is(.v-enter-active, .v-leave-active) {
    transition: left ease-in-out 1s, height ease-in-out 1s;
    left: -5px;
    height: 100%;
}
.party-indicator:is(.v-enter-from, .v-leave-to) {
    left: 5px !important;
    height: 5px !important;
}

.no-presence-indicator:is(.v-enter-active, .v-leave-active) {
    transition: height ease-in-out 0.25s, width ease-in-out 0.25s;
    height: 8px;
    width: 8px;
}
.no-presence-indicator:is(.v-enter-from, .v-leave-to) {
    height: 0 !important;
    width: 0 !important;
}
/* transitions */

.player.enemy {
    --team-color: #603a3d;
}
.player.ally {
    --team-color: #287567;
}

.player {
    position: relative;

    display: flex;
    gap: 5px;

    width: 446px;
    height: 98px;
    /*height: 78px;*/

    border: 0 solid;
    border-radius: 6px;
}

.player > .party-1 {
    --party-color: #6fc8ff;
}
.player > .party-2 {
    --party-color: #b36edc;
}
.player > .party-3 {
    --party-color: #ff9671;
}
.player > .party-4 {
    --party-color: #ffc75f;
}
.player > .party-5 {
    --party-color: #9ef971;
}
.player > .party-6 {
    --party-color: #7adfbc;
}

.player > .party-indicator {
    position: absolute;
    left: -5px;
    top: 50%;

    height: 100%;
    width: 10px;

    transform: translateY(-50%) translateZ(-10px);
    background-color: var(--party-color);

    border: 0 solid;
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
}

.player > .banner-wrapper.loading,
.player > .agent-wrapper.loading {
    animation: fetching-animation 2s infinite ease-in-out;
    border: 0 solid;
    border-radius: 6px;
}
.player > .banner-wrapper {
    position: relative;

    width: 343px;
    height: inherit;
}
.player > .banner-wrapper > .banner {
    width: inherit;
    height: inherit;

    background-image: var(--bgi);
    background-size: cover;
    background-position: center;

    border: 0 solid;
    border-radius: 6px;
}
.player > .banner-wrapper > .side-menu {
    position: absolute;
    right: 8px;
    top: 8px;

    display: flex;
    flex-direction: column;
    gap: 8px;
}
.player > .banner-wrapper > .side-menu > .side-button {
    height: 17px;
    padding: 0 6px;

    border: 0 solid;
    border-radius: 6px;
    backdrop-filter: blur(2px) brightness(0.65);

    cursor: pointer;
}

/*.player > .banner-wrapper > .inventory > .skin,*/
/*.player > .banner-wrapper > .inventory > .skin > .sharpen {*/
/*    background-image: url('https://media.valorant-api.com/weaponskinchromas/ad2b0b8b-4da8-9c88-331a-028f2026ab66/fullrender.png');*/
/*    background-size: contain;*/
/*    background-repeat: no-repeat;*/
/*    height: 100%;*/
/*    width: 59px;*/
/*}*/

/*.player > .banner-wrapper > .inventory > .skin > .sharpen {*/
/*    image-rendering: pixelated;*/
/*}*/

.player > .banner-wrapper > .encounters {
    position: absolute;
    top: 8px;
    left: 8px;

    height: 17px;
    padding: 0 6px;

    border: 0 solid;
    border-radius: 6px;
    backdrop-filter: blur(2px) brightness(0.65);

    font-size: 13px;
    line-height: 18px;
}

.player > .banner-wrapper > .inventory > svg {
    color: #ffffff;
}

.player > .banner-wrapper > .riot-id-flex {
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 100%;
    height: 17px;
    display: flex;
    justify-content: center;
    gap: 5px;
}
.player > .banner-wrapper > .riot-id-flex > .riot-id {
    position: relative;

    display: flex;

    line-height: 13px;
    font-size: 13px;

    width: fit-content;
    padding: 2px 12px;
    background-color: #18191c;

    border: 0 solid;
    border-radius: 6px;
}
.player > .banner-wrapper > .riot-id-flex > .riot-id > .username {
    color: #ffffff;
    max-width: 172px; /*fits 16 latin characters*/
}
.player > .banner-wrapper > .riot-id-flex > .riot-id > .tag {
    color: #b9bbbe;
    max-width: 72px; /*fits 5 kanji*/
}
.player > .banner-wrapper > .riot-id-flex > .riot-id > * {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.player > .banner-wrapper > .riot-id-flex > .badge {
    position: relative;

    display: flex;

    line-height: 13px;
    font-size: 13px;

    width: fit-content;
    padding: 2px 6px;
    background-color: #18191c;

    border: 0 solid;
    border-radius: 6px;
}
.player > .banner-wrapper > .riot-id-flex > .fist-bump > .icon {
    background-image: url(~@/assets/images/fist-bump.png);
    background-size: cover;
    height: 11px;
    width: 11px;
    margin: 1px;
    image-rendering: auto;
}
.player > .banner-wrapper > .preview-rank-flex {
    position: absolute;
    top: 8px;
    left: 0;
    width: 100%;
    height: 17px;
    display: flex;
    justify-content: center;
}
.player > .banner-wrapper > .preview-rank-flex > .preview-rank {
    position: relative;

    display: flex;
    align-items: center;
    gap: 3px;

    height: 13px;
    padding: 2px 12px;

    border: 0 solid;
    border-radius: 6px;

    cursor: context-menu;
}
.player > .banner-wrapper > .preview-rank-flex > .preview-rank:not(.hover) {
    backdrop-filter: blur(2px) brightness(0.65);
}
.player > .banner-wrapper > .preview-rank-flex > .preview-rank.hover {
    visibility: hidden;
}

/* ranks dropdown part */
.player > .banner-wrapper > .preview-rank-flex > .preview-rank > .ranks-dropdown > .rank > .icon,
/* ranks dropdown part */
.player > .banner-wrapper > .preview-rank-flex > .preview-rank > .icon {
    background-image: var(--bgi);
    background-size: cover;
    background-position: center;

    width: 17px;
    height: 17px;
}
.player > .banner-wrapper > .preview-rank-flex > .preview-rank > .name {
    font-size: 13px;
    line-height: 13px;
    width: max-content;
}
/* ranks dropdown */
.player > .banner-wrapper > .preview-rank-flex > .preview-rank > .ranks-dropdown {
    visibility: visible;

    position: absolute;
    top: -2px;
    left: -26px;

    display: flex;
    align-items: flex-start;
    flex-direction: column;
    gap: 3px;

    height: fit-content;
    padding: 0 12px;
    backdrop-filter: blur(2px) brightness(0.65);

    border: 2px solid transparent;
    border-radius: 6px;

    z-index: 100;
}
.player > .banner-wrapper > .preview-rank-flex > .preview-rank > .ranks-dropdown > .rank {
    display: flex;
    align-items: center;
    gap: 3px;
}
.player > .banner-wrapper > .preview-rank-flex > .preview-rank > .ranks-dropdown > .rank > .name {
    font-size: 13px;
    line-height: 13px;
    width: 70px;
    text-align: left;
}
.player > .banner-wrapper > .preview-rank-flex > .preview-rank > .ranks-dropdown > .rank > .tag {
    width: 21px;

    text-align: right;
    font-size: 9px;
    color: #b9bbbe;
}
/* ranks dropdown */

.player > .agent-wrapper {
    position: relative;

    width: 98px;
    height: inherit;
}

.player > .agent-wrapper > .no-presence-indicator {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 8px;
    height: 8px;
    border: 0 solid;
    border-radius: 6px;
    backdrop-filter: brightness(0.5);
}

.player > .agent-wrapper > .agent-icon {
    width: inherit;
    height: inherit;

    background-color: var(--team-color);
    background-image: var(--bgi);
    background-size: cover;

    border: 0 solid;
    border-radius: 6px;
}

.player > .agent-wrapper > .level-border {
    position: absolute;
    bottom: -12px;
    left: 21px;

    width: 56px;
    height: 24px;

    background-image: var(--bgi);
    background-size: contain;
    background-repeat: no-repeat;
}

.player > .agent-wrapper > .level-flex.even-width {
    --width-adjustment: 0px;
}
.player > .agent-wrapper > .level-flex.odd-width {
    --width-adjustment: -0.5px;
}
.player > .agent-wrapper > .level-flex {
    position: absolute;
    bottom: -12px;
    left: 21px;

    display: flex;
    justify-content: center;
    align-items: center;

    width: calc(56px + var(--width-adjustment));
    height: 24px;
}
.player > .agent-wrapper > .level-flex:deep(.level) {
    font-family: BRAVEdigits, BRAVE, sans-serif;
    line-height: 8px;
    font-size: 11px;
    width: fit-content;

    user-select: text;
}

/* this exists because the number 1 in levels always seemed off and the font i use has same width for all numbers idk */
.player > .agent-wrapper > .level > .num1 {
    width: 3px;
    position: relative;
    right: 1.5px;
    margin: 0 1px;
}
</style>
