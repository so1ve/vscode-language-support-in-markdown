import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		client: "src/index.ts",
		server:
			"./node_modules/md-language-support-server/bin/md-language-support-server.js",
	},
	format: ["cjs"],
	shims: false,
	dts: false,
	external: ["vscode"],
});
