// ============================================
// Idade e âmbito etário — fonte única
// ============================================
// Existiam quatro cálculos de idade independentes e três bandas etárias
// calculadas separadamente em páginas diferentes, o que fazia a mesma criança
// ser classificada de duas maneiras em fases consecutivas. Tudo passa por aqui.

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

// ============================================
// Âmbito etário da ferramenta
// ============================================
// O Guia prático do GRESP (§4.2) estabelece que, em crianças com idade igual
// ou inferior a 5 anos, o diagnóstico de asma assenta na história clínica e no
// exame físico, que não existe evidência suficiente sobre a aplicabilidade dos
// estudos da função respiratória nesta faixa etária, e que quando essa
// avaliação é necessária está recomendada a orientação para centro de
// referência. A Tabela 9 acrescenta que não é recomendada a utilização de
// ICS-LABA em crianças até aos quatro anos.
//
// A ferramenta assume por isso um âmbito repartido:
//
//   - diagnóstico, controlo, risco, terapêutica e referenciação: >= 6 anos;
//   - avaliação de agudização: qualquer idade, porque é o único domínio em que
//     a fonte nacional oferece critérios operacionalizáveis abaixo dos 6 anos
//     (Tabela 7 e Imagem 11) e porque é uma decisão de consulta única.

export const IDADE_MINIMA_PERCURSO_CRONICO = 6

export type FaixaEtaria =
  | 'pre-escolar'      // <= 5 anos: só o módulo de agudização
  | 'crianca'          // 6-11 anos: limiares pediátricos
  | 'jovem-adulto'     // 12-39 anos
  | 'adulto'           // >= 40 anos

export function faixaEtaria(idade: number | null): FaixaEtaria | null {
  if (idade === null) return null
  if (idade < IDADE_MINIMA_PERCURSO_CRONICO) return 'pre-escolar'
  if (idade <= 11) return 'crianca'
  if (idade <= 39) return 'jovem-adulto'
  return 'adulto'
}

export const rotuloFaixa: Record<FaixaEtaria, string> = {
  'pre-escolar': 'Idade pré-escolar (≤ 5 anos)',
  'crianca': 'Crianças (6–11 anos)',
  'jovem-adulto': 'Jovens adultos (12–39 anos)',
  'adulto': 'Adultos (≥ 40 anos)',
}

/** Aplica os limiares funcionais pediátricos da faixa 6-11 anos. */
export function aplicaLimiaresPediatricos(idade: number | null): boolean {
  return faixaEtaria(idade) === 'crianca'
}

/** O percurso de diagnóstico e gestão crónica cobre este doente? */
export function dentroDoAmbitoCronico(idade: number | null): boolean {
  const faixa = faixaEtaria(idade)
  return faixa !== null && faixa !== 'pre-escolar'
}

export const MOTIVO_FORA_DE_AMBITO =
  'A ferramenta cobre o diagnóstico e a gestão crónica da asma a partir dos 6 anos. ' +
  'Em crianças até aos 5 anos, as recomendações estabelecem que o diagnóstico assente ' +
  'na história clínica e no exame físico, que seja evitado um diagnóstico definitivo, ' +
  'e que a avaliação da função respiratória, quando necessária, motive orientação para ' +
  'centro de referência. A avaliação de agudização continua disponível para qualquer idade.'
