<template>
    <div class="button" ref="button" :class="{ disabled }">
        <div class="text">{{ text }}</div>
        <div class="background-animation"></div>
        <div class="background"></div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'Button',
    props: {
        text: String as () => string,
        disabled: Boolean as () => boolean
    }
}
</script>

<style scoped>
.button {
    --button-color: #43a047;
    --font-color: #eceff1;

    position: relative;

    width: fit-content;
    height: 29px;
    border-radius: 6px;

    background-color: var(--button-color);

    cursor: pointer;
    transition: filter 0.075s ease-in-out;
}

.button.disabled {
    filter: opacity(0.666);
    pointer-events: none;
}

.button > .text {
    font-size: 13px;
    padding: 7px 14px;
    color: var(--font-color);

    user-select: none;
    pointer-events: none;
}
</style>
