const path = window.require('path') as typeof import('path')
const fs = window.require('fs') as typeof import('fs')

export const LogFilePath = path.join(window.env.LOCALAPPDATA, 'VALORANT', 'Saved', 'Logs', 'ShooterGame.log')
export const AuthFilePath = path.join(window.env.LOCALAPPDATA, 'Riot Games', 'Riot Client', 'Config', 'lockfile')

export const getLogFileData = function () {
    const LogFileExists = fs.existsSync(LogFilePath)
    if (!LogFileExists) return null

    let version
    let glzServer
    let pdServer
    let sharedServer

    const LogFileRaw = fs.readFileSync(LogFilePath, 'utf-8')
    const LogFileLines = LogFileRaw.split(/\r?\n/)

    const isReadyLine = LogFileLines.find((line) => line.includes('Status is now: Initialized'))
    const isClosedLine = LogFileLines.find((line) => line.includes('Telemetry worker stopped. Flushing unfinished tasks.'))
    if (!isReadyLine || isClosedLine) return null

    const versionLine = LogFileLines.find((line) => line.includes('CI server version:')) || ''
    version = versionLine.split('CI server version: ')[1].trim()
    version = version.split('-')
    version = `${version[0]}-${version[1]}-shipping-${version[2]}-${version[3]}`

    const glzServerLine = LogFileLines.find((line) => line.includes('https://glz-') && line.includes('.a.pvp.net/')) || ''
    glzServer = glzServerLine.match(/https:\/\/glz-.*?\.a\.pvp\.net/)?.[0]

    const pdServerLine = LogFileLines.find((line) => line.includes('https://pd.') && line.includes('.a.pvp.net/')) || ''
    pdServer = pdServerLine.match(/https:\/\/pd\..*?\.a\.pvp\.net/)?.[0]

    const sharedServerLine = LogFileLines.find((line) => line.includes('https://shared.') && line.includes('.a.pvp.net/')) || ''
    sharedServer = sharedServerLine.match(/https:\/\/shared\..*?\.a\.pvp\.net/)?.[0]

    //one of the parameters will be an empty string when the specified log segment couldn't be found.
    //this will most likely be the case when valorant decides on changing how the log works.
    if (!version || !glzServer || !pdServer || !sharedServer) return null

    return { version, glzServer, pdServer, sharedServer }
}

export const getAuthFileData = function () {
    const LockFileExists = fs.existsSync(AuthFilePath)
    if (!LockFileExists) return null

    const LockFile = fs.readFileSync(AuthFilePath, { encoding: 'utf-8' })
    const LockFileJson = LockFile.split(':')

    return {
        client: LockFileJson[0],
        PID: LockFileJson[1],
        port: LockFileJson[2],
        key: LockFileJson[3],
        protocol: LockFileJson[4],
        basic: Buffer.from(`riot:${LockFileJson[3]}`).toString('base64')
    }
}

export const fetchHelp = async function (port, basic) {
    const requestURL = `https://127.0.0.1:${port}`
    const request = await fetch(`${requestURL}/help`, {
        method: 'GET',
        headers: {
            Authorization: `Basic ${basic}`
        }
    })

    return await request.json()
}

export const fetchGameAuthData = async function (port, basic) {
    const requestURL = `https://127.0.0.1:${port}`
    const request = await fetch(`${requestURL}/entitlements/v2/token`, {
        method: 'GET',
        headers: {
            Authorization: `Basic ${basic}`
        }
    })

    const requestJSON = await request.json()
    const accessTokenJWT = JSON.parse(Buffer.from(requestJSON.authorization.accessToken.token.split('.')[1], 'base64').toString('utf-8'))

    return {
        requestURL: requestURL,
        platform: Buffer.from(
            JSON.stringify({
                platformType: 'PC',
                platformOS: 'Windows',
                platformOSVersion: '10.0.19044.1.256.64bit',
                platformChipset: 'Unknown'
            })
        ).toString('base64'),
        accessToken: requestJSON.authorization.accessToken.token,
        entitlements: requestJSON.entitlements,
        issuer: requestJSON.issuer,
        subject: requestJSON.subject,
        token: requestJSON.token,
        exp: Number(accessTokenJWT.exp) * 1000,
        iat: Number(accessTokenJWT.iat) * 1000
    }
}

export const getHeaders = function (entitlements, version) {
    return {
        Authorization: `Bearer ${entitlements.accessToken}`,
        'X-Riot-Entitlements-JWT': entitlements.token,
        'X-Riot-ClientPlatform': entitlements.platform,
        'X-Riot-ClientVersion': version,
        'User-Agent': 'ShooterGame/13 Windows/10.0.19043.1.256.64bit'
    }
}

export const FistBumpBuddyUUID = 'ad508aeb-44b7-46bf-f923-959267483e78'

export const DivisionOrder = {
    UNRANKED: 0,
    IRON: 100,
    BRONZE: 200,
    SILVER: 300,
    GOLD: 400,
    PLATINUM: 500,
    DIAMOND: 600,
    ASCENDANT: 700,
    IMMORTAL: 800,
    RADIANT: 900
}
