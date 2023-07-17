import type { Language, VirtualFile } from "@volar/language-core";
import {
  FileCapabilities,
  FileKind,
  FileRangeCapabilities,
} from "@volar/language-core";
import type * as ts from "typescript/lib/tsserverlibrary";
import * as html from "vscode-html-languageservice";

export const language: Language<MarkdownFIle> = {
  createVirtualFile(fileName, snapshot) {
    if (fileName.endsWith(".md")) {
      return new MarkdownFIle(fileName, snapshot);
    }
  },
  updateVirtualFile(markdownFile, snapshot) {
    markdownFile.update(snapshot);
  },
};

const htmlLs = html.getLanguageService();

export class MarkdownFIle implements VirtualFile {
  kind = FileKind.TextFile;
  capabilities = FileCapabilities.full;
  codegenStacks = [];

  fileName!: string;
  mappings!: VirtualFile["mappings"];
  embeddedFiles!: VirtualFile["embeddedFiles"];
  document!: html.TextDocument;
  htmlDocument!: html.HTMLDocument;

  constructor(
    public sourceFileName: string,
    public snapshot: ts.IScriptSnapshot,
  ) {
    this.fileName = `${sourceFileName}.html`;
    this.onSnapshotUpdated();
  }

  public update(newSnapshot: ts.IScriptSnapshot) {
    this.snapshot = newSnapshot;
    this.onSnapshotUpdated();
  }

  onSnapshotUpdated() {
    this.mappings = [
      {
        sourceRange: [0, this.snapshot.getLength()],
        generatedRange: [0, this.snapshot.getLength()],
        data: FileRangeCapabilities.full,
      },
    ];
    this.document = html.TextDocument.create(
      this.fileName,
      "html",
      0,
      this.snapshot.getText(0, this.snapshot.getLength()),
    );
    this.htmlDocument = htmlLs.parseHTMLDocument(this.document);
    this.embeddedFiles = [];
    this.addStyleTag();
  }

  addStyleTag() {
    let i = 0;
    for (const root of this.htmlDocument.roots) {
      if (
        root.tag === "style" &&
        root.startTagEnd !== undefined &&
        root.endTagStart !== undefined
      ) {
        const styleText = this.snapshot.getText(
          root.startTagEnd,
          root.endTagStart,
        );
        this.embeddedFiles.push({
          fileName: `${this.fileName}.${i++}.css`,
          kind: FileKind.TextFile,
          snapshot: {
            getText: (start, end) => styleText.slice(start, end),
            getLength: () => styleText.length,
            getChangeRange: () => undefined,
          },
          mappings: [
            {
              sourceRange: [root.startTagEnd, root.endTagStart],
              generatedRange: [0, styleText.length],
              data: FileRangeCapabilities.full,
            },
          ],
          codegenStacks: [],
          capabilities: FileCapabilities.full,
          embeddedFiles: [],
        });
      }
    }
  }
}
