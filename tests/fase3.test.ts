import { describe, it, expect } from 'vitest'
import { calcularFase3 } from '../src/domain/fase3-provas'
import { dadosFase3 } from './_fixtures'

describe('Fase 3 — limitação ao fluxo expiratório', () => {
  it('adulto com obstrucao confirmada quando FEV1/FVC < 0.75', () => {
    expect(calcularFase3(dadosFase3({ fev1Litros: 2.22, fvcLitros: 3 })).obstrutivo).toBe(true)
  })

  it('adulto sem obstrucao quando FEV1/FVC = 0.75', () => {
    expect(calcularFase3(dadosFase3({ fev1Litros: 2.25, fvcLitros: 3 })).obstrutivo).toBe(false)
  })

  it('crianca com obstrucao confirmada quando FEV1/FVC < 0.90', () => {
    const r = calcularFase3(dadosFase3({ fev1Litros: 1.78, fvcLitros: 2, pacientePediatrico: true }))
    expect(r.obstrutivo).toBe(true)
  })

  it('calcula FEV1/FVC a partir de valores medidos em litros', () => {
    expect(calcularFase3(dadosFase3({ fev1Litros: 2.1, fvcLitros: 3 })).obstrutivo).toBe(true)
  })

  it('nao infere obstrucao a partir de percentagens previstas: fica por avaliar', () => {
    const r = calcularFase3(dadosFase3({ fev1Percentagem: 65, fvcPercentagem: 90 }))
    expect(r.obstrutivo).toBeNull()
    expect(r.criteriosPorAvaliar).toContain('Limitação ao fluxo expiratório (FEV1/FVC)')
  })
})

describe('Fase 3 — confirmação da variabilidade', () => {
  it('adulto com reversibilidade positiva apenas se > 12% e > 200 ml', () => {
    expect(calcularFase3(dadosFase3({ aumentoFev1Percentagem: 14, aumentoFev1ml: 250 })).reversibilidade).toBe(true)
  })

  it('adulto com reversibilidade negativa se faltar criterio em ml', () => {
    expect(calcularFase3(dadosFase3({ aumentoFev1Percentagem: 14, aumentoFev1ml: 150 })).reversibilidade).toBe(false)
  })

  it('adulto com reversibilidade negativa nos valores limite', () => {
    expect(calcularFase3(dadosFase3({ aumentoFev1Percentagem: 12, aumentoFev1ml: 200 })).reversibilidade).toBe(false)
  })

  it('sem o valor em ml o criterio do adulto fica por avaliar, e nao negativo', () => {
    const r = calcularFase3(dadosFase3({ aumentoFev1Percentagem: 14 }))
    expect(r.reversibilidade).toBeNull()
  })

  it('crianca com reversibilidade positiva se aumento FEV1 > 12%', () => {
    const r = calcularFase3(dadosFase3({
      aumentoFev1Percentagem: 13, aumentoFev1ml: 100, pacientePediatrico: true,
    }))
    expect(r.reversibilidade).toBe(true)
  })

  it('PEF positivo usa limiar adulto > 10%', () => {
    expect(calcularFase3(dadosFase3({ variabilidadePef: 11 })).pefPositivo).toBe(true)
    expect(calcularFase3(dadosFase3({ variabilidadePef: 10 })).pefPositivo).toBe(false)
  })

  it('PEF positivo usa limiar pediatrico > 13%', () => {
    expect(calcularFase3(dadosFase3({ variabilidadePef: 14, pacientePediatrico: true })).pefPositivo).toBe(true)
    expect(calcularFase3(dadosFase3({ variabilidadePef: 13, pacientePediatrico: true })).pefPositivo).toBe(false)
  })

  it('a variabilidade fica confirmada por qualquer uma das duas vias', () => {
    const porReversibilidade = calcularFase3(dadosFase3({ aumentoFev1Percentagem: 14, aumentoFev1ml: 250 }))
    const porPef = calcularFase3(dadosFase3({ variabilidadePef: 11 }))
    expect(porReversibilidade.variabilidadeConfirmada).toBe(true)
    expect(porPef.variabilidadeConfirmada).toBe(true)
  })
})

describe('Fase 3 — a confirmação exige os dois blocos', () => {
  const obstrucao = { fev1Litros: 2.1, fvcLitros: 3 }
  const variabilidade = { aumentoFev1Percentagem: 14, aumentoFev1ml: 250 }

  it('obstrução e variabilidade documentadas: confirmada', () => {
    const r = calcularFase3(dadosFase3({ ...obstrucao, ...variabilidade }))
    expect(r.confirmacaoFuncional).toBe('confirmada')
  })

  it('reversibilidade positiva sem obstrução documentada NÃO confirma', () => {
    const r = calcularFase3(dadosFase3({ ...variabilidade, fev1Litros: 2.4, fvcLitros: 3 }))
    expect(r.obstrutivo).toBe(false)
    expect(r.variabilidadeConfirmada).toBe(true)
    expect(r.confirmacaoFuncional).toBe('nao-confirmada')
  })

  it('obstrução sem variabilidade avaliada fica incompleta, e não negativa', () => {
    const r = calcularFase3(dadosFase3(obstrucao))
    expect(r.obstrutivo).toBe(true)
    expect(r.confirmacaoFuncional).toBe('incompleta')
    expect(r.criteriosPorAvaliar.length).toBeGreaterThan(0)
  })

  it('sem dados nenhuns, tudo fica por avaliar', () => {
    const r = calcularFase3(dadosFase3())
    expect(r.confirmacaoFuncional).toBe('incompleta')
    expect(r.criteriosPorAvaliar).toHaveLength(3)
  })
})
