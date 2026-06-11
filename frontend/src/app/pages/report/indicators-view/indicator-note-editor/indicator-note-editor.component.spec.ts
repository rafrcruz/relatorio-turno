import { of, throwError } from 'rxjs';
import { IndicatorNoteEditorComponent } from './indicator-note-editor.component';
import { MergedIndicator } from '../../../../core/indicator-notes.service';

function indicator(opts: Partial<MergedIndicator> = {}): MergedIndicator {
  return {
    id: 1,
    code: 'calciner_temp',
    name: 'Temperatura de saída do calciner',
    unit: '°C',
    reference: { kind: 'ideal_band', min: 940, max: 960, attentionMin: 920, attentionMax: 980 },
    value: 910,
    status: 'foco',
    source: 'mock',
    note: null,
    inHandover: true,
    focusWithoutNote: true,
    ...opts
  };
}

describe('IndicatorNoteEditorComponent', () => {
  function createComponent(notesOverride: any = {}) {
    const appState = { context: { area: 'Calcinação', date: '2026-06-10', shift: 1 } };
    const notes = {
      upsert: jasmine.createSpy('upsert').and.returnValue(of({})),
      deleteAttachment: jasmine.createSpy('deleteAttachment').and.returnValue(of(undefined)),
      ...notesOverride
    };
    const notify = {
      success: jasmine.createSpy('success'),
      error: jasmine.createSpy('error')
    };
    const component = new IndicatorNoteEditorComponent(appState as any, notes as any, notify as any);
    component.indicator = indicator();
    component.areaId = 1;
    return { component, notes, notify };
  }

  it('requires content for a foco indicator without apontamento', () => {
    const { component, notes, notify } = createComponent();

    component.save();

    expect(notes.upsert).not.toHaveBeenCalled();
    expect(notify.error).toHaveBeenCalled();
  });

  it('saves valid content and closes the editor', () => {
    const { component, notes, notify } = createComponent();
    const saved = jasmine.createSpy('saved');
    const closed = jasmine.createSpy('closed');
    component.saved.subscribe(saved);
    component.closed.subscribe(closed);
    component.content = '<p>Causa provável e ação tomada.</p>';

    component.save();

    expect(notes.upsert).toHaveBeenCalled();
    expect(notify.success).toHaveBeenCalled();
    expect(saved).toHaveBeenCalled();
    expect(closed).toHaveBeenCalled();
  });

  it('keeps the editor open and reports save failure', () => {
    const { component, notify } = createComponent({
      upsert: jasmine.createSpy('upsert').and.returnValue(throwError(() => new Error('fail')))
    });
    component.content = '<p>Acao tomada.</p>';

    component.save();

    expect(component.sending).toBe(false);
    expect(notify.error).toHaveBeenCalledWith('Falha ao salvar apontamento.');
  });
});
