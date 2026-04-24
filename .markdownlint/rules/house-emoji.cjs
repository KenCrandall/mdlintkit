const EMOJI_PATTERN =
  /(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F|\p{Regional_Indicator}{2}|[#*0-9]\uFE0F?\u20E3)/u;

function splitInlineCodeAwareSegments(line) {
  return line.split(/(`[^`]*`)/g).filter(Boolean);
}

function isCodeSegment(segment) {
  return /^`[^`]*`$/.test(segment);
}

module.exports = [
  {
    names: ["HS012", "no-emoji-in-prose"],
    description: "Disallow emoji in Markdown prose outside code spans and fenced code blocks",
    tags: ["typography", "cleanup", "house_style"],
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

        let offset = 0;
        for (const segment of splitInlineCodeAwareSegments(line)) {
          if (!isCodeSegment(segment)) {
            const emojiMatch = segment.match(EMOJI_PATTERN);
            if (emojiMatch && typeof emojiMatch.index === "number") {
              onError({
                lineNumber: index + 1,
                detail: "Expected prose to avoid emoji characters.",
                context: line,
                range: [offset + emojiMatch.index + 1, emojiMatch[0].length]
              });
              break;
            }
          }

          offset += segment.length;
        }
      }
    }
  }
];
