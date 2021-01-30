import similarity from 'similarity'

export function getBestMatchTags(url, title, tagGroups) {
	let rate,
		key,
		result,
		seen = new Set(),
		minRate = 0.5,
		maxNumber = 3,
		toReplace = ['.', '/', '-', ':'];
	toReplace.map(x => {
		title = title.replaceAll(x, ' ')
		url = url.replaceAll(x, ' ')
	})

	let parts = title.split(' ')
	parts = parts.concat(url.split(' '))
	result = parts.map(string => {
		return tagGroups.map(tag => {
			rate = similarity(string.toLowerCase(), tag)
			return { rate: rate, string: string, tag: tag }
		})
	})
	result = result.sort((a, b) => { return b.rate - a.rate })
	result = result.flatMap(x => x).filter(x => {
		key = x.tag
		return (x.rate >= minRate) && (seen.has(key) ? false : seen.add(key));
	})
	return result.slice(0, maxNumber).map(x => x.tag)
}