import { useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Vector3 } from 'three'
import { formatInline } from '../lib/format'
import { fieldB, fieldE, potentialV } from '../physics/sources'
import { type V3, cross, norm } from '../physics/vec'
import type { Ent, Resolved } from '../scenario/compile'
import { useRun } from '../store'
import { C } from './colors'
import { Arrow3D, Label, buzz, useScene } from './parts'

/* ───────────────────────── esfera envolvente ───────────────────────── */

/**
 * Esfera que contém o que importa na cena (em unidades de cena). Fontes
 * infinitas e campos uniformes não entram; partículas usam a caixa visível.
 */
export function sceneBounds(r: Resolved, escala: number, half: number): { c: V3; R: number } {
  const pts: { p: V3; r: number }[] = []
  const add = (p: V3, rad = 0) => pts.push({ p, r: rad })
  for (const e of r.ents) entBounds(e, add, half)
  if (!pts.length) return { c: [0, 0, 0], R: half / escala }
  const lo = [Infinity, Infinity, Infinity]
  const hi = [-Infinity, -Infinity, -Infinity]
  for (const { p, r: rad } of pts)
    for (let k = 0; k < 3; k++) {
      lo[k] = Math.min(lo[k], p[k] - rad)
      hi[k] = Math.max(hi[k], p[k] + rad)
    }
  const c: V3 = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2]
  let R = 0
  for (const { p, r: rad } of pts) R = Math.max(R, Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]) + rad)
  R = Math.max(R, half * 0.15)
  return { c: [c[0] / escala, c[1] / escala, c[2] / escala], R: (R / escala) * 1.08 }
}

function entBounds(e: Ent, add: (p: V3, r?: number) => void, half: number) {
  switch (e.tipo) {
    case 'carga':
    case 'sonda':
      return add(e.p, half * 0.05)
    case 'esfera':
      return add(e.c, e.R)
    case 'capacitor':
      return add(e.c, Math.hypot(e.hw, e.hh, e.d / 2))
    case 'capacitorRadial':
      return add(e.c, e.b * 1.1)
    case 'placa':
      return add(e.c, Math.hypot(e.hw, e.hh))
    case 'bobina':
      return e.draw.forEach((p) => add(p))
    case 'anelCarga':
      return e.pts.forEach((p) => add(p))
    case 'ima':
      return add(e.c, Math.hypot(e.L / 2, e.R))
    case 'fio':
      add(e.va)
      return add(e.vb)
    case 'condutor':
    case 'segmentoCarga':
    case 'cota':
      add(e.a)
      return add(e.b)
    case 'cilindroCorrente':
      return add(e.p, e.R)
    case 'cilindroInfinito':
      return add(e.p, Math.max(half * 0.1, e.R))
    case 'fioInfinito':
    case 'linhaInfinita':
      return add(e.p, half * 0.1)
    case 'gaussiana':
      return add(e.shape.c, e.shape.forma === 'esfera' ? e.shape.R : e.shape.forma === 'cubo' ? (e.shape.a * Math.sqrt(3)) / 2 : Math.hypot(e.shape.R, e.shape.H / 2))
    case 'amperiana':
      return add(e.circle.c, e.circle.R)
    case 'espiraSensora':
      return add(e.patch.c, e.patch.forma === 'disco' ? e.patch.R : Math.hypot(e.patch.hw, e.patch.hh))
    case 'circuito':
      return add(e.c, half * 0.55)
    case 'particula':
      return add([0, 0, 0], half * 0.85)
    case 'rotulo':
      return add(e.p)
    case 'seta':
      return add(e.o)
    default:
      return
  }
}

/* ───────────────────────── orientação ───────────────────────── */

/** Eixo/normal atual de uma entidade orientável (para girar a partir dele). */
export function orientOf(e: Ent | undefined): V3 | null {
  if (!e) return null
  switch (e.tipo) {
    case 'bobina':
    case 'ima':
    case 'capacitor':
    case 'planoInfinito':
      return e.n
    case 'fioInfinito':
    case 'cilindroCorrente':
    case 'linhaInfinita':
    case 'cilindroInfinito':
      return e.d
    case 'amperiana':
      return e.circle.n
    case 'espiraSensora':
      return e.patch.forma === 'disco' ? e.patch.n : cross(e.patch.u, e.patch.v)
    case 'gaussiana':
      return e.shape.forma === 'cilindro' ? e.shape.eixo : null
    default:
      return null
  }
}

/** Rotação de Rodrigues de v em torno do eixo unitário k. */
export function rotate(v: V3, k: V3, ang: number): V3 {
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  const kv = cross(k, v)
  const kd = k[0] * v[0] + k[1] * v[1] + k[2] * v[2]
  return norm([v[0] * c + kv[0] * s + k[0] * kd * (1 - c), v[1] * c + kv[1] * s + k[1] * kd * (1 - c), v[2] * c + kv[2] * s + k[2] * kd * (1 - c)])
}

/* ───────────────────────── teclado ───────────────────────── */

const isTyping = (t: EventTarget | null) => {
  const tag = (t as HTMLElement | null)?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/**
 * Setas movem o objeto selecionado no plano de arrasto, por eixos da grade e
 * relativas à câmera (→ é "para a direita na tela"); PgUp/PgDn mudam a altura;
 * Shift dá o passo fino. Q/E giram em torno da vertical, Z/X inclinam.
 * Esc solta a seleção; Delete remove objetos adicionados; F reenquadra.
 */
export function KeyboardMover({ r }: { r: Resolved }) {
  const camera = useThree((s) => s.camera)
  const scene = useScene()
  // o mundo e o contexto mudam a cada quadro; o listener é um só e lê as referências
  const rRef = useRef(r)
  rRef.current = r
  const sceneRef = useRef(scene)
  sceneRef.current = scene
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const { escala, planoXY, half, interativos, parametros } = sceneRef.current
      if (isTyping(ev.target) || ev.metaKey || ev.ctrlKey) return
      const st = useRun.getState()
      const id = st.selected
      if (!id) {
        if (ev.key === 'f' || ev.key === 'F') {
          st.requestFrame()
          ev.preventDefault()
        }
        return
      }
      if (ev.key === 'Escape') {
        st.select(null)
        return ev.preventDefault()
      }
      if ((ev.key === 'Delete' || ev.key === 'Backspace') && st.extras.some((x) => x.id === id)) {
        st.removeExtra(id)
        return ev.preventDefault()
      }
      const inter = interativos.get(id)
      if (!inter) return
      const fine = ev.shiftKey
      const dirKey = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[ev.key]

      if (inter.arraste && dirKey !== undefined) {
        const def = parametros.find((p) => p.id === inter.arraste!.param)
        st.assumir(inter.arraste.param)
        const cur = useRun.getState().params[inter.arraste.param] ?? 0
        const passo = (def?.passo ?? (def?.max !== undefined && def?.min !== undefined ? (def.max - def.min) / 100 : Math.abs(cur) * 0.05 || 0.01)) * (fine ? 0.1 : 1)
        let v = cur + dirKey * passo
        if (def?.min !== undefined) v = Math.max(def.min, v)
        if (def?.max !== undefined) v = Math.min(def.max, v)
        st.setParam(inter.arraste.param, Number(v.toPrecision(8)))
        buzz(3)
        return ev.preventDefault()
      }

      if (inter.mover) {
        const cell = (half / escala > 12 ? 1 : 0.5) * escala
        const stepLen = cell * (fine ? 0.1 : 0.5)
        const p = rRef.current.env.fns.pos(id) as V3
        // eixos da tela projetados no plano de arrasto e arredondados para um eixo da grade
        const fwd = camera.getWorldDirection(new Vector3())
        const right = new Vector3().crossVectors(fwd, camera.up).normalize()
        const snapAxis = (v: Vector3, allowed: number[]) => {
          const comps = [v.x, v.y, v.z]
          const k = allowed.reduce((a, b) => (Math.abs(comps[b]) > Math.abs(comps[a]) ? b : a), allowed[0])
          const out: [number, number, number] = [0, 0, 0]
          out[k] = Math.sign(comps[k]) || 1
          return out
        }
        let axis: [number, number, number] | null = null
        let sign = 1
        if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
          axis = snapAxis(right, planoXY ? [0, 1] : [0, 2])
          sign = ev.key === 'ArrowRight' ? 1 : -1
        } else if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
          axis = planoXY ? [0, 1, 0] : snapAxis(fwd, [0, 2])
          sign = ev.key === 'ArrowUp' ? 1 : -1
        } else if (ev.key === 'PageUp' || ev.key === 'PageDown') {
          axis = planoXY ? [0, 0, 1] : [0, 1, 0]
          sign = ev.key === 'PageUp' ? 1 : -1
        }
        if (axis) {
          const lim = half * 0.98
          const q = p.map((x, k) => {
            const moved = x + axis![k] * sign * stepLen
            const snapped = axis![k] ? Math.round(moved / stepLen) * stepLen : x
            return Math.max(-lim, Math.min(lim, snapped))
          }) as unknown as V3
          st.setOverride(id, q)
          buzz(3)
          return ev.preventDefault()
        }
      }

      if (inter.girar) {
        const n = orientOf(rRef.current.byId.get(id))
        if (!n) return
        const ang = ((fine ? 5 : 15) * Math.PI) / 180
        const up: V3 = planoXY ? [0, 0, 1] : [0, 1, 0]
        const right = new Vector3().crossVectors(camera.getWorldDirection(new Vector3()), camera.up).normalize()
        const k = { q: [up, 1], e: [up, -1], z: [[right.x, right.y, right.z], 1], x: [[right.x, right.y, right.z], -1] }[ev.key.toLowerCase()] as [V3, number] | undefined
        if (k) {
          st.setOrient(id, rotate(n, norm(k[0]), k[1] * ang))
          buzz(3)
          ev.preventDefault()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [camera])
  return null
}

/* ───────────────────────── sonda livre ───────────────────────── */

/**
 * Com a sonda ligada, o cursor sobre o plano da cena mostra o campo e o
 * potencial naquele ponto; um clique fixa uma sonda arrastável ali.
 */
export function CursorProbe({ r }: { r: Resolved }) {
  const { escala, planoXY, half, u, unidade } = useScene()
  const [p, setP] = useState<V3 | null>(null)
  const down = useRef<{ x: number; y: number } | null>(null)
  const hasE = r.world.e.length > 0
  const campo: 'E' | 'B' = hasE ? 'E' : 'B'
  const F = p ? (campo === 'E' ? fieldE(r.world, p) : fieldB(r.world, p)) : null
  const m = F ? Math.hypot(F[0], F[1], F[2]) : 0
  const V = p && hasE ? potentialV(r.world, p) : null
  const plane = planoXY ? { rotation: [0, 0, 0] as [number, number, number] } : { rotation: [-Math.PI / 2, 0, 0] as [number, number, number] }
  return (
    <group>
      <mesh
        {...plane}
        onPointerMove={(e) => {
          const w = e.point.clone().multiplyScalar(escala)
          setP([w.x, w.y, w.z])
        }}
        onPointerLeave={() => setP(null)}
        onPointerDown={(e) => {
          down.current = { x: e.clientX, y: e.clientY }
        }}
        onPointerUp={(e) => {
          const d = down.current
          down.current = null
          if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) return
          e.stopPropagation()
          const w = e.point.clone().multiplyScalar(escala)
          useRun.getState().addProbe([w.x, w.y, w.z], campo)
          buzz(8)
        }}
      >
        <planeGeometry args={[2 * half, 2 * half]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      {p && F && m > 0 && (
        <group>
          <Arrow3D from={p} dir={F} length={u * 1.1} thickness={u * 0.025} color={campo === 'E' ? C.fieldE : C.fieldB} />
          <Label at={[p[0] + u * 0.3, p[1] + u * 0.3, p[2]]}>
            <span className="num">
              {campo} = {formatInline(m, campo === 'E' ? 'V/m' : 'T')}
              {V !== null && (
                <>
                  <br />V = {formatInline(V, 'V')}
                </>
              )}
              <br />
              <span className="text-text-3">
                ({fmt(p[0], unidade)}; {fmt(p[1], unidade)}; {fmt(p[2], unidade)}) {unidade}
              </span>
            </span>
          </Label>
        </group>
      )}
    </group>
  )
}

const fmt = (v: number, unidade: 'm' | 'cm' | 'mm') =>
  (v * (unidade === 'cm' ? 100 : unidade === 'mm' ? 1000 : 1)).toLocaleString('pt-BR', { maximumFractionDigits: 1 })
