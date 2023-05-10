<template>
    <div
        v-if="wasVisible"
        ref="spray"
        class="spray-mini"
        :class="{ fav: spray.fav }"
        :style="`--bgi: url('${spray.entry.animationPng || spray.entry.fullTransparentIcon || spray.entry.displayIcon}')`"
        @mouseenter="enterSpray"
        @mouseleave="leaveSpray"
    >
        <div class="display-name">
            <div class="name">{{ spray.entry.displayName.replace(/ Spray$/, '') }}</div>
        </div>
        <Icon v-if="spray.fav" class="fav is" icon="star" size="16px" @click="deleteFavourite" />
        <Icon v-else-if="hover" class="fav" icon="star-outline" size="16px" @click="addFavourite" />
    </div>
    <div v-else ref="spray" class="spray-mini unseen"></div>
</template>

<script lang="ts">
import Icon from '@/components/Misc/Icon.vue'

export default {
    name: 'IdentitySprayMini',
    components: { Icon },
    props: {
        spray: Object as () => ProcessedIdentitySpray,
        initiallyInvisible: Boolean as () => boolean
    },
    data() {
        return {
            hover: false,
            observer: null as MutationObserver | null,
            wasVisible: !this.initiallyInvisible
        }
    },
    mounted() {
        this.$emit('mount', this.$el)
        if (!this.initiallyInvisible) return

        this.observer = new MutationObserver(([mutation], observer) => {
            const Target = mutation.target as Element
            this.wasVisible = Target.classList.contains('was-visible')

            observer.disconnect()
        })

        this.observer.observe(this.$refs.spray, { attributes: true })
    },
    beforeUnmount() {
        this.$emit('unmount', this.$el)
        if (!this.initiallyInvisible && this.observer) return

        this.observer.disconnect()
        this.observer = null
    },
    methods: {
        enterSpray() {
            this.hover = true
        },
        leaveSpray() {
            this.hover = false
        },
        addFavourite(event: PointerEvent) {
            event.stopPropagation()
            const Spray = this.spray.entry
            this.$emit('addfav:spray', Spray.uuid)
        },
        deleteFavourite(event: PointerEvent) {
            event.stopPropagation()
            const Spray = this.spray.entry
            this.$emit('delfav:spray', Spray.uuid)
        }
    }
}
</script>

<style scoped>
.spray-mini {
    --weapon-height: 50px;

    position: relative;
    height: var(--weapon-height);
    width: var(--weapon-width);
}
.spray-mini:not(.unseen) {
    border-radius: 6px;
    background-position: center;
    background-repeat: no-repeat;
    background-image: var(--bgi);
    background-size: contain;

    background-color: #18191c;

    cursor: pointer;
}
.spray-mini * {
    pointer-events: none;
    user-select: none;
}

.spray-mini.fav {
    --fav-color: #fbc02d99;

    outline: 1px solid var(--fav-color);
    outline-offset: -1px;
}
.spray-mini.fav > .display-name > .name {
    outline: 1px solid var(--fav-color);
}
.spray-mini > .fav {
    position: absolute;
    right: 0;
    top: 0;

    width: 17px;
    height: 17px;
    padding: 3px;

    pointer-events: all;
}
.spray-mini > .fav:not(.is) {
    color: #ffffff33;
}
.spray-mini > .fav:is(.is) {
    color: var(--fav-color);
}
.spray-mini > .fav:hover {
    opacity: 0.666;
}

.spray-mini > .display-name {
    display: flex;
    justify-content: center;

    position: absolute;
    bottom: -4px;
    left: 3px;

    height: 13px;
    width: calc(100% - 6px);
}
.spray-mini > .display-name > .name {
    height: 11px;
    padding: 1px 5px;
    border-radius: 6px;

    font-size: 10px;
    line-height: 11px;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    background-color: #121314;
}
</style>
