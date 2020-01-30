import qs from "query-string"

export function setHashParam(payload: Record<string, string>) {
    location.hash = encodeURIComponent(
        qs.stringify({
            ...qs.parse(decodeURIComponent(location.hash)),
            ...payload
        })
    )
}

/** Resolves website favicon url using google's service */
export function getFavicon(url: string) {
    if (!url) return url
    return (
        "http://www.google.com/s2/favicons?domain_url=" +
        encodeURIComponent(new URL(url).origin)
    )
}
