import { sleep } from '@/scripts/methods'
import localForage from 'localforage'
import { hrtime } from 'process'

const Store = {
    PersistentCache: localForage.createInstance({ name: 'PersistentCache', storeName: 'Cache' })
}

interface PersistentCacheOptions {
    delay?: number | null
    force?: boolean
}

const Cache = {
    get: async (key, set_function?: () => any, options: PersistentCacheOptions = {}) => {
        const cache = (await Store.PersistentCache.getItem(key)) as any

        if (!options.force && cache) {
            if (Date.now() - cache.Version < 30 * 60 * 1000) {
                return cache?.Data
            }
        }

        if (set_function) {
            if (options.delay) await sleep(options.delay)

            const function_result = await set_function()
            await Store.PersistentCache.setItem(key, {
                Data: function_result,
                Version: Date.now()
            })

            return function_result
        } else {
            return null
        }
    },
    set: async (key, data) => {
        const cache = await Store.PersistentCache.setItem(key, {
            Data: data,
            Version: Date.now()
        })

        return cache?.Data
    },
    delete: async (key) => {
        await Store.PersistentCache.removeItem(key)
    },
    delete_expired: async () => {
        console.time('[cache]')

        const keys = await Store.PersistentCache.keys()
        let delete_count = 0

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const cache = (await Store.PersistentCache.getItem(key)) as any

            if (Date.now() - cache?.Version > 30 * 60 * 1000) {
                await Store.PersistentCache.removeItem(key)
                delete_count++
            }
        }

        console.timeEnd('[cache]')
    }
}

export default Cache
