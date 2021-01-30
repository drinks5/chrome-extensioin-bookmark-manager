function createParentBookmarks(tab, bookmark, tagValue) {
    // 新建标签目录和标签
    chrome.bookmarks.create(
        {
            parentId: bookmark.id,
            title: tagValue,
        },
        (node) => {
            chrome.bookmarks.create(
                {
                    parentId: node.id,
                    url: tab.url,
                    title: tab.title,
                },
                (subNode) => subNode
            )
        }
    )
}
function updateBookmark(tab, tag) {
    // 如果存在书签
    chrome.bookmarks.search(tab.url, (node) => {
        node = node[0]
        chrome.bookmarks.update(
            node.id,
            {
                url: tab.url,
                title: tab.title,
            },
            (node) => node
        )
    })
}
function createBookmark(tag) {
    let that = this
    chrome.bookmarks.create(
        {
            parentId: tag.id,
            url: that.url,
            title: that.title,
        },
        (node) => node
    )
}
function getChildrenTag() {
    let tag,
        tagId,
        that = this
    this.tags.map((tagValue) => {
        if (!that.tagMaps.has(tagValue)) {
            return that.createParentBookmarks()
        }
        if (that.originTags.indexOf(tagValue) < 0) {
            return that.deleteBookmarks()
        }
        tagId = that.tagMaps.get(tagValue).id
        chrome.bookmarks.get(tagId, function (tag) {
            tag = tag[0]
            if (that.originTags.indexOf(tag.title)) {
                that.updateBookmark(tag)
            } else {
                that.createBookmark(tag)
            }
        })
    })
}