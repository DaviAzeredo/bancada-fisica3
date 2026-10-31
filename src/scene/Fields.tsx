import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DataTexture,
  DataUtils,
  DoubleSide,
  HalfFloatType,
  InstancedInterleavedBuffer,
  type InstancedMesh,
  InterleavedBufferAttribute,
  LinearFilter,
  NearestFilter,
  Matrix4,
  Quaternion,
  RepeatWrapping,
  RGBAFormat,
  RGFormat,
  RedFormat,
  ShaderMaterial,
  TorusGeometry,
  UnsignedByteType,
  Vector2,
  Vector3,
} from 'three'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { ArrowsResult, IsoResult, LinesResult, SliceResult, TextureResult } from './fieldCompute'
import { C } from './colors'

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* ───────────────────────── geometrias compartilhadas ───────────────────────── */

const arrowGeom = (() => {
  const shaft = new CylinderGeometry(0.035, 0.035, 0.68, 8)
  shaft.translate(0, 0.34, 0)
  const head = new ConeGeometry(0.11, 0.32, 12)
  head.translate(0, 0.84, 0)
  return mergeGeometries([shaft, head])!
})()

/* Notação do quadro para campo perpendicular à folha: ⊗ entrando, ⊙ saindo. */
const ringGeom = new TorusGeometry(1, 0.09, 6, 40)
const crossGeom = (() => {
  const a = new BoxGeometry(1.25, 0.16, 0.05)
  a.rotateZ(Math.PI / 4)
  const b = new BoxGeometry(1.25, 0.16, 0.05)
  b.rotateZ(-Math.PI / 4)
  return mergeGeometries([a, b])!
})()
const dotGeom = new CircleGeometry(0.28, 20)
const headGeom = (() => {
  const g = new ConeGeometry(0.55, 1.6, 10)
  g.translate(0, 0.2, 0)
  return g
})()

const UP = new Vector3(0, 1, 0)

/* ───────────────────────── setas ───────────────────────── */

export function ArrowField({ res, kind }: { res: ArrowsResult; kind: 'E' | 'B' }) {
  const ref = useRef<InstancedMesh>(null)
  const ringRef = useRef<InstancedMesh>(null)
  const inRef = useRef<InstancedMesh>(null)
  const outRef = useRef<InstancedMesh>(null)
  const n = res.t.length

  useLayoutEffect(() => {
    const m = new Matrix4()
    const q = new Quaternion()
    const dir = new Vector3()
    const p = new Vector3()
    const s = new Vector3()
    const col = new Color()
    const dim = kind === 'E' ? C.fieldEDim : C.fieldBDim
    const bright = kind === 'E' ? C.fieldE : C.fieldB
    let arrows = 0
    let rings = 0
    let ins = 0
    let outs = 0
    for (let i = 0; i < n; i++) {
      const t = res.t[i]
      col.copy(dim).lerp(bright, t)
      p.set(res.pos[3 * i], res.pos[3 * i + 1], res.pos[3 * i + 2])
      if (res.glifo[i] !== 0) {
        const r = res.cell * (0.09 + 0.08 * t)
        m.makeScale(r, r, r).setPosition(p)
        ringRef.current?.setMatrixAt(rings, m)
        ringRef.current?.setColorAt(rings++, col)
        const target = res.glifo[i] > 0 ? inRef.current : outRef.current
        target?.setMatrixAt(res.glifo[i] > 0 ? ins : outs, m)
        target?.setColorAt(res.glifo[i] > 0 ? ins++ : outs++, col)
        continue
      }
      dir.set(res.dir[3 * i], res.dir[3 * i + 1], res.dir[3 * i + 2])
      q.setFromUnitVectors(UP, dir)
      const L = res.cell * 0.78 * (0.3 + 0.7 * t)
      const w = res.cell * 0.28
      p.addScaledVector(dir, -L * 0.5)
      m.compose(p, q, s.set(w, L, w))
      ref.current?.setMatrixAt(arrows, m)
      ref.current?.setColorAt(arrows++, col)
    }
    for (const [mesh, c] of [
      [ref.current, arrows],
      [ringRef.current, rings],
      [inRef.current, ins],
      [outRef.current, outs],
    ] as const) {
      if (!mesh) continue
      mesh.count = c
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
  }, [res, kind, n])

  const cap = Math.max(1, n)
  return (
    <group>
      <instancedMesh ref={ref} args={[arrowGeom, undefined, cap]} frustumCulled={false}>
        <meshBasicMaterial toneMapped={false} transparent opacity={0.92} />
      </instancedMesh>
      <instancedMesh ref={ringRef} args={[ringGeom, undefined, cap]} frustumCulled={false}>
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={inRef} args={[crossGeom, undefined, cap]} frustumCulled={false}>
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={outRef} args={[dotGeom, undefined, cap]} frustumCulled={false}>
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

/* ───────────────────────── linhas com fluxo ───────────────────────── */

/**
 * Linhas de campo como segmentos de largura em pixels. O tracejado anda no
 * sentido do campo: dá a direção sem encher a cena de setas.
 */
export function LineField({ res, kind, half, scale }: { res: LinesResult; kind: 'E' | 'B'; half: number; scale: number }) {
  const color = kind === 'E' ? C.fieldE : C.fieldB
  // O material sobrevive aos resultados: com o campo mudando a cada quadro, um material
  // novo por resultado religava o shader, o passo mais caro que a GPU pode dar.
  const mat = useMemo(() => {
    const mat = new LineMaterial({
      color: color.getHex(),
      linewidth: 1.6,
      transparent: true,
      opacity: 0.85,
      dashed: true,
      dashSize: half * 0.05,
      gapSize: half * 0.03,
      worldUnits: false,
    })
    mat.toneMapped = false
    return mat
  }, [color, half])
  useLayoutEffect(() => () => mat.dispose(), [mat])
  const line = useMemo(() => {
    const geo = new LineSegmentsGeometry()
    geo.setPositions(res.segs)
    const line = new LineSegments2(geo, mat)
    // distâncias acumuladas por linha (não pela cena toda): o tracejado corre
    // contínuo ao longo de cada linha, como em LineSegments2.computeLineDistances
    const buf = new InstancedInterleavedBuffer(res.dist, 2, 1)
    geo.setAttribute('instanceDistanceStart', new InterleavedBufferAttribute(buf, 1, 0))
    geo.setAttribute('instanceDistanceEnd', new InterleavedBufferAttribute(buf, 1, 1))
    line.frustumCulled = false
    return line
  }, [res, mat])
  useLayoutEffect(() => () => line.geometry.dispose(), [line])
  useFrame((state, dt) => {
    mat.resolution.set(state.size.width, state.size.height)
    if (!reduced()) mat.dashOffset -= dt * half * 0.12
  })

  const headRef = useRef<InstancedMesh>(null)
  const nHead = res.heads.length / 6
  // só cresce: mudar a capacidade recria a malha, e o número de pontas muda a todo quadro
  const capacidade = useRef(1)
  capacidade.current = Math.max(capacidade.current, nHead)
  useLayoutEffect(() => {
    const mesh = headRef.current
    if (!mesh) return
    const m = new Matrix4()
    const q = new Quaternion()
    const d = new Vector3()
    const s = half * 0.017
    for (let i = 0; i < nHead; i++) {
      d.set(res.heads[6 * i + 3], res.heads[6 * i + 4], res.heads[6 * i + 5]).normalize()
      q.setFromUnitVectors(UP, d)
      m.compose(new Vector3(res.heads[6 * i], res.heads[6 * i + 1], res.heads[6 * i + 2]), q, new Vector3(s, s, s))
      mesh.setMatrixAt(i, m)
    }
    mesh.count = nHead
    mesh.instanceMatrix.needsUpdate = true
  }, [res, half, nHead])

  void scale
  if (!res.segs.length) return null
  return (
    <group>
      <primitive object={line} />
      <instancedMesh ref={headRef} args={[headGeom, undefined, capacidade.current]} frustumCulled={false}>
        <meshBasicMaterial color={color} toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

/* ───────────────────────── plano de potencial ───────────────────────── */

const planeTransform = (normal: 'x' | 'y' | 'z', at: number) => ({
  rotation: (normal === 'z' ? [0, 0, 0] : normal === 'y' ? [-Math.PI / 2, 0, 0] : [0, Math.PI / 2, 0]) as [number, number, number],
  position: (normal === 'z' ? [0, 0, at] : normal === 'y' ? [0, at, 0] : [at, 0, 0]) as [number, number, number],
})

function halfTexture(N: number, channels: number, fill: (k: number, c: number) => number, format: typeof RGFormat | typeof RGBAFormat | typeof RedFormat) {
  const data = new Uint16Array(N * N * channels)
  for (let k = 0; k < N * N; k++) for (let c = 0; c < channels; c++) data[channels * k + c] = DataUtils.toHalfFloat(fill(k, c))
  const t = new DataTexture(data, N, N, format, HalfFloatType)
  t.magFilter = LinearFilter
  t.minFilter = LinearFilter
  t.needsUpdate = true
  return t
}

export function PotentialPlane({ res, half, normal, at }: { res: SliceResult; half: number; normal: 'x' | 'y' | 'z'; at: number }) {
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        side: DoubleSide,
        depthWrite: false,
        uniforms: {
          uTex: { value: null },
          uPos: { value: C.pos },
          uNeg: { value: C.neg },
          uMid: { value: new Color().copy(C.bg).lerp(C.surface, 0.8) },
          uLine: { value: C.text },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uTex; uniform vec3 uPos; uniform vec3 uNeg; uniform vec3 uMid; uniform vec3 uLine;
          varying vec2 vUv;
          void main() {
            vec2 t = texture2D(uTex, vUv).rg;
            float s = clamp(t.r, -1.0, 1.0);
            vec3 col = mix(uMid, s > 0.0 ? uPos : uNeg, 0.85 * pow(abs(s), 1.5));
            float v = t.g * 4.0;
            float w = fwidth(v);
            float f = abs(fract(v - 0.5) - 0.5) / max(w, 1e-4);
            float line = (1.0 - clamp(f, 0.0, 1.0)) * clamp(1.6 - w * 2.5, 0.0, 1.0);
            col = mix(col, uLine, line * 0.55);
            vec2 e = min(vUv, 1.0 - vUv);
            float fade = smoothstep(0.0, 0.08, min(e.x, e.y));
            gl_FragColor = vec4(col, 0.66 * fade);
            #include <colorspace_fragment>
          }
        `,
      }),
    [],
  )
  const tex = useMemo(() => halfTexture(res.N, 2, (k, c) => (c === 0 ? res.s[k] : res.v[k]), RGFormat), [res])
  useLayoutEffect(() => {
    mat.uniforms.uTex.value = tex
    return () => tex.dispose()
  }, [tex, mat])
  return (
    <mesh {...planeTransform(normal, at)} material={mat} renderOrder={-1}>
      <planeGeometry args={[2 * half, 2 * half]} />
    </mesh>
  )
}

/* ───────────────────────── limalha (LIC) ───────────────────────── */

const noiseTex = (() => {
  const N = 256
  const data = new Uint8Array(N * N)
  for (let i = 0; i < N * N; i++) data[i] = Math.random() < 0.5 ? Math.floor(Math.random() * 60) : 160 + Math.floor(Math.random() * 95)
  const t = new DataTexture(data, N, N, RedFormat, UnsignedByteType)
  t.wrapS = t.wrapT = RepeatWrapping
  t.magFilter = NearestFilter
  t.minFilter = NearestFilter
  t.needsUpdate = true
  return t
})()

/**
 * Line integral convolution: cada pixel é a média de um ruído amostrado ao
 * longo da linha de campo que passa por ele. Sai o padrão de limalha de ferro
 * (para B) ou de sementes de grama (para E) dos livros, para o campo exato.
 */
export function FilingsPlane({ res, half, normal, at, kind }: { res: TextureResult; half: number; normal: 'x' | 'y' | 'z'; at: number; kind: 'E' | 'B' }) {
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        side: DoubleSide,
        depthWrite: false,
        uniforms: {
          uField: { value: null },
          uNoise: { value: noiseTex },
          uTint: { value: new Color() },
          uBg: { value: new Color().copy(C.bg) },
          uStep: { value: new Vector2(1, 1) },
          uNoiseScale: { value: 6.0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uField; uniform sampler2D uNoise; uniform vec3 uTint; uniform vec3 uBg;
          uniform vec2 uStep; uniform float uNoiseScale;
          varying vec2 vUv;
          void main() {
            vec3 f0 = texture2D(uField, vUv).rgb;
            float acc = 0.0; float wsum = 0.0;
            for (int dirSign = 0; dirSign < 2; dirSign++) {
              vec2 p = vUv;
              float sgn = dirSign == 0 ? 1.0 : -1.0;
              for (int i = 0; i < 22; i++) {
                vec2 d = texture2D(uField, p).rg;
                if (dot(d, d) < 1e-6) break;
                p += sgn * normalize(d) * uStep;
                float w = 1.0 - float(i) / 22.0;
                acc += texture2D(uNoise, p * uNoiseScale).r * w;
                wsum += w;
              }
            }
            float lic = wsum > 0.0 ? acc / wsum : 0.5;
            lic = smoothstep(0.32, 0.68, lic);
            float strength = f0.b;
            vec3 col = mix(uBg, uTint, lic * (0.25 + 0.75 * strength));
            vec2 e = min(vUv, 1.0 - vUv);
            float fade = smoothstep(0.0, 0.06, min(e.x, e.y));
            gl_FragColor = vec4(col, (0.25 + 0.6 * lic) * fade);
            #include <colorspace_fragment>
          }
        `,
      }),
    [],
  )
  const tex = useMemo(() => halfTexture(res.N, 4, (k, c) => (c < 3 ? res.vec[3 * k + c] : 1), RGBAFormat), [res])
  useLayoutEffect(() => {
    mat.uniforms.uField.value = tex
    // passo de integração ≈ meio texel do campo; ruído com um texel por passo,
    // para que o traço tenha grão (texel muito fino vira cinza uniforme)
    const step = 0.5 / res.N
    mat.uniforms.uStep.value.set(step, step)
    mat.uniforms.uNoiseScale.value = 1 / (256 * step * 1.15)
    mat.uniforms.uTint.value.copy(kind === 'E' ? C.fieldE : C.fieldB)
    return () => tex.dispose()
  }, [tex, mat, res.N, kind])
  return (
    <mesh {...planeTransform(normal, at)} material={mat} renderOrder={-2}>
      <planeGeometry args={[2 * half, 2 * half]} />
    </mesh>
  )
}

/* ───────────────────────── equipotenciais ───────────────────────── */

export function IsoSurfaces({ res }: { res: IsoResult }) {
  const geos = useMemo(
    () =>
      res.meshes.map((m) => {
        const g = new BufferGeometry()
        g.setAttribute('position', new BufferAttribute(m.pos, 3))
        g.setAttribute('normal', new BufferAttribute(m.nrm, 3))
        return { g, sign: m.sign, mag: m.mag }
      }),
    [res],
  )
  useLayoutEffect(() => () => geos.forEach((x) => x.g.dispose()), [geos])
  return (
    <group>
      {geos.map((m, i) => (
        <mesh key={i} geometry={m.g} renderOrder={1}>
          <meshStandardMaterial
            color={m.sign > 0 ? C.pos : C.neg}
            transparent
            opacity={0.1 + 0.05 * Math.log2(m.mag + 1)}
            side={DoubleSide}
            depthWrite={false}
            roughness={0.4}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  )
}
