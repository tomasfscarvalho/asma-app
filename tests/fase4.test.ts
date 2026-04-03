import { describe, it, expect } from 'vitest'
import { calcularFase4, calcularControlo, calcularACT } from '../src/domain/fase4-controlo'

describe('Fase 4 — Controlo dos Sintomas', () => {

  it('0 critérios → controlada', () => {
    const resultado = calcularControlo({
      sintomasDiurnos: false, sintomasNoturnos: false,
      limitacaoAtividades: false, necessidadeAlivio: false,
      actLimitacaoAtividades: null, actFaltaAr: null,
      actSintomasNoturnos: null, actUsoAlivio: null, actAutoavaliacao: null,
    })
    expect(resultado).toBe('controlada')
  })

  it('2 critérios → parcialmente controlada', () => {
    const resultado = calcularControlo({
      sintomasDiurnos: true, sintomasNoturnos: true,
      limitacaoAtividades: false, necessidadeAlivio: false,
      actLimitacaoAtividades: null, actFaltaAr: null,
      actSintomasNoturnos: null, actUsoAlivio: null, actAutoavaliacao: null,
    })
    expect(resultado).toBe('parcialmente-controlada')
  })

  it('4 critérios → não controlada', () => {
    const resultado = calcularControlo({
      sintomasDiurnos: true, sintomasNoturnos: true,
      limitacaoAtividades: true, necessidadeAlivio: true,
      actLimitacaoAtividades: null, actFaltaAr: null,
      actSintomasNoturnos: null, actUsoAlivio: null, actAutoavaliacao: null,
    })
    expect(resultado).toBe('nao-controlada')
  })

  it('ACT completo calcula score correto', () => {
    const score = calcularACT({
      sintomasDiurnos: false, sintomasNoturnos: false,
      limitacaoAtividades: false, necessidadeAlivio: false,
      actLimitacaoAtividades: 4, actFaltaAr: 3,
      actSintomasNoturnos: 5, actUsoAlivio: 4, actAutoavaliacao: 3,
    })
    expect(score).toBe(19)
  })

  it('ACT incompleto retorna null', () => {
    const score = calcularACT({
      sintomasDiurnos: false, sintomasNoturnos: false,
      limitacaoAtividades: false, necessidadeAlivio: false,
      actLimitacaoAtividades: 4, actFaltaAr: null,
      actSintomasNoturnos: 5, actUsoAlivio: 4, actAutoavaliacao: 3,
    })
    expect(score).toBeNull()
  })
})