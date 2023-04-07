import * as child_process from 'child_process'
import { ipcRenderer } from 'electron'
import WebSocket from 'ws'

window.isRunning = (pid: number) => {
    try {
        return process.kill(pid, 0)
    } catch {
        return false
    }
}
window.taskkill = (task: string, pid?: boolean) => {
    return new Promise((resolve) => {
        const command = 'taskkill /F ' + (pid ? '/PID ' : '/IM ') + task + ' /T'
        child_process.exec(command, (error) => resolve(!error))
    })
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
