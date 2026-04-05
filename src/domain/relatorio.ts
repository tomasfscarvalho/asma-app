import type {
  Paciente, Fase1Dados, Fase3Dados, Fase4Dados,
  Fase5Dados, Fase6Dados, Fase8Dados
} from './types'
import { calcularFase3 } from './fase3-provas'
import { calcularFase4 } from './fase4-controlo'
import { calcularFase6 } from './fase6-terapeutica'
import { calcularFase8 } from './fase8-agudizacao'

// ============================================
// GERADOR DE RELATÓRIO SOAP
// Capítulo 5, Tabela 11 — GRESP 2022
// ============================================

interface DadosRelatorio {
  paciente: Paciente
  fase1: Fase1Dados
  fase3: Fase3Dados
  fase4: Fase4Dados
  fase5: Fase5Dados
  fase6: Fase6Dados
  fase8: Fase8Dados
}

function formatarData(): string {
  return new Date().toLocaleDateString('pt-PT')
}

function sim(valor: boolean): string {
  return valor ? 'Sim' : 'Não'
}

function calcularCaratRinite(fase4: Fase4Dados): number | null {
  const campos = [
    fase4.caratNasalCongestion,
    fase4.caratSneezing,
    fase4.caratNasalItching,
    fase4.caratRunnyNose,
  ]

  if (campos.some(c => c === null)) return null
  return (campos as number[]).reduce((acc, val) => acc + val, 0)
}

function calcularCaratAsma(fase4: Fase4Dados): number | null {
  const campos = [
    fase4.caratBreathlessness,
    fase4.caratWheeze,
    fase4.caratChestTightness,
    fase4.caratActivityLimitation,
    fase4.caratSleepDisturbance,
    fase4.caratMedicationIncrease,
  ]

  if (campos.some(c => c === null)) return null
  return (campos as number[]).reduce((acc, val) => acc + val, 0)
}

export function gerarRelatorioSOAP(dados: DadosRelatorio): string {
  const r3 = calcularFase3(dados.fase3)
  const r4 = calcularFase4(dados.fase4)
  const r6 = calcularFase6(dados.fase4, dados.fase6)
  const r8 = calcularFase8(dados.fase8)
  const caratRinite = calcularCaratRinite(dados.fase4)
  const caratAsma = calcularCaratAsma(dados.fase4)

  const { paciente: p, fase1: f1, fase5: f5 } = dados

  // Calcular idade
  const idade = p.dataNascimento
    ? Math.floor((Date.now() - new Date(p.dataNascimento).getTime()) / 31557600000)
    : '—'

  // Nível de controlo em texto legível
  const controloTexto = {
    'controlada': 'Controlada',
    'parcialmente-controlada': 'Parcialmente Controlada',
    'nao-controlada': 'Não Controlada',
  }[r4.nivelControlo]

  const agravamComExposicao = (
    f1.agravamComExercicio || f1.agravamComFrio ||
    f1.agravamComAlergenios || f1.agravamComInfecoes
  )

  const linhaQuestionario = dados.fase4.questionarioUsado === 'carat'
    ? `  • Score CARAT: ${r4.scoreCarat ?? 'Não preenchido'}/30 (rinite: ${caratRinite ?? '—'}/12; asma: ${caratAsma ?? '—'}/18)`
    : `  • Score ACT: ${r4.scoreAct ?? 'Não preenchido'}/25`

  const linhaFev1Atual = r4.fev1Atual !== null
    ? `  • FEV1 atual: ${r4.fev1Atual}% do previsto`
    : ''

  const relatorio = `
========================================
RELATÓRIO CLÍNICO — ASMA
Data: ${formatarData()}
========================================

DADOS DO PACIENTE
Nome: ${p.nome || '—'}
Data de Nascimento: ${p.dataNascimento || '—'} (${idade} anos)
Sexo: ${p.sexo}
Nº Utente SNS: ${p.numeroUtente || '—'}
Cartão de Cidadão: ${p.cartaoCidadao || '—'}

----------------------------------------
S — SUBJETIVO
----------------------------------------
Sintomas respiratórios presentes:
  • Sibilância: ${sim(f1.sibilancia)}
  • Dispneia: ${sim(f1.dispneia)}
  • Tosse: ${sim(f1.tosse)}
  • Opressão torácica: ${sim(f1.opressaoToracica)}

Fatores que aumentam probabilidade de asma:
  • Mais do que 1 tipo de sintoma: ${sim(f1.maisDe1Sintoma)}
  • Sintomas variáveis ao longo do tempo: ${sim(f1.sintomasVariaveis)}
  • Agravam com exposição: ${sim(agravamComExposicao)}
  • Sintomas > 1x por semana: ${sim(f1.sintomasMaisde1xSemana)}
  • Sintomas noturnos ou matinais: ${sim(f1.sintomasNoturnosOuManha)}

Fatores que diminuem probabilidade de asma:
  • Tosse isolada: ${sim(f1.tosseIsolada)}
  • Tosse produtiva crónica: ${sim(f1.tosseProdutivaCronica)}
  • Dor torácica: ${sim(f1.dorToracica)}

Agudizações e risco futuro:
  • Fumo do tabaco: ${sim(f5.fumoTabaco)}
  • Abuso de SABA: ${sim(f5.abusoDeSaba)}
  • Internamento em UCI prévio: ${sim(f5.intubacaoOuUciPrevia)}
  • Agudização grave no último ano: ${sim(f5.agudizacaoGraveUltimoAno)}
  • Nº agudizações último ano: ${f5.agudizacoesUltimoAno ?? '—'}

----------------------------------------
O — OBJETIVO
----------------------------------------
Provas Funcionais Respiratórias:
  • FEV1: ${dados.fase3.fev1Percentagem ?? '—'}% do previsto
  • FVC: ${dados.fase3.fvcPercentagem ?? '—'}% do previsto
  • FEV1/FVC: ${dados.fase3.fev1FvcRacio?.toFixed(2) ?? (dados.fase3.fev1Percentagem && dados.fase3.fvcPercentagem ? (dados.fase3.fev1Percentagem / dados.fase3.fvcPercentagem).toFixed(2) : '—')}
  • Padrão obstrutivo: ${sim(r3.obstrutivo)}
  • Reversibilidade: ${sim(r3.reversibilidade)}
  • Variabilidade PEF: ${dados.fase3.variabilidadePef ?? '—'}% ${r3.pefPositivo ? '(positivo)' : ''}
  • Critérios objetivos positivos: ${r3.criteriosPositivos}/3

Controlo dos sintomas (últimas 4 semanas):
  • Sintomas diurnos > 2x/semana (sibilância, tosse por exercício, opressão torácica ou tosse após alergénios/poluentes): ${sim(dados.fase4.sintomasDiurnos)}
  • Sintomas noturnos e/ou ao despertar, com perturbação do sono incluindo tosse: ${sim(dados.fase4.sintomasNoturnos)}
  • Limitação das atividades diárias: ${sim(dados.fase4.limitacaoAtividades)}
  • Necessidade de alívio > 2x/semana: ${sim(dados.fase4.necessidadeAlivio)}
${linhaQuestionario}
${linhaFev1Atual}

----------------------------------------
A — AVALIAÇÃO
----------------------------------------
  • Diagnóstico: Asma
  • Nível de controlo: ${controloTexto}
  • Degrau terapêutico atual: Degrau ${r6.degrau} (Percurso ${r6.percurso})
${r6.criterioReferenciacao ? '  ⚠ CRITÉRIO DE REFERENCIAÇÃO PRESENTE' : ''}
${f5.intubacaoOuUciPrevia ? '  ⚠ FATOR DE RISCO MAJOR: Internamento prévio em UCI' : ''}
${f5.agudizacaoGraveUltimoAno ? '  ⚠ FATOR DE RISCO MAJOR: Agudização grave no último ano' : ''}

----------------------------------------
P — PLANO
----------------------------------------
  • Ajuste terapêutico sugerido: ${r6.ajuste === 'subir' ? 'Subir degrau' : r6.ajuste === 'descer' ? 'Considerar descer degrau (controlo ≥ 3 meses)' : 'Manter terapêutica atual'}
  • Percurso preferencial GINA 2022: Percurso 1 (ICS-formoterol)
  • Vacinação antigripal: Recomendar anualmente
  • Técnica inalatória: Rever na consulta
  • Plano de ação escrito: A elaborar com o doente

${r8.gravidade !== 'ligeira-moderada' ? `⚠ AGUDIZAÇÃO DETETADA
  Gravidade: ${r8.gravidade === 'grave' ? 'Grave' : 'Crítica'}
  Nível de cuidados: ${r8.nivelCuidados}` : ''}

========================================
Gerado pelo Sistema de Apoio à Decisão
Clínica ASMA — GRESP/GINA 2022
Este relatório é de apoio à decisão.
A responsabilidade clínica é do médico.
========================================
`.trim()

  return relatorio
}
