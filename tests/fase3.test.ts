import { describe, it, expect } from 'vitest'
import { calcularFase3 } from '../src/domain/fase3-provas'
import type { Fase3Dados } from '../src/domain/types'

function dadosFase3(overrides: Partial<Fase3Dados> = {}): Fase3Dados {
  return {
    fev1Litros: null,
    fvcLitros: null,
    fev1Percentagem: null,
    fvcPercentagem: null,
    fev1FvcRacio: null,
    aumentoFev1Percentagem: null,
    aumentoFev1ml: null,
    variabilidadePef: null,
    pacientePediatrico: false,
    ...overrides,
  }
}

describe('Fase 3 - Provas Funcionais', () => {
  it('adulto com obstrucao confirmada quando FEV1/FVC < 0.75', () => {
    const resultado = calcularFase3(dadosFase3({ fev1Litros: 2.22, fvcLitros: 3 }))

    expect(resultado.obstrutivo).toBe(true)
  })

  it('adulto sem obstrucao quando FEV1/FVC = 0.75', () => {
    const resultado = calcularFase3(dadosFase3({ fev1Litros: 2.25, fvcLitros: 3 }))

    expect(resultado.obstrutivo).toBe(false)
  })

  it('crianca com obstrucao confirmada quando FEV1/FVC < 0.90', () => {
    const resultado = calcularFase3(dadosFase3({ fev1Litros: 1.78, fvcLitros: 2, pacientePediatrico: true }))

    expect(resultado.obstrutivo).toBe(true)
  })

  it('calcula FEV1/FVC a partir de valores medidos em litros', () => {
    const resultado = calcularFase3(dadosFase3({ fev1Litros: 2.1, fvcLitros: 3 }))

    expect(resultado.obstrutivo).toBe(true)
    expect(resultado.criteriosPositivos).toBe(1)
  })

  it('nao calcula FEV1/FVC a partir de percentagens previstas', () => {
    const resultado = calcularFase3(dadosFase3({ fev1Percentagem: 65, fvcPercentagem: 90 }))

    expect(resultado.obstrutivo).toBe(false)
    expect(resultado.criteriosPositivos).toBe(0)
  })

  it('adulto com reversibilidade positiva apenas se > 12% e > 200 ml', () => {
    const resultado = calcularFase3(dadosFase3({ aumentoFev1Percentagem: 14, aumentoFev1ml: 250 }))

    expect(resultado.reversibilidade).toBe(true)
  })

  it('adulto com reversibilidade negativa se faltar criterio em ml', () => {
    const resultado = calcularFase3(dadosFase3({ aumentoFev1Percentagem: 14, aumentoFev1ml: 150 }))

    expect(resultado.reversibilidade).toBe(false)
  })

  it('adulto com reversibilidade negativa nos valores limite', () => {
    const resultado = calcularFase3(dadosFase3({ aumentoFev1Percentagem: 12, aumentoFev1ml: 200 }))

    expect(resultado.reversibilidade).toBe(false)
  })

  it('crianca com reversibilidade positiva se aumento FEV1 > 12%', () => {
    const resultado = calcularFase3(dadosFase3({
      aumentoFev1Percentagem: 13,
      aumentoFev1ml: 100,
      pacientePediatrico: true,
    }))

    expect(resultado.reversibilidade).toBe(true)
  })

  it('PEF positivo usa limiar adulto > 10%', () => {
    const positivo = calcularFase3(dadosFase3({ variabilidadePef: 11 }))
    const limite = calcularFase3(dadosFase3({ variabilidadePef: 10 }))

    expect(positivo.pefPositivo).toBe(true)
    expect(limite.pefPositivo).toBe(false)
  })

  it('PEF positivo usa limiar pediatrico > 13%', () => {
    const positivo = calcularFase3(dadosFase3({ variabilidadePef: 14, pacientePediatrico: true }))
    const limite = calcularFase3(dadosFase3({ variabilidadePef: 13, pacientePediatrico: true }))

    expect(positivo.pefPositivo).toBe(true)
    expect(limite.pefPositivo).toBe(false)
  })

  it('conta criterios positivos independentes', () => {
    const resultado = calcularFase3(dadosFase3({
      fev1Litros: 2.1,
      fvcLitros: 3,
      aumentoFev1Percentagem: 14,
      aumentoFev1ml: 250,
      variabilidadePef: 11,
    }))

    expect(resultado.criteriosPositivos).toBe(3)
  })
})
