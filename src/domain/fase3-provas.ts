import type { Fase3Dados, ResultadoFase3 } from './types'

// ============================================
// FASE 3 — Confirmação Diagnóstica
// GRESP 2022 / GINA 2022
// ============================================

export function calcularFase3(dados: Fase3Dados): ResultadoFase3 {

  // --- 1. OBSTRUÇÃO (FEV1/FVC) ---
  // Usar apenas o rácio FEV1/FVC medido; não derivar de percentagens previstas.
  const racio = dados.fev1FvcRacio ??
    (dados.fev1Litros !== null && dados.fvcLitros !== null && dados.fvcLitros > 0
      ? dados.fev1Litros / dados.fvcLitros
      : null)

  const limiteObstrucao = dados.pacientePediatrico ? 0.90 : 0.75
  const obstrutivo = racio !== null ? racio < limiteObstrucao : false

  // --- 2. REVERSIBILIDADE ---
  // Adultos: FEV1 > 12% E > 200ml
  // Crianças: FEV1 > 12% do previsto (só percentagem)
  let reversibilidade = false
  if (dados.pacientePediatrico) {
    reversibilidade = (dados.aumentoFev1Percentagem ?? 0) > 12
  } else {
    reversibilidade =
      (dados.aumentoFev1Percentagem ?? 0) > 12 &&
      (dados.aumentoFev1ml ?? 0) > 200
  }

  // --- 3. VARIABILIDADE DO PEF ---
  const limitePef = dados.pacientePediatrico ? 13 : 10
  const pefPositivo = (dados.variabilidadePef ?? 0) > limitePef


  // --- 4. CONTAGEM DE CRITÉRIOS POSITIVOS ---
  const criteriosPositivos = [obstrutivo, reversibilidade, pefPositivo]
    .filter(Boolean).length

  return {
    obstrutivo,
    reversibilidade,
    pefPositivo,
    criteriosPositivos,
  }
}
