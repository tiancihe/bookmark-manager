import qs from "query-string"

import { HashParams } from "../types"

export function getHashParams() {
    return qs.parse(decodeURIComponent(location.hash)) as HashParams
}

export function setHashParam(payload: HashParams) {
    location.hash = encodeURIComponent(
        qs.stringify({
            ...getHashParams(),
            ...payload,
        }),
    )
}
