import type { Language, VirtualFile } from "@volar/language-core";
import {
	FileCapabilities,
	FileKind,
	FileRangeCapabilities,
} from "@volar/language-core";
import type * as ts from "typescript/lib/tsserverlibrary";

import { getCodeblocks } from "./utils";

export const language: Language<MarkdownFile> = {
	createVirtualFile(fileName, snapshot) {
		if (fileName.endsWith(".md")) {
			return new MarkdownFile(fileName, snapshot);
		}
	},
	updateVirtualFile(markdownFile, snapshot) {
		markdownFile.update(snapshot);
	},
};

export class MarkdownFile implements VirtualFile {
	public kind = FileKind.TextFile;
	public capabilities = FileCapabilities.full;
	public codegenStacks = [];

	public fileName!: string;
	public mappings!: VirtualFile["mappings"];
	public embeddedFiles!: VirtualFile["embeddedFiles"];

	constructor(
		public sourceFileName: string,
		public snapshot: ts.IScriptSnapshot,
	) {
		this.fileName = `${sourceFileName}.md`;
		this.updateSnapshot();
	}

	public update(newSnapshot: ts.IScriptSnapshot) {
		this.snapshot = newSnapshot;
		this.updateSnapshot();
	}

	private updateSnapshot() {
		this.mappings = [
			{
				sourceRange: [0, this.snapshot.getLength()],
				generatedRange: [0, this.snapshot.getLength()],
				data: FileRangeCapabilities.full,
			},
		];
		this.embeddedFiles = [];
		this.parseMarkdown();
	}

	private parseMarkdown() {
		let i = 0;

		const textLength = this.snapshot.getLength();
		const codeblocks = getCodeblocks(this.snapshot.getText(0, textLength));

		for (const { text, position, lang } of codeblocks) {
			this.embeddedFiles.push({
				fileName: `${this.fileName}.${i++}.${lang}`,
				kind: FileKind.TextFile,
				snapshot: {
					getText: (start, end) => text.slice(start, end),
					getLength: () => text.length,
					getChangeRange: () => undefined,
				},
				mappings: [
					{
						sourceRange: [position.start, position.end],
						generatedRange: [0, text.length],
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
