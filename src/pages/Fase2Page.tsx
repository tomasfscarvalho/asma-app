import { useAsmaStore } from '../store/useAsmaStore'
import Layout from '../components/Layout'
import NavFooter from '../components/NavFooter'
import CheckItem from '../components/CheckItem'

const diferenciais = [
  'Rinite alérgica', 'Disfunção de cordas vocais', 'DPOC',
  'Insuficiência cardíaca congestiva', 'Bronquiectasias',
  'Refluxo gastroesofágico', 'Sinusite crónica', 'Tromboembolia pulmonar',
  'Fibrose quística', 'Discinesia ciliar primária', 'Aspiração de corpo estranho',
  'Tumor brônquico', 'Traqueomalácia', 'Hiper-reatividade brônquica pós-infeciosa',
  'Eosinofilia pulmonar', 'Pneumonite de hipersensibilidade',
  'Apneia obstrutiva do sono', 'Tosse por IECA', 'Obesidade', 'Tuberculose',
]

export default function Fase2Page() {
  const { fase2, setFase2, navegarPara } = useAsmaStore()

  function toggle(d: string) {
    const atual = fase2.diferenciaisExcluidos
    if (atual.includes(d)) {
      setFase2({ diferenciaisExcluidos: atual.filter(x => x !== d) })
    } else {
      setFase2({ diferenciaisExcluidos: [...atual, d] })
    }
  }

  return (
    <Layout
      faseNumero={2}
      faseTitulo="Diagnósticos diferenciais"
      badge="Apresentação ao médico"
      resumo={[{ key: 'DD excluídos', val: `${fase2.diferenciaisExcluidos.length} / ${diferenciais.length}` }]}
    >
      <div style={{ padding: 20, minHeight: 280 }}>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
          Assinale os diagnósticos diferenciais que foram considerados e excluídos clinicamente. A decisão é do médico — a ferramenta não exclui nenhum automaticamente.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {diferenciais.map(d => (
            <CheckItem
              key={d}
              label={d}
              checked={fase2.diferenciaisExcluidos.includes(d)}
              onChange={() => toggle(d)}
            />
          ))}
        </div>
      </div>

      <NavFooter
        stepAtual={0}
        totalSteps={1}
        onAnterior={() => navegarPara(0)}
        onProximo={() => navegarPara(2)}
        labelProximo="Fase 3 →"
      />
    </Layout>
  )
}