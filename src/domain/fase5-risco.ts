import type { Fase3Dados, Fase4Dados, Fase5Dados } from './types'
import { calcularControlo } from './fase4-controlo'

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
//     guia, ao lado do FEV1 baixo, e nunca era usada como fator de risco.
//     Nem o guia (Imagem 4) nem a GINA 2025 (Box 2-2B) dizem a partir de que
//     valor a reversibilidade é elevada, por isso é o médico que a assinala,
//     com o aumento medido na Fase 3 à vista.
//  3. A lista só tinha parte dos fatores da Imagem 4 (GINA 2025, Box 2-2B):
//     a Fase 5 recolhia o contexto clínico, a exposição e as comorbilidades,
//     mas não os contava no risco que decide entre os Degraus 1 e 2. Os
//     "sintomas não controlados" eram uma caixa à parte, independente da
//     classificação da Fase 4; passam a sair dela.

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

/**
 * Caixa marcada à mão que o valor medido, introduzido depois, não confirma.
 * Com valor medido a caixa fica bloqueada e mostra esse valor, pelo que é a
 * única divergência que o médico pode ter criado.
 */
export function divergenciaFev1(
  fase3: Fase3Dados,
  fase4: Fase4Dados,
  fase5: Fase5Dados,
): string | null {
  const { origem, valor, percentagem } = avaliarFev1Baixo(fase3, fase4, fase5)
  if (origem !== 'medido' || !fase5.fev1Baixo || valor) return null
  return `O FEV1 registado é ${percentagem}% do previsto, acima do limiar de ${LIMIAR_FEV1_BAIXO}%, mas a caixa tinha sido assinalada. O valor medido prevalece.`
}

/**
 * Reversibilidade elevada: o guia lista-a como fator de risco de agudização,
 * mas nenhuma das fontes define um limiar. Conta só a marcação do médico.
 */
export function reversibilidadeElevada(fase5: Fase5Dados): boolean {
  return fase5.reversibilidadeElevada
}

export function fatoresDeRisco(
  fase3: Fase3Dados,
  fase4: Fase4Dados,
  fase5: Fase5Dados,
): string[] {
  const fev1 = avaliarFev1Baixo(fase3, fase4, fase5)

  return [
    calcularControlo(fase4) !== 'controlada' && 'Sintomas não controlados (Fase 4)',
    fase5.naoCumprimentoIcs && 'Não cumprimento da terapêutica com ICS',
    fase5.maAdesao && 'Má adesão à terapêutica',
    fase5.tecnicaInalatoriaIncorreta && 'Técnica inalatória incorreta',
    fase5.abusoDeSaba && 'Abuso de SABA (≥ 3 embalagens/ano)',
    fev1.valor && (fev1.origem === 'medido'
      ? `FEV1 ${fev1.percentagem}% do previsto (< ${LIMIAR_FEV1_BAIXO}%)`
      : `FEV1 < ${LIMIAR_FEV1_BAIXO}% do previsto`),
    reversibilidadeElevada(fase5) && 'Reversibilidade broncodilatadora elevada',
    // Contexto clínico e exposição
    fase5.problemasPsicologicos && 'Problemas psicológicos',
    fase5.fatoresSocioeconomicos && 'Fatores socioeconómicos',
    fase5.fumoTabaco && 'Exposição ao fumo do tabaco',
    fase5.biomassa && 'Exposição a biomassa ou poluição atmosférica',
    fase5.alergenios && 'Exposição a alergénios (com sensibilização)',
    // Comorbilidades e outros
    fase5.obesidade && 'Obesidade',
    fase5.rinossinusite && 'Rinossinusite',
    fase5.alergiaAlimentar && 'Alergia alimentar',
    fase5.refluxo && 'Refluxo gastroesofágico',
    fase5.gravidez && 'Gravidez',
    fase5.eosinofilia && 'Eosinofilia',
    // Fatores major e histórico
    fase5.intubacaoOuUciPrevia && 'Intubação ou internamento prévio em UCI por asma',
    fase5.agudizacaoGraveUltimoAno && '≥ 1 agudização grave nos últimos 12 meses',
    (fase5.agudizacoesUltimoAno ?? 0) > 0 && 'Agudizações no último ano',
    (fase5.internamentosUltimoAno ?? 0) > 0 && 'Internamentos por asma no último ano',
  ].filter(Boolean) as string[]
}

export function temRiscoAgudizacoes(
  fase3: Fase3Dados,
  fase4: Fase4Dados,
  fase5: Fase5Dados,
): boolean {
  return fatoresDeRisco(fase3, fase4, fase5).length > 0
}
