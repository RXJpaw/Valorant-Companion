import { cyrb53, HandleError, Store } from '@/scripts/methods'
import { EventEmitter } from 'events'
import path from 'path'

const fs = window.require('fs/promises') as typeof import('fs/promises')
const zl = HandleError(window.require, 'zip-lib') as typeof import('zip-lib')

let BackupInProcess = false
export const Backup = {
    AcceptedFormats: zl ? ['zip', 'dir'] : ['dir'],
    isBackupInProcess: () => BackupInProcess,
    exportIndexedDb(toDir: string, uncompressed?: boolean) {
        const Emitter = new EventEmitter()

        const StartTime = Date.now()
        const TempDirName = `.temp;rxjvmw;compress;${StartTime}`
        const execute = async () => {
            const BackupStore = {
                //ValorantMatch
                CompetitiveUpdates: {},
                MatchHistory: {},
                MatchDetails: {},

                //Valorant
                EncounterHistory: {},
                RiotIdHistory: {}
            }

            const KnownKeys: any[] = []
            let BackupLength = 0
            let BackupDone = 0

            for (const backupStoreKey in BackupStore) {
                const StoreToBackUp: LocalForage = Store[backupStoreKey]
                if (!StoreToBackUp.length) continue

                BackupLength += await StoreToBackUp.length()
            }

            await fs.mkdir(path.join(toDir, TempDirName), { recursive: true })
            Emitter.emit('progress', 0)

            for (const backupStoreKey in BackupStore) {
                const StoreToBackUp: LocalForage = Store[backupStoreKey]
                if (!StoreToBackUp.iterate) continue
                BackupStore[backupStoreKey] = {}

                const folderPath = path.join(toDir, TempDirName, backupStoreKey)
                await fs.mkdir(folderPath)

                for (const backupItemKey of await StoreToBackUp.keys()) {
                    const backupItemValue = await StoreToBackUp.getItem(backupItemKey)

                    const BackupValueChecksum = this.getChecksum(backupItemValue)
                    const BackupValueIntegrity = this.getIntegrity(backupItemValue, BackupValueChecksum)
                    const BackupObject = {
                        Integrity: BackupValueIntegrity,
                        Checksum: BackupValueChecksum,
                        Version: StartTime,
                        Data: backupItemValue
                    }

                    await fs.writeFile(path.join(toDir, TempDirName, backupStoreKey, backupItemKey), JSON.stringify(BackupObject))

                    BackupStore[backupStoreKey][backupItemKey] = BackupObject
                    KnownKeys.push(`${backupStoreKey}/${backupItemKey}`)
                    BackupDone++

                    Emitter.emit('progress', BackupDone / BackupLength)
                }
            }

            Emitter.emit('finalizing')

            //metadata file
            const MetadataData = KnownKeys.sort()
            const MetadataChecksum = this.getChecksum(MetadataData)
            const MetadataIntegrity = this.getIntegrity(MetadataData, MetadataChecksum)

            const MetadataObject = {
                Integrity: MetadataIntegrity,
                Checksum: MetadataChecksum,
                Version: StartTime,
                Data: MetadataData
            }

            await fs.writeFile(path.join(toDir, TempDirName, 'metadata'), JSON.stringify(MetadataObject))

            //finalizing
            const dateFormatted = new Date().toJSON().replace(/\W/g, '.').replace(/T/g, '_').replace(/Z/g, '')

            if (zl && !uncompressed) {
                await zl.archiveFolder(path.join(toDir, TempDirName), path.join(toDir, `rxjvmw-backup;${dateFormatted}.vcb`))
            } else {
                await fs.rename(path.join(toDir, TempDirName), path.join(toDir, `rxjvmw-backup;${dateFormatted}`))
            }

            console.debug('Backup/exportIndexedDb', `took ${Date.now() - StartTime}ms.`, BackupStore)
        }

        return {
            execute: () => {
                if (BackupInProcess) return { error: 'backup-in-process' }
                BackupInProcess = true

                execute()
                    .catch((e) => {
                        Emitter.emit('error', e)
                    })
                    .finally(async () => {
                        await fs.rm(path.join(toDir, TempDirName), { recursive: true, force: true }).catch(() => {})

                        BackupInProcess = false
                        Emitter.emit('end')
                    })
            },
            Client: Emitter
        }
    },
    importIndexedDb(fromPath: string, combine: boolean = false, test: boolean = false) {
        const fromDir = path.dirname(fromPath)
        const Emitter = new EventEmitter()

        const StartTime = Date.now()
        const TempDirName = `.temp;rxjvmw;decompress;${StartTime}`
        const execute = async () => {
            try {
                const fileStats = await fs.stat(fromPath)

                if (fileStats.isFile()) {
                    await zl.extract(fromPath, path.join(fromDir, TempDirName))
                } else {
                    await fs.cp(fromPath, path.join(fromDir, TempDirName), { recursive: true })
                }
            } catch (e) {
                throw { error: 'invalid-path' }
            }

            const BackupStore = {
                //ValorantMatch
                CompetitiveUpdates: {},
                MatchHistory: {},
                MatchDetails: {},

                //Valorant
                EncounterHistory: {},
                RiotIdHistory: {}
            }

            const KnownKeys: any[] = []
            let BackupLength = 0
            let BackupDone = 0

            const MetadataFile = await fs.readFile(path.join(fromDir, TempDirName, 'metadata'), 'utf-8').catch(() => {})
            if (!MetadataFile) throw { error: 'not-a-backup' }

            const Metadata = HandleError(JSON.parse, MetadataFile)
            if (!Metadata) throw { error: 'metadata-malformed' }

            //metadata validation
            if (!(Metadata['Data'] instanceof Array)) throw { error: { type: 'item', name: `metadata`, message: 'Metadata.Data is not an array.' } }
            if (typeof Metadata['Version'] !== 'number') throw { error: { type: 'item', name: `metadata`, message: 'Metadata.Version is not a number.' } }
            if (typeof Metadata['Checksum'] !== 'number') throw { error: { type: 'item', name: `metadata`, message: 'Metadata.Checksum is not a number.' } }
            if (typeof Metadata['Integrity'] !== 'number') throw { error: { type: 'item', name: `metadata`, message: 'Metadata.Integrity is not a number.' } }

            const MetadataChecksum = this.getChecksum(Metadata['Data'])
            if (MetadataChecksum !== Metadata['Checksum']) throw { error: { type: 'item', name: `metadata`, message: 'Metadata Checksum is manipulated.' } }

            const MetadataIntegrity = this.getIntegrity(Metadata['Data'], MetadataChecksum)
            if (MetadataIntegrity !== Metadata['Integrity']) throw { error: { type: 'item', name: `metadata`, message: 'Metadata Integrity is manipulated.' } }

            BackupLength = Metadata['Data'].length * (test ? 1 : 2)
            Emitter.emit('progress', 0)

            //constructing backup
            const DirentList = await fs.readdir(path.join(fromDir, TempDirName), { withFileTypes: true })
            for (const Dirent of DirentList) {
                if (Dirent.isFile() && Dirent.name === 'metadata') {
                    continue
                } else if (!Dirent.isDirectory()) {
                    throw { error: { type: 'dirent', name: Dirent.name, message: 'Dirent is neither a directory nor the metadata file.' } }
                }

                if (!BackupStore[Dirent.name]) {
                    throw { error: { type: 'dirent', name: Dirent.name, message: 'Dirent is not a listed directory.' } }
                }

                const ItemList = await fs.readdir(path.join(fromDir, TempDirName, Dirent.name), { withFileTypes: true })
                for (const Item of ItemList) {
                    if (!Item.isFile()) {
                        throw { error: { type: 'dirent/item', name: `${Dirent.name}/${Item.name}`, message: 'Item is not a file.' } }
                    }

                    const file = await fs.readFile(path.join(fromDir, TempDirName, Dirent.name, Item.name), 'utf-8').catch(() => {})
                    if (!file) {
                        throw { error: { type: 'dirent/item', name: `${Dirent.name}/${Item.name}`, message: 'Item is empty or got deleted.' } }
                    }

                    const backup = HandleError(JSON.parse, file)
                    if (!backup) {
                        throw { error: { type: 'dirent/item', name: `${Dirent.name}/${Item.name}`, message: 'Item is malformed.' } }
                    }

                    if (typeof backup['Data'] !== 'object') {
                        throw { error: { type: 'dirent/item', name: `${Dirent.name}/${Item.name}`, message: 'Item.Data is not an object.' } }
                    }
                    if (typeof backup['Version'] !== 'number') {
                        throw { error: { type: 'dirent/item', name: `${Dirent.name}/${Item.name}`, message: 'Item.Version is not a number.' } }
                    }
                    if (typeof backup['Checksum'] !== 'number') {
                        throw { error: { type: 'dirent/item', name: `${Dirent.name}/${Item.name}`, message: 'Item.Checksum is not a number.' } }
                    }
                    if (typeof backup['Integrity'] !== 'number') {
                        throw { error: { type: 'dirent/item', name: `${Dirent.name}/${Item.name}`, message: 'Item.Integrity is not a number.' } }
                    }

                    const BackupStoreChecksum = this.getChecksum(backup['Data'])
                    if (BackupStoreChecksum !== backup['Checksum']) {
                        throw { error: { type: 'dirent/item', name: `${Dirent.name}/${Item.name}`, message: 'Item Checksum is manipulated.' } }
                    }

                    const BackupStoreIntegrity = this.getIntegrity(backup['Data'], backup['Checksum'])
                    if (BackupStoreIntegrity !== backup['Integrity']) {
                        throw { error: { type: 'dirent/item', name: `${Dirent.name}/${Item.name}`, message: 'Item Integrity is manipulated.' } }
                    }

                    BackupDone++
                    Emitter.emit('progress', BackupDone / BackupLength)

                    BackupStore[Dirent.name][Item.name] = backup.Data
                    KnownKeys.push(`${Dirent.name}/${Item.name}`)
                }
            }

            Emitter.emit('finalizing')

            //backup validation
            if (Metadata['Data'].join(',') !== KnownKeys.sort().join(',')) {
                throw { error: { type: 'item', name: `metadata`, message: 'Backup manipulated.' } }
            }

            //finalizing
            if (!test) {
                for (const backupStoreKey in BackupStore) {
                    const StoreToRestore: LocalForage = Store[backupStoreKey]
                    if (!combine) await StoreToRestore.clear()

                    for (const backupItemKey in BackupStore[backupStoreKey]) {
                        await StoreToRestore.setItem(backupItemKey, BackupStore[backupStoreKey][backupItemKey])

                        BackupDone++
                        Emitter.emit('progress', BackupDone / BackupLength)
                    }
                }
            } else {
                console.debug('Backup/importIndexedDb', "Backup hasn't been applied, no data has changed.")
            }

            console.debug('Backup/importIndexedDb', `took ${Date.now() - StartTime}ms.`, BackupStore)
        }

        return {
            execute: () => {
                if (BackupInProcess) return { error: 'backup-in-process' }
                BackupInProcess = true

                execute()
                    .catch((e) => {
                        Emitter.emit('error', e)
                    })
                    .finally(async () => {
                        await fs.rm(path.join(fromDir, TempDirName), { recursive: true, force: true }).catch(() => {})

                        BackupInProcess = false
                        Emitter.emit('end')
                    })
            },
            Client: Emitter
        }
    },
    getChecksum: (Object: object) => Number((JSON.stringify(Object).length / 7).toFixed(8).replace('.', '').substring(0, 9)),
    getIntegrity: (Object: object, seed: number) => cyrb53(JSON.stringify(Object), seed)
}

window['test'] = Backup
