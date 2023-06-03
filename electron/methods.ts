import fsOriginal from 'original-fs'
import fs from 'fs/promises'
import path from 'path'
import fsSync from 'fs'

const packageFilePath = path.resolve(__dirname, '../package.json')
const updaterFilePath = path.resolve(__dirname, '../../UPDATER')
const versionFilePath = path.resolve(__dirname, '../../VERSION')

export const fileExists = (filePath: string): Promise<boolean> => {
    return new Promise((resolve) => {
        fsOriginal.stat(filePath, (err) => {
            resolve(!err)
        })
    })
}

export const getVersionAsarFileName = async (version) => {
    const versionAsarPath = path.resolve(__dirname, `../../${version}.asar`)
    const defaultAsarPath = path.resolve(__dirname, `../../app.asar`)

    const versionAsarExists = await fileExists(versionAsarPath)

    return versionAsarExists ? version : 'app'
}

export const getRepository = () => {
    const { repository } = JSON.parse(fsSync.readFileSync(packageFilePath, 'utf-8') || '{}')

    return repository
}
export const getAuthor = () => {
    const { author } = JSON.parse(fsSync.readFileSync(packageFilePath, 'utf-8') || '{}')

    return author
}
export const getVersions = async () => {
    const versionFileExists = await fileExists(versionFilePath)

    if (versionFileExists) {
        const version = (await fs.readFile(versionFilePath, 'utf-8')).split('\n')

        if (version[0] && version[1] && version[2] && version[3]) {
            return {
                lastCheckedMillis: Number(version[3]),
                lastUsedUpdater: version[2],
                asarFileName: await getVersionAsarFileName(version[1]),
                electron: version[0].replace(/[\t\n\r]+/gm, ''),
                project: version[1].replace(/[\t\n\r]+/gm, ''),
                source: 'version'
            }
        }
    }

    const packageJson = JSON.parse(await fs.readFile(packageFilePath, 'utf-8'))

    return {
        lastCheckedMillis: 0,
        lastUsedUpdater: 'none',
        asarFileName: await getVersionAsarFileName(packageJson['project_version']),
        electron: packageJson['electron_version'],
        project: packageJson['project_version'],
        source: 'package'
    }
}

export const getUpdater = async () => {
    const updaterFileExists = await fileExists(updaterFilePath)

    if (updaterFileExists) {
        const updater = (await fs.readFile(updaterFilePath, 'utf-8')).split('\n')

        if (updater[0] && updater[1]) {
            return {
                url: updater[0].replace(/[\t\n\r]+/gm, ''),
                key: updater[1].replace(/[\t\n\r]+/gm, ''),
                source: updater[0].match(/https:\/\/api\.github\.com\/repos\/.+\/releases\/latest/gm) ? 'github' : 'custom'
            }
        }
    }

    return {
        url: `https://api.github.com/repos/${getRepository()}/releases/latest`,
        key: String(Date.now()),
        source: 'github'
    }
}

export const getRevisionFromVersion = (versionString: string) => {
    return Array.from(versionString.matchAll(/.+\+rev.([0-9]+)/gm), (a) => a[1])[0]
}
