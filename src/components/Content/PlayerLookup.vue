<template>
    <div class="player-lookup">
        <div class="search-bar" :class="selectedResult === -1 ? 'selected' : null">
            <input
                class="text"
                type="text"
                spellcheck="false"
                :placeholder="loading ? 'Sending Friend Request...' : 'Enter Riot ID'"
                :disabled="locked"
                @focusin="focusIn"
                @focusout="focusOut"
                @input="typeRiotId"
                @keydown.enter.prevent="searchBarEnter"
                @keydown.down.prevent="selectResult($event, 'down')"
                @keydown.up.prevent="selectResult($event, 'up')"
            />
            <transition>
                <div v-if="loading" class="loading">
                    <div class="animation"></div>
                </div>
            </transition>
        </div>
        <div v-if="lastError" class="error">{{ lastError }}</div>
        <transition>
            <div v-if="searchBarFocus && searchResults.length > 0" class="search-results">
                <div
                    class="result"
                    v-for="(result, index) in searchResults"
                    :class="selectedResult === index ? 'selected' : null"
                    @mousedown="searchBarEnter"
                    @mouseleave="selectedResult = -1"
                    @mouseover="selectedResult = index"
                >
                    {{ result }}
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { ValorantInstance } from '@/scripts/valorant_instance'

const Valorant = ValorantInstance()
const MatchHistoryChannel = new BroadcastChannel('match-history')

export default {
    name: 'PlayerLookup',
    data() {
        return {
            searchBarFocus: false,
            selectedResult: -1,
            searchResults: [],
            lastError: null,
            loading: false,
            locked: false
        }
    },
    methods: {
        focusIn(event) {
            this.searchBarFocus = true
            this.selectedResult = -1

            this.typeRiotId(event)
        },
        focusOut() {
            this.searchBarFocus = false
            this.selectedResult = -1
        },
        selectResult(event, direction) {
            const add = direction === 'up' ? -1 : 1

            if (this.searchResults.length > this.selectedResult + add && this.selectedResult + add >= -1) {
                this.selectedResult = this.selectedResult + add
            } else {
                if (add === -1) {
                    this.selectedResult = this.searchResults.length - 1
                } else {
                    this.selectedResult = -1
                }
            }
        },
        typeRiotId(event) {
            const query = (event.target.value as string).toLowerCase() || ''

            const knownRiotIDs = Valorant.getKnownRiotIDs()
            const search = knownRiotIDs
                .filter((riotId) => riotId.toLowerCase().includes(query))
                .sort((a, b) => {
                    a = a.toLowerCase()
                    b = b.toLowerCase()

                    return Number(b.startsWith(query)) - Number(a.startsWith(query))
                })

            this.selectedResult = -1
            this.searchBarFocus = true
            this.searchResults = search.slice(0, 10)
        },
        validateRiotId(riotId) {
            const GnT = riotId.split('#')
            const GameName = GnT[0] || ''
            const TagLine = GnT[1] || ''

            if (GnT.length > 2) {
                this.lastError = 'Query must only contain one Hashtag.'
                return false
            } else if (GameName.length > 16) {
                this.lastError = 'Usernames must be no longer than 16 characters.'
                return false
            } else if (TagLine.length > 5) {
                this.lastError = 'Taglines must be no longer than 5 characters.'
                return false
            } else if (GameName.length < 3) {
                this.lastError = 'Usernames must be at least 3 characters long.'
                return false
            } else if (TagLine.length < 3) {
                this.lastError = 'Taglines must be at least 3 characters long.'
                return false
            } else {
                this.lastError = null
                return {
                    GameName: GameName,
                    TagLine: TagLine
                }
            }
        },
        async searchBarEnter(event) {
            const searchResult = this.searchResults[this.selectedResult]
            const searchBar = event.target.value

            event.target.blur()
            event.target.value = ''

            this.searchBarFocus = false
            const riotId = this.validateRiotId(searchResult || searchBar)
            if (!riotId) return

            this.locked = true
            const Player = await this.getPlayerFromGnT(riotId.GameName, riotId.TagLine)
            this.locked = false

            if (Player) MatchHistoryChannel.postMessage(Player)
        },
        async getPlayerFromGnT(GameName, TagLine) {
            const FriendUnresolved = await Valorant.getFriendFromGnT(GameName, TagLine)
            this.loading = true
            const Friend = FriendUnresolved.Subject ? FriendUnresolved : await FriendUnresolved.friend_request()
            this.loading = false

            if (!Friend) {
                this.lastError = `It seems '${GameName}#${TagLine}' does not exist.`
                return null
            }

            const { History: MatchHistory } = await Valorant.getMatchHistory(Friend.Subject, { endIndex: 1 })
            if (!MatchHistory) {
                this.lastError = `It seems '${Friend.GameName}#${Friend.TagLine}' never played VALORANT.`
                return null
            }
            if (MatchHistory.length < 1) {
                this.lastError = `It seems '${Friend.GameName}#${Friend.TagLine}' hasn't played for a long time.`
                return null
            }

            // const { WorstRank, BestRank, CurrentRank, CurrentRR } = await Valorant.parseMMR(Subject)
            const MatchDetails = await Valorant.getMatchDetails(MatchHistory[0].MatchID)
            const SelfPlayer = MatchDetails.players.find((player) => player.subject === Friend.Subject)!

            return {
                Subject: Friend.Subject,
                GameName: Friend.GameName,
                PlayerCardID: SelfPlayer.playerCard
            }
        }
    }
}
</script>

<style scoped>
/* transitions */
.search-results:is(.v-enter-active, .v-leave-active) {
    transition: opacity ease-in-out 0.05s;
    opacity: 1;
}
.search-results:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
}
.player-lookup > .search-bar > .loading:is(.v-enter-active, .v-leave-active) {
    transition: bottom ease-in-out 0.15s;
    bottom: -5px;
}
.player-lookup > .search-bar > .loading:is(.v-enter-from, .v-leave-to) {
    bottom: 5px;
}
/* transitions */

.player-lookup > .error {
    position: absolute;
    top: 59px;
    left: 50%;
    transform: translateX(-50%);

    font-size: 12px;
    line-height: 10px;
    width: fit-content;
    color: #ed4245;
}

.player-lookup > .search-results {
    display: flex;
    flex-direction: column;
    gap: 5px;

    position: absolute;
    top: 59px;
    left: 50%;
    transform: translateX(-50%);

    max-height: 255px;
    height: fit-content;
    width: 314px;
    padding: 5px;

    border: 0 solid;
    border-radius: 6px;

    background-color: #18191c;
}
.player-lookup > .search-results > .result {
    width: var(--webkit-fill-available);
    padding: 5px;

    border: 0 solid;
    border-radius: 6px;

    color: #b9bbbe;
    line-height: 11px;
    font-size: 15px;
    text-align: left;

    cursor: pointer;
}
.player-lookup > .search-results > .result.selected {
    background-color: #121314;
}

.player-lookup > .search-bar {
    transform-style: preserve-3d;

    display: flex;

    position: absolute;
    top: 22px;
    left: 50%;
    transform: translateX(-50%);

    height: 32px;
    width: 324px;

    border: 0 solid;
    border-radius: 6px;
    background-color: #18191c;

    transition: background-color ease-in-out 0.15s;
}
.player-lookup > .search-bar:focus-within.selected {
    background-color: #121314;
}
.player-lookup > .search-bar > .text {
    width: var(--webkit-fill-available);
    padding: 10px;
    outline: 0 solid transparent;

    line-height: 12px;
    font-size: 17px;
    text-align: left;
}
.player-lookup > .search-bar > .loading {
    transform: translateZ(-10px);
    overflow: hidden;

    position: absolute;
    bottom: -5px;
    height: 10px;

    width: inherit;

    border: 0 solid;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;

    background-color: #202225;
}
.player-lookup > .search-bar > .loading > .animation {
    position: absolute;
    left: 0;
    bottom: 0;

    width: 0;
    height: inherit;
    background-color: #121314;

    animation: search-bar-loading-animation 1s infinite;
}
.player-lookup > .search-bar > .text::placeholder {
    opacity: 1;
    color: #40444b;
}

.search-results::-webkit-scrollbar {
    width: 13px;
    height: 13px;
}
.search-results::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: 11px;
}
.search-results::-webkit-scrollbar-thumb {
    border: 4px solid #18191c;
    background-color: #2f3136;
    border-radius: 11px;
}

@keyframes search-bar-loading-animation {
    0%,
    15% {
        left: 0;
        width: 0;
    }
    55% {
        left: 0;
        width: 101%;
    }
    95%,
    100% {
        left: 100%;
        width: 0;
    }
}
</style>
