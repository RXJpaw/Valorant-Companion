<template>
    <div class="history" :style="`left: ${left}px; top: ${top}px;`">
        <div class="ranks">
            <div v-for="Act in subject.Triangles" class="rank">
                <div class="act">{{ Act.NameShort }}</div>
                <div class="rank">
                    <div class="icon" :style="{ '--bgi': `url('${Act.BestRank.smallIcon}')` }"></div>
                    <div class="name">{{ capitalizeFirstLetter(Act.BestRank.tierName) }}</div>
                </div>
            </div>
        </div>
        <div class="trust-factor">
            <div class="current-rank">
                <div class="rank">
                    <div class="icon" :style="{ '--bgi': `url('${subject.CurrentRankIconURL}')` }"></div>
                    <div class="name">{{ subject.CurrentRankName }}</div>
                </div>
                <div class="rank-rating">
                    <div class="progress-bar">
                        <div class="progress" :style="`width: ${subject.CurrentRR}%`"></div>
                    </div>
                    <div class="labels-flex">
                        <div class="name">Rank Rating</div>
                        <div class="amount">{{ subject.CurrentRR }}{{ subject.CurrentRR >= 100 ? '' : '/100' }}</div>
                    </div>
                </div>
            </div>
            <div class="matches">
                <div v-for="(_, index) in 9" class="match" :class="getMatchBonus(subject.CompetitiveUpdates[index])" @mouseenter="match_details_index = index">
                    <div class="background" :style="`background-color: ${calcScoreColor(subject.CompetitiveUpdates[index])}`"></div>
                </div>
            </div>
            <svg class="selection-arrow" viewBox="0 0 24 24" :style="{ '--index': match_details_index }">
                <path d="M7 14l5-5l5 5z" fill="currentColor"></path>
            </svg>
            <div v-if="match_details.loaded" class="match-details">
                <div class="background" :style="{ '--bgi': `url('${match_details.MapImageURL}')` }"></div>
                <div class="details">
                    <div class="map">
                        <div class="name">Map</div>
                        <div class="value">{{ match_details.MapName }}</div>
                    </div>
                    <div class="gain">
                        <div class="name">Gain</div>
                        <div class="value">{{ match_details.Gain }}</div>
                    </div>
                    <div class="bonus">
                        <div class="name">Bonus</div>
                        <div class="value">{{ match_details.Bonus ? `+${match_details.Bonus}` : 'None' }}</div>
                    </div>
                    <div class="afk-penalty">
                        <div class="name">Penalty</div>
                        <div class="value">{{ match_details.AfkPenalty || 'None' }}</div>
                    </div>
                </div>
            </div>
            <div v-else class="match-details"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { ValorantInstance } from '@/scripts/valorant_instance'
import { capitalizeFirstLetter } from '@/scripts/methods'
import * as ValorantAPI from '@/scripts/valorant_api'

const Cache = {
    Maps: ValorantAPI.getMaps()
}

const Valorant = ValorantInstance()
export default {
    name: 'CurrentMatchHistory',
    props: {
        subject: {
            required: true,
            type: Object as () => LoadedCurrentMatchSubject
        },
        top: 0,
        left: 0
    },
    data() {
        return {
            match_details_index: 0,
            match_details: {
                loaded: false,
                MapName: '',
                MapImageURL: '',
                AfkPenalty: '',
                Bonus: '',
                Gain: ''
            }
        }
    },
    created() {
        this.loadMatchDetails()
    },
    watch: {
        subject(current, before) {
            this.match_details_index = 0
            this.loadMatchDetails()
        },
        match_details_index(current, before) {
            this.loadMatchDetails()
        }
    },
    methods: {
        capitalizeFirstLetter,
        async loadMatchDetails() {
            this.match_details.loaded = false

            const Match = this.subject.CompetitiveUpdates[this.match_details_index]
            if (!Match) return

            const Maps = await Cache.Maps
            const Map = Maps.find((m) => m.mapUrl === Match.MapID)

            this.match_details.MapName = Map?.displayName
            this.match_details.MapImageURL = Map?.listViewIcon
            this.match_details.AfkPenalty = Match.AFKPenalty
            this.match_details.Bonus = Match.RankedRatingPerformanceBonus
            this.match_details.Gain = Match.RankedRatingEarned >= 0 ? `+${Match.RankedRatingEarned}` : Match.RankedRatingEarned

            this.match_details.loaded = true
        },
        calcScoreColor(match?: ValorantCompetitiveUpdates.Match) {
            let score = 0
            let color = '#18191c'

            if (!match) return color

            if (match.RankedRatingEarned <= -5) {
                if (match.RankedRatingEarned <= -15) score--
                if (match.RankedRatingEarned <= -25) score--

                score--
            } else if (match.RankedRatingEarned >= 5) {
                if (match.RankedRatingEarned >= 15) score++
                if (match.RankedRatingEarned >= 25) score++

                score++
            }

            if (score <= -3) {
                color = '#983746'
            } else if (score <= -2) {
                color = '#ca6d7b'
            } else if (score <= -1) {
                color = '#e5b8bf'
            } else if (score >= 3) {
                color = '#1aa186'
            } else if (score >= 2) {
                color = '#42e0c1'
            } else if (score >= 1) {
                color = '#9aefde'
            } else {
                color = '#757575'
            }

            return color
        },
        getMatchBonus(match?: ValorantCompetitiveUpdates.Match) {
            if (!match) return ''

            if (match.AFKPenalty) return 'afk'
            if (match.RankedRatingPerformanceBonus) return 'bonus'
        }
    }
}
</script>

<style scoped>
:root {
    --index: ';-;';
}

.history {
    position: absolute;
    display: flex;

    width: 366px;
    height: 197px;

    border-radius: 6px;
    background-color: #18191c;

    overflow: hidden;
}

.history > .trust-factor {
    position: relative;

    height: 100%;
    width: calc(100% - 124px);
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;

    background-color: #202225;
}

.history > .trust-factor > .selection-arrow {
    position: absolute;
    bottom: 72px;
    left: calc(5px + (var(--index) * 25px));

    height: 30px;
    width: 30px;
    color: #121314;

    pointer-events: none;
}

.history > .trust-factor > .match-details {
    overflow: hidden;
    position: relative;

    height: 75px;
    margin: 11px 11px 0;
    border-radius: 6px;

    background-color: #121314;
}
.history > .trust-factor > .match-details > .background {
    position: absolute;

    background-image: linear-gradient(to top, #0000 -150%, #121314 100%), var(--bgi);
    background-position: center;
    background-size: 160%;

    width: 100%;
    height: 100%;
    filter: blur(2px);
    border-radius: 6px;
}
.history > .trust-factor > .match-details > .details {
    position: absolute;
    display: flex;
    margin: 25px 0;
}
.history > .trust-factor > .match-details > .details > div {
    width: 55px;
    height: 100%;
}
.history > .trust-factor > .match-details > .details > div > .name {
    color: #676e79;
    font-size: 10px;
}
.history > .trust-factor > .match-details > .details > div > .value {
    color: #ffffff;
    font-size: 12px;
}

.history > .trust-factor > .matches {
    display: flex;
    gap: 5px;

    height: 32px;
    margin: 11px 11px 0;
}
.history > .trust-factor > .matches > .match {
    width: 20px;
}
.history > .trust-factor > .matches > .match > .background {
    border-radius: 6px;
    height: 100%;
    width: 100%;
}
.history > .trust-factor > .matches > .match.afk > .background {
    outline: 1px solid #b91830;
    outline-offset: 1px;
}
.history > .trust-factor > .matches > .match.bonus > .background {
    outline: 1px solid #00a181;
    outline-offset: 1px;
}

.history > .trust-factor > .current-rank {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;

    width: 210px;
    margin: 11px 11px 0;
    padding: 5px;
    border-radius: 6px;

    background-color: #18191c;
}
.history > .trust-factor > .current-rank > .rank {
    display: flex;
    align-items: center;
    gap: 3px;
}
.history > .trust-factor > .current-rank > .rank > .icon {
    background-image: var(--bgi);
    background-size: cover;
    background-position: center;

    width: 17px;
    height: 17px;
}
.history > .trust-factor > .current-rank > .rank > .name {
    line-height: 9px;
    font-size: 13px;
    color: #ffffff;
}
.history > .trust-factor > .current-rank > .rank-rating {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}
.history > .trust-factor > .current-rank > .rank-rating > .progress-bar {
    overflow: hidden;

    width: 140px;
    height: 5px;
    border-radius: 6px;

    background-color: #202225;
}
.history > .trust-factor > .current-rank > .rank-rating > .progress-bar > .progress {
    height: 100%;
    max-width: 100%;
    border-radius: 3px;
    background-color: #269c86;
}
.history > .trust-factor > .current-rank > .rank-rating > .labels-flex {
    display: flex;
    justify-content: space-between;

    width: 100%;
}
.history > .trust-factor > .current-rank > .rank-rating > .labels-flex > .name {
    line-height: 7px;
    font-size: 10px;
    color: #40444b;
}
.history > .trust-factor > .current-rank > .rank-rating > .labels-flex > .amount {
    line-height: 7px;
    font-size: 10px;
    color: #40444b;
}

.history > .ranks {
    position: relative;
    overflow: auto;

    display: flex;
    flex-direction: column;
    gap: 5px;

    margin: 11px 0;
    height: var(--webkit-fill-available);
    width: 124px;
}
.history > .ranks::-webkit-scrollbar {
    width: 11px;
    height: 11px;
}
.history > .ranks::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: 10px;
}
.history > .ranks::-webkit-scrollbar-thumb {
    border: 4px solid #18191c;
    background-color: #121314;
    border-radius: 10px;
}

.history > .ranks > .rank {
    text-align: left;

    border-radius: 6px;
    margin-left: 11px;
    padding: 5px;
    width: 92px;

    background-color: #121314;
}
.history > .ranks > .rank > .act {
    line-height: 8px;
    font-size: 11px;
    color: #40444b;

    margin-bottom: 5px;
}
.history > .ranks > .rank > .rank {
    display: flex;
    align-items: center;
    gap: 3px;
}
.history > .ranks > .rank > .rank > .icon {
    background-image: var(--bgi);
    background-size: cover;
    background-position: center;

    width: 17px;
    height: 17px;
}
.history > .ranks > .rank > .rank > .name {
    font-size: 13px;
    color: #ffffff;
}

.history > .ranks::-webkit-scrollbar,
.history > .ranks::-webkit-scrollbar {
    width: 11px;
    height: 11px;
}
.history > .ranks::-webkit-scrollbar-thumb,
.history > .ranks::-webkit-scrollbar-thumb {
    border: 3px solid #18191c;
    background-color: #121314;
    border-radius: 10px;
}
</style>
