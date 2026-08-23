import { create } from 'zustand'
import { ECRA } from '../domain/fases'
import type {
  Paciente,
  Fase1Dados,
  Fase2Dados,
  Fase3Dados,
  Fase4Dados,
  Fase5Dados,
  Fase6Dados,
  Fase7Dados,
  Fase8Dados,
  ResultadoFase3,
  ResultadoFase4,
  ResultadoFase6,
  ResultadoFase7,
  ResultadoFase8,
  TipoConsulta,
  DecisaoDiagnostica,
} from '../domain/types'

const pacienteInicial: Paciente = {
  nome: '',
  dataNascimento: '',
  sexo: 'masculino',
  numeroUtente: '',
  cartaoCidadao: '',
  contacto: '',
  jaEmICS: false,
}

const fase1Inicial: Fase1Dados = {
  sibilancia: false,
  dispneia: false,
  tosse: false,
  opressaoToracica: false,
  maisDe1Sintoma: false,
  sintomasVariaveis: false,
  agravamComExercicio: false,
  agravamComFrio: false,
  agravamComAlergenios: false,
  agravamComInfecoes: false,
  sintomasMaisde1xSemana: false,
  sintomasNoturnosOuManha: false,
  tosseIsolada: false,
  tosseProdutivaCronica: false,
  dispneiaTonturasParestesias: false,
  dorToracica: false,
  dispneiaPorExercicioComInspiracao: false,
  inicioNaInfancia: false,
  riniteOuEczema: false,
  familiarAsmaAtopia: false,
  sensibilizacaoAlergenica: false,
  sibilosNaExpiracao: false,
  exameFisicoNormal: false,
  silencioRespiratorio: false,
}

const fase2Inicial: Fase2Dados = {
  diferenciaisExcluidos: [],
}

const fase3Inicial: Fase3Dados = {
  fev1Litros: null,
  fvcLitros: null,
  fev1Percentagem: null,
  fvcPercentagem: null,
  fev1FvcRacio: null,
  aumentoFev1Percentagem: null,
  aumentoFev1ml: null,
  variabilidadePef: null,
  pacientePediatrico: false,
}

const fase4Inicial: Fase4Dados = {
  sintomasDiurnos: false,
  sintomasNoturnos: false,
  limitacaoAtividades: false,
  necessidadeAlivio: false,
  frequenciaSintomas: 'menos-2x-mes',
  despertarSemanal: false,
  actLimitacaoAtividades: null,
  actFaltaAr: null,
  actSintomasNoturnos: null,
  actUsoAlivio: null,
  actAutoavaliacao: null,
  questionarioUsado: null,
  fev1Atual: null,
  caratNasalCongestion: null,
  caratSneezing: null,
  caratRunnyNose: null,
  caratNasalItching: null,
  caratSleepDisturbance: null,
  caratBreathlessness: null,
  caratWheeze: null,
  caratChestTightness: null,
  caratActivityLimitation: null,
  caratMedicationIncrease: null,
}

const fase5Inicial: Fase5Dados = {
  sintomasNaoControlados: false,
  naoCumprimentoIcs: false,
  maAdesao: false,
  tecnicaInalatoriaIncorreta: false,
  abusoDeSaba: false,
  fev1Baixo: false,
  fumoTabaco: false,
  biomassa: false,
  alergenios: false,
  problemasPsicologicos: false,
  fatoresSocioeconomicos: false,
  obesidade: false,
  rinossinusite: false,
  alergiaAlimentar: false,
  refluxo: false,
  gravidez: false,
  eosinofilia: false,
  intubacaoOuUciPrevia: false,
  agudizacaoGraveUltimoAno: false,
  agudizacoesUltimoAno: null,
  internamentosUltimoAno: null,
}

const fase6Inicial: Fase6Dados = {
  percursoSelecionado: 1,
}

const fase7Inicial: Fase7Dados = {
  dificuldadesDiagnostico: false,
  suspeitaAsmaOcupacional: false,
  necessitaTestesAdicionais: false,
  semControloDegrau3: false,
  duasOuMaisHospitalizacoes: false,
  asmaGrave: false,
  fatoresMauPrognostico: false,
  riscoEfeitosSecundarios: false,
}

const fase8Inicial: Fase8Dados = {
  exprimePorFrases: null,
  freqRespiratoria: null,
  freqCardiaca: null,
  spo2: null,
  pefPercentagem: null,
  pacientePediatrico: false,
  idadeMenorCinco: false,
  sonolenciaConfusaoToraxSilencioso: false,
  ventilacaoMecanicaPrevia: false,
  duasOuMaisUrgencias: false,
  corticosteroidesRecentes: false,
  abusoDeSabaProlong: false,
  comorbilidadesGraves: false,
  naoAdesaoTratamento: false,
  alergiaAlimentar: false,
}

interface AsmaState {
  paciente: Paciente
  fase1: Fase1Dados
  fase2: Fase2Dados
  fase3: Fase3Dados
  fase4: Fase4Dados
  fase5: Fase5Dados
  fase6: Fase6Dados
  fase7: Fase7Dados
  fase8: Fase8Dados

  resultadoFase3: ResultadoFase3 | null
  resultadoFase4: ResultadoFase4 | null
  resultadoFase6: ResultadoFase6 | null
  resultadoFase7: ResultadoFase7 | null
  resultadoFase8: ResultadoFase8 | null

  faseAtual: number
  substepAtual: number
  tipoConsulta: TipoConsulta | null
  decisaoDiagnostica: DecisaoDiagnostica
  fase8Ativa: boolean

  setTipoConsulta: (t: TipoConsulta) => void
  setDecisaoDiagnostica: (d: DecisaoDiagnostica) => void
  ativarFase8: () => void

  setPaciente: (dados: Partial<Paciente>) => void
  setFase1: (dados: Partial<Fase1Dados>) => void
  setFase2: (dados: Partial<Fase2Dados>) => void
  setFase3: (dados: Partial<Fase3Dados>) => void
  setFase4: (dados: Partial<Fase4Dados>) => void
  setFase5: (dados: Partial<Fase5Dados>) => void
  setFase6: (dados: Partial<Fase6Dados>) => void
  setFase7: (dados: Partial<Fase7Dados>) => void
  setFase8: (dados: Partial<Fase8Dados>) => void

  setResultadoFase3: (r: ResultadoFase3) => void
  setResultadoFase4: (r: ResultadoFase4) => void
  setResultadoFase6: (r: ResultadoFase6) => void
  setResultadoFase7: (r: ResultadoFase7) => void
  setResultadoFase8: (r: ResultadoFase8) => void

  navegarPara: (fase: number, substep?: number) => void
  resetarSessao: () => void
}

export const useAsmaStore = create<AsmaState>((set) => ({
  paciente: pacienteInicial,
  fase1: fase1Inicial,
  fase2: fase2Inicial,
  fase3: fase3Inicial,
  fase4: fase4Inicial,
  fase5: fase5Inicial,
  fase6: fase6Inicial,
  fase7: fase7Inicial,
  fase8: fase8Inicial,

  resultadoFase3: null,
  resultadoFase4: null,
  resultadoFase6: null,
  resultadoFase7: null,
  resultadoFase8: null,

  faseAtual: ECRA.DADOS_DOENTE,
  substepAtual: 0,
  tipoConsulta: null,
  decisaoDiagnostica: null,
  fase8Ativa: false,

  setPaciente: (dados) => set((s) => ({ paciente: { ...s.paciente, ...dados } })),
  setFase1: (dados) => set((s) => ({ fase1: { ...s.fase1, ...dados } })),
  setFase2: (dados) => set((s) => ({ fase2: { ...s.fase2, ...dados } })),
  setFase3: (dados) => set((s) => ({ fase3: { ...s.fase3, ...dados } })),
  setFase4: (dados) => set((s) => ({ fase4: { ...s.fase4, ...dados } })),
  setFase5: (dados) => set((s) => ({ fase5: { ...s.fase5, ...dados } })),
  setFase6: (dados) => set((s) => ({ fase6: { ...s.fase6, ...dados } })),
  setFase7: (dados) => set((s) => ({ fase7: { ...s.fase7, ...dados } })),
  setFase8: (dados) => set((s) => ({ fase8: { ...s.fase8, ...dados } })),

  setResultadoFase3: (r) => set({ resultadoFase3: r }),
  setResultadoFase4: (r) => set({ resultadoFase4: r }),
  setResultadoFase6: (r) => set({ resultadoFase6: r }),
  setResultadoFase7: (r) => set({ resultadoFase7: r }),
  setResultadoFase8: (r) => set({ resultadoFase8: r }),

  navegarPara: (fase, substep = 0) => set({ faseAtual: fase, substepAtual: substep }),
  setTipoConsulta: (t) => set({ tipoConsulta: t }),
  setDecisaoDiagnostica: (d) => set({ decisaoDiagnostica: d }),
  ativarFase8: () => set({ fase8Ativa: true, faseAtual: ECRA.FASE_8_AGUDIZACAO }),

  resetarSessao: () => set({
    paciente: pacienteInicial,
    fase1: fase1Inicial,
    fase2: fase2Inicial,
    fase3: fase3Inicial,
    fase4: fase4Inicial,
    fase5: fase5Inicial,
    fase6: fase6Inicial,
    fase7: fase7Inicial,
    fase8: fase8Inicial,
    resultadoFase3: null,
    resultadoFase4: null,
    resultadoFase6: null,
    resultadoFase7: null,
    resultadoFase8: null,
    faseAtual: ECRA.DADOS_DOENTE,
    substepAtual: 0,
    tipoConsulta: null,
    decisaoDiagnostica: null,
    fase8Ativa: false,
  }),
}))
