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
}

// ============================================
// FASE 1 — Avaliação clínica inicial
// ============================================
export interface Fase1Dados {
  // Sintomas típicos
  sibilancia: boolean
  dispneia: boolean
  tosse: boolean
  opressaoToracica: boolean

  // Fatores que aumentam probabilidade
  maisDe1Sintoma: boolean
  sintomasVariaveis: boolean
  agravamComExposicao: boolean
  sintomasMaisde1xSemana: boolean
  sintomasNoturnosOuManha: boolean

  // Fatores que diminuem probabilidade
  tosseIsolada: boolean
  tosseProdutivaCronica: boolean
  dorToracica: boolean
  dispneiaPorExercicioComInspiracao: boolean

  // História clínica
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

  // ACT
  actLimitacaoAtividades: number | null
  actFaltaAr: number | null
  actSintomasNoturnos: number | null
  actUsoAlivio: number | null
  actAutoavaliacao: number | null
}

// ============================================
// FASE 5 — Risco futuro
// ============================================
export interface Fase5Dados {
  // Medicação e função pulmonar
  sintomasNaoControlados: boolean
  naoCumprimentoIcs: boolean
  maAdesao: boolean
  tecnicaInalatoriaIncorreta: boolean
  abusoDeSaba: boolean
  fev1Baixo: boolean

  // Exposição
  fumoTabaco: boolean
  biomassa: boolean
  alergenios: boolean
  problemaspsicologicos: boolean
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
  internamatosUltimoAno: number | null
}

// ============================================
// FASE 6 — Recomendação terapêutica
// ============================================
export interface Fase6Dados {
  percursoSelecionado: 1 | 2
}

// ============================================
// FASE 7 — Referenciação
// ============================================
export interface Fase7Dados {
  dificuldadesDiagnostico: boolean
  suspeitaAsmaOcupacional: boolean
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

  // Fatores de mau prognóstico
  ventilaçãoMecanicaPrevia: boolean
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
export type GravidadeAgudizacao = 'ligeira-moderada' | 'grave' | 'critica'
export type DegrauTerapeutico = 1 | 2 | 3 | 4 | 5

export interface ResultadoFase3 {
  obstrutivo: boolean
  reversibilidade: boolean
  pefPositivo: boolean
  criteriosPositivos: number
}

export interface ResultadoFase4 {
  nivelControlo: NivelControlo
  scoreAct: number | null
}

export interface ResultadoFase6 {
  degrau: DegrauTerapeutico
  percurso: 1 | 2
  ajuste: 'subir' | 'manter' | 'descer' | null
  criterioReferenciacao: boolean
}

export interface ResultadoFase7 {
  referenciar: boolean
  criteriosPresentes: string[]
}

export interface ResultadoFase8 {
  gravidade: GravidadeAgudizacao
  nivelCuidados: string
  transferirUci: boolean
}