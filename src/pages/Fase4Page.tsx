import { useState } from 'react'
import { useAsmaStore } from '../store/useAsmaStore'
import { calcularFase4 } from '../domain/fase4-controlo'
import Layout from '../components/Layout'
import SubstepNav from '../components/SubstepNav'
import NavFooter from '../components/NavFooter'
import CheckItem from '../components/CheckItem'
import ResultBox from '../components/ResultBox'

const steps = ['Critérios GINA', 'ACT']

const controloTexto = {
  'controlada': 'Controlada',
  'parcialmente-controlada': 'Parcialmente Controlada',
  'nao-controlada': 'Não Controlada',
}

const controloTipo = {
  'controlada': 'ok',
  'parcialmente-controlada': 'alerta',
  'nao-controlada': 'alerta',
} as const

const actPerguntas = [
  { key: 'actLimitacaoAtividades' as const, texto: 'Limitação nas atividades habituais (trabalho, escola, casa)' },
  { key: 'actFaltaAr' as const, texto: 'Frequência de falta de ar' },
  { key: 'actSintomasNoturnos' as const, texto: 'Sintomas noturnos ou despertar precoce por asma' },
  { key: 'actUsoAlivio' as const, texto: 'Frequência de uso de medicação de alívio rápido' },
  { key: 'actAutoavaliacao' as const, texto: 'Avaliação pessoal do controlo da asma' },
]

export default function Fase4Page() {
  const { fase4, setFase4, setResultadoFase4, navegarPara } = useAsmaStore()
  const [step, setStep] = useState(0)

  const resultado = calcularFase4(fase4)

  function handleProximo() {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      setResultadoFase4(resultado)
      navegarPara(4)
    }
  }

  return (
    <Layout
      faseNumero={4}
      faseTitulo="Controlo dos sintomas"
      badge="Decisão automática"
      resumo={[
        { key: 'Controlo', val: controloTexto[resultado.nivelControlo] },
        { key: 'ACT', val: resultado.scoreAct ? `${resultado.scoreAct}/25` : '—' },
      ]}
    >
      <SubstepNav steps={steps} atual={step} onChange={setStep} />

      <div style={{ padding: 20, minHeight: 280 }}>

        {step === 0 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
              Registo dos sintomas das últimas 4 semanas.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              <CheckItem
                label="Sintomas diurnos > 2x por semana"
                checked={fase4.sintomasDiurnos}
                onChange={v => setFase4({ sintomasDiurnos: v })}
              />
              <CheckItem
                label="Sintomas noturnos ou ao despertar"
                checked={fase4.sintomasNoturnos}
                onChange={v => setFase4({ sintomasNoturnos: v })}
              />
              <CheckItem
                label="Limitação das atividades diárias"
                checked={fase4.limitacaoAtividades}
                onChange={v => setFase4({ limitacaoAtividades: v })}
              />
              <CheckItem
                label="Necessidade de medicação de alívio > 2x por semana"
                checked={fase4.necessidadeAlivio}
                onChange={v => setFase4({ necessidadeAlivio: v })}
              />
            </div>

            <ResultBox
              label="Classificação automática GINA"
              valor={controloTexto[resultado.nivelControlo]}
              tipo={controloTipo[resultado.nivelControlo]}
            />
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
              Asthma Control Test (ACT) — últimas 4 semanas
            </p>
            <p style={{ fontSize: 11, color: '#555', marginBottom: 16 }}>
              Escala de 1 (pior) a 5 (melhor) por pergunta. Total de 5 a 25.
            </p>

            {actPerguntas.map((p, i) => (
              <div key={p.key} style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#ccc', marginBottom: 8 }}>{i + 1}. {p.texto}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      onClick={() => setFase4({ [p.key]: val })}
                      style={{
                        width: 40, height: 36, borderRadius: 6, fontSize: 13, cursor: 'pointer',
                        border: fase4[p.key] === val ? '1px solid #5DCAA5' : '1px solid #444',
                        background: fase4[p.key] === val ? '#0F6E56' : '#111',
                        color: fase4[p.key] === val ? 'white' : '#888',
                        fontWeight: fase4[p.key] === val ? 500 : 400,
                      }}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ marginTop: 8 }}>
              <ResultBox
                label="Score ACT"
                valor={resultado.scoreAct ? `${resultado.scoreAct} / 25` : 'Incompleto — preencha todas as perguntas.'}
                tipo={resultado.scoreAct ? (resultado.scoreAct >= 20 ? 'ok' : resultado.scoreAct >= 16 ? 'neutro' : 'alerta') : 'neutro'}
              />
            </div>
          </>
        )}
      </div>

      <NavFooter
        stepAtual={step}
        totalSteps={steps.length}
        onAnterior={() => step > 0 ? setStep(step - 1) : navegarPara(2)}
        onProximo={handleProximo}
        labelProximo={step === steps.length - 1 ? 'Fase 5 →' : 'Próximo →'}
      />
    </Layout>
  )
}
