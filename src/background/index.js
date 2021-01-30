console.log('background script working!!!')


/*
bookmarks: 
{
    url: [
    tags: [str],
    title: str,
    url: str:
    dateAdded: date
    ]
}
tagGroups:
{
    id: name
}
*/
function parseBookmarks(bookmarkTreeNodes, tags, bookmarkMap, tagMap) {
    let node,
        i,
        len,
        tag,
        ids,
        bookmark,
        newTags;
    if (!bookmarkTreeNodes) {
        return
    }

    for (i = 0, len = bookmarkTreeNodes.length; i < len; i++) {
        node = bookmarkTreeNodes[i];

        if (node.url) {
            ids = [node.id]
            if (bookmarkMap.get(node.url)) {
                // 一个书签url存在多个目录
                bookmark = bookmarkMap.get(node.url)
                tag = {id: bookmark.id}
                tags = tags.concat(bookmark.tags)
                ids = ids.concat(bookmark.ids)
            }
            bookmark = {
                tags: tags,
                title: node.title,
                url: node.url,
                ids: ids,
                dateAdded: new Date(node.dateAdded)
            };
            bookmarkMap.set(node.url, bookmark)
        } else {
            if (node.title) {
                newTags = Object.assign([], tags)
                newTags.push(node.title);
                tag = { id: node.id, name: node.title }
                tagMap.set(node.title, tag)
            }
            if (node.children) {
                parseBookmarks(node.children || [], newTags, bookmarkMap, tagMap);
            }
        }
    }
}

export const getBookmarks = function (bookmarkTreeNodes) {
    var bookmarkMap = new Map()
    var tagMap = new Map();
    parseBookmarks(bookmarkTreeNodes, [], bookmarkMap, tagMap);
    return {
        bookmarkMap: bookmarkMap, tagMap: tagMap
    }
};


/*
Hot Reload
*/
if (process.env.NODE_ENV === 'development') {
    // OnInstall handler
    chrome.runtime.onInstalled.addListener(details => {
        console.log(details)
    })

    const filesInDirectory = dir => new Promise(resolve =>
        dir.createReader().readEntries(entries =>
            Promise.all(entries.filter(e => e.name[0] !== '.').map(e =>
                e.isDirectory
                    ? filesInDirectory(e)
                    : new Promise(resolve => e.file(resolve))
            ))
                .then(files => [].concat(...files))
                .then(resolve)
        )
    )

    const timestampForFilesInDirectory = dir =>
        filesInDirectory(dir).then(files =>
            files.map(f => f.name + f.lastModifiedDate).join())

    const watchChanges = (dir, lastTimestamp) => {
        timestampForFilesInDirectory(dir).then(timestamp => {
            if (!lastTimestamp || (lastTimestamp === timestamp)) {
                setTimeout(() => watchChanges(dir, timestamp), 1000) // retry after 1s
            } else {
                chrome.runtime.reload()
            }
        })
    }

    chrome.management.getSelf(self => {
        if (self.installType === 'development') {
            chrome.runtime.getPackageDirectoryEntry(dir => watchChanges(dir))
            chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => { // NB: see https://github.com/xpl/crx-hotreload/issues/5
                if (tabs[0]) {
                    chrome.tabs.reload(tabs[0].id)
                }
            })
        }
    })

}

