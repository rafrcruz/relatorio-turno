import { of } from 'rxjs';
import { ReportComponent } from './report.component';

describe('ReportComponent tabs', () => {
  function createComponent(): ReportComponent {
    const appState = {
      context$: of({ area: 'Calcinação', date: '2026-06-10', shift: 1 }),
      context: { area: 'Calcinação', date: '2026-06-10', shift: 1 },
      setArea: jasmine.createSpy('setArea'),
      setDate: jasmine.createSpy('setDate'),
      setShift: jasmine.createSpy('setShift')
    };
    const posts = { get: jasmine.createSpy('get') };
    const areasService = { getAreasWithIds: () => of([]) };
    return new ReportComponent(appState as any, posts as any, areasService as any);
  }

  it('switches to Indicadores from the handover summary action', () => {
    const component = createComponent();

    component.openIndicators();

    expect(component.activeTab).toBe('indicadores');
  });

  it('keeps Passagem as the explicit handover tab', () => {
    const component = createComponent();

    component.setTab('passagem');

    expect(component.activeTab).toBe('passagem');
  });
});
