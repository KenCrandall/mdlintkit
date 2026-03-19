# Markdown Style Guide

This repository is a standalone starter kit for a shared Markdown style. The
goal is to keep command-line linting and editor feedback aligned while also
capturing a small set of editorial house rules that go beyond core Markdown
syntax.

## Enforcement Model

The repository uses one shared markdownlint configuration for both:

- `markdownlint-cli2`
- the VS Code `markdownlint` extension

The source of truth is:

- `.markdownlint-cli2.jsonc`

That file defines:

- the Markdown files that are linted
- the paths that are ignored
- the built-in markdownlint rule settings
- the custom rule modules loaded from `.markdownlint/rules/`

The intent is simple: CLI runs and editor feedback should report the same rule
set from the same project-level configuration.

## Starter Commands

Use the `Makefile` entry points as the normal workflow:

- `make deps`
  Installs the local Node-based lint tooling.
- `make lint`
  Runs the shared markdownlint rule set in check mode.
- `make mdfix`
  Runs the same rule set with markdownlint's safe autofix path enabled.

`make mdfix` is intentionally narrow. It means "apply safe markdownlint fixes"
rather than "guarantee that every style issue can be rewritten automatically."

## Lint Scope

The starter config currently lints:

- `**/*.md`
- `**/*.markdown`

The starter config currently ignores:

- `**/.git/**`
- `**/node_modules/**`
- `**/dist/**`
- `**/vendor/**`

Treat those globs as a starting point, not as a rule of nature. If the target
repository has generated Markdown, vendored docs, or intentionally excluded
content trees, update the shared config instead of scattering ignore logic in
multiple tools.

## Style Preferences

In general, this starter kit assumes GitHub Flavored Markdown and then layers a
small house style on top where the built-in rules or custom rules can check it
reliably.

The starter style currently prefers the following:

- unordered lists use `-`
- ordered lists use standard ordered markers
- list markers must be followed by proper spacing
- headings must have blank lines above and below them
- headings must start at the beginning of the line
- headings must not end with the configured punctuation set
- ATX headings must follow the repository Title Case policy
- fenced code blocks must have blank lines around them
- fenced code blocks must declare a language
- fenced code blocks must use backticks
- emphasis uses underscores
- strong emphasis uses asterisks
- tables must be surrounded by blank lines
- links must not contain extra internal spacing
- blockquotes use standard Markdown form with a space after `>`
- prose prefers `…` over `...`
- footnote definitions belong at the bottom of the document
- pasted non-Markdown bullet symbols should not be used as list markers
- duplicate or empty list markers should be treated as content mistakes
- likely copy-paste hyphenated line-break artifacts should be removed

Frontmatter style preferences:

- when YAML frontmatter is present, it should follow the preferred key ordering policy
- when YAML frontmatter is present and body content follows, a blank line should follow the closing frontmatter fence
- `date` is the canonical publish field
- `modified` is required where the frontmatter policy applies
- `date` and `modified` must use `YYYY-MM-DD`
- frontmatter arrays such as `authors`, `tags`, and `aliases` must not contain duplicate values

## Built-in Rule Enforcement

The following built-in markdownlint rules currently enforce part of the starter
style. For the canonical built-in rule documentation, see the upstream
[`markdownlint` rules index](https://github.com/DavidAnson/markdownlint#rules--aliases)
and the per-rule pages in the
[`DavidAnson/markdownlint`](https://github.com/DavidAnson/markdownlint)
repository.

- [`MD004`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md004.md)
  unordered list style: `dash`
- [`MD009`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md009.md)
  no trailing spaces, including strict handling for line breaks
- [`MD010`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md010.md)
  hard tabs, using 4 spaces per tab for equivalent width and excluding code blocks
- [`MD012`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md012.md)
  no multiple consecutive blank lines beyond one
- [`MD022`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md022.md)
  blank lines around headings
- [`MD023`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md023.md)
  headings must start at the beginning of the line
- [`MD026`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md026.md)
  no trailing punctuation in headings, using the configured punctuation set
- [`MD027`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md027.md)
  standard blockquote style requiring a space after `>`
- [`MD028`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md028.md)
  no blank lines inside blockquotes
- [`MD029`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md029.md)
  ordered list marker style: `ordered`
- [`MD030`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md030.md)
  spaces after list markers
- [`MD031`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md031.md)
  blank lines around fenced code blocks
- [`MD032`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md032.md)
  blank lines around lists
- [`MD039`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md039.md)
  no spaces inside link text
- [`MD040`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md040.md)
  fenced code blocks must specify a language
- [`MD046`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md046.md)
  fenced code block style: `fenced`
- [`MD047`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md047.md)
  file must end with a single newline
- [`MD048`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md048.md)
  fenced code fence style: `backtick`
- [`MD049`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md049.md)
  emphasis style: `underscore`
- [`MD050`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md050.md)
  strong emphasis style: `asterisk`
- [`MD058`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md058.md)
  blank lines around tables

The following built-in rule is intentionally disabled in the starter config:

- [`MD034`](https://github.com/DavidAnson/markdownlint/blob/main/doc/md034.md)
  bare URLs are allowed by default in this starter kit

## House Style Rules

The active custom rules live in:

- `.markdownlint/rules/house-frontmatter.cjs`
- `.markdownlint/rules/house-heading-case.cjs`
- `.markdownlint/rules/house-typography.cjs`
- `.markdownlint/rules/house-footnotes.cjs`
- `.markdownlint/rules/house-content-cleanup.cjs`

Those scripts currently implement the following checks:

### `.markdownlint/rules/house-frontmatter.cjs`

- `HS001`
  `frontmatter-ordered-when-present`
  When YAML frontmatter is present, enforce the preferred frontmatter key order.
- `HS002`
  `frontmatter-blank-line-after`
  When YAML frontmatter is present and body content follows, require a blank line after it.
- `HS003`
  `frontmatter-required-keys`
  Require `date` and `modified`.
- `HS004`
  `frontmatter-date-format`
  Require `date` and `modified` to use `YYYY-MM-DD`.
- `HS005`
  `frontmatter-no-duplicate-array-values`
  Disallow duplicate values in frontmatter arrays such as `authors`, `tags`, and `aliases`.

### `.markdownlint/rules/house-heading-case.cjs`

- `HS006`
  `heading-title-case`
  Enforce the starter Title Case policy for ATX headings.

### `.markdownlint/rules/house-typography.cjs`

- `HS007`
  `proper-ellipsis`
  Prefer `…` over `...` in prose.
- `HS011`
  `hyphenated-line-break`
  Detect likely copy-paste artifacts where a word is split across a line break with a hyphen.

### `.markdownlint/rules/house-footnotes.cjs`

- `HS008`
  `footnotes-at-bottom`
  Require footnote definitions to remain at the bottom of the document.

### `.markdownlint/rules/house-content-cleanup.cjs`

- `HS009`
  `non-markdown-bullet-symbol`
  Disallow pasted bullet symbols such as `•`, `◦`, or `§` where Markdown list markers are expected.
- `HS010`
  `duplicate-list-marker`
  Detect duplicate or empty list markers that usually come from paste or edit mistakes.

## Customization Guidance

This kit is intentionally opinionated, but it is still only a starting point.
The most likely follow-up customizations are:

1. Narrow or expand the lint globs to match the repository's real Markdown surface.
2. Update the ignore list for generated content, vendored docs, or fixtures.
3. Adjust the frontmatter key order and required keys to match the repository's editorial model.
4. Extend the heading Title Case allow-list with product names and spellings the repository uses frequently.
5. Remove or relax any house rule that turns out to be too specific for the destination repository.
