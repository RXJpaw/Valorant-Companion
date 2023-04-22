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
    <svg v-else-if="icon === 'val-collection'" :style="getStyle()" viewBox="0 0 24.95 22.57" fill="currentColor">
        <path d="M281.3,418.52v8.14s-2.94-1.4-2.94-4.34A4.14,4.14,0,0,1,281.3,418.52Z" transform="translate(-278.36 -405.8)" />
        <polygon points="14.83 0 12.48 0 10.12 0 7.99 2.13 9.74 2.13 10.23 1.63 12.48 1.63 14.72 1.63 15.22 2.13 16.96 2.13 14.83 0" />
        <path d="M290.83,409.56h-9.37v4s7.13,1.49,7.13,4.92h4.49c0-3.43,7.13-4.92,7.13-4.92v-4Z" transform="translate(-278.36 -405.8)" />
        <path d="M294.31,420.55h-6.95s-.21-4-4-4v11.86h15V416.51C294.52,416.51,294.31,420.55,294.31,420.55Z" transform="translate(-278.36 -405.8)" />
        <path d="M300.37,418.52v8.14s2.94-1.4,2.94-4.34A4.14,4.14,0,0,0,300.37,418.52Z" transform="translate(-278.36 -405.8)" />
    </svg>
    <svg v-else-if="icon === 'val-career'" :style="getStyle()" viewBox="0 -1.5 22.55 32.17" fill="currentColor">
        <polygon points="0 0 10.08 0 10.08 12.94 7.33 13.26 0 7.46 0 0" />
        <polygon points="22.55 0 12.47 0 12.47 12.94 15.22 13.26 22.55 7.46 22.55 0" />
        <path
            d="m11.34,15.08c-4.17,0-7.54,3.38-7.54,7.54s3.38,7.54,7.54,7.54,7.54-3.38,7.54-7.54-3.38-7.54-7.54-7.54Zm0,11.18l-3.72-3.72,3.72-3.72,3.72,3.72-3.72,3.72Z"
        />
    </svg>
    <svg v-else-if="icon === 'val-store'" :style="getStyle()" viewBox="0 0 31.23 30.6" fill="currentColor">
        <circle cx="26.89" cy="27.76" r="2.84" />
        <circle cx="8.69" cy="27.76" r="2.84" />
        <polygon points="9.45 3.8 12.79 15.33 28.15 15.33 31.23 3.8 9.45 3.8" />
        <polygon
            points="0 0 6.33 0 10.19 15.33 10.19 17.48 9.45 20.17 28.93 20.17 27.85 22.7 7.04 22.7 7.04 20.59 7.83 17.48 7.83 15.33 4.43 2.14 0 2.14 0 0"
        />
    </svg>
    <svg v-else-if="icon === 'val-bonus'" :style="getStyle()" viewBox="0 0 15.64 23.74" fill="currentColor">
        <path d="m0,0v23.74h15.64V0H0Zm7.82,18.37L1.32,11.87l6.5-6.5,6.5,6.5-6.5,6.5Z" />
    </svg>
    <svg v-else-if="icon === 'play'" :style="getStyle()" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" fill="currentColor"></path>
    </svg>
    <svg v-else-if="icon === 'plus'" :style="getStyle()" viewBox="0 0 24 24">
        <path d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" fill="currentColor"></path>
    </svg>
    <svg v-else-if="icon === 'import-export'" :style="getStyle()" viewBox="0 0 24 24">
        <path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z" fill="currentColor"></path>
    </svg>
</template>

<script lang="ts">
export default {
    props: {
        size: String as () => string,
        icon: String as () =>
            | 'more'
            | 'next'
            | 'before'
            | 'close'
            | 'more-vert'
            | 'package'
            | 'external-url'
            | 'warning'
            | 'check'
            | 'delete'
            | 'dropdown'
            | 'val-collection'
            | 'val-career'
            | 'val-store'
            | 'val-bonus'
            | 'play'
            | 'plus'
            | 'import-export'
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
