import { IndicatorsViewComponent } from './indicators-view.component';
import { MergedIndicator } from '../../../core/indicator-notes.service';
import { IndicatorsService } from '../../../core/indicators.service';

function merged(code: string, status: MergedIndicator['status'], opts: Partial<MergedIndicator> = {}): MergedIndicator {
  return {
    id: 1,
    code,
    name: code,
    unit: '',
    reference: { kind: 'higher_better', target: 100, focus: 85 },
    value: 90,
    status,
    source: 'mock',
    note: null,
    inHandover: status === 'atencao' || status === 'foco',
    focusWithoutNote: status === 'foco',
    ...opts
  };
}

describe('IndicatorsViewComponent counters & filters', () => {
  let component: IndicatorsViewComponent;

  beforeEach(() => {
    component = new IndicatorsViewComponent(null as any, null as any, new IndicatorsService(), null as any);
    component.all = [
      merged('a', 'na_meta'),
      merged('b', 'na_meta', { inHandover: true, note: { includedInHandover: true } as any }),
      merged('c', 'atencao'),
      merged('d', 'foco'),
      merged('e', 'foco', { focusWithoutNote: false, note: { hasApontamento: true } as any })
    ];
  });

  it('computes counters correctly', () => {
    expect(component.total).toBe(5);
    expect(component.countByStatus('na_meta')).toBe(2);
    expect(component.countByStatus('atencao')).toBe(1);
    expect(component.countByStatus('foco')).toBe(2);
    expect(component.focoSemApontamento).toBe(1); // only 'd'
    expect(component.inHandoverCount).toBe(4); // b(marked), c, d, e
  });

  it('filters by status', () => {
    component.setFilter('foco');
    expect(component.filtered.map((i) => i.code).sort()).toEqual(['d', 'e']);
  });

  it('filters by pendency (foco sem apontamento)', () => {
    component.setFilter('pendencia');
    expect(component.filtered.map((i) => i.code)).toEqual(['d']);
  });

  it('filters by handover (auto + manual)', () => {
    component.setFilter('passagem');
    expect(component.filtered.map((i) => i.code).sort()).toEqual(['b', 'c', 'd', 'e']);
  });

  it('searches by name', () => {
    component.searchTerm = 'a';
    expect(component.filtered.map((i) => i.code)).toEqual(['a']);
  });

  it('combines search with the active filter', () => {
    component.all = [
      merged('bomba principal longa', 'na_meta'),
      merged('bomba reserva longa', 'foco'),
      merged('pressao', 'foco')
    ];
    component.setFilter('foco');
    component.searchTerm = 'bomba';

    expect(component.filtered.map((i) => i.code)).toEqual(['bomba reserva longa']);
  });

  it('formats row data for tabular display', () => {
    const item = merged('nome muito longo do indicador para validar tabela', 'foco', {
      value: 1234.56,
      unit: 't/h',
      note: { hasApontamento: true } as any,
      focusWithoutNote: false
    });

    expect(component.formattedValue(item)).toBe('1.234,56');
    expect(component.noteLabel(item)).toBe('Com apontamento');
    expect(component.referenceSummary(item)).toContain('Na meta');
  });

  it('clears search and filter together', () => {
    component.setFilter('foco');
    component.searchTerm = 'abc';

    component.clearSearchAndFilter();

    expect(component.activeFilter).toBe('todos');
    expect(component.searchTerm).toBe('');
  });
});
