import { describe, it, expect } from 'vitest'
import { calcularFase6, obterDescricaoDegrau } from '../src/domain/fase6-terapeutica'
import type { Fase4Dados } from '../src/domain/types'

function dadosFase4(overrides: Partial<Fase4Dados> = {}): Fase4Dados {
  return {
    sintomasDiurnos: false,
    sintomasNoturnos: false,
    limitacaoAtividades: false,
    necessidadeAlivio: false,
    frequenciaSintomas: 'menos-2x-mes',
    despertarSemanal: false,
    actLimitacaoAtividades: null,
    actFaltaAr: null,
    actSintomasNoturnos: null,
    actUsoAlivio: null,
    actAutoavaliacao: null,
    questionarioUsado: null,
    fev1Atual: null,
    caratNasalCongestion: null,
    caratSneezing: null,
    caratRunnyNose: null,
    caratNasalItching: null,
    caratSleepDisturbance: null,
    caratBreathlessness: null,
    caratWheeze: null,
    caratChestTightness: null,
    caratActivityLimitation: null,
    caratMedicationIncrease: null,
    ...overrides,
  }
}

describe('Fase 6 - Recomendacao Terapeutica', () => {
  it('baixa funcao respiratoria seleciona degrau 4 no percurso 1 mesmo sem sintomas frequentes', () => {
    const resultado = calcularFase6(dadosFase4(), { percursoSelecionado: 1 }, true)

    expect(resultado.degrau).toBe(4)
  })

  it('baixa funcao respiratoria seleciona degrau 4 no percurso 2 mesmo sem sintomas frequentes', () => {
    const resultado = calcularFase6(dadosFase4(), { percursoSelecionado: 2 }, true)

    expect(resultado.degrau).toBe(4)
  })

  it('sintomas na maioria dos dias selecionam degrau 3 se FEV1 nao estiver baixo', () => {
    const resultado = calcularFase6(
      dadosFase4({ frequenciaSintomas: 'maioria-dias' }),
      { percursoSelecionado: 2 },
      false,
    )

    expect(resultado.degrau).toBe(3)
  })

  it('percurso 2 seleciona degrau 1 quando sintomas sao raros e nao ha risco por FEV1 baixo', () => {
    const resultado = calcularFase6(dadosFase4(), { percursoSelecionado: 2 }, false)

    expect(resultado.degrau).toBe(1)
  })

  it('descreve o degrau 2 do percurso 1 como degrau 1-2', () => {
    const resultado = calcularFase6(dadosFase4(), { percursoSelecionado: 1 }, false)

    expect(obterDescricaoDegrau(resultado)).toBe('Degrau 1-2')
  })
})
