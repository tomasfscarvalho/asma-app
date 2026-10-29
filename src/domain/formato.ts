// ============================================
// Formatação de números, rácios, datas e idades em português de Portugal
// ============================================

/** Número com vírgula decimal e o número de casas pedido. */
export function decimal(valor: number, casas = 2): string {
  return valor.toLocaleString('pt-PT', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

/** Número tal como foi introduzido (até duas casas), com vírgula decimal. */
export function numero(valor: number): string {
  return valor.toLocaleString('pt-PT', { maximumFractionDigits: 2 })
}

const LIMIARES_RACIO = [0.75, 0.90]

// Com duas casas, um rácio de 0,7475 apareceria como 0,75, ao lado do limiar
// "< 0,75" e da limitação confirmada. Perto dos limiares mostram-se as casas
// necessárias para que o valor arredondado não coincida com o limiar.
export function formatarRacio(racio: number): string {
  // Compara o texto mostrado, e não um arredondamento à parte, que pode diferir dele.
  const mostrado = (casas: number) => Number(decimal(racio, casas).replace(',', '.'))
  let casas = 2
  while (casas < 5 && LIMIARES_RACIO.some(l => racio !== l && mostrado(casas) === l)) casas++
  return decimal(racio, casas)
}

/** "1979-06-14" → "14/06/1979", como a data da consulta. */
export function dataPortuguesa(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso
}

/** Idade com o singular certo: "1 ano", "7 anos"; abaixo de 1 ano, "menos de 1 ano". */
export function anos(idade: number): string {
  if (idade < 1) return 'menos de 1 ano'
  return idade === 1 ? '1 ano' : `${idade} anos`
}
