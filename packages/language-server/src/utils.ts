import { fromMarkdown as parse } from "mdast-util-from-markdown";
import { visit } from "unist-util-visit";

interface Codeblock {
  text: string;
  lang: string;
  position: {
    start: number;
    end: number;
  };
}

const NEWLINE_RE = /\r?\n/;

export function getCodeblocks(text: string) {
  const parsed = parse(text);
  const codeblocks: Codeblock[] = [];

  visit(parsed, "code", (node) => {
    const { position } = node;
    const textEnd = position!.end.offset ?? text.length;
    const codeblockText = text.slice(position!.start.offset, textEnd);
    const splitted = codeblockText.split(NEWLINE_RE);
    const firstline = splitted[0];
    const lastline = splitted[splitted.length - 1];
    const start = position!.start.offset! + firstline.length + 1;
    const end = textEnd - lastline.length - 1;
    if (node.lang) {
      codeblocks.push({
        text: node.value,
        lang: node.lang,
        position: { start, end },
      });
    }
  });

  return codeblocks;
}
