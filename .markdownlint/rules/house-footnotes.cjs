function isFootnoteDefinition(line) {
  return /^\s{0,3}\[\^[^\]]+\]:/.test(line);
}

function isFootnoteContinuation(line) {
  return /^( {4,}|\t+)/.test(line);
}

module.exports = [
  {
    names: ["HS008", "footnotes-at-bottom"],
    description: "Require footnote definitions to remain at the bottom of the document",
    tags: ["footnotes", "house_style"],
    parser: "none",
    function: (params, onError) => {
      const lines = params.lines || [];
      let insideFence = false;
      let seenFootnoteSection = false;

      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const trimmed = line.trim();
        if (/^(```|~~~)/.test(trimmed)) {
          insideFence = !insideFence;
          continue;
        }
        if (insideFence) {
          continue;
        }

        if (isFootnoteDefinition(line)) {
          seenFootnoteSection = true;
          continue;
        }

        if (!seenFootnoteSection) {
          continue;
        }

        if (!trimmed || isFootnoteContinuation(line)) {
          continue;
        }

        onError({
          lineNumber: index + 1,
          detail: "Expected all footnote definitions to remain at the bottom of the document.",
          context: line
        });
        return;
      }
    }
  }
];
