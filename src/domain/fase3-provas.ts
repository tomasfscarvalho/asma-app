import type { Fase3Dados, ResultadoFase3 } from './types'

// ============================================
// FASE 3 — Confirmação Diagnóstica
// GRESP 2022 / GINA 2025
// ============================================
//
// A Imagem 2 do Guia prático do GRESP organiza a confirmação funcional em dois
// blocos sequenciais e nomeados — "Limitação ao fluxo expiratório" e
// "Confirmação da variabilidade ao fluxo expiratório" — e não numa contagem de
// critérios intermutáveis. Uma reversibilidade positiva sem obstrução
// documentada não confirma o diagnóstico, e o resultado reflete isso.
//
// Um critério cujos dados não foram introduzidos fica `null`, e não `false`:
// "não avaliado" e "negativo" são estados distintos e ambos visíveis.

function obterRacio(dados: Fase3Dados): number | null {
  if (dados.fev1FvcRacio !== null) return dados.fev1FvcRacio
  if (dados.fev1Litros !== null && dados.fvcLitros !== null && dados.fvcLitros > 0) {
    return dados.fev1Litros / dados.fvcLitros
  }
  return null
}

export function calcularFase3(dados: Fase3Dados): ResultadoFase3 {
  const pediatrico = dados.pacientePediatrico

  // --- BLOCO 1: limitação ao fluxo expiratório ---
  // Valores habituais do critério "razão inferior ao limite inferior do normal".
  const racio = obterRacio(dados)
  const limiteObstrucao = pediatrico ? 0.90 : 0.75
  const obstrutivo = racio === null ? null : racio < limiteObstrucao

  // --- BLOCO 2: confirmação da variabilidade ---
  // Adultos e adolescentes: FEV1 > 12% e > 200 ml. Crianças: > 12% do previsto.
  let reversibilidade: boolean | null
  if (dados.aumentoFev1Percentagem === null) {
    reversibilidade = null
  } else if (pediatrico) {
    reversibilidade = dados.aumentoFev1Percentagem > 12
  } else if (dados.aumentoFev1ml === null) {
    // Sem o valor absoluto não é possível aplicar o critério do adulto.
    reversibilidade = null
  } else {
    reversibilidade = dados.aumentoFev1Percentagem > 12 && dados.aumentoFev1ml > 200
  }

  const limitePef = pediatrico ? 13 : 10
  const pefPositivo = dados.variabilidadePef === null
    ? null
    : dados.variabilidadePef > limitePef

  // A variabilidade fica confirmada por qualquer uma das duas vias.
  const variabilidadeConfirmada =
    reversibilidade === true || pefPositivo === true ? true
    : reversibilidade === null && pefPositivo === null ? null
    : false

  // --- SÍNTESE ---
  // Confirmação funcional exige os dois blocos documentados.
  const confirmacaoFuncional =
    obstrutivo === true && variabilidadeConfirmada === true ? 'confirmada'
    : obstrutivo === null || variabilidadeConfirmada === null ? 'incompleta'
    : 'nao-confirmada'

  const criteriosPorAvaliar = [
    obstrutivo === null && 'Limitação ao fluxo expiratório (FEV1/FVC)',
    reversibilidade === null && 'Reversibilidade broncodilatadora',
    pefPositivo === null && 'Variabilidade diária do PEF',
  ].filter(Boolean) as string[]

  return {
    obstrutivo,
    reversibilidade,
    pefPositivo,
    variabilidadeConfirmada,
    confirmacaoFuncional,
    criteriosPorAvaliar,
  }
}

export function descreverCriterio(valor: boolean | null): string {
  if (valor === null) return 'Não avaliado'
  return valor ? 'Positivo' : 'Negativo'
}
