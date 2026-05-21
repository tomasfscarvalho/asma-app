import { describe, it, expect } from 'vitest'
import { calcularFase8 } from '../src/domain/fase8-agudizacao'
import type { Fase8Dados } from '../src/domain/types'

function dadosFase8(overrides: Partial<Fase8Dados> = {}): Fase8Dados {
  return {
    exprimePorFrases: null,
    freqRespiratoria: null,
    freqCardiaca: null,
    spo2: null,
    pefPercentagem: null,
    pacientePediatrico: false,
    idadeMenorCinco: false,
    sonolenciaConfusaoToraxSilencioso: false,
    ventilaçãoMecanicaPrevia: false,
    duasOuMaisUrgencias: false,
    corticosteroidesRecentes: false,
    abusoDeSabaProlong: false,
    comorbilidadesGraves: false,
    naoAdesaoTratamento: false,
    alergiaAlimentar: false,
    ...overrides,
  }
}

describe('Fase 8 - Agudizacao', () => {
  it('palavras isoladas classificam agudizacao grave mas nao UCI automatica', () => {
    const resultado = calcularFase8(dadosFase8({ exprimePorFrases: false }))

    expect(resultado.gravidade).toBe('grave')
    expect(resultado.transferirUci).toBe(false)
  })

  it('sonolencia, confusao mental ou torax silencioso transfere para UCI', () => {
    const resultado = calcularFase8(dadosFase8({ sonolenciaConfusaoToraxSilencioso: true }))

    expect(resultado.gravidade).toBe('critica')
    expect(resultado.transferirUci).toBe(true)
  })

  it('SpO2 adulto < 90% isolada classifica agudizacao grave', () => {
    const resultado = calcularFase8(dadosFase8({ spo2: 89 }))

    expect(resultado.gravidade).toBe('grave')
  })

  it('PEF <= 50% isolado classifica agudizacao grave', () => {
    const resultado = calcularFase8(dadosFase8({ pefPercentagem: 50 }))

    expect(resultado.gravidade).toBe('grave')
  })
})
