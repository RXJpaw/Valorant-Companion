declare interface Window {
    isRunning(pid: number): boolean
    taskkill(task: string, pid?: boolean): Promise<boolean>
    exec(command: string, noErrLog?: boolean): Promise<null | string>
    WebSocket: typeof import('ws')
    electron: {
        show(): void
        hide(): void
        close(): void
        minimize(): void
        maximize(): void
        openExternal(url: string): void
        ipcRenderer: Electron.IpcRenderer
        fetch(input: RequestInfo | URL, init?: RequestInit | undefined, output?: 'json' | 'text'): Promise<ElectronFetch>
    }
    env: {
        LOCALAPPDATA: string
    }
}
