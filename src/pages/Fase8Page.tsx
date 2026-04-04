import { useState } from 'react'
import { useAsmaStore } from '../store/useAsmaStore'
import { calcularFase8 } from '../domain/fase8-agudizacao'
import Layout from '../components/Layout'
import SubstepNav from '../components/SubstepNav'
import NavFooter from '../components/NavFooter'
import CheckItem from '../components/CheckItem'
import ResultBox from '../components/ResultBox'

const steps = ['Parâmetros', 'Gravidade']

export default function Fase8Page() {
  const { fase8, setFase8, setResultadoFase8, navegarPara } = useAsmaStore()
  const [step, setStep] = useState(0)

  const resultado = calcularFase8(fase8)

  function handleProximo() {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      setResultadoFase8(resultado)
      navegarPara(8)
    }
  }

  const gravidadeTexto = {
    'ligeira-moderada': 'Ligeira ou Moderada',
    'grave': 'Grave',
    'critica': 'Crítica',
  }[resultado.gravidade]

  const gravidadeTipo = {
    'ligeira-moderada': 'ok',
    'grave': 'alerta',
    'critica': 'alerta',
  }[resultado.gravidade] as 'ok' | 'alerta' | 'neutro'

  return (
    <Layout
      faseNumero={8}
      faseTitulo="Sinalização de agudização"
      badge="Decisão automática"
      resumo={[
        { key: 'Gravidade', val: gravidadeTexto },
        { key: 'UCI', val: resultado.transferirUci ? '⚠ Sim' : 'Não' },
      ]}
    >
      <SubstepNav steps={steps} atual={step} onChange={setStep} />

      <div style={{ padding: 20, minHeight: 280 }}>

        {step === 0 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
              Se existirem parâmetros compatíveis com agudização, preencha os valores abaixo.
            </p>

            <div style={{ marginBottom: 16 }}>
              <CheckItem
                label="Paciente pediátrico (≤ 5 anos)"
                checked={fase8.idadeMenorCinco}
                onChange={v => setFase8({ idadeMenorCinco: v, pacientePediatrico: v })}
              />
            </div>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Avaliação clínica
            </p>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 8 }}>O doente exprime-se por:</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'Frases', val: true },
                  { label: 'Palavras isoladas', val: false },
                ].map(op => (
                  <button
                    key={op.label}
                    onClick={() => setFase8({ exprimePorFrases: op.val })}
                    style={{
                      padding: '7px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                      border: fase8.exprimePorFrases === op.val ? '1px solid #5DCAA5' : '1px solid #444',
                      background: fase8.exprimePorFrases === op.val ? '#0F6E56' : '#111',
                      color: fase8.exprimePorFrases === op.val ? 'white' : '#888',
                    }}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>
                  Freq. respiratória (/min)
                </label>
                <input
                  type="number"
                  value={fase8.freqRespiratoria ?? ''}
                  onChange={e => setFase8({ freqRespiratoria: e.target.value ? Number(e.target.value) : null })}
                  placeholder={fase8.idadeMenorCinco ? 'Normal ≤ 40' : 'Normal ≤ 30'}
                  style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>
                  Freq. cardíaca (bpm)
                </label>
                <input
                  type="number"
                  value={fase8.freqCardiaca ?? ''}
                  onChange={e => setFase8({ freqCardiaca: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Normal ≤ 120"
                  style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>
                  SpO2 (%)
                </label>
                <input
                  type="number"
                  value={fase8.spo2 ?? ''}
                  onChange={e => setFase8({ spo2: e.target.value ? Number(e.target.value) : null })}
                  placeholder={fase8.pacientePediatrico ? 'Normal ≥ 92' : 'Normal 90-95'}
                  style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>
                  PEF (% previsto)
                </label>
                <input
                  type="number"
                  value={fase8.pefPercentagem ?? ''}
                  onChange={e => setFase8({ pefPercentagem: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Normal > 50"
                  style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
                />
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Classificação automática de gravidade
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              <ResultBox
                label="Gravidade da agudização"
                valor={gravidadeTexto}
                tipo={gravidadeTipo}
              />
              <ResultBox
                label="Nível de cuidados"
                valor={resultado.nivelCuidados}
                tipo={resultado.gravidade === 'ligeira-moderada' ? 'ok' : 'alerta'}
              />
              {resultado.transferirUci && (
                <ResultBox
                  label="UCI"
                  valor="⚠ Transferir para UCI imediatamente"
                  tipo="alerta"
                />
              )}
            </div>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Fatores de mau prognóstico
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <CheckItem label="Episódios prévios de ventilação mecânica" checked={fase8.ventilaçãoMecanicaPrevia} onChange={v => setFase8({ ventilaçãoMecanicaPrevia: v })} alerta />
              <CheckItem label="≥ 2 urgências ou hospitalizações no último ano" checked={fase8.duasOuMaisUrgencias} onChange={v => setFase8({ duasOuMaisUrgencias: v })} alerta />
              <CheckItem label="Corticosteroides sistémicos recentes" checked={fase8.corticosteroidesRecentes} onChange={v => setFase8({ corticosteroidesRecentes: v })} />
              <CheckItem label="Abuso prolongado de SABA" checked={fase8.abusoDeSabaProlong} onChange={v => setFase8({ abusoDeSabaProlong: v })} />
              <CheckItem label="Comorbilidades graves descompensadas" checked={fase8.comorbilidadesGraves} onChange={v => setFase8({ comorbilidadesGraves: v })} alerta />
              <CheckItem label="Não adesão ao tratamento" checked={fase8.naoAdesaoTratamento} onChange={v => setFase8({ naoAdesaoTratamento: v })} />
              <CheckItem label="Presença de alergia alimentar" checked={fase8.alergiaAlimentar} onChange={v => setFase8({ alergiaAlimentar: v })} alerta />
            </div>
          </>
        )}
      </div>

      <NavFooter
        stepAtual={step}
        totalSteps={steps.length}
        onAnterior={() => step > 0 ? setStep(step - 1) : navegarPara(6)}
        onProximo={handleProximo}
        labelProximo={step === steps.length - 1 ? 'Ver relatório →' : 'Próximo →'}
      />
    </Layout>
  )
}
