import fs from 'fs'
import { getBookmarks } from '../src/utils/bookmark'

test('parse chrome bookmarks', () => {
    const content = fs.readFileSync('test/bookmarks.json', 'utf8')
    const nodes = JSON.parse(content)
    const {bookmarkMap, tagMap }= getBookmarks(nodes);
});