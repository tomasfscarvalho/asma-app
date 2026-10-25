// ============================================
// PACIENTE
// ============================================
export interface Paciente {
  nome: string
  dataNascimento: string
  sexo: 'masculino' | 'feminino' | 'outro'
  numeroUtente: string
  cartaoCidadao: string
  contacto: string
  jaEmICS: boolean
}

// ============================================
// FASE 1 — Avaliação clínica inicial
// ============================================
export interface Fase1Dados {
  // Sintomas respiratórios típicos
  sibilancia: boolean
  dispneia: boolean
  tosse: boolean
  opressaoToracica: boolean

  // Fatores que aumentam probabilidade
  maisDe1Sintoma: boolean
  sintomasVariaveis: boolean
  agravamComExercicio: boolean
  agravamComFrio: boolean
  agravamComAlergenios: boolean
  agravamComInfecoes: boolean
  sintomasMaisde1xSemana: boolean
  sintomasNoturnosOuManha: boolean

  // Fatores que diminuem probabilidade
  tosseIsolada: boolean
  tosseProdutivaCronica: boolean
  dispneiaTonturasParestesias: boolean
  dorToracica: boolean
  dispneiaPorExercicioComInspiracao: boolean

  // História clínica e familiar
  inicioNaInfancia: boolean
  riniteOuEczema: boolean
  familiarAsmaAtopia: boolean
  sensibilizacaoAlergenica: boolean

  // Exame físico
  sibilosNaExpiracao: boolean
  exameFisicoNormal: boolean
  silencioRespiratorio: boolean
}

// ============================================
// FASE 2 — Diagnósticos diferenciais
// ============================================
export interface Fase2Dados {
  diferenciaisExcluidos: string[]
}

// ============================================
// FASE 3 — Provas funcionais
// ============================================
export interface Fase3Dados {
  // Espirometria
  fev1Litros: number | null
  fvcLitros: number | null
  fev1Percentagem: number | null
  fvcPercentagem: number | null
  fev1FvcRacio: number | null

  // Reversibilidade
  aumentoFev1Percentagem: number | null
  aumentoFev1ml: number | null

  // PEF
  variabilidadePef: number | null

  // Contexto
  pacientePediatrico: boolean

}

// ============================================
// FASE 4 — Controlo dos sintomas
// ============================================
export interface Fase4Dados {
  sintomasDiurnos: boolean
  sintomasNoturnos: boolean
  limitacaoAtividades: boolean
  necessidadeAlivio: boolean
  /** Medicação de alívio que o doente usa. Com ICS-formoterol, o uso > 2x/semana
   *  não conta para o controlo (GINA 2025, Box 2-2A, nota †). */
  tipoAlivio: TipoAlivio
  /** null enquanto o médico não escolher: um valor pré-selecionado não é uma resposta. */
  frequenciaSintomas: FrequenciaSintomas | null
  /** Frequência dos sintomas nas crianças dos 6 aos 11 anos (GINA 2025, Box 4-10 e 4-11). */
  frequenciaSintomasPediatrica: FrequenciaSintomasPediatrica | null
  despertarSemanal: boolean

  // ACT
  actLimitacaoAtividades: number | null
  actFaltaAr: number | null
  actSintomasNoturnos: number | null
  actUsoAlivio: number | null
  actAutoavaliacao: number | null

  questionarioUsado: 'act' | 'carat' | null
  fev1Atual: number | null

  // CARAT
  caratNasalCongestion: number | null
  caratSneezing: number | null
  caratRunnyNose: number | null
  caratNasalItching: number | null
  caratSleepDisturbance: number | null
  caratBreathlessness: number | null
  caratWheeze: number | null
  caratChestTightness: number | null
  caratActivityLimitation: number | null
  caratMedicationIncrease: number | null
}

// ============================================
// FASE 5 — Risco futuro
// ============================================
export interface Fase5Dados {
  // Medicação e função pulmonar
  naoCumprimentoIcs: boolean
  maAdesao: boolean
  tecnicaInalatoriaIncorreta: boolean
  abusoDeSaba: boolean
  fev1Baixo: boolean
  reversibilidadeElevada: boolean

  // Exposição
  fumoTabaco: boolean
  biomassa: boolean
  alergenios: boolean
  problemasPsicologicos: boolean
  fatoresSocioeconomicos: boolean

  // Comorbilidades
  obesidade: boolean
  rinossinusite: boolean
  alergiaAlimentar: boolean
  refluxo: boolean
  gravidez: boolean
  eosinofilia: boolean

  // Fatores major
  intubacaoOuUciPrevia: boolean
  agudizacaoGraveUltimoAno: boolean

  // Agudizações
  agudizacoesUltimoAno: number | null
  internamentosUltimoAno: number | null
}

// ============================================
// FASE 6 — Recomendação terapêutica
// ============================================
export interface Fase6Dados {
  percursoSelecionado: 1 | 2
  /** Degrau que o doente já faz. null numa primeira prescrição. */
  degrauAtual: DegrauTerapeutico | null
  /** Percurso em que o doente está (adultos e adolescentes). null se não indicado. */
  percursoAtual: 1 | 2 | null
  /** Controlo mantido nos últimos 3 meses — condição para descer degrau. */
  controloMantidoTresMeses: boolean
}

// ============================================
// FASE 7 — Referenciação
// ============================================
export interface Fase7Dados {
  dificuldadesDiagnostico: boolean
  suspeitaAsmaOcupacional: boolean
  necessitaTestesAdicionais: boolean
  semControloDegrau3: boolean
  duasOuMaisHospitalizacoes: boolean
  asmaGrave: boolean
  fatoresMauPrognostico: boolean
  riscoEfeitosSecundarios: boolean
}

// ============================================
// FASE 8 — Agudização
// ============================================
export interface Fase8Dados {
  exprimePorFrases: boolean | null
  freqRespiratoria: number | null
  freqCardiaca: number | null
  spo2: number | null
  pefPercentagem: number | null
  pacientePediatrico: boolean
  idadeMenorCinco: boolean
  sonolenciaConfusaoToraxSilencioso: boolean

  // Restantes critérios de gravidade da Tabela 7
  musculosAcessorios: boolean
  posicaoDebrucada: boolean
  agitacao: boolean
  cianose: boolean

  /** Sem boa resposta ao tratamento inicial, avaliada ao fim de 1 hora (Imagem 11). */
  respostaIncompletaAoAlivio: boolean

  // Fatores de mau prognóstico
  ventilacaoMecanicaPrevia: boolean
  duasOuMaisUrgencias: boolean
  corticosteroidesRecentes: boolean
  abusoDeSabaProlong: boolean
  comorbilidadesGraves: boolean
  naoAdesaoTratamento: boolean
  alergiaAlimentar: boolean
}

// ============================================
// RESULTADOS AUTOMÁTICOS
// ============================================
export type NivelControlo = 'controlada' | 'parcialmente-controlada' | 'nao-controlada'
// A Tabela 7 do GRESP e a Box 9-4 da GINA juntam a ligeira e a moderada numa só classe.
export type GravidadeAgudizacao = 'ligeira-moderada' | 'grave' | 'critica'
export type DegrauTerapeutico = 1 | 2 | 3 | 4 | 5
export type FrequenciaSintomas = 'menos-2x-mes' | 'mais-2x-mes' | 'maioria-dias'
export type FrequenciaSintomasPediatrica = 'menos-2-dias-semana' | '2-5-dias-semana' | 'maioria-dias'
export type TipoAlivio = 'saba' | 'ics-formoterol'

export interface ResultadoFase3 {
  /** Limitação ao fluxo expiratório (FEV1/FVC): informativa, não é condição. */
  obstrutivo: boolean | null
  /** Bloco 2 da Imagem 2, por qualquer das duas vias. */
  reversibilidade: boolean | null
  pefPositivo: boolean | null
  variabilidadeConfirmada: boolean | null
  /** Depende da variabilidade (reversibilidade ou PEF). */
  confirmacaoFuncional: 'confirmada' | 'nao-confirmada' | 'incompleta'
  criteriosPorAvaliar: string[]
}

export interface ResultadoFase4 {
  nivelControlo: NivelControlo
  scoreAct: number | null
  scoreCarat: number | null
  fev1Atual: number | null
  /** Aviso quando os domínios e o questionário apontam em sentidos opostos. */
  divergenciaQuestionario: string | null
  /** Aviso quando as duas escalas de frequência de sintomas se contradizem. */
  incoerenciaSintomas: string | null
}

export interface ResultadoFase6 {
  /** Esquema usado: adultos e adolescentes (Imagem 7) ou crianças dos 6 aos 11 anos (Imagem 8). */
  esquema: 'adulto' | 'pediatrico'
  /** Avisos sobre dados em falta que condicionam a sugestão. */
  avisos: string[]
  degrau: DegrauTerapeutico
  /** A recomendação veio da seleção inicial, e não de um ajuste. */
  degrauInicial: boolean
  fatoresDeRiscoPresentes: string[]
  percurso: 1 | 2
  ajuste: 'subir' | 'manter' | 'descer' | null
  /** A proposta usa um percurso diferente daquele em que o doente está. */
  mudaPercurso: boolean
  criterioReferenciacao: boolean
  referenciarEspecialidade: boolean
  ajustarVerificarPrimeiro: boolean
  medicacaoPreferencial: string
  medicacaoAlternativa: string
}

export interface ResultadoFase7 {
  referenciar: boolean
  criteriosPresentes: string[]
  /** Condições objetivas reunidas: falta o médico confirmar duração e adesão. */
  perguntarDegrau3: boolean
}

export interface ResultadoFase8 {
  gravidade: GravidadeAgudizacao
  nivelCuidados: string
  transferirUci: boolean
  criteriosPresentes: string[]
  criteriosPorAvaliar: string[]
  avaliacaoIncompleta: boolean
  /** Foi introduzido algum dado de agudização? */
  avaliada: boolean
  fatoresMauPrognostico: string[]
  /** Ligeira ou moderada sem boa resposta à 1.ª hora: reavaliar o destino. */
  reavaliar: boolean
  tratamento: string[]
}


// ============================================
// CONTEXTO DA CONSULTA
// ============================================
export type TipoConsulta = 'primeira-consulta' | 'seguimento'
export type DecisaoDiagnostica = 'confirmado' | 'nao-confirmado' | null
