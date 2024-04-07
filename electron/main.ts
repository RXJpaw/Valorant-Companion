//Handling Squirrel Startup
const { app } = require('electron')
if (require('electron-squirrel-startup')) app.quit()

// Modules to control application life and create native browser window
import { BrowserWindow, protocol, ipcMain, shell, globalShortcut, dialog, Menu, Tray } from 'electron'
import { createProtocol, updateProtocolResourceName } from './createProtocol'
import { setTimeout as sleep } from 'timers/promises'
import { getVersions } from './methods'
import path from 'path'
import fs from 'fs'
import './updater'

app.commandLine.appendSwitch('high-dpi-support', '1')
app.commandLine.appendSwitch('force-device-scale-factor', '1')
app.commandLine.appendSwitch('ignore-certificate-errors')

const zoomFactor = 1
const isDevelopment = !app.isPackaged
const customProtocol = 'rxjvmw'
const serverHostname = isDevelopment ? 'http://localhost:8069' : `${customProtocol}://./index.html`
protocol.registerSchemesAsPrivileged([{ scheme: customProtocol, privileges: { secure: true, standard: true } }])

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'

let mainWindow = null as never as BrowserWindow
let trayWindow = null as never as BrowserWindow
let trayIcon = null as never as Tray

async function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 720 * zoomFactor * (16 / 9),
        height: 720 * zoomFactor,
        minWidth: 720 * zoomFactor * (16 / 9),
        minHeight: 720 * zoomFactor,
        maxHeight: 720 * zoomFactor,
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

    // trayWindow = new BrowserWindow({
    //     width: 200,
    //     height: 300,
    //     skipTaskbar: true,
    //     autoHideMenuBar: true,
    //     webPreferences: {},
    //     show: false,
    //     frame: false
    // })
    //
    // trayWindow.on('blur', () => {
    //     trayWindow.hide()
    // })
    //
    // trayIcon = new Tray(path.resolve(__dirname, '../public/favicon.ico'))
    // trayIcon.setToolTip('Valorant Companion')
    //
    // trayIcon.on('click', async (event, bounds) => {
    //     await sleep(50)
    //
    //     const WindowSize = trayWindow.getSize()
    //
    //     trayWindow.setPosition(bounds.x - WindowSize[0] + bounds.width, bounds.y - WindowSize[1])
    //     trayWindow.show()
    // })

    //TODO: after updating electron to 21.3.5, Ctrl+R would stop working
    mainWindow.on('blur', () => {
        globalShortcut.unregister('CommandOrControl+R')
    })
    mainWindow.on('focus', () => {
        globalShortcut.register('CommandOrControl+R', () => mainWindow.webContents.executeJavaScript('location.reload()'))
    })
    mainWindow.once('ready-to-show', () => {
        mainWindow.webContents.setZoomFactor(zoomFactor)
    })

    await mainWindow.loadURL(`${serverHostname}`, { userAgent: 'ShooterGame/13 Windows/10.0.19043.1.256.64bit' })

    return mainWindow
}

function restoreMainWindow() {
    if (!mainWindow) return

    if (!mainWindow.isVisible()) mainWindow.show()
    if (mainWindow.isMaximized()) mainWindow.restore()
    if (!mainWindow.isFocused()) mainWindow.focus()
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
ipcMain.handle('show-open-dialog', async (event, args) => {
    return dialog.showOpenDialog(args)
})
ipcMain.handle('show-save-dialog', async (event, args) => {
    return dialog.showSaveDialog(args)
})
ipcMain.handle('get-path', (event, args) => {
    //'home' | 'appData' | 'userData' | 'sessionData' | 'temp' | 'exe' | 'module' | 'desktop' |
    //'documents' | 'downloads' | 'music' | 'pictures' | 'videos' | 'recent' | 'logs' | 'crashDumps'
    return app.getPath(args)
})
ipcMain.handle('fetch', async (event, args) => {
    const response = await fetch(args.input, args.init)
    const headers = {}

    response.headers.forEach((value, key) => {
        if (headers[key]) {
            headers[key] += '; ' + value
        } else {
            headers[key] = value
        }
    })

    return {
        ok: response.ok,
        url: response.url,
        type: response.type,
        headers: headers,
        redirected: response.redirected,
        status: response.status,
        statusText: response.statusText,
        json: args.output === 'json' ? await response.json().catch(() => null) : undefined,
        text: args.output === 'text' ? await response.text().catch(() => null) : undefined
    }
})

const SingleInstanceLock = app.requestSingleInstanceLock()
if (!SingleInstanceLock) {
    app.quit()
} else {
    app.on('second-instance', () => {
        restoreMainWindow()
    })

    app.whenReady().then(async () => {
        const version = await getVersions()
        if (!isDevelopment) {
            createProtocol(customProtocol, version.asarFileName)
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
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    app.quit()
})

app.on('will-quit', () => {
    globalShortcut.unregisterAll()
    // trayIcon.destroy()
})

const asarExists = async (resourceName): Promise<boolean> => {
    const asarPath = path.resolve(__dirname, `../../${resourceName}.asar`)

    return new Promise((resolve) => {
        fs.stat(asarPath, (err) => {
            resolve(!err)
        })
    })
}
