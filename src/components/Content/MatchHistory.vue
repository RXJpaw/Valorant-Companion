<template>
    <div v-if="current_page > 0" class="match-history">
        <div class="matches">
            <MatchDetails v-for="match in getCurrentPage()" :match="match"></MatchDetails>
        </div>
        <Pagination v-model:current-page="current_page" :page-amount="page_amount" />
    </div>
    <div v-else>
        <NotReady text="Waiting for VALORANT match history..." />
    </div>
</template>

<script lang="ts">
import MatchDetails from '@/components/Browser/MatchDetails.vue'
import { ValorantInstance } from '@/scripts/valorant_instance'
import Pagination from '@/components/Browser/Pagination.vue'
import GAMEMODE from '@/assets/valorant_api/gamemodes.json'
import NotReady from '@/components/Content/NotReady.vue'
import * as ValorantAPI from '@/scripts/valorant_api'
import { sleep } from '@/scripts/methods'
import localForage from 'localforage'

const Valorant = ValorantInstance()

const Store = {
    CompetitiveUpdates: localForage.createInstance({ name: 'ValorantMatch', storeName: 'CompetitiveUpdates' }),
    MatchHistory: localForage.createInstance({ name: 'ValorantMatch', storeName: 'History' }),
    MatchDetails: localForage.createInstance({ name: 'ValorantMatch', storeName: 'Details' })
}
const Cache = {
    Maps: ValorantAPI.getMaps(),
    GameModes: ValorantAPI.getGameModes(),
    CompetitiveTiers: ValorantAPI.getCompetitiveTiers(),
    CompetitiveSeasons: ValorantAPI.getCompetitiveSeasons()
}

export default {
    name: 'MatchHistory',
    components: {
        NotReady,
        MatchDetails,
        Pagination
    },
    props: {
        subject: String as () => string,
        isVisible: Boolean as () => boolean
    },
    data() {
        return {
            mounted: true,
            used_unlimited: false,
            match_history_total: 0,
            competitive_updates: {} as ValorantCompetitiveUpdatesList,
            match_history: {} as ValorantMatchHistoryWithSubjectMatchDetailsList,
            current_page: 0,
            page_amount: 0,
            per_page: 7
        }
    },
    watch: {
        async isVisible(current, before) {
            if (current === false) return
            await this.processPageMatchDetails(this.current_page)
        },
        async current_page(current, before) {
            await this.processPageMatchDetails(current)
        }
    },
    async created() {
        await this.processMatchHistory()

        window.addEventListener('keydown', this.KeyDownListener)
    },
    beforeUnmount() {
        this.mounted = false

        window.removeEventListener('keydown', this.KeyDownListener)
    },
    methods: {
        async KeyDownListener(event: KeyboardEvent) {
            if (!this.isVisible || !this.mounted || this.used_unlimited) return

            if (event.key.toLowerCase() === 'u' && event.shiftKey && event.ctrlKey && event.altKey) {
                this.used_unlimited = true

                this.current_page = 0
                await this.processMatchHistory(true)
                this.current_page = 1

                console.debug('downloaded all available match history data')
            }
        },
        async processPageMatchDetails(current_page) {
            if (current_page === 0) return

            const Page = this.getCurrentPage()
            const UnloadedMatchDetails = {}
            for (const { MatchID } of Page) {
                if (this.current_page !== current_page) return
                if (!this.isVisible || !this.mounted) return

                const Match = this.match_history[MatchID]
                if (Match.MatchDetails) continue

                const MatchDetailsStore = (await Store.MatchDetails.getItem(Match.MatchID)) as ValorantMatchDetails

                if (MatchDetailsStore && !MatchDetailsStore.httpStatus) {
                    await sleep(50)

                    this.match_history[MatchID].MatchDetails = await this.getSubjectMatchDetails(MatchDetailsStore)
                } else {
                    UnloadedMatchDetails[MatchID] = null
                }
            }

            for (const MatchID in UnloadedMatchDetails) {
                for (let i = 0; i < 15; i++) {
                    if (this.current_page !== current_page) return
                    if (!this.isVisible || !this.mounted) return
                    await sleep(100)
                }

                const MatchDetails = await Valorant.getMatchDetails(MatchID)
                await Store.MatchDetails.setItem(MatchID, MatchDetails)
                this.match_history[MatchID].MatchDetails = await this.getSubjectMatchDetails(MatchDetails)
            }
        },
        async getSubjectMatchDetails(MatchDetails: ValorantMatchDetails): Promise<ValorantSubjectMatchDetails | null> {
            if (MatchDetails.httpStatus) return null

            const Maps = await Cache.Maps
            const GameModes = await Cache.GameModes
            const CompetitiveTiers = await Cache.CompetitiveTiers
            const CompetitiveSeasons = await Cache.CompetitiveSeasons

            const CompetitiveUpdate = this.competitive_updates[MatchDetails.matchInfo.matchId]
            const MMRChange = CompetitiveUpdate?.RankedRatingEarned

            const LosingTeam = MatchDetails.teams.find((team) => !team.won)!
            const WinningTeam = MatchDetails.teams.find((team) => team.won) || null

            const SubjectDetails = MatchDetails.players.find((player) => player.subject === this.subject)!
            const SubjectAgentIconURL = `https://media.valorant-api.com/agents/${SubjectDetails.characterId}/displayicon.png`
            const SubjectTeamWin = WinningTeam?.teamId === SubjectDetails.teamId
            const SubjectStats = SubjectDetails.stats

            const Map = Maps.find((map) => map.mapUrl === MatchDetails.matchInfo.mapId)!
            const MapBannerURL = Map.listViewIcon

            const GameMode = GameModes.find((gamemode) => gamemode.uuid === GAMEMODE[MatchDetails.matchInfo.queueID])!
            const GameModeIconURL = GameMode?.displayIcon

            const CompetitiveSeason = CompetitiveSeasons.find((season) => season.seasonUuid === MatchDetails.matchInfo.seasonId)!
            const CompetitiveTier = CompetitiveTiers.find((tier) => tier.uuid === CompetitiveSeason.competitiveTiersUuid)!
            const Rank = CompetitiveTier.tiers.find((tier) => tier.tier === (CompetitiveUpdate?.TierAfterUpdate || SubjectDetails.competitiveTier))!

            const RankIconURL = Rank.smallIcon

            return {
                WinningTeam,
                LosingTeam,
                SubjectDetails,
                SubjectStats,
                MapBannerURL,
                SubjectAgentIconURL,
                SubjectTeamWin,
                GameModeIconURL,
                RankIconURL,
                MMRChange
            }
        },
        getCurrentPage() {
            const last = this.current_page * this.per_page
            const first = last - this.per_page

            return Object.values(this.match_history).slice(first, last)
        },
        getPageAmountFromObject(elements: object) {
            return Math.ceil(Object.values(elements).length / this.per_page)
        },
        async processMatchHistory(unlimited?: boolean) {
            const MatchHistoryStore = <ValorantMatchHistoryList>await Store.MatchHistory.getItem(this.subject) ?? {}
            const CompetitiveUpdatesStore = <ValorantCompetitiveUpdatesList>await Store.CompetitiveUpdates.getItem(this.subject) ?? {}

            const CompetitiveUpdates = await Valorant.getCompetitiveUpdates(this.subject, { endIndex: 20, queue: 'competitive' })
            const MatchHistory = await Valorant.getMatchHistory(this.subject, { endIndex: 25 })

            if (unlimited) {
                const UnlimitedAmount = Math.ceil(MatchHistory.Total / 25) - 1
                for (let i = 1; i <= UnlimitedAmount; i++) {
                    await sleep(250)

                    const startIndex = i * 25
                    const endIndex = (i + 1) * 25

                    const Request = await Valorant.getMatchHistory(this.subject, { startIndex, endIndex })
                    MatchHistory.History.push(...Request.History)
                }
            }

            for (const Match of MatchHistory.History) {
                MatchHistoryStore[Match.MatchID] = Match
            }

            for (const Match of CompetitiveUpdates.Matches) {
                CompetitiveUpdatesStore[Match.MatchID] = Match
            }

            await Store.CompetitiveUpdates.setItem(this.subject, CompetitiveUpdatesStore)
            await Store.MatchHistory.setItem(this.subject, MatchHistoryStore)

            const MatchHistoryPage = Object.fromEntries(
                Object.entries(MatchHistoryStore) //
                    .sort((a, b) => b[1].GameStartTime - a[1].GameStartTime)
                    .slice(0, 1393) //693
            )

            const newEntry = {}
            for (const MatchID in MatchHistoryPage) {
                newEntry[MatchID] = { ...MatchHistoryPage[MatchID], MatchDetails: undefined }
            }

            this.match_history = newEntry
            this.competitive_updates = CompetitiveUpdatesStore
            this.match_history_total = MatchHistory.Total
            this.current_page = 1
            this.page_amount = this.getPageAmountFromObject(MatchHistoryPage)
        }
    }
}
</script>

<style scoped>
:root {
    --bgi: OwO;
}
.match-history {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.match-history > .pagination {
    position: fixed;
    bottom: 22px;
}

.match-history > .matches {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;

    gap: 22px;
    margin: 22px 0;
}
</style>
