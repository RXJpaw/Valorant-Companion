<template>
    <div class="tab" :class="[isActive() ? 'active' : null, isCloseable() ? 'closeable' : null].join(' ')">
        <div class="icon" :style="`--bgi: url('${tabs[index].Icon}')`"></div>

        <div class="switch" @click=";[(active = index), (groupActive = this.groupName)]">
            <div class="text">{{ text }}</div>
        </div>
        <div v-if="isCloseable()" class="close" @click=";[(active = 0), tabs.splice(index, 1)]">
            <Icon icon="close" size="14" />
        </div>
    </div>
</template>

<script lang="ts">
import Icon from '@/components/Misc/Icon.vue'

export default {
    name: 'StructureSidebarTab',
    components: { Icon },
    props: {
        active: Number,
        tabs: Array,

        groupName: String,
        groupActive: String,
        index: Number,
        text: String
    },
    watch: {
        active(data, from) {
            this.$emit('update:active', data)
        },
        tabs(data, from) {
            this.$emit('update:tabs', data)
        },
        groupActive(data, from) {
            this.$emit('update:group-active', data)
        }
    },
    methods: {
        isActive() {
            if (this.groupName !== this.groupActive) return
            return this.index === this.active
        },
        isCloseable() {
            return this.index !== 0
        }
    }
}
</script>

<style scoped>
.tab {
    display: flex;
}

.tab > .switch {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    margin-bottom: 5px;
    margin-left: 5px;
    height: 18px;
    width: 153px;

    border: 0 solid;
    border-radius: 6px;
    background-color: #18191c;

    cursor: pointer;
}
.tab.closeable > .switch {
    width: 130px;
}
/* transition start */
.tab > .switch {
    transition: background-color ease-in-out 0.05s;
}
.tab.active > .switch {
    background-color: #121314;
}
/* transition end */
.tab > .switch > .text {
    font-size: 12px;
    line-height: 12px;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    margin-left: 5px;
    margin-right: 10px;
}

.tab > .icon {
    margin-bottom: 5px;
    margin-left: 40px;

    border: 0 solid;
    border-radius: 6px;

    background-image: var(--bgi);
    background-size: cover;
    width: 18px;
    height: 18px;
}

.tab > .close {
    width: 18px;
    height: 18px;

    margin-bottom: 5px;
    margin-left: 5px;

    border: 0 solid;
    border-radius: 6px;

    background-color: #18191c;

    cursor: pointer;
}
/* transition start */
.tab > .close {
    transition: background-color ease-in-out 0.05s;
}
.tab > .close:hover {
    background-color: #ed4245;
}
/* transition end */
.tab > .close > svg {
    margin: 2px;
}
</style>
