import { Component, OnInit } from '@angular/core';
import { AppStateService } from '../../core/app-state.service';
import { AreasService, Area } from '../../core/areas.service';
import { ExportService } from '../../core/export.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  areas: Area[] = [];
  exportMessage = '';
  readonly context$ = this.appState.context$;

  constructor(
    private appState: AppStateService,
    private readonly areasService: AreasService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.areasService.getAreasWithIds().subscribe((areas) => (this.areas = areas));
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
    const ctx = this.appState.context;
    const area = this.areas.find((a) => a.name === ctx.area);
    if (!area) {
      this.exportMessage = 'Área inválida para exportação.';
      setTimeout(() => (this.exportMessage = ''), 3000);
      return;
    }
    this.exportMessage = 'Gerando PDF...';
    this.exportService.downloadPdf(area.id, ctx.date, ctx.shift).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-${ctx.date}-t${ctx.shift}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        this.exportMessage = '';
      },
      error: () => {
        this.exportMessage = 'Falha ao exportar PDF.';
        setTimeout(() => (this.exportMessage = ''), 3000);
      },
    });
  }
}
