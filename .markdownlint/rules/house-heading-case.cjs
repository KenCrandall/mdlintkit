const LOWERCASE_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "en",
  "for",
  "from",
  "if",
  "in",
  "nor",
  "of",
  "on",
  "or",
  "per",
  "so",
  "the",
  "to",
  "up",
  "via",
  "vs",
  "yet"
]);

const ALLOW_LIST = new Map([
  ["macos", "macOS"],
  ["ios", "iOS"],
  ["iphone", "iPhone"],
  ["ipad", "iPad"],
  ["javascript", "JavaScript"],
  ["typescript", "TypeScript"],
  ["applescript", "AppleScript"],
  ["i", "I"]
]);

function stripWrappingPunctuation(word) {
  return word.replace(/^[("'“”‘’[{]+|[)"'“”‘’\]}.:,;!?]+$/g, "");
}

function expectedTitleCase(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function titleCaseCheck(text) {
  const words = text.split(/\s+/).filter(Boolean);
  for (let index = 0; index < words.length; index += 1) {
    const rawWord = words[index];
    if (rawWord.includes("`")) {
      continue;
    }
    const bareWord = stripWrappingPunctuation(rawWord);
    if (!bareWord || /^\d/.test(bareWord)) {
      continue;
    }
    if (/[a-z].*[A-Z]|[A-Z].*[A-Z]/.test(bareWord)) {
      continue;
    }

    const lower = bareWord.toLowerCase();
    if (ALLOW_LIST.has(lower)) {
      const expected = ALLOW_LIST.get(lower);
      if (bareWord !== expected) {
        return { actual: bareWord, expected };
      }
      continue;
    }

    const isEdgeWord = index === 0 || index === words.length - 1;
    if (!isEdgeWord && LOWERCASE_WORDS.has(lower)) {
      if (bareWord !== bareWord.toLowerCase()) {
        return { actual: bareWord, expected: bareWord.toLowerCase() };
      }
      continue;
    }

    const expected = expectedTitleCase(bareWord);
    if (bareWord !== expected) {
      return { actual: bareWord, expected };
    }
  }
  return null;
}

module.exports = [
  {
    names: ["HS006", "heading-title-case"],
    description: "Require ATX headings to use the configured house Title Case rules",
    tags: ["headings", "title_case", "house_style"],
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

        const match = lines[index].match(/^(#{1,6})\s+(.*)$/);
        if (!match) {
          continue;
        }

        const headingText = match[2].replace(/\s+#+\s*$/, "").trim();
        const result = titleCaseCheck(headingText);
        if (!result) {
          continue;
        }

        onError({
          lineNumber: index + 1,
          detail: `Expected heading word "${result.actual}" to be "${result.expected}".`,
          context: lines[index]
        });
      }
    }
  }
];
