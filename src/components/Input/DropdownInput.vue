<template>
    <div class="dropdown-input" :class="{ disabled, selected: index !== null }" ref="input" :style="`width: ${width}`">
        <div v-if="placeholder && index === null" class="placeholder">{{ placeholder }}</div>
        <div v-else-if="index !== null" class="placeholder">{{ input[index] }}</div>
        <div v-if="index !== null" class="unselect ignore-mouse-input" @click="unselectItem()">
            <Icon icon="close" size="21px" style="pointer-events: none" />
        </div>
        <div v-else class="unselect">
            <Icon icon="dropdown" size="21px" style="pointer-events: none" />
        </div>
        <transition>
            <div v-if="open && !disabled" class="dropdown" ref="dropdown">
                <div
                    v-for="(item, index) in input"
                    class="item"
                    :class="{ hover: hoverOverItem === index }"
                    @mouseenter="hoverOverItem = index"
                    @mouseleave="hoverOverItem = null"
                >
                    <div class="name" @click="selectItem(index)">{{ item }}</div>
                    <div v-if="modifiable" class="remove" @click="deleteItem(index)">
                        <Icon icon="delete" size="21px" />
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { HandleMouseOnElement } from '@/scripts/methods'
import Icon from '@/components/Misc/Icon.vue'

export default {
    name: 'DropdownInput',
    components: { Icon },
    props: {
        width: String as () => string,
        input: Array as () => any[],
        index: Number as () => number | null,
        placeholder: String as () => string,
        disabled: Boolean as () => boolean,
        modifiable: Boolean as () => boolean
    },
    data() {
        return {
            open: false,
            hoverOverInput: false,
            hoverOverItem: null as number | null
        }
    },
    watch: {
        disabled(current) {
            if (current) this.open = false
        },
        input: {
            handler(current) {
                if (!current?.length) this.disableActive()
            },
            deep: true
        }
    },
    created() {
        window.addEventListener('mousedown', this.MouseDownListener)
        window.addEventListener('mousemove', this.MouseOverListener)
    },
    beforeUnmount() {
        window.removeEventListener('mousedown', this.MouseDownListener)
        window.removeEventListener('mousemove', this.MouseOverListener)
    },
    methods: {
        enableActive() {
            if (!this.input?.length) return
            this.open = true
        },
        disableActive() {
            this.open = false
        },
        deleteItem(index: number) {
            if (this.index > index) {
                this.selectItem(this.index - 1)
            } else if (this.index === index) {
                this.unselectItem()
            }

            const spliced = this.input.splice(index, 1)
            this.$emit('update:input', this.input)
            this.$emit('splice', spliced)
        },
        MouseDownListener(event) {
            if (this.disabled) return

            const inputHandle = HandleMouseOnElement(this.$refs.input, event)
            if (inputHandle === null) return
            if (inputHandle) return this.open ? this.disableActive() : this.enableActive()

            const dropdownHandle = HandleMouseOnElement(this.$refs.dropdown, event)
            if (dropdownHandle === null) return
            if (!dropdownHandle) return this.disableActive()
        },
        MouseOverListener(event: MouseEvent) {
            if (this.input === null) return
            if (this.disabled) return

            const handle = HandleMouseOnElement(this.$refs.input, event)
            if (handle === null) return
            if (!handle) return (this.hoverOverInput = false)
            if (handle) return (this.hoverOverInput = true)
        },
        selectItem(index: number) {
            this.open = false
            this.$emit('update:index', index)
            this.hoverOverItem = null
        },
        unselectItem() {
            this.open = false
            this.$emit('update:index', null)
        }
    }
}
</script>

<style scoped>
.dropdown-input > .dropdown:is(.v-enter-from, .v-leave-to) {
    margin-top: 0;
    opacity: 0;
}
.dropdown-input > .dropdown {
    transition: opacity 0.15s ease-in-out, margin-top 0.15s ease-in-out;
}

.dropdown-input {
    --vibrant-color: #81c784;

    position: relative;

    height: 33px;
    border-radius: 6px;
    background-color: #1c1c1c;
}
.dropdown-input.disabled {
    filter: opacity(0.666);
    pointer-events: none;
}
.dropdown-input > .placeholder {
    position: absolute;
    top: 7px;
    left: 12px;

    color: #737373;
    font-size: 16px;

    user-select: none;
    pointer-events: none;
}
.dropdown-input > .unselect {
    position: absolute;
    right: 0;

    margin: 6px;
    height: 21px;
    width: 21px;
    color: #737373;

    cursor: pointer;
}
.dropdown-input > .dropdown {
    overflow: auto;

    position: absolute;
    top: 100%;

    display: flex;
    flex-direction: column;

    width: calc(100% - 4px);
    max-height: 155px;
    margin-top: 5px;
    border-radius: 6px;

    border: 2px solid var(--vibrant-color);
    background-color: #1c1c1c;
}
.dropdown-input > .dropdown > .item {
    display: flex;
    justify-content: space-between;

    user-select: none;
    background-color: #1c1c1c;

    transition: background-color 0.15s ease-in-out;
}
.dropdown-input > .dropdown > .item.hover {
    background-color: #2a2a2a;
}
.dropdown-input > .dropdown > .item > .name {
    color: #737373;

    padding: 10px;
    width: var(--webkit-fill-available);

    font-size: 16px;
    text-align: left;
    line-height: 11px;

    transition: color 0.15s ease-in-out;
}
.dropdown-input > .dropdown > .item.hover > .name {
    color: #a5a5a5;
}
.dropdown-input > .dropdown > .item > .remove {
    color: #e33935;

    margin: 5px;
    height: 19px;
    width: 19px;

    cursor: pointer;

    opacity: 0;
    transition: opacity 0.15s ease-in-out;
}
.dropdown-input > .dropdown > .item.hover > .remove {
    opacity: 1;
}

.dropdown-input > .dropdown::-webkit-scrollbar {
    width: 11px;
    height: 11px;
}
.dropdown-input > .dropdown::-webkit-scrollbar-thumb {
    border: 3px solid #1c1c1c;
    background-color: #121212;
    border-radius: 10px;
}
.dropdown-input > .dropdown::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: 10px;
}
</style>
