<template>
    <div v-if="loaded" class="update-server">
        <TextInput
            class="update-server-url-field"
            title="Update Server URL"
            autocomplete="none"
            v-model:input="update_server.url"
            :width="596"
            type="text"
        ></TextInput>
        <TextInput
            class="update-server-key-field"
            title="Update Server Key"
            autocomplete="password"
            v-model:input="update_server.key"
            :width="596"
            type="password"
        ></TextInput>
        <Button class="test-button" text="Test" text-color="#ffffff" button-color="#448aff" animation-color="#2962ff" :disabled="testing" @click="test" />
        <Button class="apply-button" text="Apply" text-color="#ffffff" button-color="#448aff" animation-color="#2962ff" :disabled="!tested" @click="apply" />
    </div>
</template>

<script lang="ts">
import TextInput from '@/components/Browser/TextInput.vue'
import Button from '@/components/Browser/Button.vue'
import { sleep } from '@/scripts/methods'

export default {
    name: 'UpdateServer',
    components: { TextInput, Button },
    data() {
        return {
            loaded: false,
            update_server: {
                url: '',
                key: ''
            },
            testing: false,
            tested: false
        }
    },
    async created() {
        await this.setUpdaterSource()
        this.loaded = true
    },
    methods: {
        async setUpdaterSource() {
            const result = await window.electron.ipcRenderer.invoke('get-updater-source')

            this.update_server.url = result.url
            this.update_server.key = result.key
        },
        async test() {
            this.testing = true

            const source = this.update_server.url.match(/https:\/\/api\.github\.com\/repos\/.+\/releases\/latest/gm) ? 'github' : 'custom'
            const response = await fetch(`${this.update_server.url}?key=${this.update_server.key}`)
            if (!response.ok) return (this.testing = false)

            try {
                const json = await response.json()
                if (source === 'github') {
                    if (!json.tag_name || !json.name || !json.assets.find((a) => a.name === 'update.bin')) return (this.testing = false)

                    this.testing = false
                    this.tested = true
                } else {
                    if (!json.electron || !json.project || !json.asarURL || !json.download) return (this.testing = false)

                    this.testing = false
                    this.tested = true
                }
            } finally {
                this.testing = false
            }

            this.testing = false
        },
        async apply() {
            if (!this.tested) return
            this.testing = true
            this.tested = false

            window.electron.ipcRenderer.send('change-updater-source', {
                url: this.update_server.url,
                key: this.update_server.key
            })

            await sleep(500)
            await this.setUpdaterSource()

            this.testing = false
        }
    }
}
</script>

<style scoped>
.update-server {
}

.update-server > .test-button {
    position: absolute;
    right: 111px;
    bottom: 320px;
}
.update-server > .apply-button {
    position: absolute;
    right: 22px;
    bottom: 320px;
}

.update-server > .update-server-url-field {
    position: absolute;
    left: 22px;
    top: 22px;

    transition: transform 250ms ease-in-out;
}
.update-server > .update-server-key-field {
    position: absolute;
    left: 22px;
    top: 96px;

    transition: transform 250ms ease-in-out;
}
</style>
