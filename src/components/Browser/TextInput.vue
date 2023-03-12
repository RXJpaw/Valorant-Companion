<template>
    <div class="text-input" ref="input" :class="{ focused, disabled }" :style="`width: ${width}`">
        <div class="outline-wrapper">
            <div class="outline"></div>
        </div>
        <input class="input" :type="type" :disabled="disabled" @focusin="focusIn(true)" @focusout="focusOut(true)" v-model="textField" spellcheck="false" />
        <div v-if="placeholder" class="placeholder-background">{{ placeholder }}</div>
        <div v-if="placeholder" class="placeholder">{{ placeholder }}</div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'TextInput',
    props: {
        type: String as () => string,
        width: String as () => string,
        input: String as () => string,
        placeholder: String as () => string,
        disabled: Boolean as () => boolean
    },
    data() {
        return {
            focused: false,
            humanFocused: false,
            textField: this.input || ''
        }
    },
    created() {
        this.focusOut()
    },
    watch: {
        textField(current, before) {
            this.$emit('update:input', current)
        },
        input(current, before) {
            this.textField = current || ''
            if (this.textField.length > 0) this.focusIn()
            if (this.textField.length < 1 && !this.humanFocused) this.focusOut()
        }
    },
    methods: {
        focusIn(isHuman?: boolean) {
            this.focused = true
            if (isHuman) this.humanFocused = true
        },
        focusOut(isHuman?: boolean) {
            this.focused = this.textField.length > 0
            if (isHuman) this.humanFocused = false
        }
    }
}
</script>

<style scoped>
.text-input {
    --placeholder-font-color: #737373;
    --background-color: #262626;
    --vibrant-color: #81c784;
    --font-color: #eceff1;

    position: relative;
    height: 33px;
    border-radius: 6px;

    transition: filter 0.075s ease-in-out;
}
.text-input.focused {
    --outline-width: 2px;
    --placeholder-top: -7px;
    --placeholder-left: 11px;
    --placeholder-font: 13px;
    --placeholder-color: var(--vibrant-color);
}
.text-input:not(.focused) {
    --outline: 0px;
    --placeholder-top: 7px;
    --placeholder-left: 12px;
    --placeholder-font: 16px;
    --placeholder-color: var(--placeholder-font-color);
}

.text-input.disabled {
    filter: opacity(0.666);
}
.text-input > .outline-wrapper {
    position: absolute;

    width: 100%;
    height: 100%;
    border-radius: 6px;

    overflow: hidden;
    pointer-events: none;
}
.text-input > .outline-wrapper > .outline {
    position: absolute;

    width: 100%;
    height: 100%;
    border-radius: 6px;

    outline: var(--outline-width) solid var(--vibrant-color);
    outline-offset: calc(0px - var(--outline-width));

    transition: outline 0.075s ease-in-out, outline-offset 0.075s ease-in-out;
    pointer-events: none;
}
.text-input > .input {
    width: calc(100% - 22px);
    height: 100%;
    padding: 0 11px;

    color: var(--font-color);
    font-size: 13px;

    border-radius: 6px;
    background-color: var(--background-color);
}

.text-input > .placeholder {
    position: absolute;
    top: var(--placeholder-top);
    left: var(--placeholder-left);

    color: var(--placeholder-color);
    font-size: var(--placeholder-font);

    transition: font-size 0.075s ease-in-out, top 0.075s ease-in-out, left 0.075s ease-in-out, color 0.075s ease-in-out;
    user-select: none;
    pointer-events: none;
}

.text-input > .placeholder-background {
    position: absolute;
    top: 0;
    left: 8px;

    color: transparent;
    font-size: 13px;

    height: 2px;
    padding: 0 3px;
    background-color: var(--background-color);

    user-select: none;
    pointer-events: none;
}

input {
    border: 0;
    outline: 0;
    padding: 0;
    background: transparent;
    font-family: inherit;
    color: inherit;
}
</style>
