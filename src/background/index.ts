const openUI = async () => {
    const url = browser.extension.getURL("ui.html")

    const tabs = await browser.tabs.query({})

    let tabId = null

    for (const tab of tabs) {
        if (tab.url === url) {
            tabId = tab.id
            break
        }
    }

    if (tabId) {
        browser.tabs.update(tabId, { active: true })
    } else {
        browser.tabs.create({ url })
    }
}

if (__DEV__) {
    openUI()
}

browser.browserAction.onClicked.addListener(openUI)
