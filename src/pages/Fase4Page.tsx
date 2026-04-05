import { useState } from 'react'
import type { Fase4Dados } from '../domain/types'
import { useAsmaStore } from '../store/useAsmaStore'
import { calcularFase4 } from '../domain/fase4-controlo'
import Layout from '../components/Layout'
import SubstepNav from '../components/SubstepNav'
import NavFooter from '../components/NavFooter'
import CheckItem from '../components/CheckItem'
import ResultBox from '../components/ResultBox'

const steps = ['Critérios GRESP/GINA', 'Questionário']

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

const actPerguntas: { key: keyof Fase4Dados, texto: string }[] = [
  { key: 'actLimitacaoAtividades', texto: 'Limitação nas atividades habituais (trabalho, escola, casa)' },
  { key: 'actFaltaAr', texto: 'Frequência de falta de ar' },
  { key: 'actSintomasNoturnos', texto: 'Sintomas noturnos ou despertar precoce por asma' },
  { key: 'actUsoAlivio', texto: 'Frequência de uso de medicação de alívio rápido' },
  { key: 'actAutoavaliacao', texto: 'Avaliação pessoal do controlo da asma' },
]

const caratPerguntas: { key: keyof Fase4Dados, texto: string }[] = [
  { key: 'caratNasalCongestion', texto: 'Nariz entupido?' },
  { key: 'caratSneezing', texto: 'Espirros?' },
  { key: 'caratNasalItching', texto: 'Comichão no nariz?' },
  { key: 'caratRunnyNose', texto: 'Corrimento/pingo do nariz?' },
  { key: 'caratBreathlessness', texto: 'Falta de ar/dispneia?' },
  { key: 'caratWheeze', texto: 'Chiadeira no peito/pieira?' },
  { key: 'caratChestTightness', texto: 'Aperto no peito com esforço físico?' },
  { key: 'caratActivityLimitation', texto: 'Cansaço/dificuldade nas atividades do dia-a-dia?' },
  { key: 'caratSleepDisturbance', texto: 'Acordou durante a noite por causa das doenças alérgicas?' },
  { key: 'caratMedicationIncrease', texto: 'Aumentar a utilização dos seus medicamentos?' },
]

const caratOpcoesFrequencia = [
  { label: 'Nunca', value: 3 },
  { label: 'Até 2 dias por semana', value: 2 },
  { label: 'Mais de 2 dias por semana', value: 1 },
  { label: 'Quase todos ou todos os dias', value: 0 },
]

const caratOpcoesMedicacao = [
  { label: 'Não estou a tomar medicamentos', value: 3 },
  { label: 'Nunca', value: 3 },
  { label: 'Menos de 7 dias', value: 2 },
  { label: '7 ou mais dias', value: 0 },
]

function calcularCaratRinite(fase4: Fase4Dados): number | null {
  const campos = [
    fase4.caratNasalCongestion,
    fase4.caratSneezing,
    fase4.caratNasalItching,
    fase4.caratRunnyNose,
  ]

  if (campos.some(c => c === null)) return null
  return (campos as number[]).reduce((acc, val) => acc + val, 0)
}

function calcularCaratAsma(fase4: Fase4Dados): number | null {
  const campos = [
    fase4.caratBreathlessness,
    fase4.caratWheeze,
    fase4.caratChestTightness,
    fase4.caratActivityLimitation,
    fase4.caratSleepDisturbance,
    fase4.caratMedicationIncrease,
  ]

  if (campos.some(c => c === null)) return null
  return (campos as number[]).reduce((acc, val) => acc + val, 0)
}

function interpretarCarat(scoreTotal: number | null, scoreRinite: number | null, scoreAsma: number | null): string {
  if (scoreTotal === null || scoreRinite === null || scoreAsma === null) {
    return 'Incompleto — preencha todas as perguntas.'
  }

  const global = scoreTotal > 24 ? 'bom controlo global' : 'controlo global insuficiente'
  const rinite = scoreRinite > 8 ? 'rinite controlada' : 'rinite não controlada'
  const asma = scoreAsma >= 16 ? 'asma controlada' : 'asma não controlada'
  return `${scoreTotal} / 30 — ${global}; ${rinite}; ${asma}.`
}

export default function Fase4Page() {
  const { fase4, setFase4, setResultadoFase4, navegarPara, tipoConsulta } = useAsmaStore()
  const [step, setStep] = useState(0)

  const resultado = calcularFase4(fase4)
  const scoreCaratRinite = calcularCaratRinite(fase4)
  const scoreCaratAsma = calcularCaratAsma(fase4)

  function handleProximo() {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      setResultadoFase4(resultado)
      navegarPara(4)
    }
  }

  const resumoQuestionario = fase4.questionarioUsado === 'carat'
    ? (resultado.scoreCarat !== null ? `${resultado.scoreCarat}/30` : '—')
    : (resultado.scoreAct !== null ? `${resultado.scoreAct}/25` : '—')

  return (
    <Layout
      faseNumero={4}
      faseTitulo="Controlo dos sintomas"
      badge="Decisão automática"
      resumo={[
        { key: 'Controlo', val: controloTexto[resultado.nivelControlo] },
        { key: fase4.questionarioUsado === 'carat' ? 'CARAT' : 'ACT', val: resumoQuestionario },
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
                label="Sintomas diurnos > 2x/semana — sibilância, tosse despertada pelo exercício, opressão torácica ou tosse após exposição a alergénios ou poluentes"
                checked={fase4.sintomasDiurnos}
                onChange={v => setFase4({ sintomasDiurnos: v })}
              />
              <CheckItem
                label="Sintomas noturnos e/ou ao despertar — perturbação do sono por asma, incluindo tosse"
                checked={fase4.sintomasNoturnos}
                onChange={v => setFase4({ sintomasNoturnos: v })}
              />
              <CheckItem
                label="Limitação das atividades diárias devido a sintomas de asma"
                checked={fase4.limitacaoAtividades}
                onChange={v => setFase4({ limitacaoAtividades: v })}
              />
              <CheckItem
                label="Necessidade de medicação de alívio > 2x/semana"
                checked={fase4.necessidadeAlivio}
                onChange={v => setFase4({ necessidadeAlivio: v })}
              />
            </div>

            <ResultBox
              label="Classificação automática GINA"
              valor={controloTexto[resultado.nivelControlo]}
              tipo={controloTipo[resultado.nivelControlo]}
            />

            {tipoConsulta === 'seguimento' && (
              <div style={{ marginTop: 16, maxWidth: 260 }}>
                <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>
                  FEV1 atual (% do previsto)
                </label>
                <input
                  type="number"
                  value={fase4.fev1Atual ?? ''}
                  onChange={e => setFase4({ fev1Atual: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Ex: 78"
                  style={{ width: '100%', padding: '8px 10px', background: '#111', border: '1px solid #444', borderRadius: 6, fontSize: 13, color: '#fff' }}
                />
              </div>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>
              Selecione o questionário de avaliação a utilizar nas últimas 4 semanas.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <button
                onClick={() => setFase4({ questionarioUsado: 'act' })}
                style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: fase4.questionarioUsado === 'act' ? '1px solid #5DCAA5' : '1px solid #333',
                  background: fase4.questionarioUsado === 'act' ? '#0F6E5620' : 'transparent',
                  color: fase4.questionarioUsado === 'act' ? '#9FE1CB' : '#ccc',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>ACT</div>
                <div style={{ fontSize: 12, color: '#888' }}>5 perguntas, escala 1-5, score total 5-25.</div>
              </button>
              <button
                onClick={() => setFase4({ questionarioUsado: 'carat' })}
                style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: fase4.questionarioUsado === 'carat' ? '1px solid #5DCAA5' : '1px solid #333',
                  background: fase4.questionarioUsado === 'carat' ? '#0F6E5620' : 'transparent',
                  color: fase4.questionarioUsado === 'carat' ? '#9FE1CB' : '#ccc',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>CARAT</div>
                <div style={{ fontSize: 12, color: '#888' }}>10 perguntas, escala 0-3, score total 0-30.</div>
              </button>
            </div>

            {fase4.questionarioUsado === 'act' && (
              <>
                <p style={{ fontSize: 11, color: '#555', marginBottom: 16 }}>
                  Asthma Control Test (ACT) — escala de 1 (pior) a 5 (melhor) por pergunta.
                </p>

                {actPerguntas.map((p, i) => (
                  <div key={p.key} style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 13, color: '#ccc', marginBottom: 8 }}>{i + 1}. {p.texto}</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          onClick={() => setFase4({ [p.key]: val } as Partial<Fase4Dados>)}
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
                    valor={resultado.scoreAct !== null ? `${resultado.scoreAct} / 25` : 'Incompleto — preencha todas as perguntas.'}
                    tipo={resultado.scoreAct !== null ? (resultado.scoreAct >= 20 ? 'ok' : resultado.scoreAct >= 16 ? 'neutro' : 'alerta') : 'neutro'}
                  />
                </div>
              </>
            )}

            {fase4.questionarioUsado === 'carat' && (
              <>
                <p style={{ fontSize: 11, color: '#555', marginBottom: 16 }}>
                  CARAT — perguntas 1-9 usam a frequência das últimas 4 semanas; a pergunta 10 avalia aumento de medicação. Perguntas 1-4 avaliam rinite; 5-10 avaliam asma.
                </p>

                {caratPerguntas.map((p, i) => (
                  <div key={p.key} style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 13, color: '#ccc', marginBottom: 8 }}>{i + 1}. {p.texto}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>
                      {(p.key === 'caratMedicationIncrease' ? caratOpcoesMedicacao : caratOpcoesFrequencia).map(opcao => (
                        <button
                          key={`${p.key}-${opcao.label}`}
                          onClick={() => setFase4({ [p.key]: opcao.value } as Partial<Fase4Dados>)}
                          style={{
                            minHeight: 48, borderRadius: 6, fontSize: 12, cursor: 'pointer',
                            border: fase4[p.key] === opcao.value ? '1px solid #5DCAA5' : '1px solid #444',
                            background: fase4[p.key] === opcao.value ? '#0F6E56' : '#111',
                            color: fase4[p.key] === opcao.value ? 'white' : '#bbb',
                            fontWeight: fase4[p.key] === opcao.value ? 500 : 400,
                            padding: '6px 8px',
                          }}
                        >
                          {opcao.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                  <ResultBox
                    label="CARAT rinite"
                    valor={scoreCaratRinite !== null ? `${scoreCaratRinite} / 12` : 'Incompleto'}
                    tipo={scoreCaratRinite !== null ? (scoreCaratRinite > 8 ? 'ok' : 'alerta') : 'neutro'}
                  />
                  <ResultBox
                    label="CARAT asma"
                    valor={scoreCaratAsma !== null ? `${scoreCaratAsma} / 18` : 'Incompleto'}
                    tipo={scoreCaratAsma !== null ? (scoreCaratAsma >= 16 ? 'ok' : 'alerta') : 'neutro'}
                  />
                </div>

                <div style={{ marginTop: 12 }}>
                  <ResultBox
                    label="Score CARAT"
                    valor={interpretarCarat(resultado.scoreCarat, scoreCaratRinite, scoreCaratAsma)}
                    tipo={resultado.scoreCarat !== null ? (resultado.scoreCarat > 24 ? 'ok' : 'alerta') : 'neutro'}
                  />
                </div>
              </>
            )}
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
