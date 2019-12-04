type BookmarkTreeNode = browser.bookmarks.BookmarkTreeNode

const openUserInterface = async () => {
    const url = browser.extension.getURL("index.html")

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
    openUserInterface()
}

browser.browserAction.onClicked.addListener(openUserInterface)

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
