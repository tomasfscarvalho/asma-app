import { useAsmaStore } from './store/useAsmaStore'
import PacientePage from './pages/PacientePage'
import Fase1Page from './pages/Fase1Page'
import Fase2Page from './pages/Fase2Page'
import Fase3Page from './pages/Fase3Page'
import Fase4Page from './pages/Fase4Page'
import Fase5Page from './pages/Fase5Page'
import Fase6Page from './pages/Fase6Page'
import Fase7Page from './pages/Fase7Page'
import Fase8Page from './pages/Fase8Page'
import RelatorioPage from './pages/RelatorioPage'

const paginas = [
  Fase1Page, Fase2Page, Fase3Page, Fase4Page,
  Fase5Page, Fase6Page, Fase7Page, Fase8Page,
]

export default function App() {
  const { faseAtual } = useAsmaStore()

  // Ecrã inicial — dados do paciente
  if (faseAtual === -1) return <PacientePage />

  // Relatório final
  if (faseAtual === 8) return <RelatorioPage />

  // Fases 1 a 8
  const PaginaAtual = paginas[faseAtual]
  return <PaginaAtual />
}