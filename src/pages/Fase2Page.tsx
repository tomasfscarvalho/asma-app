import { useAsmaStore } from '../store/useAsmaStore'
import Layout from '../components/Layout'
import NavFooter from '../components/NavFooter'
import CheckItem from '../components/CheckItem'

const diferenciais = [
  {
    grupo: 'Vias aéreas superiores',
    items: [
      'Rinite alérgica',
      'Sinusite crónica',
      'Disfunção de cordas vocais',
      'Traqueomalácia',
      'Malformações das vias aéreas superiores',
      'Aspiração de corpo estranho',
      'Aspiração recorrente',
    ],
  },
  {
    grupo: 'Vias aéreas inferiores',
    items: [
      'Doença pulmonar obstrutiva crónica (DPOC)',
      'Bronquiectasias',
      'Hiper-reatividade brônquica pós-infeciosa',
      'Fibrose quística',
      'Discinesia ciliar primária',
      'Tumor brônquico',
    ],
  },
  {
    grupo: 'Cardiovascular e sistémico',
    items: [
      'Insuficiência cardíaca congestiva',
      'Tromboembolia pulmonar',
      'Eosinofilia pulmonar',
      'Pneumonite de hipersensibilidade',
      'Amiloidose brônquica',
      'Aspergilose broncopulmonar alérgica',
    ],
  },
  {
    grupo: 'Outros',
    items: [
      'Refluxo gastroesofágico',
      'Apneia obstrutiva do sono',
      'Hiperventilação / padrão respiratório disfuncional',
      'Tosse por IECA',
      'Obesidade',
      'Tuberculose',
    ],
  },
]

const todosOsDiferenciais = diferenciais.flatMap((g) => g.items)

export default function Fase2Page() {
  const { paciente, fase1, fase2, setFase2, navegarPara } = useAsmaStore()

  function toggle(d: string) {
    const atual = fase2.diferenciaisExcluidos
    if (atual.includes(d)) {
      setFase2({ diferenciaisExcluidos: atual.filter((x) => x !== d) })
    } else {
      setFase2({ diferenciaisExcluidos: [...atual, d] })
    }
  }

  const idade = paciente.dataNascimento
    ? Math.floor((Date.now() - new Date(paciente.dataNascimento).getTime()) / 31557600000)
    : null

  const sugeridos: string[] = []
  if (fase1.tosseIsolada) sugeridos.push('Refluxo gastroesofágico', 'Tosse por IECA', 'Sinusite crónica')
  if (fase1.tosseProdutivaCronica) {
    sugeridos.push('Bronquiectasias', 'Fibrose quística')
    if (idade === null || idade >= 40) sugeridos.push('Doença pulmonar obstrutiva crónica (DPOC)')
  }
  if (fase1.dispneiaTonturasParestesias) sugeridos.push('Hiperventilação / padrão respiratório disfuncional')
  if (fase1.dorToracica) sugeridos.push('Insuficiência cardíaca congestiva', 'Tromboembolia pulmonar')
  if (fase1.dispneiaPorExercicioComInspiracao) sugeridos.push('Disfunção de cordas vocais', 'Traqueomalácia')

  const sugeridosUnicos = [...new Set(sugeridos)]
  const todosSelecionados = fase2.diferenciaisExcluidos.length === todosOsDiferenciais.length
  const nenhumSelecionado = fase2.diferenciaisExcluidos.length === 0

  return (
    <Layout
      faseNumero={2}
      faseTitulo="Diagnósticos diferenciais"
      badge="Apresentação ao médico"
      resumo={[
        { key: 'DD excluídos', val: `${fase2.diferenciaisExcluidos.length} / ${todosOsDiferenciais.length}` },
        { key: 'DD sugeridos', val: sugeridosUnicos.length > 0 ? `${sugeridosUnicos.length} a considerar` : '—' },
      ]}
    >
      <div style={{ padding: 20, minHeight: 320 }}>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
          Nesta fase, o objetivo é excluir diagnósticos diferenciais que possam explicar os sintomas em vez de asma. Assinale apenas os diagnósticos que já foram avaliados e excluídos clinicamente. A ferramenta não exclui nenhum diagnóstico de forma automática.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFase2({ diferenciaisExcluidos: todosOsDiferenciais })}
            disabled={todosSelecionados}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: todosSelecionados ? '1px solid #333' : '1px solid #1D9E75',
              background: todosSelecionados ? '#181818' : '#0F6E5620',
              color: todosSelecionados ? '#666' : '#5DCAA5',
              cursor: todosSelecionados ? 'default' : 'pointer',
              fontSize: 12,
            }}
          >
            Selecionar todos
          </button>
          <button
            type="button"
            onClick={() => setFase2({ diferenciaisExcluidos: [] })}
            disabled={nenhumSelecionado}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: nenhumSelecionado ? '1px solid #333' : '1px solid #444',
              background: '#181818',
              color: nenhumSelecionado ? '#666' : '#ccc',
              cursor: nenhumSelecionado ? 'default' : 'pointer',
              fontSize: 12,
            }}
          >
            Limpar seleção
          </button>
        </div>

        {sugeridosUnicos.length > 0 && (
          <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              A considerar com base no perfil da fase 1
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sugeridosUnicos.map((d) => (
                <div
                  key={d}
                  onClick={() => toggle(d)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    border: fase2.diferenciaisExcluidos.includes(d) ? '1px solid #5DCAA5' : '1px solid #444',
                    background: fase2.diferenciaisExcluidos.includes(d) ? '#0F6E5620' : '#111',
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      border: `1px solid ${fase2.diferenciaisExcluidos.includes(d) ? '#1D9E75' : '#555'}`,
                      background: fase2.diferenciaisExcluidos.includes(d) ? '#1D9E75' : 'transparent',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {fase2.diferenciaisExcluidos.includes(d) && <span style={{ color: 'white', fontSize: 10 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 13, color: fase2.diferenciaisExcluidos.includes(d) ? '#5DCAA5' : '#ccc' }}>{d}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: '#555', background: '#222', padding: '2px 6px', borderRadius: 4 }}>
                    sugerido
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {diferenciais.map((grupo) => (
          <div key={grupo.grupo} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              {grupo.grupo}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {grupo.items.map((d) => (
                <CheckItem
                  key={d}
                  label={d}
                  checked={fase2.diferenciaisExcluidos.includes(d)}
                  onChange={() => toggle(d)}
                />
              ))}
            </div>
          </div>
        ))}

        {fase2.diferenciaisExcluidos.length > 0 && (
          <div style={{ background: '#0F6E5615', border: '1px solid #1D9E7530', borderRadius: 6, padding: '10px 12px' }}>
            <p style={{ color: '#5DCAA5', fontSize: 12, margin: 0 }}>
              {fase2.diferenciaisExcluidos.length} diagnóstico(s) diferencial(ais) considerado(s) e excluído(s) pelo médico.
            </p>
          </div>
        )}
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
