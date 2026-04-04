import { useAsmaStore } from '../store/useAsmaStore'
import type { TipoConsulta } from '../domain/types'

export default function PacientePage() {
  const { paciente, setPaciente, tipoConsulta, setTipoConsulta, navegarPara } = useAsmaStore()

  function handleSubmit() {
    if (!paciente.nome || !paciente.dataNascimento || !paciente.numeroUtente) {
      alert('Por favor preenche o nome, data de nascimento e nº de utente.')
      return
    }
    if (!tipoConsulta) {
      alert('Por favor seleciona o tipo de consulta.')
      return
    }
    if (tipoConsulta === 'seguimento') {
      navegarPara(3) // salta para Fase 4 — Controlo
    } else {
      navegarPara(0) // começa na Fase 1
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 640 }}>

        <div style={{ background: '#0F6E56', borderRadius: 8, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#9FE1CB', fontSize: 13, fontWeight: 500 }}>Sistema ASMA — GRESP/GINA 2022</span>
        </div>

        <div style={{ background: '#1e1e1e', borderRadius: 12, border: '1px solid #333', padding: '2rem' }}>
          <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Nova consulta — dados do paciente</h2>
          <p style={{ color: '#666', fontSize: 12, marginBottom: '1.5rem' }}>Campos com * são obrigatórios</p>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Nome completo *</label>
            <input type="text" value={paciente.nome} onChange={e => setPaciente({ nome: e.target.value })} placeholder="Nome do paciente"
              style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Data de nascimento *</label>
              <input type="date" value={paciente.dataNascimento} onChange={e => setPaciente({ dataNascimento: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Sexo</label>
              <select value={paciente.sexo} onChange={e => setPaciente({ sexo: e.target.value as 'masculino' | 'feminino' | 'outro' })}
                style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff', boxSizing: 'border-box' }}>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Nº Utente SNS *</label>
              <input type="text" value={paciente.numeroUtente} onChange={e => setPaciente({ numeroUtente: e.target.value })} placeholder="9 dígitos"
                style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Cartão de Cidadão</label>
              <input type="text" value={paciente.cartaoCidadao} onChange={e => setPaciente({ cartaoCidadao: e.target.value })} placeholder="8, 9 ou 12 dígitos"
                style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Contacto telefónico</label>
            <input type="tel" value={paciente.contacto} onChange={e => setPaciente({ contacto: e.target.value })} placeholder="Número de telemóvel"
              style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff', boxSizing: 'border-box' }} />
          </div>

          {/* Tipo de consulta */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 8 }}>Tipo de consulta *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {([
                { val: 'primeira-consulta', titulo: 'Suspeita diagnóstica', desc: 'Diagnóstico ainda não confirmado — avaliação clínica completa segundo GRESP/GINA 2022' },
                { val: 'seguimento', titulo: 'Diagnóstico confirmado', desc: 'Asma já diagnosticada — avaliação de controlo e planeamento terapêutico' },
              ] as { val: TipoConsulta, titulo: string, desc: string }[]).map(op => (
                <div
                  key={op.val}
                  onClick={() => setTipoConsulta(op.val)}
                  style={{
                    padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                    border: tipoConsulta === op.val ? '1px solid #5DCAA5' : '1px solid #333',
                    background: tipoConsulta === op.val ? '#0F6E5620' : '#111',
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 500, color: tipoConsulta === op.val ? '#5DCAA5' : '#ccc', marginBottom: 4 }}>{op.titulo}</p>
                  <p style={{ fontSize: 11, color: '#555', margin: 0 }}>{op.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Doente jÃ¡ em ICS */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              onClick={() => setPaciente({ jaEmICS: !paciente.jaEmICS })}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
                borderRadius: 8, cursor: 'pointer',
                border: paciente.jaEmICS ? '1px solid #FAC775' : '1px solid #333',
                background: paciente.jaEmICS ? '#FAEEDA20' : '#111',
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: 3, flexShrink: 0, marginTop: 1,
                border: `1px solid ${paciente.jaEmICS ? '#FAC775' : '#555'}`,
                background: paciente.jaEmICS ? '#BA7517' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {paciente.jaEmICS && <span style={{ color: 'white', fontSize: 10 }}>{'\u2713'}</span>}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: paciente.jaEmICS ? '#FAC775' : '#ccc', margin: '0 0 4px' }}>
                  Doente jÃ¡ em tratamento com ICS
                </p>
                <p style={{ fontSize: 11, color: '#555', margin: 0 }}>
                  O mÃ©dico anterior iniciou corticosteroide inalado sem confirmaÃ§Ã£o formal por espirometria
                </p>
              </div>
            </div>
          </div>

          <div style={{ background: '#0F6E5615', border: '1px solid #1D9E7530', borderRadius: 6, padding: '10px 12px', marginBottom: '1.5rem' }}>
            <p style={{ color: '#5DCAA5', fontSize: 12, margin: 0 }}>
              Os dados existem apenas na memória do browser desta sessão e são apagados automaticamente ao fechar o separador.
            </p>
          </div>

          <button onClick={handleSubmit}
            style={{ width: '100%', background: '#0F6E56', color: 'white', border: 'none', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Iniciar avaliação →
          </button>
        </div>
      </div>
    </div>
  )
}
