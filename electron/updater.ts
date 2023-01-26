import { getRevisionFromVersion, getUpdater, getVersions } from './methods'
import { updateProtocolResourceName } from './createProtocol'
import { setTimeout as sleep } from 'node:timers/promises'
import httpAxios from 'axios/lib/adapters/http'
import { ipcMain, app, shell } from 'electron'
import fs from 'fs/promises'
import axios from 'axios'
import path from 'path'

axios.defaults.adapter = httpAxios

const isDevelopment = !app.isPackaged
const autoUpdateExternal = 'https://github.com/RXJpaw'

const fallbackExternal = (url?) => shell.openExternal(url || autoUpdateExternal)

ipcMain.once('show', async (event) => {
    if (isDevelopment) return

    while (1) {
        await checkForUpdate(event.sender)
        await sleep(300000)
    }
})
ipcMain.on('download-update', async (event) => {
    if (isDevelopment) return

    await downloadUpdate(event.sender)
})
ipcMain.on('apply-update', async (event) => {
    if (isDevelopment) return

    await applyUpdate(event.sender)
})

const checkForUpdate = async (Sender: Electron.WebContents) => {
    const version = await getVersions()
    //Hardcoded Rate-Limit of 3 minutes to avoid GitHub/external service rate limitations
    if (Date.now() - version.lastCheckedMillis < 180000) return

    const updater = await getUpdater()

    const request = await axios.get(`${updater.url}?key=${updater.key}`)
    if (request.status !== 200) return /*fallbackExternal()*/
    const latest = request.data

    let backupDownload
    let electron
    let project

    if (updater.source === 'github') {
        backupDownload = 'https://github.com/RXJpaw/Valorant-Companion'
        electron = getRevisionFromVersion(latest.name)
        project = latest.tag_name
    } else {
        backupDownload = latest.download
        electron = latest.electron
        project = latest.project
    }

    if (!electron) return /*fallbackExternal()*/

    const versionPath = path.resolve(__dirname, `../../VERSION`)
    await fs.writeFile(versionPath, `${version.electron}\n${version.project}\n${version.lastUsedUpdater}\n${Date.now()}`)

    const updatePayload = {
        autoUpdatable: electron === version.electron,
        hasNewVersion: project !== version.project,
        download: backupDownload,
        latest: project
    }

    Sender.send('update-info', updatePayload)
}

const downloadUpdate = async (Sender: Electron.WebContents) => {
    Sender.send('update-download-progress', { progress: 0 })

    const version = await getVersions()
    const updater = await getUpdater()
    const request = await axios.get(`${updater.url}?key=${updater.key}`)
    if (request.status !== 200) return fallbackExternal()
    const latest = request.data

    let electron
    let project
    let asarURL

    if (updater.source === 'github') {
        electron = getRevisionFromVersion(latest.name)
        project = latest.tag_name
        asarURL = latest.assets.find((a) => a.name === 'update.bin')?.browser_download_url
    } else {
        electron = latest.electron
        project = latest.project
        asarURL = latest.asarURL
    }

    if (electron !== version.electron || !asarURL) return fallbackExternal(latest.download)

    const latestAsarPath = path.resolve(__dirname, `../../${project}.asar`)
    const asarDownload = await axios.get(asarURL, { responseType: 'stream' })
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
        await fs.writeFile(versionPath, `${electron}\n${project}\n${updater.source}\n${Date.now()}`)

        Sender.send('update-download-finished')
    })
}

const applyUpdate = async (Sender: Electron.WebContents) => {
    const version = await getVersions()

    updateProtocolResourceName('rxjvmw', version.asarFileName)

    Sender.reload()
}
