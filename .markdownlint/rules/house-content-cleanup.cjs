const NON_MARKDOWN_BULLETS = /^[ \t]{0,3}[•◦§]\s+/;

module.exports = [
  {
    names: ["HS009", "non-markdown-bullet-symbol"],
    description: "Disallow non-Markdown bullet symbols at list starts",
    tags: ["lists", "cleanup", "house_style"],
    parser: "none",
    function: (params, onError) => {
      const lines = params.lines || [];
      let insideFence = false;
      for (let index = 0; index < lines.length; index += 1) {
        const trimmed = lines[index].trim();
        if (/^(```|~~~)/.test(trimmed)) {
          insideFence = !insideFence;
          continue;
        }
        if (insideFence) {
          continue;
        }
        if (!NON_MARKDOWN_BULLETS.test(lines[index])) {
          continue;
        }
        onError({
          lineNumber: index + 1,
          detail: "Expected a Markdown list marker instead of a pasted bullet symbol.",
          context: lines[index]
        });
      }
    }
  },
  {
    names: ["HS010", "duplicate-list-marker"],
    description: "Detect duplicated or empty list markers that usually come from paste or edit mistakes",
    tags: ["lists", "cleanup", "house_style"],
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
        if (insideFence) {
          continue;
        }
        if (
          /^\s{0,3}(?:[-*+]|\d+\.)\s*$/.test(line) ||
          /^\s{0,3}(?:[-*+]\s+){2,}\S/.test(line) ||
          /^\s{0,3}(?:\d+\.\s+){2,}\S/.test(line) ||
          /^\s{0,3}[-*+]\s+\[[ xX]\]\s+\[[ xX]\]\s+/.test(line)
        ) {
          onError({
            lineNumber: index + 1,
            detail: "Possible duplicated or empty list marker.",
            context: line
          });
        }
      }
    }
  }
];
