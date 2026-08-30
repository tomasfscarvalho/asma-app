// Testes das regras corrigidas na revisão clínica.
//
// Cada bloco cita a passagem do Guia prático do GRESP (2022) ou da GINA 2025
// que a regra implementa.

import { describe, it, expect } from 'vitest'
import { calcularFase8 } from '../src/domain/fase8-agudizacao'
import { calcularFase7 } from '../src/domain/fase7-referenciacao'
import { calcularFase4, detetarDivergencia } from '../src/domain/fase4-controlo'
import {
  faixaEtaria, dentroDoAmbitoCronico, aplicaLimiaresPediatricos,
} from '../src/domain/idade'
import { dadosFase4, dadosFase5, dadosFase6, dadosFase7, dadosFase8 } from './_fixtures'

// ============================================================ âmbito etário
describe('Âmbito etário (GRESP 2022, §4.2)', () => {
  it('as bandas não deixam buracos', () => {
    expect(faixaEtaria(0)).toBe('pre-escolar')
    expect(faixaEtaria(5)).toBe('pre-escolar')
    expect(faixaEtaria(6)).toBe('crianca')
    expect(faixaEtaria(11)).toBe('crianca')
    expect(faixaEtaria(12)).toBe('jovem-adulto')
    expect(faixaEtaria(39)).toBe('jovem-adulto')
    expect(faixaEtaria(40)).toBe('adulto')
    expect(faixaEtaria(null)).toBeNull()
  })

  it('o percurso crónico começa aos 6 anos', () => {
    expect(dentroDoAmbitoCronico(5)).toBe(false)
    expect(dentroDoAmbitoCronico(6)).toBe(true)
    expect(dentroDoAmbitoCronico(40)).toBe(true)
  })

  it('os limiares pediátricos aplicam-se apenas dos 6 aos 11 anos', () => {
    expect(aplicaLimiaresPediatricos(5)).toBe(false)
    expect(aplicaLimiaresPediatricos(6)).toBe(true)
    expect(aplicaLimiaresPediatricos(11)).toBe(true)
    expect(aplicaLimiaresPediatricos(12)).toBe(false)
  })
})

// ============================================================ Fase 8
describe('Agudização — não medido não é normal', () => {
  it('sem dados nenhuns, todos os critérios ficam por avaliar', () => {
    const r = calcularFase8(dadosFase8())
    expect(r.avaliacaoIncompleta).toBe(true)
    expect(r.criteriosPresentes).toHaveLength(0)
    expect(r.criteriosPorAvaliar.length).toBeGreaterThan(0)
  })

  it('uma saturação em branco não conta como saturação normal', () => {
    const r = calcularFase8(dadosFase8())
    expect(r.criteriosPorAvaliar).toContain('Saturação de O₂')
  })

  it('com todos os sinais vitais medidos e normais, a avaliação fica completa', () => {
    const r = calcularFase8(dadosFase8({
      exprimePorFrases: true, freqRespiratoria: 18, freqCardiaca: 80,
      spo2: 98, pefPercentagem: 90,
    }))
    expect(r.criteriosPorAvaliar).toHaveLength(0)
    expect(r.avaliacaoIncompleta).toBe(false)
    expect(r.gravidade).toBe('ligeira')
  })
})

describe('Agudização — frequência cardíaca pediátrica (GRESP 2022, Tabela 7)', () => {
  it('> 180 bpm dos 0 aos 3 anos', () => {
    expect(calcularFase8(dadosFase8({ freqCardiaca: 175 }), 2).gravidade).toBe('ligeira')
    expect(calcularFase8(dadosFase8({ freqCardiaca: 181 }), 2).gravidade).toBe('grave')
  })

  it('> 150 bpm dos 4 aos 5 anos', () => {
    expect(calcularFase8(dadosFase8({ freqCardiaca: 145 }), 4).gravidade).toBe('ligeira')
    expect(calcularFase8(dadosFase8({ freqCardiaca: 151 }), 4).gravidade).toBe('grave')
  })

  it('> 120 bpm a partir dos 6 anos', () => {
    expect(calcularFase8(dadosFase8({ freqCardiaca: 118 }), 30).gravidade).toBe('ligeira')
    expect(calcularFase8(dadosFase8({ freqCardiaca: 121 }), 30).gravidade).toBe('grave')
  })

  it('uma criança de 2 anos com 155 bpm já não é classificada como grave', () => {
    expect(calcularFase8(dadosFase8({ freqCardiaca: 155 }), 2).gravidade).toBe('ligeira')
  })
})

describe('Agudização — os quatro sinais em falta da Tabela 7', () => {
  const sinais = ['musculosAcessorios', 'posicaoDebrucada', 'agitacao', 'cianose'] as const

  it('cada um classifica isoladamente como grave', () => {
    for (const s of sinais) {
      expect(calcularFase8(dadosFase8({ [s]: true })).gravidade, s).toBe('grave')
    }
  })
})

describe('Agudização — os fatores de mau prognóstico mudam o destino', () => {
  it('são recolhidos e agora aparecem no resultado', () => {
    const r = calcularFase8(dadosFase8({ ventilacaoMecanicaPrevia: true, alergiaAlimentar: true }))
    expect(r.fatoresMauPrognostico).toHaveLength(2)
  })

  it('não alteram a classificação de gravidade', () => {
    const r = calcularFase8(dadosFase8({
      ventilacaoMecanicaPrevia: true, duasOuMaisUrgencias: true,
      exprimePorFrases: true, freqRespiratoria: 18, freqCardiaca: 80, spo2: 98, pefPercentagem: 90,
    }))
    expect(r.gravidade).toBe('ligeira')
  })

  it('mas mudam o nível de cuidados', () => {
    const sem = calcularFase8(dadosFase8({
      exprimePorFrases: true, freqRespiratoria: 18, freqCardiaca: 80, spo2: 98, pefPercentagem: 90,
    }))
    const com = calcularFase8(dadosFase8({
      ventilacaoMecanicaPrevia: true,
      exprimePorFrases: true, freqRespiratoria: 18, freqCardiaca: 80, spo2: 98, pefPercentagem: 90,
    }))
    expect(sem.nivelCuidados).not.toContain('ponderar')
    expect(com.nivelCuidados).toContain('ponderar referência hospitalar')
  })
})

describe('Agudização — três níveis e tratamento (Imagens 10 e 11)', () => {
  it('a moderada distingue-se da ligeira pela resposta ao alívio', () => {
    expect(calcularFase8(dadosFase8()).gravidade).toBe('ligeira')
    expect(calcularFase8(dadosFase8({ respostaIncompletaAoAlivio: true })).gravidade).toBe('moderada')
  })

  it('o tratamento traz as doses do guia', () => {
    const adulto = calcularFase8(dadosFase8(), 40)
    expect(adulto.tratamento.join(' ')).toContain('4 a 10 inalações')
    expect(adulto.tratamento.join(' ')).toContain('50 mg')
    expect(adulto.tratamento.join(' ')).toContain('93% e 95%')
  })

  it('a dose pediátrica de corticoide é diferente', () => {
    const crianca = calcularFase8(dadosFase8({ idadeMenorCinco: true }), 4)
    expect(crianca.tratamento.join(' ')).toContain('40 mg')
    expect(crianca.tratamento.join(' ')).toContain('94% e 98%')
  })

  it('na crítica, o tratamento é o de espera pela UCI', () => {
    const r = calcularFase8(dadosFase8({ sonolenciaConfusaoToraxSilencioso: true }))
    expect(r.tratamento[0]).toContain('UCI')
  })
})

// ============================================================ Fase 7
describe('Referenciação — a app pergunta, não conclui (GRESP 2022, §3.2.3)', () => {
  const naoControlada = dadosFase4({
    sintomasDiurnos: true, sintomasNoturnos: true, limitacaoAtividades: true,
    frequenciaSintomas: 'maioria-dias',
  })

  it('sem controlo em degrau >= 3, a app levanta a questão', () => {
    const r = calcularFase7(naoControlada, dadosFase6(), dadosFase7(), dadosFase5())
    expect(r.perguntarDegrau3).toBe(true)
  })

  it('mas não acrescenta o critério sozinha', () => {
    const r = calcularFase7(naoControlada, dadosFase6(), dadosFase7(), dadosFase5())
    expect(r.criteriosPresentes.join(' ')).not.toContain('3-6 meses')
  })

  it('só a confirmação do médico ativa o critério', () => {
    const r = calcularFase7(
      naoControlada, dadosFase6(), dadosFase7({ semControloDegrau3: true }), dadosFase5(),
    )
    expect(r.criteriosPresentes.join(' ')).toContain('3-6 meses')
    expect(r.referenciar).toBe(true)
  })

  it('os sete critérios do guia estão todos presentes', () => {
    const todos = dadosFase7({
      dificuldadesDiagnostico: true, suspeitaAsmaOcupacional: true,
      necessitaTestesAdicionais: true, semControloDegrau3: true,
      duasOuMaisHospitalizacoes: true, asmaGrave: true,
      fatoresMauPrognostico: true, riscoEfeitosSecundarios: true,
    })
    const r = calcularFase7(dadosFase4(), dadosFase6(), todos, dadosFase5())
    expect(r.criteriosPresentes).toHaveLength(8)
  })
})

// ============================================================ Fase 4
describe('Controlo — divergência entre domínios e questionário', () => {
  const controlada = dadosFase4({ questionarioUsado: 'act' })
  const naoControlada = dadosFase4({
    sintomasDiurnos: true, sintomasNoturnos: true, limitacaoAtividades: true,
    questionarioUsado: 'act',
  })

  it('domínios dizem controlada e o ACT diz que não: avisa', () => {
    const aviso = detetarDivergencia(controlada, 'controlada', 15, null)
    expect(aviso).toContain('ACT deu 15')
  })

  it('ACT diz controlada e os domínios dizem que não: avisa', () => {
    const aviso = detetarDivergencia(naoControlada, 'nao-controlada', 23, null)
    expect(aviso).toContain('ACT deu 23')
  })

  it('quando concordam, não avisa', () => {
    expect(detetarDivergencia(controlada, 'controlada', 24, null)).toBeNull()
    expect(detetarDivergencia(naoControlada, 'nao-controlada', 12, null)).toBeNull()
  })

  it('o mesmo para o CARAT, no seu ponto de corte', () => {
    const comCarat = dadosFase4({ questionarioUsado: 'carat' })
    expect(detetarDivergencia(comCarat, 'controlada', null, 20)).toContain('CARAT deu 20')
    expect(detetarDivergencia(comCarat, 'controlada', null, 25)).toBeNull()
  })

  it('sem questionário preenchido não há divergência', () => {
    expect(calcularFase4(dadosFase4()).divergenciaQuestionario).toBeNull()
  })
})
