import { updateProtocolResourceName } from './createProtocol'
import { setTimeout as sleep } from 'node:timers/promises'
import httpAxios from 'axios/lib/adapters/http'
import { ipcMain, app, shell } from 'electron'
import { getVersions } from './get_versions'
import fs from 'fs/promises'
import axios from 'axios'
import path from 'path'

axios.defaults.adapter = httpAxios

const isDevelopment = !app.isPackaged
const autoUpdateApiKey = '_wTD96W1-OGNYPG3mQzYJzibJqnudiDt'
const autoUpdateService = 'https://api.rxj.pw/MDQ6VXNlcjQ1Nzg0NTI5/RE_kwDOHUDTc84EM5-K/version'
const autoUpdateExternal = 'https://github.com/RXJpaw'

const fallbackExternal = (url?) => shell.openExternal(url || autoUpdateExternal)

ipcMain.once('show', async (event) => {
    if (isDevelopment) return
    if (!autoUpdateApiKey) return

    while (1) {
        await checkForUpdate(event.sender)
        await sleep(120000)
    }
})
ipcMain.on('download-update', async (event) => {
    if (isDevelopment) return
    if (!autoUpdateApiKey) return

    await downloadUpdate(event.sender)
})
ipcMain.on('apply-update', async (event) => {
    if (isDevelopment) return
    if (!autoUpdateApiKey) return

    await applyUpdate(event.sender)
})

const checkForUpdate = async (Sender: Electron.WebContents) => {
    const version = await getVersions()
    const request = await axios.get(`${autoUpdateService}?key=${autoUpdateApiKey}`)
    const latest = request.data
    if (request.status !== 200) return fallbackExternal()

    const updatePayload = {
        autoUpdatable: latest.electron === version.electron,
        hasNewVersion: latest.project !== version.project,
        download: latest.download,
        latest: latest.project
    }

    Sender.send('update-info', updatePayload)
}

const downloadUpdate = async (Sender: Electron.WebContents) => {
    Sender.send('update-download-progress', { progress: 0 })

    const version = await getVersions()
    const request = await axios.get(`${autoUpdateService}?key=${autoUpdateApiKey}`)
    const latest = request.data
    if (request.status !== 200) return fallbackExternal()
    if (latest.electron !== version.electron) return fallbackExternal(latest.download)

    const latestAsarPath = path.resolve(__dirname, `../../${latest.project}.asar`)
    const asarDownload = await axios.get(latest.asarURL, { responseType: 'stream' })
    if (asarDownload.status !== 200) return fallbackExternal(latest.download)

    let asarBuffers = [] as any[]
    let asarBuffersLength = 0
    asarDownload.data.on('data', (data) => {
        asarBuffers.push(data)
        asarBuffersLength += data.length

        Sender.send('update-download-progress', { progress: asarBuffersLength / Number(asarDownload.headers['content-length']) })
    })

    asarDownload.data.on('end', async () => {
        const asarBuffer = Buffer.concat(asarBuffers)
        await fs.writeFile(latestAsarPath, asarBuffer)

        const versionPath = path.resolve(__dirname, `../../VERSION`)
        await fs.writeFile(versionPath, `${latest.electron}\n${latest.project}`)

        Sender.send('update-download-finished')
    })
}

const applyUpdate = async (Sender: Electron.WebContents) => {
    const version = await getVersions()

    updateProtocolResourceName('rxjvmw', version.asarFileName)

    Sender.reload()
}
