import type { LanguageServerPlugin } from "@volar/language-server/node";
import {
  createConnection,
  startLanguageServer,
} from "@volar/language-server/node";
import createCssService from "volar-service-css";
import createEmmetService from "volar-service-emmet";
import createHtmlService from "volar-service-html";

import { language } from "./language";

const plugin: LanguageServerPlugin = (): ReturnType<LanguageServerPlugin> => ({
  extraFileExtensions: [
    { extension: "md", isMixedContent: true, scriptKind: 7 },
  ],
  resolveConfig(config) {
    // languages
    config.languages ??= {};
    config.languages.markdown ??= language;

    // services
    config.services ??= {};
    config.services.html ??= createHtmlService();
    config.services.css ??= createCssService();
    config.services.emmet ??= createEmmetService();

    return config;
  },
});

startLanguageServer(createConnection(), plugin);
