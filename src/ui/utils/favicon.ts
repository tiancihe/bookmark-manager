/** Resolves website favicon url using google's service */
export function getFavicon(url: string) {
    if (!url) return url
    if (__CHROME__) {
        /** @see https://developer.chrome.com/docs/extensions/how-to/ui/favicons */
        const _url = new URL(chrome.runtime.getURL("/_favicon/"))
        _url.searchParams.set("pageUrl", url)
        _url.searchParams.set("size", "32")
        return _url.toString()
    }
    return "http://www.google.com/s2/favicons?domain_url=" + encodeURIComponent(new URL(url).origin)
}
