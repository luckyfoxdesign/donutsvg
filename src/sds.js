"use strict"
{
	// © 2019 Xah Lee
	// version 2019-06-26
	const center_x_slider = document.getElementById("center_x_slider")
	const center_y_slider = document.getElementById("center_y_slider")
	const centerX = document.getElementById("centerX")
	const centerY = document.getElementById("centerY")
	const rx_slider = document.getElementById("rx_slider")
	const ry_slider = document.getElementById("ry_slider")
	const rx = document.getElementById("rx")
	const ry = document.getElementById("ry")
	const sweepStart_slider = document.getElementById("sweepStart_slider")
	const sweepStart = document.getElementById("sweepStart")
	const sweepDelta_slider = document.getElementById("sweepDelta_slider")
	const sweepDelta = document.getElementById("sweepDelta")
	const rot_slider = document.getElementById("rot_slider")
	const rot = document.getElementById("rot")
	const canvas08788 = document.getElementById("canvas08788")
	const textDisplay50572 = document.getElementById("textDisplay50572")
	const cos = Math.cos
	const sin = Math.sin
	const π = Math.PI
	// const f_matrix_times = (( [[a,b], [c,d]], [x,y]) => [ a * x + b * y, c * x + d * y]);
	const f_matrix_times = ([[a, b], [c, d]], [x, y]) => [
		a * x + b * y,
		c * x + d * y
	]
	const f_rotate_matrix = x => {
		const cosx = cos(x)
		const sinx = sin(x)
		return [
			[cosx, -sinx],
			[sinx, cosx]
		]
	}
	// const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);
	const f_vec_add = ([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]
	const f_svg_ellipse_arc = ([cx, cy], [rx, ry], [t1, Δ], φ) => {
		/* [
        returns a a array that represent a ellipse for SVG path element d attribute.
        cx,cy → center of ellipse.
        rx,ry → major minor radius.
        t1 → start angle, in radian.
        Δ → angle to sweep, in radian. positive.
        φ → rotation on the whole, in radian.
        url: SVG Circle Arc http://xahlee.info/js/svg_circle_arc.html
        Version 2019-06-19
         ] */
		Δ = Δ % (2 * π)
		const rotMatrix = f_rotate_matrix(φ)
		const [sX, sY] = f_vec_add(
			f_matrix_times(rotMatrix, [rx * cos(t1), ry * sin(t1)]),
			[cx, cy]
		)
		const [eX, eY] = f_vec_add(
			f_matrix_times(rotMatrix, [rx * cos(t1 + Δ), ry * sin(t1 + Δ)]),
			[cx, cy]
		)
		const fA = Δ > π ? 1 : 0
		const fS = Δ > 0 ? 1 : 0
		return [" M ", sX, " ", sY, " A ", rx, ry, (φ / π) * 180, fA, fS, eX, eY]
	}
	const svg1 = document.createElementNS("http://www.w3.org/2000/svg", "svg")
	svg1.setAttribute("style", "stroke:black; fill:none; stroke-width:2")
	svg1.setAttribute("width", "400")
	svg1.setAttribute("height", "400")
	console.log(params)
	canvas08788.appendChild(svg1)
	const f_update = () => {
		const params = f_svg_ellipse_arc(
			[parseFloat(centerX.value), parseFloat(centerY.value)],
			[parseFloat(rx.value), parseFloat(ry.value)],
			[
				(parseFloat(sweepStart.value) / 180) * π,
				(parseFloat(sweepDelta.value) / 180) * π
			],
			(parseFloat(rot.value) / 180) * π
		)
		const cmdStr1 = params.join(" ")
		const cmdStr2 = params
			.map(x => (typeof x === "number" ? x.toFixed(0) : x))
			.join(" ")
		const path86021 = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"path"
		)
		path86021.setAttribute("d", cmdStr1)
		svg1.innerHTML = ""
		svg1.appendChild(path86021)
		textDisplay50572.textContent = `<path d="${cmdStr2}" />`
	}
	f_update()
}

function setOuterRadius() {
	let val = this.value
	let intInputValue = parseInt(val)
	let intInnerRadius = parseInt(innerRad)
	switch (true) {
		case intInputValue < intInnerRadius:
			if (intInputValue - 1 <= 0) {
				console.log("val-1 <= 0")
				innerInput = innerRad = 1
				this.value = outerInput = radius = 2
			} else {
				console.log("val < inner and > 0")
				radius = val
				innerInput = innerRad = intInputValue - 1
			}
			break
		case val == innerRad:
			console.log("val = inner")
			radius = val
			innerInput = intInnerRadius - 1
			break
		case parseInt(val) > 220:
			console.log("val > 220")
			this.value = radius = 220
			break
		default:
			radius = this.value
			outerInput = radius
	}
}

function setInnerRadius() {
	let val = this.value
	let intInputValue = parseInt(val)
	switch (true) {
		case intInputValue > 219:
			console.log("val > 219")
			outerInput = radius = 220
			this.value = 219
			break
		case intInputValue > parseInt(radius):
			console.log("val > outer")
			outerInput = radius = intInputValue + 1
			innerInput = val
			break
		case val == radius:
			console.log("val = outer")
			radius = parseInt(radius) + 1
			outerInput = radius
			innerInput = val
			break
		case intInputValue <= 0:
			console.log("val <= 0")
			innerRad = val = 1
		default:
			innerRad = val
			innerInput = val
			break
	}
}

function ResetRadius() {
	innerInput = ""
	outerInput = ""
	radius = "90"
	innerRad = 60
}

function arc(startAngle, endAngle, outerRadius, innerRadius = 0) {
	startAngle = (startAngle * Math.PI) / 180
	endAngle = (endAngle * Math.PI) / 180
	const sinAlpha = Math.sin(startAngle)
	const cosAlpha = Math.cos(startAngle)
	const sinBeta = Math.sin(endAngle)
	const cosBeta = Math.cos(endAngle)

	const largeArc = endAngle - startAngle > Math.PI

	const P = {
		x: outerRadius + outerRadius * sinAlpha,
		y: outerRadius - outerRadius * cosAlpha
	}

	const Q = {
		x: outerRadius + outerRadius * sinBeta,
		y: outerRadius - outerRadius * cosBeta
	}

	const R = {
		x: outerRadius + innerRadius * sinBeta,
		y: outerRadius - innerRadius * cosBeta
	}

	const S = {
		x: outerRadius + innerRadius * sinAlpha,
		y: outerRadius - innerRadius * cosAlpha
	}

	return `M${P.x},${P.y} A${outerRadius},${outerRadius} 0 ${
		largeArc ? "1" : "0"
	} 1 ${Q.x},${Q.y} L${R.x},${R.y} A${innerRadius},${innerRadius} 0 ${
		largeArc ? "1" : "0"
	} 0 ${S.x},${S.y} Z`
}
