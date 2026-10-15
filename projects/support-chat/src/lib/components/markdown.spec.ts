import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('renders paragraphs, emphasis and unordered lists', () => {
    expect(renderMarkdown('Text **fett**\n\n- Eintrag\n- Zweiter Eintrag'))
      .toBe('<p>Text <strong>fett</strong></p><ul><li>Eintrag</li><li>Zweiter Eintrag</li></ul>');
  });

  it('escapes raw HTML while preserving safe Markdown formatting', () => {
    expect(renderMarkdown('<img src=x onerror=alert(1)> **Sicher**'))
      .toBe('<p>&lt;img src=x onerror=alert(1)&gt; <strong>Sicher</strong></p>');
  });
});
