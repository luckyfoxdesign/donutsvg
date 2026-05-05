export function computeChartArc(startAngle, endAngle, outerRadius, innerRadius) {
	startAngle = (startAngle * Math.PI) / 180
	endAngle = (endAngle * Math.PI) / 180
	const sinAlpha = Math.sin(startAngle)
	const cosAlpha = Math.cos(startAngle)
	const sinBeta = Math.sin(endAngle)
	const cosBeta = Math.cos(endAngle)
	const largeArc = endAngle - startAngle > Math.PI

	const P = {
		x: outerRadius + outerRadius * sinAlpha,
		y: outerRadius - outerRadius * cosAlpha,
	}

	const Q = {
		x: outerRadius + outerRadius * sinBeta,
		y: outerRadius - outerRadius * cosBeta,
	}

	const R = {
		x: outerRadius + innerRadius * sinBeta,
		y: outerRadius - innerRadius * cosBeta,
	}

	const S = {
		x: outerRadius + innerRadius * sinAlpha,
		y: outerRadius - innerRadius * cosAlpha,
	}

	return `M${P.x}, ${P.y} A${outerRadius},${outerRadius} 0 ${largeArc ? "1" : "0"} 1 ${Q.x},${Q.y} L${R.x},${
		R.y
	} A${innerRadius},${innerRadius} 0 ${largeArc ? "1" : "0"} 0 ${S.x},${S.y} Z`
}

export function getHexStringColor() {
	return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
}

export function formatToNumberType(e) {
	let regex = /^\d+$/
	let value = e.target.value
	let onlyNumberStringValue = ""
	value.split("").forEach((char) => {
		if (regex.test(char)) onlyNumberStringValue += char
		else return
	})
	e.target.value = onlyNumberStringValue
}

export function writeAnglesAndPathsFakearr(fakeChartItems, chartParams, en) {
	let multiplier = !!!en ? 359.99 : 360
	let itemsSumm = returnItemsSumm(fakeChartItems)

	if (!fakeChartItems.length || itemsSumm <= 0) {
		return fakeChartItems.map((item, i) => ({
			...item,
			id: i,
			start: 0,
			end: 0,
			d: "",
		}))
	}

	let nextItems = []

	fakeChartItems.forEach((item, i) => {
		let part = (item.value / itemsSumm) * multiplier
		let start
		let end

		if (i != 0) {
			let previousItem = nextItems[i - 1]
			start = previousItem.end + chartParams.gap
			end = previousItem.end + part
		} else {
			start = chartParams.gap == 0 ? 0 : chartParams.gap / 2
			end = chartParams.gap == 0 ? part : part - chartParams.gap / 2
		}

		nextItems.push({
			...item,
			id: i,
			start,
			end,
			d: computeChartArc(start, end, chartParams.outer, chartParams.inner),
		})
	})

	return nextItems
}

function returnItemsSumm(fakeChartItems) {
	return fakeChartItems.reduce((r, s) => {
		return r + Number(s.value || 0)
	}, 0)
}
