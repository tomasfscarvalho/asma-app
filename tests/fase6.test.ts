import { describe, it, expect } from 'vitest'
import { calcularFase6, obterDescricaoDegrau } from '../src/domain/fase6-terapeutica'
import { temRiscoAgudizacoes, avaliarFev1Baixo, reversibilidadeElevada } from '../src/domain/fase5-risco'
import { dadosFase3, dadosFase4, dadosFase5, dadosFase6 } from './_fixtures'

const f3 = dadosFase3()
const semRisco = dadosFase5()
const comFev1Baixo = dadosFase5({ fev1Baixo: true })
const p1 = dadosFase6({ percursoSelecionado: 1 })
const p2 = dadosFase6({ percursoSelecionado: 2 })

describe('Fase 6 — seleção do degrau inicial (GRESP 2022, Imagens 6.a e 6.b; GINA 2025, Box 4-4)', () => {
  // GINA 2025, Box 4-4: a função baixa sozinha fica no Degrau 3; o Degrau 4
  // exige também sintomas na maioria dos dias ou despertar semanal.
  it('baixa função respiratória sozinha seleciona degrau 3 nos dois percursos', () => {
    expect(calcularFase6(dadosFase4(), p1, comFev1Baixo, f3).degrau).toBe(3)
    expect(calcularFase6(dadosFase4(), p2, comFev1Baixo, f3).degrau).toBe(3)
  })

  it('sintomas na maioria dos dias com função baixa selecionam degrau 4', () => {
    const f4 = dadosFase4({ frequenciaSintomas: 'maioria-dias', sintomasDiurnos: true })
    expect(calcularFase6(f4, p1, comFev1Baixo, f3).degrau).toBe(4)
    expect(calcularFase6(f4, p2, comFev1Baixo, f3).degrau).toBe(4)
  })

  it('despertar semanal com agudização recente seleciona degrau 4', () => {
    const f4 = dadosFase4({ despertarSemanal: true, sintomasNoturnos: true })
    expect(calcularFase6(f4, p2, dadosFase5({ agudizacoesUltimoAno: 1 }), f3).degrau).toBe(4)
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
    expect(calcularFase6(dadosFase4({ frequenciaSintomas: 'menos-2x-mes' }), p2, semRisco, f3).degrau).toBe(1)
  })

  it('sem a frequência dos sintomas não propõe o degrau 1 e avisa', () => {
    const r = calcularFase6(dadosFase4(), p2, semRisco, f3)
    expect(r.degrau).toBe(2)
    expect(r.avisos.join(' ')).toContain('Frequência dos sintomas por indicar')
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
  const raros = dadosFase4({ frequenciaSintomas: 'menos-2x-mes' })

  it('o degrau 1 exige ausência de risco, e não apenas sintomas raros', () => {
    const comRisco = dadosFase5({ intubacaoOuUciPrevia: true })
    expect(calcularFase6(raros, p2, semRisco, f3).degrau).toBe(1)
    expect(calcularFase6(raros, p2, comRisco, f3).degrau).toBe(2)
  })

  // Imagem 4 do GRESP / Box 2-2B da GINA: medicação, função, contexto clínico,
  // exposição, comorbilidades e outros.
  it('cada fator do guia conta como risco', () => {
    const casos = [
      dadosFase5({ abusoDeSaba: true }),
      dadosFase5({ agudizacaoGraveUltimoAno: true }),
      dadosFase5({ agudizacoesUltimoAno: 1 }),
      dadosFase5({ internamentosUltimoAno: 1 }),
      dadosFase5({ maAdesao: true }),
      dadosFase5({ fumoTabaco: true }),
      dadosFase5({ biomassa: true }),
      dadosFase5({ alergenios: true }),
      dadosFase5({ problemasPsicologicos: true }),
      dadosFase5({ fatoresSocioeconomicos: true }),
      dadosFase5({ obesidade: true }),
      dadosFase5({ rinossinusite: true }),
      dadosFase5({ alergiaAlimentar: true }),
      dadosFase5({ refluxo: true }),
      dadosFase5({ gravidez: true }),
      dadosFase5({ eosinofilia: true }),
    ]
    for (const f5 of casos) {
      expect(temRiscoAgudizacoes(f3, raros, f5)).toBe(true)
      expect(calcularFase6(raros, p2, f5, f3).degrau).toBe(2)
    }
  })

  it('os sintomas não controlados vêm da classificação da Fase 4', () => {
    const naoControlada = dadosFase4({ frequenciaSintomas: 'menos-2x-mes', limitacaoAtividades: true })
    expect(temRiscoAgudizacoes(f3, naoControlada, semRisco)).toBe(true)
    expect(calcularFase6(naoControlada, p2, semRisco, f3).degrau).toBe(2)
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
    expect(calcularFase6(dadosFase4(), p1, semRisco, f3baixo).degrau).toBe(3)
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

  // Quem acaba de receber a primeira proposta de degrau não tem nada para
  // subir, e não está há 3-6 meses sem controlo num degrau que ainda não faz.
  it('numa seleção inicial não há ajuste nem critério de referenciação por degrau', () => {
    const r = calcularFase6(naoControlada, dadosFase6(), semRisco, f3)
    expect(r.ajuste).toBeNull()
    expect(r.ajustarVerificarPrimeiro).toBe(false)
    expect(r.referenciarEspecialidade).toBe(false)
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

// Imagem 9 do GRESP: sem controlo abaixo do Degrau 3, rever o diagnóstico e os
// fatores associados; a partir do Degrau 3, referenciar. Conta o degrau que o
// doente já faz, e não o proposto depois de subir.
describe('Fase 6 — referenciação pelo degrau atual (GRESP 2022, Imagem 9)', () => {
  const naoControlada = dadosFase4({
    sintomasDiurnos: true, sintomasNoturnos: true, limitacaoAtividades: true,
  })

  it('Degrau 2 sem controlo: sobe para o 3, sem referenciar', () => {
    const r = calcularFase6(naoControlada, dadosFase6({ degrauAtual: 2 }), semRisco, f3)
    expect(r.degrau).toBe(3)
    expect(r.referenciarEspecialidade).toBe(false)
  })

  it('Degrau 3 sem controlo: referenciar', () => {
    const r = calcularFase6(naoControlada, dadosFase6({ degrauAtual: 3 }), semRisco, f3)
    expect(r.referenciarEspecialidade).toBe(true)
  })
})

// O domínio do alívio > 2x/semana é só para SABA (GINA 2025, Box 2-2A, nota †).
describe('Fase 6 — o alívio com ICS-formoterol não faz subir nem referenciar', () => {
  const soAlivio = { necessidadeAlivio: true, tipoAlivio: 'ics-formoterol' as const }

  it('Percurso 1, Degrau 3, só com uso frequente de ICS-formoterol: mantém', () => {
    const r = calcularFase6(dadosFase4(soAlivio), dadosFase6({ percursoSelecionado: 1, degrauAtual: 3 }), semRisco, f3)
    expect(r.ajuste).toBe('manter')
    expect(r.degrau).toBe(3)
    expect(r.referenciarEspecialidade).toBe(false)
  })

  it('com SABA, o mesmo domínio continua a contar', () => {
    const r = calcularFase6(dadosFase4({ ...soAlivio, tipoAlivio: 'saba' }), dadosFase6({ percursoSelecionado: 2, degrauAtual: 3 }), semRisco, f3)
    expect(r.ajuste).toBe('subir')
    expect(r.referenciarEspecialidade).toBe(true)
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

  // GRESP 2022, §4.1: a descida não é aconselhada até ao parto.
  it('na grávida não propõe descer, e avisa', () => {
    const f6 = dadosFase6({ degrauAtual: 3, controloMantidoTresMeses: true })
    const r = calcularFase6(dadosFase4(), f6, dadosFase5({ gravidez: true }), f3)
    expect(r.ajuste).toBe('manter')
    expect(r.degrau).toBe(3)
    expect(r.avisos.join(' ')).toContain('Gravidez')
  })

  // GRESP 2022, p. 24: com fatores de risco, descer com vigilância apertada.
  it('com fatores de risco, desce com aviso de vigilância apertada', () => {
    const f6 = dadosFase6({ degrauAtual: 3, controloMantidoTresMeses: true })
    const r = calcularFase6(dadosFase4(), f6, dadosFase5({ obesidade: true }), f3)
    expect(r.ajuste).toBe('descer')
    expect(r.avisos.join(' ')).toContain('vigilância apertada')
  })
})

// Imagem 7 do GRESP: no Percurso 1, os Degraus 1 e 2 são um só nível.
describe('Fase 6 — Percurso 1: subir dos Degraus 1-2 leva ao Degrau 3', () => {
  const naoControlada = dadosFase4({ sintomasDiurnos: true, sintomasNoturnos: true, limitacaoAtividades: true })

  it('de qualquer dos dois sobe para o Degrau 3, com outra medicação', () => {
    for (const degrauAtual of [1, 2] as const) {
      const r = calcularFase6(naoControlada, dadosFase6({ percursoSelecionado: 1, degrauAtual }), semRisco, f3)
      expect(r.degrau).toBe(3)
      expect(r.medicacaoPreferencial).toContain('manutenção')
    }
  })

  it('no Percurso 2 os degraus continuam separados', () => {
    const r = calcularFase6(naoControlada, dadosFase6({ percursoSelecionado: 2, degrauAtual: 1 }), semRisco, f3)
    expect(r.degrau).toBe(2)
  })
})

// GRESP 2022, p. 24: o aumento de degrau depende da opção tomada antes.
describe('Fase 6 — a mudança de percurso fica à vista', () => {
  it('assinala quando a proposta usa outro percurso', () => {
    const f6 = dadosFase6({ percursoSelecionado: 1, percursoAtual: 2, degrauAtual: 3 })
    const r = calcularFase6(dadosFase4(), f6, semRisco, f3)
    expect(r.mudaPercurso).toBe(true)
    expect(r.avisos.join(' ')).toContain('do Percurso 2 para o Percurso 1')
  })

  it('não assinala nada se continua no mesmo percurso', () => {
    const f6 = dadosFase6({ percursoSelecionado: 2, percursoAtual: 2, degrauAtual: 3 })
    expect(calcularFase6(dadosFase4(), f6, semRisco, f3).mudaPercurso).toBe(false)
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
