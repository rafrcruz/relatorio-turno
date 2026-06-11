import { of } from 'rxjs';
import { AreaIndicatorsComponent } from './area-indicators.component';
import { MergedIndicator } from '../../../core/indicator-notes.service';

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

describe('AreaIndicatorsComponent handover summary', () => {
  it('includes only atenção, foco, and manually marked Na meta indicators', () => {
    const list = [
      merged('ok-plain', 'na_meta'),
      merged('ok-marked', 'na_meta', { inHandover: true, note: { includedInHandover: true } as any }),
      merged('warn', 'atencao'),
      merged('focus', 'foco')
    ];
    const appState = { context$: of({ area: 'Calcinação', date: '2026-06-10', shift: 1 }) };
    const notes = {
      changed$: of(undefined),
      observeMerged: () => of(list)
    };
    const component = new AreaIndicatorsComponent(appState as any, notes as any);

    component.ngOnInit();

    expect(component.handover.map((i) => i.code).sort()).toEqual(['focus', 'ok-marked', 'warn']);
  });

  it('labels focus without apontamento as the mandatory note state', () => {
    const component = new AreaIndicatorsComponent({} as any, {} as any);

    expect(component.noteLabel(merged('focus', 'foco'))).toBe('Foco sem apontamento');
  });
});
