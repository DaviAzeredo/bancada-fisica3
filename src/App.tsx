import { Component, type ReactNode, Suspense, lazy, use, useEffect, useMemo, useState } from 'react'
import { carregarLabs, carregarProva, figurasDe } from './content/registry'
import { Home } from './views/Home'
import { TopBar } from './views/Shell'

// A bancada (three.js, R3F, pós-processamento) só carrega quando se abre uma
// questão ou um lab: a página inicial fica leve.
const carregarBancada = () => import('./views/ScenarioView')
const ScenarioView = lazy(() => carregarBancada().then((m) => ({ default: m.ScenarioView })))
const Treino = lazy(() => import('./views/Treino').then((m) => ({ default: m.Treino })))

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash || '#/')
  useEffect(() => {
    const on = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

function Aviso({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <TopBar route="" />
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <div>
          <p className="mb-1 text-[16px] font-semibold text-text">{titulo}</p>
          <p className="text-[14px] text-text-2">{children}</p>
        </div>
      </div>
    </div>
  )
}

function NotFound({ titulo }: { titulo: string }) {
  return (
    <Aviso titulo={titulo}>
      O link pode estar desatualizado. <a className="text-accent underline underline-offset-4" href="#/">Voltar ao início</a>
    </Aviso>
  )
}

/**
 * Um chunk pode não chegar: sem rede ou, depois de publicar, numa aba aberta que
 * ainda pede os nomes antigos. Recarregar resolve os dois; repetir o import não
 * adianta, porque o navegador guarda a falha.
 */
class Limite extends Component<{ rota: string; children: ReactNode }, { falhou: boolean }> {
  state = { falhou: false }

  static getDerivedStateFromError() {
    return { falhou: true }
  }

  componentDidUpdate(antes: { rota: string }) {
    if (this.state.falhou && antes.rota !== this.props.rota) this.setState({ falhou: false })
  }

  render() {
    if (!this.state.falhou) return this.props.children
    return (
      <Aviso titulo="Não foi possível abrir esta página.">
        A conexão pode ter caído, ou o site foi atualizado.{' '}
        <button type="button" className="text-accent underline underline-offset-4" onClick={() => window.location.reload()}>
          Recarregar
        </button>
      </Aviso>
    )
  }
}

function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col bg-bg">
      <TopBar route="" />
      <div className="flex flex-1 items-center justify-center text-[13px] text-text-3" role="status">
        Carregando a bancada…
      </div>
    </div>
  )
}

function ProvaRota({ id, questao }: { id: string; questao?: string }) {
  const prova = use(carregarProva(id))
  if (!prova) return <NotFound titulo="Prova não encontrada." />
  const q = prova.questoes.find((x) => x.id === questao) ?? prova.questoes[0]
  if (!q) return <NotFound titulo="Questão não encontrada." />
  const nav = prova.questoes.map((x) => ({
    href: `#/prova/${prova.id}/${x.id}`,
    numero: x.numero,
    titulo: x.titulo,
    grupo: x.secao,
    active: x.id === q.id,
  }))
  const pts = q.pontos !== undefined ? ` · ${q.pontos.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} pt` : ''
  return (
    <ScenarioView
      key={`${prova.id}/${q.id}`}
      scenario={q}
      header={{ kicker: `${prova.titulo} · ${q.secao ? `${q.secao} ` : 'Questão '}${q.numero}${pts}`, route: 'prova', figuras: figurasDe(prova.id, q) }}
      nav={nav}
      navTitle={prova.titulo}
    />
  )
}

function LabRota({ id }: { id: string }) {
  const labs = use(carregarLabs())
  const lab = labs.find((l) => l.scenario.id === id)
  if (!lab) return <NotFound titulo="Laboratório não encontrado." />
  const nav = labs.map((l) => ({
    href: `#/lab/${l.scenario.id}`,
    numero: l.numero,
    titulo: l.scenario.titulo,
    grupo: l.grupo,
    active: l === lab,
  }))
  return <ScenarioView key={lab.scenario.id} scenario={lab.scenario} header={{ kicker: `Laboratório ${lab.numero} · ${lab.grupo}`, route: 'lab' }} nav={nav} navTitle="Laboratórios" />
}

export function App() {
  const hash = useHash()
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const [kind, a, b] = parts

  useEffect(() => {
    // as seções da página inicial rolam em Home, e este efeito roda depois do dela
    if (kind !== 'labs' && kind !== 'provas') window.scrollTo(0, 0)
  }, [hash])

  // a cena e o conteúdo baixam juntos, em vez de um esperar o outro
  if ((kind === 'prova' || kind === 'lab') && a) void carregarBancada()

  const view = useMemo(() => {
    if (kind === 'prova' && a) return <ProvaRota id={a} questao={b} />
    if (kind === 'lab' && a) return <LabRota id={a} />
    if (kind === 'treino') return <Treino secao={a} id={b} />
    return <Home focus={kind === 'labs' ? 'labs' : kind === 'provas' ? 'provas' : undefined} />
  }, [kind, a, b])

  return (
    <Limite rota={hash}>
      <Suspense fallback={<Loading />}>{view}</Suspense>
    </Limite>
  )
}
