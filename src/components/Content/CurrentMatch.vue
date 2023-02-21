<template>
    <div class="current-match" v-if="subjects.length > 0">
        <div class="game-info">
            <div class="team allies">
                <div class="name">YOUR TEAM</div>
                <div v-if="game_state === 'INGAME' && enemies_chance" class="chance">{{ Math.round(allies_chance * 100) }}%</div>
            </div>
            <div class="versus">VS</div>
            <div class="team enemies">
                <div class="name">OPPONENTS</div>
                <div v-if="game_state === 'INGAME' && enemies_chance" class="chance">{{ Math.round(enemies_chance * 100) }}%</div>
            </div>
        </div>
        <div class="players left">
            <CurrentMatchPlayer
                v-for="subject in getSides()?.TeamLeft"
                v-model:inventory_subject="inventory_subject"
                v-model:inventory_left="inventory_left"
                v-model:inventory_top="inventory_top"
                :game_state="game_state"
                :subject="subject"
            />
        </div>
        <div class="players right">
            <CurrentMatchPlayer
                v-for="subject in getSides()?.TeamRight"
                v-model:inventory_subject="inventory_subject"
                v-model:inventory_left="inventory_left"
                v-model:inventory_top="inventory_top"
                :game_state="game_state"
                :subject="subject"
                :enemy="true"
            />
        </div>
        <transition>
            <CurrentMatchInventory v-if="inventory_subject" :subject="inventory_subject" :left="inventory_left" :top="inventory_top" />
        </transition>
    </div>
    <div v-else class="current-match">
        <NotReady text="Waiting for VALORANT match data..." />
    </div>
</template>

<script lang="ts">
import CurrentMatchInventory from '@/components/Browser/CurrentMatchInventory.vue'
import { capitalizeFirstLetter, EncounterHistory, sleep } from '@/scripts/methods'
import CurrentMatchPlayer from '@/components/Browser/CurrentMatchPlayer.vue'
import { ValorantInstance } from '@/scripts/valorant_instance'
import WEAPONS from '@/assets/valorant_api/weapons.json'
import SOCKETS from '@/assets/valorant_api/sockets.json'
import NotReady from '@/components/Content/NotReady.vue'
import { FistBumpBuddyUUID } from '@/scripts/valorant'
import SKILL from '@/assets/valorant_api/skill.json'
import Icon from '@/components/Misc/Icon.vue'

const Valorant = ValorantInstance()

export default {
    name: 'CurrentMatch',
    components: { CurrentMatchInventory, CurrentMatchPlayer, Icon, NotReady },
    props: {
        isVisible: Boolean as () => boolean
    },
    data() {
        return {
            subjects: [],
            allies_chance: 0,
            enemies_chance: 0,
            game_state: null as never as ValorantChatPresences.SessionLoopState,
            match_id: null as string | null,
            queue: [] as ValorantChatPresences.Player[][],
            mock_state: null as null | 'INGAME' | 'PREGAME',
            inventory_subject: null as LoadedCurrentMatchSubject | null,
            inventory_left: 0,
            inventory_top: 0
        }
    },
    async created() {
        window.addEventListener('keydown', this.KeyDownListener)

        window['setMockState'] = (newMockState) => {
            if ([null, 'INGAME', 'PREGAME'].includes(newMockState)) {
                this.mock_state = newMockState
                this.queue.push(Valorant.getCachePresences())

                console.log(`Mock state set to: ${newMockState}`)
            } else {
                console.log('The new mock state must be one of: null, INGAME, PREGAME')
            }
        }

        this.queue.push(Valorant.getCachePresences())
        Valorant.Client.on('presences', async (data) => {
            this.queue.push(data)
        })

        while (1) {
            if (this.queue.length > 0) {
                try {
                    const Presences = this.queue[0]
                    this.queue.splice(0, 1)

                    await this.processSubjects(Presences)
                } catch (error) {
                    console.error(error)
                }
            } else {
                await sleep(250)
            }
        }
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.KeyDownListener)
    },
    methods: {
        async KeyDownListener(event: KeyboardEvent) {
            if (!this.isVisible) return

            if (event.key === 'Escape') {
                this.inventory_subject = null
            }
        },
        getSides() {
            const SelfSubject = Valorant.getSelfSubject()
            const SelfPlayer = this.subjects.find((subject) => subject?.Subject === SelfSubject)!
            if (!SelfPlayer) return

            const SelfTeam = SelfPlayer.TeamID

            const TeamLeft = [] as any[]
            const TeamRight = [] as any[]

            this.subjects.forEach((subject) => {
                if (subject.TeamID === SelfTeam) {
                    TeamLeft.push(subject)
                } else {
                    TeamRight.push(subject)
                }
            })

            if (this.subjects.filter((s) => !s.loaded).length === 0) {
                const LeftTiers = TeamLeft.reduce((partial, curr) => {
                    const Tier = curr.CurrentRank?.tier || curr.HighestRank?.tier || 13
                    const RR = (curr.CurrentRR || 0) / 100

                    return partial + SKILL[Math.round(Tier + RR)]
                }, 0)
                const RightTiers = TeamRight.reduce((partial, curr) => {
                    const Tier = curr.CurrentRank?.tier || curr.HighestRank?.tier || 13
                    const RR = (curr.CurrentRR || 0) / 100

                    return partial + SKILL[Math.round(Tier + RR)]
                }, 0)

                this.allies_chance = LeftTiers / (LeftTiers + RightTiers)
                this.enemies_chance = RightTiers / (LeftTiers + RightTiers)
            } else {
                this.allies_chance = 0
                this.enemies_chance = 0
            }

            return { TeamLeft, TeamRight }
        },
        async processMatchSubjects(
            Players: ValorantCoreGameMatch.Player[] | ValorantPreGameMatch.Player[],
            Presences: ValorantChatPresence[],
            AllyTeamID?: string,
            EnemyTeamSize?: number,
            Loadouts?: ValorantPreGameLoadouts.Loadout[]
        ) {
            const NameServices = await Valorant.getNameService(Players.map((player) => player.Subject))
            const MatchPresences = Presences.filter((presence) => Players.findIndex((player) => player.Subject === presence.Subject) !== -1)

            const Parties = Array.from(
                new Set(
                    MatchPresences
                        //
                        .filter((presence) => MatchPresences.filter((filter) => filter.partyId === presence.partyId).length > 1)
                        .map((presence) => presence.partyId)
                )
            ).sort()

            for (let i = 0; i < Players.length; i++) {
                const player = Players[i]
                const index = (EnemyTeamSize ? (AllyTeamID === 'Blue' ? 0 : EnemyTeamSize) : 0) + i

                const MMR = await Valorant.parseMMR(player.Subject)
                const Presence = Presences.find((presence) => presence.Subject === player.Subject)
                const Encounters = await EncounterHistory.get(player.Subject)
                const LevelBorder = await Valorant.getLevelBorder(player.PlayerIdentity.AccountLevel, player.PlayerIdentity.PreferredLevelBorderID)
                const NameService = NameServices[player.Subject]

                const SkinChromas: (string | null)[] = []
                const Buddies: (string | null)[] = []

                for (const weaponName in WEAPONS) {
                    const weaponUUID = WEAPONS[weaponName]
                    const Item = Loadouts?.[i].Items[weaponUUID] || null

                    Buddies.push(Item?.Sockets[SOCKETS.buddy]?.Item.ID || null)
                    SkinChromas.push(Item?.Sockets[SOCKETS.skin_chroma]?.Item.ID || null)
                }

                this.subjects[index] = {
                    AgentIconURL: `https://media.valorant-api.com/agents/${player.CharacterID}/displayicon.png`,
                    PlayerCardURL: `https://media.valorant-api.com/playercards/${player.PlayerIdentity.PlayerCardID}/wideart.png`,
                    LevelBorderURL: LevelBorder.levelNumberAppearance,
                    HasFistBumpBuddy: Buddies.includes(FistBumpBuddyUUID),
                    HasPresence: !!Presence,

                    EncounterAmount: Object.keys(Encounters.Matches).filter((mId) => mId !== this.match_id).length,
                    LastEncounter: Encounters.LastEncounter,

                    Buddies: Buddies,
                    SkinChromas: SkinChromas,

                    LowestRankIconURL: MMR.WorstRank.smallIcon,
                    LowestRankName: capitalizeFirstLetter(MMR.WorstRank.tierName),
                    LowestRank: MMR.WorstRank,
                    CurrentRankIconURL: MMR.CurrentRank.smallIcon,
                    CurrentRankName: capitalizeFirstLetter(MMR.CurrentRank.tierName),
                    CurrentRank: MMR.CurrentRank,
                    CurrentRR: MMR.CurrentRR,
                    HighestRankIconURL: MMR.BestRank.smallIcon,
                    HighestRankName: capitalizeFirstLetter(MMR.BestRank.tierName),
                    HighestRank: MMR.BestRank,

                    Level: player.PlayerIdentity.AccountLevel,
                    TagLine: NameService.TagLine,
                    GameName: NameService.GameName,

                    Subject: player.Subject,
                    PartyID: Parties.findIndex((party) => party === Presence?.partyId) + 1,
                    TeamID: player['TeamID'] || AllyTeamID,

                    loaded: true,
                    index: index
                }
            }
        },
        async processSubjects(Presences: ValorantChatPresence[]) {
            const SelfSubject = Valorant.getSelfSubject()
            const SelfPresence = Presences.find((presence) => presence.Subject === SelfSubject)
            if (!SelfPresence) return
            const GameState = this.mock_state || SelfPresence.sessionLoopState

            if (this.game_state !== GameState) {
                this.game_state = GameState

                if (GameState === 'MENUS') {
                    this.match_id = null
                    this.subjects = []
                }
                if (GameState === 'PREGAME') {
                    this.match_id = this.mock_state ? 'mock' : await Valorant.getPreGameMatchId()
                    this.subjects = []
                }
                if (GameState === 'INGAME') {
                    this.match_id = this.mock_state ? 'mock' : await Valorant.getCoreGameMatchId()
                }
            }

            if (!this.match_id) return

            if (GameState === 'MENUS') {
            }
            if (GameState === 'PREGAME') {
                const PreGame = await Valorant.getPreGameMatch(this.match_id)

                for (let i = 0; i < PreGame.AllyTeam.Players.length; i++) {
                    const index = (PreGame.AllyTeam.TeamID === 'Blue' ? 0 : PreGame.EnemyTeamSize) + i

                    const player = PreGame.AllyTeam.Players[i]

                    if (!this.subjects[index]?.loaded) this.subjects[index] = { Subject: player.Subject, TeamID: PreGame.AllyTeam.TeamID, loaded: false }
                }

                for (let i = 0; i < PreGame.EnemyTeamSize; i++) {
                    const index = (PreGame.AllyTeam.TeamID === 'Blue' ? PreGame.AllyTeam.Players.length : 0) + i

                    if (!this.subjects[index]?.loaded) this.subjects[index] = { Subject: null, TeamID: null, loaded: false }
                }

                await this.processMatchSubjects(PreGame.AllyTeam.Players, Presences, PreGame.AllyTeam.TeamID, PreGame.EnemyTeamSize)
            }
            if (GameState === 'INGAME') {
                const CoreGame = await Valorant.getCoreGameMatch(this.match_id)
                const { Loadouts } = await Valorant.getCoreGameLoadouts(this.match_id)

                for (let i = 0; i < CoreGame.Players.length; i++) {
                    const player = CoreGame.Players[i]

                    if (!this.subjects[i]?.loaded) this.subjects[i] = { Subject: player.Subject, TeamID: player.TeamID, loaded: false }
                }

                await this.processMatchSubjects(
                    CoreGame.Players,
                    Presences,
                    undefined,
                    undefined,
                    Loadouts.map((loadout) => loadout.Loadout)
                )
            }
        }
    }
}

//normal game
//87px height
//468px width

//deathmatch
//87px height
//468px width
</script>

<style scoped>
.inventory:is(.v-enter-active, .v-leave-active) {
    transition: opacity ease-in-out 0.15s;
}
.inventory:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
}

:root {
    --boi: UwU;
}

.current-match {
    display: grid;
    justify-items: center;
    justify-content: center;

    grid-template-columns: repeat(2, 446px);
    grid-template-rows: repeat(2, auto);
    grid-column-gap: 44px;
    grid-row-gap: 0;
}

.current-match > .players {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    align-content: flex-start;

    column-gap: 44px;
    row-gap: 22px;
    margin: 22px 0 44px;
}
.current-match > .players.left {
    justify-content: flex-end;
}
.current-match > .players.right {
    justify-content: flex-start;
}

.current-match > .game-info {
    display: flex;
    align-items: flex-end;

    margin-top: 22px;
    grid-area: 1 / 1 / 2 / 3;
}

.current-match > .game-info > .versus {
    font-size: 14px;
    line-height: 10px;

    width: 44px;
    margin: 11px 0;
}
.current-match > .game-info > .team {
    display: flex;
    flex-direction: column;
    gap: 5px;

    width: 446px;
}
.current-match > .game-info > .team.allies {
    align-items: flex-end;
    flex-direction: row-reverse;
}
.current-match > .game-info > .team.enemies {
    align-items: flex-start;
    flex-direction: row;
}
.current-match > .game-info > .team.allies > :is(.name, .chance) {
    color: #66c3a9;
}
.current-match > .game-info > .team.enemies > :is(.name, .chance) {
    color: #f05c57;
}
.current-match > .game-info > .team > :is(.name, .chance) {
    font-size: 23px;
    line-height: 16px;

    padding: 8px;

    border: 0 solid;
    border-radius: 8px;

    background-color: #121314;
}
</style>
