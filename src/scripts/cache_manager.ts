import { getValueForKeyPath, sleep } from '@/scripts/methods'
import localForage from 'localforage'

const LocalCache = {}
const Store = {
    PersistentCache: localForage.createInstance({ name: 'PersistentCache', storeName: 'Cache' })
}

interface PersistentCacheOptions {
    details?: boolean
    seconds_path?: string
    milliseconds_path?: string
    milliseconds?: number | null
    delay?: number | null
    force?: boolean
}

export const CacheTime = 30 * 60 * 1000

const Cache = {
    get: async (key, set_function?: () => any, options: PersistentCacheOptions = {}) => {
        if (!options.force && LocalCache[key]) {
            const Cache = await LocalCache[key]
            if (Date.now() - Cache.Version < (Cache.Milliseconds || CacheTime)) return options.details ? await Cache : Cache.Data
        }

        LocalCache[key] = new Promise(async (resolve) => {
            const Cache = (await Store.PersistentCache.getItem(key)) as any

            if (!options.force && Cache && Date.now() - Cache.Version < (Cache.Milliseconds || CacheTime)) {
                return resolve(Cache)
            }

            if (set_function) {
                if (options.delay) await sleep(options.delay)

                const function_result = await set_function()

                //Get the time to cache from the object itself.
                const seconds_path = options.seconds_path ? getValueForKeyPath(function_result, options.seconds_path) : null
                const milliseconds_path = options.milliseconds_path ? getValueForKeyPath(function_result, options.milliseconds_path) : null

                const Milliseconds = Number(seconds_path) * 1000 || Number(milliseconds_path) || options.milliseconds

                const store_result = await Store.PersistentCache.setItem(key, {
                    Data: function_result,
                    Version: Date.now(),
                    Milliseconds: Milliseconds || null
                })

                return resolve(store_result)
            } else {
                return resolve(null)
            }
        })

        return options.details ? await LocalCache[key] : (await LocalCache[key])?.Data
    },
    set: async (key, data, options: PersistentCacheOptions = {}) => {
        LocalCache[key] = Store.PersistentCache.setItem(key, {
            Data: data,
            Version: Date.now(),
            Milliseconds: options.milliseconds || null
        })

        return options.details ? await LocalCache[key] : (await LocalCache[key])?.Data
    },
    delete: async (key) => {
        delete LocalCache[key]
        await Store.PersistentCache.removeItem(key)
    },
    delete_expired: async () => {
        console.time('[cache]')

        const keys = await Store.PersistentCache.keys()
        let delete_count = 0

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const cache = (await Store.PersistentCache.getItem(key)) as any

            if (Date.now() - cache?.Version > (cache?.Milliseconds || CacheTime)) {
                delete LocalCache[key]
                await Store.PersistentCache.removeItem(key)
                delete_count++
            }
        }

        console.timeEnd('[cache]')
    }
}

export default Cache
