// Testes do relatório SOAP.
//
// É o produto final da ferramenta e a peça com mais ramificações condicionais,
// e esteve sem cobertura enquanto as correções clínicas estavam por fazer —
// testá-lo antes teria fixado os defeitos conhecidos como comportamento de
// referência. Feitas as correções, estes testes passam a proteger o que ficou
// certo, com particular atenção àquilo que o relatório omitia.

import { describe, it, expect } from 'vitest'
import { gerarRelatorioSOAP } from '../src/domain/relatorio'
import {
  dadosFase3, dadosFase4, dadosFase5, dadosFase6, dadosFase7, dadosFase8,
} from './_fixtures'
import type { Paciente } from '../src/domain/types'

const paciente: Paciente = {
  nome: 'Maria Alves Pereira',
  dataNascimento: '1979-06-14',
  sexo: 'feminino',
  numeroUtente: '284517903',
  cartaoCidadao: '',
  contacto: '',
  jaEmICS: false,
}

function relatorio(o: Partial<Parameters<typeof gerarRelatorioSOAP>[0]> = {}) {
  return gerarRelatorioSOAP({
    paciente,
    fase1: {
      sibilancia: true, dispneia: true, tosse: false, opressaoToracica: false,
      maisDe1Sintoma: true, sintomasVariaveis: true,
      agravamComExercicio: true, agravamComFrio: false,
      agravamComAlergenios: false, agravamComInfecoes: false,
      sintomasMaisde1xSemana: true, sintomasNoturnosOuManha: true,
      tosseIsolada: false, tosseProdutivaCronica: false,
      dispneiaTonturasParestesias: false, dorToracica: false,
      dispneiaPorExercicioComInspiracao: false,
      inicioNaInfancia: true, riniteOuEczema: true,
      familiarAsmaAtopia: false, sensibilizacaoAlergenica: false,
      sibilosNaExpiracao: true, exameFisicoNormal: false,
      silencioRespiratorio: false,
    },
    fase2: { diferenciaisExcluidos: ['DPOC'] },
    fase3: dadosFase3({ fev1Litros: 2.1, fvcLitros: 3, fev1Percentagem: 68 }),
    fase4: dadosFase4({ sintomasDiurnos: true, questionarioUsado: 'act' }),
    fase5: dadosFase5(),
    fase6: dadosFase6(),
    fase7: dadosFase7(),
    fase8: dadosFase8(),
    decisaoDiagnostica: 'confirmado',
    ...o,
  })
}

// ============================================================ o que faltava
describe('O relatório imprime o que a aplicação recolhe', () => {
  it('inclui a referenciação, que antes ficava só no store', () => {
    const r = relatorio({ fase7: dadosFase7({ suspeitaAsmaOcupacional: true }) })
    expect(r).toContain('Referenciação para consulta de especialidade')
    expect(r).toContain('Suspeita de asma ocupacional')
  })

  it('diz explicitamente quando não há critérios de referenciação', () => {
    expect(relatorio()).toContain('Não foram identificados critérios de referenciação')
  })

  it('inclui o silêncio respiratório, que antes só existia no ecrã', () => {
    const f1 = { ...relatorioBase().fase1, silencioRespiratorio: true }
    const r = relatorio({ fase1: f1 })
    expect(r).toContain('SILÊNCIO RESPIRATÓRIO')
    expect(r).toContain('obstrução brônquica muito grave')
  })

  it('inclui as comorbilidades da Fase 5', () => {
    const r = relatorio({ fase5: dadosFase5({ obesidade: true, refluxo: true }) })
    expect(r).toContain('Obesidade')
    expect(r).toContain('Refluxo gastroesofágico')
  })

  it('inclui a história clínica e o exame físico da Fase 1', () => {
    const r = relatorio()
    expect(r).toContain('História clínica e familiar')
    expect(r).toContain('Início dos sintomas na infância')
    expect(r).toContain('Exame físico')
    expect(r).toContain('Sibilos na expiração')
  })

  it('inclui o número de internamentos, que o guia manda registar', () => {
    const r = relatorio({ fase5: dadosFase5({ internamentosUltimoAno: 2 }) })
    expect(r).toContain('internamentos por asma no último ano: 2')
  })
})

// ============================================================ Fase 3
describe('O relatório apresenta a confirmação funcional em dois blocos', () => {
  it('não usa o contador antigo de critérios', () => {
    expect(relatorio()).not.toContain('/3')
    expect(relatorio()).not.toMatch(/Critérios objetivos positivos/)
  })

  it('nomeia os dois blocos da Imagem 2', () => {
    const r = relatorio()
    expect(r).toContain('Limitação ao fluxo expiratório')
    expect(r).toContain('Confirmação da variabilidade ao fluxo expiratório')
  })

  it('distingue "não avaliado" de "negativo"', () => {
    const r = relatorio()
    expect(r).toContain('Não avaliado')
    expect(r).toContain('Confirmação funcional incompleta')
  })

  it('declara a confirmação quando a variabilidade está documentada', () => {
    const f3 = dadosFase3({
      fev1Litros: 2.1, fvcLitros: 3,
      aumentoFev1Percentagem: 15, aumentoFev1ml: 320, variabilidadePef: 14,
    })
    expect(relatorio({ fase3: f3 })).toContain('variabilidade ao fluxo expiratório documentada')
  })
})

// ============================================================ questionários
describe('O relatório interpreta o questionário', () => {
  it('o ACT aparece com a leitura, não apenas com o número', () => {
    const f4 = dadosFase4({
      questionarioUsado: 'act', sintomasDiurnos: true,
      actLimitacaoAtividades: 3, actFaltaAr: 3, actSintomasNoturnos: 3,
      actUsoAlivio: 3, actAutoavaliacao: 3,
    })
    expect(relatorio({ fase4: f4 })).toContain('15 / 25 — asma não controlada')
  })

  it('sinaliza a divergência entre os domínios e o questionário', () => {
    const f4 = dadosFase4({
      questionarioUsado: 'act',
      actLimitacaoAtividades: 3, actFaltaAr: 3, actSintomasNoturnos: 3,
      actUsoAlivio: 3, actAutoavaliacao: 3,
    })
    expect(relatorio({ fase4: f4 })).toContain('ACT deu 15')
  })

  it('sinaliza a incoerência entre as duas escalas de frequência', () => {
    const f4 = dadosFase4({ frequenciaSintomas: 'maioria-dias', sintomasDiurnos: false })
    expect(relatorio({ fase4: f4 })).toContain('implicam sintomas diurnos')
  })

  // Um valor pré-selecionado dá um aviso a quem nunca respondeu à pergunta.
  it('não inventa incoerência quando a frequência não foi registada', () => {
    const r = relatorio({ fase4: dadosFase4({ sintomasDiurnos: true }) })
    expect(r).not.toContain('incompatíveis')
    expect(r).toContain('Frequência dos sintomas: Não registada')
  })

  it('imprime a frequência escolhida, que decide o degrau inicial', () => {
    const f4 = dadosFase4({ frequenciaSintomas: 'maioria-dias', sintomasDiurnos: true })
    expect(relatorio({ fase4: f4 })).toContain('Frequência dos sintomas: na maioria dos dias')
  })
})

// ============================================================ agudização
describe('O relatório trata a agudização', () => {
  it('não inclui o bloco quando nada foi avaliado', () => {
    expect(relatorio()).not.toContain('AVALIAÇÃO DE AGUDIZAÇÃO')
  })

  it('inclui gravidade, tratamento e fatores de mau prognóstico quando avaliada', () => {
    const f8 = dadosFase8({
      exprimePorFrases: false, freqRespiratoria: 32, freqCardiaca: 124,
      spo2: 91, pefPercentagem: 45, ventilacaoMecanicaPrevia: true,
    })
    const r = relatorio({ fase8: f8 })
    expect(r).toContain('AVALIAÇÃO DE AGUDIZAÇÃO')
    expect(r).toContain('Gravidade: Grave')
    expect(r).toContain('Tratamento recomendado')
    expect(r).toContain('ventilação mecânica')
  })

  it('assinala os critérios que ficaram por medir', () => {
    const f8 = dadosFase8({ exprimePorFrases: false })
    const r = relatorio({ fase8: f8 })
    expect(r).toContain('Avaliação incompleta')
  })
})

// ============================================================ variantes
describe('As duas variantes do relatório', () => {
  it('a de exclusão não fala de terapêutica nem de controlo', () => {
    const r = relatorio({ decisaoDiagnostica: 'nao-confirmado' })
    expect(r).toContain('EXCLUSÃO DE ASMA')
    expect(r).toContain('Diagnóstico de asma: Não confirmado')
    expect(r).not.toContain('Terapêutica sugerida')
  })

  it('a de asma confirmada traz o degrau e distingue seleção inicial de ajuste', () => {
    expect(relatorio()).toContain('seleção inicial')
    expect(relatorio()).toContain('reavaliar a resposta em 2 a 3 meses')
    expect(relatorio()).not.toContain('considerar subir degrau')
    expect(relatorio()).not.toContain('há 3-6 meses sem controlo')
    const comDegrau = relatorio({ fase6: dadosFase6({ degrauAtual: 3 }) })
    expect(comDegrau).toContain('o doente fazia Degrau 3')
  })
})

// ============================================================ seguimento e FEV1
describe('O relatório não inventa dados', () => {
  it('no seguimento, as Fases 1 a 3 aparecem como não realizadas, e não como «Não»', () => {
    const r = relatorio({ tipoConsulta: 'seguimento' })
    expect(r).toContain('não realizada nesta consulta')
    expect(r).toContain('Provas de diagnóstico não repetidas nesta consulta')
    expect(r).not.toContain('Sibilância:')
    expect(r).not.toContain('Confirmação funcional incompleta')
  })

  it('o FEV1 < 60% sai do valor medido, mesmo com a caixa por marcar', () => {
    const r = relatorio({ fase3: dadosFase3({ fev1Percentagem: 55 }), fase5: dadosFase5({ fev1Baixo: false }) })
    expect(r).toContain('FEV1 55% do previsto (< 60%)')
  })

  it('a agudização ligeira ou moderada aparece numa só classe', () => {
    const r = relatorio({ fase8: dadosFase8({ spo2: 95 }) })
    expect(r).toContain('Gravidade: Ligeira ou moderada')
  })
})

// ============================================================ sem decisão
// Numa primeira consulta, passar à agudização antes da decisão diagnóstica
// não pode gerar um relatório de asma confirmada, com controlo e terapêutica
// calculados sobre fases que não foram preenchidas.
describe('Primeira consulta sem decisão diagnóstica', () => {
  const agudizacao = dadosFase8({
    exprimePorFrases: false, freqRespiratoria: 32, freqCardiaca: 124, spo2: 91, pefPercentagem: 45,
  })
  const r = relatorio({ decisaoDiagnostica: null, tipoConsulta: 'primeira-consulta', fase8: agudizacao })

  it('dá o diagnóstico como por decidir', () => {
    expect(r).toContain('DIAGNÓSTICO POR DECIDIR')
    expect(r).toContain('Diagnóstico de asma: por decidir')
  })

  it('não afirma o diagnóstico nem calcula controlo, degrau ou referenciação', () => {
    expect(r).not.toContain('Asma confirmada')
    expect(r).not.toContain('Nível de controlo')
    expect(r).not.toContain('Terapêutica sugerida')
    expect(r).not.toContain('Referenciação para consulta')
  })

  it('mantém a avaliação de agudização e o que foi registado nas Fases 1 a 3', () => {
    expect(r).toContain('AVALIAÇÃO DE AGUDIZAÇÃO')
    expect(r).toContain('Gravidade: Grave')
    expect(r).toContain('S — SUBJETIVO')
    expect(r).toContain('Confirmação da variabilidade ao fluxo expiratório')
  })

  it('no seguimento, sem decisão, o diagnóstico já vem confirmado de trás', () => {
    const seguimento = relatorio({ decisaoDiagnostica: null, tipoConsulta: 'seguimento' })
    expect(seguimento).toContain('Diagnóstico: Asma confirmada')
  })

  it('a decisão de não confirmar continua a dar o relatório de exclusão', () => {
    const exclusao = relatorio({ decisaoDiagnostica: 'nao-confirmado', tipoConsulta: 'primeira-consulta' })
    expect(exclusao).toContain('EXCLUSÃO DE ASMA')
  })
})

// ============================================================ alívio
describe('O relatório distingue o tipo de alívio (GINA 2025, Box 2-2A)', () => {
  it('com SABA, o domínio conta para o controlo', () => {
    const r = relatorio({ fase4: dadosFase4({ necessidadeAlivio: true }) })
    expect(r).toContain('Necessidade de alívio (SABA) > 2x/semana: Sim')
    expect(r).toContain('Nível de controlo: Parcialmente controlada')
  })

  it('com ICS-formoterol, regista o uso mas não o conta', () => {
    const r = relatorio({ fase4: dadosFase4({ necessidadeAlivio: true, tipoAlivio: 'ics-formoterol' }) })
    expect(r).toContain('Uso de ICS-formoterol de alívio > 2x/semana: Sim (não conta para o nível de controlo')
    expect(r).toContain('Nível de controlo: Controlada')
  })
})

// ============================================================ formatação
describe('Formatação do relatório', () => {
  it('não deixa linhas em branco seguidas', () => {
    const r = relatorio({
      fase5: dadosFase5({ intubacaoOuUciPrevia: true }),
      fase7: dadosFase7({ asmaGrave: true }),
    })
    expect(r).not.toMatch(/\n\s*\n\s*\n/)
  })

  it('assina com as versões corretas das recomendações', () => {
    const r = relatorio()
    expect(r).toContain('GRESP 2022 / GINA 2025')
    expect(r).not.toContain('GINA 2022')
  })

  it('a idade é exata e não aproximada', () => {
    expect(relatorio()).toMatch(/\(\d+ anos\)/)
  })
})

// helper para reaproveitar a Fase 1 base
function relatorioBase() {
  return {
    fase1: {
      sibilancia: true, dispneia: true, tosse: false, opressaoToracica: false,
      maisDe1Sintoma: true, sintomasVariaveis: true,
      agravamComExercicio: true, agravamComFrio: false,
      agravamComAlergenios: false, agravamComInfecoes: false,
      sintomasMaisde1xSemana: true, sintomasNoturnosOuManha: true,
      tosseIsolada: false, tosseProdutivaCronica: false,
      dispneiaTonturasParestesias: false, dorToracica: false,
      dispneiaPorExercicioComInspiracao: false,
      inicioNaInfancia: true, riniteOuEczema: true,
      familiarAsmaAtopia: false, sensibilizacaoAlergenica: false,
      sibilosNaExpiracao: true, exameFisicoNormal: false,
      silencioRespiratorio: false,
    },
  }
}
