import type { Fase8Dados, ResultadoFase8, GravidadeAgudizacao } from './types'

// ============================================
// FASE 8 — Agudização
// GRESP 2022 / GINA 2025
// ============================================
//
// Fonte: Tabela 7 do Guia prático do GRESP (classificação da gravidade e
// fatores de mau prognóstico) e Imagem 11 (algoritmo de encaminhamento).
//
// Três princípios que a implementação anterior não respeitava:
//
//  1. Um sinal vital não medido não é um sinal vital normal. Cada critério
//     distingue "positivo", "negativo" e "não avaliado", e a avaliação
//     incompleta é sinalizada em vez de silenciada.
//  2. Os fatores de mau prognóstico não entram na classificação da gravidade,
//     que a Tabela 7 define por sinais vitais e fala, mas condicionam o
//     destino: o guia afirma que "a decisão acerca de hospitalização é
//     individual e deve ter em conta o estado clínico do doente, histórico de
//     agudizações e recursos disponíveis".
//  3. As bandas pediátricas de frequência cardíaca são duas, não uma:
//     > 180 bpm dos 0 aos 3 anos e > 150 bpm dos 4 aos 5.

interface Criterio {
  nome: string
  grave: boolean | null
}

function criterio(nome: string, valor: number | null, grave: (v: number) => boolean): Criterio {
  return { nome, grave: valor === null ? null : grave(valor) }
}

function limiteFreqCardiaca(idade: number | null): number {
  if (idade === null) return 120
  if (idade <= 3) return 180
  if (idade <= 5) return 150
  return 120
}

export function calcularFase8(dados: Fase8Dados, idade: number | null = null): ResultadoFase8 {
  const menorDeSeis = idade !== null && idade < 6
  const preEscolar = menorDeSeis || dados.idadeMenorCinco
  const pediatrico = preEscolar || dados.pacientePediatrico

  // --- CRITÉRIOS DE GRAVIDADE (Tabela 7) ---
  const criterios: Criterio[] = [
    {
      nome: 'Exprime-se por palavras isoladas',
      grave: dados.exprimePorFrases === null ? null : dados.exprimePorFrases === false,
    },
    criterio('Frequência respiratória', dados.freqRespiratoria,
      v => v > (preEscolar ? 40 : 30)),
    criterio('Frequência cardíaca', dados.freqCardiaca,
      v => v > limiteFreqCardiaca(idade ?? (dados.idadeMenorCinco ? 5 : null))),
    criterio('Saturação de O₂', dados.spo2,
      v => v < (pediatrico ? 92 : 90)),
    criterio('PEF', dados.pefPercentagem, v => v <= 50),
    // Observações do exame: uma caixa por marcar é um sinal ausente, e não um
    // dado em falta. Só os valores numéricos é que podem ficar por medir.
    { nome: 'Utilização de músculos acessórios', grave: dados.musculosAcessorios },
    { nome: 'Posição debruçada para a frente', grave: dados.posicaoDebrucada },
    { nome: 'Agitação', grave: dados.agitacao },
    { nome: 'Cianose', grave: dados.cianose },
  ]

  const criteriosPresentes = criterios.filter(c => c.grave === true).map(c => c.nome)
  const criteriosPorAvaliar = criterios.filter(c => c.grave === null).map(c => c.nome)

  // --- FATORES DE MAU PROGNÓSTICO (Tabela 7, segunda metade) ---
  const fatoresMauPrognostico = [
    dados.ventilacaoMecanicaPrevia && 'Episódios prévios de ventilação mecânica por asma',
    dados.duasOuMaisUrgencias && '≥ 2 hospitalizações ou recursos ao serviço de urgência nos últimos 12 meses',
    dados.corticosteroidesRecentes && 'Medicação recente ou atual com corticosteroides sistémicos',
    dados.abusoDeSabaProlong && 'Utilização prolongada e abusiva de broncodilatadores de curta duração',
    dados.comorbilidadesGraves && 'Comorbilidades graves descompensadas',
    dados.naoAdesaoTratamento && 'Não adesão ao tratamento proposto',
    dados.alergiaAlimentar && 'Presença de alergia alimentar',
  ].filter(Boolean) as string[]

  // --- CLASSIFICAÇÃO (Imagem 11) ---
  const transferirUci = dados.sonolenciaConfusaoToraxSilencioso

  let gravidade: GravidadeAgudizacao
  if (transferirUci) {
    gravidade = 'critica'
  } else if (criteriosPresentes.length > 0) {
    gravidade = 'grave'
  } else if (dados.respostaIncompletaAoAlivio) {
    // O guia distingue ligeira de moderada; a moderada corresponde ao doente
    // que não responde bem à intensificação inicial do alívio.
    gravidade = 'moderada'
  } else {
    gravidade = 'ligeira'
  }

  // --- DESTINO ---
  let nivelCuidados: string
  if (gravidade === 'critica') {
    nivelCuidados = 'Transferir para UCI imediatamente'
  } else if (gravidade === 'grave') {
    nivelCuidados = 'Transferir para urgência hospitalar'
  } else if (gravidade === 'moderada' || fatoresMauPrognostico.length > 0) {
    nivelCuidados = fatoresMauPrognostico.length > 0
      ? 'Tratar em Cuidados de Saúde Primários e ponderar referência hospitalar — fatores de mau prognóstico presentes'
      : 'Tratar em Cuidados de Saúde Primários e reavaliar a resposta; ponderar referência hospitalar se não houver melhoria'
  } else {
    nivelCuidados = 'Tratar em Cuidados de Saúde Primários'
  }

  const avaliacaoIncompleta = criteriosPorAvaliar.length > 0

  // Distinguir "agudização ligeira" de "agudização não avaliada": sem nenhum
  // dado introduzido, o módulo não foi usado e não deve aparecer no relatório.
  const avaliada =
    transferirUci ||
    criteriosPresentes.length > 0 ||
    [dados.exprimePorFrases, dados.freqRespiratoria, dados.freqCardiaca,
     dados.spo2, dados.pefPercentagem].some(v => v !== null) ||
    dados.respostaIncompletaAoAlivio

  return {
    gravidade,
    nivelCuidados,
    transferirUci,
    criteriosPresentes,
    criteriosPorAvaliar,
    avaliacaoIncompleta,
    avaliada,
    fatoresMauPrognostico,
    tratamento: tratamentoAgudizacao(gravidade, pediatrico),
  }
}

// --- TRATAMENTO (Imagens 10 e 11) ---
// Conteúdo determinístico, com doses e prazos, sobre a decisão mais urgente
// que a ferramenta cobre.
export function tratamentoAgudizacao(
  gravidade: GravidadeAgudizacao,
  pediatrico: boolean,
): string[] {
  const corticoide = pediatrico
    ? 'Prednisolona 1–2 mg/kg/dia até 40 mg, durante 3 a 5 dias'
    : 'Prednisolona 1 mg/kg/dia até 50 mg, durante 5 a 7 dias'
  const oxigenacao = pediatrico
    ? 'Manter SpO₂ entre 94% e 98%'
    : 'Manter SpO₂ entre 93% e 95%'

  if (gravidade === 'critica') {
    return [
      'Transferir para UCI. Enquanto aguarda transferência:',
      'SABA, considerar brometo de ipratrópio',
      'Oxigénio suplementar — ' + oxigenacao.toLowerCase(),
      'Corticosteroide sistémico, preferencialmente por via oral',
    ]
  }

  const base = [
    'SABA 4 a 10 inalações com câmara expansora, de 20 em 20 minutos na primeira hora',
    corticoide,
    oxigenacao,
    'Agendar consulta de seguimento em três dias, nunca depois de sete',
  ]

  if (gravidade === 'grave') {
    return [
      'Transferir para urgência hospitalar. Iniciar entretanto:',
      ...base.slice(0, 3),
      'Considerar brometo de ipratrópio',
    ]
  }
  if (gravidade === 'moderada') {
    return ['Considerar brometo de ipratrópio nas crises moderadas a graves', ...base]
  }
  return base
}
