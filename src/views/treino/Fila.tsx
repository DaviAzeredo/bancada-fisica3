import { Suspense, use, useState } from 'react'
import { carregarProva } from '../../content/registry'
import { type QuestaoBanco, fmt, tituloCurto } from '../../treino/banco'
import { filaDoTema, hojeISO, paraRevisar, useTreino } from '../../treino/progresso'
import { Alternatives } from '../../ui/Answers'
import { Button, Icon } from '../../ui/kit'
import { Autocorrecao, Enunciado, Fechamento, pontosDoItem } from './Questao'

function Cartao({ item, onProxima, ultima }: { item: QuestaoBanco; onProxima: () => void; ultima: boolean }) {
  const prova = use(carregarProva(item.provaId))
  const responder = useTreino((s) => s.responder)
  const [respondida, setRespondida] = useState(false)
  const [corrigindo, setCorrigindo] = useState(false)
  const [itens, setItens] = useState<Record<string, number>>({})
  const q = prova?.questoes.find((x) => x.id === item.questaoId)
  if (!prova || !q) return null

  const completa = q.respostas.every((r) => itens[r.item] !== undefined)
  const soma = q.respostas.reduce((s, r) => s + (itens[r.item] ?? 0), 0)
  const total = q.respostas.reduce((s, r) => s + pontosDoItem(q, r), 0)

  return (
    <article className="grid gap-4">
      <div>
        <p className="num text-[12.5px] text-text-3">
          {tituloCurto(prova)} · {q.secao} {q.numero} · {fmt(item.pontos)} pt
        </p>
        <h1 className="mt-1 text-[20px] font-semibold tracking-[-0.01em] text-text">{q.titulo}</h1>
      </div>
      <div>
        <Enunciado provaId={prova.id} q={q} />
      </div>
      {q.alternativas ? (
        <Alternatives
          alts={q.alternativas}
          onEscolha={(certa) => {
            responder(item.chave, certa ? 1 : 0)
            setRespondida(true)
          }}
        />
      ) : !corrigindo ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={() => setCorrigindo(true)}>
            Corrigir meu papel
          </Button>
          <span className="text-[13px] text-text-3">Resolva no papel antes de abrir a correção.</span>
        </div>
      ) : (
        <>
          <Autocorrecao q={q} valor={itens} onChange={(i, p) => setItens((v) => ({ ...v, [i]: p }))} />
          {!respondida && (
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                disabled={!completa}
                onClick={() => {
                  responder(item.chave, total ? soma / total : 0)
                  setRespondida(true)
                }}
              >
                Registrar {fmt(soma)} de {fmt(total)}
              </Button>
              {!completa && <span className="text-[13px] text-text-3">Dê pontos a todos os itens.</span>}
            </div>
          )}
        </>
      )}
      {respondida && (
        <>
          <Fechamento provaId={prova.id} q={q} />
          <div>
            <Button variant="primary" onClick={onProxima}>
              {ultima ? 'Terminar' : 'Próxima questão'} {Icon.next}
            </Button>
          </div>
        </>
      )}
    </article>
  )
}

export function Fila({ modo, titulo }: { modo: string; titulo: string }) {
  const questoes = useTreino((s) => s.questoes)
  // a fila se fixa ao abrir: responder não pode reordenar o que está na tela
  const [fila] = useState(() => (modo === 'revisao' ? paraRevisar(questoes, hojeISO()) : filaDoTema(modo, questoes)))
  const [i, setI] = useState(0)
  const atual = fila[i]
  const fim = i >= fila.length

  return (
    <div className="mx-auto max-w-[760px] py-8">
      <nav className="mb-6 flex flex-wrap items-baseline justify-between gap-2 text-[13px] text-text-3" aria-label="Treino">
        <span>
          <a href="#/treino" className="hover:text-text-2">
            Treino
          </a>{' '}
          / <span className="text-text-2">{titulo}</span>
        </span>
        {!fim && (
          <span className="num">
            {i + 1} de {fila.length}
          </span>
        )}
      </nav>
      {fim ? (
        <div>
          <h1 className="text-[20px] font-semibold text-text">{fila.length ? 'Fila terminada.' : 'Nada para fazer aqui agora.'}</h1>
          <p className="mt-2 text-[14px] leading-[1.6] text-text-2">
            {modo === 'revisao'
              ? 'As questões que você errou voltam depois de um dia, e as que acertou, depois de alguns dias.'
              : 'O que você errou volta sozinho na fila de revisão.'}
          </p>
          <a href="#/treino" className="mt-4 inline-flex h-9 items-center gap-2 rounded-[var(--radius-ctl)] bg-accent px-4 text-[13.5px] font-medium text-accent-ink">
            Voltar ao painel
          </a>
        </div>
      ) : (
        <Suspense fallback={<p className="text-[13px] text-text-3" role="status">Carregando a questão…</p>}>
          <Cartao
            key={atual.chave}
            item={atual}
            ultima={i === fila.length - 1}
            onProxima={() => {
              setI(i + 1)
              window.scrollTo(0, 0)
            }}
          />
        </Suspense>
      )}
    </div>
  )
}
