interface NavFooterProps {
  stepAtual: number
  totalSteps: number
  onAnterior: () => void
  onProximo: () => void
  labelProximo?: string
}

export default function NavFooter({ stepAtual, totalSteps, onAnterior, onProximo, labelProximo = 'Próximo →' }: NavFooterProps) {
  return (
    <div style={{ padding: '12px 20px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <button
        onClick={onAnterior}
        style={{ padding: '7px 18px', borderRadius: 6, fontSize: 13, cursor: 'pointer', border: '1px solid #444', background: 'transparent', color: '#aaa' }}
      >
        ← Anterior
      </button>
      <span style={{ fontSize: 12, color: '#666' }}>Passo {stepAtual + 1} de {totalSteps}</span>
      <button
        onClick={onProximo}
        style={{ padding: '7px 18px', borderRadius: 6, fontSize: 13, cursor: 'pointer', border: 'none', background: '#0F6E56', color: 'white', fontWeight: 500 }}
      >
        {labelProximo}
      </button>
    </div>
  )
}