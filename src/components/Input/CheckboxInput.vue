<template>
    <div class="checkbox-input" ref="input" :class="{ reverse, checked: checkbox, disabled }" @click="clickCheckbox">
        <input type="checkbox" v-model="checkbox" />
        <div class="input">
            <Icon v-if="checkbox" icon="check" size="15px"></Icon>
        </div>
        <div v-if="text" class="text">{{ text }}</div>
    </div>
</template>

<script lang="ts">
import Icon from '@/components/Misc/Icon.vue'

export default {
    name: 'CheckboxInput',
    components: { Icon },
    props: {
        text: String as () => string,
        input: Boolean as () => boolean,
        reverse: Boolean as () => boolean,
        disabled: Boolean as () => boolean
    },
    data() {
        return {
            checkbox: this.input || false
        }
    },
    methods: {
        clickCheckbox() {
            if (this.disabled) return

            this.checkbox = !this.checkbox
        }
    },
    watch: {
        checkbox(current, before) {
            this.$emit('update:input', current)
        },
        input(current, before) {
            this.checkbox = !!current
        }
    }
}
</script>

<style scoped>
.checkbox-input {
    --background-color: #1c1c1c;
    --checked-color: #81c784;
    --check-color: #eceff1;
    --font-color: #eceff1;

    display: flex;
    gap: 9px;

    height: 17px;
    padding: 6px 10px;
    border-radius: 6px;

    cursor: pointer;
    user-select: none;
    background-color: var(--background-color);
}
.checkbox-input:not(.reverse) {
    padding-left: 6px;
}
.checkbox-input.reverse {
    flex-direction: row-reverse;
    padding-right: 6px;
}
.checkbox-input.disabled {
    filter: opacity(0.666);
    pointer-events: none;
}
.checkbox-input.checked {
    outline-offset: -1px;
    outline: 1px solid var(--checked-color);
}
.checkbox-input > .text {
    color: var(--font-color);
    margin: 4px 0;
    font-size: 13px;
    line-height: 9px;
}
.checkbox-input > .input {
    width: 15px;
    height: 15px;

    color: var(--check-color);
    border: 1px solid var(--checked-color);
    border-radius: 6px;
}
.checkbox-input.checked > .input {
    background-color: var(--checked-color);
}
.checkbox-input > input {
    display: none;
}
</style>
