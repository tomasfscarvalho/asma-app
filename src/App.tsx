import { useAsmaStore } from './store/useAsmaStore'
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
  const { faseAtual, tipoConsulta } = useAsmaStore()

  if (faseAtual === -1) return <PacientePage />
  if (faseAtual === 8) return <RelatorioPage />
  if (faseAtual === 9) return <DecisaoDiagnosticaPage />

  if (tipoConsulta === 'primeira-consulta') {
    if (faseAtual === 0) return <Fase1Page />
    if (faseAtual === 1) return <Fase2Page />
    if (faseAtual === 2) return <Fase3Page />
    if (faseAtual === 3) return <Fase4Page />
    if (faseAtual === 4) return <Fase5Page />
    if (faseAtual === 5) return <Fase6Page />
    if (faseAtual === 6) return <Fase7Page />
    if (faseAtual === 7) return <Fase8Page />
  }

  if (tipoConsulta === 'seguimento') {
    if (faseAtual === 3) return <Fase4Page />
    if (faseAtual === 4) return <Fase5Page />
    if (faseAtual === 5) return <Fase6Page />
    if (faseAtual === 6) return <Fase7Page />
    if (faseAtual === 7) return <Fase8Page />
  }

  return <PacientePage />
}