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
//
// A Tabela 7 do GRESP (e a Box 9-4 da GINA 2025) junta a agudização ligeira e
// a moderada numa só classe. A resposta ao tratamento inicial não cria uma
// classe própria: é avaliada ao fim de 1 hora (Imagem 11) e, sem boa resposta,
// leva a reavaliar o destino.

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
  // Quando a idade é conhecida, é ela que manda; a caixa "≤ 5 anos" só serve
  // quando a data de nascimento não foi introduzida.
  // - Limiares de gravidade próprios (Tabela 7): crianças até aos 5 anos.
  // - Tratamento pediátrico (Imagem 11: prednisolona 1–2 mg/kg até 40 mg,
  //   SpO₂ 94–98%): todas as crianças, até aos 11 anos.
  const preEscolar = idade !== null ? idade < 6 : dados.idadeMenorCinco
  const pediatrico = preEscolar
  const tratamentoPediatrico = idade !== null ? idade < 12 : (dados.idadeMenorCinco || dados.pacientePediatrico)

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
    // O PEF só se mede acima dos 5 anos (GINA 2025, Box 9-4): abaixo disso não
    // entra nem como critério nem como dado em falta.
    ...(preEscolar ? [] : [criterio('PEF', dados.pefPercentagem, v => v <= 50)]),
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
  } else {
    gravidade = 'ligeira-moderada'
  }
  const reavaliar = gravidade === 'ligeira-moderada' && dados.respostaIncompletaAoAlivio

  // --- DESTINO ---
  let nivelCuidados: string
  if (gravidade === 'critica') {
    nivelCuidados = 'Transferir para UCI imediatamente'
  } else if (gravidade === 'grave') {
    nivelCuidados = 'Transferir para urgência hospitalar'
  } else if (reavaliar) {
    nivelCuidados = 'Sem boa resposta ao fim de 1 hora: ponderar referenciação hospitalar; se houver deterioração, tratar como agudização grave'
      + (fatoresMauPrognostico.length > 0 ? ' — fatores de mau prognóstico presentes' : '')
  } else if (fatoresMauPrognostico.length > 0) {
    nivelCuidados = 'Tratar em Cuidados de Saúde Primários e ponderar referenciação hospitalar — fatores de mau prognóstico presentes'
  } else {
    nivelCuidados = 'Tratar em Cuidados de Saúde Primários e avaliar a resposta ao fim de 1 hora'
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
    reavaliar,
    tratamento: tratamentoAgudizacao(gravidade, tratamentoPediatrico),
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
      // Só a primeira letra passa a minúscula: toLowerCase() fazia «spo₂».
      'Oxigénio suplementar para ' + oxigenacao.charAt(0).toLowerCase() + oxigenacao.slice(1),
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
  // Ligeira ou moderada (Imagem 11): o ipratrópio é opção nas moderadas, e a
  // resposta avalia-se ao fim de 1 hora.
  return [
    base[0],
    'Nas crises moderadas, pode considerar-se brometo de ipratrópio',
    base[1],
    base[2],
    'Avaliar a resposta ao fim de 1 hora',
    'Boa resposta: melhoria dos sintomas, exame físico normal, PEF > 60–80% do previsto ou do melhor valor anterior e SpO₂ > 94%',
    'Na alta: medicação de alívio só quando necessária; manter ICS em dose mais alta durante 1–2 semanas a 3 meses, conforme a evolução',
    base[3],
  ]
}
