<template>
    <div class="match" :class="match.MatchID">
        <div v-if="match.MatchDetails" class="loaded" :class="getWinOrLoseAttribute(match)">
            <div class="agent-icon" :style="`--bgi: url('${match.MatchDetails.SubjectAgentIconURL}')`"></div>
            <div class="gamemode-icon" :style="`--bgi: url('${match.MatchDetails.GameModeIconURL || match.MatchDetails.RankIconURL}')`"></div>
            <div v-if="match.MatchDetails.MMRChange" :class="getMMRChangeAttribute(match.MatchDetails.MMRChange)" class="rank-rating-change">
                {{ match.MatchDetails.MMRChange >= 0 ? `+${match.MatchDetails.MMRChange}` : match.MatchDetails.MMRChange }}
            </div>
            <div class="game-summary">
                <div class="tags">
                    <div class="kda">KDA</div>
                    <div class="score">SCORE</div>
                </div>
                <div class="stats">
                    <div class="kda">
                        <div class="kills">{{ match.MatchDetails.SubjectStats.kills }}</div>
                        <div class="separator">/</div>
                        <div class="deaths">{{ match.MatchDetails.SubjectStats.deaths }}</div>
                        <div class="separator">/</div>
                        <div class="assists">{{ match.MatchDetails.SubjectStats.assists }}</div>
                    </div>
                    <div class="score">{{ parseDecimal(match.MatchDetails.SubjectStats.score) }}</div>
                </div>
            </div>
            <div class="game-result">
                <div class="result">{{ getMatchResult(match) }}</div>
                <div class="stats">
                    <div class="your-team">{{ getMatchStats(match)[0] }}</div>
                    <div class="separator">-</div>
                    <div class="their-team">{{ getMatchStats(match)[1] }}</div>
                </div>
            </div>
            <div class="map-banner" :style="`--bgi: url('${match.MatchDetails.MapBannerURL}')`"></div>
        </div>
        <div v-else class="unloaded"></div>
    </div>
</template>

<script lang="ts">
import { parseDecimal } from '@/scripts/methods'

export default {
    name: 'MatchDetails.vue',
    props: {
        match: Object as () => ValorantMatchHistoryWithSubjectMatchDetails
    },
    methods: {
        parseDecimal: parseDecimal,
        getMatchResult(match: ValorantMatchHistoryWithSubjectMatchDetails) {
            const MatchDraw = !match.MatchDetails.WinningTeam

            return MatchDraw ? 'DRAW' : match.MatchDetails.SubjectTeamWin ? 'VICTORY' : 'DEFEAT'
        },
        getMatchStats(match: ValorantMatchHistoryWithSubjectMatchDetails) {
            const MatchDraw = !match.MatchDetails.WinningTeam

            const LosingTeamRoundsWon = match.MatchDetails.LosingTeam?.roundsWon || 0
            const WinningTeamRoundsWon = (!MatchDraw ? match.MatchDetails.WinningTeam?.roundsWon : match.MatchDetails.LosingTeam?.roundsWon) || 0

            return match.MatchDetails.SubjectTeamWin ? [WinningTeamRoundsWon, LosingTeamRoundsWon] : [LosingTeamRoundsWon, WinningTeamRoundsWon]
        },
        getWinOrLoseAttribute(match: ValorantMatchHistoryWithSubjectMatchDetails) {
            const MatchDraw = !match.MatchDetails.WinningTeam
            return MatchDraw ? 'draw' : match.MatchDetails.SubjectTeamWin ? 'won' : 'lost'
        },
        getMMRChangeAttribute(MMRChange) {
            return MMRChange === 0 ? 'neutral' : MMRChange > 0 ? 'positive' : 'negative'
        }
    }
}
</script>

<style scoped>
.match {
    /*height: 72px;*/
    /*width: 479px;*/
    height: 67px;
    width: 804px;
}

.match > .unloaded {
    height: inherit;
    width: inherit;

    border: 0 solid;
    border-radius: 6px;

    animation: fetching-animation 2s infinite ease-in-out;
}

.match > .loaded {
    position: relative;

    height: inherit;
    width: inherit;

    border: 0 solid;
    border-radius: 6px;
}

.match > .loaded.won {
    background-color: #287567;
    --game-result-color: #287567;
    --game-result-color-bright: #66c3a9;
}
.match > .loaded.lost {
    background-color: #603a3d;
    --game-result-color: #603a3d;
    --game-result-color-bright: #f05c57;
}
.match > .loaded.draw {
    background-color: #727988;
    --game-result-color: #727988;
    --game-result-color-bright: #b6c2d9;
}

.match > .loaded > .agent-icon {
    position: absolute;
    left: 0;

    height: inherit;
    width: 67px;

    background-image: var(--bgi);
    background-size: cover;

    border: 0 solid;
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
}

.match > .loaded > .gamemode-icon {
    position: absolute;
    left: 67px;

    height: 37px;
    width: 37px;
    margin: 15px;

    background-image: var(--bgi);
    background-size: cover;
}

.match > .loaded .rank-rating-change {
    position: absolute;
    left: 82px;
    top: 47px;

    text-align: right;
    font-size: 12px;

    width: 37px;
    line-height: 10px;
}

.match > .loaded .rank-rating-change.positive {
    color: #66c3a9;
}
.match > .loaded .rank-rating-change.neutral {
    color: #b6c2d9;
}
.match > .loaded .rank-rating-change.negative {
    color: #f05c57;
}

.match > .loaded > .game-summary {
    display: flex;
    align-items: center;
    gap: 5px;

    position: absolute;
    left: 134px;

    height: 67px;
    width: 150px;
}

.match > .loaded > .game-summary > .tags,
.match > .loaded > .game-summary > .stats {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.match > .loaded > .game-summary > .stats > .kda {
    display: flex;
}

.match > .loaded > .game-summary > .stats > .kda > .separator {
    color: #d9d9d9;
    width: 8px;
    font-size: 14px;
    line-height: 18px;
}

.match > .loaded > .game-summary .kda {
    font-size: 18px;
    line-height: 18px;
}
.match > .loaded > .game-summary .score {
    color: #d9d9d9;
    font-size: 14px;
    line-height: 14px;
}

.match > .loaded > .game-result {
    display: flex;
    flex-direction: column;
    justify-content: center;

    position: absolute;
    right: 284px;

    width: 236px;
    height: 67px;
}

.match > .loaded > .game-result > .stats {
    display: flex;
    font-size: 16px;
    line-height: 16px;
}

.match > .loaded > .game-result > .stats > .your-team {
    text-align: right;
    width: 111px;
}
.match > .loaded > .game-result > .stats > .separator {
    width: 14px;
}
.match > .loaded > .game-result > .stats > .their-team {
    text-align: left;
    width: 111px;
}
.match > .loaded > .game-result > .result {
    font-size: 18px;
    line-height: 18px;
    color: #f05c57;
}
.match > .loaded.won > .game-result > .result {
    color: #66c3a9;
}
.match > .loaded.draw > .game-result > .result {
    color: #b6c2d9;
}

.match > .loaded > .map-banner {
    position: absolute;
    right: 0;

    height: inherit;
    width: 240px;
    /*width: 306px;*/

    background-image: linear-gradient(to left, #0000 10%, var(--game-result-color) 100%), var(--bgi);
    background-size: cover;

    border: 0 solid;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
}
</style>
