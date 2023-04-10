<template>
    <svg v-if="icon === 'more'" :style="getStyle()" viewBox="0 0 24 24">
        <path
            d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2z"
            fill="currentColor"
        ></path>
    </svg>
    <svg v-else-if="icon === 'next'" :style="getStyle()" viewBox="0 0 24 24">
        <path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"></path>
    </svg>
    <svg v-else-if="icon === 'before'" :style="getStyle()" viewBox="0 0 24 24">
        <path d="M15.41 7.41L14 6l-6 6l6 6l1.41-1.41L10.83 12z" fill="currentColor"></path>
    </svg>
    <svg v-else-if="icon === 'close'" :style="getStyle()" viewBox="0 0 24 24">
        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z" fill="currentColor"></path>
    </svg>
    <svg v-else-if="icon === 'more-vert'" :style="getStyle()" viewBox="0 0 24 24">
        <path
            d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2z"
            fill="currentColor"
        ></path>
    </svg>
    <svg v-else-if="icon === 'package'" :style="getStyle()" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3"></path>
            <path d="M12 12l8-4.5"></path>
            <path d="M12 12v9"></path>
            <path d="M12 12L4 7.5"></path>
            <path d="M16 5.25l-8 4.5"></path>
        </g>
    </svg>
    <svg v-else-if="icon === 'external-url'" :style="getStyle()" viewBox="0 0 24 24">
        <path
            d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3h-7z"
            fill="currentColor"
        ></path>
    </svg>
    <svg v-else-if="icon === 'warning'" :style="getStyle()" viewBox="0 0 24 24">
        <path d="M1 21h22L12 2L1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"></path>
    </svg>
    <svg v-else-if="icon === 'check'" :style="getStyle()" viewBox="0 96 960 960">
        <path d="M395 811 185 600l90-90 120 120 291-290 90 90-381 381Z" fill="currentColor" />
    </svg>
    <svg v-else-if="icon === 'delete'" :style="getStyle()" viewBox="0 0 24 24">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"></path>
    </svg>
    <svg v-else-if="icon === 'dropdown'" :style="getStyle()" viewBox="0 0 24 24">
        <path d="M7 10l5 5l5-5z" fill="currentColor"></path>
    </svg>
</template>

<script lang="ts">
export default {
    props: {
        size: String as () => string,
        icon: String as () => 'more' | 'next' | 'before' | 'close' | 'more-vert' | 'package' | 'external-url' | 'warning' | 'check' | 'delete' | 'dropdown'
    },
    name: 'Icon',
    methods: {
        getStyle() {
            return `width: ${this.size}; height: ${this.size};`
        }
    }
}
</script>

<style scoped></style>
