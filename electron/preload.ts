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
window.exec = (command: string, noErrLog?: boolean) => {
    return new Promise((resolve) => {
        child_process.exec(command, (error, stdout) => {
            if (!noErrLog && error) console.error(error)
            resolve(error ? null : stdout)
        })
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
    ipcRenderer: ipcRenderer,
    fetch: (input: RequestInfo | URL, init?: RequestInit | undefined, output?: 'json' | 'text') => ipcRenderer.invoke('fetch', { input, init, output })
}

window.env = {
    LOCALAPPDATA: <string>process.env.LOCALAPPDATA
}
