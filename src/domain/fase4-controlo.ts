import type { Fase4Dados, ResultadoFase4, NivelControlo } from './types'

// ============================================
// FASE 4 — Controlo dos Sintomas
// GRESP 2022 / GINA 2022
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

export function calcularFase4(dados: Fase4Dados): ResultadoFase4 {
  return {
    nivelControlo: calcularControlo(dados),
    scoreAct: calcularACT(dados),
    scoreCarat: calcularCARATScore(dados),
    fev1Atual: dados.fev1Atual,
  }
}
