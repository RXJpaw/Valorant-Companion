<template>
    <div :class="[name + '-flex', result]" ref="wrapper">
        <div :class="name" ref="text" @change="console.log">
            {{ text }}
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'AbsoluteCenterHelper',
    props: {
        name: String as () => string,
        text: [Number, String] as never as () => string | number
    },
    data() {
        return {
            resize_observer: null as ResizeObserver | null,
            result: 'even-width'
        }
    },
    mounted() {
        this.resize_observer = new ResizeObserver(([entry]) => this.TextResize(entry))
        this.resize_observer.observe(this.$refs.text)
    },
    beforeUnmount() {
        if (!this.resize_observer) return

        this.resize_observer.disconnect()
    },
    methods: {
        TextResize(entry: ResizeObserverEntry) {
            const Element = entry.target

            //Element.clientWidth is not the real client width
            const ClientRect = Element.getBoundingClientRect()
            const ClientWidthOdd = Math.ceil(ClientRect.width) % 2 === 1 || Math.round(ClientRect.width) % 2 === 1

            this.result = ClientWidthOdd ? 'odd-width' : 'even-width'
        }
    }
}
</script>
