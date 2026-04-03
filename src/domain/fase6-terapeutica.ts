import type { Fase4Dados, Fase6Dados, ResultadoFase6, DegrauTerapeutico } from './types'
import { calcularControlo } from './fase4-controlo'

// ============================================
// FASE 6 — Recomendação Terapêutica
// GRESP 2022 / GINA 2022
// ============================================

function selecionarDegrauPercurso1(fase4: Fase4Dados): DegrauTerapeutico {
  const controlo = calcularControlo(fase4)

  // Sintomas na maioria dos dias ou despertar ≥ 1x/semana + baixa função → Degrau 4
  if (fase4.sintomasNoturnos && (fase4.sintomasDiurnos || fase4.limitacaoAtividades)) {
    return 4
  }
  // Sintomas na maioria dos dias ou despertar ≥ 1x/semana → Degrau 3
  if (controlo === 'nao-controlada') return 3

  // Sintomas < 4-5 dias/semana, sem risco → Degraus 1-2
  return 2
}

function selecionarDegrauPercurso2(fase4: Fase4Dados): DegrauTerapeutico {
  const controlo = calcularControlo(fase4)

  // Sintomas na maioria dos dias + baixa função → Degrau 4
  if (fase4.sintomasNoturnos && (fase4.sintomasDiurnos || fase4.limitacaoAtividades)) {
    return 4
  }
  // Sintomas na maioria dos dias → Degrau 3
  if (controlo === 'nao-controlada') return 3

  // Sintomas ≥ 2x/mês mas < maioria dos dias → Degrau 2
  if (controlo === 'parcialmente-controlada') return 2

  // Sintomas < 2x/mês → Degrau 1
  return 1
}

function calcularAjuste(controlo: string): 'subir' | 'manter' | 'descer' | null {
  if (controlo === 'nao-controlada') return 'subir'
  if (controlo === 'parcialmente-controlada') return 'subir'
  if (controlo === 'controlada') return 'descer'
  return null
}

export function calcularFase6(fase4: Fase4Dados, fase6: Fase6Dados): ResultadoFase6 {
  const controlo = calcularControlo(fase4)
  const percurso = fase6.percursoSelecionado

  const degrau = percurso === 1
    ? selecionarDegrauPercurso1(fase4)
    : selecionarDegrauPercurso2(fase4)

  const ajuste = calcularAjuste(controlo)

  // Critério de referenciação: sem controlo após degrau ≥ 3
  const criterioReferenciacao = controlo !== 'controlada' && degrau >= 3

  return { degrau, percurso, ajuste, criterioReferenciacao }
}