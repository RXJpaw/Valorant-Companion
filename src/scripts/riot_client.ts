import { BufferSplit, Cryptr, fsSync, getJwtPayload, getPath, HandleError, HexSplit, Store } from '@/scripts/methods'
import PersistentCache from '@/scripts/cache_manager'
import * as ValorantAPI from '@/scripts/valorant_api'

const fs = window.require('fs/promises') as typeof import('fs/promises')

const Cache = {
    accessToken: {} as { [subject: string]: Promise<RiotTokenWrapper> | undefined },
    entitlementsToken: {} as { [subject: string]: Promise<RiotTokenWrapper> | undefined }
}
export const RiotRegEx = {
    tdid: /(name: "tdid"[^]*?value: ")(.*)(")/,
    ssid: /(name: "ssid"[^]*?value: ")(.*)(")/,
    clid: /(name: "clid"[^]*?value: ")(.*)(")/,
    csid: /(name: "csid"[^]*?value: ")(.*)(")/,
    sub: /(name: "sub"[^]*?value: ")(.*)(")/
}

export const RiotClient = (subject?: string) => {
    const Servers = {}

    const setSubject = (newSubject: string) => {
        subject = newSubject
    }
    const request = async (method: string, server: 'geo' | 'auth' | 'pd' | 'glz' | 'shared' | 'test', path?: string, body?: any) => {
        if (!subject) throw { error: 'no_subject_set' }

        if (Object.keys(Servers).length < 3) {
            const { Servers: CachedServers } = (await Store.AccountDetails.getItem(subject)) || {}

            Servers['shared'] = CachedServers?.shared
            Servers['glz'] = CachedServers?.glz
            Servers['pd'] = CachedServers?.pd
        }

        const Versions = await ValorantAPI.getVersions()
        const DateNow = Date.now()

        const CachedAccessToken = await Cache.accessToken[subject]
        if (!CachedAccessToken || CachedAccessToken.exp - DateNow / 1000 <= 30) {
            Cache.accessToken[subject] = new Promise(async (resolve, reject) => {
                if (!subject) throw { error: 'no_subject_set' }

                const CachedAccessToken: RiotTokenWrapper | null = await Store.RiotAccessToken.getItem(subject)
                if (CachedAccessToken && CachedAccessToken?.exp - DateNow / 1000 > 30) return resolve(CachedAccessToken)

                const AccessToken = await getAccessToken().catch((error) => error)
                if (AccessToken.error) return reject({ error: AccessToken.error })

                await Store.RiotAccessToken.setItem(subject, AccessToken)
                console.debug('[riot-client] generated new access token for ' + subject.substring(0, 7))

                resolve(AccessToken)
            })
        }

        const AccessToken = await Cache.accessToken[subject]
        if (!AccessToken) throw { error: 'access_token_uncaught' }

        const CachedEntitlementsToken = await Cache.entitlementsToken[subject]
        if (!CachedEntitlementsToken || CachedEntitlementsToken.exp - DateNow / 1000 <= 30) {
            Cache.entitlementsToken[subject] = new Promise(async (resolve, reject) => {
                if (!subject) throw { error: 'no_subject_set' }

                const CachedEntitlementsToken: RiotTokenWrapper | null = await Store.RiotEntitlementToken.getItem(subject)
                if (CachedEntitlementsToken && CachedEntitlementsToken?.exp - DateNow / 1000 > 30) return resolve(CachedEntitlementsToken)

                const EntitlementsToken = await getEntitlementsToken(AccessToken).catch((error) => error)
                if (EntitlementsToken.error) return reject({ error: EntitlementsToken.error })

                await Store.RiotEntitlementToken.setItem(subject, EntitlementsToken)
                console.debug('[riot-client] generated new entitlements token for ' + subject.substring(0, 7))

                resolve(EntitlementsToken)
            })
        }

        const EntitlementsToken = await Cache.entitlementsToken[subject]
        if (!EntitlementsToken) throw { error: 'entitlements_token_uncaught' }

        let requestURL: string

        switch (server) {
            case 'geo': {
                requestURL = `https://riot-geo.pas.si.riotgames.com`
                break
            }
            case 'auth': {
                requestURL = `https://auth.riotgames.com`
                break
            }
            case 'pd': {
                requestURL = Servers['pd']
                break
            }
            case 'glz': {
                requestURL = Servers['glz']
                break
            }
            case 'shared': {
                requestURL = Servers['shared']
                break
            }
            case 'test': {
                return true
            }
        }

        const headers = {
            'X-Riot-ClientVersion': Versions.riotClientVersion,
            'X-Riot-Entitlements-JWT': EntitlementsToken.token,
            Authorization: `Bearer ${AccessToken.token}`
        }

        const request = await fetch(requestURL + path, {
            method: method.toUpperCase(),
            headers: headers,
            body: JSON.stringify(body)
        })

        return request.headers.get('content-length') === '0' ? {} : await request.json()
    }

    const getCookies = async () => {
        if (!subject) throw { error: 'no_subject_set' }

        const PrivateSettingsPath = await getPath('riot-private-settings', subject).catch(() => null)
        const PrivateSettings = await fs.readFile(PrivateSettingsPath, 'utf-8').catch(() => null)
        if (!PrivateSettings) throw { error: 'login_private_settings_not_found' }

        const ClidMatch = PrivateSettings.match(RiotRegEx.clid)
        const CLID = ClidMatch?.[2]
        if (!CLID) throw { error: 'not_stay_sign_in', detail: 'clid' }
        const CsidMatch = PrivateSettings.match(RiotRegEx.csid)
        const CSID = CsidMatch?.[2]
        if (!CSID) throw { error: 'not_stay_sign_in', detail: 'csid' }
        const SsidMatch = PrivateSettings.match(RiotRegEx.ssid)
        const SSID = SsidMatch?.[2]
        if (!SSID) throw { error: 'not_stay_sign_in', detail: 'ssid' }
        const TdidMatch = PrivateSettings.match(RiotRegEx.tdid)
        const TDID = TdidMatch?.[2]
        if (!TDID) throw { error: 'not_stay_sign_in', detail: 'tdid' }
        const SubMatch = PrivateSettings.match(RiotRegEx.sub)
        const SUB = SubMatch?.[2]
        if (!SUB) throw { error: 'not_stay_sign_in', detail: 'sub' }

        return `clid=${CLID};csid=${CSID};ssid=${SSID};tdid=${TDID};sub=${SUB};`
    }

    const renewPrivateSettings = async (set_cookie_header: string): Promise<boolean | null> => {
        const CookiesRegEx = /(tdid|ssid|clid|sub|csid)=(.*?);/g
        const CookiesMatch = set_cookie_header.match(CookiesRegEx)
        if (!CookiesMatch) throw { error: 'cookies_not_found' }

        const Cookies = {} as { clid: string; csid: string; ssid: string; sub: string; tdid: string }
        const CookiesSplitRegEx = /(tdid|ssid|clid|sub|csid)=(.*?);/
        for (const Cookie of CookiesMatch) {
            const Match = Cookie.match(CookiesSplitRegEx)
            if (!Match) throw { error: 'value_not_found' }

            Cookies[Match[1]] = Match[2]
        }

        const SortedCookieNames = ['clid', 'csid', 'ssid', 'sub', 'tdid']
        if (Object.keys(Cookies).sort().join(',') !== SortedCookieNames.join(',')) throw { error: 'not_enough_cookies' }

        const PrivateSettingsPath = await getPath('riot-private-settings', Cookies.sub).catch(() => null)
        const PrivateSettings = await fs.readFile(PrivateSettingsPath, 'utf-8').catch(() => null)
        if (!PrivateSettings) throw { error: 'login_private_settings_not_found' }

        const NewPrivateSettings = PrivateSettings
            //Nuzzles your necky wecky, hah, you're a furry now!
            .replace(RiotRegEx.clid, `$1${Cookies.clid}$3`)
            .replace(RiotRegEx.csid, `$1${Cookies.csid}$3`)
            .replace(RiotRegEx.ssid, `$1${Cookies.ssid}$3`)
            .replace(RiotRegEx.tdid, `$1${Cookies.tdid}$3`)

        await fs.writeFile(PrivateSettingsPath, Buffer.from(NewPrivateSettings, 'utf-8'))

        return true
    }

    const getAccessToken = async (): Promise<RiotTokenWrapper> => {
        if (!subject) throw { error: 'no_subject_set' }

        const Cookies = await getCookies()
        const Response = await window.electron.fetch(
            'https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&scope=account%20openid&nonce=1',
            { headers: { Cookie: Cookies }, redirect: 'manual' },
            'text'
        )

        const RenewalSucceeded = await renewPrivateSettings(Response.headers['set-cookie']).catch((error) => error)
        if (RenewalSucceeded !== true) console.debug('[riot-client] Cookie renewal failed:', RenewalSucceeded)

        const AccessTokenRegExp = /https:\/\/playvalorant\.com\/opt_in#access_token=([\w.-]*)/
        const AccessTokenMatch = Response.headers.location?.match(AccessTokenRegExp)
        const AccessToken = AccessTokenMatch?.[1]
        if (!AccessToken) throw { error: 'access_token_not_found' }

        const Data: RiotAccessTokenWithError = await getJwtPayload(AccessToken)

        return {
            iat: Data.iat,
            exp: Data.exp,
            shard: Data.pp.c,
            token: AccessToken,
            subject: Data.sub
        }
    }
    const getEntitlementsToken = async (access_token: RiotTokenWrapper): Promise<RiotTokenWrapper> => {
        const Response = await fetch('https://entitlements.auth.riotgames.com/api/token/v1', {
            method: 'POST',
            headers: { Authorization: `Bearer ${access_token.token}`, 'Content-Type': 'application/json' },
            credentials: 'same-origin'
        })
        if (!Response.ok) throw { error: 'entitlements_not_ok' }

        const Entitlements = await Response.json().catch(() => null)
        if (!Entitlements) throw { error: 'entitlements_not_found' }
        const EntitlementsToken = Entitlements.entitlements_token
        if (!EntitlementsToken) throw { error: 'entitlements_malformed' }

        const Data: RiotEntitlementsToken = await getJwtPayload(EntitlementsToken)

        return {
            iat: Data.iat,
            exp: access_token.exp,
            shard: access_token.shard,
            token: EntitlementsToken,
            subject: Data.sub
        }
    }

    const getStorefront = async (force?: boolean): Promise<ValorantStoreStorefront> => {
        const Storefront: ValorantStoreStorefront = await PersistentCache.get(
            `storefront_${subject}`,
            () => request('get', 'pd', `/store/v2/storefront/${subject}`),
            { force }
        )

        if (Storefront.BonusStore) {
            await Store.AccountSwitcherSettings.setItem('night.market', Date.now() + Storefront.BonusStore.BonusStoreRemainingDurationInSeconds * 1000)
        }

        return Storefront
    }
    const getStorefontOffers = async (force?: boolean) => {
        const StorefrontOffers = async () => {
            const Storefront = await getStorefront(force)
            return Storefront.SkinsPanelLayout
        }

        const seconds_path = 'SingleItemOffersRemainingDurationInSeconds'
        const cache = await PersistentCache.get(`storefront-offers_${subject}`, () => StorefrontOffers(), { force, seconds_path, details: true })

        return {
            Items: cache.Data.SingleItemStoreOffers as ValorantStoreStorefront.SkinsPanelLayoutSingleItemStoreOffers[],
            Reset: cache.Version + cache.Milliseconds
        }
    }
    const getStorefontBonus = async (force?: boolean) => {
        const StorefrontBonus = async () => {
            const Storefront = await getStorefront(force)
            return Storefront.BonusStore
        }

        const seconds_path = 'BonusStoreRemainingDurationInSeconds'
        const cache = await PersistentCache.get(`storefront-bonus_${subject}`, () => StorefrontBonus(), { force, seconds_path, details: true })

        return {
            Items: cache.Data?.BonusStoreOffers as ValorantStoreStorefront.BonusStoreBonusStoreOffers[],
            Reset: cache.Version + cache.Milliseconds
        }
    }

    const exportRAC = async (filePath: string, key: string) => {
        if (!subject) throw { error: 'no_subject_set' }

        const AccountDetails = await Store.AccountDetails.getItem(subject)
        if (!AccountDetails) throw { error: 'account_details_not_found' }

        const PrivateSettingsPath = await getPath('riot-private-settings', subject)
        const ClientSettingsPath = await getPath('riot-client-settings', subject)
        const CookiesPath = await getPath('riot-cookies', subject)

        const cipher = new Cryptr('rac://root:' + key + '@nuzzles.your/necky/wecky')

        const PrivateSettings = await fs.readFile(PrivateSettingsPath, 'utf16le').catch(() => null)
        if (!PrivateSettings) throw { error: 'private_settings_not_found' }
        const ClientSettings = await fs.readFile(ClientSettingsPath, 'utf16le').catch(() => null)
        if (!ClientSettings) throw { error: 'client_settings_not_found' }
        const Cookies = await fs.readFile(CookiesPath, 'utf16le').catch(() => null)
        if (!Cookies) throw { error: 'cookies_not_found' }

        const EncryptedAccountDetails = Buffer.from(cipher.encrypt(JSON.stringify(AccountDetails)), 'hex')
        const EncryptedPrivateSettings = Buffer.from(cipher.encrypt(PrivateSettings), 'hex')
        const EncryptedClientSettings = Buffer.from(cipher.encrypt(ClientSettings), 'hex')
        const EncryptedCookies = Buffer.from(cipher.encrypt(Cookies), 'hex')
        const EncryptedSubject = Buffer.from(cipher.encrypt(subject), 'hex')

        const writeStream = fsSync.createWriteStream(filePath)
        writeStream.write('Riot Account Credentials format 1   ')
        writeStream.write(EncryptedSubject)
        writeStream.write(BufferSplit)
        writeStream.write(EncryptedAccountDetails)
        writeStream.write(BufferSplit)
        writeStream.write(EncryptedPrivateSettings)
        writeStream.write(BufferSplit)
        writeStream.write(EncryptedClientSettings)
        writeStream.write(BufferSplit)
        writeStream.write(EncryptedCookies)

        await new Promise((resolve) => writeStream.close(resolve))

        return true
    }
    const importRAC = async (filePath: string, key: string) => {
        const cipher = new Cryptr('rac://root:' + key + '@nuzzles.your/necky/wecky')

        const readStream = fsSync.createReadStream(filePath)
        await new Promise((resolve) => readStream.on('readable', resolve))

        const header = Buffer.from(readStream.read(36)).toString('utf-8')
        if (header !== 'Riot Account Credentials format 1   ') throw { error: 'file_header_mismatch' }

        const Data = Buffer.from(readStream.read()).toString('hex').split(HexSplit)
        await new Promise((resolve) => readStream.close(resolve))

        const Subject = cipher.decrypt(Data[0])
        const AccountDetails = Buffer.from(cipher.decrypt(Data[1]), 'utf-8')
        const PrivateSettings = Buffer.from(cipher.decrypt(Data[2]), 'utf16le')
        const ClientSettings = Buffer.from(cipher.decrypt(Data[3]), 'utf16le')
        const Cookies = Buffer.from(cipher.decrypt(Data[4]), 'utf16le')

        const LoginsFolderPath = await getPath('account-logins', Subject)
        await fs.mkdir(LoginsFolderPath, { recursive: true })

        const PrivateSettingsPath = await getPath('riot-private-settings', Subject)
        const ClientSettingsPath = await getPath('riot-client-settings', Subject)
        const CookiesPath = await getPath('riot-cookies', Subject)

        await fs.writeFile(PrivateSettingsPath, PrivateSettings)
        await fs.writeFile(ClientSettingsPath, ClientSettings)
        await fs.writeFile(CookiesPath, Cookies)

        const AccountDetailsObject = HandleError(JSON.parse, AccountDetails.toString())
        if (!AccountDetailsObject) throw { error: 'malformed_account_details' }

        return { Subject, AccountDetails: AccountDetailsObject }
    }

    const testRAC = async (filePath?: string) => {
        if (!filePath) return false

        const stat = await fs.stat(filePath)
        if (!stat.isFile()) return false

        const readStream = fsSync.createReadStream(filePath)
        await new Promise((resolve) => readStream.on('readable', resolve))

        const header = Buffer.from(readStream.read(36)).toString('utf-8')
        await new Promise((resolve) => readStream.close(resolve))

        return header === 'Riot Account Credentials format 1   '
    }

    return {
        setSubject,
        raw: request,
        getCookies,
        getAccessToken,
        getEntitlementsToken,

        getStorefront,
        getStorefontBonus,
        getStorefontOffers,

        exportRAC,
        importRAC,
        testRAC
    }
}

window['RiotClient'] = RiotClient
