// ============================================
// Cálculo da idade — fonte única
// ============================================
// Existiam quatro cálculos independentes (Layout, relatorio, Fase2Page e
// Fase3Page) e três deles dividiam a diferença de milissegundos por 365,25
// dias, o que os fazia discordar entre si por um dia perto dos aniversários.
// Este módulo usa o calendário e é o único cálculo de idade da aplicação.

export function calcularIdade(dataNascimento: string): number | null {
  if (!dataNascimento) return null

  const nascimento = new Date(dataNascimento)
  if (Number.isNaN(nascimento.getTime())) return null

  const hoje = new Date()
  if (nascimento > hoje) return null

  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const aindaNaoFezAnos =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())

  if (aindaNaoFezAnos) idade -= 1
  return idade
}
