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
    <svg v-else-if="icon === 'locked'" :style="getStyle()" viewBox="0 0 17.75 28.76" fill="currentColor">
        <path
            d="m15.87,10.42v-4.16C15.87,2.02,12.83-.02,8.88,0,4.92-.02,1.89,2.02,1.89,6.25v4.16H0v13.04l8.88,5.31,8.88-5.31v-13.04h-1.89Zm-5.24,10.71v2.33h-3.49v-2.33c-1.1-.62-1.86-1.78-1.86-3.14,0-1.99,1.61-3.61,3.61-3.61s3.61,1.61,3.61,3.61c0,1.35-.76,2.52-1.86,3.14Zm2.12-10.71h-7.74v-4.16s.14-3.01,3.87-3.01,3.87,3.01,3.87,3.01v4.16Z"
        />
    </svg>
    <svg v-else-if="icon === 'star-outline'" :style="getStyle()" viewBox="0 0 24 24">
        <path
            d="M22 9.24l-7.19-.62L12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21L12 17.27L18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27l1-4.28l-3.32-2.88l4.38-.38L12 6.1l1.71 4.04l4.38.38l-3.32 2.88l1 4.28L12 15.4z"
            fill="currentColor"
        ></path>
    </svg>
    <svg v-else-if="icon === 'star'" :style="getStyle()" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21z" fill="currentColor"></path>
    </svg>
    <svg v-else-if="icon === 'report'" :style="getStyle()" viewBox="0 0 24 24">
        <path
            d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3s.58-1.3 1.3-1.3s1.3.58 1.3 1.3s-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"
            fill="currentColor"
        ></path>
    </svg>
    <svg v-else-if="icon === 'key_off'" :style="getStyle()" viewBox="0 0 24 24">
        <path
            d="M16.91 14.09L17 14l2 2l4-4.04L21 10h-8.17l4.08 4.09zM3.98 6.81A6.012 6.012 0 0 0 1 12c0 3.31 2.69 6 6 6c2.21 0 4.15-1.2 5.18-2.99l7.59 7.59l1.41-1.41L2.81 2.81L1.39 4.22l2.59 2.59zm5.93 5.93A3.015 3.015 0 0 1 7 15c-1.65 0-3-1.35-3-3c0-1.4.97-2.58 2.26-2.91l3.65 3.65z"
            fill="currentColor"
        ></path>
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
            | 'locked'
            | 'star-outline'
            | 'star'
            | 'report'
            | 'key_off'
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
