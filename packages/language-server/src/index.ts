import type { LanguageServerPlugin } from "@volar/language-server/node";
import {
	createConnection,
	startLanguageServer,
} from "@volar/language-server/node";
import * as CssService from "volar-service-css";
import * as EmmetService from "volar-service-emmet";
import * as HtmlService from "volar-service-html";
import * as JsonService from "volar-service-json";
// import * as YamlService from "volar-service-yaml";
// import * as TypeScriptService from "volar-service-typescript";
import * as PugService from "volar-service-pug";

import { language } from "./language";

const plugin: LanguageServerPlugin = (): ReturnType<LanguageServerPlugin> => ({
	extraFileExtensions: [
		{ extension: "md", isMixedContent: true, scriptKind: 7 },
	],
	watchFileExtensions: [
		"js",
		"cjs",
		"mjs",
		"ts",
		"cts",
		"mts",
		"jsx",
		"tsx",
		"json",
		"md",
	],
	resolveConfig(config) {
		// languages
		config.languages ??= {};
		config.languages.markdown ??= language;

		// services
		config.services ??= {};
		config.services.css ??= CssService.create();
		config.services.emmet ??= EmmetService.create();
		config.services.html ??= HtmlService.create();
		config.services.json ??= JsonService.create();
		config.services.pug ??= PugService.create();
		// config.services.typescript ??= TypeScriptService.create();
		// config.services.yaml ??= YamlService.create();

		return config;
	},
});

startLanguageServer(createConnection(), plugin);
