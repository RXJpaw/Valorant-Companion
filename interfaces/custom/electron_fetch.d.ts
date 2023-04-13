interface ElectronFetch {
    ok: boolean
    url: string
    type: ResponseType
    headers: Headers
    redirected: boolean
    status: number
    statusText: string
    json?: any | null
    text?: string | null
}
