import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/** Operational status of an indicator for the selected context. */
export type IndicatorStatus = 'na_meta' | 'atencao' | 'foco' | 'unknown';

/**
 * Classification reference: the rule that maps a value to a status.
 * Three rule kinds cover the operational variants. Each uses at most two
 * cut points per direction, so it expresses ranges — never a "simple target".
 */
export type ClassificationReference =
  | {
      // Faixa ideal entre min e max (bilateral).
      kind: 'ideal_band';
      min: number;
      max: number;
      attentionMin: number; // limite inferior de Atenção (abaixo disso = Foco)
      attentionMax: number; // limite superior de Atenção (acima disso = Foco)
    }
  | {
      // Quanto maior melhor. focus < target.
      kind: 'higher_better';
      target: number; // >= target => Na meta
      focus: number; // < focus => Foco; [focus, target) => Atenção
    }
  | {
      // Quanto menor melhor. focus > target.
      kind: 'lower_better';
      target: number; // <= target => Na meta
      focus: number; // > focus => Foco; (target, focus] => Atenção
    };

/** A compact, human-readable band of the reference for display. */
export interface ReferenceBand {
  status: Exclude<IndicatorStatus, 'unknown'>;
  label: string; // "Na meta" | "Atenção" | "Foco"
  range: string; // e.g. ">= 90", "80–90", "< 80"
}

export interface IndicatorDefinition {
  id: number;
  code: string;
  name: string;
  unit: string;
  reference: ClassificationReference;
}

export interface IndicatorData extends IndicatorDefinition {
  value: number | null;
  status: IndicatorStatus;
  source: string;
}

/** Internal helpers to declare references compactly. */
function higher(target: number, focusFactor = 0.85): ClassificationReference {
  return { kind: 'higher_better', target, focus: round(target * focusFactor) };
}
function lower(target: number, focusFactor = 1.15): ClassificationReference {
  return { kind: 'lower_better', target, focus: round(target * focusFactor) };
}
function band(min: number, max: number, attentionMin: number, attentionMax: number): ClassificationReference {
  return { kind: 'ideal_band', min, max, attentionMin, attentionMax };
}
function round(n: number): number {
  return Number(n.toFixed(2));
}

/**
 * Provides indicator definitions and simulated values per area/date/shift.
 * Values are mock (deterministic) but the classification reference and status
 * are real and consumed by the dedicated indicators view and the handover summary.
 */
@Injectable({ providedIn: 'root' })
export class IndicatorsService {
  private readonly mockDefinitions: Record<string, IndicatorDefinition[]> = {
    'Recebimento de Bauxita': [
      { id: 13, code: 'ton_recebida', name: 'Toneladas recebidas', unit: 't', reference: higher(5000) },
      { id: 14, code: 'taxa_receb', name: 'Taxa de recebimento', unit: 't/h', reference: higher(300) },
      { id: 15, code: 'umidade', name: 'Umidade', unit: '%', reference: lower(8) },
      { id: 16, code: 'disp_receb', name: 'Disponibilidade', unit: '%', reference: higher(95, 0.9) },
      { id: 17, code: 'granulometria_fina', name: 'Granulometria fina', unit: '%', reference: lower(15) }
    ],
    'Digestão': [
      { id: 18, code: 'temp_digester', name: 'Temperatura', unit: '°C', reference: band(143, 147, 140, 150) },
      { id: 19, code: 'pressao_digester', name: 'Pressão', unit: 'bar', reference: band(4.7, 5.3, 4.4, 5.6) },
      { id: 20, code: 'consumo_soda', name: 'Consumo de soda', unit: 'kg/t', reference: lower(110) },
      { id: 21, code: 'extracao_alumina', name: 'Extração de alumina', unit: '%', reference: higher(85, 0.92) },
      { id: 22, code: 'relacao_ac', name: 'Relação A/C', unit: '', reference: band(1.15, 1.25, 1.1, 1.3) }
    ],
    'Clarificação': [
      { id: 23, code: 'turbidez', name: 'Turbidez', unit: 'NTU', reference: lower(5) },
      { id: 24, code: 'remocao_solidos', name: 'Remoção de sólidos', unit: '%', reference: higher(90, 0.93) },
      { id: 25, code: 'perda_soda', name: 'Perda de soda no rejeito', unit: 'kg/t', reference: lower(5) },
      { id: 26, code: 'temp_clarificacao', name: 'Temperatura', unit: '°C', reference: band(78, 82, 74, 86) }
    ],
    'Filtro Prensa': [
      { id: 11, code: 'umidade_bolo', name: 'Umidade do bolo', unit: '%', reference: lower(30) },
      { id: 12, code: 'ciclos_h', name: 'Ciclos por hora', unit: 'ciclos/h', reference: higher(5) },
      { id: 27, code: 'disp_filtro', name: 'Disponibilidade', unit: '%', reference: higher(92, 0.9) },
      { id: 28, code: 'tempo_ciclo', name: 'Tempo de ciclo', unit: 'min', reference: lower(12) }
    ],
    'Precipitação': [
      { id: 4, code: 'solidos_semente', name: 'Sólidos na semente', unit: '%', reference: lower(10) },
      { id: 5, code: 'eficiencia_crescimento', name: 'Eficiência de crescimento', unit: 'kg/m³·d', reference: higher(50) },
      { id: 29, code: 'temp_precipitacao', name: 'Temperatura', unit: '°C', reference: band(63, 67, 60, 70) },
      { id: 30, code: 'tempo_residencia', name: 'Tempo de residência', unit: 'h', reference: higher(30, 0.9) }
    ],
    'Calcinação': [
      { id: 1, code: 'calciner_temp', name: 'Temperatura de saída do calciner', unit: '°C', reference: band(940, 960, 920, 980) },
      { id: 2, code: 'gas_consumption', name: 'Consumo específico de gás', unit: 'Nm³/t', reference: lower(100) },
      { id: 3, code: 'forno_disp', name: 'Disponibilidade do forno', unit: '%', reference: higher(90, 0.9) },
      { id: 31, code: 'loi', name: 'LOI', unit: '%', reference: lower(0.5) },
      { id: 32, code: 'producao', name: 'Produção', unit: 't', reference: higher(1000) },
      { id: 33, code: 'bet', name: 'BET', unit: 'm²/g', reference: band(55, 65, 50, 70) }
    ],
    'Vapor e Utilidades': [
      { id: 6, code: 'pressao_header', name: 'Pressão', unit: 'bar', reference: band(38, 42, 35, 45) },
      { id: 7, code: 'consumo_vapor', name: 'Consumo de vapor', unit: 't/h', reference: lower(100) },
      { id: 34, code: 'geracao_vapor', name: 'Geração de vapor', unit: 't/h', reference: higher(120) },
      { id: 35, code: 'eficiencia_caldeira', name: 'Eficiência da caldeira', unit: '%', reference: higher(88, 0.92) },
      { id: 36, code: 'make_up_agua', name: 'Make-up de água', unit: 'm³/h', reference: lower(15) }
    ],
    'Águas e Efluentes': [
      { id: 8, code: 'ph_efluente', name: 'pH', unit: '', reference: band(6.5, 8.5, 6, 9) },
      { id: 9, code: 'dbo', name: 'DBO', unit: 'mg/L', reference: lower(50) },
      { id: 10, code: 'vazao', name: 'Vazão', unit: 'm³/h', reference: lower(120) },
      { id: 37, code: 'sst', name: 'SST', unit: 'mg/L', reference: lower(80) },
      { id: 38, code: 'aluminio_residual', name: 'Alumínio residual', unit: 'mg/L', reference: lower(2) }
    ],
    'Automação e Energia': [
      { id: 39, code: 'disp_scada', name: 'Disponibilidade SCADA', unit: '%', reference: higher(98, 0.95) },
      { id: 40, code: 'alarmes_criticos', name: 'Alarmes críticos abertos', unit: '', reference: lower(0.0001, 1) },
      { id: 41, code: 'tma_alarmes', name: 'TMA de alarmes', unit: 'min', reference: lower(5) },
      { id: 42, code: 'demanda_eletrica', name: 'Demanda elétrica', unit: 'MW', reference: lower(50) },
      { id: 43, code: 'fator_potencia', name: 'Fator de potência', unit: '', reference: band(0.95, 1, 0.92, 1) }
    ],
    'Porto': [
      { id: 44, code: 'navios_atendidos', name: 'Navios atendidos', unit: '', reference: higher(2) },
      { id: 45, code: 'taxa_descarga', name: 'Taxa de descarga', unit: 't/h', reference: higher(1500) },
      { id: 46, code: 'tempo_espera', name: 'Tempo de espera', unit: 'h', reference: lower(2) },
      { id: 47, code: 'disp_shiploader', name: 'Disponibilidade do shiploader', unit: '%', reference: higher(95, 0.9) },
      { id: 48, code: 'eventos_climaticos', name: 'Eventos climáticos', unit: '', reference: lower(0.0001, 1) }
    ],
    'Meio Ambiente': [
      { id: 49, code: 'particulados', name: 'Particulados', unit: 'mg/Nm³', reference: lower(50) },
      { id: 50, code: 'ruido', name: 'Ruído', unit: 'dB(A)', reference: lower(70) },
      { id: 51, code: 'consumo_agua', name: 'Consumo de água', unit: 'm³/turno', reference: lower(1000) },
      { id: 52, code: 'residuos', name: 'Resíduos', unit: 't/turno', reference: lower(20) },
      { id: 53, code: 'conformidades', name: 'Conformidades', unit: '%', reference: higher(98, 0.95) },
      { id: 54, code: 'incidentes', name: 'Incidentes', unit: '', reference: lower(0.0001, 1) }
    ]
  };

  /**
   * Returns indicators for the given area/date/shift with simulated values
   * and the derived status. Distribution is deterministic and guarantees that
   * any area with several indicators shows Na meta, Atenção and Foco cases.
   */
  getIndicators(area: string, date: string, shift: number): Observable<IndicatorData[]> {
    const defs = this.mockDefinitions[area] || [];
    // Guarantee coverage: the first three indicators of the area take the three
    // statuses (rotated by date/shift) so any area with >=3 indicators shows all.
    const order: IndicatorStatus[] = ['na_meta', 'atencao', 'foco'];
    const rot = Math.floor(this.pseudoRandom(`${area}-${date}-${shift}-rot`) * 3) % 3;
    const forced = [order[rot], order[(rot + 1) % 3], order[(rot + 2) % 3]];

    const data = defs.map((d, i) => {
      const target = i < 3 ? forced[i] : this.bucketStatus(d, date, shift);
      const r = this.pseudoRandom(`${d.code}-${date}-${shift}-value`);
      const value = this.sampleValue(d.reference, target, r);
      return { ...d, value, source: 'mock', status: this.evaluateStatus(value, d.reference) };
    });
    return of(data);
  }

  /** Classifies a value against a reference. */
  evaluateStatus(value: number | null, ref: ClassificationReference): IndicatorStatus {
    if (value == null) return 'unknown';
    switch (ref.kind) {
      case 'ideal_band':
        if (value >= ref.min && value <= ref.max) return 'na_meta';
        if (value >= ref.attentionMin && value <= ref.attentionMax) return 'atencao';
        return 'foco';
      case 'higher_better':
        if (value >= ref.target) return 'na_meta';
        if (value >= ref.focus) return 'atencao';
        return 'foco';
      case 'lower_better':
        if (value <= ref.target) return 'na_meta';
        if (value <= ref.focus) return 'atencao';
        return 'foco';
    }
  }

  /** Builds a compact, readable description of the reference bands. */
  describeReference(ref: ClassificationReference, unit: string): ReferenceBand[] {
    const u = unit ? ` ${unit}` : '';
    const n = (v: number) => `${Number(v)}${u}`;
    switch (ref.kind) {
      case 'ideal_band':
        return [
          { status: 'na_meta', label: 'Na meta', range: `${Number(ref.min)}–${n(ref.max)}` },
          {
            status: 'atencao',
            label: 'Atenção',
            range: `${Number(ref.attentionMin)}–${Number(ref.min)} e ${Number(ref.max)}–${n(ref.attentionMax)}`
          },
          { status: 'foco', label: 'Foco', range: `< ${Number(ref.attentionMin)} ou > ${n(ref.attentionMax)}` }
        ];
      case 'higher_better':
        return [
          { status: 'na_meta', label: 'Na meta', range: `≥ ${n(ref.target)}` },
          { status: 'atencao', label: 'Atenção', range: `${Number(ref.focus)}–${n(ref.target)}` },
          { status: 'foco', label: 'Foco', range: `< ${n(ref.focus)}` }
        ];
      case 'lower_better':
        return [
          { status: 'na_meta', label: 'Na meta', range: `≤ ${n(ref.target)}` },
          { status: 'atencao', label: 'Atenção', range: `${Number(ref.target)}–${n(ref.focus)}` },
          { status: 'foco', label: 'Foco', range: `> ${n(ref.focus)}` }
        ];
    }
  }

  /** Selects a status bucket (~55% Na meta, ~25% Atenção, ~20% Foco) for non-forced indicators. */
  private bucketStatus(def: IndicatorDefinition, date: string, shift: number): IndicatorStatus {
    const r = this.pseudoRandom(`${def.code}-${date}-${shift}-bucket`);
    return r < 0.55 ? 'na_meta' : r < 0.8 ? 'atencao' : 'foco';
  }

  /**
   * Samples a value comfortably inside the band for the desired status, so the
   * recomputed status matches the intent (no boundary drift).
   */
  private sampleValue(ref: ClassificationReference, status: IndicatorStatus, r: number): number {
    const inside = 0.2 + 0.6 * r; // 0.2..0.8 — strictly interior fraction
    switch (ref.kind) {
      case 'ideal_band': {
        if (status === 'na_meta') return round(ref.min + (ref.max - ref.min) * inside);
        if (status === 'atencao') {
          return r < 0.5
            ? round(ref.attentionMin + (ref.min - ref.attentionMin) * inside)
            : round(ref.max + (ref.attentionMax - ref.max) * inside);
        }
        const span = (ref.attentionMax - ref.attentionMin) * 0.25 || 1;
        return r < 0.5
          ? round(ref.attentionMin - (0.2 + 0.6 * r) * span)
          : round(ref.attentionMax + (0.2 + 0.6 * r) * span);
      }
      case 'higher_better': {
        if (status === 'na_meta') return round(ref.target * (1.02 + 0.06 * r));
        if (status === 'atencao') return round(ref.focus + (ref.target - ref.focus) * inside);
        return round(Math.max(0, ref.focus * (0.7 + 0.2 * r)));
      }
      case 'lower_better': {
        if (status === 'na_meta') return round(Math.max(0, ref.target * (0.85 + 0.1 * r)));
        if (status === 'atencao') {
          if (ref.focus <= ref.target) return round(ref.focus * (1.05 + 0.2 * r)); // degenerate band → Foco
          return round(ref.target + (ref.focus - ref.target) * inside);
        }
        return round(ref.focus * (1.05 + 0.2 * r) || ref.focus + 1);
      }
    }
  }

  private pseudoRandom(seed: string): number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(31, h) + seed.charCodeAt(i);
    }
    const x = Math.sin(h) * 10000;
    return x - Math.floor(x);
  }
}
