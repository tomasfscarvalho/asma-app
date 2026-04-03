import { describe, it, expect } from 'vitest'
import { calcularFase3 } from '../src/domain/fase3-provas'

describe('Fase 3 — Provas Funcionais', () => {

  it('adulto com obstrução confirmada (FEV1/FVC < 0.75)', () => {
    const resultado = calcularFase3({
      fev1Percentagem: 65, fvcPercentagem: 90, fev1FvcRacio: null,
      aumentoFev1Percentagem: null, aumentoFev1ml: null,
      variabilidadePef: null, pacientePediatrico: false,
    })
    expect(resultado.obstrutivo).toBe(true)
  })

  it('adulto sem obstrução (FEV1/FVC = 0.80)', () => {
    const resultado = calcularFase3({
      fev1Percentagem: 80, fvcPercentagem: 100, fev1FvcRacio: null,
      aumentoFev1Percentagem: null, aumentoFev1ml: null,
      variabilidadePef: null, pacientePediatrico: false,
    })
    expect(resultado.obstrutivo).toBe(false)
  })

  it('adulto com reversibilidade positiva (>12% E >200ml)', () => {
    const resultado = calcularFase3({
      fev1Percentagem: null, fvcPercentagem: null, fev1FvcRacio: null,
      aumentoFev1Percentagem: 14, aumentoFev1ml: 250,
      variabilidadePef: null, pacientePediatrico: false,
    })
    expect(resultado.reversibilidade).toBe(true)
  })

  it('adulto reversibilidade negativa (>12% mas só 150ml)', () => {
    const resultado = calcularFase3({
      fev1Percentagem: null, fvcPercentagem: null, fev1FvcRacio: null,
      aumentoFev1Percentagem: 14, aumentoFev1ml: 150,
      variabilidadePef: null, pacientePediatrico: false,
    })
    expect(resultado.reversibilidade).toBe(false)
  })

  it('criança com reversibilidade positiva (só >12%)', () => {
    const resultado = calcularFase3({
      fev1Percentagem: null, fvcPercentagem: null, fev1FvcRacio: null,
      aumentoFev1Percentagem: 13, aumentoFev1ml: 100,
      variabilidadePef: null, pacientePediatrico: true,
    
    })
    expect(resultado.reversibilidade).toBe(true)
  })


  it('contagem de critérios: 2 positivos', () => {
    const resultado = calcularFase3({
      fev1Percentagem: 65, fvcPercentagem: 90, fev1FvcRacio: null,
      aumentoFev1Percentagem: 14, aumentoFev1ml: 250,
      variabilidadePef: 8,
      pacientePediatrico: false,
    })
    expect(resultado.criteriosPositivos).toBe(2)
  })
})
