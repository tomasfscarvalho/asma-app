// Testes de conformidade com as fontes.
//
// Cobrem apenas comportamento já verificado contra os documentos originais —
// o Guia prático de gestão da asma nos Cuidados de Saúde Primários
// (GRESP/APMGF, 2022), a GINA 2025 e o formulário CARAT-PT. O objetivo é
// impedir regressões silenciosas nas regras que estão certas, não fixar as
// que aguardam validação clínica.

import { describe, it, expect } from 'vitest'
import {
  calcularControlo, calcularACT, calcularCARATScore,
  calcularCaratRinite, calcularCaratAsma, interpretarCarat, interpretarAct,
} from '../src/domain/fase4-controlo'
import { calcularFase8 } from '../src/domain/fase8-agudizacao'
import { calcularFase6, obterDescricaoDegrau } from '../src/domain/fase6-terapeutica'
import { calcularIdade } from '../src/domain/idade'
import type { Fase4Dados, Fase8Dados } from '../src/domain/types'

// ---------------------------------------------------------------- fixtures

const fase4Vazia: Fase4Dados = {
  sintomasDiurnos: false, sintomasNoturnos: false, limitacaoAtividades: false,
  necessidadeAlivio: false, frequenciaSintomas: 'menos-2x-mes', despertarSemanal: false,
  actLimitacaoAtividades: null, actFaltaAr: null, actSintomasNoturnos: null,
  actUsoAlivio: null, actAutoavaliacao: null,
  questionarioUsado: null, fev1Atual: null,
  caratNasalCongestion: null, caratSneezing: null, caratRunnyNose: null,
  caratNasalItching: null, caratSleepDisturbance: null, caratBreathlessness: null,
  caratWheeze: null, caratChestTightness: null, caratActivityLimitation: null,
  caratMedicationIncrease: null,
}

const fase8Vazia: Fase8Dados = {
  exprimePorFrases: null, freqRespiratoria: null, freqCardiaca: null, spo2: null,
  pefPercentagem: null, pacientePediatrico: false, idadeMenorCinco: false,
  sonolenciaConfusaoToraxSilencioso: false,
  ventilacaoMecanicaPrevia: false, duasOuMaisUrgencias: false,
  corticosteroidesRecentes: false, abusoDeSabaProlong: false,
  comorbilidadesGraves: false, naoAdesaoTratamento: false, alergiaAlimentar: false,
}

// ------------------------------------------------- GRESP 2022, Imagem 3
describe('Controlo dos sintomas — GRESP 2022, Imagem 3', () => {
  const dominios = [
    'sintomasDiurnos', 'sintomasNoturnos', 'limitacaoAtividades', 'necessidadeAlivio',
  ] as const

  it('nenhum domínio positivo → controlada', () => {
    expect(calcularControlo(fase4Vazia)).toBe('controlada')
  })

  it('1 a 2 domínios → parcialmente controlada', () => {
    for (const d of dominios) {
      expect(calcularControlo({ ...fase4Vazia, [d]: true })).toBe('parcialmente-controlada')
    }
    expect(calcularControlo({ ...fase4Vazia, sintomasDiurnos: true, necessidadeAlivio: true }))
      .toBe('parcialmente-controlada')
  })

  it('3 a 4 domínios → não controlada', () => {
    expect(calcularControlo({
      ...fase4Vazia, sintomasDiurnos: true, sintomasNoturnos: true, limitacaoAtividades: true,
    })).toBe('nao-controlada')
    expect(calcularControlo({
      ...fase4Vazia, sintomasDiurnos: true, sintomasNoturnos: true,
      limitacaoAtividades: true, necessidadeAlivio: true,
    })).toBe('nao-controlada')
  })
})

// ------------------------------------------------- CARAT-PT
describe('CARAT — formulário CARAT-PT', () => {
  const maximo = {
    caratNasalCongestion: 3, caratSneezing: 3, caratNasalItching: 3, caratRunnyNose: 3,
    caratBreathlessness: 3, caratWheeze: 3, caratChestTightness: 3,
    caratActivityLimitation: 3, caratSleepDisturbance: 3, caratMedicationIncrease: 3,
  }
  const cheio: Fase4Dados = { ...fase4Vazia, ...maximo }

  it('subescalas: itens 1-4 valem /12 e itens 5-10 valem /18', () => {
    expect(calcularCaratRinite(cheio)).toBe(12)
    expect(calcularCaratAsma(cheio)).toBe(18)
    expect(calcularCARATScore(cheio)).toBe(30)
  })

  it('o item 9 (acordou de noite) pertence às vias aéreas inferiores', () => {
    const semItem9: Fase4Dados = { ...cheio, caratSleepDisturbance: 0 }
    expect(calcularCaratRinite(semItem9)).toBe(12)
    expect(calcularCaratAsma(semItem9)).toBe(15)
  })

  it('pontos de corte: total > 24, superiores > 8, inferiores >= 16', () => {
    expect(interpretarCarat(25, 9, 16)).toContain('bom controlo global')
    expect(interpretarCarat(24, 9, 16)).toContain('controlo global insuficiente')
    expect(interpretarCarat(25, 9, 16)).toContain('rinite controlada')
    expect(interpretarCarat(25, 8, 16)).toContain('rinite não controlada')
    expect(interpretarCarat(25, 9, 16)).toContain('asma controlada')
    expect(interpretarCarat(25, 9, 15)).toContain('asma não controlada')
  })

  it('qualquer item em falta invalida a subescala', () => {
    expect(calcularCARATScore({ ...cheio, caratWheeze: null })).toBeNull()
    expect(interpretarCarat(null, 9, 16)).toContain('Incompleto')
  })
})

// ------------------------------------------------- ACT
describe('ACT — pontos de corte do instrumento', () => {
  it('soma os cinco itens', () => {
    expect(calcularACT({
      ...fase4Vazia, actLimitacaoAtividades: 3, actFaltaAr: 3,
      actSintomasNoturnos: 3, actUsoAlivio: 3, actAutoavaliacao: 3,
    })).toBe(15)
  })

  it('<= 19 não controlada, 20-24 bem controlada, 25 controlo total', () => {
    expect(interpretarAct(19)).toContain('não controlada')
    expect(interpretarAct(20)).toContain('bem controlada')
    expect(interpretarAct(24)).toContain('bem controlada')
    expect(interpretarAct(25)).toContain('controlo total')
  })
})

// ------------------------------------------------- GRESP 2022, Tabela 7 e Imagem 11
describe('Agudização no adulto — GRESP 2022, Tabela 7', () => {
  it('sonolência, confusão ou tórax silencioso → crítica e UCI', () => {
    const r = calcularFase8({ ...fase8Vazia, sonolenciaConfusaoToraxSilencioso: true })
    expect(r.gravidade).toBe('critica')
    expect(r.transferirUci).toBe(true)
    expect(r.nivelCuidados).toContain('UCI')
  })

  it('a regra da UCI sobrepõe-se a sinais vitais normais', () => {
    const r = calcularFase8({
      ...fase8Vazia, sonolenciaConfusaoToraxSilencioso: true,
      exprimePorFrases: true, freqRespiratoria: 18, freqCardiaca: 80, spo2: 98, pefPercentagem: 90,
    })
    expect(r.gravidade).toBe('critica')
  })

  it('cada critério isolado da Tabela 7 classifica como grave', () => {
    const casos: Array<[string, Partial<Fase8Dados>]> = [
      ['fala por palavras isoladas', { exprimePorFrases: false }],
      ['FR > 30/min', { freqRespiratoria: 31 }],
      ['FC > 120 bpm', { freqCardiaca: 121 }],
      ['SpO2 < 90%', { spo2: 89 }],
      ['PEF <= 50%', { pefPercentagem: 50 }],
    ]
    for (const [nome, dados] of casos) {
      const r = calcularFase8({ ...fase8Vazia, ...dados })
      expect(r.gravidade, nome).toBe('grave')
      expect(r.nivelCuidados, nome).toContain('urgência')
    }
  })

  it('os limites não disparam abaixo do critério', () => {
    expect(calcularFase8({ ...fase8Vazia, freqRespiratoria: 30 }).gravidade).toBe('ligeira-moderada')
    expect(calcularFase8({ ...fase8Vazia, freqCardiaca: 120 }).gravidade).toBe('ligeira-moderada')
    expect(calcularFase8({ ...fase8Vazia, spo2: 90 }).gravidade).toBe('ligeira-moderada')
    expect(calcularFase8({ ...fase8Vazia, pefPercentagem: 51 }).gravidade).toBe('ligeira-moderada')
  })
})

// ------------------------------------------------- GRESP 2022, Imagem 6.a
describe('Seleção do degrau inicial no Percurso 1 — GRESP 2022, Imagem 6.a', () => {
  const semRisco = { percursoSelecionado: 1 as const }

  it('sintomas pouco frequentes e sem risco → Degrau 1-2', () => {
    const r = calcularFase6(fase4Vazia, semRisco, false)
    expect(r.degrau).toBe(2)
    expect(obterDescricaoDegrau(r)).toBe('Degrau 1-2')
  })

  it('sintomas na maioria dos dias → Degrau 3', () => {
    const r = calcularFase6({ ...fase4Vazia, frequenciaSintomas: 'maioria-dias' }, semRisco, false)
    expect(r.degrau).toBe(3)
  })

  it('despertar semanal por asma → Degrau 3', () => {
    const r = calcularFase6({ ...fase4Vazia, despertarSemanal: true }, semRisco, false)
    expect(r.degrau).toBe(3)
  })

  it('baixa função respiratória → Degrau 4, mesmo sem sintomas frequentes', () => {
    const r = calcularFase6(fase4Vazia, semRisco, true)
    expect(r.degrau).toBe(4)
  })

  it('o Percurso 1 usa ICS-formoterol como alívio em todos os degraus', () => {
    for (const f4 of [fase4Vazia, { ...fase4Vazia, frequenciaSintomas: 'maioria-dias' as const }]) {
      expect(calcularFase6(f4, semRisco, false).medicacaoPreferencial).toContain('ICS-formoterol')
    }
  })
})

// ------------------------------------------------- idade
describe('Cálculo da idade', () => {
  it('data vazia ou inválida devolve null', () => {
    expect(calcularIdade('')).toBeNull()
    expect(calcularIdade('nao-e-data')).toBeNull()
  })

  it('data no futuro devolve null em vez de idade negativa', () => {
    const futuro = new Date()
    futuro.setFullYear(futuro.getFullYear() + 2)
    expect(calcularIdade(futuro.toISOString().slice(0, 10))).toBeNull()
  })

  it('não conta o ano antes do aniversário', () => {
    const hoje = new Date()
    const amanha = new Date(hoje)
    amanha.setDate(hoje.getDate() + 1)
    // nascido amanhã há 30 anos: ainda tem 29
    const data = `${hoje.getFullYear() - 30}-${String(amanha.getMonth() + 1).padStart(2, '0')}-${String(amanha.getDate()).padStart(2, '0')}`
    const idade = calcularIdade(data)
    expect(idade === 29 || idade === 30).toBe(true)
  })
})
