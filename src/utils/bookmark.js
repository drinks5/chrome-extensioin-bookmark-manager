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
        if ((originTags.indexOf(tag) < 0)) {
            return createBookmark(tagMap.get(tag).id, page)
        }
    })
    const deleteTags = originTags.filter(tag => {
        if (tags.indexOf(tag) > -1) {
            return false
        }
        return true
    }).map(tag => { return tagMap.get(tag).id })
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
function createBookmark(parentId, page) {
    chrome.bookmarks.create(
        {
            parentId: parentId,
            url: page.url,
            title: page.title,
        },
        (node) => node
    )
}
function getBookmark(node, bookmarkMap, tagIdMap) {
    let bookmark;
    let parentTitle = tagIdMap.get(node.parentId)
    let tag = { id: node.id, parentId: node.parentId, parentTitle: parentTitle, title: node.title }
    if (bookmarkMap.get(node.url)) {
        // 一个书签url存在多个目录
        bookmark = bookmarkMap.get(node.url)
        bookmark.tags.push(tag)
    } else {
        bookmark = {
            tags: [tag],
            url: node.url,
            dateAdded: new Date(node.dateAdded)
        };

    }
    return bookmark

}
function parseBookmarks(nodes, bookmarkMap, tagMap, tagIdMap) {
    let tag, bookmark;
    if (!nodes) {
        return
    }
    nodes.map(node => {
        if (node.url) {
            bookmark = getBookmark(node, bookmarkMap, tagIdMap)
            bookmarkMap.set(node.url, bookmark)
        } else if (node.title) {
            tag = { id: node.id, name: node.title, parentId: node.parentId }
            tagMap.set(node.title, tag)
            tagIdMap.set(node.id, node.title)
        }
        if (node.children) {
            parseBookmarks(node.children || [], bookmarkMap, tagMap, tagIdMap);
        }
    })

}

export const getBookmarks = function (bookmarkTreeNodes) {
    /*
    bookmarkMap: {node.url: {tags: [{title: node.title, id: node.id, parentId: node.parentId}], url: node.url}}
    tagMap: {node.title: {id: node.id, name: node.title, parentId: node.parentId}}
    */
    var bookmarkMap = new Map()
    var tagMap = new Map();
    var tagIdMap = new Map();
    parseBookmarks(bookmarkTreeNodes, bookmarkMap, tagMap, tagIdMap);
    return {
        bookmarkMap: bookmarkMap, tagMap: tagMap
    }
};