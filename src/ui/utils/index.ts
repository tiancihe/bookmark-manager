export const getFavicon = (url: string): string => {
    if (!url) return url
    if (navigator.userAgent.toLowerCase().includes("chrome")) {
        return "chrome://favicon/" + url
    }
    return "http://www.google.com/s2/favicons?domain_url=" + url
}
