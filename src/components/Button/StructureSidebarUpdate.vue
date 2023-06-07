<template>
    <div v-if="updateInfo.hasNewVersion && updateInfo.autoUpdatable" class="update">
        <div v-if="updateProgress === null && updateApplicable === null" class="button" @click.once="downloadUpdate">
            <div class="text">Download Update {{ updateInfo.latest }}</div>
        </div>
        <div v-if="updateProgress !== null && updateApplicable === null" class="button">
            <div class="text">{{ (updateProgress.progress * 100).toFixed(1) }}%</div>
        </div>
        <div v-if="updateProgress !== null && updateApplicable !== null" class="button" @click.once="applyUpdate">
            <div class="text">Apply Update {{ updateInfo.latest }}</div>
        </div>
        <div v-if="updateProgress" class="download-progress" :style="`width: ${Math.round(updateProgress.progress * 162)}px`"></div>
    </div>

    <div v-else-if="updateInfo.hasNewVersion && !updateInfo.autoUpdatable" class="update">
        <div class="button" @click="openLatestDownload">
            <div class="text">External Update {{ updateInfo.latest }}</div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'StructureSidebarUpdate',
    data() {
        return {
            updateInfo: {} as any,
            updateProgress: null as null | any,
            updateApplicable: null
        }
    },
    beforeCreate() {
        window.electron.ipcRenderer.on('update-info', (event, data) => {
            this.updateInfo = data
        })

        window.electron.ipcRenderer.on('update-download-progress', (event, data) => {
            this.updateProgress = data
        })

        window.electron.ipcRenderer.on('update-download-finished', (event, data) => {
            this.updateApplicable = true
        })
    },
    methods: {
        openLatestDownload() {
            if (this.updateInfo.download) {
                window.electron.openExternal(this.updateInfo.download)
            }
        },
        downloadUpdate() {
            if (this.updateInfo.autoUpdatable) {
                window.electron.ipcRenderer.send('download-update')
            }
        },
        applyUpdate() {
            if (this.updateApplicable) {
                window.electron.hide()
                window.electron.ipcRenderer.send('apply-update')
            }
        }
    }
}
</script>

<style scoped>
.update {
    display: flex;
    justify-content: center;
}
.update > .button {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0 16px;
    height: 16px;
    width: 130px;

    border: 0 solid;
    border-radius: 6px;
    background-color: #2d7d46;

    cursor: pointer;
}
.update > .download-progress {
    z-index: 100;

    position: absolute;

    display: flex;
    align-items: center;
    justify-content: center;

    height: 16px;

    border: 0 solid;
    border-radius: 6px;
    background-color: #225e34;

    cursor: context-menu;
}
.update > .button > .text {
    z-index: 200;

    color: #ffffff;
    font-size: 12px;
    line-height: 12px;
}
</style>
