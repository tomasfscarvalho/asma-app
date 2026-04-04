import { useAsmaStore } from '../store/useAsmaStore'
import { calcularFase6 } from '../domain/fase6-terapeutica'
import type { Fase5Dados, ResultadoFase6 } from '../domain/types'
import Layout from '../components/Layout'
import NavFooter from '../components/NavFooter'
import ResultBox from '../components/ResultBox'

const medidas: Array<{ label: string; condicao: (fase5: Fase5Dados) => boolean }> = [
  { label: 'Cessação tabágica', condicao: (fase5) => fase5.fumoTabaco },
  { label: 'Promoção de atividade física e dieta equilibrada', condicao: (fase5) => fase5.obesidade },
  { label: 'Evitar exposição ocupacional', condicao: () => true },
  { label: 'Evitar AINE se agravamento associado', condicao: () => true },
]

export default function Fase6Page() {
  const { fase4, fase5, fase6, setFase6, setResultadoFase6, navegarPara } = useAsmaStore()
  const resultado = calcularFase6(fase4, fase6)

  const ajusteTextoPorTipo: Record<NonNullable<ResultadoFase6['ajuste']>, string> = {
    subir: 'Subir degrau terapêutico',
    manter: 'Manter terapêutica atual',
    descer: 'Considerar descer degrau (controlo >= 3 meses)',
  }

  const ajusteTexto = resultado.ajuste === null ? '-' : ajusteTextoPorTipo[resultado.ajuste]
  const ajusteResumo =
    resultado.ajuste === 'subir'
      ? 'Subir'
      : resultado.ajuste === 'descer'
        ? 'Descer'
        : resultado.ajuste === 'manter'
          ? 'Manter'
          : '-'
  const medidasVisiveis = medidas.filter(({ condicao }) => condicao(fase5))

  function handleProximo() {
    setResultadoFase6(resultado)
    navegarPara(6)
  }

  return (
    <Layout
      faseNumero={6}
      faseTitulo="Recomendação terapêutica"
      badge="Decisão automática"
      resumo={[
        { key: 'Degrau', val: `Degrau ${resultado.degrau}` },
        { key: 'Percurso', val: `Percurso ${resultado.percurso}` },
        { key: 'Ajuste', val: ajusteResumo },
      ]}
    >
      <div style={{ padding: 20, minHeight: 280 }}>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>
          Seleciona o percurso terapêutico. O Percurso 1 é o preferencial segundo a GINA 2022.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[1, 2].map((percurso) => (
            <div
              key={percurso}
              onClick={() => setFase6({ percursoSelecionado: percurso as 1 | 2 })}
              style={{
                padding: '14px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                border: fase6.percursoSelecionado === percurso ? '1px solid #5DCAA5' : '1px solid #333',
                background: fase6.percursoSelecionado === percurso ? '#0F6E5620' : '#111',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: fase6.percursoSelecionado === percurso ? '#5DCAA5' : '#ccc' }}>
                  Percurso {percurso}
                </span>
                {percurso === 1 && (
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#0F6E5630', color: '#5DCAA5' }}>
                    Preferencial
                  </span>
                )}
              </div>
              <p style={{ fontSize: 11, color: '#666', margin: 0 }}>
                {percurso === 1
                  ? 'ICS-formoterol como alívio em todos os degraus'
                  : 'ICS + SABA como terapêutica de alívio'}
              </p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Recomendação automática
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          <ResultBox label="Degrau terapêutico sugerido" valor={`Degrau ${resultado.degrau}`} tipo="ok" />
          <ResultBox
            label="Ajuste sugerido"
            valor={ajusteTexto}
            tipo={resultado.ajuste === 'subir' ? 'alerta' : resultado.ajuste === 'descer' ? 'ok' : 'neutro'}
          />
          {resultado.criterioReferenciacao && (
            <ResultBox
              label="Critério de referenciação"
              valor="Ausência de controlo com degrau >= 3; considerar referenciação"
              tipo="alerta"
            />
          )}
        </div>

        <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Medidas não farmacológicas
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {medidasVisiveis.map((medida) => (
            <div key={medida.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#888' }}>
              <span style={{ color: '#1D9E75' }}>•</span>
              <span>{medida.label}</span>
            </div>
          ))}
        </div>
      </div>

      <NavFooter
        stepAtual={0}
        totalSteps={1}
        onAnterior={() => navegarPara(4)}
        onProximo={handleProximo}
        labelProximo="Fase 7 ->"
      />
    </Layout>
  )
}
