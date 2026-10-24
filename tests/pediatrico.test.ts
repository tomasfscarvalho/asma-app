// Testes do âmbito etário e do esquema das crianças dos 6 aos 11 anos.
//
// Fontes: Guia prático do GRESP 2022 — §4.2 e Tabela 9 (até aos 5 anos),
// Imagem 8 (tratamento dos 6 aos 11 anos), Imagem 11 (tratamento da
// agudização) — e GINA 2025, Box 4-10 e 4-11 (degrau inicial dos 6 aos 11).

import { describe, it, expect } from 'vitest'
import { calcularFase6, obterDescricaoDegrau } from '../src/domain/fase6-terapeutica'
import { calcularFase8 } from '../src/domain/fase8-agudizacao'
import { dentroDoAmbitoCronico } from '../src/domain/idade'
import { gerarRelatorioSOAP } from '../src/domain/relatorio'
import {
  dadosFase3, dadosFase4, dadosFase5, dadosFase6, dadosFase7, dadosFase8,
} from './_fixtures'
import type { Fase4Dados, Paciente } from '../src/domain/types'

function fase6Crianca(fase4: Partial<Fase4Dados>, fase6 = {}, fase5 = {}) {
  return calcularFase6(dadosFase4(fase4), dadosFase6(fase6), dadosFase5(fase5), dadosFase3(), 8)
}

// ------------------------------------------------------------- âmbito etário
describe('Âmbito etário — percurso crónico a partir dos 6 anos', () => {
  it('abaixo dos 6 anos o percurso crónico não se aplica (GRESP §4.2)', () => {
    expect(dentroDoAmbitoCronico(3)).toBe(false)
    expect(dentroDoAmbitoCronico(5)).toBe(false)
  })

  it('a partir dos 6 anos aplica-se', () => {
    expect(dentroDoAmbitoCronico(6)).toBe(true)
    expect(dentroDoAmbitoCronico(11)).toBe(true)
    expect(dentroDoAmbitoCronico(40)).toBe(true)
  })
})

// ------------------------------------------- degrau inicial dos 6 aos 11 anos
describe('Fase 6 — degrau inicial dos 6 aos 11 anos (GINA 2025, Box 4-11)', () => {
  it('sintomas < 2 dias/semana: Degrau 1', () => {
    expect(fase6Crianca({ frequenciaSintomasPediatrica: 'menos-2-dias-semana' }).degrau).toBe(1)
  })

  it('sintomas 2 a 5 dias/semana: Degrau 2', () => {
    expect(fase6Crianca({ frequenciaSintomasPediatrica: '2-5-dias-semana' }).degrau).toBe(2)
  })

  it('sintomas na maioria dos dias: Degrau 3', () => {
    expect(fase6Crianca({ frequenciaSintomasPediatrica: 'maioria-dias' }).degrau).toBe(3)
  })

  it('despertares semanais, mesmo com sintomas pouco frequentes: Degrau 3', () => {
    expect(fase6Crianca({ frequenciaSintomasPediatrica: 'menos-2-dias-semana', despertarSemanal: true }).degrau).toBe(3)
  })

  it('maioria dos dias, despertares e função baixa: Degrau 4', () => {
    const r = fase6Crianca({ frequenciaSintomasPediatrica: 'maioria-dias', despertarSemanal: true, fev1Atual: 55 })
    expect(r.degrau).toBe(4)
  })

  it('função baixa sem sintomas diários e despertares não chega ao Degrau 4', () => {
    const r = fase6Crianca({ frequenciaSintomasPediatrica: 'maioria-dias', fev1Atual: 55 })
    expect(r.degrau).toBe(3)
  })

  it('frequência por indicar: não assume o degrau mais baixo e avisa', () => {
    const r = fase6Crianca({})
    expect(r.degrau).toBe(2)
    expect(r.avisos.join(' ')).toContain('Frequência dos sintomas por indicar')
  })
})

// ---------------------------------------------- medicação dos 6 aos 11 anos
describe('Fase 6 — medicação dos 6 aos 11 anos (GRESP, Imagem 8)', () => {
  it('usa o esquema pediátrico e ignora o Percurso 1 do adulto', () => {
    const r = fase6Crianca({ frequenciaSintomasPediatrica: '2-5-dias-semana' }, { percursoSelecionado: 1 })
    expect(r.esquema).toBe('pediatrico')
    expect(r.medicacaoPreferencial).toBe('ICS diário em dose baixa, com SABA como alívio')
  })

  it('não propõe ICS-formoterol só a pedido nos Degraus 1 e 2', () => {
    for (const f of ['menos-2-dias-semana', '2-5-dias-semana'] as const) {
      const r = fase6Crianca({ frequenciaSintomasPediatrica: f })
      expect(r.medicacaoPreferencial).not.toContain('conforme necessário')
      expect(r.medicacaoPreferencial).not.toContain('ICS-formoterol')
    }
  })

  it('Degrau 3: MART só com dose muito baixa (BUD-FORM 100/6)', () => {
    const r = fase6Crianca({ frequenciaSintomasPediatrica: 'maioria-dias' })
    expect(r.medicacaoPreferencial).toContain('muito baixa')
    expect(r.medicacaoPreferencial).toContain('100/6')
  })

  it('Degrau 4: MART com dose baixa (BUD-FORM 200/6) e aconselhamento especializado', () => {
    const r = fase6Crianca({ frequenciaSintomasPediatrica: 'maioria-dias', despertarSemanal: true, fev1Atual: 55 })
    expect(r.medicacaoPreferencial).toContain('200/6')
    expect(r.medicacaoPreferencial).toContain('aconselhamento especializado')
  })

  it('não agrupa os Degraus 1 e 2 (isso é do Percurso 1 do adulto)', () => {
    const r = fase6Crianca({ frequenciaSintomasPediatrica: '2-5-dias-semana' })
    expect(obterDescricaoDegrau(r)).toBe('Degrau 2')
  })

  it('aos 12 anos já usa o esquema do adulto', () => {
    const r = calcularFase6(dadosFase4({ frequenciaSintomas: 'mais-2x-mes' }), dadosFase6(), dadosFase5(), dadosFase3(), 12)
    expect(r.esquema).toBe('adulto')
  })
})

// ----------------------------------------------- referenciação dos 6 aos 11
describe('Fase 6 — referenciação dos 6 aos 11 anos (GRESP p. 23)', () => {
  const naoControlada = { sintomasDiurnos: true, sintomasNoturnos: true, limitacaoAtividades: true }

  it('sem controlo já com dose média de ICS (Degrau 3): referenciar', () => {
    expect(fase6Crianca(naoControlada, { degrauAtual: 3 }).referenciarEspecialidade).toBe(true)
  })

  it('sem controlo no Degrau 2: subir, ainda sem referenciar', () => {
    const r = fase6Crianca(naoControlada, { degrauAtual: 2 })
    expect(r.ajuste).toBe('subir')
    expect(r.referenciarEspecialidade).toBe(false)
  })
})

// --------------------------------------------------- agudização por idade
describe('Fase 8 — a idade conhecida decide os limiares e o tratamento', () => {
  it('8 anos: tratamento pediátrico (Imagem 11)', () => {
    const r = calcularFase8(dadosFase8({ spo2: 95 }), 8)
    expect(r.tratamento.join(' ')).toContain('1–2 mg/kg/dia até 40 mg')
    expect(r.tratamento.join(' ')).toContain('94% e 98%')
  })

  it('8 anos: limiar de gravidade da SpO₂ do adulto (< 90%), como na Tabela 7', () => {
    expect(calcularFase8(dadosFase8({ spo2: 91 }), 8).gravidade).toBe('ligeira-moderada')
    expect(calcularFase8(dadosFase8({ spo2: 89 }), 8).gravidade).toBe('grave')
  })

  it('4 anos: limiar pediátrico da SpO₂ (< 92%)', () => {
    expect(calcularFase8(dadosFase8({ spo2: 91 }), 4).gravidade).toBe('grave')
  })

  it('adulto com a caixa "≤ 5 anos" marcada por engano continua a receber doses de adulto', () => {
    const r = calcularFase8(dadosFase8({ spo2: 95, idadeMenorCinco: true, pacientePediatrico: true }), 30)
    expect(r.tratamento.join(' ')).toContain('até 50 mg')
  })

  it('sem idade, a caixa "≤ 5 anos" continua a servir', () => {
    expect(calcularFase8(dadosFase8({ spo2: 91, idadeMenorCinco: true }), null).gravidade).toBe('grave')
  })
})

// ---------------------------------------------------------------- relatório
describe('Relatório — criança dos 6 aos 11 anos', () => {
  const hoje = new Date()
  const nascimento = new Date(hoje.getFullYear() - 8, hoje.getMonth(), 1).toISOString().slice(0, 10)
  const crianca: Paciente = {
    nome: 'Rui Teste', dataNascimento: nascimento, sexo: 'masculino',
    numeroUtente: '123456789', cartaoCidadao: '', contacto: '', jaEmICS: false,
  }
  const fase1 = {
    sibilancia: true, dispneia: true, tosse: false, opressaoToracica: false,
    maisDe1Sintoma: true, sintomasVariaveis: true,
    agravamComExercicio: true, agravamComFrio: false,
    agravamComAlergenios: false, agravamComInfecoes: false,
    sintomasMaisde1xSemana: true, sintomasNoturnosOuManha: true,
    tosseIsolada: false, tosseProdutivaCronica: false,
    dispneiaTonturasParestesias: false, dorToracica: false,
    dispneiaPorExercicioComInspiracao: false,
    inicioNaInfancia: true, riniteOuEczema: true,
    familiarAsmaAtopia: false, sensibilizacaoAlergenica: false,
    sibilosNaExpiracao: true, exameFisicoNormal: false,
    silencioRespiratorio: false,
  }
  const r = gerarRelatorioSOAP({
    paciente: crianca, fase1, fase2: { diferenciaisExcluidos: [] },
    fase3: dadosFase3({ pacientePediatrico: true }),
    fase4: dadosFase4({ frequenciaSintomasPediatrica: '2-5-dias-semana', questionarioUsado: 'act' }),
    fase5: dadosFase5(), fase6: dadosFase6({ percursoSelecionado: 1 }),
    fase7: dadosFase7(), fase8: dadosFase8(),
    decisaoDiagnostica: 'confirmado',
  })

  it('indica o esquema dos 6 aos 11 anos e não o Percurso 1', () => {
    expect(r).toContain('esquema dos 6 aos 11 anos')
    expect(r).not.toContain('Percurso preferencial GINA 2025: Percurso 1')
  })

  it('regista a frequência na escala pediátrica', () => {
    expect(r).toContain('2 a 5 dias por semana')
  })

  it('não interpreta o ACT abaixo dos 12 anos', () => {
    expect(r).toContain('Questionário de controlo: não aplicável')
  })
})
