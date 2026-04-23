/** Минимальный SerializedEditorState Lexical для Payload richText (один корень, абзацы). */
export function lexicalFromParagraphs(paragraphs: string[]) {
  const children = paragraphs
    .map((t) => t.trim())
    .filter(Boolean)
    .map((text) => ({
      type: 'paragraph' as const,
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: [
        {
          type: 'text' as const,
          mode: 'normal' as const,
          text,
          detail: 0,
          format: 0,
          style: '',
          version: 1,
        },
      ],
    }))

  return {
    root: {
      type: 'root' as const,
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children,
    },
  }
}
