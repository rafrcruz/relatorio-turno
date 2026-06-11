import { IndicatorNotesService, IndicatorNote } from './indicator-notes.service';
import { IndicatorData } from './indicators.service';

function note(partial: Partial<IndicatorNote>): IndicatorNote {
  return {
    id: 1,
    areaId: 1,
    indicatorCode: 'x',
    date: '2026-06-10',
    shift: 1,
    content: '',
    hasApontamento: false,
    includedInHandover: false,
    attachments: [],
    createdAt: '',
    updatedAt: '',
    ...partial
  };
}

function ind(code: string, status: IndicatorData['status']): IndicatorData {
  return {
    id: 1,
    code,
    name: code,
    unit: '',
    reference: { kind: 'higher_better', target: 100, focus: 85 },
    value: 90,
    status,
    source: 'mock'
  };
}

describe('IndicatorNotesService.merge', () => {
  let service: IndicatorNotesService;

  beforeEach(() => {
    service = new IndicatorNotesService(null as any, null as any, null as any);
  });

  it('marks atenção and foco as inHandover automatically', () => {
    const merged = service.merge([ind('a', 'atencao'), ind('b', 'foco'), ind('c', 'na_meta')], []);
    expect(merged.find((m) => m.code === 'a')!.inHandover).toBe(true);
    expect(merged.find((m) => m.code === 'b')!.inHandover).toBe(true);
    expect(merged.find((m) => m.code === 'c')!.inHandover).toBe(false);
  });

  it('includes na_meta only when manually marked', () => {
    const merged = service.merge([ind('c', 'na_meta')], [note({ indicatorCode: 'c', includedInHandover: true })]);
    expect(merged[0].inHandover).toBe(true);
  });

  it('flags foco without apontamento as a pendency', () => {
    const withoutNote = service.merge([ind('b', 'foco')], []);
    expect(withoutNote[0].focusWithoutNote).toBe(true);

    const withNote = service.merge([ind('b', 'foco')], [note({ indicatorCode: 'b', hasApontamento: true })]);
    expect(withNote[0].focusWithoutNote).toBe(false);
  });

  it('does not flag atenção without apontamento as a pendency', () => {
    const merged = service.merge([ind('a', 'atencao')], []);
    expect(merged[0].focusWithoutNote).toBe(false);
  });
});
