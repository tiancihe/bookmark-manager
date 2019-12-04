type BookmarkTreeNode = browser.bookmarks.BookmarkTreeNode

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

const init = async () => {
    const tree = (await browser.bookmarks.getTree())[0]
    console.log(tree)

    const nodes: BookmarkTreeNode[] = []
    const flattenBookmarkTreeNodes = (node: BookmarkTreeNode) => {
        nodes.push(node)

        if (node.children) {
            node.children.forEach(flattenBookmarkTreeNodes)
        }
    }
    flattenBookmarkTreeNodes(tree)
    console.log(nodes)
}

init()
