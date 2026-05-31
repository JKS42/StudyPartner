import { mergeNoteText } from '../noteText';

describe('mergeNoteText', () => {
  it('combines manual and extracted text', () => {
    expect(mergeNoteText('My notes', 'From file')).toBe('My notes\n\nFrom file');
  });

  it('returns undefined when both empty', () => {
    expect(mergeNoteText('', null)).toBeUndefined();
  });

  it('uses extracted only when manual empty', () => {
    expect(mergeNoteText('', 'Extracted')).toBe('Extracted');
  });
});
