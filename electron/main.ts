// Modules to control application life and create native browser window

import { createProtocol, updateProtocolResourceName } from './createProtocol'
import { app, BrowserWindow, protocol, ipcMain, shell } from 'electron'
import { getVersions } from './methods'
import path from 'path'
import fs from 'fs'
import './updater'

app.commandLine.appendSwitch('ignore-certificate-errors')

const zoomFactor = 1
const isDevelopment = !app.isPackaged
const customProtocol = 'rxjvmw'
const serverHostname = isDevelopment ? 'http://localhost:8069' : `${customProtocol}://./index.html`
protocol.registerSchemesAsPrivileged([{ scheme: customProtocol, privileges: { secure: true, standard: true } }])

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'

async function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 720 * zoomFactor * (16 / 9),
        height: 720 * zoomFactor,
        minWidth: 720 * zoomFactor * (16 / 9),
        minHeight: 720 * zoomFactor,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            zoomFactor: zoomFactor,
            preload: path.join(__dirname, 'preload.js')
        },
        show: isDevelopment,
        frame: false
    })

    mainWindow.once('ready-to-show', () => {
        mainWindow.webContents.setZoomFactor(zoomFactor)
    })

    await mainWindow.loadURL(`${serverHostname}`, { userAgent: 'ShooterGame/13 Windows/10.0.19043.1.256.64bit' })

    return mainWindow
}

ipcMain.on('show', (event) => {
    BrowserWindow.fromWebContents(event.sender)!.show()
})
ipcMain.on('hide', (event) => {
    BrowserWindow.fromWebContents(event.sender)!.hide()
})
ipcMain.on('minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)!.minimize()
})
ipcMain.on('maximize', (event) => {
    const sender = BrowserWindow.fromWebContents(event.sender)!

    sender.isMaximized() ? sender.unmaximize() : sender.maximize()
})
ipcMain.on('close', (event) => {
    BrowserWindow.fromWebContents(event.sender)!.close()
    app.quit()
})
ipcMain.on('open-external', (event, args) => {
    shell.openExternal(args).then()
})

app.whenReady().then(async () => {
    const version = await getVersions()
    if (!isDevelopment) {
        createProtocol(customProtocol, version.asarFileName)
    }
    if (isDevelopment) {
        try {
            import('electron-devtools-installer').then((install) => {
                install.default('nhdogjmejiglipccpnnnanhbledajbpd')
            })
        } catch (e: any) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }

    const mainWindow = await createWindow()

    if (!isDevelopment) {
        await mainWindow.webContents.executeJavaScript(`console.debug('Using ${version.asarFileName}.asar')`)
    }

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

const asarExists = async (resourceName): Promise<boolean> => {
    const asarPath = path.resolve(__dirname, `../../${resourceName}.asar`)

    return new Promise((resolve) => {
        fs.stat(asarPath, (err) => {
            resolve(!err)
        })
    })
}
