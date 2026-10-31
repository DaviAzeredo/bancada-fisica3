import { Edges, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type ComponentProps, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import {
  BoxGeometry,
  BufferAttribute,
  type BufferGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  type InstancedMesh,
  type InterleavedBufferAttribute,
  Matrix4,
  type Mesh,
  Quaternion,
  RingGeometry,
  SphereGeometry,
  Vector3,
} from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { circuitAt } from '../physics/dynamics'
import { fluxParts } from '../physics/integrals'
import { type World, fieldB, fieldE } from '../physics/sources'
import { type V3, add, basis, cross, dot, len, madd, norm, scale, sub } from '../physics/vec'
import { formatInline } from '../lib/format'
import type { Ent, Resolved } from '../scenario/compile'
import { MAX_TRAIL } from '../scenario/sim'
import { simRef, useRun } from '../store'
import { C, diverging, roleColor, signColor } from './colors'
import { Arrow3D, Draggable, FlowDots, Label, Linha, useEmph, useScene, useTube } from './parts'

const UP = new Vector3(0, 1, 0)
const quatTo = (d: V3) => new Quaternion().setFromUnitVectors(UP, new Vector3(...norm(d)))
const tup = (v: V3) => v as unknown as [number, number, number]

/* ───────────────────────── cargas ───────────────────────── */

function Charge({ e, qmax }: { e: Extract<Ent, { tipo: 'carga' }>; qmax: number }) {
  const { u } = useScene()
  const o = useEmph(e.id)
  const selected = useRun((s) => s.selected === e.id)
  const r = u * 0.26 * (0.75 + 0.45 * Math.sqrt(Math.abs(e.q) / (qmax || 1)))
  const col = signColor(e.q)
  return (
    <Draggable id={e.id} at={e.p} enabled={e.arrastavel}>
      <group position={tup(e.p)}>
        <mesh castShadow>
          <sphereGeometry args={[r, 40, 28]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.55} roughness={0.35} metalness={0.05} transparent={o < 1} opacity={o} />
        </mesh>
        {/* sinal gravado na esfera */}
        <mesh>
          <boxGeometry args={[r * 1.1, r * 0.16, r * 0.16]} />
          <meshBasicMaterial color={C.bg} transparent opacity={0.85 * o} />
        </mesh>
        {e.q > 0 && (
          <mesh>
            <boxGeometry args={[r * 0.16, r * 1.1, r * 0.16]} />
            <meshBasicMaterial color={C.bg} transparent opacity={0.85 * o} />
          </mesh>
        )}
      </group>
      {(e.rotulo || selected) && (
        <Label at={add(e.p, [r * 0.9, r * 0.9, 0])}>
          {e.rotulo && <span>{e.rotulo} </span>}
          <span className="num">{formatInline(e.q, 'C')}</span>
        </Label>
      )}
    </Draggable>
  )
}

/* ───────────────────────── distribuições ───────────────────────── */

/** Cinza de metal para condutores neutros (Q = 0), que não têm sinal a mostrar. */
const METAL = '#8f98a8'

function ChargedTube({ id, pts, value, closed, rotulo, unit }: { id: string; pts: V3[]; value: number; closed?: boolean; rotulo?: string; unit: string }) {
  const { u } = useScene()
  const o = useEmph(id)
  const geo = useTube(pts, u * 0.06, closed && pts.length > 3 ? false : false, 3)
  const col = value === 0 ? METAL : signColor(value)
  return (
    <group>
      {geo && (
        <mesh geometry={geo}>
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.5} roughness={0.4} transparent={o < 1} opacity={o} />
        </mesh>
      )}
      {rotulo && (
        <Label at={pts[Math.floor(pts.length / 4)]}>
          {rotulo} <span className="num">{formatInline(value, unit)}</span>
        </Label>
      )}
    </group>
  )
}

function Plate({ c, u, v, hw, hh, sigma, thick, opacity = 1, circular = false }: { c: V3; u: V3; v: V3; hw: number; hh: number; sigma: number; thick: number; opacity?: number; circular?: boolean }) {
  const n = cross(u, v)
  const q = useMemo(() => {
    const m = new Matrix4().makeBasis(new Vector3(...u), new Vector3(...v), new Vector3(...n))
    return new Quaternion().setFromRotationMatrix(m)
  }, [u, v, n])
  const col = signColor(sigma)
  const material = (
    <meshStandardMaterial
      color={new Color().copy(col).lerp(C.surface, 0.35)}
      emissive={col}
      emissiveIntensity={0.18}
      roughness={0.28}
      metalness={0.75}
      envMapIntensity={1.2}
      transparent={opacity < 1}
      opacity={opacity}
    />
  )
  return (
    <group position={tup(c)} quaternion={q}>
      {circular ? (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[hw, hw, thick, 64]} />
          {material}
        </mesh>
      ) : (
        <RoundedBox args={[2 * hw, 2 * hh, thick]} radius={Math.min(thick * 0.45, Math.min(hw, hh) * 0.04)} smoothness={3}>
          {material}
        </RoundedBox>
      )}
      <SignDots hw={circular ? hw * 0.68 : hw} hh={circular ? hh * 0.68 : hh} sigma={sigma} z={thick * 0.6} opacity={opacity} />
    </group>
  )
}

/** Grade de sinais ± sobre uma superfície carregada (no referencial local). */
function SignDots({ hw, hh, sigma, z, opacity = 1, density = 9 }: { hw: number; hh: number; sigma: number; z: number; opacity?: number; density?: number }) {
  const ref = useRef<InstancedMesh>(null)
  const nu = Math.max(2, Math.round(density * Math.min(1, hw / Math.max(hw, hh))))
  const nv = Math.max(2, Math.round(density * Math.min(1, hh / Math.max(hw, hh))))
  const count = nu * nv * 2
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const m = new Matrix4()
    const r = Math.min(hw, hh) * 0.016
    let k = 0
    for (let i = 0; i < nu; i++)
      for (let j = 0; j < nv; j++) {
        const x = -hw + ((i + 0.5) / nu) * 2 * hw
        const y = -hh + ((j + 0.5) / nv) * 2 * hh
        for (const side of [-1, 1]) {
          m.makeScale(r, r, r)
          m.setPosition(x, y, side * z)
          mesh.setMatrixAt(k++, m)
        }
      }
    mesh.count = k
    mesh.instanceMatrix.needsUpdate = true
  }, [hw, hh, z, nu, nv])
  if (Math.abs(sigma) < 1e-30) return null
  return (
    <instancedMesh ref={ref} args={[dotGeo, undefined, count]}>
      <meshBasicMaterial color={signColor(sigma)} toneMapped={false} transparent opacity={0.9 * opacity} />
    </instancedMesh>
  )
}
const dotGeo = new SphereGeometry(1, 8, 6)

/**
 * Coroa circular escrita no lugar. Com `ringGeometry` e tamanhos novos a cada quadro,
 * a biblioteca só libera a geometria velha com a página ociosa, o que nunca acontece com
 * a cena andando: os buffers se acumulam na GPU. Pelo mesmo motivo, o que muda de tamanho
 * numa varredura usa geometria de tamanho 1 e `scale`.
 */
function Coroa({ r0, r1, ini = 0, abertura = 2 * Math.PI, segmentos = 96, children, ...malha }: { r0: number; r1: number; ini?: number; abertura?: number; segmentos?: number } & ComponentProps<'mesh'>) {
  const geo = useMemo(() => new RingGeometry(1, 2, segmentos, 1), [segmentos])
  useLayoutEffect(() => () => geo.dispose(), [geo])
  useLayoutEffect(() => {
    const pos = geo.getAttribute('position') as BufferAttribute
    for (let j = 0; j <= 1; j++)
      for (let i = 0; i <= segmentos; i++) {
        const r = j ? r1 : r0
        const t = ini + (i / segmentos) * abertura
        pos.setXYZ(j * (segmentos + 1) + i, r * Math.cos(t), r * Math.sin(t), 0)
      }
    pos.needsUpdate = true
    geo.computeBoundingSphere()
  }, [geo, r0, r1, ini, abertura, segmentos])
  return (
    <mesh geometry={geo} {...malha}>
      {children}
    </mesh>
  )
}

function Capacitor({ e }: { e: Extract<Ent, { tipo: 'capacitor' }> }) {
  const o = useEmph(e.id)
  const sigma = e.Q / (e.circular ? Math.PI * e.hw * e.hw : 4 * e.hw * e.hh)
  // fixa ao montar: placa que afina junto com `d` refaria a geometria a cada quadro
  const thick = useRef(e.d * 0.06).current
  const nq = useMemo(() => {
    const m = new Matrix4().makeBasis(new Vector3(...e.u), new Vector3(...e.v), new Vector3(...e.n))
    return new Quaternion().setFromRotationMatrix(m)
  }, [e.u, e.v, e.n])
  return (
    <group>
      <Plate c={madd(e.c, e.n, -e.d / 2 - thick / 2)} u={e.u} v={e.v} hw={e.hw} hh={e.hh} sigma={sigma} thick={thick} opacity={o} circular={e.circular} />
      <Plate c={madd(e.c, e.n, e.d / 2 + thick / 2)} u={e.u} v={e.v} hw={e.hw} hh={e.hh} sigma={-sigma} thick={thick} opacity={o} circular={e.circular} />
      {(() => {
        // blocos de placa a placa, um ao lado do outro ao longo de u
        let ini = -e.hw
        return e.lats.map((l, i) => {
          const w = 2 * e.hw * l.f
          const meio = ini + w / 2
          ini += w
          return (
            <group key={i}>
              <group position={tup(madd(e.c, e.u, meio))} quaternion={nq}>
                <mesh renderOrder={2} scale={[w * 0.995, 2 * e.hh * 0.995, e.d * 0.995]}>
                  <boxGeometry />
                  <meshPhysicalMaterial color={C.dielectric} transparent opacity={(0.1 + 0.07 * l.K) * o} roughness={0.15} depthWrite={false} side={DoubleSide} />
                </mesh>
              </group>
              <Label at={madd(madd(e.c, e.u, meio), e.v, e.hh * 1.12)} center>
                K{i + 1} <span className="num">= {l.K.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
              </Label>
            </group>
          )
        })
      })()}
      {e.diels.map((d, i) => (
        <group key={i}>
          <group position={tup(madd(e.c, e.n, -e.d / 2 + (d.z0 + d.z1) / 2))} quaternion={nq}>
            <mesh renderOrder={2} scale={[2 * e.hw * 0.995, 2 * e.hh * 0.995, d.z1 - d.z0]}>
              <boxGeometry />
              <meshPhysicalMaterial
                color={d.metal ? METAL : C.dielectric}
                transparent
                opacity={(d.metal ? 0.6 : e.diels.length > 1 ? 0.14 + 0.05 * d.K : 0.22) * o}
                roughness={d.metal ? 0.35 : 0.15}
                metalness={d.metal ? 0.7 : 0}
                depthWrite={false}
                side={DoubleSide}
              />
            </mesh>
            <mesh scale={[2 * e.hw * 0.995, 2 * e.hh * 0.995, d.z1 - d.z0]}>
              <boxGeometry />
              <meshBasicMaterial color={C.dielectric} wireframe transparent opacity={0.08 * o} />
            </mesh>
            {/* cargas de polarização: − perto da placa +, + perto da placa − */}
            <group position={[0, 0, -(d.z1 - d.z0) / 2]}>
              <SignDots hw={e.hw * 0.9} hh={e.hh * 0.9} sigma={-sigma} z={e.d * 0.012} opacity={0.55 * o} density={6} />
            </group>
            <group position={[0, 0, (d.z1 - d.z0) / 2]}>
              <SignDots hw={e.hw * 0.9} hh={e.hh * 0.9} sigma={sigma} z={e.d * 0.012} opacity={0.55 * o} density={6} />
            </group>
          </group>
          <Label at={madd(madd(e.c, e.n, -e.d / 2 + (d.z0 + d.z1) / 2), e.u, e.hw * 1.12)} center>
            {d.metal ? (
              'lâmina condutora'
            ) : (
              <>
                {e.diels.length > 1 ? `K${i + 1}` : 'dielétrico'} <span className="num">{e.diels.length > 1 ? '' : 'K '}= {d.K.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
              </>
            )}
          </Label>
        </group>
      ))}
      {e.rotulo && (
        <Label at={madd(e.c, e.v, e.hh * 1.25)} center>
          {e.rotulo}
        </Label>
      )}
      <Label at={madd(madd(e.c, e.n, -e.d / 2 - thick), e.v, -e.hh * 1.08)} center>
        <span className="num">+{formatInline(Math.abs(e.Q), 'C')}</span>
      </Label>
      <Label at={madd(madd(e.c, e.n, e.d / 2 + thick), e.v, -e.hh * 1.08)} center>
        <span className="num">−{formatInline(Math.abs(e.Q), 'C')}</span>
      </Label>
    </group>
  )
}

/**
 * Capacitor esférico ou cilíndrico em corte, como nas figuras do curso: o plano da
 * seção mostra condutores, cascas e setores; atrás fica a metade da esfera, ou o tubo.
 */
function CapacitorRadial({ e }: { e: Extract<Ent, { tipo: 'capacitorRadial' }> }) {
  const o = useEmph(e.id)
  const { half } = useScene()
  const esf = e.forma === 'esfera'
  const q = useMemo(() => new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(...e.n)), [e.n])
  const Lv = Math.min(e.L, 1.5 * half)
  const secao = esf ? 0 : Lv / 2
  const espessura = (e.b - e.a) * 0.08
  // ângulo (a partir de +y) em que termina cada setor: em área na esfera, em arco no cilindro
  const fim = (f: number) => (esf ? Math.acos(1 - 2 * f) : Math.PI * f)
  let acumulado = 0
  const setores = e.setores.map((s) => {
    const t0 = fim(acumulado)
    acumulado = Math.min(1, acumulado + s.f)
    return { K: s.K, t0, t1: fim(acumulado) }
  })
  const rotuloK = (K: number) => K.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  const metal = { color: METAL, metalness: 0.8, roughness: 0.32, side: DoubleSide } as const
  return (
    <group position={tup(e.c)} quaternion={q}>
      {esf ? (
        <>
          <mesh renderOrder={1} scale={e.b}>
            <sphereGeometry args={[1, 64, 32, Math.PI, Math.PI]} />
            <meshStandardMaterial {...metal} transparent opacity={0.22 * o} depthWrite={false} />
          </mesh>
          <mesh renderOrder={1} scale={e.a}>
            <sphereGeometry args={[1, 48, 24, Math.PI, Math.PI]} />
            <meshStandardMaterial {...metal} transparent opacity={0.6 * o} depthWrite={false} />
          </mesh>
        </>
      ) : (
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh renderOrder={1} scale={[e.b, Lv, e.b]}>
            <cylinderGeometry args={[1, 1, 1, 64, 1, true]} />
            <meshStandardMaterial {...metal} transparent opacity={0.18 * o} depthWrite={false} />
          </mesh>
          <mesh renderOrder={1} scale={[e.a, Lv, e.a]}>
            <cylinderGeometry args={[1, 1, 1, 48, 1, true]} />
            <meshStandardMaterial {...metal} transparent opacity={0.5 * o} depthWrite={false} />
          </mesh>
        </group>
      )}
      <group position={[0, 0, secao]}>
        <Coroa r0={e.a - espessura} r1={e.a} renderOrder={3}>
          <meshStandardMaterial color={C.pos} emissive={C.pos} emissiveIntensity={0.3} transparent opacity={o} side={DoubleSide} />
        </Coroa>
        <Coroa r0={e.b} r1={e.b + espessura} renderOrder={3}>
          <meshStandardMaterial color={C.neg} emissive={C.neg} emissiveIntensity={0.3} transparent opacity={o} side={DoubleSide} />
        </Coroa>
        {e.camadas.map((m, i) => (
          <Coroa key={i} r0={m.r0} r1={m.r1} renderOrder={2}>
            <meshBasicMaterial color={C.dielectric} transparent opacity={(0.1 + 0.07 * m.K) * o} side={DoubleSide} depthWrite={false} toneMapped={false} />
          </Coroa>
        ))}
        {setores.flatMap((s, i) =>
          [Math.PI / 2 + s.t0, Math.PI / 2 - s.t1].map((ini, k) => (
            <Coroa key={`${i}-${k}`} r0={e.a} r1={e.b} ini={ini} abertura={s.t1 - s.t0} renderOrder={2}>
              <meshBasicMaterial color={C.dielectric} transparent opacity={(0.1 + 0.07 * s.K) * o} side={DoubleSide} depthWrite={false} toneMapped={false} />
            </Coroa>
          )),
        )}
        {e.camadas.map((m, i) => (
          <Label key={i} at={[0, -(m.r0 + m.r1) / 2, 0]} center>
            K{e.camadas.length > 1 ? i + 1 : ''} <span className="num">= {rotuloK(m.K)}</span>
          </Label>
        ))}
        {setores.map((s, i) => {
          const t = (s.t0 + s.t1) / 2
          const r = (e.a + e.b) / 2
          return (
            <Label key={i} at={[r * Math.sin(t), r * Math.cos(t), 0]} center>
              K{i + 1} <span className="num">= {rotuloK(s.K)}</span>
            </Label>
          )
        })}
        <Label at={[0, 0, 0]} center>
          <span className="num">+{formatInline(Math.abs(e.Q), 'C')}</span>
        </Label>
        <Label at={[e.b * 0.72, e.b * 0.82, 0]}>
          <span className="num">−{formatInline(Math.abs(e.Q), 'C')}</span>
        </Label>
      </group>
    </group>
  )
}

function Sphere({ e }: { e: Extract<Ent, { tipo: 'esfera' }> }) {
  const o = useEmph(e.id)
  const { planoXY } = useScene()
  const neutro = e.Q === 0
  const col = neutro ? METAL : signColor(e.Q)
  const label = e.rotulo && (
    <Label at={add(e.c, [e.R * 0.75, e.R * 0.75, 0])}>
      {e.rotulo} {!neutro && <span className="num">{formatInline(e.Q, 'C')}</span>}
    </Label>
  )
  // camada grossa vista de frente: corte no plano z = 0, como nas figuras de
  // prova; atrás fica só a metade z < 0, e a seção do material é um anel
  if (planoXY && !e.oca && e.Rin > 0)
    return (
      <Draggable id={e.id} at={e.c} enabled={e.arrastavel}>
        <group position={tup(e.c)}>
          <mesh renderOrder={1} scale={e.R}>
            <sphereGeometry args={[1, 64, 32, Math.PI, Math.PI]} />
            <meshStandardMaterial color={col} transparent opacity={0.22 * o} roughness={0.5} metalness={neutro ? 0.5 : 0} depthWrite={false} side={DoubleSide} />
          </mesh>
          <mesh renderOrder={1} scale={e.Rin}>
            <sphereGeometry args={[1, 48, 24, Math.PI, Math.PI]} />
            <meshStandardMaterial color="#0b0d12" transparent opacity={0.5 * o} roughness={0.8} depthWrite={false} side={DoubleSide} />
          </mesh>
          <Coroa r0={e.Rin} r1={e.R} segmentos={128} renderOrder={2}>
            <meshPhysicalMaterial
              color={col}
              emissive={col}
              emissiveIntensity={neutro ? 0.05 : 0.2}
              metalness={neutro ? 0.6 : 0}
              roughness={0.35}
              transparent
              opacity={0.62 * o}
              depthWrite={false}
              side={DoubleSide}
            />
          </Coroa>
        </group>
        {label}
      </Draggable>
    )
  return (
    <Draggable id={e.id} at={e.c} enabled={e.arrastavel}>
      <group position={tup(e.c)}>
        <mesh renderOrder={2} scale={e.R}>
          <sphereGeometry args={[1, 64, 40]} />
          <meshPhysicalMaterial
            color={col}
            emissive={col}
            emissiveIntensity={neutro ? 0.04 : e.oca ? 0.08 : 0.25}
            metalness={neutro ? 0.6 : 0}
            transparent
            opacity={(e.oca ? 0.16 : neutro ? 0.3 : 0.42) * o}
            roughness={0.3}
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
        <mesh scale={e.R * 1.001}>
          <sphereGeometry args={[1, 24, 14]} />
          <meshBasicMaterial color={col} wireframe transparent opacity={0.18 * o} toneMapped={false} />
        </mesh>
        {/* camada grossa: a cavidade aparece como uma esfera escura dentro */}
        {!e.oca && e.Rin > 0 && (
          <mesh renderOrder={1} scale={e.Rin}>
            <sphereGeometry args={[1, 48, 32]} />
            <meshStandardMaterial color="#0b0d12" transparent opacity={0.55 * o} roughness={0.8} depthWrite={false} side={DoubleSide} />
          </mesh>
        )}
      </group>
      {label}
    </Draggable>
  )
}

/** Condutor maciço ou oco com corrente axial: corpo translúcido e seção em z local = 0. */
function CurrentCylinder({ e }: { e: Extract<Ent, { tipo: 'cilindroCorrente' }> }) {
  const { half } = useScene()
  const o = useEmph(e.id)
  const L = half * 2.4
  const secao = useEmSecao(e.d, e.R)
  if (secao)
    return (
      <group>
        <Secao p={e.p} R={e.R} Rin={e.Rin} cor={C.copper} o={o} metal={0.4} />
        {e.rotulo && (
          <Label at={add(e.p, [e.R * 0.72, e.R * 0.72, 0])}>
            {e.rotulo} <span className="num">{formatInline(Math.abs(e.I), 'A')}</span>
          </Label>
        )}
      </group>
    )
  return (
    <group position={tup(e.p)} quaternion={quatTo(e.d)}>
      <mesh renderOrder={1}>
        <cylinderGeometry args={[e.R, e.R, L, 64, 1, true]} />
        <meshStandardMaterial color={C.copper} emissive={C.copperDark} emissiveIntensity={0.25} metalness={0.5} roughness={0.4} transparent opacity={0.28 * o} depthWrite={false} side={DoubleSide} />
      </mesh>
      {e.Rin > e.R * 1e-3 && (
        <mesh renderOrder={1}>
          <cylinderGeometry args={[e.Rin, e.Rin, L, 48, 1, true]} />
          <meshStandardMaterial color="#0b0d12" transparent opacity={0.4 * o} depthWrite={false} side={DoubleSide} />
        </mesh>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <ringGeometry args={[e.Rin, e.R, 96, 1]} />
        <meshStandardMaterial color={C.copper} emissive={C.copperDark} emissiveIntensity={0.35} metalness={0.4} roughness={0.5} transparent opacity={0.5 * o} depthWrite={false} side={DoubleSide} />
      </mesh>
      {e.rotulo && (
        <Label at={[e.R * 0.8, 0, -e.R * 0.8]}>
          {e.rotulo} <span className="num">{formatInline(Math.abs(e.I), 'A')}</span>
        </Label>
      )}
    </group>
  )
}

/** Cena de frente com o eixo ao longo de z: o cilindro aparece em corte, como nas figuras de prova. */
function useEmSecao(d: V3, R: number) {
  const { planoXY, u } = useScene()
  return planoXY && Math.abs(norm(d)[2]) > 0.99 && R > u * 0.1
}

/** Seção transversal: uma coroa de Rin a R no plano z do ponto. */
function Secao({ p, R, Rin, cor, o, metal = 0 }: { p: V3; R: number; Rin: number; cor: Color | string; o: number; metal?: number }) {
  return (
    <mesh position={tup(p)} renderOrder={2}>
      <ringGeometry args={[Math.min(Rin, R * 0.975), R, 128, 1]} />
      <meshPhysicalMaterial color={cor} emissive={cor} emissiveIntensity={0.18} metalness={metal} roughness={0.4} transparent opacity={0.6 * o} depthWrite={false} side={DoubleSide} />
    </mesh>
  )
}

function InfiniteLine({ id, p, d, value, R, Rin = 0, rotulo, unit }: { id: string; p: V3; d: V3; value: number; R: number; Rin?: number; rotulo?: string; unit: string }) {
  const { half } = useScene()
  const o = useEmph(id)
  const col = value === 0 ? METAL : signColor(value)
  const L = half * 2.4
  const secao = useEmSecao(d, R)
  return (
    <group>
      {secao ? (
        <Secao p={p} R={R} Rin={Rin} cor={col} o={o} metal={value === 0 ? 0.5 : 0} />
      ) : (
        <mesh position={tup(p)} quaternion={quatTo(d)}>
          <cylinderGeometry args={[R, R, L, 32, 1, true]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.35} transparent opacity={0.55 * o} roughness={0.3} side={DoubleSide} />
        </mesh>
      )}
      {rotulo && (
        <Label at={secao ? add(p, [R * 0.72, R * 0.72, 0]) : madd(p, norm(d), half * 0.75)}>
          {rotulo} <span className="num">{formatInline(value, unit)}</span>
        </Label>
      )}
    </group>
  )
}

function InfinitePlane({ e }: { e: Extract<Ent, { tipo: 'planoInfinito' }> }) {
  const { half } = useScene()
  const o = useEmph(e.id)
  const [u, v] = basis(e.n)
  return (
    <group>
      <Plate c={e.p} u={u} v={v} hw={half * 1.05} hh={half * 1.05} sigma={e.sigma} thick={half * 0.004} opacity={0.45 * o} />
      {e.rotulo && (
        <Label at={madd(e.p, u, half * 0.8)}>
          {e.rotulo} <span className="num">{formatInline(e.sigma, 'C/m²')}</span>
        </Label>
      )}
    </group>
  )
}

/* ───────────────────────── correntes ───────────────────────── */

function Wire({ id, a, b, I, rotulo, infinite }: { id: string; a: V3; b: V3; I: number; rotulo?: string; infinite?: boolean }) {
  const { u } = useScene()
  const o = useEmph(id)
  const highlighted = useScene().highlight?.has(id)
  const d = sub(b, a)
  const L = len(d)
  const mid = scale(add(a, b), 0.5)
  const flow = useMemo(() => (I >= 0 ? [a, b] : [b, a]), [a, b, I])
  const Imax = 20
  return (
    <group>
      <mesh position={tup(mid)} quaternion={quatTo(d)} scale={[u * 0.07, L, u * 0.07]}>
        <cylinderGeometry args={[1, 1, 1, 16]} />
        <meshStandardMaterial
          color={C.copper}
          emissive={highlighted ? C.accent : C.copperDark}
          emissiveIntensity={highlighted ? 0.6 : 0.15}
          metalness={0.85}
          roughness={0.32}
          transparent={o < 1}
          opacity={o}
        />
      </mesh>
      {Math.abs(I) > 0 && (
        <FlowDots
          points={flow}
          count={Math.max(3, Math.round(L / (u * 0.9)))}
          radius={u * 0.085}
          speed={Math.min(1, Math.abs(I) / Imax + 0.25) * (infinite ? 0.5 : 1)}
          color={new Color().copy(C.copper).lerp(C.text, 0.55)}
        />
      )}
      {rotulo && (
        <Label at={madd(mid, norm(d), L * (infinite ? 0.35 : 0.1))}>
          {rotulo} <span className="num">{formatInline(Math.abs(I), 'A')}</span>
        </Label>
      )}
    </group>
  )
}

function Coil({ e }: { e: Extract<Ent, { tipo: 'bobina' }> }) {
  const { u } = useScene()
  const o = useEmph(e.id)
  const r = e.sub === 'espira' ? u * 0.07 : Math.min(u * 0.05, e.R * 0.06)
  const geo = useTube(e.draw, r, false, e.sub === 'espira' ? 3 : 1)
  const flow = useMemo(() => (e.I >= 0 ? e.draw : [...e.draw].reverse()), [e.draw, e.I])
  return (
    <Draggable id={e.id} at={e.c} enabled={e.arrastavel}>
      {geo && (
        <mesh geometry={geo}>
          <meshStandardMaterial color={C.copper} emissive={C.copperDark} emissiveIntensity={0.15} metalness={0.85} roughness={0.3} transparent={o < 1} opacity={o} />
        </mesh>
      )}
      {Math.abs(e.I) > 0 && (
        <FlowDots
          points={flow}
          count={e.sub === 'espira' ? 14 : Math.min(160, Math.round(e.draw.length / 6))}
          radius={r * 1.15}
          speed={0.08 + Math.min(0.3, Math.abs(e.I) / 50)}
          color={new Color().copy(C.copper).lerp(C.text, 0.55)}
        />
      )}
      {e.rotulo && (
        <Label at={madd(e.c, basis(e.n)[0], e.R * 1.25)}>
          {e.rotulo} <span className="num">{formatInline(Math.abs(e.I), 'A')}</span>
        </Label>
      )}
    </Draggable>
  )
}

function Magnet({ e }: { e: Extract<Ent, { tipo: 'ima' }> }) {
  const o = useEmph(e.id)
  const q = quatTo(e.n)
  return (
    <Draggable id={e.id} at={e.c} enabled={e.arrastavel}>
      <group position={tup(e.c)} quaternion={q}>
        <mesh position={[0, e.L / 4, 0]}>
          <cylinderGeometry args={[e.R, e.R, e.L / 2, 40]} />
          <meshStandardMaterial color={C.north} roughness={0.45} metalness={0.2} transparent={o < 1} opacity={o} />
        </mesh>
        <mesh position={[0, -e.L / 4, 0]}>
          <cylinderGeometry args={[e.R, e.R, e.L / 2, 40]} />
          <meshStandardMaterial color={C.south} roughness={0.45} metalness={0.2} transparent={o < 1} opacity={o} />
        </mesh>
      </group>
      <Label at={madd(e.c, e.n, e.L / 2 + e.R * 0.6)} center>
        N
      </Label>
      <Label at={madd(e.c, e.n, -e.L / 2 - e.R * 0.6)} center>
        S
      </Label>
    </Draggable>
  )
}

function Conductor({ e }: { e: Extract<Ent, { tipo: 'condutor' }> }) {
  const o = useEmph(e.id)
  const d = sub(e.b, e.a)
  const L = len(d)
  const mid = scale(add(e.a, e.b), 0.5)
  const J = Math.abs(e.I) / (Math.PI * e.R * e.R)
  // várias "faixas" de portadores dentro do cilindro
  const lanes = useMemo(() => {
    const [u, v] = basis(d)
    const out: V3[][] = []
    const k = 5
    for (let i = 0; i < k; i++) {
      const a = (i / k) * 2 * Math.PI
      const off = add(scale(u, Math.cos(a) * e.R * 0.55), scale(v, Math.sin(a) * e.R * 0.55))
      out.push(e.I >= 0 ? [add(e.a, off), add(e.b, off)] : [add(e.b, off), add(e.a, off)])
    }
    out.push(e.I >= 0 ? [e.a, e.b] : [e.b, e.a])
    return out
  }, [e.a, e.b, e.R, e.I, d])
  const Jref = 2 / (Math.PI * 0.012 * 0.012)
  return (
    <group>
      <mesh position={tup(mid)} quaternion={quatTo(d)} scale={[e.R, L, e.R]} renderOrder={2}>
        <cylinderGeometry args={[1, 1, 1, 48, 1, false]} />
        <meshPhysicalMaterial color={C.copper} transparent opacity={0.28 * o} roughness={0.25} metalness={0.3} depthWrite={false} />
      </mesh>
      {lanes.map((l, i) => (
        <FlowDots
          key={i}
          points={l}
          count={Math.max(4, Math.round(L / (e.R * 0.9)))}
          radius={e.R * 0.09}
          speed={Math.max(0.02, (0.5 * J) / (J + 40 * Jref))}
          color={new Color().copy(C.copper).lerp(C.text, 0.6)}
        />
      ))}
      {e.rotulo && (
        <Label at={madd(e.a, [0, 1, 0], e.R * 1.6)}>
          {e.rotulo} <span className="num">{formatInline(Math.abs(e.I), 'A')}</span>
        </Label>
      )}
    </group>
  )
}

/* ───────────────────────── partícula ───────────────────────── */

/**
 * Rastro em buffers de tamanho fixo, escritos no lugar. O <Line> do drei cria uma
 * geometria e descarta o material a cada mudança, o que religa o shader: com o
 * rastro mudando várias vezes por segundo, isso derrubava a cena.
 */
function Rastro({ id, cor }: { id: string; cor: Color }) {
  const linha = useMemo(() => {
    const geo = new LineGeometry()
    geo.setPositions(new Float32Array(MAX_TRAIL * 3))
    geo.setColors(new Float32Array(MAX_TRAIL * 3))
    geo.instanceCount = 0
    const l = new Line2(geo, new LineMaterial({ vertexColors: true, linewidth: 2.2, toneMapped: false }))
    l.frustumCulled = false
    return l
  }, [])
  useEffect(
    () => () => {
      linha.geometry.dispose()
      linha.material.dispose()
    },
    [linha],
  )
  const cabeca = useMemo(() => new Color().copy(cor).lerp(C.text, 0.25), [cor])
  const desenhado = useRef<{ ponta?: V3; marca: number }>({ marca: -1 })

  useFrame(() => {
    const run = useRun.getState()
    // redesenha a 15 Hz: escrever milhares de pontos a cada quadro não compensa
    const marca = run.tick >> 2
    if (run.playing && marca === desenhado.current.marca) return
    const t = simRef.current.particles.get(id)?.trail ?? []
    const ponta = t[t.length - 1]
    if (ponta === desenhado.current.ponta) return
    desenhado.current = { ponta, marca }
    const n = Math.max(0, t.length - 1)
    const pontos = (linha.geometry.attributes.instanceStart as InterleavedBufferAttribute).data
    const cores = (linha.geometry.attributes.instanceColorStart as InterleavedBufferAttribute).data
    const fundo = C.bg
    const escreve = (o: number, i: number) => {
      pontos.array[o] = t[i][0]
      pontos.array[o + 1] = t[i][1]
      pontos.array[o + 2] = t[i][2]
      // o rastro esmaece do presente para o passado, como a persistência de um osciloscópio
      const k = 0.15 + 0.85 * (i / n) ** 1.6
      cores.array[o] = fundo.r + (cabeca.r - fundo.r) * k
      cores.array[o + 1] = fundo.g + (cabeca.g - fundo.g) * k
      cores.array[o + 2] = fundo.b + (cabeca.b - fundo.b) * k
    }
    for (let i = 0; i < n; i++) {
      escreve(i * 6, i)
      escreve(i * 6 + 3, i + 1)
    }
    for (const dados of [pontos, cores]) {
      dados.addUpdateRange(0, n * 6)
      dados.needsUpdate = true
    }
    linha.geometry.instanceCount = n
  })
  return <primitive object={linha} />
}

function Particle({ e }: { e: Extract<Ent, { tipo: 'particula' }> }) {
  const { u } = useScene()
  const col = signColor(e.q)
  // a carga de prova que acabou sai de cena; fica só o caminho que ela fez
  const acabou = e.cargaDeProva && simRef.current.particles.get(e.id)?.parada
  return (
    <group>
      <Rastro id={e.id} cor={col} />
      {!acabou && (
        <mesh position={tup(e.p)}>
          <sphereGeometry args={[u * 0.17, 24, 16]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      )}
      {!acabou && e.rotulo && (
        <Label at={add(e.p, [u * 0.25, u * 0.25, 0])}>
          {e.rotulo}
        </Label>
      )}
    </group>
  )
}

/* ───────────────────────── instrumentos ───────────────────────── */

function GaussSurface({ e, world }: { e: Extract<Ent, { tipo: 'gaussiana' }>; world: World }) {
  const o = useEmph(e.id)
  const meshRef = useRef<Mesh>(null)
  const { planoXY } = useScene()
  const s = e.shape
  // esfera em cena de frente (plano xy): só a metade de trás, para não cobrir
  // o corte das cascas e as setas do plano z = 0
  const corte = planoXY && s.forma === 'esfera'
  // cilindro visto de frente pelo eixo: sem as tampas, que cobririam a seção
  const semTampas = planoXY && s.forma === 'cilindro' && Math.abs(norm(s.eixo)[2]) > 0.99
  // com a cena andando, malha mais leve e cor e fluxo a 10 Hz: refazer milhares de
  // vértices por quadro, com o campo em cada um, derruba a taxa de quadros
  const vivo = useRun((st) => st.playing && !!st.scenario?.cena.tempo)
  const nivel = vivo ? 0.5 : 1
  // a esfera é de raio 1, com `scale`: a gaussiana que cresce não refaz malha nem arestas
  const escala = s.forma === 'esfera' ? s.R : 1
  const forma = JSON.stringify({ ...s, c: 0, ...(s.forma === 'esfera' ? { R: 1 } : {}) })
  const { geo, q } = useMemo(() => {
    let g: BufferGeometry
    let q = new Quaternion()
    if (s.forma === 'esfera') g = corte ? new SphereGeometry(1, 64 * nivel, 32 * nivel, Math.PI, Math.PI) : new SphereGeometry(1, 64 * nivel, 40 * nivel)
    else if (s.forma === 'cubo') g = new BoxGeometry(s.a, s.a, s.a, 20, 20, 20)
    else {
      g = new CylinderGeometry(s.R, s.R, s.H, 64, 12, semTampas)
      q = quatTo(s.eixo)
    }
    return { geo: g, q }
    // `forma` tem tudo de `s`, menos o centro: andar não refaz a malha
  }, [forma, corte, semTampas, nivel]) // eslint-disable-line react-hooks/exhaustive-deps
  const F = useMemo(() => (e.campo === 'E' ? (p: V3) => fieldE(world, p) : (p: V3) => fieldB(world, p)), [world, e.campo])
  /**
   * Escala do campo em volta da superfície. Onde o campo é nulo de verdade
   * (dentro de um condutor), o fluxo local é só arredondamento: comparado a
   * esta escala ele vira zero, em vez de manchas laranja e azuis.
   */
  const { ref, size } = useMemo(() => {
    const size = s.forma === 'esfera' ? s.R : s.forma === 'cubo' ? s.a / 2 : Math.max(s.R, s.H / 2)
    let ref = 0
    for (const k of [0.5, 1.6])
      for (const d of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]] as V3[]) {
        const v = len(F(madd(s.c, d, k * size)))
        if (Number.isFinite(v)) ref = Math.max(ref, v)
      }
    return { ref, size }
  }, [s, F])
  const ultimoFluxo = useRef<{ em: number; v: { flux: number; sai: number; entra: number } } | null>(null)
  const { flux, sai, entra } = useMemo(() => {
    const em = performance.now()
    if (vivo && ultimoFluxo.current && em - ultimoFluxo.current.em < 100) return ultimoFluxo.current.v
    const p = fluxParts(s, F, 24)
    const limpa = (v: number) => (Math.abs(v) < 1e-9 * ref * 4 * Math.PI * size * size ? 0 : v)
    const v = { flux: limpa(p.sai - p.entra), sai: limpa(p.sai), entra: limpa(p.entra) }
    ultimoFluxo.current = { em, v }
    return v
  }, [s, F, ref, size, vivo])
  const unidade = e.campo === 'E' ? 'V·m' : 'Wb'

  const ultimaCor = useRef({ em: 0, geo: null as BufferGeometry | null })
  useLayoutEffect(() => {
    const em = performance.now()
    if (vivo && ultimaCor.current.geo === geo && em - ultimaCor.current.em < 100) return
    ultimaCor.current = { em, geo }
    const pos = geo.getAttribute('position')
    const nrm = geo.getAttribute('normal')
    const vals = new Float32Array(pos.count)
    const P = new Vector3()
    const Nn = new Vector3()
    let max = 0
    for (let i = 0; i < pos.count; i++) {
      P.fromBufferAttribute(pos, i).multiplyScalar(escala).applyQuaternion(q)
      Nn.fromBufferAttribute(nrm, i).applyQuaternion(q)
      const p: V3 = [P.x + s.c[0], P.y + s.c[1], P.z + s.c[2]]
      const fn = dot(F(p), [Nn.x, Nn.y, Nn.z])
      vals[i] = Number.isFinite(fn) ? fn : 0
      max = Math.max(max, Math.abs(vals[i]))
    }
    const colors = new Float32Array(pos.count * 3)
    const c = new Color()
    const top = Math.max(max, ref * 1e-6)
    for (let i = 0; i < pos.count; i++) {
      diverging(top > 0 ? Math.sign(vals[i]) * Math.pow(Math.abs(vals[i]) / top, 0.6) : 0, c)
      colors[3 * i] = c.r
      colors[3 * i + 1] = c.g
      colors[3 * i + 2] = c.b
    }
    // reaproveita o atributo: um novo a cada atualização deixaria o buffer velho para trás
    const cor = geo.getAttribute('color') as BufferAttribute | undefined
    if (cor) {
      cor.copyArray(colors)
      cor.needsUpdate = true
    } else geo.setAttribute('color', new BufferAttribute(colors, 3))
  }, [geo, q, s, F, ref, vivo, escala])
  useLayoutEffect(() => () => geo.dispose(), [geo])

  const top: V3 =
    s.forma === 'esfera' ? add(s.c, [0, s.R * 1.1, 0]) : s.forma === 'cubo' ? add(s.c, [s.a * 0.55, s.a * 0.55, 0]) : semTampas ? add(s.c, [0, s.R * 1.1, 0]) : madd(s.c, norm(s.eixo), s.H * 0.6)
  return (
    <Draggable id={e.id} at={s.c} enabled={e.arrastavel}>
      <mesh ref={meshRef} geometry={geo} position={tup(s.c)} quaternion={q} scale={escala} renderOrder={3}>
        <meshStandardMaterial vertexColors transparent opacity={(corte ? 0.4 : 0.5) * o} depthWrite={false} side={DoubleSide} roughness={0.6} />
      </mesh>
      {!semTampas && (
        <group position={tup(s.c)} quaternion={q} scale={escala}>
          <Edges geometry={geo} threshold={20} color={C.text} transparent opacity={0.35 * o} />
        </group>
      )}
      <Label at={top}>
        {e.rotulo ?? 'Superfície gaussiana'} <span className="num">Φ = {formatInline(flux, unidade)}</span>
        {/* ao mover, o total pode não mudar; o que sai e o que entra mudam */}
        {e.arrastavel && (
          <span className="num mt-1 block">
            sai {formatInline(sai, unidade)} · entra {formatInline(entra, unidade)}
          </span>
        )}
      </Label>
    </Draggable>
  )
}

function AmperePath({ e, world }: { e: Extract<Ent, { tipo: 'amperiana' }>; world: World }) {
  const { u } = useScene()
  const o = useEmph(e.id)
  const { pts, colors, arrows } = useMemo(() => {
    const [a, b] = basis(e.circle.n)
    const N = 128
    const pts: [number, number, number][] = []
    const vals: number[] = []
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * 2 * Math.PI
      const p = madd(madd(e.circle.c, a, e.circle.R * Math.cos(t)), b, e.circle.R * Math.sin(t))
      const tg = add(scale(a, -Math.sin(t)), scale(b, Math.cos(t)))
      pts.push(tup(p))
      vals.push(dot(fieldB(world, p), tg))
    }
    const max = Math.max(...vals.map(Math.abs)) || 1
    const colors = vals.map((v) => {
      const c = diverging(Math.sign(v) * Math.pow(Math.abs(v) / max, 0.6))
      return [c.r, c.g, c.b] as [number, number, number]
    })
    const arrows = [0, 1, 2].map((k) => {
      const t = (k / 3) * 2 * Math.PI
      return {
        p: madd(madd(e.circle.c, a, e.circle.R * Math.cos(t)), b, e.circle.R * Math.sin(t)),
        d: add(scale(a, -Math.sin(t)), scale(b, Math.cos(t))),
      }
    })
    return { pts, colors, arrows }
  }, [e.circle, world])
  return (
    <Draggable id={e.id} at={e.circle.c} enabled={e.arrastavel}>
      <Linha points={pts} vertexColors={colors} lineWidth={4} transparent opacity={o} toneMapped={false} />
      {arrows.map((a, i) => (
        <Arrow3D key={i} from={madd(a.p, a.d, -u * 0.2)} dir={a.d} length={u * 0.4} thickness={u * 0.025} color={C.text} opacity={0.8 * o} />
      ))}
      {e.rotulo && <Label at={madd(e.circle.c, basis(e.circle.n)[1], e.circle.R * 1.15)}>{e.rotulo}</Label>}
    </Draggable>
  )
}

function SensorLoop({ e, r }: { e: Extract<Ent, { tipo: 'espiraSensora' }>; r: Resolved }) {
  const { u } = useScene()
  const o = useEmph(e.id)
  const p = e.patch
  const pts = useMemo<V3[]>(() => {
    if (p.forma === 'disco') {
      const [a, b] = basis(p.n)
      return Array.from({ length: 73 }, (_, i) => {
        const t = (i / 72) * 2 * Math.PI
        return madd(madd(p.c, a, p.R * Math.cos(t)), b, p.R * Math.sin(t))
      })
    }
    const c = (sx: number, sy: number) => madd(madd(p.c, p.u, sx * p.hw), p.v, sy * p.hh)
    return [c(-1, -1), c(1, -1), c(1, 1), c(-1, 1), c(-1, -1)]
  }, [p])
  const emf = (() => {
    try {
      return r.env.fns.fem(e.id) as number
    } catch {
      return 0
    }
  })()
  const flow = useMemo(() => (emf >= 0 ? pts : [...pts].reverse()), [pts, emf])
  const geo = useTube(pts, u * 0.06, false, p.forma === 'disco' ? 2 : 8)
  const n = p.forma === 'disco' ? norm(p.n) : cross(p.u, p.v)
  // círculo e plano do three têm normal +z: alinhar a base (u, v, n) do retalho
  const fillQ = useMemo(() => {
    const [u, v] = p.forma === 'disco' ? basis(n) : [p.u, p.v]
    return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(new Vector3(...u), new Vector3(...v), new Vector3(...n)))
  }, [p, n[0], n[1], n[2]]) // eslint-disable-line react-hooks/exhaustive-deps
  const fluxSign = Math.sign(dot(fieldB(r.world, p.c), n))
  const emfMag = Math.abs(emf)
  return (
    <Draggable id={e.id} at={p.c} enabled={e.arrastavel}>
      {geo && (
        <mesh geometry={geo}>
          <meshStandardMaterial color={C.copper} emissive={emfMag > 0 ? C.accent : C.copperDark} emissiveIntensity={Math.min(0.8, emfMag > 0 ? 0.25 + emfMag * 2 : 0.1)} metalness={0.8} roughness={0.3} transparent={o < 1} opacity={o} />
        </mesh>
      )}
      <mesh position={tup(p.c)} quaternion={fillQ} renderOrder={2}>
        {p.forma === 'disco' ? <circleGeometry args={[p.R, 64]} /> : <planeGeometry args={[2 * p.hw, 2 * p.hh]} />}
        <meshBasicMaterial color={fluxSign >= 0 ? C.pos : C.neg} transparent opacity={0.07 * o} side={DoubleSide} depthWrite={false} />
      </mesh>
      {emfMag > 1e-12 && <FlowDots points={flow} count={16} radius={u * 0.075} speed={Math.min(0.6, 0.1 + emfMag)} color={C.accent} />}
      {e.rotulo && (
        <Label at={add(pts[Math.floor(pts.length / 4)], [0, u * 0.3, 0])}>
          {e.rotulo} <span className="num">ε = {formatInline(emf, 'V')}</span>
        </Label>
      )}
    </Draggable>
  )
}

/* ───────────────────────── circuito ───────────────────────── */

function Circuit({ e }: { e: Extract<Ent, { tipo: 'circuito' }> }) {
  const { u } = useScene()
  const t = useRun((s) => s.t)
  const st = useMemo(() => {
    // importação tardia evita ciclo: o compile já resolve os parâmetros
    return circuitState(e, t)
  }, [e, t])
  const W = u * 9
  const H = u * 5.5
  const c = e.c
  const corners: V3[] = [add(c, [-W / 2, 0, -H / 2]), add(c, [W / 2, 0, -H / 2]), add(c, [W / 2, 0, H / 2]), add(c, [-W / 2, 0, H / 2])]
  const loop = useMemo<V3[]>(() => [...corners, corners[0]], [c[0], c[1], c[2], W, H]) // eslint-disable-line
  const flow = useMemo(() => (st.I >= 0 ? loop : [...loop].reverse()), [loop, st.I >= 0])
  const geo = useTube(loop, u * 0.06, false, 8)
  const qmax = Math.max(Math.abs(e.params.C * e.params.fem), Math.abs(e.params.q0), 1e-30)
  const Imax = Math.max(Math.abs(e.params.fem / (e.params.R || 1)), Math.abs(e.params.I0), Math.abs(e.params.q0) / Math.sqrt(e.params.L * e.params.C || 1), 1e-30)
  const qf = Math.min(1, Math.abs(st.q) / qmax)
  const If = Math.min(1, Math.abs(st.I) / Imax)
  const hasC = e.params.modelo !== 'RL' && e.params.modelo !== 'R'
  const hasL = e.params.modelo !== 'RC' && e.params.modelo !== 'R'
  const hasR = e.params.modelo !== 'LC'
  return (
    <group>
      {geo && (
        <mesh geometry={geo}>
          <meshStandardMaterial color={C.copper} metalness={0.85} roughness={0.32} emissive={C.copperDark} emissiveIntensity={0.15} />
        </mesh>
      )}
      <FlowDots points={flow} count={40} radius={u * 0.08} speed={0.02 + 0.5 * If} color={new Color().copy(C.copper).lerp(C.text, 0.6)} />
      {/* fonte no lado esquerdo */}
      {e.params.fem !== 0 && (
        <group position={tup(add(c, [-W / 2, 0, 0]))}>
          <mesh position={[0, 0, -u * 0.18]}>
            <boxGeometry args={[u * 1.2, u * 0.12, u * 0.1]} />
            <meshStandardMaterial color={C.text} metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, u * 0.18]}>
            <boxGeometry args={[u * 0.6, u * 0.12, u * 0.1]} />
            <meshStandardMaterial color={C.text} metalness={0.5} roughness={0.3} />
          </mesh>
          <Label at={[-u * 1.2, 0, 0]}>
            ε <span className="num">{formatInline(e.params.fem, 'V')}</span>
          </Label>
        </group>
      )}
      {hasR && (
        <group position={tup(add(c, [0, 0, -H / 2]))}>
          <Resistor u={u} R={e.params.R} glow={If} />
          <Label at={[0, u * 0.6, -u * 0.5]} center>
            R <span className="num">{formatInline(e.params.R, 'Ω')}</span>
          </Label>
        </group>
      )}
      {hasC && (
        <group position={tup(add(c, [W / 2, 0, 0]))}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, 0, s * u * 0.25]}>
              <boxGeometry args={[u * 1.6, u * 1.6, u * 0.08]} />
              <meshStandardMaterial
                color={new Color().copy(s < 0 ? C.pos : C.neg).lerp(C.surface, 0.5)}
                emissive={st.q * -s >= 0 ? C.pos : C.neg}
                emissiveIntensity={0.9 * qf}
                metalness={0.5}
                roughness={0.35}
              />
            </mesh>
          ))}
          <Label at={[u * 1.1, 0, 0]}>
            C <span className="num">{formatInline(e.params.C, 'F')}</span>
            <br />
            q <span className="num">{formatInline(st.q, 'C')}</span>
          </Label>
        </group>
      )}
      {hasL && <Inductor at={add(c, [0, 0, H / 2])} u={u} glow={If} L={e.params.L} />}
      <Label at={add(c, [0, u * 1.2, 0])} center>
        I <span className="num">{formatInline(st.I, 'A')}</span>
      </Label>
    </group>
  )
}

/* Código de cores de resistores (IEC 60062): dois algarismos, multiplicador e tolerância. */
const BANDAS = ['#1b1b1b', '#7a4a24', '#c0322b', '#e37b23', '#e8c625', '#3f8f3a', '#2f5fb3', '#7a3fa6', '#8a8a8a', '#f2f2ee']
function bandasDe(R: number): string[] {
  if (!(R > 0)) return [BANDAS[0], BANDAS[0], BANDAS[0]]
  const exp = Math.floor(Math.log10(R)) - 1
  const dois = Math.round(R / 10 ** exp)
  const [d1, d2] = dois >= 100 ? [1, 0] : [Math.floor(dois / 10), dois % 10]
  const m = dois >= 100 ? exp + 1 : exp
  // multiplicador: ×10^m; abaixo de 10 Ω entram ouro (×0,1) e prata (×0,01)
  const mult = m >= 0 ? BANDAS[Math.min(9, m)] : m === -1 ? '#c9a227' : '#b8bcc4'
  return [BANDAS[d1], BANDAS[d2], mult]
}

function Resistor({ u, R, glow }: { u: number; R: number; glow: number }) {
  const bandas = bandasDe(R)
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <capsuleGeometry args={[u * 0.26, u * 1.3, 6, 20]} />
        <meshStandardMaterial color="#d9c7a3" roughness={0.65} emissive={C.pos} emissiveIntensity={0.7 * glow * glow} />
      </mesh>
      {[...bandas, '#c9a227'].map((cor, i) => (
        <mesh key={i} position={[0, -u * 0.48 + i * u * 0.26 + (i === 3 ? u * 0.12 : 0), 0]}>
          <cylinderGeometry args={[u * 0.272, u * 0.272, u * 0.1, 24]} />
          <meshStandardMaterial color={cor} roughness={i === 3 ? 0.3 : 0.6} metalness={i === 3 ? 0.8 : 0} />
        </mesh>
      ))}
    </group>
  )
}

function Inductor({ at, u, glow, L }: { at: V3; u: number; glow: number; L: number }) {
  const pts = useMemo<V3[]>(() => {
    const out: V3[] = []
    const turns = 6
    for (let i = 0; i <= turns * 24; i++) {
      const a = (i / 24) * 2 * Math.PI
      out.push(add(at, [-u * 1.2 + (i / (turns * 24)) * u * 2.4, u * 0.4 * Math.sin(a), u * 0.4 * Math.cos(a)]))
    }
    return out
  }, [at, u])
  const geo = useTube(pts, u * 0.05, false, 1)
  return (
    <group>
      {geo && (
        <mesh geometry={geo}>
          <meshStandardMaterial color={C.copper} metalness={0.85} roughness={0.3} emissive={C.fieldB} emissiveIntensity={0.9 * glow} />
        </mesh>
      )}
      <Label at={add(at, [0, u * 0.7, u * 0.5])} center>
        L <span className="num">{formatInline(L, 'H')}</span>
      </Label>
    </group>
  )
}

const circuitState = (e: Extract<Ent, { tipo: 'circuito' }>, t: number) => circuitAt(e.params, t)

/* ───────────────────────── anotações ───────────────────────── */

function Probe({ e, world }: { e: Extract<Ent, { tipo: 'sonda' }>; world: World }) {
  const { u } = useScene()
  const F = e.campo === 'E' ? fieldE(world, e.p) : fieldB(world, e.p)
  const m = len(F)
  return (
    <Draggable id={e.id} at={e.p} enabled={e.arrastavel}>
      <mesh position={tup(e.p)}>
        <octahedronGeometry args={[u * 0.12]} />
        <meshBasicMaterial color={C.text} toneMapped={false} />
      </mesh>
      {m > 0 && <Arrow3D from={e.p} dir={F} length={u * 1.2} thickness={u * 0.03} color={e.campo === 'E' ? C.fieldE : C.fieldB} />}
      <Label at={add(e.p, [u * 0.2, -u * 0.35, 0])}>
        {e.rotulo && <span>{e.rotulo} </span>}
        <span className="num">
          {e.campo} = {formatInline(m, e.campo === 'E' ? 'V/m' : 'T')}
        </span>
      </Label>
    </Draggable>
  )
}

function Seta({ e }: { e: Extract<Ent, { tipo: 'seta' }> }) {
  const { u } = useScene()
  const o = useEmph(e.id)
  const highlighted = useScene().highlight?.has(e.id)
  const L = e.comprimento ?? len(e.vec)
  if (!(len(e.vec) > 0) || !(L > 0)) return null
  const color = roleColor(e.papel)
  const tip = madd(e.o, norm(e.vec), L)
  return (
    <group>
      <Arrow3D from={e.o} dir={e.vec} length={L} thickness={u * (highlighted ? 0.05 : 0.04)} color={color} opacity={o} />
      {e.rotulo && o > 0.5 && <Label at={madd(tip, norm(e.vec), u * 0.15)}>{e.rotulo}</Label>}
    </group>
  )
}

function Cota({ e }: { e: Extract<Ent, { tipo: 'cota' }> }) {
  const { u } = useScene()
  const a = add(e.a, e.off)
  const b = add(e.b, e.off)
  const d = norm(sub(b, a))
  const [n1] = basis(d)
  const tick = u * 0.18
  const perp = Math.abs(e.off[0]) + Math.abs(e.off[1]) + Math.abs(e.off[2]) > 0 ? norm(e.off) : n1
  return (
    <group>
      <Linha points={[tup(a), tup(b)]} color={C.text3} lineWidth={1} />
      <Linha points={[tup(madd(a, perp, -tick)), tup(madd(a, perp, tick))]} color={C.text3} lineWidth={1} />
      <Linha points={[tup(madd(b, perp, -tick)), tup(madd(b, perp, tick))]} color={C.text3} lineWidth={1} />
      {e.rotulo && (
        <Label at={scale(add(a, b), 0.5)} center>
          {e.rotulo}
        </Label>
      )}
    </group>
  )
}

/* ───────────────────────── caminho orientado ───────────────────────── */

function Caminho({ e }: { e: Extract<Ent, { tipo: 'caminho' }> }) {
  const { u } = useScene()
  const o = useEmph(e.id)
  // ponta de seta na fração `seta` do comprimento, alinhada ao trecho em que cai
  const head = useMemo(() => {
    const segs = e.pts.slice(1).map((p, i) => len(sub(p, e.pts[i])))
    const total = segs.reduce((a, b) => a + b, 0)
    let acc = 0
    for (let i = 0; i < segs.length; i++) {
      if (acc + segs[i] >= e.seta * total || i === segs.length - 1) {
        const t = segs[i] > 0 ? Math.min(1, Math.max(0, (e.seta * total - acc) / segs[i])) : 0
        const d = norm(sub(e.pts[i + 1], e.pts[i]))
        return { p: madd(e.pts[i], sub(e.pts[i + 1], e.pts[i]), t), d }
      }
      acc += segs[i]
    }
    return null
  }, [e.pts, e.seta])
  const L = u * 0.5
  return (
    <group>
      <Linha
        points={e.pts.map(tup)}
        color={C.text}
        lineWidth={2}
        dashed={e.tracejado}
        dashSize={u * 0.25}
        gapSize={u * 0.15}
        transparent
        opacity={0.9 * o}
      />
      {head && <Arrow3D from={madd(head.p, head.d, -L / 2)} dir={head.d} length={L} color={C.text} thickness={u * 0.035} opacity={o} />}
      {e.rotulo && (
        <Label at={head ? madd(head.p, [0, 1, 0], u * 0.35) : e.pts[0]} center>
          {e.rotulo}
        </Label>
      )}
    </group>
  )
}

/* ───────────────────────── região de B ───────────────────────── */

function FieldRegion({ e }: { e: Extract<Ent, { tipo: 'campoE' | 'campoB' }> }) {
  if (!e.min || !e.max) return null
  const c = scale(add(e.min, e.max), 0.5)
  const s = sub(e.max, e.min)
  return (
    <mesh position={tup(c)}>
      <boxGeometry args={tup(s)} />
      <meshBasicMaterial color={C.fieldB} wireframe transparent opacity={0.12} />
    </mesh>
  )
}

/* ───────────────────────── despachante ───────────────────────── */

export function Objects({ r }: { r: Resolved }) {
  const qmax = Math.max(0, ...r.ents.map((e) => (e.tipo === 'carga' ? Math.abs(e.q) : 0)))
  const { u } = useScene()
  return (
    <group>
      {r.ents.map((e) => {
        switch (e.tipo) {
          case 'carga':
            return <Charge key={e.id} e={e} qmax={qmax} />
          case 'segmentoCarga':
            return <ChargedTube key={e.id} id={e.id} pts={[e.a, e.b]} value={e.lambda} rotulo={e.rotulo} unit="C/m" />
          case 'anelCarga':
            return <ChargedTube key={e.id} id={e.id} pts={e.pts} value={e.Q} rotulo={e.rotulo} unit="C" closed={e.closed} />
          case 'placa':
            return <Plate key={e.id} c={e.c} u={e.u} v={e.v} hw={e.hw} hh={e.hh} sigma={e.sigma} thick={Math.min(e.hw, e.hh) * 0.03} />
          case 'capacitor':
            return <Capacitor key={e.id} e={e} />
          case 'capacitorRadial':
            return <CapacitorRadial key={e.id} e={e} />
          case 'esfera':
            return <Sphere key={e.id} e={e} />
          case 'linhaInfinita':
            return <InfiniteLine key={e.id} id={e.id} p={e.p} d={e.d} value={e.lambda} R={u * 0.06} rotulo={e.rotulo} unit="C/m" />
          case 'cilindroInfinito':
            return <InfiniteLine key={e.id} id={e.id} p={e.p} d={e.d} value={e.lambda} R={e.R} Rin={e.Rin} rotulo={e.rotulo} unit="C/m" />
          case 'planoInfinito':
            return <InfinitePlane key={e.id} e={e} />
          case 'campoB':
            return <FieldRegion key={e.id} e={e} />
          case 'fio':
            return (
              <Draggable key={e.id} id={e.id} at={scale(add(e.va, e.vb), 0.5)}>
                <Wire id={e.id} a={e.va} b={e.vb} I={e.I} rotulo={e.rotulo} />
              </Draggable>
            )
          case 'cilindroCorrente':
            return <CurrentCylinder key={e.id} e={e} />
          case 'fioInfinito': {
            const { half } = { half: r.half }
            const d = norm(e.d)
            return (
              <Draggable key={e.id} id={e.id} at={e.p} enabled={e.arrastavel}>
                <Wire id={e.id} a={madd(e.p, d, -half * 1.2)} b={madd(e.p, d, half * 1.2)} I={e.I} rotulo={e.rotulo} infinite />
              </Draggable>
            )
          }
          case 'bobina':
            return <Coil key={e.id} e={e} />
          case 'ima':
            return <Magnet key={e.id} e={e} />
          case 'particula':
            return <Particle key={e.id} e={e} />
          case 'gaussiana':
            return <GaussSurface key={e.id} e={e} world={r.world} />
          case 'amperiana':
            return <AmperePath key={e.id} e={e} world={r.world} />
          case 'espiraSensora':
            return e.oculta ? null : <SensorLoop key={e.id} e={e} r={r} />
          case 'circuito':
            return <Circuit key={e.id} e={e} />
          case 'condutor':
            return <Conductor key={e.id} e={e} />
          case 'sonda':
            return <Probe key={e.id} e={e} world={r.world} />
          case 'seta':
            return <Seta key={e.id} e={e} />
          case 'cota':
            return <Cota key={e.id} e={e} />
          case 'rotulo':
            return (
              <Label key={e.id} at={e.p} center>
                {e.texto}
              </Label>
            )
          case 'caminho':
            return <Caminho key={e.id} e={e} />
          default:
            return null
        }
      })}
    </group>
  )
}

