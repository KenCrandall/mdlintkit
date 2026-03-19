function splitInlineCodeAwareSegments(line) {
  return line.split(/(`[^`]*`)/g).filter(Boolean);
}

function isCodeSegment(segment) {
  return /^`[^`]*`$/.test(segment);
}

function isHtmlCommentLine(trimmedLine) {
  return /^<!--.*-->$/.test(trimmedLine);
}

function isTableLine(trimmedLine) {
  return /^\|.*\|$/.test(trimmedLine);
}

function isQuotedOrCodeLikeLine(trimmedLine) {
  return (
    /^>/.test(trimmedLine) ||
    /^{{[%<]/.test(trimmedLine) ||
    /^`/.test(trimmedLine)
  );
}

module.exports = [
  {
    names: ["HS007", "proper-ellipsis"],
    description: "Prefer a single ellipsis character over three consecutive periods in prose",
    tags: ["typography", "house_style"],
    parser: "none",
    function: (params, onError) => {
      const lines = params.lines || [];
      let insideFence = false;

      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const trimmed = line.trim();
        if (/^(```|~~~)/.test(trimmed)) {
          insideFence = !insideFence;
          continue;
        }
        if (
          insideFence ||
          isHtmlCommentLine(trimmed) ||
          isTableLine(trimmed) ||
          isQuotedOrCodeLikeLine(trimmed)
        ) {
          continue;
        }

        let offset = 0;
        for (const segment of splitInlineCodeAwareSegments(line)) {
          if (!isCodeSegment(segment)) {
            const ellipsisIndex = segment.indexOf("...");
            if (ellipsisIndex !== -1) {
              onError({
                lineNumber: index + 1,
                detail: "Expected the single ellipsis character (…) instead of three periods.",
                context: line,
                range: [offset + ellipsisIndex + 1, 3]
              });
              break;
            }
          }
          offset += segment.length;
        }
      }
    }
  },
  {
    names: ["HS011", "hyphenated-line-break"],
    description: "Detect likely copy-paste artifacts where a word is hyphenated across a line break",
    tags: ["typography", "cleanup", "house_style"],
    parser: "none",
    function: (params, onError) => {
      const lines = params.lines || [];
      let insideFence = false;

      for (let index = 0; index < lines.length - 1; index += 1) {
        const line = lines[index];
        const nextLine = lines[index + 1];
        if (/^(```|~~~)/.test(line.trim())) {
          insideFence = !insideFence;
          continue;
        }
        if (insideFence) {
          continue;
        }
        if (
          !/[A-Za-z]-$/.test(line.trimEnd()) ||
          !/^[a-z]/.test(nextLine.trimStart()) ||
          /^\s{0,3}([#>|*-]|\d+\.)/.test(line) ||
          /^\s{0,3}([#>|*-]|\d+\.)/.test(nextLine) ||
          /^\|/.test(line.trim()) ||
          /^\|/.test(nextLine.trim())
        ) {
          continue;
        }
        onError({
          lineNumber: index + 1,
          detail: "Possible copy-paste hyphenated line break artifact.",
          context: line
        });
      }
    }
  }
];
