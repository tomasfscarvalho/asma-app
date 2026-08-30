import type { Fase3Dados, Fase4Dados, Fase5Dados, Fase6Dados, Fase7Dados, ResultadoFase7 } from './types'
import { calcularControlo } from './fase4-controlo'
import { calcularFase6 } from './fase6-terapeutica'

// ============================================
// FASE 7 — Referenciação para Especialidade
// GRESP 2022, §3.2.3
// ============================================
//
// O guia enuncia sete critérios. O quarto exige três condições cumulativas:
// "doentes em que, apesar de uma correta técnica inalatória e boa adesão à
// terapêutica, não se consiga alcançar o controlo da doença em 3-6 meses com
// medicação de degrau igual ou superior a 3".
//
// A aplicação não tem histórico — não persiste dados, por desenho — pelo que
// não pode saber há quanto tempo o doente está nesta situação nem confirmar a
// técnica e a adesão. Não conclui o critério: pergunta-o. Quando as condições
// objetivas se verificam, a Fase 7 apresenta a questão ao médico, e é a
// resposta dele que ativa o critério.

export function condicoesParaPerguntaDegrau3(
  fase4: Fase4Dados,
  fase6Dados: Fase6Dados,
  fase5: Fase5Dados,
  fase3: Fase3Dados,
): boolean {
  const r6 = calcularFase6(fase4, fase6Dados, fase5, fase3)
  return calcularControlo(fase4) !== 'controlada' && r6.degrau >= 3
}

export function calcularFase7(
  fase4: Fase4Dados,
  fase6Dados: Fase6Dados,
  fase7: Fase7Dados,
  fase5: Fase5Dados,
  fase3: Fase3Dados,
): ResultadoFase7 {
  const criteriosPresentes: string[] = []

  if (fase7.dificuldadesDiagnostico)
    criteriosPresentes.push('Dificuldades no diagnóstico')

  if (fase7.suspeitaAsmaOcupacional)
    criteriosPresentes.push('Suspeita de asma ocupacional')

  if (fase7.necessitaTestesAdicionais)
    criteriosPresentes.push('Necessidade de testes adicionais (por exemplo, testes de alergia)')

  if (fase7.semControloDegrau3)
    criteriosPresentes.push(
      'Ausência de controlo durante 3-6 meses com degrau ≥ 3, apesar de técnica inalatória correta e boa adesão'
    )

  if (fase7.duasOuMaisHospitalizacoes)
    criteriosPresentes.push('≥ 2 hospitalizações ou episódios de urgência nos últimos 12 meses')

  if (fase7.asmaGrave)
    criteriosPresentes.push('Asma grave ou múltiplos internamentos')

  if (fase7.fatoresMauPrognostico)
    criteriosPresentes.push('Fatores de mau prognóstico')

  if (fase7.riscoEfeitosSecundarios)
    criteriosPresentes.push('Presença ou risco de efeitos secundários significativos do tratamento')

  return {
    referenciar: criteriosPresentes.length > 0,
    criteriosPresentes,
    perguntarDegrau3: condicoesParaPerguntaDegrau3(fase4, fase6Dados, fase5, fase3),
  }
}
