import { useAsmaStore } from '../store/useAsmaStore'
import Layout from '../components/Layout'
import NavFooter from '../components/NavFooter'

// Box 1-3 GINA 2022 — DD por faixa etária com sinais clínicos
const diferencialsPorFaixa = {
  crianca: [
    {
      grupo: 'Vias aéreas superiores',
      items: [
        { dd: 'Síndrome de tosse das vias aéreas superiores (rinite)', sinais: 'Espirros, comichão, nariz obstruído, pigarro' },
        { dd: 'Corpo estranho inalado', sinais: 'Início súbito de sintomas, sibilância unilateral' },
        { dd: 'Traqueomalácia', sinais: 'Sibilância desde o nascimento, agravada com esforço' },
      ],
    },
    {
      grupo: 'Vias aéreas inferiores',
      items: [
        { dd: 'Bronquiectasias', sinais: 'Infeções recorrentes, tosse produtiva' },
        { dd: 'Discinesia ciliar primária', sinais: 'Infeções recorrentes, tosse produtiva, sinusite' },
        { dd: 'Fibrose quística', sinais: 'Tosse e produção excessiva de muco, sintomas gastrointestinais' },
        { dd: 'Displasia broncopulmonar', sinais: 'Pré-termo, sintomas desde o nascimento' },
        { dd: 'Imunodeficiência congénita', sinais: 'Infeções recorrentes, tosse produtiva' },
      ],
    },
    {
      grupo: 'Cardiovascular',
      items: [
        { dd: 'Cardiopatia congénita', sinais: 'Sopros cardíacos' },
      ],
    },
  ],
  jovem: [
    {
      grupo: 'Vias aéreas superiores',
      items: [
        { dd: 'Síndrome de tosse das vias aéreas superiores (rinite)', sinais: 'Espirros, comichão, nariz obstruído, pigarro' },
        { dd: 'Obstrução laríngea induzível', sinais: 'Dispneia, sibilância inspiratória (estridor)' },
        { dd: 'Disfunção de cordas vocais', sinais: 'Sibilância inspiratória, episódica' },
      ],
    },
    {
      grupo: 'Vias aéreas inferiores',
      items: [
        { dd: 'Bronquiectasias', sinais: 'Tosse produtiva, infeções recorrentes' },
        { dd: 'Fibrose quística', sinais: 'Tosse e produção excessiva de muco' },
        { dd: 'Corpo estranho inalado', sinais: 'Início súbito de sintomas' },
        { dd: 'Hiper-reatividade brônquica pós-infeciosa', sinais: 'Sibilância após infeção respiratória' },
      ],
    },
    {
      grupo: 'Outros',
      items: [
        { dd: 'Hiperventilação / respiração disfuncional', sinais: 'Tonturas, parestesias, suspiros' },
        { dd: 'Défice de alfa-1 antitripsina', sinais: 'Dispneia, história familiar de enfisema precoce' },
        { dd: 'Cardiopatia', sinais: 'Sopros cardíacos' },
        { dd: 'Refluxo gastroesofágico', sinais: 'Tosse associada a refluxo, pirose' },
        { dd: 'Tosse por IECA', sinais: 'Tosse seca após início de IECA' },
      ],
    },
  ],
  adulto: [
    {
      grupo: 'Vias aéreas superiores',
      items: [
        { dd: 'Obstrução laríngea induzível', sinais: 'Dispneia, sibilância inspiratória (estridor)' },
        { dd: 'Síndrome de tosse das vias aéreas superiores (rinite)', sinais: 'Espirros, comichão, nariz obstruído, pigarro' },
        { dd: 'Sinusite crónica', sinais: 'Obstrução nasal, dor facial, tosse' },
      ],
    },
    {
      grupo: 'Vias aéreas inferiores',
      items: [
        { dd: 'DPOC — Doença pulmonar obstrutiva crónica', sinais: 'Tosse, expectoração, dispneia de esforço, tabagismo ou exposição' },
        { dd: 'Bronquiectasias', sinais: 'Tosse produtiva, infeções recorrentes' },
        { dd: 'Hiper-reatividade brônquica pós-infeciosa', sinais: 'Sibilância após infeção respiratória' },
        { dd: 'Obstrução central das vias aéreas', sinais: 'Dispneia sem resposta a broncodilatadores' },
        { dd: 'Tumor brônquico', sinais: 'Tosse, hemoptises, perda de peso' },
        { dd: 'Eosinofilia pulmonar', sinais: 'Infiltrados pulmonares, eosinofilia' },
        { dd: 'Pneumonite de hipersensibilidade', sinais: 'Exposição ocupacional ou ambiental' },
      ],
    },
    {
      grupo: 'Cardiovascular',
      items: [
        { dd: 'Insuficiência cardíaca congestiva', sinais: 'Dispneia de esforço, sintomas noturnos, edema dos tornozelos' },
        { dd: 'Tromboembolia pulmonar', sinais: 'Início súbito de dispneia, dor torácica' },
        { dd: 'Doença pulmonar parenquimatosa', sinais: 'Dispneia de esforço, tosse não produtiva, baqueteamento' },
      ],
    },
    {
      grupo: 'Outros',
      items: [
        { dd: 'Hiperventilação / respiração disfuncional', sinais: 'Tonturas, parestesias, suspiros' },
        { dd: 'Tosse por IECA', sinais: 'Tosse seca após início de IECA' },
        { dd: 'Refluxo gastroesofágico', sinais: 'Tosse associada a refluxo, pirose' },
        { dd: 'Apneia obstrutiva do sono', sinais: 'Roncopatia, sonolência diurna' },
        { dd: 'Obesidade', sinais: 'Dispneia de esforço, IMC elevado' },
      ],
    },
  ],
  todos: [
    {
      grupo: 'Todas as idades',
      items: [
        { dd: 'Tuberculose', sinais: 'Tosse crónica, hemoptises, febre, sudorese noturna, perda de peso' },
        { dd: 'Tosse convulsa (Pertussis)', sinais: 'Tosse paroxística prolongada, por vezes com estridor' },
        { dd: 'Aspergilose broncopulmonar alérgica', sinais: 'Asma difícil de controlar, infiltrados pulmonares' },
      ],
    },
  ],
}

function calcularFaixa(dataNascimento: string): 'crianca' | 'jovem' | 'adulto' {
  if (!dataNascimento) return 'adulto'
  const idade = Math.floor((Date.now() - new Date(dataNascimento).getTime()) / 31557600000)
  if (idade <= 11) return 'crianca'
  if (idade <= 39) return 'jovem'
  return 'adulto'
}

export default function Fase2Page() {
  const { paciente, fase1, fase2, setFase2, navegarPara } = useAsmaStore()

  const faixa = calcularFaixa(paciente.dataNascimento)
  const gruposFaixa = diferencialsPorFaixa[faixa]
  const gruposTodos = diferencialsPorFaixa.todos
  const todosOsGrupos = [...gruposFaixa, ...gruposTodos]
  const todosOsItems = todosOsGrupos.flatMap(g => g.items)
  const todosOsDDs = todosOsItems.map(i => i.dd)

  const faixaLabel = { crianca: 'Crianças (6–11 anos)', jovem: 'Jovens adultos (12–39 anos)', adulto: 'Adultos (≥ 40 anos)' }[faixa]

  function toggle(d: string) {
    const atual = fase2.diferenciaisExcluidos
    if (atual.includes(d)) {
      setFase2({ diferenciaisExcluidos: atual.filter(x => x !== d) })
    } else {
      setFase2({ diferenciaisExcluidos: [...atual, d] })
    }
  }

  const todosSelecionados = fase2.diferenciaisExcluidos.length === todosOsDDs.length
  const nenhumSelecionado = fase2.diferenciaisExcluidos.length === 0

  // Sugestões baseadas na Fase 1
  const sugeridos: string[] = []
  if (fase1.tosseIsolada) sugeridos.push('Refluxo gastroesofágico', 'Tosse por IECA', 'Síndrome de tosse das vias aéreas superiores (rinite)', 'Sinusite crónica')
  if (fase1.tosseProdutivaCronica) {
    sugeridos.push('Bronquiectasias', 'Fibrose quística')
    if (faixa === 'adulto') sugeridos.push('DPOC — Doença pulmonar obstrutiva crónica')
  }
  if (fase1.dispneiaTonturasParestesias) sugeridos.push('Hiperventilação / respiração disfuncional', 'Obstrução laríngea induzível')
  if (fase1.dorToracica) sugeridos.push('Insuficiência cardíaca congestiva', 'Tromboembolia pulmonar')
  if (fase1.dispneiaPorExercicioComInspiracao) sugeridos.push('Obstrução laríngea induzível', 'Disfunção de cordas vocais', 'Traqueomalácia')

  // Filtra sugeridos que existem na lista da faixa etária
  const sugeridosUnicos = [...new Set(sugeridos)].filter(s => todosOsDDs.includes(s))

  return (
    <Layout
      faseNumero={2}
      faseTitulo="Diagnósticos diferenciais"
      badge="Apresentação ao médico"
      resumo={[
        { key: 'Faixa etária', val: faixaLabel },
        { key: 'DD excluídos', val: `${fase2.diferenciaisExcluidos.length} / ${todosOsDDs.length}` },
        { key: 'Sugeridos', val: sugeridosUnicos.length > 0 ? `${sugeridosUnicos.length} a considerar` : '—' },
      ]}
    >
      <div style={{ padding: 20, minHeight: 320 }}>

        <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
          Diagnósticos diferenciais filtrados para <strong style={{ color: '#ccc' }}>{faixaLabel}</strong> segundo a GINA 2022 (Box 1-3). Assinala os que foram avaliados e excluídos clinicamente. A ferramenta não exclui nenhum automaticamente.
        </p>

        {/* Botões selecionar/limpar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFase2({ diferenciaisExcluidos: todosOsDDs })}
            disabled={todosSelecionados}
            style={{
              padding: '8px 12px', borderRadius: 6, fontSize: 12, cursor: todosSelecionados ? 'default' : 'pointer',
              border: todosSelecionados ? '1px solid #333' : '1px solid #1D9E75',
              background: todosSelecionados ? '#181818' : '#0F6E5620',
              color: todosSelecionados ? '#666' : '#5DCAA5',
            }}
          >
            Selecionar todos
          </button>
          <button
            onClick={() => setFase2({ diferenciaisExcluidos: [] })}
            disabled={nenhumSelecionado}
            style={{
              padding: '8px 12px', borderRadius: 6, fontSize: 12, cursor: nenhumSelecionado ? 'default' : 'pointer',
              border: nenhumSelecionado ? '1px solid #333' : '1px solid #444',
              background: '#181818',
              color: nenhumSelecionado ? '#666' : '#ccc',
            }}
          >
            Limpar seleção
          </button>
        </div>

        {/* Sugestões baseadas na Fase 1 */}
        {sugeridosUnicos.length > 0 && (
          <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              A considerar com base no perfil da fase 1
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sugeridosUnicos.map(d => {
                const checked = fase2.diferenciaisExcluidos.includes(d)
                const itemInfo = todosOsItems.find(i => i.dd === d)
                return (
                  <div
                    key={d}
                    onClick={() => toggle(d)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px',
                      borderRadius: 6, cursor: 'pointer',
                      border: checked ? '1px solid #5DCAA5' : '1px solid #444',
                      background: checked ? '#0F6E5620' : '#111',
                    }}
                  >
                    <div style={{
                      width: 14, height: 14, borderRadius: 3, marginTop: 2,
                      border: `1px solid ${checked ? '#1D9E75' : '#555'}`,
                      background: checked ? '#1D9E75' : 'transparent',
                      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {checked && <span style={{ color: 'white', fontSize: 10 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: checked ? '#5DCAA5' : '#ccc', margin: '0 0 2px' }}>{d}</p>
                      {itemInfo && <p style={{ fontSize: 11, color: '#555', margin: 0 }}>{itemInfo.sinais}</p>}
                    </div>
                    <span style={{ fontSize: 10, color: '#555', background: '#222', padding: '2px 6px', borderRadius: 4, flexShrink: 0, marginTop: 2 }}>
                      sugerido
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* DD por grupo */}
        {todosOsGrupos.map(grupo => (
          <div key={grupo.grupo} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              {grupo.grupo}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {grupo.items.map(item => {
                const checked = fase2.diferenciaisExcluidos.includes(item.dd)
                return (
                  <div
                    key={item.dd}
                    onClick={() => toggle(item.dd)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px',
                      borderRadius: 6, cursor: 'pointer',
                      border: checked ? '1px solid #5DCAA5' : '1px solid #333',
                      background: checked ? '#0F6E5620' : 'transparent',
                    }}
                  >
                    <div style={{
                      width: 14, height: 14, borderRadius: 3, marginTop: 2,
                      border: `1px solid ${checked ? '#1D9E75' : '#555'}`,
                      background: checked ? '#1D9E75' : 'transparent',
                      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {checked && <span style={{ color: 'white', fontSize: 10 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: checked ? '#5DCAA5' : '#ccc', margin: '0 0 2px' }}>{item.dd}</p>
                      <p style={{ fontSize: 11, color: '#555', margin: 0 }}>{item.sinais}</p>
                    </div>
                  </div>
                )
              })}
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