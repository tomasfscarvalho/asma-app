import { useState } from 'react'
import { useAsmaStore } from '../store/useAsmaStore'
import Layout from '../components/Layout'
import SubstepNav from '../components/SubstepNav'
import NavFooter from '../components/NavFooter'
import CheckItem from '../components/CheckItem'

const steps = ['Medicação / Função', 'Exposição', 'Comorbilidades']

export default function Fase5Page() {
  const { fase5, setFase5, navegarPara } = useAsmaStore()
  const [step, setStep] = useState(0)

  const fatoresMajor = fase5.intubacaoOuUciPrevia || fase5.agudizacaoGraveUltimoAno

  return (
    <Layout
      faseNumero={5}
      faseTitulo="Risco futuro"
      badge="Apresentação ao médico"
      resumo={[
        { key: 'Fatores major', val: fatoresMajor ? '⚠ Presentes' : 'Nenhum' },
        { key: 'Abuso SABA', val: fase5.abusoDeSaba ? 'Sim' : 'Não' },
      ]}
    >
      <SubstepNav steps={steps} atual={step} onChange={setStep} />

      <div style={{ padding: 20, minHeight: 280 }}>
        <div style={{ marginBottom: 16, background: '#0F6E5620', border: '1px solid #1D9E7530', borderRadius: 6, padding: '10px 12px' }}>
          <p style={{ color: '#9FE1CB', fontSize: 12, margin: 0 }}>
            A avaliação do risco futuro complementa a avaliação do controlo da asma feita na Fase 4 e deve ser interpretada em conjunto.
          </p>
        </div>

        {step === 0 && (
          <>
            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Medicação e função pulmonar
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              <CheckItem label="Sintomas não controlados" checked={fase5.sintomasNaoControlados} onChange={v => setFase5({ sintomasNaoControlados: v })} />
              <CheckItem label="Não cumprimento de ICS" checked={fase5.naoCumprimentoIcs} onChange={v => setFase5({ naoCumprimentoIcs: v })} />
              <CheckItem label="Má adesão à terapêutica" checked={fase5.maAdesao} onChange={v => setFase5({ maAdesao: v })} />
              <CheckItem label="Técnica inalatória incorreta" checked={fase5.tecnicaInalatoriaIncorreta} onChange={v => setFase5({ tecnicaInalatoriaIncorreta: v })} />
              <CheckItem label="Abuso de SABA (≥ 3 cartuchos/ano)" checked={fase5.abusoDeSaba} onChange={v => setFase5({ abusoDeSaba: v })} alerta />
              <CheckItem label="FEV1 < 60% do previsto" checked={fase5.fev1Baixo} onChange={v => setFase5({ fev1Baixo: v })} alerta />
            </div>

            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Fatores de risco major independentes
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <CheckItem
                label="Intubação ou internamento em UCI prévia por asma"
                checked={fase5.intubacaoOuUciPrevia}
                onChange={v => setFase5({ intubacaoOuUciPrevia: v })}
                alerta
              />
              <CheckItem
                label="≥ 1 agudização grave nos últimos 12 meses"
                checked={fase5.agudizacaoGraveUltimoAno}
                onChange={v => setFase5({ agudizacaoGraveUltimoAno: v })}
                alerta
              />
            </div>

            {fatoresMajor && (
              <div style={{ marginTop: 16, background: '#E24B4A15', border: '1px solid #E24B4A50', borderRadius: 6, padding: '10px 12px' }}>
                <p style={{ color: '#F09595', fontSize: 13, margin: 0 }}>
                  ⚠ Fator de risco major presente — risco elevado de agudização grave mesmo com sintomas controlados.
                </p>
              </div>
            )}

            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Agudizações no último ano</label>
                <input
                  type="number"
                  value={fase5.agudizacoesUltimoAno ?? ''}
                  onChange={e => setFase5({ agudizacoesUltimoAno: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Nº de agudizações"
                  style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Internamentos no último ano</label>
                <input
                  type="number"
                  value={fase5.internamatosUltimoAno ?? ''}
                  onChange={e => setFase5({ internamatosUltimoAno: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Nº de internamentos"
                  style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
                />
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Exposição e contexto
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <CheckItem label="Fumo do tabaco" checked={fase5.fumoTabaco} onChange={v => setFase5({ fumoTabaco: v })} alerta />
              <CheckItem label="Biomassa / poluição atmosférica" checked={fase5.biomassa} onChange={v => setFase5({ biomassa: v })} />
              <CheckItem label="Alergénios (se sensibilizado)" checked={fase5.alergenios} onChange={v => setFase5({ alergenios: v })} />
              <CheckItem label="Problemas psicológicos" checked={fase5.problemaspsicologicos} onChange={v => setFase5({ problemaspsicologicos: v })} />
              <CheckItem label="Fatores socioeconómicos" checked={fase5.fatoresSocioeconomicos} onChange={v => setFase5({ fatoresSocioeconomicos: v })} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Comorbilidades
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <CheckItem label="Obesidade" checked={fase5.obesidade} onChange={v => setFase5({ obesidade: v })} />
              <CheckItem label="Rinossinusite" checked={fase5.rinossinusite} onChange={v => setFase5({ rinossinusite: v })} />
              <CheckItem label="Alergia alimentar" checked={fase5.alergiaAlimentar} onChange={v => setFase5({ alergiaAlimentar: v })} alerta />
              <CheckItem label="Refluxo gastroesofágico" checked={fase5.refluxo} onChange={v => setFase5({ refluxo: v })} />
              <CheckItem label="Gravidez" checked={fase5.gravidez} onChange={v => setFase5({ gravidez: v })} />
              <CheckItem label="Eosinofilia" checked={fase5.eosinofilia} onChange={v => setFase5({ eosinofilia: v })} />
            </div>
          </>
        )}
      </div>

      <NavFooter
        stepAtual={step}
        totalSteps={steps.length}
        onAnterior={() => step > 0 ? setStep(step - 1) : navegarPara(3)}
        onProximo={() => step < steps.length - 1 ? setStep(step + 1) : navegarPara(5)}
        labelProximo={step === steps.length - 1 ? 'Fase 6 →' : 'Próximo →'}
      />
    </Layout>
  )
}
