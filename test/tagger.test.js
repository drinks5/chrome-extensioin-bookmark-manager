import { getBestMatchTags } from '../src/utils'
import { createParentBookmarks } from '../src/utils/bookmark'
import chrome from 'sinon-chrome'

test('url title to tags', () => {
	let title = '扩展程序 - vue-chrome-extension-boilerplate'
	let url = 'https://github.com/yguan/bookmark-tagging/blob/master/app/js/data/chrome-bookmark-parser.js'
	let tagGroups =
		["书签栏", "Bookmark", "asd", "mongodb", "工作", "dmartech", "华为", "cdp", "创业", "前端", "python", "爬虫", "django", "工具配置", "黑苹果", "git", "rust", "机器学习", "svm", "telegram", "k8s", "数仓", "复旦", "知识图谱", "grakn", "信息安全", "学习", "spark", "java", "tdd", "数据质量", "其他书签", "haskell", "restful", "機器學習", "炒股", "go", "centos", "arch", "shadowsocks", "量化交易", "阿里云", "hub", "typscript", "空投", "新建文件夹"]
	let result = getBestMatchTags(url, title, tagGroups)
	console.log(result)
chrome.bookmarks.create(
    {
        parentId: '1',
        index: 1,
        title: 'Bookmark',
    },
    function (node) {
        console.log(node)
    }
)
});