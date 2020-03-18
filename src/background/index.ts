const openUI = async () => {
    const url = browser.extension.getURL("ui.html")
    const tabs = (await browser.tabs.query({}))
        .map(tab => {
            tab.url = tab.url!.split("#")[0]
            return tab
        })
        .filter(tab => tab.url === url)
    if (tabs.length) {
        browser.tabs.update(tabs[0].id!, { active: true })
    } else {
        browser.tabs.create({ url })
    }
}

if (__DEV__) {
    openUI()
}

browser.browserAction.onClicked.addListener(openUI)
