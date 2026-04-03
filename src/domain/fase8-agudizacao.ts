import type { Fase8Dados, ResultadoFase8, GravidadeAgudizacao } from './types'

// ============================================
// FASE 8 — Agudização
// GRESP 2022 / GINA 2022
// ============================================

export function calcularFase8(dados: Fase8Dados): ResultadoFase8 {

  // --- TRANSFERÊNCIA IMEDIATA PARA UCI ---
  // Sonolência, confusão mental ou tórax silencioso
  const transferirUci =
    dados.exprimePorFrases === false // exprime por palavras isoladas ou menos

  // --- CLASSIFICAÇÃO DE GRAVIDADE ---
  let gravidade: GravidadeAgudizacao = 'ligeira-moderada'

  const freqRespGrave = dados.idadeMenorCinco
    ? (dados.freqRespiratoria ?? 0) > 40
    : (dados.freqRespiratoria ?? 0) > 30

  const freqCardGrave = (dados.freqCardiaca ?? 0) > 120

  const spo2Grave = dados.pacientePediatrico
    ? (dados.spo2 ?? 100) < 92
    : (dados.spo2 ?? 100) < 90

  const pefGrave = (dados.pefPercentagem ?? 100) <= 50

  const exprimePalavrasIsoladas = dados.exprimePorFrases === false

  const criteriosGrave = [
    freqRespGrave,
    freqCardGrave,
    spo2Grave,
    pefGrave,
    exprimePalavrasIsoladas,
  ].filter(Boolean).length

  if (transferirUci) {
    gravidade = 'critica'
  } else if (criteriosGrave >= 2) {
    gravidade = 'grave'
  }

  // --- NÍVEL DE CUIDADOS ---
  const nivelCuidados =
    gravidade === 'critica' ? 'Transferir para UCI imediatamente' :
    gravidade === 'grave' ? 'Transferir para urgência hospitalar' :
    'Tratar em Cuidados de Saúde Primários'

  return { gravidade, nivelCuidados, transferirUci }
}