import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface IndicatorDefinition {
  id: number;
  code: string;
  name: string;
  unit: string;
  target?: number;
  description?: string;
}

export interface IndicatorData extends IndicatorDefinition {
  value: number | null;
  source: string;
  status: 'good' | 'warning' | 'critical' | 'unknown';
}

/**
 * Provides indicator definitions and values per area.
 * Currently returns mock data but is ready for future API/PI integration.
 */
@Injectable({ providedIn: 'root' })
export class IndicatorsService {
  private readonly mockDefinitions: Record<string, IndicatorDefinition[]> = {
    'Calcinação': [
      { id: 1, code: 'calciner_temp', name: 'Temperatura de saída do calciner', unit: '°C', target: 950 },
      { id: 2, code: 'gas_consumption', name: 'Consumo específico de gás', unit: 'Nm³/t', target: 100 },
      { id: 3, code: 'forno_disp', name: 'Disponibilidade do forno', unit: '%', target: 90 }
    ],
    'Precipitação': [
      { id: 4, code: 'solidos_semente', name: 'Sólidos na semente', unit: '%', target: 10 },
      { id: 5, code: 'eficiencia_crescimento', name: 'Eficiência de crescimento', unit: 'kg/m³·d', target: 50 }
    ],
    'Vapor e Utilidades': [
      { id: 6, code: 'pressao_header', name: 'Pressão header', unit: 'bar', target: 40 },
      { id: 7, code: 'consumo_vapor', name: 'Consumo de vapor', unit: 't/h', target: 100 }
    ],
    'Águas e Efluentes': [
      { id: 8, code: 'ph_efluente', name: 'pH efluente', unit: '', target: 7 },
      { id: 9, code: 'dbo', name: 'DBO', unit: 'mg/L', target: 50 },
      { id: 10, code: 'vazao', name: 'Vazão', unit: 'm³/h', target: 120 }
    ],
    'Filtro Prensa': [
      { id: 11, code: 'umidade_bolo', name: 'Umidade do bolo', unit: '%', target: 30 },
      { id: 12, code: 'ciclos_h', name: 'Ciclos por hora', unit: 'ciclos/h', target: 5 }
    ]
  };

  constructor() {}

  /**
   * Returns indicators for the given area/date/shift. Mock data ignores date/shift
   * but keeps the parameters for future compatibility.
   */
  getIndicators(area: string, _date: string, _shift: number): Observable<IndicatorData[]> {
    const defs = this.mockDefinitions[area] || [];
    const data = defs.map((d) => {
      const value = this.generateValue(d);
      return { ...d, value, source: 'mock', status: this.evaluateStatus(value, d.target) };
    });
    return of(data);
  }

  private generateValue(def: IndicatorDefinition): number {
    const base = def.target ?? 0;
    const variation = base * (0.8 + Math.random() * 0.4);
    return Number(variation.toFixed(2));
  }

  private evaluateStatus(value: number | null, target?: number): 'good' | 'warning' | 'critical' | 'unknown' {
    if (value == null || target == null) return 'unknown';
    if (value <= target) return 'good';
    if (value <= target * 1.1) return 'warning';
    return 'critical';
  }
}
