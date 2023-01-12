<template>
    <div class="not-ready">
        <div class="text">{{ text }}</div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'NotReady',
    props: {
        text: String as () => string
    },
    methods: {}
}
</script>

<style scoped>
.not-ready {
    display: flex;
    align-items: center;
    justify-content: center;

    position: absolute;
    top: 50%;
    left: 50%;

    transform: translate(-50%, -50%);
    padding: 8px;

    border: 0 solid;
    border-radius: 6px;

    background-color: #121314;
}
.not-ready .text {
    font-size: 16px;
    line-height: 16px;
    color: #faa81a;
}
</style>
