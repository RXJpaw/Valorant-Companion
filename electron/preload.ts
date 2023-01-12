import { ipcRenderer } from 'electron'
import WebSocket from 'ws'

window.isRunning = (pid) => {
    try {
        return process.kill(pid, 0)
    } catch {
        return false
    }
}
window.WebSocket = WebSocket as any

window.electron = {
    show: () => ipcRenderer.send('show'),
    hide: () => ipcRenderer.send('hide'),
    close: () => ipcRenderer.send('close'),
    minimize: () => ipcRenderer.send('minimize'),
    maximize: () => ipcRenderer.send('maximize'),
    openExternal: (url) => ipcRenderer.send('open-external', url),
    ipcRenderer: ipcRenderer
}

window.env = {
    LOCALAPPDATA: <string>process.env.LOCALAPPDATA
}
