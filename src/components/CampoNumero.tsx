import { useEffect, useState } from 'react'
import { numero as formatar } from '../domain/formato'

interface CampoNumeroProps {
  label: string
  valor: number | null
  onChange: (valor: number | null) => void
  /** Intervalo fisiologicamente plausível. */
  min: number
  max: number
  unidade?: string
  step?: string
  placeholder?: string
  /** Regra adicional, que pode depender de outro campo (por exemplo, FEV1 ≤ FVC). */
  validar?: (valor: number) => string | null
}

// Campo numérico que recusa valores impossíveis. O texto escrito fica à vista,
// com o aviso, mas o valor guardado passa a null, como num campo por
// preencher: um valor impossível não pode decidir um critério clínico.
export default function CampoNumero({ label, valor, onChange, min, max, unidade, step, placeholder, validar }: CampoNumeroProps) {
  const [texto, setTexto] = useState(valor === null ? '' : String(valor))

  const lido = texto.trim() === '' ? null : Number(texto)
  // "100%" e "120/min" escrevem-se sem espaço; "8 L" e "250 bpm", com espaço.
  const sufixo = !unidade ? '' : /^[%/]/.test(unidade) ? unidade : ` ${unidade}`
  const erro = lido === null
    ? null
    : Number.isNaN(lido) || lido < min || lido > max
      ? `Valor fora do intervalo plausível (${formatar(min)} a ${formatar(max)}${sufixo}): não é considerado.`
      : validar?.(lido) ?? null
  const efetivo = lido === null || erro !== null ? null : lido

  // Uma regra que depende de outro campo pode mudar depois de este ter sido
  // escrito: o valor guardado acompanha sempre o que o campo mostra.
  useEffect(() => {
    if (efetivo !== valor) onChange(efetivo)
  }, [efetivo, valor, onChange])

  return (
    <div>
      <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>{label}</label>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={texto}
        onChange={e => setTexto(e.target.value)}
        placeholder={placeholder}
        aria-invalid={erro !== null}
        style={{ width: '100%', padding: '8px 10px', background: '#111', border: `1px solid ${erro ? '#FAC775' : '#444'}`, borderRadius: 6, fontSize: 13, color: '#fff' }}
      />
      {erro && (
        <p role="alert" style={{ color: '#FAC775', fontSize: 11, margin: '4px 0 0', lineHeight: 1.5 }}>{erro}</p>
      )}
    </div>
  )
}
