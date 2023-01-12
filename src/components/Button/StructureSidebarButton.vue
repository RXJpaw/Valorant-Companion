<template>
    <div class="button" :class="active === name ? 'active' : null" @click="$emit('update:active', name)">
        <div class="text">{{ text }}</div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'StructureSidebarButton',
    props: {
        name: String as () => string,
        active: String as () => string,
        text: String as () => string
    }
}
</script>

<style scoped>
.button {
    display: flex;
    align-items: center;
    justify-content: center;

    margin: 0 22px 5px;
    height: 32px;

    border: 0 solid;
    border-radius: 6px;
    background-color: #18191c;

    cursor: pointer;
}
/* transition start */
.button {
    transition: background-color ease-in-out 0.05s;
}
.button.active {
    background-color: #121314;
}
/* transition end */
.button > .text {
    font-size: 16px;
    line-height: 16px;
}
</style>
