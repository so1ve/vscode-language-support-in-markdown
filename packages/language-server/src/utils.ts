import { fromMarkdown as parse } from "mdast-util-from-markdown";
import type { Position } from "unist";
import { visit } from "unist-util-visit";

interface Codeblock {
  text: string;
  lang: string;
  position: Position;
}

export function getCodeblocks(text: string) {
  const parsed = parse(text);
  const codeblocks: Codeblock[] = [];

  visit(parsed, "code", (node) => {
    if (node.lang) {
      codeblocks.push({
        text: node.value,
        lang: node.lang,
        position: node.position!,
      });
    }
  });

  return codeblocks;
}
