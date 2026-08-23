// ============================================
// Identificadores de ecrã usados por `faseAtual`
// ============================================
// Atenção: estes números não coincidem com a numeração clínica das fases.
// O ecrã da Fase 8 (agudização) é o índice 7, e o índice 8 é o relatório.
// A numeração vem da ordem de implementação e mantém-se para não quebrar
// as chamadas a navegarPara() espalhadas pelas páginas.

export const ECRA = {
  DADOS_DOENTE: -1,
  FASE_1_AVALIACAO: 0,
  FASE_2_DIFERENCIAIS: 1,
  FASE_3_PROVAS: 2,
  FASE_4_CONTROLO: 3,
  FASE_5_RISCO: 4,
  FASE_6_TERAPEUTICA: 5,
  FASE_7_REFERENCIACAO: 6,
  FASE_8_AGUDIZACAO: 7,
  RELATORIO: 8,
  DECISAO_DIAGNOSTICA: 9,
} as const

export type Ecra = (typeof ECRA)[keyof typeof ECRA]
