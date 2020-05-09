import svelte from "rollup-plugin-svelte"
import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import postcss from "rollup-plugin-postcss"
import livereload from "rollup-plugin-livereload"
import { terser } from "rollup-plugin-terser"
import replace from "rollup-plugin-replace"

const production = !process.env.ROLLUP_WATCH

module.exports = {
	input: "src/main.js",
	output: {
		sourcemap: true,
		file: "public/build/bundle.js",
		format: "iife",
		name: "app",
	},
	plugins: [
		// replace({
		// 	PRODUCTION: process.env.NODE_ENV === "production",
		// }),
		svelte({
			emitCss: true,
		}),
		resolve({
			browser: true,
			dedupe: (importee) => importee === "svelte" || importee.startsWith("svelte/"),
		}),
		commonjs(),
		!production && serve(),
		!production && livereload("public"),
		production && terser(),
		postcss({
			extract: true,
			minimize: true,
			use: [
				[
					"sass",
					{
						includePaths: ["./src/theme", "./node_modules"],
					},
				],
			],
		}),
	],
	watch: {
		clearScreen: false,
	},
}

function serve() {
	let started = false

	return {
		writeBundle() {
			if (!started) {
				started = true

				require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
					stdio: ["ignore", "inherit", "inherit"],
					shell: true,
				})
			}
		},
	}
}
