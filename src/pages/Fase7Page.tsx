import { useAsmaStore } from '../store/useAsmaStore'
import { ECRA } from '../domain/fases'
import { calcularFase7 } from '../domain/fase7-referenciacao'
import Layout from '../components/Layout'
import NavFooter from '../components/NavFooter'
import CheckItem from '../components/CheckItem'

export default function Fase7Page() {
  const { fase4, fase5, fase6, fase7, setFase7, setResultadoFase7, navegarPara } = useAsmaStore()

  const resultado = calcularFase7(fase4, fase6, fase7, fase5.fev1Baixo)

  function handleProximo() {
    setResultadoFase7(resultado)
    navegarPara(ECRA.FASE_8_AGUDIZACAO)
  }

  return (
    <Layout
      faseNumero={7}
      faseTitulo="Critérios de referenciação"
      badge="Decisão automática"
      resumo={[
        { key: 'Referenciar', val: resultado.referenciar ? '⚠ Sim' : 'Não' },
        { key: 'Critérios', val: `${resultado.criteriosPresentes.length}` },
      ]}
    >
      <div style={{ padding: 20, minHeight: 280 }}>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>
          A ferramenta sinaliza automaticamente critérios de referenciação para consulta de especialidade, segundo o GRESP. A decisão de referenciar compete ao médico.
        </p>

        <p style={{ fontSize: 11, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Critérios adicionais — registo pelo médico
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <CheckItem
            label="Dificuldades no diagnóstico"
            checked={fase7.dificuldadesDiagnostico}
            onChange={v => setFase7({ dificuldadesDiagnostico: v })}
          />
          <CheckItem
            label="Suspeita de asma ocupacional"
            checked={fase7.suspeitaAsmaOcupacional}
            onChange={v => setFase7({ suspeitaAsmaOcupacional: v })}
          />
          <CheckItem
            label="Necessidade de testes adicionais (por exemplo, testes de alergia)"
            checked={fase7.necessitaTestesAdicionais}
            onChange={v => setFase7({ necessitaTestesAdicionais: v })}
          />
          <CheckItem
            label="≥ 2 hospitalizações ou episódios de urgência nos últimos 12 meses"
            checked={fase7.duasOuMaisHospitalizacoes}
            onChange={v => setFase7({ duasOuMaisHospitalizacoes: v })}
            alerta
          />
          <CheckItem
            label="Asma grave ou múltiplos internamentos no último ano"
            checked={fase7.asmaGrave}
            onChange={v => setFase7({ asmaGrave: v })}
            alerta
          />
          <CheckItem
            label="Presença de fatores de mau prognóstico"
            checked={fase7.fatoresMauPrognostico}
            onChange={v => setFase7({ fatoresMauPrognostico: v })}
            alerta
          />
          <CheckItem
            label="Risco de efeitos secundários significativos do tratamento"
            checked={fase7.riscoEfeitosSecundarios}
            onChange={v => setFase7({ riscoEfeitosSecundarios: v })}
          />
        </div>

      </div>

      <NavFooter
        stepAtual={0}
        totalSteps={1}
        onAnterior={() => navegarPara(ECRA.FASE_6_TERAPEUTICA)}
        onProximo={handleProximo}
        labelProximo="Fase 8 →"
      />
    </Layout>
  )
}
