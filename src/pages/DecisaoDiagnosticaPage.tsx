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
      faseTitulo={'Decis\u00e3o diagn\u00f3stica'}
      badge={'Decis\u00e3o do m\u00e9dico'}
      resumo={[
        { key: 'Crit\u00e9rios +', val: resultadoFase3 ? `${resultadoFase3.criteriosPositivos}/3` : '\u2014' },
      ]}
    >
      <div style={{ padding: 24 }}>
        <p style={{ fontSize: 13, color: '#aaa', marginBottom: 24, lineHeight: 1.7 }}>
          {'Com base nos sintomas registados, na hist\u00f3ria cl\u00ednica e nos resultados das provas funcionais, o m\u00e9dico deve agora tomar a decis\u00e3o diagn\u00f3stica. A ferramenta n\u00e3o emite esta conclus\u00e3o automaticamente \u2014 \u00e9 da exclusiva responsabilidade cl\u00ednica do m\u00e9dico.'}
        </p>

        {paciente.jaEmICS && (
          <div style={{ background: '#FAEEDA20', border: '1px solid #FAC77550', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
            <p style={{ color: '#FAC775', fontSize: 13, fontWeight: 500, margin: '0 0 6px' }}>{'\u26a0 Contexto cl\u00ednico \u2014 doente j\u00e1 em ICS'}</p>
            <p style={{ color: '#FAC775', fontSize: 12, margin: '0 0 6px' }}>
              {'Este doente j\u00e1 estava em tratamento com ICS antes da confirma\u00e7\u00e3o diagn\u00f3stica formal. A GINA recomenda que:'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: '#BA7517' }}>
              <span>{'\u2022 A normalidade das provas funcionais n\u00e3o exclui o diagn\u00f3stico de asma'}</span>
              <span>{'\u2022 Sintomas t\u00edpicos com variabilidade + resposta ao ICS suportam o diagn\u00f3stico'}</span>
              <span>{'\u2022 Se as provas s\u00e3o negativas, considerar repetir ap\u00f3s suspens\u00e3o do ICS'}</span>
              <span>{'\u2022 Em caso de d\u00favida, referenciar para especialidade'}</span>
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
                { label: 'Limita\u00e7\u00e3o ao fluxo expirat\u00f3rio (FEV1/FVC)', positivo: resultadoFase3.obstrutivo },
                { label: 'Reversibilidade broncodilatadora', positivo: resultadoFase3.reversibilidade },
                { label: 'Variabilidade di\u00e1ria do PEF', positivo: resultadoFase3.pefPositivo },
              ].map(c => (
                <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: '#888' }}>{c.label}</span>
                  <span
                    style={{
                      padding: '2px 10px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 500,
                      background: c.positivo ? '#0F6E5620' : '#33333a',
                      color: c.positivo ? '#5DCAA5' : '#666',
                    }}
                  >
                    {c.positivo ? 'Positivo' : 'Negativo'}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #333', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#aaa', fontWeight: 500 }}>{'Crit\u00e9rios objetivos positivos'}</span>
                <span style={{ color: '#5DCAA5', fontWeight: 500 }}>{resultadoFase3.criteriosPositivos} de 3</span>
              </div>
            </div>
          </div>
        )}

        <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
          {'Com base em toda a informa\u00e7\u00e3o recolhida, confirma o diagn\u00f3stico de asma?'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            onClick={confirmar}
            style={{ padding: '16px', borderRadius: 8, border: '1px solid #5DCAA5', background: '#0F6E56', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            {'\u2713 Sim \u2014 diagn\u00f3stico confirmado'}
          </button>
          <button
            onClick={naoConfirmar}
            style={{ padding: '16px', borderRadius: 8, border: '1px solid #444', background: '#111', color: '#888', fontSize: 14, cursor: 'pointer' }}
          >
            {'\u2717 N\u00e3o \u2014 diagn\u00f3stico n\u00e3o confirmado'}
          </button>
        </div>

        <p style={{ fontSize: 11, color: '#444', marginTop: 16, textAlign: 'center' }}>
          {'Se n\u00e3o confirmado, \u00e9 gerado um relat\u00f3rio de exclus\u00e3o com os diagn\u00f3sticos diferenciais considerados.'}
        </p>
      </div>
    </Layout>
  )
}
