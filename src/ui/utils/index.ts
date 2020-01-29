/** Resolves website favicon url using google's service */
export function getFavicon(url: string) {
    if (!url) return url
    return (
        "http://www.google.com/s2/favicons?domain_url=" +
        encodeURIComponent(url)
    )
}
