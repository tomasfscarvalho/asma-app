import { useAsmaStore } from '../store/useAsmaStore'
import Layout from '../components/Layout'

export default function DecisaoDiagnosticaPage() {
  const { setDecisaoDiagnostica, navegarPara, resultadoFase3, paciente } = useAsmaStore()

  function confirmar() {
    setDecisaoDiagnostica('confirmado')
    navegarPara(3)
  }

  function naoConfirmar() {
    setDecisaoDiagnostica('nao-confirmado')
    navegarPara(8)
  }

  return (
    <Layout
      faseNumero={3}
      faseTitulo="Decisão diagnóstica"
      badge="Decisão do médico"
      resumo={[
        { key: 'Critérios +', val: resultadoFase3 ? `${resultadoFase3.criteriosPositivos}/3` : '—' },
      ]}
    >
      <div style={{ padding: 24 }}>
        <p style={{ fontSize: 13, color: '#aaa', marginBottom: 24, lineHeight: 1.7 }}>
          Com base nos sintomas registados, na história clínica e nos resultados das provas funcionais, o médico deve agora tomar a decisão diagnóstica. A ferramenta não emite esta conclusão automaticamente — é da exclusiva responsabilidade clínica do médico.
        </p>

        {paciente.jaEmICS && (
          <div style={{ background: '#FAEEDA20', border: '1px solid #FAC77550', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
            <p style={{ color: '#FAC775', fontSize: 13, fontWeight: 500, margin: '0 0 6px' }}>⚠ Contexto clÃ­nico â€” doente jÃ¡ em ICS</p>
            <p style={{ color: '#FAC775', fontSize: 12, margin: '0 0 6px' }}>
              Este doente jÃ¡ estava em tratamento com ICS antes da confirmaÃ§Ã£o diagnÃ³stica formal. A GINA recomenda que:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: '#BA7517' }}>
              <span>• A normalidade das provas funcionais nÃ£o exclui o diagnÃ³stico de asma</span>
              <span>• Sintomas tÃ­picos com variabilidade + resposta ao ICS suportam o diagnÃ³stico</span>
              <span>• Se as provas sÃ£o negativas, considerar repetir apÃ³s suspensÃ£o do ICS</span>
              <span>• Em caso de dÃºvida, referenciar para especialidade</span>
            </div>
          </div>
        )}

        {resultadoFase3 && (
          <div style={{ background: '#1a1a1a', borderRadius: 8, padding: 16, marginBottom: 24, border: '1px solid #333' }}>
            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Resumo das provas funcionais
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Limitação ao fluxo expiratório (FEV1/FVC)', positivo: resultadoFase3.obstrutivo },
                { label: 'Reversibilidade broncodilatadora', positivo: resultadoFase3.reversibilidade },
                { label: 'Variabilidade diária do PEF', positivo: resultadoFase3.pefPositivo },
              ].map(c => (
                <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: '#888' }}>{c.label}</span>
                  <span style={{
                    padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 500,
                    background: c.positivo ? '#0F6E5620' : '#33333a',
                    color: c.positivo ? '#5DCAA5' : '#666',
                  }}>
                    {c.positivo ? 'Positivo' : 'Negativo'}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #333', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#aaa', fontWeight: 500 }}>Critérios objetivos positivos</span>
                <span style={{ color: '#5DCAA5', fontWeight: 500 }}>{resultadoFase3.criteriosPositivos} de 3</span>
              </div>
            </div>
          </div>
        )}

        <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
          Com base em toda a informação recolhida, confirma o diagnóstico de asma?
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            onClick={confirmar}
            style={{ padding: '16px', borderRadius: 8, border: '1px solid #5DCAA5', background: '#0F6E56', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            ✓ Sim — diagnóstico confirmado
          </button>
          <button
            onClick={naoConfirmar}
            style={{ padding: '16px', borderRadius: 8, border: '1px solid #444', background: '#111', color: '#888', fontSize: 14, cursor: 'pointer' }}
          >
            ✗ Não — diagnóstico não confirmado
          </button>
        </div>

        <p style={{ fontSize: 11, color: '#444', marginTop: 16, textAlign: 'center' }}>
          Se não confirmado, é gerado um relatório de exclusão com os diagnósticos diferenciais considerados.
        </p>
      </div>
    </Layout>
  )
}
