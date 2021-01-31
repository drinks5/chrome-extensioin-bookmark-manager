import { NoEmitOnErrorsPlugin } from "webpack"

/*
1. 如果标签不存在，新建书签
2. 如果书签目录存在原始目录,更新书签
3. 如果书签目录不存在原始目录，新建书签
4. 原始目录不存在于当前目录，删除书签
*/
export function handleTags(page, tags, originTags, tagMap, root) {
    tags.map(tag => {
        if (!tagMap.has(tag)) {
            return createParentBookmark(page, root, tag)
        }
        if (!originTags.indexOf(tag)) {
            return createBookmark(tagMap[tag].id, page)
        }
    })
    const deleteTags = originTags.filter(tag => {
        if (tags.indexOf(tag) > -1) {
            return false
        }
        return tagMap[tag].id
    })
    chrome.bookmarks.search(page.url, (nodes) => {
        nodes.map(node => {
            if (node.url !== page.url) {
                return
            }
            if (deleteTags.indexOf(node.parentId) > -1) {
                removeBookmark(node)
            }
            if (node.title != page.title) {
                updateBookmark(page, node)
            }

        })
    })
}
function createParentBookmark(page, root, tag) {
    // 新建标签目录和标签
    chrome.bookmarks.create(
        {
            parentId: root.id,
            title: tag,
        },
        (node) => {
            chrome.bookmarks.create(
                {
                    parentId: node.id,
                    url: page.url,
                    title: page.title,
                },
                (subNode) => subNode
            )
        }
    )
}
function updateBookmark(page, node) {
    // 如果存在书签
    return chrome.bookmarks.update(
        node.id,
        {
            url: page.url,
            title: page.title,
        },
        (node) => node
    )
}
function removeBookmark(node) {
    chrome.bookmarks.remove(node.id, () => { })
}
export function createBookmark(parentId, page) {
    chrome.bookmarks.create(
        {
            parentId: parentId,
            url: page.url,
            title: page.title,
        },
        (node) => node
    )
}