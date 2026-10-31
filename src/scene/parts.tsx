import { type ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { createContext, type ReactNode, useContext, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { type Root, createRoot } from 'react-dom/client'
import {
  CatmullRomCurve3,
  type Color,
  ConeGeometry,
  type Group,
  type InstancedMesh,
  Matrix4,
  Plane,
  Quaternion,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import type { V3 } from '../physics/vec'
import type { Interativo } from '../scenario/compile'
import type { Parametro } from '../scenario/schema'
import { useRun } from '../store'
import { C } from './colors'

/* ───────────────────────── contexto da cena ───────────────────────── */

export interface SceneInfo {
  /** Metros por unidade de cena. */
  escala: number
  /** Meia-aresta visível, em m. */
  half: number
  /** Tamanho visual de referência (m): ~1/12 da caixa. */
  u: number
  planoXY: boolean
  highlight: Set<string> | null
  /** O que cada objeto aceita (mover, arrastar parâmetro, girar). */
  interativos: Map<string, Interativo>
  unidade: 'm' | 'cm' | 'mm'
  parametros: Parametro[]
}

export const SceneCtx = createContext<SceneInfo>({
  escala: 1,
  half: 5,
  u: 0.4,
  planoXY: false,
  highlight: null,
  interativos: new Map(),
  unidade: 'm',
  parametros: [],
})
export const useScene = () => useContext(SceneCtx)

/** Opacidade de ênfase: objetos fora do destaque do passo ficam esmaecidos. */
export function useEmph(id: string) {
  const { highlight } = useScene()
  if (!highlight || highlight.size === 0) return 1
  return highlight.has(id) ? 1 : 0.28
}

/* ───────────────────────── rótulo ───────────────────────── */

/**
 * Rótulo HTML preso a um ponto da cena. Substitui o Html do drei: aquele
 * desmonta sua raiz React de forma síncrona no meio de uma renderização quando
 * o objeto some (trocar a fonte num lab), o que em produção derruba a árvore
 * com "removeChild ... not a child". Aqui a raiz é desmontada depois do commit,
 * e a posição é projetada a cada quadro sem passar pelo React.
 */
/**
 * Linha grossa com um só material por toda a vida; muda só a geometria, e só quando
 * os valores mudam. O <Line> do drei descarta o material a cada geometria nova, o
 * que religa o shader: em cena com relógio, era um por quadro.
 */
export function Linha({
  points,
  vertexColors,
  color,
  lineWidth,
  dashed = false,
  dashSize = 1,
  gapSize = 1,
  transparent = false,
  opacity = 1,
  toneMapped = true,
}: {
  points: [number, number, number][]
  vertexColors?: [number, number, number][]
  color?: Color
  lineWidth: number
  dashed?: boolean
  dashSize?: number
  gapSize?: number
  transparent?: boolean
  opacity?: number
  toneMapped?: boolean
}) {
  const linha = useMemo(() => new Line2(new LineGeometry(), new LineMaterial({ vertexColors: !!vertexColors })), [])
  useEffect(
    () => () => {
      linha.geometry.dispose()
      linha.material.dispose()
    },
    [linha],
  )
  const chave = JSON.stringify([points, vertexColors])
  useLayoutEffect(() => {
    const geo = new LineGeometry()
    geo.setPositions(points.flat())
    if (vertexColors) geo.setColors(vertexColors.flat())
    linha.geometry.dispose()
    linha.geometry = geo
    linha.computeLineDistances()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linha, chave])
  useLayoutEffect(() => {
    const m = linha.material
    if (color) m.color.copy(color)
    Object.assign(m, { linewidth: lineWidth, dashed, dashSize, gapSize, transparent, opacity, toneMapped })
  })
  return <primitive object={linha} />
}

export function Label({ at, children, center, className = '' }: { at: V3; children: ReactNode; center?: boolean; className?: string }) {
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const anchor = useRef<Group>(null)
  const mount = useRef<{ el: HTMLDivElement; root: Root } | null>(null)
  const content = <div className={`label3d ${center ? 'center' : ''} ${className}`}>{children}</div>
  const contentRef = useRef(content)
  contentRef.current = content

  useLayoutEffect(() => {
    // um elemento novo por montagem: no modo estrito o efeito roda duas vezes, e
    // a desmontagem adiada da anterior ainda não aconteceu
    const el = document.createElement('div')
    el.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;will-change:transform;z-index:1'
    ;(gl.domElement.parentNode as HTMLElement | null)?.appendChild(el)
    const root = createRoot(el)
    root.render(contentRef.current)
    mount.current = { el, root }
    return () => {
      mount.current = null
      // fora da fase de render: o React 19 não aceita desmontar uma raiz durante outra
      queueMicrotask(() => {
        root.unmount()
        el.remove()
      })
    }
  }, [gl])

  // só quando o conteúdo muda: rótulo de partícula re-renderiza a cada quadro
  useLayoutEffect(() => {
    mount.current?.root.render(contentRef.current)
  }, [children, center, className])

  const v = useMemo(() => new Vector3(), [])
  useFrame(() => {
    const g = anchor.current
    const el = mount.current?.el
    if (!g || !el) return
    g.getWorldPosition(v).project(camera)
    const visible = v.z > -1 && v.z < 1
    el.style.display = visible ? '' : 'none'
    if (!visible) return
    // perto da borda, o rótulo seria cortado pela cena, às vezes bem no valor
    const x = ((v.x + 1) / 2) * size.width
    const largura = el.offsetWidth
    const esquerda = center ? x - largura / 2 : x + 10
    const dx = Math.max(6 - esquerda, Math.min(0, size.width - 6 - esquerda - largura))
    el.style.transform = `translate3d(${x + dx}px, ${((1 - v.y) / 2) * size.height}px, 0)`
  })

  return <group ref={anchor} position={at as [number, number, number]} />
}

/* ───────────────────────── seta 3D ───────────────────────── */

const UP = new Vector3(0, 1, 0)

export function Arrow3D({
  from,
  dir,
  length,
  color,
  thickness,
  opacity = 1,
}: {
  from: V3
  dir: V3
  length: number
  color: Color
  thickness: number
  opacity?: number
}) {
  const l = Math.hypot(dir[0], dir[1], dir[2])
  const q = useMemo(() => {
    const d = new Vector3(dir[0], dir[1], dir[2]).normalize()
    return new Quaternion().setFromUnitVectors(UP, l > 0 ? d : UP)
  }, [dir, l])
  if (!(l > 0) || !(length > 0)) return null
  const head = Math.min(length * 0.4, thickness * 4.5)
  const shaft = Math.max(0, length - head)
  return (
    <group position={from as [number, number, number]} quaternion={q}>
      <mesh position={[0, shaft / 2, 0]}>
        <cylinderGeometry args={[thickness, thickness, shaft, 10]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent={opacity < 1} opacity={opacity} />
      </mesh>
      <mesh position={[0, shaft + head / 2, 0]}>
        <coneGeometry args={[thickness * 2.6, head, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent={opacity < 1} opacity={opacity} />
      </mesh>
    </group>
  )
}

/* ───────────────────────── tubo ao longo de pontos ───────────────────────── */

export function useTube(points: V3[], radius: number, closed = false, segmentsPerPoint = 2) {
  const geo = useMemo(() => {
    if (points.length < 2) return null
    const curve = new CatmullRomCurve3(
      points.map((p) => new Vector3(p[0], p[1], p[2])),
      closed,
      'catmullrom',
      0,
    )
    return new TubeGeometry(curve, Math.min(4000, points.length * segmentsPerPoint), radius, 8, closed)
  }, [points, radius, closed, segmentsPerPoint])
  useLayoutEffect(() => () => geo?.dispose(), [geo])
  return geo
}

/* ───────────────────────── pontos fluindo (corrente) ───────────────────────── */

const dotGeom = new SphereGeometry(1, 8, 6)

/**
 * Pontos que andam ao longo de uma poligonal, com velocidade proporcional a
 * `speed` (−1..1). Representam o sentido convencional da corrente.
 */
export function FlowDots({
  points,
  count,
  radius,
  speed,
  color,
  closed = false,
}: {
  points: V3[]
  count: number
  radius: number
  speed: number
  color: Color
  closed?: boolean
}) {
  const ref = useRef<InstancedMesh>(null)
  // só cresce: mudar a capacidade recria a malha, o que numa varredura seria a todo quadro
  const capacidade = useRef(count)
  capacidade.current = Math.max(capacidade.current, count)
  const playing = useRun((s) => s.playing)
  const reduced = useMemo(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, [])
  const { cum, total } = useMemo(() => {
    const cum = [0]
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1]
      const b = points[i]
      cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]))
    }
    return { cum, total: cum[cum.length - 1] }
  }, [points])
  const phase = useRef(0)
  const m = useMemo(() => new Matrix4(), [])
  const place = (offset: number) => {
    const mesh = ref.current
    if (!mesh || total <= 0) return
    for (let k = 0; k < count; k++) {
      let s = ((k / count) * total + offset) % total
      if (s < 0) s += total
      let i = 1
      while (i < cum.length - 1 && cum[i] < s) i++
      const a = points[i - 1]
      const b = points[i]
      const seg = cum[i] - cum[i - 1] || 1
      const f = (s - cum[i - 1]) / seg
      m.makeScale(radius, radius, radius)
      m.setPosition(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f)
      mesh.setMatrixAt(k, m)
    }
    mesh.count = count
    mesh.instanceMatrix.needsUpdate = true
  }
  useLayoutEffect(() => place(phase.current))
  useFrame((_, dt) => {
    // Corrente estacionária anda mesmo com o tempo pausado, salvo movimento reduzido.
    if (reduced && !playing) return
    phase.current += dt * speed * total * 0.12
    place(phase.current)
  })
  void closed
  if (count <= 0 || total <= 0) return null
  return (
    <instancedMesh ref={ref} args={[dotGeom, undefined, capacidade.current]} frustumCulled={false}>
      <meshBasicMaterial color={color} toneMapped={false} />
    </instancedMesh>
  )
}

/* ───────────────────────── arrastar ───────────────────────── */

/** Vibração curta em telas de toque: confirma pegar e cada degrau da grade. */
let lastBuzz = 0
export function buzz(ms = 6) {
  const now = performance.now()
  if (now - lastBuzz < 60) return
  lastBuzz = now
  navigator.vibrate?.(ms)
}

/** Formata uma coordenada SI na unidade da cena (cm, mm ou m). */
export function fmtCoord(v: number, unidade: 'm' | 'cm' | 'mm') {
  const f = unidade === 'cm' ? 100 : unidade === 'mm' ? 1000 : 1
  return (v * f).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
}

/**
 * Torna o conteúdo arrastável. O plano de arrasto é horizontal (ou o plano da
 * folha, nas cenas "xy"); com Shift, vertical de frente para a câmera. Com
 * `arraste`, o objeto anda só ao longo de um eixo e o movimento vira um
 * parâmetro (o slider acompanha). Snap de 1/10 da grade; Alt solta o snap.
 */
export function Draggable({ id, at, children }: { id: string; at: V3; enabled?: boolean; children: ReactNode }) {
  const { escala, planoXY, half, u, interativos, unidade, parametros } = useScene()
  const inter = interativos.get(id)
  const enabled = !!inter && (inter.mover || !!inter.arraste)
  const setOverride = useRun((s) => s.setOverride)
  const setParam = useRun((s) => s.setParam)
  const setDragging = useRun((s) => s.setDragging)
  const select = useRun((s) => s.select)
  const selected = useRun((s) => s.selected === id)
  const dragging = useRun((s) => s.dragging && s.selected === id)
  const camera = useThree((s) => s.camera)
  const drag = useRef<{ plane: Plane; offset: Vector3; start: Vector3; param0: number; last: string } | null>(null)

  const worldAt = () => new Vector3(at[0] / escala, at[1] / escala, at[2] / escala)

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    select(id)
    if (!enabled) return
    ;(e.target as unknown as Element).setPointerCapture?.(e.pointerId)
    const p = worldAt()
    let normal: Vector3
    if (e.shiftKey && !inter?.arraste) normal = camera.getWorldDirection(new Vector3()).setY(0).normalize().negate()
    else normal = planoXY ? new Vector3(0, 0, 1) : new Vector3(0, 1, 0)
    const plane = new Plane().setFromNormalAndCoplanarPoint(normal, p)
    const hit = e.ray.intersectPlane(plane, new Vector3()) ?? p.clone()
    // sem isso, um objeto em varredura pularia para o último valor do slider
    if (inter?.arraste) useRun.getState().assumir(inter.arraste.param)
    const param0 = inter?.arraste ? (useRun.getState().params[inter.arraste.param] ?? 0) : 0
    drag.current = { plane, offset: p.clone().sub(hit), start: hit.clone(), param0, last: '' }
    setDragging(true)
    buzz(8)
  }
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current
    if (!d) return
    e.stopPropagation()
    const hit = e.ray.intersectPlane(d.plane, new Vector3())
    if (!hit) return
    if (inter?.arraste) {
      const { param, eixo, fator } = inter.arraste
      const k = eixo === 'x' ? 0 : eixo === 'y' ? 1 : 2
      const delta = (hit.toArray()[k] - d.start.toArray()[k]) * escala * fator
      const def = parametros.find((p) => p.id === param)
      let v = d.param0 + delta
      if (def?.passo && !e.altKey) v = Math.round(v / def.passo) * def.passo
      if (def?.min !== undefined) v = Math.max(def.min, v)
      if (def?.max !== undefined) v = Math.min(def.max, v)
      const key = v.toPrecision(6)
      if (key !== d.last) {
        d.last = key
        setParam(param, Number(key))
        buzz(3)
      }
      return
    }
    hit.add(d.offset)
    const snap = e.altKey ? 0 : 0.1
    const lim = (half / escala) * 0.98
    const q = [hit.x, hit.y, hit.z].map((v) => {
      const s = snap ? Math.round(v / snap) * snap : v
      return Math.max(-lim, Math.min(lim, s)) * escala
    }) as unknown as V3
    const key = q.join(',')
    if (key !== d.last) {
      d.last = key
      setOverride(id, q)
      buzz(3)
    }
  }
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return
    ;(e.target as unknown as Element).releasePointerCapture?.(e.pointerId)
    drag.current = null
    setDragging(false)
  }

  return (
    <group
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = enabled ? 'grab' : 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
      }}
    >
      {children}
      {/* alvo de toque maior que o objeto visível (dedo, não mouse) */}
      {enabled && (
        <mesh position={at as [number, number, number]}>
          <sphereGeometry args={[u * 0.6, 12, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
      )}
      {selected && enabled && <SelectRing at={at} />}
      {dragging && <DragGuide at={at} unidade={unidade} planoXY={planoXY} />}
    </group>
  )
}

/** Prumo até o plano da grade e as coordenadas do objeto durante o arrasto. */
function DragGuide({ at, unidade, planoXY }: { at: V3; unidade: 'm' | 'cm' | 'mm'; planoXY: boolean }) {
  const { u } = useScene()
  const foot: V3 = planoXY ? [at[0], at[1], 0] : [at[0], 0, at[2]]
  const hasDrop = Math.hypot(at[0] - foot[0], at[1] - foot[1], at[2] - foot[2]) > u * 0.05
  return (
    <group>
      {hasDrop && (
        <mesh position={[(at[0] + foot[0]) / 2, (at[1] + foot[1]) / 2, (at[2] + foot[2]) / 2]} rotation={planoXY ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
          <cylinderGeometry args={[u * 0.008, u * 0.008, Math.hypot(at[0] - foot[0], at[1] - foot[1], at[2] - foot[2]), 6]} />
          <meshBasicMaterial color={C.accent} transparent opacity={0.6} toneMapped={false} />
        </mesh>
      )}
      <mesh position={foot as [number, number, number]} rotation={planoXY ? [0, 0, 0] : [-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[u * 0.12, u * 0.16, 32]} />
        <meshBasicMaterial color={C.accent} transparent opacity={0.8} toneMapped={false} side={2} />
      </mesh>
      <Label at={[at[0] + u * 0.5, at[1] + u * 0.5, at[2]]}>
        <span className="num">
          ({fmtCoord(at[0], unidade)}; {fmtCoord(at[1], unidade)}; {fmtCoord(at[2], unidade)}) {unidade}
        </span>
      </Label>
    </group>
  )
}

function SelectRing({ at }: { at: V3 }) {
  const { u, planoXY } = useScene()
  const ref = useRef<Group>(null)
  useFrame((s) => {
    if (ref.current) ref.current.rotation.z = s.clock.elapsedTime * 0.6
  })
  return (
    <group position={at as [number, number, number]} rotation={planoXY ? [0, 0, 0] : [-Math.PI / 2, 0, 0]}>
      <group ref={ref}>
        <mesh>
          <ringGeometry args={[u * 0.62, u * 0.68, 48, 1, 0, Math.PI * 1.6]} />
          <meshBasicMaterial color={C.accent} toneMapped={false} transparent opacity={0.9} side={2} />
        </mesh>
      </group>
    </group>
  )
}

export const cone = new ConeGeometry(1, 2.4, 14)
