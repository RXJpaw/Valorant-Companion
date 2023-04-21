interface ElectronFetch {
    ok: boolean
    url: string
    type: ResponseType
    headers: { [header: string]: string }
    redirected: boolean
    status: number
    statusText: string
    json?: any | null
    text?: string | null
}
