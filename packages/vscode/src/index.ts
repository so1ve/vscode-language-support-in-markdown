import type { InitializationOptions } from "@volar/language-server";
import * as serverProtocol from "@volar/language-server/protocol";
import type { ExportsInfoForLabs } from "@volar/vscode";
import { activateAutoInsertion, supportLabsVersion } from "@volar/vscode";
import * as vscode from "vscode";
import * as lsp from "vscode-languageclient/node";

let client: lsp.BaseLanguageClient;

export async function activate(context: vscode.ExtensionContext) {
  const serverModule = vscode.Uri.joinPath(
    context.extensionUri,
    "dist",
    "server.js",
  );
  const runOptions = { execArgv: <string[]>[] };
  const debugOptions = { execArgv: ["--nolazy", `--inspect=${6009}`] };
  const serverOptions: lsp.ServerOptions = {
    run: {
      module: serverModule.fsPath,
      transport: lsp.TransportKind.ipc,
      options: runOptions,
    },
    debug: {
      module: serverModule.fsPath,
      transport: lsp.TransportKind.ipc,
      options: debugOptions,
    },
  };
  const initializationOptions: InitializationOptions = {
    typescript: {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      tsdk: require("node:path").join(
        vscode.env.appRoot,
        "extensions/node_modules/typescript/lib",
      ),
    },
  };
  const clientOptions: lsp.LanguageClientOptions = {
    documentSelector: [{ language: "markdown" }],
    initializationOptions,
  };
  client = new lsp.LanguageClient(
    "md-language-support-server",
    "Language Support in Markdown Files Language Server",
    serverOptions,
    clientOptions,
  );
  await client.start();

  

  // support for https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volarjs-labs
  // ref: https://twitter.com/johnsoncodehk/status/1656126976774791168
  return {
    volarLabs: {
      version: supportLabsVersion,
      languageClients: [client],
      languageServerProtocol: serverProtocol,
    },
  } satisfies ExportsInfoForLabs;
}

export const deactivate = (): Thenable<any> | undefined => client?.stop();
