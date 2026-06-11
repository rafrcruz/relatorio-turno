import { IndicatorsService, ClassificationReference } from './indicators.service';

describe('IndicatorsService classification', () => {
  let service: IndicatorsService;

  beforeEach(() => {
    service = new IndicatorsService();
  });

  it('classifies higher_better correctly', () => {
    const ref: ClassificationReference = { kind: 'higher_better', target: 100, focus: 85 };
    expect(service.evaluateStatus(105, ref)).toBe('na_meta');
    expect(service.evaluateStatus(90, ref)).toBe('atencao');
    expect(service.evaluateStatus(80, ref)).toBe('foco');
    expect(service.evaluateStatus(null, ref)).toBe('unknown');
  });

  it('classifies lower_better correctly', () => {
    const ref: ClassificationReference = { kind: 'lower_better', target: 50, focus: 57.5 };
    expect(service.evaluateStatus(40, ref)).toBe('na_meta');
    expect(service.evaluateStatus(55, ref)).toBe('atencao');
    expect(service.evaluateStatus(60, ref)).toBe('foco');
  });

  it('classifies ideal_band correctly (bilateral)', () => {
    const ref: ClassificationReference = { kind: 'ideal_band', min: 940, max: 960, attentionMin: 920, attentionMax: 980 };
    expect(service.evaluateStatus(950, ref)).toBe('na_meta');
    expect(service.evaluateStatus(930, ref)).toBe('atencao');
    expect(service.evaluateStatus(970, ref)).toBe('atencao');
    expect(service.evaluateStatus(910, ref)).toBe('foco');
    expect(service.evaluateStatus(990, ref)).toBe('foco');
  });

  it('describes the reference as readable bands', () => {
    const ref: ClassificationReference = { kind: 'higher_better', target: 100, focus: 85 };
    const bands = service.describeReference(ref, '%');
    expect(bands.map((b) => b.status)).toEqual(['na_meta', 'atencao', 'foco']);
    expect(bands[0].range).toContain('100');
  });

  it('demo data for Calcinação produces all statuses (SC-007)', (done) => {
    service.getIndicators('Calcinação', '2026-06-10', 1).subscribe((list) => {
      const statuses = new Set(list.map((i) => i.status));
      expect(statuses.has('na_meta')).toBe(true);
      expect(statuses.has('atencao')).toBe(true);
      expect(statuses.has('foco')).toBe(true);
      // covers the three reference kinds
      const kinds = new Set(list.map((i) => i.reference.kind));
      expect(kinds.has('ideal_band')).toBe(true);
      expect(kinds.has('higher_better')).toBe(true);
      expect(kinds.has('lower_better')).toBe(true);
      done();
    });
  });

  it('demo data for Calcinação supports 20 varied indicators for dense validation', (done) => {
    service.getIndicators('Calcinação', '2026-06-10', 1).subscribe((list) => {
      expect(list.length).toBeGreaterThanOrEqual(20);
      expect(new Set(list.map((i) => i.code)).size).toBe(list.length);
      expect(list.some((i) => i.name.length > 35)).toBe(true);
      expect(new Set(list.map((i) => i.unit)).size).toBeGreaterThanOrEqual(6);
      expect(new Set(list.map((i) => i.reference.kind)).size).toBe(3);
      done();
    });
  });
});
