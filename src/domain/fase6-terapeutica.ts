import type {
  Fase3Dados, Fase4Dados, Fase5Dados, Fase6Dados, ResultadoFase6, DegrauTerapeutico,
} from './types'
import { calcularControlo } from './fase4-controlo'
import { avaliarFev1Baixo, fatoresDeRisco, temRiscoAgudizacoes } from './fase5-risco'
import { aplicaLimiaresPediatricos } from './idade'

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

// Crianças dos 6 aos 11 anos — Imagem 8 do Guia prático do GRESP.
// Um só percurso, com SABA como alívio; o ICS-formoterol só entra em
// manutenção e alívio (MART), nos Degraus 3 e 4, e em doses próprias.
// Não há ICS-formoterol apenas em SOS nesta idade (a GINA 2025 refere que os
// estudos estão em curso). A alternativa do Degrau 3 segue a GINA 2025
// (Box 4-10): na Imagem 8 essa célula repete a opção preferencial.
const medicacaoPediatrica: Record<DegrauTerapeutico, { preferencial: string; alternativa: string }> = {
  1: {
    preferencial: 'ICS de dose baixa sempre que for usado SABA',
    alternativa: 'Considerar ICS diário em dose baixa',
  },
  2: {
    preferencial: 'ICS diário em dose baixa, com SABA como alívio',
    alternativa: 'Antagonista dos recetores dos leucotrienos (LTRA) diário, ou ICS de dose baixa sempre que for usado SABA',
  },
  3: {
    preferencial: 'Dose baixa de ICS-LABA, ou dose média de ICS, ou dose muito baixa de ICS-formoterol (BUD-FORM 100/6 µg) em manutenção e alívio',
    alternativa: 'Dose baixa de ICS diário associada a LTRA, com SABA como alívio',
  },
  4: {
    preferencial: 'Dose média de ICS-LABA, ou dose baixa de ICS-formoterol (BUD-FORM 200/6 µg) em manutenção e alívio; pedir aconselhamento especializado',
    alternativa: 'Adicionar tiotrópio ou LTRA',
  },
  5: {
    preferencial: 'Referenciar para avaliação fenotípica ± dose mais alta de ICS-LABA ou tratamento adicional (por exemplo, anti-IgE, anti-IL4R)',
    alternativa: 'Adicionar anti-IL5; como último recurso, OCS de baixa dose, considerando os efeitos secundários',
  },
}

/** Seleção do degrau inicial nas crianças dos 6 aos 11 anos (GINA 2025, Box 4-11). */
function selecionarDegrauInicialPediatrico(
  fase3: Fase3Dados,
  fase4: Fase4Dados,
  fase5: Fase5Dados,
  avisos: string[],
): DegrauTerapeutico {
  const maioriaDosDias = fase4.frequenciaSintomasPediatrica === 'maioria-dias'
  const despertar = fase4.despertarSemanal
  const funcaoBaixa = avaliarFev1Baixo(fase3, fase4, fase5).valor

  // Sintomas na maioria dos dias, despertares semanais e função baixa: Degrau 4.
  if (maioriaDosDias && despertar && funcaoBaixa) return 4
  // Sintomas na maioria dos dias ou despertares semanais: Degrau 3.
  if (maioriaDosDias || despertar) return 3
  if (fase4.frequenciaSintomasPediatrica === '2-5-dias-semana') return 2
  if (fase4.frequenciaSintomasPediatrica === 'menos-2-dias-semana') return 1

  // Sem a frequência, não há base para escolher entre os Degraus 1 e 2.
  avisos.push('Frequência dos sintomas por indicar: a sugestão assume o Degrau 2 até ser preenchida (Fase 4).')
  return 2
}

function sintomasRelevantes(fase4: Fase4Dados): boolean {
  return fase4.frequenciaSintomas === 'maioria-dias' || fase4.despertarSemanal
}

function selecionarDegrauInicial(
  fase3: Fase3Dados,
  fase4: Fase4Dados,
  fase5: Fase5Dados,
  percurso: 1 | 2,
): DegrauTerapeutico {
  // Imagem 6.a / 6.b: baixa função respiratória leva a degrau 4.
  if (avaliarFev1Baixo(fase3, fase4, fase5).valor) return 4
  if (sintomasRelevantes(fase4)) return 3

  if (percurso === 1) {
    // O Percurso 1 agrupa o início em Degrau 1-2.
    return 2
  }

  if (fase4.frequenciaSintomas === 'mais-2x-mes') return 2
  // Degrau 1 exige sintomas < 2x/mês E ausência de risco de agudizações.
  return temRiscoAgudizacoes(fase3, fase4, fase5) ? 2 : 1
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

export function obterDescricaoDegrau(resultado: Pick<ResultadoFase6, 'percurso' | 'degrau' | 'degrauInicial'> & { esquema?: ResultadoFase6['esquema'] }): string {
  if (resultado.esquema !== 'pediatrico' && resultado.percurso === 1 && resultado.degrau === 2 && resultado.degrauInicial) {
    return 'Degrau 1-2'
  }
  return `Degrau ${resultado.degrau}`
}

export function calcularFase6(
  fase4: Fase4Dados,
  fase6: Fase6Dados,
  fase5: Fase5Dados,
  fase3: Fase3Dados,
  idade: number | null = null,
): ResultadoFase6 {
  const controlo = calcularControlo(fase4)
  const pediatrico = aplicaLimiaresPediatricos(idade)
  // Nas crianças dos 6 aos 11 anos há um só percurso, com SABA como alívio.
  const percurso = pediatrico ? 2 : fase6.percursoSelecionado
  const degrauAtual = fase6.degrauAtual
  const degrauInicial = degrauAtual === null
  const avisos: string[] = []

  // Sem degrau atual não há nada para ajustar: o doente ainda não faz o que
  // se propõe. Subir, manter ou descer só fazem sentido face a um tratamento
  // em curso, e o mesmo vale para o critério de referenciação do degrau >= 3.
  const ajuste = degrauInicial ? null : calcularAjuste(controlo, fase6)
  const passo = ajuste === 'subir' ? 1 : ajuste === 'descer' ? -1 : 0
  const degrau = degrauAtual === null
    ? (pediatrico
        ? selecionarDegrauInicialPediatrico(fase3, fase4, fase5, avisos)
        : selecionarDegrauInicial(fase3, fase4, fase5, percurso))
    : limitar(degrauAtual + passo)

  const medicamentos = pediatrico
    ? medicacaoPediatrica[degrau]
    : percurso === 1 ? medicacaoPercurso1[degrau] : medicacaoPercurso2[degrau]
  // Conta o degrau que o doente já faz, e não o proposto depois do ajuste: um
  // doente no Degrau 2 sem controlo sobe para o 3, mas não está sem controlo
  // "em degrau >= 3". Abaixo do Degrau 3, a Imagem 9 do GRESP manda rever o
  // diagnóstico e os fatores associados; a partir dele, referenciar. Nas
  // crianças dos 6 aos 11 anos o GRESP refere doses médias de ICS, que
  // correspondem também ao Degrau 3.
  const referenciarEspecialidade = !degrauInicial && controlo !== 'controlada' && (degrauAtual ?? 0) >= 3

  return {
    esquema: pediatrico ? 'pediatrico' : 'adulto',
    avisos,
    degrau,
    degrauInicial,
    percurso,
    ajuste,
    criterioReferenciacao: referenciarEspecialidade,
    referenciarEspecialidade,
    ajustarVerificarPrimeiro: ajuste === 'subir',
    medicacaoPreferencial: medicamentos.preferencial,
    medicacaoAlternativa: medicamentos.alternativa,
    fatoresDeRiscoPresentes: fatoresDeRisco(fase3, fase4, fase5),
  }
}
