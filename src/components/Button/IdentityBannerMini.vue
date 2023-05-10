<template>
    <div
        v-if="wasVisible"
        ref="banner"
        class="banner-mini"
        :class="{ fav: banner.fav }"
        :style="`--bgi: url('${banner.entry.wideArt}')`"
        @mouseenter="enterBanner"
        @mouseleave="leaveBanner"
    >
        <div class="display-name">
            <div class="name">{{ banner.entry.displayName.replace(/ Card$/, '') }}</div>
        </div>
        <Icon v-if="banner.fav" class="fav is" icon="star" size="16px" @click="deleteFavourite" />
        <Icon v-else-if="hover" class="fav" icon="star-outline" size="16px" @click="addFavourite" />
    </div>
    <div v-else ref="banner" class="banner-mini unseen"></div>
</template>

<script lang="ts">
import Icon from '@/components/Misc/Icon.vue'

export default {
    name: 'IdentityBannerMini',
    components: { Icon },
    props: {
        banner: Object as () => ProcessedIdentityBanner,
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

        this.observer.observe(this.$refs.banner, { attributes: true })
    },
    beforeUnmount() {
        this.$emit('unmount', this.$el)
        if (!this.initiallyInvisible && this.observer) return

        this.observer.disconnect()
        this.observer = null
    },
    methods: {
        enterBanner() {
            this.hover = true
        },
        leaveBanner() {
            this.hover = false
        },
        addFavourite(event: PointerEvent) {
            event.stopPropagation()
            const Banner = this.banner.entry
            this.$emit('addfav:banner', Banner.uuid)
        },
        deleteFavourite(event: PointerEvent) {
            event.stopPropagation()
            const Banner = this.banner.entry
            this.$emit('delfav:banner', Banner.uuid)
        }
    }
}
</script>

<style scoped>
.banner-mini {
    --weapon-height: 50px;

    position: relative;
    height: var(--weapon-height);
    width: var(--weapon-width);
}
.banner-mini:not(.unseen) {
    border-radius: 6px;
    background-position: center;
    background-repeat: no-repeat;
    background-image: var(--bgi);
    background-size: contain;

    box-shadow: 0 0 20px #000000 inset;

    cursor: pointer;
}
.banner-mini * {
    pointer-events: none;
    user-select: none;
}

.banner-mini.fav {
    --fav-color: #fbc02dbf;

    outline: 1px solid var(--fav-color);
    outline-offset: -1px;
}
.banner-mini.fav > .display-name > .name {
    outline: 1px solid var(--fav-color);
}
.banner-mini > .fav {
    position: absolute;
    right: 0;
    top: 0;

    width: 17px;
    height: 17px;
    padding: 3px;

    pointer-events: all;
}
.banner-mini > .fav:not(.is) {
    color: #ffffff66;
}
.banner-mini > .fav:is(.is) {
    color: var(--fav-color);
}
.banner-mini > .fav:hover {
    opacity: 0.666;
}

.banner-mini > .display-name {
    display: flex;
    justify-content: center;

    position: absolute;
    bottom: -4px;
    left: 3px;

    height: 13px;
    width: calc(100% - 6px);
}
.banner-mini > .display-name > .name {
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
