import { useState } from 'react'
import { useAsmaStore } from '../store/useAsmaStore'
import { calcularFase3 } from '../domain/fase3-provas'
import Layout from '../components/Layout'
import SubstepNav from '../components/SubstepNav'
import NavFooter from '../components/NavFooter'
import CheckItem from '../components/CheckItem'
import ResultBox from '../components/ResultBox'

const steps = ['Espirometria', 'PEF + Output']

export default function Fase3Page() {
  const { fase3, setFase3, setResultadoFase3, navegarPara } = useAsmaStore()
  const [step, setStep] = useState(0)

  const resultado = calcularFase3(fase3)

  function handleProximo() {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      setResultadoFase3(resultado)
      navegarPara(9)
    }
  }

  const racio = fase3.fev1FvcRacio ??
    (fase3.fev1Percentagem && fase3.fvcPercentagem
      ? (fase3.fev1Percentagem / fase3.fvcPercentagem)
      : null)

  return (
    <Layout
      faseNumero={3}
      faseTitulo="Provas de função respiratória"
      badge="Decisão automática"
      resumo={[
        { key: 'Obstrução', val: fase3.fev1Percentagem ? (resultado.obstrutivo ? 'Confirmada' : 'Não confirmada') : '—' },
        { key: 'Critérios +', val: fase3.fev1Percentagem ? `${resultado.criteriosPositivos}/3` : '—' },
      ]}
    >
      <SubstepNav steps={steps} atual={step} onChange={setStep} />

      <div style={{ padding: 20, minHeight: 280 }}>

        {step === 0 && (
          <>
            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
              Contexto do paciente
            </p>
            <div style={{ marginBottom: 20 }}>
              <CheckItem
                label="Paciente pediátrico (> 5 anos)"
                checked={fase3.pacientePediatrico}
                onChange={v => setFase3({ pacientePediatrico: v })}
              />
              <p style={{ fontSize: 11, color: '#555', marginTop: 6 }}>
                {fase3.pacientePediatrico
                  ? 'Limiares pediátricos: FEV1/FVC < 0,90 | Reversibilidade > 12% do previsto | PEF > 13%'
                  : 'Limiares adulto: FEV1/FVC < 0,75 | Reversibilidade > 12% E > 200ml | PEF > 10%'}
              </p>
            </div>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Espirometria pré-broncodilatador
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>FEV1 (% previsto)</label>
                <input
                  type="number"
                  value={fase3.fev1Percentagem ?? ''}
                  onChange={e => setFase3({ fev1Percentagem: e.target.value ? Number(e.target.value) : null })}
                  placeholder="ex: 72"
                  style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>FVC (% previsto)</label>
                <input
                  type="number"
                  value={fase3.fvcPercentagem ?? ''}
                  onChange={e => setFase3({ fvcPercentagem: e.target.value ? Number(e.target.value) : null })}
                  placeholder="ex: 85"
                  style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
                />
              </div>
            </div>

            {racio && (
              <ResultBox
                label="FEV1/FVC calculado"
                valor={`${racio.toFixed(2)} → ${resultado.obstrutivo ? 'Obstrução confirmada' : 'Sem obstrução'}`}
                tipo={resultado.obstrutivo ? 'alerta' : 'ok'}
              />
            )}

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '20px 0 12px' }}>
              Reversibilidade pós-broncodilatador
            </p>
            <p style={{ fontSize: 11, color: '#555', marginBottom: 12 }}>10-15 min após 200-400 µg salbutamol</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Aumento FEV1 (%)</label>
                <input
                  type="number"
                  value={fase3.aumentoFev1Percentagem ?? ''}
                  onChange={e => setFase3({ aumentoFev1Percentagem: e.target.value ? Number(e.target.value) : null })}
                  placeholder="ex: 14"
                  style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
                />
              </div>
              {!fase3.pacientePediatrico && (
                <div>
                  <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Aumento FEV1 (ml)</label>
                  <input
                    type="number"
                    value={fase3.aumentoFev1ml ?? ''}
                    onChange={e => setFase3({ aumentoFev1ml: e.target.value ? Number(e.target.value) : null })}
                    placeholder="ex: 250"
                    style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Variabilidade diária do PEF
            </p>
            <p style={{ fontSize: 11, color: '#555', marginBottom: 12 }}>2 medições/dia durante 2 semanas — melhor de 3 determinações em cada medição</p>
            <div style={{ marginBottom: 20, maxWidth: 200 }}>
              <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Variabilidade diária (%)</label>
              <input
                type="number"
                value={fase3.variabilidadePef ?? ''}
                onChange={e => setFase3({ variabilidadePef: e.target.value ? Number(e.target.value) : null })}
                placeholder="ex: 12"
                style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
              />
            </div>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Output automático — fase 3
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ResultBox
                label="Limitação ao fluxo expiratório (FEV1/FVC)"
                valor={fase3.fev1Percentagem ? (resultado.obstrutivo ? 'Critério positivo' : 'Critério negativo') : 'Aguarda valores'}
                tipo={fase3.fev1Percentagem ? (resultado.obstrutivo ? 'ok' : 'neutro') : 'neutro'}
              />
              <ResultBox
                label="Reversibilidade broncodilatadora"
                valor={fase3.aumentoFev1Percentagem ? (resultado.reversibilidade ? 'Critério positivo' : 'Critério negativo') : 'Aguarda valores'}
                tipo={fase3.aumentoFev1Percentagem ? (resultado.reversibilidade ? 'ok' : 'neutro') : 'neutro'}
              />
              <ResultBox
                label="Variabilidade diária do PEF"
                valor={fase3.variabilidadePef ? (resultado.pefPositivo ? 'Critério positivo' : 'Critério negativo') : 'Aguarda valores'}
                tipo={fase3.variabilidadePef ? (resultado.pefPositivo ? 'ok' : 'neutro') : 'neutro'}
              />
              <ResultBox
                label="Critérios objetivos positivos"
                valor={`${resultado.criteriosPositivos} de 3`}
                tipo={resultado.criteriosPositivos >= 1 ? 'ok' : 'neutro'}
              />
            </div>
            <p style={{ fontSize: 11, color: '#555', marginTop: 12 }}>
              A conclusão diagnóstica final é da responsabilidade do médico.
            </p>
          </>
        )}
      </div>

      <NavFooter
        stepAtual={step}
        totalSteps={steps.length}
        onAnterior={() => step > 0 ? setStep(step - 1) : navegarPara(1)}
        onProximo={handleProximo}
        labelProximo={step === steps.length - 1 ? 'Fase 4 →' : 'Próximo →'}
      />
    </Layout>
  )
}