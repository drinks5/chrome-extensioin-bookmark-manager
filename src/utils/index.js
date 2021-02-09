import similarity from 'similarity'

export function getBestMatchTags(url, title, tagGroups) {
	let rate,
		key,
		result,
		parts,
		seen = new Set(),
		maxNumber = 3,
		minRate = 0.5,
		toReplace = ['.', '/', '-', ':'];
	toReplace.map(x => {
		title = title.replaceAll(x, ' ')
		url = url.replaceAll(x, ' ')
	})

	parts = title.split(' ')
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