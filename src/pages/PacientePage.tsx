import { useAsmaStore } from '../store/useAsmaStore'

export default function PacientePage() {
  const { paciente, setPaciente, navegarPara } = useAsmaStore()

  function handleSubmit() {
    if (!paciente.nome || !paciente.dataNascimento || !paciente.numeroUtente) {
      alert('Por favor preenche o nome, data de nascimento e nº de utente.')
      return
    }
    navegarPara(0)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 640 }}>

        {/* Topbar */}
        <div style={{ background: '#0F6E56', borderRadius: 8, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#9FE1CB', fontSize: 13, fontWeight: 500 }}>Sistema ASMA</span>
        </div>

        {/* Card principal */}
        <div style={{ background: '#2a2a2a', borderRadius: 12, border: '1px solid #3a3a3a', padding: '2rem' }}>
          <h2 style={{ color: '#ffffff', fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Nova consulta — dados do paciente</h2>
          <p style={{ color: '#888', fontSize: 12, marginBottom: '1.5rem' }}>Campos com * são obrigatórios</p>

          {/* Nome */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Nome completo *</label>
            <input
              type="text"
              value={paciente.nome}
              onChange={e => setPaciente({ nome: e.target.value })}
              placeholder="Nome do paciente"
              style={{ width: '100%', padding: '8px 10px', background: '#1a1a1a', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff', boxSizing: 'border-box' }}
            />
          </div>

          {/* Data nasc + Sexo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Data de nascimento *</label>
              <input
                type="date"
                value={paciente.dataNascimento}
                onChange={e => setPaciente({ dataNascimento: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', background: '#1a1a1a', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Sexo</label>
              <select
                value={paciente.sexo}
                onChange={e => setPaciente({ sexo: e.target.value as 'masculino' | 'feminino' | 'outro' })}
                style={{ width: '100%', padding: '8px 10px', background: '#1a1a1a', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff', boxSizing: 'border-box' }}
              >
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          {/* Nº Utente + CC */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Nº Utente SNS *</label>
              <input
                type="text"
                value={paciente.numeroUtente}
                onChange={e => setPaciente({ numeroUtente: e.target.value })}
                placeholder="9 dígitos"
                style={{ width: '100%', padding: '8px 10px', background: '#1a1a1a', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Cartão de Cidadão</label>
              <input
                type="text"
                value={paciente.cartaoCidadao}
                onChange={e => setPaciente({ cartaoCidadao: e.target.value })}
                placeholder="8, 9 ou 12 dígitos"
                style={{ width: '100%', padding: '8px 10px', background: '#1a1a1a', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Contacto */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Contacto telefónico</label>
            <input
              type="tel"
              value={paciente.contacto}
              onChange={e => setPaciente({ contacto: e.target.value })}
              placeholder="Número de telemóvel"
              style={{ width: '100%', padding: '8px 10px', background: '#1a1a1a', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff', boxSizing: 'border-box' }}
            />
          </div>

          {/* Aviso RGPD */}
          <div style={{ background: '#0F6E5620', border: '1px solid #1D9E7540', borderRadius: 6, padding: '10px 12px', marginBottom: '1.5rem' }}>
            <p style={{ color: '#5DCAA5', fontSize: 12, margin: 0 }}>
              Os dados existem apenas na memória do browser desta sessão e são apagados automaticamente ao fechar o separador.
            </p>
          </div>

          {/* Botão */}
          <button
            onClick={handleSubmit}
            style={{ width: '100%', background: '#0F6E56', color: 'white', border: 'none', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            Iniciar avaliação →
          </button>
        </div>

      </div>
    </div>
  )
}