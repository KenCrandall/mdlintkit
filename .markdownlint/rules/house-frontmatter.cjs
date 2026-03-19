const fs = require("node:fs");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TOP_LEVEL_KEY_PATTERN = /^([A-Za-z0-9_-]+):\s*(.*)$/;
const ARRAY_ITEM_PATTERN = /^\s*-\s+(.*)$/;
const KEY_PRIORITY = [
  "title",
  "subtitle",
  "summary",
  "date",
  "modified",
  "authors",
  "tags",
  "aliases",
  "draft"
];
const DUPLICATE_ARRAY_KEYS = new Set(["authors", "tags", "aliases"]);

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function splitInlineArray(value) {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    return [];
  }
  return trimmed
    .slice(1, -1)
    .split(",")
    .map((entry) => stripQuotes(entry))
    .filter(Boolean);
}

function parseFrontMatter(frontMatterLines) {
  const fields = [];
  const arrays = new Map();
  let currentKey = null;

  for (let index = 0; index < frontMatterLines.length; index += 1) {
    const line = frontMatterLines[index];
    if (!line.trim()) {
      currentKey = null;
      continue;
    }

    const keyMatch = line.match(TOP_LEVEL_KEY_PATTERN);
    if (keyMatch) {
      const key = keyMatch[1];
      const value = keyMatch[2] || "";
      currentKey = key;
      fields.push({
        key,
        value,
        lineNumber: index + 2
      });

      if (DUPLICATE_ARRAY_KEYS.has(key)) {
        arrays.set(key, splitInlineArray(value));
      }
      continue;
    }

    const arrayMatch = line.match(ARRAY_ITEM_PATTERN);
    if (arrayMatch && currentKey && DUPLICATE_ARRAY_KEYS.has(currentKey)) {
      const existing = arrays.get(currentKey) || [];
      existing.push(stripQuotes(arrayMatch[1]));
      arrays.set(currentKey, existing);
    }
  }

  return { fields, arrays };
}

function frontMatterClosingLine(frontMatterLines) {
  return frontMatterLines.length + 2;
}

function safeLineNumber(params, desiredLineNumber) {
  const maxLineNumber = Math.max((params.lines || []).length, 1);
  return Math.min(Math.max(desiredLineNumber, 1), maxLineNumber);
}

function findField(fields, key) {
  return fields.find((field) => field.key === key);
}

function fileHasBlankLineAfterFrontMatter(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return true;
  }
  const source = fs.readFileSync(filePath, "utf8");
  return /^---\n[\s\S]*?\n---\n\n/.test(source);
}

const HS001 = {
  names: ["HS001", "frontmatter-ordered-when-present"],
  description: "When YAML frontmatter is present, enforce the preferred top-level key order",
  tags: ["front_matter", "yaml", "house_style"],
  parser: "none",
  function: (params, onError) => {
    const frontMatterLines = params.frontMatterLines || [];
    if (!frontMatterLines.length) {
      return;
    }

    const { fields } = parseFrontMatter(frontMatterLines);
    let lastPriorityIndex = -1;

    for (const field of fields) {
      const priorityIndex = KEY_PRIORITY.indexOf(field.key);
      if (priorityIndex === -1) {
        continue;
      }
      if (priorityIndex < lastPriorityIndex) {
        onError({
          lineNumber: safeLineNumber(params, field.lineNumber),
          detail: `Expected "${field.key}" to appear earlier in the frontmatter key order.`,
          context: `${field.key}: ${field.value}`.trim()
        });
        return;
      }
      lastPriorityIndex = priorityIndex;
    }
  }
};

const HS002 = {
  names: ["HS002", "frontmatter-blank-line-after"],
  description: "Require a blank line after YAML frontmatter when the document has body content",
  tags: ["front_matter", "blank_lines", "house_style"],
  parser: "none",
  function: (params, onError) => {
    const frontMatterLines = params.frontMatterLines || [];
    const bodyLines = params.lines || [];
    if (!frontMatterLines.length || !bodyLines.length) {
      return;
    }
    if (bodyLines.every((line) => line.trim() === "")) {
      return;
    }
    if (fileHasBlankLineAfterFrontMatter(params.name)) {
      return;
    }
    onError({
      lineNumber: 1,
      detail: "Expected a blank line after the closing YAML frontmatter fence.",
      context: bodyLines[0]
    });
  }
};

const HS003 = {
  names: ["HS003", "frontmatter-required-keys"],
  description: "Require date and modified keys when YAML frontmatter is present",
  tags: ["front_matter", "yaml", "house_style"],
  parser: "none",
  function: (params, onError) => {
    const frontMatterLines = params.frontMatterLines || [];
    if (!frontMatterLines.length) {
      return;
    }
    const { fields } = parseFrontMatter(frontMatterLines);
    for (const key of ["date", "modified"]) {
      if (!findField(fields, key)) {
        onError({
          lineNumber: safeLineNumber(params, frontMatterClosingLine(frontMatterLines)),
          detail: `Expected frontmatter to include "${key}".`
        });
      }
    }
  }
};

const HS004 = {
  names: ["HS004", "frontmatter-date-format"],
  description: "Require date and modified frontmatter values to use YYYY-MM-DD",
  tags: ["front_matter", "dates", "house_style"],
  parser: "none",
  function: (params, onError) => {
    const frontMatterLines = params.frontMatterLines || [];
    if (!frontMatterLines.length) {
      return;
    }
    const { fields } = parseFrontMatter(frontMatterLines);
    for (const key of ["date", "modified"]) {
      const field = findField(fields, key);
      if (!field) {
        continue;
      }
      const value = stripQuotes(field.value);
      if (!DATE_PATTERN.test(value)) {
        onError({
          lineNumber: field.lineNumber,
          detail: `Expected "${key}" to use YYYY-MM-DD format.`,
          context: `${key}: ${field.value}`.trim()
        });
      }
    }
  }
};

const HS005 = {
  names: ["HS005", "frontmatter-no-duplicate-array-values"],
  description: "Disallow duplicate values in frontmatter arrays such as authors, tags, and aliases",
  tags: ["front_matter", "yaml", "house_style"],
  parser: "none",
  function: (params, onError) => {
    const frontMatterLines = params.frontMatterLines || [];
    if (!frontMatterLines.length) {
      return;
    }

    const { arrays, fields } = parseFrontMatter(frontMatterLines);
    for (const [key, values] of arrays.entries()) {
      const seen = new Set();
      for (const value of values) {
        const normalized = value.toLowerCase();
        if (seen.has(normalized)) {
          const field = findField(fields, key);
          onError({
            lineNumber: field ? field.lineNumber : 2,
            detail: `Expected "${key}" to avoid duplicate array values.`,
            context: value
          });
          break;
        }
        seen.add(normalized);
      }
    }
  }
};

module.exports = [HS001, HS002, HS003, HS004, HS005];
