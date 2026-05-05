import type { Fase4Dados, Fase7Dados, ResultadoFase7 } from './types'
import { calcularControlo } from './fase4-controlo'
import { calcularFase6 } from './fase6-terapeutica'

// ============================================
// FASE 7 — Referenciação para Especialidade
// GRESP 2022
// ============================================

export function calcularFase7(
  fase4: Fase4Dados,
  fase6Dados: { percursoSelecionado: 1 | 2 },
  fase7: Fase7Dados,
  fev1Baixo: boolean
): ResultadoFase7 {

  const r6 = calcularFase6(fase4, fase6Dados, fev1Baixo)
  const controlo = calcularControlo(fase4)
  const criteriosPresentes: string[] = []

  if (fase7.dificuldadesDiagnostico)
    criteriosPresentes.push('Dificuldades no diagnóstico')

  if (fase7.suspeitaAsmaOcupacional)
    criteriosPresentes.push('Suspeita de asma ocupacional')

  // Automático: sem controlo após degrau ≥ 3
  if (controlo !== 'controlada' && r6.degrau >= 3)
    criteriosPresentes.push('Ausência de controlo com degrau ≥ 3')

  if (fase7.duasOuMaisHospitalizacoes)
    criteriosPresentes.push('≥ 2 hospitalizações ou urgências no último ano')

  if (fase7.asmaGrave)
    criteriosPresentes.push('Asma grave ou múltiplos internamentos')

  if (fase7.fatoresMauPrognostico)
    criteriosPresentes.push('Fatores de mau prognóstico')

  if (fase7.riscoEfeitosSecundarios)
    criteriosPresentes.push('Risco de efeitos secundários significativos')

  return {
    referenciar: criteriosPresentes.length > 0,
    criteriosPresentes,
  }
}
