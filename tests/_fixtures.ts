// Objetos vazios reutilizáveis pelos testes, para que acrescentar um campo
// ao domínio não obrigue a tocar em cinco ficheiros de teste.

import type {
  Fase3Dados, Fase4Dados, Fase5Dados, Fase6Dados, Fase7Dados, Fase8Dados,
} from '../src/domain/types'

export function dadosFase3(o: Partial<Fase3Dados> = {}): Fase3Dados {
  return {
    fev1Litros: null, fvcLitros: null, fev1Percentagem: null, fvcPercentagem: null,
    fev1FvcRacio: null, aumentoFev1Percentagem: null, aumentoFev1ml: null,
    variabilidadePef: null, pacientePediatrico: false,
    ...o,
  }
}

export function dadosFase4(o: Partial<Fase4Dados> = {}): Fase4Dados {
  return {
    sintomasDiurnos: false, sintomasNoturnos: false, limitacaoAtividades: false,
    necessidadeAlivio: false, frequenciaSintomas: 'menos-2x-mes', despertarSemanal: false,
    actLimitacaoAtividades: null, actFaltaAr: null, actSintomasNoturnos: null,
    actUsoAlivio: null, actAutoavaliacao: null,
    questionarioUsado: null, fev1Atual: null,
    caratNasalCongestion: null, caratSneezing: null, caratRunnyNose: null,
    caratNasalItching: null, caratSleepDisturbance: null, caratBreathlessness: null,
    caratWheeze: null, caratChestTightness: null, caratActivityLimitation: null,
    caratMedicationIncrease: null,
    ...o,
  }
}

export function dadosFase5(o: Partial<Fase5Dados> = {}): Fase5Dados {
  return {
    sintomasNaoControlados: false, naoCumprimentoIcs: false, maAdesao: false,
    tecnicaInalatoriaIncorreta: false, abusoDeSaba: false, fev1Baixo: false,
    fumoTabaco: false, biomassa: false, alergenios: false,
    problemasPsicologicos: false, fatoresSocioeconomicos: false,
    obesidade: false, rinossinusite: false, alergiaAlimentar: false,
    refluxo: false, gravidez: false, eosinofilia: false,
    intubacaoOuUciPrevia: false, agudizacaoGraveUltimoAno: false,
    agudizacoesUltimoAno: null, internamentosUltimoAno: null,
    ...o,
  }
}

export function dadosFase6(o: Partial<Fase6Dados> = {}): Fase6Dados {
  return {
    percursoSelecionado: 1, degrauAtual: null, controloMantidoTresMeses: false,
    ...o,
  }
}

export function dadosFase7(o: Partial<Fase7Dados> = {}): Fase7Dados {
  return {
    dificuldadesDiagnostico: false, suspeitaAsmaOcupacional: false,
    necessitaTestesAdicionais: false, semControloDegrau3: false,
    duasOuMaisHospitalizacoes: false, asmaGrave: false,
    fatoresMauPrognostico: false, riscoEfeitosSecundarios: false,
    ...o,
  }
}

export function dadosFase8(o: Partial<Fase8Dados> = {}): Fase8Dados {
  return {
    exprimePorFrases: null, freqRespiratoria: null, freqCardiaca: null, spo2: null,
    pefPercentagem: null, pacientePediatrico: false, idadeMenorCinco: false,
    sonolenciaConfusaoToraxSilencioso: false,
    musculosAcessorios: false, posicaoDebrucada: false, agitacao: false, cianose: false,
    respostaIncompletaAoAlivio: false,
    ventilacaoMecanicaPrevia: false, duasOuMaisUrgencias: false,
    corticosteroidesRecentes: false, abusoDeSabaProlong: false,
    comorbilidadesGraves: false, naoAdesaoTratamento: false, alergiaAlimentar: false,
    ...o,
  }
}
