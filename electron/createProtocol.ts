import { protocol, dialog } from 'electron'
import { readFile } from 'fs'
import * as path from 'path'
import { URL } from 'url'

const asarFileName = {}

export const updateProtocolResourceName = (scheme: string, resourceName: string = 'app') => {
    asarFileName[scheme] = resourceName
}

export const createProtocol = (scheme: string, resourceName: string = 'app', customProtocol?: Electron.Protocol): string => {
    asarFileName[scheme] = resourceName
    ;(customProtocol || protocol).registerBufferProtocol(scheme, (request, respond) => {
        const pathName = decodeURI(new URL(request.url).pathname)
        const asarPath = path.resolve(__dirname, `../../${asarFileName[scheme]}.asar`)

        readFile(path.join(asarPath, pathName), (_, data) => {
            const extension = path.extname(pathName).toLowerCase()
            let mimeType = ''

            if (extension === '.js') {
                mimeType = 'text/javascript'
            } else if (extension === '.html') {
                mimeType = 'text/html'
            } else if (extension === '.css') {
                mimeType = 'text/css'
            } else if (extension === '.svg' || extension === '.svgz') {
                mimeType = 'image/svg+xml'
            } else if (extension === '.json') {
                mimeType = 'application/json'
            } else if (extension === '.wasm') {
                mimeType = 'application/wasm'
            }

            respond({ mimeType, data })
        })
    })

    return scheme
}
