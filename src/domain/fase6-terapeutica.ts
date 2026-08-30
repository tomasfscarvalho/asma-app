import type {
  Fase4Dados, Fase5Dados, Fase6Dados, ResultadoFase6, DegrauTerapeutico,
} from './types'
import { calcularControlo } from './fase4-controlo'

// ============================================
// FASE 6 — Recomendação Terapêutica
// GRESP 2022 / GINA 2025
// ============================================
//
// Fonte: Imagens 6.a e 6.b (seleção do degrau INICIAL) e Imagem 7 (medicação
// de controlo por degrau e percurso) do Guia prático do GRESP.
//
// Três correções face à implementação anterior:
//
//  1. As Imagens 6 selecionam o degrau *inicial*. Para um doente já tratado, o
//     que se ajusta é o degrau que ele já faz. A Fase 6 passa a aceitar esse
//     degrau atual e, quando existe, a recomendação é ele mais o ajuste — o que
//     torna o degrau 5 alcançável pela primeira vez.
//  2. O degrau 1 do Percurso 2 exige, no guia, sintomas < 2x/mês *e* ausência
//     de risco de agudizações. A condição de risco era uma tautologia sobre o
//     FEV1 baixo; passa a olhar para os fatores que a Fase 5 recolhe.
//  3. Descer degrau exige estabilidade prévia, e não apenas controlo na
//     consulta atual.

const medicacaoPercurso1: Record<DegrauTerapeutico, { preferencial: string; alternativa: string }> = {
  1: {
    preferencial: 'Dose baixa de ICS-formoterol conforme necessário',
    alternativa: 'ICS sempre que um SABA for administrado',
  },
  2: {
    preferencial: 'Dose baixa de ICS-formoterol conforme necessário',
    alternativa: 'Dose baixa de manutenção de ICS',
  },
  3: {
    preferencial: 'Dose baixa de manutenção de ICS-formoterol, com ICS-formoterol como alívio',
    alternativa: 'Dose baixa de manutenção de ICS-LABA, com SABA como alívio',
  },
  4: {
    preferencial: 'Dose média de manutenção de ICS-formoterol, com ICS-formoterol como alívio',
    alternativa: 'Dose média ou alta de manutenção de ICS-LABA, com SABA como alívio',
  },
  5: {
    preferencial: 'Adicionar LAMA e referenciar para avaliação fenotípica',
    alternativa: 'Considerar dose elevada de manutenção de ICS-formoterol, com anti-IgE, anti-IL5/5R, anti-IL4R ou anti-TSLP após avaliação especializada',
  },
}

const medicacaoPercurso2: Record<DegrauTerapeutico, { preferencial: string; alternativa: string }> = {
  1: {
    preferencial: 'ICS sempre que um SABA for administrado',
    alternativa: 'Considerar dose baixa de ICS diário',
  },
  2: {
    preferencial: 'Dose baixa de manutenção de ICS',
    alternativa: 'Antagonista dos recetores dos leucotrienos diário',
  },
  3: {
    preferencial: 'Dose baixa de manutenção de ICS-LABA',
    // O guia lista, como outras opções para este degrau, dose média de ICS ou
    // dose baixa de ICS associada a LTRA.
    alternativa: 'Dose média de manutenção de ICS, ou dose baixa de ICS associada a LTRA',
  },
  4: {
    preferencial: 'Dose média ou alta de manutenção de ICS-LABA',
    alternativa: 'Adicionar tiotrópio ou antagonista dos recetores dos leucotrienos',
  },
  5: {
    preferencial: 'Adicionar LAMA e referenciar para avaliação fenotípica',
    alternativa: 'Considerar dose elevada de manutenção de ICS-formoterol, com anti-IgE, anti-IL5/5R, anti-IL4R ou anti-TSLP após avaliação especializada',
  },
}

// --- Risco de agudizações (GRESP 2022, "Potenciais fatores de risco para as
//     agudizações": a existência de 1 ou mais destes fatores aumenta o risco) ---
export function fatoresDeRisco(fase5: Fase5Dados): string[] {
  return [
    fase5.sintomasNaoControlados && 'Sintomas não controlados',
    fase5.naoCumprimentoIcs && 'Não cumprimento da terapêutica com ICS',
    fase5.maAdesao && 'Má adesão à terapêutica',
    fase5.tecnicaInalatoriaIncorreta && 'Técnica inalatória incorreta',
    fase5.abusoDeSaba && 'Abuso de SABA (≥ 3 embalagens/ano)',
    fase5.fev1Baixo && 'FEV1 < 60% do previsto',
    fase5.intubacaoOuUciPrevia && 'Intubação ou internamento prévio em UCI por asma',
    fase5.agudizacaoGraveUltimoAno && '≥ 1 agudização grave nos últimos 12 meses',
    (fase5.agudizacoesUltimoAno ?? 0) > 0 && 'Agudizações no último ano',
    (fase5.internamentosUltimoAno ?? 0) > 0 && 'Internamentos por asma no último ano',
    fase5.fumoTabaco && 'Exposição ao fumo do tabaco',
  ].filter(Boolean) as string[]
}

export function temRiscoAgudizacoes(fase5: Fase5Dados): boolean {
  return fatoresDeRisco(fase5).length > 0
}

function sintomasRelevantes(fase4: Fase4Dados): boolean {
  return fase4.frequenciaSintomas === 'maioria-dias' || fase4.despertarSemanal
}

function selecionarDegrauInicial(
  fase4: Fase4Dados,
  fase5: Fase5Dados,
  percurso: 1 | 2,
): DegrauTerapeutico {
  // Imagem 6.a / 6.b: baixa função respiratória leva a degrau 4.
  if (fase5.fev1Baixo) return 4
  if (sintomasRelevantes(fase4)) return 3

  if (percurso === 1) {
    // O Percurso 1 agrupa o início em Degrau 1-2.
    return 2
  }

  if (fase4.frequenciaSintomas === 'mais-2x-mes') return 2
  // Degrau 1 exige sintomas < 2x/mês E ausência de risco de agudizações.
  return temRiscoAgudizacoes(fase5) ? 2 : 1
}

function limitar(degrau: number): DegrauTerapeutico {
  return Math.min(5, Math.max(1, degrau)) as DegrauTerapeutico
}

function calcularAjuste(
  controlo: string,
  fase6: Fase6Dados,
): 'subir' | 'manter' | 'descer' | null {
  if (controlo === 'nao-controlada' || controlo === 'parcialmente-controlada') return 'subir'
  if (controlo === 'controlada') {
    // Descer só com controlo mantido; não basta a consulta atual.
    return fase6.controloMantidoTresMeses ? 'descer' : 'manter'
  }
  return null
}

export function obterDescricaoDegrau(resultado: Pick<ResultadoFase6, 'percurso' | 'degrau' | 'degrauInicial'>): string {
  if (resultado.percurso === 1 && resultado.degrau === 2 && resultado.degrauInicial) {
    return 'Degrau 1-2'
  }
  return `Degrau ${resultado.degrau}`
}

export function calcularFase6(
  fase4: Fase4Dados,
  fase6: Fase6Dados,
  fase5: Fase5Dados,
): ResultadoFase6 {
  const controlo = calcularControlo(fase4)
  const percurso = fase6.percursoSelecionado
  const ajuste = calcularAjuste(controlo, fase6)

  const degrauAtual = fase6.degrauAtual
  const degrauInicial = degrauAtual === null
  const passo = ajuste === 'subir' ? 1 : ajuste === 'descer' ? -1 : 0
  const degrau = degrauAtual === null
    ? selecionarDegrauInicial(fase4, fase5, percurso)
    : limitar(degrauAtual + passo)

  const medicamentos = percurso === 1 ? medicacaoPercurso1[degrau] : medicacaoPercurso2[degrau]
  const referenciarEspecialidade = controlo !== 'controlada' && degrau >= 3

  return {
    degrau,
    degrauInicial,
    percurso,
    ajuste,
    criterioReferenciacao: referenciarEspecialidade,
    referenciarEspecialidade,
    ajustarVerificarPrimeiro: ajuste === 'subir',
    medicacaoPreferencial: medicamentos.preferencial,
    medicacaoAlternativa: medicamentos.alternativa,
    fatoresDeRiscoPresentes: fatoresDeRisco(fase5),
  }
}
