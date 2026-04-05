import { useAsmaStore } from '../store/useAsmaStore'
import { gerarRelatorioSOAP } from '../domain/relatorio'

export default function RelatorioPage() {
  const store = useAsmaStore()

  const relatorio = gerarRelatorioSOAP({
    paciente: store.paciente,
    fase1: store.fase1,
    fase3: store.fase3,
    fase4: store.fase4,
    fase5: store.fase5,
    fase6: store.fase6,
    fase8: store.fase8,
  })

  function copiar() {
    navigator.clipboard.writeText(relatorio)
    alert('Relatório copiado para a área de transferência.')
  }

  function novaConsulta() {
    store.resetarSessao()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111', padding: '1.5rem' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ background: '#0F6E56', borderRadius: 8, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#9FE1CB', fontSize: 13, fontWeight: 500 }}>AsthmaGuide</span>
        </div>

        {(store.fase5.intubacaoOuUciPrevia || store.fase5.agudizacaoGraveUltimoAno || store.fase1.silencioRespiratorio) && (
          <div style={{ background: '#E24B4A15', border: '1px solid #E24B4A50', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ color: '#F09595', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{'\u26a0 Alertas clínicos'}</p>
            {store.fase1.silencioRespiratorio && (
              <p style={{ color: '#F09595', fontSize: 12, margin: '2px 0' }}>{'\u2022 Silêncio respiratório — sinal de obstrução grave'}</p>
            )}
            {store.fase5.intubacaoOuUciPrevia && (
              <p style={{ color: '#F09595', fontSize: 12, margin: '2px 0' }}>{'\u2022 Internamento prévio em UCI por asma'}</p>
            )}
            {store.fase5.agudizacaoGraveUltimoAno && (
              <p style={{ color: '#F09595', fontSize: 12, margin: '2px 0' }}>{'\u2022 Agudização grave no último ano'}</p>
            )}
          </div>
        )}

        <div style={{ background: '#1e1e1e', borderRadius: 12, border: '1px solid #333', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>Registo clínico — Modelo SOAP</span>
          </div>
          <pre
            style={{
              padding: 20,
              fontSize: 12,
              color: '#ccc',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              margin: 0,
              maxHeight: '60vh',
              overflowY: 'auto',
            }}
          >
            {relatorio}
          </pre>
        </div>

        <div style={{ background: '#0F6E5615', border: '1px solid #1D9E7530', borderRadius: 8, padding: '10px 16px', marginBottom: 16 }}>
          <p style={{ color: '#5DCAA5', fontSize: 12, margin: 0 }}>
            {'Este relatório é de apoio à decisão clínica. A responsabilidade diagnóstica e terapêutica é do médico assistente. Os dados são eliminados ao fechar o browser.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={copiar}
            style={{ flex: 1, background: '#0F6E56', color: 'white', border: 'none', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            Copiar relatório para área de transferência
          </button>
          <button
            onClick={novaConsulta}
            style={{ padding: '12px 20px', background: 'transparent', color: '#888', border: '1px solid #444', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}
          >
            Nova consulta
          </button>
        </div>
      </div>
    </div>
  )
}
