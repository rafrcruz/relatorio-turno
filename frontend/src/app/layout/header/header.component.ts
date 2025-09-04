import { Component, OnInit } from '@angular/core';
import { AppStateService } from '../../core/app-state.service';
import { AreasService } from '../../core/areas.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  areas: string[] = [];
  exportMessage = '';
  readonly context$ = this.appState.context$;

  constructor(private appState: AppStateService, private areasService: AreasService) {}

  ngOnInit(): void {
    this.areasService.getAreas().subscribe((areas) => (this.areas = areas));
  }

  onAreaChange(area: string): void {
    this.appState.setArea(area);
  }

  onDateChange(date: string): void {
    this.appState.setDate(date);
  }

  onShiftChange(shift: number): void {
    this.appState.setShift(shift);
  }

  exportPdf(): void {
    this.exportMessage = 'Exportação de PDF ainda não disponível.';
    setTimeout(() => (this.exportMessage = ''), 3000);
  }
}
