import { describe, it, expect } from 'vitest'
import { calcularFase6, obterDescricaoDegrau } from '../src/domain/fase6-terapeutica'
import { temRiscoAgudizacoes, avaliarFev1Baixo, reversibilidadeElevada } from '../src/domain/fase5-risco'
import { dadosFase3, dadosFase4, dadosFase5, dadosFase6 } from './_fixtures'

const f3 = dadosFase3()
const semRisco = dadosFase5()
const comFev1Baixo = dadosFase5({ fev1Baixo: true })
const p1 = dadosFase6({ percursoSelecionado: 1 })
const p2 = dadosFase6({ percursoSelecionado: 2 })

describe('Fase 6 — seleção do degrau inicial (GRESP 2022, Imagens 6.a e 6.b)', () => {
  it('baixa função respiratória seleciona degrau 4 nos dois percursos', () => {
    expect(calcularFase6(dadosFase4(), p1, comFev1Baixo, f3).degrau).toBe(4)
    expect(calcularFase6(dadosFase4(), p2, comFev1Baixo, f3).degrau).toBe(4)
  })

  it('sintomas na maioria dos dias selecionam degrau 3', () => {
    const f4 = dadosFase4({ frequenciaSintomas: 'maioria-dias', sintomasDiurnos: true })
    expect(calcularFase6(f4, p2, semRisco, f3).degrau).toBe(3)
  })

  it('despertar semanal por asma seleciona degrau 3', () => {
    const f4 = dadosFase4({ despertarSemanal: true, sintomasNoturnos: true })
    expect(calcularFase6(f4, p1, semRisco, f3).degrau).toBe(3)
  })

  it('percurso 2 seleciona degrau 1 com sintomas raros e sem risco', () => {
    expect(calcularFase6(dadosFase4(), p2, semRisco, f3).degrau).toBe(1)
  })

  it('descreve o degrau 2 do percurso 1 como degrau 1-2', () => {
    expect(obterDescricaoDegrau(calcularFase6(dadosFase4(), p1, semRisco, f3))).toBe('Degrau 1-2')
  })

  it('o Percurso 1 usa ICS-formoterol em todos os degraus iniciais', () => {
    for (const f4 of [dadosFase4(), dadosFase4({ frequenciaSintomas: 'maioria-dias' })]) {
      expect(calcularFase6(f4, p1, semRisco, f3).medicacaoPreferencial).toContain('ICS-formoterol')
    }
  })
})

describe('Fase 6 — o risco de agudizações deixou de ser ignorado', () => {
  it('o degrau 1 exige ausência de risco, e não apenas sintomas raros', () => {
    const comRisco = dadosFase5({ intubacaoOuUciPrevia: true })
    expect(calcularFase6(dadosFase4(), p2, comRisco, f3).degrau).toBe(2)
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
      expect(temRiscoAgudizacoes(f3, dadosFase4(), f5)).toBe(true)
      expect(calcularFase6(dadosFase4(), p2, f5, f3).degrau).toBe(2)
    }
  })

  it('sem fatores não há risco', () => {
    expect(temRiscoAgudizacoes(f3, dadosFase4(), semRisco)).toBe(false)
  })

  it('os fatores presentes são devolvidos para o relatório', () => {
    const f5 = dadosFase5({ abusoDeSaba: true, maAdesao: true })
    expect(calcularFase6(dadosFase4(), p1, f5, f3).fatoresDeRiscoPresentes).toHaveLength(2)
  })
})

describe('Fase 6 — o FEV1 baixo vem do valor medido, não da caixa', () => {
  it('um FEV1 medido abaixo de 60% vale mesmo com a caixa por marcar', () => {
    const f3baixo = dadosFase3({ fev1Percentagem: 55 })
    expect(avaliarFev1Baixo(f3baixo, dadosFase4(), semRisco))
      .toMatchObject({ valor: true, origem: 'medido', percentagem: 55 })
    expect(calcularFase6(dadosFase4(), p1, semRisco, f3baixo).degrau).toBe(4)
  })

  it('um FEV1 medido acima de 60% prevalece sobre a caixa marcada', () => {
    const f3alto = dadosFase3({ fev1Percentagem: 82 })
    expect(avaliarFev1Baixo(f3alto, dadosFase4(), comFev1Baixo).valor).toBe(false)
    expect(calcularFase6(dadosFase4(), p1, comFev1Baixo, f3alto).degrau).not.toBe(4)
  })

  it('o valor de seguimento tem precedência sobre o do diagnóstico', () => {
    const f3alto = dadosFase3({ fev1Percentagem: 82 })
    const f4baixo = dadosFase4({ fev1Atual: 51 })
    expect(avaliarFev1Baixo(f3alto, f4baixo, semRisco).percentagem).toBe(51)
  })

  it('sem valor medido, a caixa continua a valer', () => {
    expect(avaliarFev1Baixo(f3, dadosFase4(), comFev1Baixo))
      .toMatchObject({ valor: true, origem: 'assinalado' })
  })

  it('o limiar é estrito: 60% não é baixo, 59% é', () => {
    expect(avaliarFev1Baixo(dadosFase3({ fev1Percentagem: 60 }), dadosFase4(), semRisco).valor).toBe(false)
    expect(avaliarFev1Baixo(dadosFase3({ fev1Percentagem: 59 }), dadosFase4(), semRisco).valor).toBe(true)
  })
})

describe('Fase 6 — reversibilidade elevada como fator de risco', () => {
  const elevada = dadosFase3({ aumentoFev1Percentagem: 22, aumentoFev1ml: 480 })

  it('conta a partir de 20%, e só se a reversibilidade for positiva', () => {
    expect(reversibilidadeElevada(elevada)).toBe(true)
    expect(reversibilidadeElevada(dadosFase3({ aumentoFev1Percentagem: 14, aumentoFev1ml: 260 }))).toBe(false)
  })

  it('não conta se o critério em mililitros não for cumprido', () => {
    expect(reversibilidadeElevada(dadosFase3({ aumentoFev1Percentagem: 25, aumentoFev1ml: 150 }))).toBe(false)
  })

  it('entra na lista de fatores de risco', () => {
    const r = calcularFase6(dadosFase4(), p1, semRisco, elevada)
    expect(r.fatoresDeRiscoPresentes.join(' ')).toContain('Reversibilidade broncodilatadora elevada')
  })
})

describe('Fase 6 — ajuste ao degrau que o doente já faz', () => {
  const naoControlada = dadosFase4({
    sintomasDiurnos: true, sintomasNoturnos: true, limitacaoAtividades: true,
  })

  it('sem degrau atual, a recomendação é uma seleção inicial', () => {
    expect(calcularFase6(dadosFase4(), dadosFase6(), semRisco, f3).degrauInicial).toBe(true)
  })

  it('com degrau atual e asma não controlada, sobe um degrau', () => {
    const r = calcularFase6(naoControlada, dadosFase6({ degrauAtual: 3 }), semRisco, f3)
    expect(r.degrauInicial).toBe(false)
    expect(r.ajuste).toBe('subir')
    expect(r.degrau).toBe(4)
  })

  it('o degrau 5 torna-se alcançável', () => {
    const r = calcularFase6(naoControlada, dadosFase6({ degrauAtual: 4 }), semRisco, f3)
    expect(r.degrau).toBe(5)
    expect(r.medicacaoPreferencial).toContain('fenotípica')
  })

  it('não sobe acima do degrau 5 nem desce abaixo do 1', () => {
    expect(calcularFase6(naoControlada, dadosFase6({ degrauAtual: 5 }), semRisco, f3).degrau).toBe(5)
    const descer = dadosFase6({ degrauAtual: 1, controloMantidoTresMeses: true })
    expect(calcularFase6(dadosFase4(), descer, semRisco, f3).degrau).toBe(1)
  })
})

describe('Fase 6 — descer degrau exige estabilidade', () => {
  it('asma controlada sem os 3 meses: manter, não descer', () => {
    const r = calcularFase6(dadosFase4(), dadosFase6({ degrauAtual: 3 }), semRisco, f3)
    expect(r.ajuste).toBe('manter')
    expect(r.degrau).toBe(3)
  })

  it('asma controlada com controlo mantido: descer', () => {
    const f6 = dadosFase6({ degrauAtual: 3, controloMantidoTresMeses: true })
    const r = calcularFase6(dadosFase4(), f6, semRisco, f3)
    expect(r.ajuste).toBe('descer')
    expect(r.degrau).toBe(2)
  })
})

describe('Fase 6 — a alternativa nunca repete a preferencial', () => {
  it('em todos os degraus dos dois percursos', () => {
    for (const percurso of [1, 2] as const) {
      for (const degrauAtual of [1, 2, 3, 4, 5] as const) {
        const f6 = dadosFase6({ percursoSelecionado: percurso, degrauAtual })
        const r = calcularFase6(dadosFase4(), f6, semRisco, f3)
        expect(r.medicacaoAlternativa, `percurso ${percurso}, degrau ${r.degrau}`)
          .not.toBe(r.medicacaoPreferencial)
      }
    }
  })
})
