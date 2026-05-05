import type { Fase4Dados, Fase6Dados, ResultadoFase6, DegrauTerapeutico } from './types'
import { calcularControlo } from './fase4-controlo'

// ============================================
// FASE 6 - Recomendacao Terapeutica
// GRESP 2022 / GINA 2022
// ============================================

const medicacaoPercurso1: Record<DegrauTerapeutico, { preferencial: string; alternativa: string }> = {
  1: {
    preferencial: 'Dose baixa ICS-formoterol conforme necessario',
    alternativa: 'ICS sempre que SABA for administrado',
  },
  2: {
    preferencial: 'Dose baixa ICS-formoterol conforme necessario',
    alternativa: 'Dose baixa ICS de manutencao',
  },
  3: {
    preferencial: 'Dose baixa ICS-formoterol de manutencao + alivio',
    alternativa: 'Dose baixa ICS-LABA de manutencao',
  },
  4: {
    preferencial: 'Dose media ICS-formoterol de manutencao + alivio. Adicionar LAMA se insuficiente',
    alternativa: 'Dose media/alta ICS-LABA de manutencao',
  },
  5: {
    preferencial: 'Referenciar para avaliacao fenotipica',
    alternativa: 'Considerar LAMA e terapeutica biologica apos avaliacao especializada',
  },
}

const medicacaoPercurso2: Record<DegrauTerapeutico, { preferencial: string; alternativa: string }> = {
  1: {
    preferencial: 'ICS sempre que SABA for administrado',
    alternativa: 'Considerar ICS diario em dose baixa',
  },
  2: {
    preferencial: 'Dose baixa ICS de manutencao',
    alternativa: 'Antagonista do recetor de leucotrieno diario',
  },
  3: {
    preferencial: 'Dose baixa ICS-LABA de manutencao',
    alternativa: 'Dose baixa de ICS-LABA',
  },
  4: {
    preferencial: 'Dose media/alta ICS-LABA de manutencao',
    alternativa: 'Adicionar tiotropio ou LTRA',
  },
  5: {
    preferencial: 'Referenciar para avaliacao fenotipica',
    alternativa: 'Adicionar anti-IL5 ou dose diaria baixa de corticoide oral se necessario',
  },
}

function temSintomasNaMaioriaDosDias(fase4: Fase4Dados): boolean {
  return fase4.frequenciaSintomas === 'maioria-dias'
}

function temDespertarSemanal(fase4: Fase4Dados): boolean {
  return fase4.despertarSemanal
}

function temRiscoAgudizacoes(fev1Baixo: boolean): boolean {
  return fev1Baixo
}

function selecionarDegrauPercurso1(fase4: Fase4Dados, fev1Baixo: boolean): DegrauTerapeutico {
  const sintomasRelevantes = temSintomasNaMaioriaDosDias(fase4) || temDespertarSemanal(fase4)

  if (sintomasRelevantes && fev1Baixo) return 4
  if (sintomasRelevantes) return 3

  // No GRESP, o Percurso 1 agrupa o inicio em Degraus 1-2.
  return 2
}

function selecionarDegrauPercurso2(fase4: Fase4Dados, fev1Baixo: boolean): DegrauTerapeutico {
  const sintomasRelevantes = temSintomasNaMaioriaDosDias(fase4) || temDespertarSemanal(fase4)

  if (sintomasRelevantes && fev1Baixo) return 4
  if (sintomasRelevantes) return 3

  if (fase4.frequenciaSintomas === 'mais-2x-mes') return 2
  if (!temRiscoAgudizacoes(fev1Baixo)) return 1

  return 2
}

function calcularAjuste(controlo: string): 'subir' | 'manter' | 'descer' | null {
  if (controlo === 'nao-controlada') return 'subir'
  if (controlo === 'parcialmente-controlada') return 'subir'
  if (controlo === 'controlada') return 'descer'
  return null
}

export function obterDescricaoDegrau(resultado: Pick<ResultadoFase6, 'percurso' | 'degrau'>): string {
  if (resultado.percurso === 1 && resultado.degrau === 2) return 'Degrau 1-2'
  return `Degrau ${resultado.degrau}`
}

export function calcularFase6(
  fase4: Fase4Dados,
  fase6: Fase6Dados,
  fev1Baixo: boolean
): ResultadoFase6 {
  const controlo = calcularControlo(fase4)
  const percurso = fase6.percursoSelecionado

  const degrau = percurso === 1
    ? selecionarDegrauPercurso1(fase4, fev1Baixo)
    : selecionarDegrauPercurso2(fase4, fev1Baixo)

  const ajuste = calcularAjuste(controlo)
  const medicamentos = percurso === 1 ? medicacaoPercurso1[degrau] : medicacaoPercurso2[degrau]
  const referenciarEspecialidade = controlo !== 'controlada' && degrau >= 3
  const ajustarVerificarPrimeiro = ajuste === 'subir'

  return {
    degrau,
    percurso,
    ajuste,
    criterioReferenciacao: referenciarEspecialidade,
    referenciarEspecialidade,
    ajustarVerificarPrimeiro,
    medicacaoPreferencial: medicamentos.preferencial,
    medicacaoAlternativa: medicamentos.alternativa,
  }
}
