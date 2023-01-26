<template>
    <div class="input-field" :class="disabled ? 'disabled' : ''">
        <input
            ref="input"
            :type="type"
            :autocomplete="autocomplete"
            :class="input.length > 0 ? 'not-empty' : ''"
            :readonly="disabled"
            v-model="input"
            :style="`width: ${width || 304}px`"
        />
        <div class="title">{{ title }}</div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'TextInput',
    data() {
        return {
            text: ''
        }
    },
    props: {
        disabled: Boolean as () => boolean,
        title: String as () => string,
        input: String as () => string,
        autocomplete: String as () => string,
        type: String as () => string,
        width: Number as () => number
    },
    mounted() {
        const EmailInput = this.$refs['input']
        this.text = this.input ?? ''

        EmailInput.addEventListener('input', this.InputListener)
    },
    beforeUnmount() {
        const EmailInput = this.$refs['input']

        EmailInput.removeEventListener('input', this.InputListener)
    },
    methods: {
        InputListener(event: Event) {
            this.text = this.GetInputValue()
            this.$emit('update:input', this.text)
        },
        GetInputValue() {
            const EmailInput = this.$refs['input']
            return EmailInput.value?.length > 0 ? EmailInput.value : ''
        }
    }
}
</script>

<style scoped>
.input-field {
    position: absolute;
    transition: opacity 150ms ease-in-out;
}
.input-field.disabled {
    filter: grayscale(1) opacity(0.5);
    pointer-events: none;
}

.input-field > .title {
    position: absolute;
    top: 16px;
    left: 9px;

    color: #ffffff;
    padding: 0 7px;
    font-size: 17px;
    border-radius: 6px;
    background-color: #2f3136;

    pointer-events: none;
    user-select: none;
    transition: font-size 0.1s ease-in-out, top 0.1s ease-in-out, left 0.1s ease-in-out, color 0.05s ease-in-out;
}

.input-field > input {
    height: 28px;
    padding: 12px 16px;
    font-size: 17px;

    color: #ffffff;
    outline: 1px solid #ffffff;
    outline-offset: 0;
    border-radius: 6px;

    background-image: linear-gradient(0, #2f3136, #2f3136);

    transition: outline 0.05s ease-in-out, outline-offset 0.05s ease-in-out;
}
.input-field > input:is(:focus-visible) {
    outline: 2px solid #82b1ff;
    outline-offset: -1px;
}
.input-field > input:is(:focus-visible, .not-empty) ~ .title {
    top: -7px;
    left: 7px;
    font-size: 12px;
}
.input-field > input:focus-visible ~ .title {
    color: #82b1ff;
}
</style>
