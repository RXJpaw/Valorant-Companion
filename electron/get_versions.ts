import fsSync from 'original-fs'
import fs from 'fs/promises'
import path from 'path'

export const getVersionAsarFileName = async (version) => {
    const versionAsarPath = path.resolve(__dirname, `../../${version}.asar`)
    const defaultAsarPath = path.resolve(__dirname, `../../app.asar`)

    const versionAsarExists = await new Promise((resolve) => {
        fsSync.stat(versionAsarPath, (err) => {
            resolve(!err)
        })
    })

    return versionAsarExists ? version : 'app'
}

export const getVersions = async () => {
    const versionFilePath = path.resolve(__dirname, '../../VERSION')
    const packageFilePath = path.resolve(__dirname, '../package.json')

    const versionFileExists = await new Promise((resolve) => {
        fsSync.stat(versionFilePath, (err) => {
            resolve(!err)
        })
    })

    if (versionFileExists) {
        const version = (await fs.readFile(versionFilePath, 'utf-8')).split('\n')

        if (version[0] && version[1]) {
            return {
                asarFileName: await getVersionAsarFileName(version[1]),
                electron: version[0].replace(/[\t\n\r]+/gm, ''),
                project: version[1].replace(/[\t\n\r]+/gm, ''),
                source: 'version'
            }
        }
    }

    const packageJson = JSON.parse(await fs.readFile(packageFilePath, 'utf-8'))

    return {
        asarFileName: await getVersionAsarFileName(packageJson['project_version']),
        electron: packageJson['electron_version'],
        project: packageJson['project_version'],
        source: 'package'
    }
}
