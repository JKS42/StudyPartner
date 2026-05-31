import {
  summaryContentSchema,
  quizQuestionsSchema,
  validateFileUpload,
  ALLOWED_MIME_TYPES,
  resolveMimeType,
} from '../validators';

describe('validators', () => {
  it('validates summary JSON schema', () => {
    const result = summaryContentSchema.safeParse({
      overview: 'Test overview',
      keyPoints: ['a', 'b'],
      definitions: [{ term: 'T', definition: 'D' }],
      examTips: ['tip'],
    });
    expect(result.success).toBe(true);
  });

  it('validates quiz questions', () => {
    const result = quizQuestionsSchema.safeParse([
      {
        question: 'Q?',
        options: ['a', 'b', 'c', 'd'],
        correctIndex: 0,
        explanation: 'Because',
      },
    ]);
    expect(result.success).toBe(true);
  });

  it('rejects oversized files', () => {
    expect(validateFileUpload('application/pdf', 20 * 1024 * 1024)).toMatch(/15 MB/);
  });

  it('rejects invalid mime types', () => {
    expect(validateFileUpload('application/zip', 1000)).toMatch(/not supported/);
  });

  it('allows valid pdf upload', () => {
    expect(validateFileUpload('application/pdf', 1024)).toBeNull();
    expect(ALLOWED_MIME_TYPES).toContain('application/pdf');
  });

  it('allows word documents', () => {
    expect(
      validateFileUpload(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        1024
      )
    ).toBeNull();
  });

  it('resolves mime type from extension when picker omits it', () => {
    expect(resolveMimeType('application/octet-stream', 'notes.pdf')).toBe('application/pdf');
    expect(resolveMimeType(undefined, 'essay.docx')).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  });
});
