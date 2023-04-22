declare module RiotAccessToken {
    export interface Pp {
        c: string
    }
    export interface Dat {
        c: string
        lid: string
    }
}
interface RiotAccessToken {
    pp: RiotAccessToken.Pp
    sub: string
    scp: string[]
    clm: string[]
    dat: RiotAccessToken.Dat
    iss: string
    exp: number
    iat: number
    jti: string
    cid: string
}

interface RiotAccessTokenWithError extends RiotAccessToken {
    error: string
}
