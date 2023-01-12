declare interface Window {
    isRunning(pid: number): boolean
    WebSocket: typeof import('ws')
    electron: {
        show(): void
        hide(): void
        close(): void
        minimize(): void
        maximize(): void
        openExternal(url: string): void
        ipcRenderer: Electron.IpcRenderer
    }
    env: {
        LOCALAPPDATA: string
    }
}
