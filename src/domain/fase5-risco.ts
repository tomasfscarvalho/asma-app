import type { Fase3Dados, Fase4Dados, Fase5Dados } from './types'
import { calcularFase3 } from './fase3-provas'

// ============================================
// FASE 5 — Risco futuro
// GRESP 2022 / GINA 2025
// ============================================
//
// Fonte: "Potenciais fatores de risco para as agudizações" do Guia prático do
// GRESP, que enumera medicação, função pulmonar, exposição e histórico de
// agudizações, e afirma que a existência de um ou mais destes fatores aumenta
// o risco.
//
// Dois pontos que a implementação anterior não respeitava:
//
//  1. O FEV1 baixo era apenas uma caixa que o médico marcava, apesar de a
//     aplicação já ter o valor medido. Nada impedia que a Fase 3 registasse
//     55% e a caixa ficasse por marcar — e era a caixa, não o valor, que
//     decidia o degrau terapêutico. Passa a ser derivado, com a marcação
//     manual a servir de recurso quando não há valor introduzido.
//  2. A "reversibilidade broncodilatadora elevada" consta da mesma lista do
//     guia, ao lado do FEV1 baixo, e era calculada na Fase 3 sem nunca ser
//     usada como fator de risco.

export const LIMIAR_FEV1_BAIXO = 60

export interface Fev1Baixo {
  valor: boolean
  /** 'medido' quando vem da espirometria; 'assinalado' quando só há a caixa. */
  origem: 'medido' | 'assinalado'
  percentagem: number | null
}

export function avaliarFev1Baixo(
  fase3: Fase3Dados,
  fase4: Fase4Dados,
  fase5: Fase5Dados,
): Fev1Baixo {
  // O valor de seguimento tem precedência sobre o do diagnóstico, por ser o
  // mais recente.
  const medido = fase4.fev1Atual ?? fase3.fev1Percentagem

  if (medido !== null) {
    return { valor: medido < LIMIAR_FEV1_BAIXO, origem: 'medido', percentagem: medido }
  }
  return { valor: fase5.fev1Baixo, origem: 'assinalado', percentagem: null }
}

/** Divergência entre o valor medido e a caixa marcada, para sinalizar ao médico. */
export function divergenciaFev1(
  fase3: Fase3Dados,
  fase4: Fase4Dados,
  fase5: Fase5Dados,
): string | null {
  const { origem, valor, percentagem } = avaliarFev1Baixo(fase3, fase4, fase5)
  if (origem !== 'medido' || valor === fase5.fev1Baixo) return null

  return valor
    ? `O FEV1 registado é ${percentagem}% do previsto, abaixo do limiar de ${LIMIAR_FEV1_BAIXO}%, mas a caixa não está assinalada. O valor medido prevalece.`
    : `O FEV1 registado é ${percentagem}% do previsto, acima do limiar de ${LIMIAR_FEV1_BAIXO}%, mas a caixa está assinalada. O valor medido prevalece.`
}

/**
 * Reversibilidade elevada: o guia lista-a como fator de risco de agudização.
 * O limiar corresponde ao dobro do critério de positividade.
 */
export function reversibilidadeElevada(fase3: Fase3Dados): boolean {
  return calcularFase3(fase3).reversibilidade === true
    && (fase3.aumentoFev1Percentagem ?? 0) >= 20
}

export function fatoresDeRisco(
  fase3: Fase3Dados,
  fase4: Fase4Dados,
  fase5: Fase5Dados,
): string[] {
  const fev1 = avaliarFev1Baixo(fase3, fase4, fase5)

  return [
    fase5.sintomasNaoControlados && 'Sintomas não controlados',
    fase5.naoCumprimentoIcs && 'Não cumprimento da terapêutica com ICS',
    fase5.maAdesao && 'Má adesão à terapêutica',
    fase5.tecnicaInalatoriaIncorreta && 'Técnica inalatória incorreta',
    fase5.abusoDeSaba && 'Abuso de SABA (≥ 3 embalagens/ano)',
    fev1.valor && (fev1.origem === 'medido'
      ? `FEV1 ${fev1.percentagem}% do previsto (< ${LIMIAR_FEV1_BAIXO}%)`
      : `FEV1 < ${LIMIAR_FEV1_BAIXO}% do previsto`),
    reversibilidadeElevada(fase3) && 'Reversibilidade broncodilatadora elevada',
    fase5.intubacaoOuUciPrevia && 'Intubação ou internamento prévio em UCI por asma',
    fase5.agudizacaoGraveUltimoAno && '≥ 1 agudização grave nos últimos 12 meses',
    (fase5.agudizacoesUltimoAno ?? 0) > 0 && 'Agudizações no último ano',
    (fase5.internamentosUltimoAno ?? 0) > 0 && 'Internamentos por asma no último ano',
    fase5.fumoTabaco && 'Exposição ao fumo do tabaco',
  ].filter(Boolean) as string[]
}

export function temRiscoAgudizacoes(
  fase3: Fase3Dados,
  fase4: Fase4Dados,
  fase5: Fase5Dados,
): boolean {
  return fatoresDeRisco(fase3, fase4, fase5).length > 0
}
