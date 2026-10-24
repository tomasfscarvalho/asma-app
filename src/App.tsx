import { useAsmaStore } from './store/useAsmaStore'
import { ECRA } from './domain/fases'
import { calcularIdade, dentroDoAmbitoCronico } from './domain/idade'
import PacientePage from './pages/PacientePage'
import Fase1Page from './pages/Fase1Page'
import Fase2Page from './pages/Fase2Page'
import Fase3Page from './pages/Fase3Page'
import DecisaoDiagnosticaPage from './pages/DecisaoDiagnosticaPage'
import Fase4Page from './pages/Fase4Page'
import Fase5Page from './pages/Fase5Page'
import Fase6Page from './pages/Fase6Page'
import Fase7Page from './pages/Fase7Page'
import Fase8Page from './pages/Fase8Page'
import RelatorioPage from './pages/RelatorioPage'

export default function App() {
  const { faseAtual, tipoConsulta, paciente, decisaoDiagnostica } = useAsmaStore()
  const idade = calcularIdade(paciente.dataNascimento)

  if (faseAtual === ECRA.DADOS_DOENTE) return <PacientePage />
  if (faseAtual === ECRA.RELATORIO) return <RelatorioPage />

  // Abaixo dos 6 anos só existe a avaliação de agudização: qualquer outro ecrã
  // do percurso crónico (incluindo saltos pela barra de progresso) cai nela.
  if (idade !== null && !dentroDoAmbitoCronico(idade)) return <Fase8Page />
  if (faseAtual === ECRA.DECISAO_DIAGNOSTICA) return <DecisaoDiagnosticaPage />

  if (tipoConsulta === 'primeira-consulta') {
    // As Fases 4 a 7 pressupõem o diagnóstico confirmado pelo médico: sem essa
    // decisão, qualquer salto para elas cai no ecrã da decisão diagnóstica.
    if (decisaoDiagnostica !== 'confirmado'
      && faseAtual >= ECRA.FASE_4_CONTROLO && faseAtual <= ECRA.FASE_7_REFERENCIACAO) {
      return <DecisaoDiagnosticaPage />
    }
    if (faseAtual === ECRA.FASE_1_AVALIACAO) return <Fase1Page />
    if (faseAtual === ECRA.FASE_2_DIFERENCIAIS) return <Fase2Page />
    if (faseAtual === ECRA.FASE_3_PROVAS) return <Fase3Page />
    if (faseAtual === ECRA.FASE_4_CONTROLO) return <Fase4Page />
    if (faseAtual === ECRA.FASE_5_RISCO) return <Fase5Page />
    if (faseAtual === ECRA.FASE_6_TERAPEUTICA) return <Fase6Page />
    if (faseAtual === ECRA.FASE_7_REFERENCIACAO) return <Fase7Page />
    if (faseAtual === ECRA.FASE_8_AGUDIZACAO) return <Fase8Page />
  }

  // No percurso de diagnóstico já confirmado, as Fases 1 a 3 são saltadas.
  if (tipoConsulta === 'seguimento') {
    if (faseAtual === ECRA.FASE_4_CONTROLO) return <Fase4Page />
    if (faseAtual === ECRA.FASE_5_RISCO) return <Fase5Page />
    if (faseAtual === ECRA.FASE_6_TERAPEUTICA) return <Fase6Page />
    if (faseAtual === ECRA.FASE_7_REFERENCIACAO) return <Fase7Page />
    if (faseAtual === ECRA.FASE_8_AGUDIZACAO) return <Fase8Page />
  }

  return <PacientePage />
}
