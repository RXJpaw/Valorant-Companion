<template>
    <div class="chroma-level">
        <div v-if="this.chromas.length" class="chroma-selector">
            <div
                class="chroma"
                v-for="(chroma, index) in chromas"
                :class="{ owned: chroma.owned, using: weapon.ChromaID === chroma.entry.uuid }"
                @click="$emit('update:chroma', chroma.entry.uuid)"
            >
                <div class="image" :style="`--bgi: url('${chroma.entry.swatch}')`"></div>
                <Icon v-if="!chroma.owned" class="locked" icon="locked" size="15px" />
            </div>
        </div>
        <div v-else class="chroma-selector disabled">
            <div class="empty">No Variants</div>
        </div>
        <div v-if="this.levels.length" class="level-selector">
            <div
                class="level"
                v-for="(level, index) in levels"
                :class="{ owned: level.owned, using: weapon.LevelID === level.entry.uuid }"
                @click="$emit('update:level', level.entry.uuid)"
            >
                <div v-if="level.owned" class="text">{{ index + 1 }}</div>
                <Icon v-else class="locked" icon="locked" size="13px" />
            </div>
        </div>
        <div v-else class="level-selector disabled">
            <div class="level">
                <div class="text">No Levels</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Icon from '@/components/Misc/Icon.vue'

export default {
    name: 'LoadoutChromaLevel',
    components: { Icon },
    props: {
        weapon: Object as () => ProcessedLoadoutWeapon,
        owned_skins: Object as () => { [uuid: string]: ProcessedLoadoutSkin },
        owned_levels: Object as () => string[],
        owned_chromas: Object as () => string[]
    },
    data() {
        return {
            levels: [] as { owned: boolean; entry: ValorantAPIWeapon.Level }[],
            chromas: [] as { owned: boolean; entry: ValorantAPIWeapon.Chroma }[]
        }
    },
    watch: {
        owned_levels: {
            handler() {
                this.levels = this.getLevels()
            },
            deep: true
        },
        owned_chromas: {
            handler() {
                this.chromas = this.getChromas()
            },
            deep: true
        }
    },
    methods: {
        getLevels(): { owned: boolean; entry: ValorantAPIWeapon.Level }[] {
            if (!this.owned_skins) return []

            const Levels = this.owned_skins[this.weapon.SkinID].entry.levels
            if (!Levels) return []

            const OwnedLevels = Levels.map((level, index) => {
                return { owned: index === 0 || this.owned_levels.includes(level.uuid), entry: level }
            })

            return OwnedLevels.length > 1 ? OwnedLevels : []
        },
        getChromas(): { owned: boolean; entry: ValorantAPIWeapon.Chroma }[] {
            if (!this.owned_skins) return []

            const Chromas = this.owned_skins[this.weapon.SkinID].entry.chromas
            if (!Chromas) return []

            const OwnedChromas = Chromas.map((chroma, index) => {
                return { owned: index === 0 || this.owned_chromas.includes(chroma.uuid), entry: chroma }
            })

            return OwnedChromas.length > 1 ? OwnedChromas : []
        }
    }
}
</script>

<style scoped>
.chroma-level {
    position: relative;

    height: 59px;
    width: 155px;

    user-select: none;
}

.chroma-level > .level-selector {
    display: flex;
    gap: 5px;

    width: 100%;
    height: 17px;
    margin-top: 5px;
    border-radius: 6px;
}
.chroma-level > .level-selector.disabled {
    pointer-events: none;
}
.chroma-level > .level-selector > .level {
    width: var(--webkit-fill-available);
    padding: 3px;
    border-radius: 6px;

    background-color: #18191c;

    cursor: pointer;
}
.chroma-level > .level-selector > .level:not(.owned) {
    opacity: 0.666;
    pointer-events: none;
}
.chroma-level > .level-selector > .level > .locked {
    position: relative;
    top: -3px;

    color: #6d6f78;
}
.chroma-level > .level-selector > .level > .text {
    color: #6d6f78;
    font-size: 13px;
    line-height: 11px;
}

.chroma-level > .chroma-selector {
    display: flex;
    gap: 5px;

    height: 27px;
    margin-top: 5px;
}
.chroma-level > .chroma-selector.disabled {
    opacity: 0.666;
    pointer-events: none;
}
.chroma-level > .chroma-selector > .empty {
    background-color: #18191c;
    border-radius: 6px;
    line-height: 15px;
    font-size: 18px;
    padding: 6px 0;
    color: #6d6f78;
    width: 100%;
}
.chroma-level > .chroma-selector > .chroma {
    overflow: hidden;
    position: relative;

    width: var(--webkit-fill-available);
    border-radius: 6px;

    cursor: pointer;
}
.chroma-level > .chroma-selector > .chroma > .locked {
    position: absolute;
    bottom: 0;
    right: 0;

    color: #b9bbbe;
    margin: 3px 1px;
}
.chroma-level > .chroma-selector > .chroma:not(.owned) {
    pointer-events: none;
}
.chroma-level > .chroma-selector > .chroma > .image {
    width: 100%;
    height: 27px;
    border-radius: 6px;

    background-size: cover;
    background-image: var(--bgi);
    background-position: center;
}
.chroma-level > .chroma-selector > .chroma:not(.owned) > .image {
    filter: brightness(0.5) grayscale(1);
}

.using {
    outline: 2px solid #388e3c;
    outline-offset: -1px;
}
</style>
