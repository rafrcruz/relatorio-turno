import { Component } from '@angular/core';
import { AppStateService, ReportContext } from '../../core/app-state.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent {
  readonly context$: Observable<ReportContext> = this.appState.context$;

  constructor(private appState: AppStateService) {}
}
