import { describe, it, expect } from 'vitest'
import { calcularFase6, obterDescricaoDegrau, temRiscoAgudizacoes } from '../src/domain/fase6-terapeutica'
import { dadosFase4, dadosFase5, dadosFase6 } from './_fixtures'

const semRisco = dadosFase5()
const fev1Baixo = dadosFase5({ fev1Baixo: true })

describe('Fase 6 — seleção do degrau inicial (GRESP 2022, Imagens 6.a e 6.b)', () => {
  it('baixa funcao respiratoria seleciona degrau 4 nos dois percursos', () => {
    expect(calcularFase6(dadosFase4(), dadosFase6({ percursoSelecionado: 1 }), fev1Baixo).degrau).toBe(4)
    expect(calcularFase6(dadosFase4(), dadosFase6({ percursoSelecionado: 2 }), fev1Baixo).degrau).toBe(4)
  })

  it('sintomas na maioria dos dias selecionam degrau 3', () => {
    const r = calcularFase6(
      dadosFase4({ frequenciaSintomas: 'maioria-dias' }),
      dadosFase6({ percursoSelecionado: 2 }),
      semRisco,
    )
    expect(r.degrau).toBe(3)
  })

  it('percurso 2 seleciona degrau 1 com sintomas raros e sem risco de agudizacoes', () => {
    const r = calcularFase6(dadosFase4(), dadosFase6({ percursoSelecionado: 2 }), semRisco)
    expect(r.degrau).toBe(1)
  })

  it('descreve o degrau 2 do percurso 1 como degrau 1-2', () => {
    const r = calcularFase6(dadosFase4(), dadosFase6({ percursoSelecionado: 1 }), semRisco)
    expect(obterDescricaoDegrau(r)).toBe('Degrau 1-2')
  })
})

describe('Fase 6 — o risco de agudizações deixa de ser ignorado', () => {
  it('o degrau 1 exige ausência de risco, e não apenas sintomas raros', () => {
    const comRisco = dadosFase5({ intubacaoOuUciPrevia: true })
    const r = calcularFase6(dadosFase4(), dadosFase6({ percursoSelecionado: 2 }), comRisco)
    expect(r.degrau).toBe(2)
  })

  it('cada fator do guia conta como risco', () => {
    const casos = [
      dadosFase5({ abusoDeSaba: true }),
      dadosFase5({ agudizacaoGraveUltimoAno: true }),
      dadosFase5({ agudizacoesUltimoAno: 1 }),
      dadosFase5({ internamentosUltimoAno: 1 }),
      dadosFase5({ maAdesao: true }),
      dadosFase5({ fumoTabaco: true }),
    ]
    for (const f5 of casos) {
      expect(temRiscoAgudizacoes(f5)).toBe(true)
      expect(calcularFase6(dadosFase4(), dadosFase6({ percursoSelecionado: 2 }), f5).degrau).toBe(2)
    }
  })

  it('sem fatores não há risco', () => {
    expect(temRiscoAgudizacoes(semRisco)).toBe(false)
  })

  it('os fatores presentes são devolvidos para o relatório', () => {
    const r = calcularFase6(
      dadosFase4(),
      dadosFase6({ percursoSelecionado: 1 }),
      dadosFase5({ abusoDeSaba: true, maAdesao: true }),
    )
    expect(r.fatoresDeRiscoPresentes).toHaveLength(2)
  })
})

describe('Fase 6 — ajuste ao degrau que o doente já faz', () => {
  const naoControlada = dadosFase4({
    sintomasDiurnos: true, sintomasNoturnos: true, limitacaoAtividades: true,
  })
  const controlada = dadosFase4()

  it('sem degrau atual, a recomendação é uma seleção inicial', () => {
    const r = calcularFase6(controlada, dadosFase6(), semRisco)
    expect(r.degrauInicial).toBe(true)
  })

  it('com degrau atual e asma não controlada, sobe um degrau', () => {
    const r = calcularFase6(naoControlada, dadosFase6({ degrauAtual: 3 }), semRisco)
    expect(r.degrauInicial).toBe(false)
    expect(r.ajuste).toBe('subir')
    expect(r.degrau).toBe(4)
  })

  it('o degrau 5 torna-se alcançável', () => {
    const r = calcularFase6(naoControlada, dadosFase6({ degrauAtual: 4 }), semRisco)
    expect(r.degrau).toBe(5)
    expect(r.medicacaoPreferencial).toContain('fenotípica')
  })

  it('não sobe acima do degrau 5', () => {
    const r = calcularFase6(naoControlada, dadosFase6({ degrauAtual: 5 }), semRisco)
    expect(r.degrau).toBe(5)
  })

  it('não desce abaixo do degrau 1', () => {
    const r = calcularFase6(
      controlada,
      dadosFase6({ degrauAtual: 1, controloMantidoTresMeses: true }),
      semRisco,
    )
    expect(r.degrau).toBe(1)
  })
})

describe('Fase 6 — descer degrau exige estabilidade', () => {
  const controlada = dadosFase4()

  it('asma controlada sem os 3 meses: manter, não descer', () => {
    const r = calcularFase6(controlada, dadosFase6({ degrauAtual: 3 }), semRisco)
    expect(r.ajuste).toBe('manter')
    expect(r.degrau).toBe(3)
  })

  it('asma controlada com controlo mantido: descer', () => {
    const r = calcularFase6(
      controlada,
      dadosFase6({ degrauAtual: 3, controloMantidoTresMeses: true }),
      semRisco,
    )
    expect(r.ajuste).toBe('descer')
    expect(r.degrau).toBe(2)
  })
})

describe('Fase 6 — a alternativa nunca repete a preferencial', () => {
  it('em todos os degraus dos dois percursos', () => {
    for (const percurso of [1, 2] as const) {
      for (const degrauAtual of [1, 2, 3, 4, 5] as const) {
        const r = calcularFase6(
          dadosFase4(),
          dadosFase6({ percursoSelecionado: percurso, degrauAtual }),
          semRisco,
        )
        expect(r.medicacaoAlternativa, `percurso ${percurso}, degrau ${r.degrau}`)
          .not.toBe(r.medicacaoPreferencial)
      }
    }
  })
})
