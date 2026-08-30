import type {
  Paciente, Fase1Dados, Fase2Dados, Fase3Dados, Fase4Dados,
  Fase5Dados, Fase6Dados, Fase7Dados, Fase8Dados, DecisaoDiagnostica,
} from './types'
import { calcularIdade, dentroDoAmbitoCronico } from './idade'
import { calcularFase3 } from './fase3-provas'
import { calcularFase4, calcularCaratRinite, calcularCaratAsma, interpretarAct } from './fase4-controlo'
import { calcularFase6, obterDescricaoDegrau } from './fase6-terapeutica'
import { calcularFase7 } from './fase7-referenciacao'
import { calcularFase8 } from './fase8-agudizacao'

interface DadosRelatorio {
  paciente: Paciente
  fase1: Fase1Dados
  fase2: Fase2Dados
  fase3: Fase3Dados
  fase4: Fase4Dados
  fase5: Fase5Dados
  fase6: Fase6Dados
  fase7: Fase7Dados
  fase8: Fase8Dados
  decisaoDiagnostica: DecisaoDiagnostica
}

function formatarData(): string {
  return new Date().toLocaleDateString('pt-PT')
}

function sim(valor: boolean): string {
  return valor ? 'Sim' : 'Não'
}

/**
 * Um bloco condicional vazio deixa uma linha em branco a mais no relatório.
 * Em vez de o tratar em cada ponto de interpolação, normaliza-se o texto final.
 */
function limpar(texto: string): string {
  return texto.replace(/\n[ \t]*(?:\n[ \t]*)+\n/g, '\n\n').trim()
}

/** Critérios com três estados: um valor não medido não é um valor negativo. */
function estado(valor: boolean | null): string {
  if (valor === null) return 'Não avaliado'
  return valor ? 'Sim' : 'Não'
}


export function gerarRelatorioSOAP(dados: DadosRelatorio): string {
  const p0 = dados.paciente
  const r3 = calcularFase3(dados.fase3)
  const r4 = calcularFase4(dados.fase4)
  const r6 = calcularFase6(dados.fase4, dados.fase6, dados.fase5, dados.fase3)
  const r7 = calcularFase7(dados.fase4, dados.fase6, dados.fase7, dados.fase5, dados.fase3)
  const idadeNum = calcularIdade(p0.dataNascimento)
  const r8 = calcularFase8(dados.fase8, idadeNum)
  const caratRinite = calcularCaratRinite(dados.fase4)
  const caratAsma = calcularCaratAsma(dados.fase4)

  const { paciente: p, fase1: f1, fase2: f2, fase5: f5 } = dados

  const idade = calcularIdade(p.dataNascimento) ?? '—'

  const controloTexto = {
    'controlada': 'Controlada',
    'parcialmente-controlada': 'Parcialmente controlada',
    'nao-controlada': 'Não controlada',
  }[r4.nivelControlo]

  const agravamComExposicao = (
    f1.agravamComExercicio || f1.agravamComFrio ||
    f1.agravamComAlergenios || f1.agravamComInfecoes
  )

  const linhaQuestionario = dados.fase4.questionarioUsado === 'carat'
    ? `  • Score CARAT: ${r4.scoreCarat ?? 'Não preenchido'}/30 (rinite: ${caratRinite ?? '—'}/12; asma: ${caratAsma ?? '—'}/18)`
    : `  • ACT: ${r4.scoreAct !== null ? interpretarAct(r4.scoreAct) : 'Não preenchido'}`

  // A frequência de sintomas é o critério que escolhe o degrau inicial, pelo
  // que tem de constar do relatório.
  const linhaFrequencia = dados.fase4.frequenciaSintomas !== null
    ? '  • Frequência dos sintomas: ' + {
        'menos-2x-mes': 'menos de 2x por mês',
        'mais-2x-mes': '2x por mês ou mais, mas não na maioria dos dias',
        'maioria-dias': 'na maioria dos dias',
      }[dados.fase4.frequenciaSintomas]
    : '  • Frequência dos sintomas: Não registada'

  const linhaFev1Atual = r4.fev1Atual !== null
    ? `  • FEV1 atual: ${r4.fev1Atual}% do previsto`
    : ''

  const listaOuNenhum = (itens: string[], vazio: string): string =>
    itens.length > 0 ? itens.map(i => `  • ${i}`).join('\n') : `  • ${vazio}`

  const historiaClinica = listaOuNenhum(
    [
      f1.inicioNaInfancia && 'Início dos sintomas na infância',
      f1.riniteOuEczema && 'História de rinite alérgica ou eczema',
      f1.familiarAsmaAtopia && 'História familiar de asma ou atopia',
      f1.sensibilizacaoAlergenica && 'Sensibilização alergénica documentada',
    ].filter(Boolean) as string[],
    'Nenhum dos fatores de história clínica e familiar registado.'
  )

  const exameFisico = listaOuNenhum(
    [
      f1.sibilosNaExpiracao && 'Sibilos na expiração',
      f1.exameFisicoNormal && 'Exame físico normal',
      f1.silencioRespiratorio && '⚠ SILÊNCIO RESPIRATÓRIO — sinal de obstrução brônquica muito grave',
    ].filter(Boolean) as string[],
    'Sem alterações registadas.'
  )

  const comorbilidades = listaOuNenhum(
    [
      f5.obesidade && 'Obesidade',
      f5.rinossinusite && 'Rinossinusite crónica',
      f5.alergiaAlimentar && 'Alergia alimentar',
      f5.refluxo && 'Refluxo gastroesofágico',
      f5.gravidez && 'Gravidez',
      f5.eosinofilia && 'Eosinofilia',
    ].filter(Boolean) as string[],
    'Nenhuma comorbilidade registada.'
  )

  const exposicaoEFatores = listaOuNenhum(
    [
      f5.fumoTabaco && 'Exposição ao fumo do tabaco',
      f5.biomassa && 'Exposição a biomassa',
      f5.alergenios && 'Exposição a alergénios',
      f5.problemasPsicologicos && 'Problemas psicológicos',
      f5.fatoresSocioeconomicos && 'Fatores socioeconómicos',
    ].filter(Boolean) as string[],
    'Nenhuma exposição registada.'
  )

  const fatoresModificaveis = listaOuNenhum(
    [
      f5.sintomasNaoControlados && 'Sintomas não controlados',
      f5.naoCumprimentoIcs && 'Não cumprimento da terapêutica com ICS',
      f5.maAdesao && 'Má adesão à terapêutica',
      f5.tecnicaInalatoriaIncorreta && 'Técnica inalatória incorreta',
      f5.abusoDeSaba && 'Abuso de SABA (≥ 3 embalagens/ano)',
      f5.fev1Baixo && 'FEV1 < 60% do previsto',
    ].filter(Boolean) as string[],
    'Nenhum fator modificável registado.'
  )

  const blocoReferenciacao = r7.referenciar
    ? `⚠ CRITÉRIOS DE REFERENCIAÇÃO PRESENTES (${r7.criteriosPresentes.length}):\n`
      + r7.criteriosPresentes.map(c => `  • ${c}`).join('\n')
    : '  • Não foram identificados critérios de referenciação para consulta de especialidade.'

  const gravidadeTexto = {
    'ligeira': 'Ligeira', 'moderada': 'Moderada', 'grave': 'Grave', 'critica': 'Crítica',
  }[r8.gravidade]

  const blocoAgudizacao = r8.avaliada
    ? [
        '',
        '----------------------------------------',
        'AVALIAÇÃO DE AGUDIZAÇÃO',
        '----------------------------------------',
        `  • Gravidade: ${gravidadeTexto}`,
        `  • Nível de cuidados: ${r8.nivelCuidados}`,
        r8.criteriosPresentes.length > 0
          ? 'Critérios de gravidade presentes:\n' + r8.criteriosPresentes.map(c => `  • ${c}`).join('\n')
          : '  • Nenhum critério de gravidade presente.',
        r8.avaliacaoIncompleta
          ? `  ⚠ Avaliação incompleta — por medir: ${r8.criteriosPorAvaliar.join('; ')}.`
          : '',
        r8.fatoresMauPrognostico.length > 0
          ? '⚠ Fatores de mau prognóstico:\n' + r8.fatoresMauPrognostico.map(f => `  • ${f}`).join('\n')
          : '  • Sem fatores de mau prognóstico registados.',
        'Tratamento recomendado:',
        r8.tratamento.map(t => `  • ${t}`).join('\n'),
        '',
      ].filter(l => l !== '').join('\n') + '\n'
    : ''

  const textoConfirmacao =
    r3.confirmacaoFuncional === 'confirmada'
      ? 'Confirmação funcional: obstrução e variabilidade ambas documentadas.'
      : r3.confirmacaoFuncional === 'incompleta'
        ? `Confirmação funcional incompleta — por avaliar: ${r3.criteriosPorAvaliar.join('; ')}.`
        : 'Confirmação funcional não obtida: a limitação ao fluxo expiratório e a variabilidade não estão ambas documentadas.'

  const blocoDivergencia = [
    r4.divergenciaQuestionario,
    r4.incoerenciaSintomas,
  ].filter(Boolean).map(aviso => `\n  ⚠ ${aviso}`).join('')

  const blocoFatoresRisco = r6.fatoresDeRiscoPresentes.length > 0
    ? r6.fatoresDeRiscoPresentes.map(f => `  • ${f}`).join('\n')
    : '  • Nenhum fator de risco de agudização registado.'

  const degrauTerapiaTexto = obterDescricaoDegrau(r6)
  const diagnosticosDiferenciais = f2.diferenciaisExcluidos.length > 0
    ? f2.diferenciaisExcluidos.map(dd => `  • ${dd}`).join('\n')
    : '  • Não foram registados diagnósticos diferenciais excluídos.'

  // Doente fora do âmbito do percurso crónico: só a avaliação de agudização,
  // que é o único domínio coberto pela fonte nacional abaixo dos 6 anos.
  if (idade !== '—' && !dentroDoAmbitoCronico(idade)) {
    return limpar(`
========================================
RELATÓRIO CLÍNICO — AVALIAÇÃO DE AGUDIZAÇÃO
Data: ${formatarData()}
========================================

DADOS DO PACIENTE
Nome: ${p.nome || '—'}
Data de Nascimento: ${p.dataNascimento || '—'} (${idade} anos)
Sexo: ${p.sexo}
Nº Utente SNS: ${p.numeroUtente || '—'}

----------------------------------------
ÂMBITO
----------------------------------------
  • Doente com ${idade} anos. A ferramenta não cobre o diagnóstico nem a gestão
    crónica da asma abaixo dos 6 anos: nesta faixa etária as recomendações
    estabelecem que o diagnóstico assente na história clínica e no exame físico,
    que seja evitado um diagnóstico definitivo, e que a avaliação da função
    respiratória, quando necessária, motive orientação para centro de referência.
  • Este relatório cobre exclusivamente a avaliação da agudização.
${blocoAgudizacao}
========================================
Gerado pelo Sistema de Apoio à Decisão
Clínica ASMA — GRESP 2022 / GINA 2025
Este relatório é de apoio à decisão.
A responsabilidade clínica é do médico.
========================================
`)
  }

  if (dados.decisaoDiagnostica === 'nao-confirmado') {
    return limpar(`
========================================
RELATÓRIO CLÍNICO — EXCLUSÃO DE ASMA
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
  • Dispneia com tonturas ou parestesias: ${sim(f1.dispneiaTonturasParestesias)}
  • Dispneia de esforço com inspiração ruídosa: ${sim(f1.dispneiaPorExercicioComInspiracao)}

História clínica e familiar:
${historiaClinica}

Exame físico:
${exameFisico}

----------------------------------------
O — OBJETIVO
----------------------------------------
Provas Funcionais Respiratórias:
  • FEV1: ${dados.fase3.fev1Percentagem ?? '—'}% do previsto
  • FVC: ${dados.fase3.fvcPercentagem ?? '—'}% do previsto
  • FEV1/FVC: ${dados.fase3.fev1FvcRacio?.toFixed(2) ?? '—'}

Limitação ao fluxo expiratório:
  • Padrão obstrutivo (FEV1/FVC): ${estado(r3.obstrutivo)}

Confirmação da variabilidade ao fluxo expiratório:
  • Reversibilidade broncodilatadora: ${estado(r3.reversibilidade)}
  • Variabilidade diária do PEF: ${dados.fase3.variabilidadePef ?? '—'}% — ${estado(r3.pefPositivo)}
  • Variabilidade documentada: ${estado(r3.variabilidadeConfirmada)}

  ${textoConfirmacao}

Diagnósticos diferenciais excluídos:
${diagnosticosDiferenciais}

----------------------------------------
A — AVALIAÇÃO
----------------------------------------
  • Diagnóstico de asma: Não confirmado
  • A avaliação clínica e funcional realizada não permitiu confirmar o diagnóstico de asma.
  • Devem permanecer em consideração os diagnósticos diferenciais não excluídos.

----------------------------------------
P — PLANO
----------------------------------------
  • Reavaliar a hipótese diagnóstica de acordo com a evolução clínica.
  • Considerar investigação complementar ou repetição de provas funcionais, se clinicamente indicado.
  • Prosseguir a avaliação dos diagnósticos diferenciais não excluídos.

========================================
Gerado pelo Sistema de Apoio à Decisão
Clínica ASMA — GRESP 2022 / GINA 2025
Este relatório é de apoio à decisão.
A responsabilidade clínica é do médico.
========================================
`)
  }

  return limpar(`
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
  • Dispneia com tonturas ou parestesias: ${sim(f1.dispneiaTonturasParestesias)}
  • Dispneia de esforço com inspiração ruídosa: ${sim(f1.dispneiaPorExercicioComInspiracao)}

História clínica e familiar:
${historiaClinica}

Exame físico:
${exameFisico}

Risco futuro — fatores modificáveis:
${fatoresModificaveis}

Risco futuro — exposição e fatores contextuais:
${exposicaoEFatores}

Risco futuro — comorbilidades:
${comorbilidades}

Agudizações e fatores de risco major:
  • Internamento em UCI ou intubação prévia: ${sim(f5.intubacaoOuUciPrevia)}
  • Agudização grave no último ano: ${sim(f5.agudizacaoGraveUltimoAno)}
  • Nº de agudizações no último ano: ${f5.agudizacoesUltimoAno ?? '—'}
  • Nº de internamentos por asma no último ano: ${f5.internamentosUltimoAno ?? '—'}

----------------------------------------
O — OBJETIVO
----------------------------------------
Provas Funcionais Respiratórias:
  • FEV1: ${dados.fase3.fev1Percentagem ?? '—'}% do previsto
  • FVC: ${dados.fase3.fvcPercentagem ?? '—'}% do previsto
  • FEV1/FVC: ${dados.fase3.fev1FvcRacio?.toFixed(2) ?? '—'}

Limitação ao fluxo expiratório:
  • Padrão obstrutivo (FEV1/FVC): ${estado(r3.obstrutivo)}

Confirmação da variabilidade ao fluxo expiratório:
  • Reversibilidade broncodilatadora: ${estado(r3.reversibilidade)}
  • Variabilidade diária do PEF: ${dados.fase3.variabilidadePef ?? '—'}% — ${estado(r3.pefPositivo)}
  • Variabilidade documentada: ${estado(r3.variabilidadeConfirmada)}

  ${textoConfirmacao}

Controlo dos sintomas (últimas 4 semanas):
  • Sintomas diurnos > 2x/semana (sibilância, tosse por exercício, opressão torácica ou tosse após alergénios/poluentes): ${sim(dados.fase4.sintomasDiurnos)}
  • Sintomas noturnos e/ou ao despertar, com perturbação do sono incluindo tosse: ${sim(dados.fase4.sintomasNoturnos)}
  • Limitação das atividades diárias: ${sim(dados.fase4.limitacaoAtividades)}
  • Necessidade de alívio > 2x/semana: ${sim(dados.fase4.necessidadeAlivio)}
${linhaFrequencia}
${linhaQuestionario}
${linhaFev1Atual}

----------------------------------------
A — AVALIAÇÃO
----------------------------------------
  • Diagnóstico: Asma confirmada
  • Nível de controlo: ${controloTexto}${blocoDivergencia}
  • ${r6.degrauInicial ? 'Degrau terapêutico proposto' : 'Degrau terapêutico após ajuste'}: ${degrauTerapiaTexto} (Percurso ${r6.percurso})${r6.degrauInicial ? ' — seleção inicial' : ` — o doente fazia Degrau ${dados.fase6.degrauAtual}`}

Fatores de risco de agudização:
${blocoFatoresRisco}

Referenciação para consulta de especialidade:
${blocoReferenciacao}
${[
    f5.intubacaoOuUciPrevia && '  ⚠ FATOR DE RISCO MAJOR: Internamento prévio em UCI ou intubação',
    f5.agudizacaoGraveUltimoAno && '  ⚠ FATOR DE RISCO MAJOR: Agudização grave no último ano',
  ].filter(Boolean).join('\n')}

----------------------------------------
P — PLANO
----------------------------------------
  • Terapêutica sugerida: ${degrauTerapiaTexto} — ${r6.medicacaoPreferencial}
  • Alternativa terapêutica: ${r6.medicacaoAlternativa}
  • Ajuste terapêutico sugerido: ${r6.ajuste === 'subir' ? 'Verificar técnica/adesão/fatores modificáveis e considerar subir degrau' : r6.ajuste === 'descer' ? 'Considerar descer degrau apenas se controlo ≥ 3 meses' : 'Manter terapêutica atual'}
  • Percurso preferencial GINA 2025: Percurso 1 (ICS-formoterol)
  • Vacinação antigripal: Recomendar anualmente
  • Técnica inalatória: Rever na consulta
  • Plano de ação escrito: A elaborar com o doente${r7.perguntarDegrau3 && !dados.fase7.semControloDegrau3 ? '\n  ⚠ Verificar: o doente está há 3-6 meses sem controlo em degrau ≥ 3, com técnica inalatória correta e boa adesão? Em caso afirmativo, referenciar.' : ''}
${blocoAgudizacao}
========================================
Gerado pelo Sistema de Apoio à Decisão
Clínica ASMA — GRESP 2022 / GINA 2025
Este relatório é de apoio à decisão.
A responsabilidade clínica é do médico.
========================================
`)
}
