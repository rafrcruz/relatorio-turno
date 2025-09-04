import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface IndicatorDefinition {
  id: number;
  code: string;
  name: string;
  unit: string;
  target?: number;
  description?: string;
  better?: 'lower' | 'higher';
  tolerance?: number; // fractional tolerance for warning threshold
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
    'Recebimento de Bauxita': [
      { id: 13, code: 'ton_recebida', name: 'Toneladas recebidas', unit: 't', target: 5000, better: 'higher' },
      { id: 14, code: 'taxa_receb', name: 'Taxa de recebimento', unit: 't/h', target: 300, better: 'higher' },
      { id: 15, code: 'umidade', name: 'Umidade', unit: '%', target: 8, better: 'lower' },
      { id: 16, code: 'disp_receb', name: 'Disponibilidade', unit: '%', target: 95, better: 'higher' },
      { id: 17, code: 'granulometria_fina', name: 'Granulometria fina', unit: '%', target: 15, better: 'lower' }
    ],
    'Digestão': [
      { id: 18, code: 'temp_digester', name: 'Temperatura', unit: '°C', target: 145, better: 'higher' },
      { id: 19, code: 'pressao_digester', name: 'Pressão', unit: 'bar', target: 5, better: 'higher' },
      { id: 20, code: 'consumo_soda', name: 'Consumo de soda', unit: 'kg/t', target: 110, better: 'lower' },
      { id: 21, code: 'extracao_alumina', name: 'Extração de alumina', unit: '%', target: 85, better: 'higher' },
      { id: 22, code: 'relacao_ac', name: 'Relação A/C', unit: '', target: 1.2, better: 'lower' }
    ],
    'Clarificação': [
      { id: 23, code: 'turbidez', name: 'Turbidez', unit: 'NTU', target: 5, better: 'lower' },
      { id: 24, code: 'remocao_solidos', name: 'Remoção de sólidos', unit: '%', target: 90, better: 'higher' },
      { id: 25, code: 'perda_soda', name: 'Perda de soda no rejeito', unit: 'kg/t', target: 5, better: 'lower' },
      { id: 26, code: 'temp_clarificacao', name: 'Temperatura', unit: '°C', target: 80, better: 'higher' }
    ],
    'Filtro Prensa': [
      { id: 11, code: 'umidade_bolo', name: 'Umidade do bolo', unit: '%', target: 30, better: 'lower' },
      { id: 12, code: 'ciclos_h', name: 'Ciclos por hora', unit: 'ciclos/h', target: 5, better: 'higher' },
      { id: 27, code: 'disp_filtro', name: 'Disponibilidade', unit: '%', target: 92, better: 'higher' },
      { id: 28, code: 'tempo_ciclo', name: 'Tempo de ciclo', unit: 'min', target: 12, better: 'lower' }
    ],
    'Precipitação': [
      { id: 4, code: 'solidos_semente', name: 'Sólidos na semente', unit: '%', target: 10, better: 'lower' },
      { id: 5, code: 'eficiencia_crescimento', name: 'Eficiência de crescimento', unit: 'kg/m³·d', target: 50, better: 'higher' },
      { id: 29, code: 'temp_precipitacao', name: 'Temperatura', unit: '°C', target: 65, better: 'higher' },
      { id: 30, code: 'tempo_residencia', name: 'Tempo de residência', unit: 'h', target: 30, better: 'higher' }
    ],
    'Calcinação': [
      { id: 1, code: 'calciner_temp', name: 'Temperatura de saída do calciner', unit: '°C', target: 950, better: 'higher' },
      { id: 2, code: 'gas_consumption', name: 'Consumo específico de gás', unit: 'Nm³/t', target: 100, better: 'lower' },
      { id: 3, code: 'forno_disp', name: 'Disponibilidade do forno', unit: '%', target: 90, better: 'higher' },
      { id: 31, code: 'loi', name: 'LOI', unit: '%', target: 0.5, better: 'lower' },
      { id: 32, code: 'producao', name: 'Produção', unit: 't', target: 1000, better: 'higher' },
      { id: 33, code: 'bet', name: 'BET', unit: 'm²/g', target: 60, better: 'higher' }
    ],
    'Vapor e Utilidades': [
      { id: 6, code: 'pressao_header', name: 'Pressão', unit: 'bar', target: 40, better: 'higher' },
      { id: 7, code: 'consumo_vapor', name: 'Consumo de vapor', unit: 't/h', target: 100, better: 'lower' },
      { id: 34, code: 'geracao_vapor', name: 'Geração de vapor', unit: 't/h', target: 120, better: 'higher' },
      { id: 35, code: 'eficiencia_caldeira', name: 'Eficiência da caldeira', unit: '%', target: 88, better: 'higher' },
      { id: 36, code: 'make_up_agua', name: 'Make-up de água', unit: 'm³/h', target: 15, better: 'lower' }
    ],
    'Águas e Efluentes': [
      { id: 8, code: 'ph_efluente', name: 'pH', unit: '', target: 7, better: 'lower' },
      { id: 9, code: 'dbo', name: 'DBO', unit: 'mg/L', target: 50, better: 'lower' },
      { id: 10, code: 'vazao', name: 'Vazão', unit: 'm³/h', target: 120, better: 'lower' },
      { id: 37, code: 'sst', name: 'SST', unit: 'mg/L', target: 80, better: 'lower' },
      { id: 38, code: 'aluminio_residual', name: 'Alumínio residual', unit: 'mg/L', target: 2, better: 'lower' }
    ],
    'Automação e Energia': [
      { id: 39, code: 'disp_scada', name: 'Disponibilidade SCADA', unit: '%', target: 98, better: 'higher' },
      { id: 40, code: 'alarmes_criticos', name: 'Alarmes críticos abertos', unit: '', target: 0, better: 'lower' },
      { id: 41, code: 'tma_alarmes', name: 'TMA de alarmes', unit: 'min', target: 5, better: 'lower' },
      { id: 42, code: 'demanda_eletrica', name: 'Demanda elétrica', unit: 'MW', target: 50, better: 'lower' },
      { id: 43, code: 'fator_potencia', name: 'Fator de potência', unit: '', target: 0.95, better: 'higher' }
    ],
    'Porto': [
      { id: 44, code: 'navios_atendidos', name: 'Navios atendidos', unit: '', target: 2, better: 'higher' },
      { id: 45, code: 'taxa_descarga', name: 'Taxa de descarga', unit: 't/h', target: 1500, better: 'higher' },
      { id: 46, code: 'tempo_espera', name: 'Tempo de espera', unit: 'h', target: 2, better: 'lower' },
      { id: 47, code: 'disp_shiploader', name: 'Disponibilidade do shiploader', unit: '%', target: 95, better: 'higher' },
      { id: 48, code: 'eventos_climaticos', name: 'Eventos climáticos', unit: '', target: 0, better: 'lower' }
    ],
    'Meio Ambiente': [
      { id: 49, code: 'particulados', name: 'Particulados', unit: 'mg/Nm³', target: 50, better: 'lower' },
      { id: 50, code: 'ruido', name: 'Ruído', unit: 'dB(A)', target: 70, better: 'lower' },
      { id: 51, code: 'consumo_agua', name: 'Consumo de água', unit: 'm³/turno', target: 1000, better: 'lower' },
      { id: 52, code: 'residuos', name: 'Resíduos', unit: 't/turno', target: 20, better: 'lower' },
      { id: 53, code: 'conformidades', name: 'Conformidades', unit: '%', target: 98, better: 'higher' },
      { id: 54, code: 'incidentes', name: 'Incidentes', unit: '', target: 0, better: 'lower' }
    ]
  };

  constructor() {}

  /**
   * Returns indicators for the given area/date/shift.
   * Values are deterministically simulated around targets.
   */
  getIndicators(area: string, date: string, shift: number): Observable<IndicatorData[]> {
    const defs = this.mockDefinitions[area] || [];
    const data = defs.map((d) => {
      const value = this.generateValue(d, date, shift);
      return { ...d, value, source: 'mock', status: this.evaluateStatus(value, d) };
    });
    return of(data);
  }

  private generateValue(def: IndicatorDefinition, date: string, shift: number): number {
    const base = def.target ?? 0;
    const seed = `${def.code}-${date}-${shift}`;
    const rand = this.pseudoRandom(seed); // 0..1
    const factor = 0.95 + rand * 0.1; // ±5%
    return Number((base * factor).toFixed(2));
  }

  private pseudoRandom(seed: string): number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(31, h) + seed.charCodeAt(i);
    }
    const x = Math.sin(h) * 10000;
    return x - Math.floor(x);
  }

  private evaluateStatus(value: number | null, def: IndicatorDefinition): 'good' | 'warning' | 'critical' | 'unknown' {
    if (value == null || def.target == null) return 'unknown';
    const tol = def.tolerance ?? 0.1;
    if (def.better === 'higher') {
      if (value >= def.target) return 'good';
      if (value >= def.target * (1 - tol)) return 'warning';
      return 'critical';
    } else {
      if (value <= def.target) return 'good';
      if (value <= def.target * (1 + tol)) return 'warning';
      return 'critical';
    }
  }
}
