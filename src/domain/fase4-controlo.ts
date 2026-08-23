import type { Fase4Dados, ResultadoFase4, NivelControlo } from './types'

// ============================================
// FASE 4 — Controlo dos Sintomas
// GRESP 2022 / GINA 2025
// ============================================

export function calcularControlo(dados: Fase4Dados): NivelControlo {
  const criterios = [
    dados.sintomasDiurnos,
    dados.sintomasNoturnos,
    dados.limitacaoAtividades,
    dados.necessidadeAlivio,
  ].filter(Boolean).length

  if (criterios === 0) return 'controlada'
  if (criterios <= 2) return 'parcialmente-controlada'
  return 'nao-controlada'
}

export function calcularACT(dados: Fase4Dados): number | null {
  const campos = [
    dados.actLimitacaoAtividades,
    dados.actFaltaAr,
    dados.actSintomasNoturnos,
    dados.actUsoAlivio,
    dados.actAutoavaliacao,
  ]

  if (campos.some(c => c === null)) return null

  let soma = 0
  for (const val of campos) {
    soma += val as number
  }
  return soma
}

export function calcularCARATScore(dados: Fase4Dados): number | null {
  const campos = [
    dados.caratNasalCongestion,
    dados.caratSneezing,
    dados.caratRunnyNose,
    dados.caratNasalItching,
    dados.caratSleepDisturbance,
    dados.caratBreathlessness,
    dados.caratWheeze,
    dados.caratChestTightness,
    dados.caratActivityLimitation,
    dados.caratMedicationIncrease,
  ]

  if (campos.some(c => c === null)) return null

  let soma = 0
  for (const val of campos) {
    soma += val as number
  }
  return soma
}

// --- Subescalas do CARAT (CARAT-PT: itens 1-4 vias aéreas superiores /12;
//     itens 5-10 vias aéreas inferiores /18) ---

export function calcularCaratRinite(dados: Fase4Dados): number | null {
  const campos = [
    dados.caratNasalCongestion,
    dados.caratSneezing,
    dados.caratNasalItching,
    dados.caratRunnyNose,
  ]

  if (campos.some(c => c === null)) return null
  return (campos as number[]).reduce((acc, val) => acc + val, 0)
}

export function calcularCaratAsma(dados: Fase4Dados): number | null {
  const campos = [
    dados.caratBreathlessness,
    dados.caratWheeze,
    dados.caratChestTightness,
    dados.caratActivityLimitation,
    dados.caratSleepDisturbance,
    dados.caratMedicationIncrease,
  ]

  if (campos.some(c => c === null)) return null
  return (campos as number[]).reduce((acc, val) => acc + val, 0)
}

// Pontos de corte do formulário CARAT-PT: total > 24 (bom controlo global),
// itens 1-4 > 8 (vias aéreas superiores), itens 5-10 >= 16 (vias aéreas inferiores).
export function interpretarCarat(
  scoreTotal: number | null,
  scoreRinite: number | null,
  scoreAsma: number | null
): string {
  if (scoreTotal === null || scoreRinite === null || scoreAsma === null) {
    return 'Incompleto — preencha todas as perguntas.'
  }

  const global = scoreTotal > 24 ? 'bom controlo global' : 'controlo global insuficiente'
  const rinite = scoreRinite > 8 ? 'rinite controlada' : 'rinite não controlada'
  const asma = scoreAsma >= 16 ? 'asma controlada' : 'asma não controlada'
  return `${scoreTotal} / 30 — ${global}; ${rinite}; ${asma}.`
}

export function calcularFase4(dados: Fase4Dados): ResultadoFase4 {
  return {
    nivelControlo: calcularControlo(dados),
    scoreAct: calcularACT(dados),
    scoreCarat: calcularCARATScore(dados),
    fev1Atual: dados.fev1Atual,
  }
}
