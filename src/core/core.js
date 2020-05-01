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
	return "#" + Math.floor(Math.random() * 16777215).toString(16)
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
	fakeChartItems.map((e, i) => {
		e.id = i
		let part = (e.value / returnItemsSumm(fakeChartItems)) * multiplier
		if (e.id != 0) {
			e.start = fakeChartItems.find((f) => f.id == i - 1).end + chartParams.gap
			e.end = fakeChartItems.find((f) => f.id == i - 1).end + part
			e.d = computeChartArc(e.start, e.end, chartParams.outer, chartParams.inner)
		} else {
			e.start = chartParams.gap == 0 ? 0 : chartParams.gap / 2
			e.end = chartParams.gap == 0 ? part : part - chartParams.gap / 2
			e.d = computeChartArc(e.start, e.end, chartParams.outer, chartParams.inner)
		}
	})
}

function returnItemsSumm(fakeChartItems) {
	return fakeChartItems.reduce((r, s) => {
		return r + s.value
	}, 0)
}
