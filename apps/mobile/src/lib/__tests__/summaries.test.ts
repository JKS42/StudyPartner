import { normalizeSummaryContent } from '../summaryContent';

describe('normalizeSummaryContent', () => {
  it('accepts camelCase summary JSON', () => {
    const result = normalizeSummaryContent({
      overview: 'Overview text',
      keyPoints: ['One', 'Two'],
      definitions: [{ term: 'T', definition: 'D' }],
      examTips: ['Tip'],
    });
    expect(result?.overview).toBe('Overview text');
    expect(result?.keyPoints).toEqual(['One', 'Two']);
  });

  it('accepts snake_case summary JSON', () => {
    const result = normalizeSummaryContent({
      summary: 'Snake overview',
      key_points: ['Point A'],
      exam_tips: ['Study daily'],
    });
    expect(result?.overview).toBe('Snake overview');
    expect(result?.keyPoints).toEqual(['Point A']);
    expect(result?.examTips).toEqual(['Study daily']);
  });
});
