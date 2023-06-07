<template>
    <div class="export" ref="export" :class="{ closed: !open }">
        <div v-if="was_opened && disclaimer_accepted" class="wrapper">
            <div class="header">Riot Account Export</div>
            <TextInput
                ref="rac-password-input"
                class="password-input"
                type="text"
                width="253px"
                :disabled="rac_exporting"
                v-model:input="rac_password"
                placeholder="Choose Account Secret"
                @keydown.enter="exportAccount"
            ></TextInput>
            <Button class="export-account" :disabled="!rac_password.trim().length || rac_exporting" text="Export Account" @click="exportAccount"></Button>
        </div>
        <div v-else-if="was_opened && !disclaimer_accepted" class="disclaimer">
            <div class="text">
                Exporting your account will create a file containing your encrypted riot account information, sharing this file and the corresponding password
                with security unconscious friends or people you cannot fully trust will offer them the opportunity to change your Riot-Id, E-Mail-Address and
                Password. Scroll down to acknowledge this disclaimer.
            </div>
            <Button class="accept" text="Ok, that's dumb, thanks for telling me!" @click="acceptDisclaimer" />
        </div>
    </div>
</template>

<script lang="ts">
import { capitalizeFirstLetter, Store } from '@/scripts/methods'
import TextInput from '@/components/Input/TextInput.vue'
import Adjectives from '@/assets/words/adjectives.json'
import * as ValorantAPI from '@/scripts/valorant_api'
import Button from '@/components/Input/Button.vue'
import { RiotClient } from '@/scripts/riot_client'
import Adverbs from '@/assets/words/adverbs.json'
import Nouns from '@/assets/words/nouns.json'
import Verbs from '@/assets/words/verbs.json'
import Animation from '@/scripts/animations'

const Cache = {
    ContentTiers: ValorantAPI.getContentTiers(),
    WeaponSkins: ValorantAPI.mapWeaponSkins(),
    Weapons: ValorantAPI.getWeapons()
}

const Riot = RiotClient()
export default {
    name: 'AccountExport',
    components: { TextInput, Button },
    props: {
        open: Boolean as () => boolean,
        subject: String as () => string | null
    },
    data() {
        return {
            loading: false,
            was_opened: false,
            disclaimer_accepted: false,

            rac_password: '',
            rac_exporting: false
        }
    },
    watch: {
        subject: {
            handler(current) {
                Riot.setSubject(current)
            },
            immediate: true
        },
        open: {
            async handler(current) {
                this.was_opened = this.was_opened || current
                if (!current) return

                this.rac_password = this.randomWordPassword()
                this.disclaimer_accepted = !!(await Store.AccountSwitcherSettings.getItem('account_export_disclaimer'))
            },
            immediate: true
        }
    },
    methods: {
        randomWordPassword() {
            const sRNG = crypto.getRandomValues(new Uint16Array(4))

            const AdjectiveIndex = Math.floor((Adjectives.length / 65536) * sRNG[0])
            const NounIndex = Math.floor((Nouns.length / 65536) * sRNG[1])
            const AdverbIndex = Math.floor((Adverbs.length / 65536) * sRNG[2])
            const VerbIndex = Math.floor((Verbs.length / 65536) * sRNG[3])

            const Adjective = capitalizeFirstLetter(Adjectives[AdjectiveIndex])
            const Noun = capitalizeFirstLetter(Nouns[NounIndex])
            const Adverb = capitalizeFirstLetter(Adverbs[AdverbIndex])
            const Verb = capitalizeFirstLetter(Verbs[VerbIndex])

            return Adjective + Noun + Adverb + Verb
        },
        async exportAccount() {
            const element = this.$refs['rac-password-input']?.$el as HTMLElement
            if (!element) return

            this.rac_exporting = true

            try {
                const Password = this.rac_password.trim()
                if (!Password.length) throw { error: 'password_too_short' }

                const AccountDetails: any = await Store.AccountDetails.getItem(this.subject)
                if (!AccountDetails) throw { error: 'account_details_not_found' }

                const DialogFilters = [{ name: 'Riot Account Credentials', extensions: ['rac'] }]

                const { filePath } = await window.electron.ipcRenderer.invoke('show-save-dialog', {
                    filters: DialogFilters,
                    defaultPath: AccountDetails.GameName
                })
                if (!filePath) return

                await RiotClient(this.subject).exportRAC(filePath, this.rac_password)

                this.$emit('update:subject', null)
            } catch (e) {
                console.debug('[rac-export]', e)
                element.animate(Animation.headShake, 750)
            } finally {
                this.rac_exporting = false
            }
        },
        acceptDisclaimer() {
            this.disclaimer_accepted = true
            Store.AccountSwitcherSettings.setItem('account_export_disclaimer', true)
        }
    }
}
</script>

<style scoped>
.export {
    overflow: hidden;

    position: absolute;

    width: 100%;
    height: 87px;
    padding-top: 6px;
    margin-top: -6px;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;

    background-color: #1c1c1c;

    visibility: visible;
    transition: height 0.333s ease-in-out, visibility 0.333s;
    user-select: none;
}

.export.closed {
    height: 0;

    visibility: hidden;
}

.export > .wrapper {
    margin: 11px 0 11px 11px;
    height: 65px;
}
.export > .wrapper > .header {
    position: absolute;
    left: 11px;
    top: 17px;

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
.export > .wrapper > .password-input {
    position: absolute;
    left: 11px;
    top: 49px;

    --vibrant-color: #9575cd;
}
.export > .wrapper > .export-account {
    position: absolute;
    right: 11px;
    top: 51px;

    --button-color: #673ab7;
}

.export > .disclaimer {
    overflow: auto;
    height: 65px;
    margin: 11px 0 11px 11px;
}
.export > .disclaimer > .text {
    margin-top: -2px;
    color: #ffffff;
    font-size: 12px;
    text-align: left;
}
.export > .disclaimer > .accept {
    margin-top: 9px;

    --font-color: #b9bbbe;
    --button-color: #121212;
}

.export > .disclaimer::-webkit-scrollbar {
    width: 11px;
    height: 11px;
}
.export > .disclaimer::-webkit-scrollbar-thumb {
    border: 3px solid #1c1c1c;
    background-color: #121212;
    border-radius: 10px;
}
</style>
