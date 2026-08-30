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

// Pontos de corte publicados do Asthma Control Test: <= 19 asma não
// controlada, 20-24 asma bem controlada, 25 controlo total. O Guia prático do
// GRESP recomenda o instrumento mas não publica os pontos de corte, pelo que
// a referência é a do próprio ACT.
export function interpretarAct(score: number | null): string {
  if (score === null) return 'Incompleto — preencha as cinco perguntas.'
  if (score <= 19) return `${score} / 25 — asma não controlada.`
  if (score < 25) return `${score} / 25 — asma bem controlada.`
  return `${score} / 25 — controlo total.`
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

// O guia apresenta os questionários como forma alternativa de realizar a mesma
// avaliação, e não como acréscimo. A classificação continua a sair dos quatro
// domínios, mas quando o questionário aponta em sentido oposto isso é
// sinalizado, em vez de as duas leituras coexistirem sem se verem.
export function detetarDivergencia(
  dados: Fase4Dados,
  nivel: NivelControlo,
  scoreAct: number | null,
  scoreCarat: number | null,
): string | null {
  const dominiosControlada = nivel === 'controlada'

  if (dados.questionarioUsado === 'act' && scoreAct !== null) {
    const actControlada = scoreAct >= 20
    if (dominiosControlada && !actControlada) {
      return `Os quatro domínios classificam a asma como controlada, mas o ACT deu ${scoreAct} (não controlada). Confirmar os domínios com o doente.`
    }
    if (!dominiosControlada && actControlada) {
      return `O ACT deu ${scoreAct} (bem controlada), mas os quatro domínios não classificam a asma como controlada. Confirmar os domínios com o doente.`
    }
  }

  if (dados.questionarioUsado === 'carat' && scoreCarat !== null) {
    const caratControlada = scoreCarat > 24
    if (dominiosControlada && !caratControlada) {
      return `Os quatro domínios classificam a asma como controlada, mas o CARAT deu ${scoreCarat} (controlo global insuficiente). Confirmar os domínios com o doente.`
    }
    if (!dominiosControlada && caratControlada) {
      return `O CARAT deu ${scoreCarat} (bom controlo global), mas os quatro domínios não classificam a asma como controlada. Confirmar os domínios com o doente.`
    }
  }

  return null
}

// A Fase 4 recolhe a frequência de sintomas em duas escalas diferentes, por
// servirem fins distintos: o domínio de controlo da Imagem 3 do guia, que é
// binário e usa o limiar de duas vezes por semana, e a banda de frequência das
// Imagens 6, que serve a seleção do degrau terapêutico. As duas não se
// traduzem uma na outra: a banda intermédia, de duas vezes por mês a menos de
// quatro ou cinco dias por semana, atravessa o limiar do domínio de controlo.
//
// O que se pode afirmar sem julgamento clínico é que duas combinações são
// impossíveis, e são essas que a função sinaliza. A banda intermédia é
// compatível com qualquer valor do domínio e não gera aviso.
export function detetarIncoerenciaSintomas(dados: Fase4Dados): string | null {
  if (dados.frequenciaSintomas === 'maioria-dias' && !dados.sintomasDiurnos) {
    return 'Sintomas na maioria dos dias implicam sintomas diurnos mais de duas vezes por semana, mas o domínio de controlo não está assinalado.'
  }
  if (dados.frequenciaSintomas === 'menos-2x-mes' && dados.sintomasDiurnos) {
    return 'Sintomas menos de duas vezes por mês são incompatíveis com sintomas diurnos mais de duas vezes por semana, que está assinalado.'
  }
  return null
}

export function calcularFase4(dados: Fase4Dados): ResultadoFase4 {
  const nivelControlo = calcularControlo(dados)
  const scoreAct = calcularACT(dados)
  const scoreCarat = calcularCARATScore(dados)

  return {
    nivelControlo,
    scoreAct,
    scoreCarat,
    fev1Atual: dados.fev1Atual,
    divergenciaQuestionario: detetarDivergencia(dados, nivelControlo, scoreAct, scoreCarat),
    incoerenciaSintomas: detetarIncoerenciaSintomas(dados),
  }
}
