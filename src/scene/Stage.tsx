import { CameraControls, Environment, Grid, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, N8AO, Vignette } from '@react-three/postprocessing'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Sphere, Vector3 } from 'three'
import { useShallow } from 'zustand/react/shallow'
import type { V3 } from '../physics/vec'
import type { Resolved } from '../scenario/compile'
import { stepSim } from '../scenario/sim'
import { useResolved } from '../ui/useResolved'
import { fimDasProvas, ocultosDoPasso, simRef, useRun } from '../store'
import { C } from './colors'
import { ArrowField, FilingsPlane, IsoSurfaces, LineField, PotentialPlane } from './Fields'
import { visWorld } from './fieldCompute'
import { type JobCtx, useFieldJob } from './useFieldJob'
import { velocidadeZoom } from './zoom'
import { Objects } from './Objects'
import { CursorProbe, KeyboardMover, sceneBounds } from './Interaction'
import { Label, SceneCtx, type SceneInfo } from './parts'

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Avança tempo e partículas. Cenários sem relógio próprio ganham um relógio de
 * tempo real quando o aluno solta uma carga de prova.
 */
function SimRunner() {
  useFrame((_, dtReal) => {
    const st = useRun.getState()
    const s = st.scenario
    if (!s || !st.playing || st.dragging) return
    const escalaT = s.cena.tempo?.escala ?? (st.extras.some((e) => e.tipo === 'particula') ? 1 : 0)
    if (!escalaT) return
    const dt = Math.min(dtReal, 1 / 20) * escalaT * st.speed
    const t = stepSim(s, { params: st.params, t: st.t, overrides: st.overrides, orient: st.orient, extras: st.extras }, simRef.current, dt)
    // o fim da duração recomeça tudo, partículas e dinâmica junto com o relógio
    if (s.cena.tempo?.duracao && t > s.cena.tempo.duracao) st.resetSim()
    else st.advance(t)
    if (fimDasProvas(st)) st.setPlaying(false)
  })
  return null
}

/**
 * Câmera do passo (ou da cena) e, por cima, a garantia de enquadramento: se a
 * esfera envolvente não couber na tela atual (celular em pé, coluna estreita),
 * a câmera recua na mesma direção. Em telas largas, nada muda. "F" e o botão
 * de enquadrar ajustam a distância exata para a esfera.
 */
function CameraRig({ pos, target, bounds }: { pos: V3; target: V3; bounds: { c: V3; R: number } }) {
  const ref = useRef<CameraControls>(null)
  const dragging = useRun((s) => s.dragging)
  const frameReq = useRun((s) => s.frameReq)
  const size = useThree((s) => s.size)
  const gl = useThree((s) => s.gl)
  const first = useRef(true)
  const boundsRef = useRef(bounds)
  boundsRef.current = bounds

  const ensureFit = (animate: boolean) => {
    const c = ref.current
    if (!c) return
    const b = boundsRef.current
    const tgt = c.getTarget(new Vector3())
    const off = Math.hypot(tgt.x - b.c[0], tgt.y - b.c[1], tgt.z - b.c[2])
    const need = c.getDistanceToFitSphere(b.R + off * 0.5)
    if (c.distance < need * 0.98) c.dollyTo(need, animate)
  }

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const animate = !first.current && !reducedMotion()
    c.setLookAt(pos[0], pos[1], pos[2], target[0], target[1], target[2], animate)
    // a pinça no touchpad mexe na lente, não na distância
    c.zoomTo(1, animate)
    first.current = false
    ensureFit(animate)
  }, [pos[0], pos[1], pos[2], target[0], target[1], target[2]]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => ensureFit(false), [size.width, size.height]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const c = ref.current
    if (!c || !frameReq) return
    const b = boundsRef.current
    c.fitToSphere(new Sphere(new Vector3(b.c[0], b.c[1], b.c[2]), b.R), !reducedMotion())
    c.zoomTo(1, !reducedMotion())
  }, [frameReq])

  // na captura, antes do camera-controls, que ouve o mesmo evento mais acima
  useEffect(() => {
    const el = gl.domElement.parentElement
    if (!el) return
    const aoRolar = (e: WheelEvent) => {
      if (ref.current) ref.current.dollySpeed = velocidadeZoom(e)
    }
    el.addEventListener('wheel', aoRolar, { capture: true, passive: true })
    return () => el.removeEventListener('wheel', aoRolar, { capture: true })
  }, [gl])

  return (
    <CameraControls
      ref={ref}
      makeDefault
      enabled={!dragging}
      smoothTime={0.32}
      draggingSmoothTime={0.08}
      minDistance={0.5}
      maxDistance={400}
    />
  )
}

function Axes({ half }: { half: number }) {
  const L = half * 0.98
  const axes: { d: V3; name: string }[] = [
    { d: [1, 0, 0], name: 'x' },
    { d: [0, 1, 0], name: 'y' },
    { d: [0, 0, 1], name: 'z' },
  ]
  return (
    <group>
      {axes.map((a) => (
        <group key={a.name}>
          <mesh position={[(a.d[0] * L) / 2, (a.d[1] * L) / 2, (a.d[2] * L) / 2]} rotation={a.name === 'x' ? [0, 0, -Math.PI / 2] : a.name === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
            <cylinderGeometry args={[half * 0.0025, half * 0.0025, L, 6]} />
            <meshBasicMaterial color={C.text3} transparent opacity={0.55} toneMapped={false} />
          </mesh>
          <Label at={[a.d[0] * L * 1.03, a.d[1] * L * 1.03, a.d[2] * L * 1.03]} center className="axis">
            {a.name}
          </Label>
        </group>
      ))}
    </group>
  )
}

export function Stage({ cameraOverride }: { cameraOverride?: { pos: V3; alvo?: V3 } }) {
  const r = useResolved()
  const scenario = useRun((s) => s.scenario)
  const layers = useRun((s) => s.layers)
  const step = useRun((s) => s.step)
  const sondaLivre = useRun((s) => s.sondaLivre)
  const selected = useRun((s) => s.selected)
  const playing = useRun((s) => s.playing)
  // Qualidade adaptativa: abaixo de ~45 fps cai a resolução e sai o bloom.
  const [hq, setHq] = useState(true)
  if (!scenario) return null
  const { escala, extensao, plano, unidade } = scenario.cena
  const half = extensao * escala
  const planoXY = plano === 'xy'
  const passo = step >= 0 ? scenario.passos[step] : undefined
  const highlight = passo?.destacar?.length ? new Set(passo.destacar) : null
  const info: SceneInfo = {
    escala,
    half,
    u: half / 10,
    planoXY,
    highlight,
    interativos: r?.interativos ?? new Map(),
    unidade,
    parametros: scenario.parametros,
  }

  const cam = cameraOverride ?? passo?.camera ?? scenario.cena.camera
  const defaultPos: V3 = planoXY ? [extensao * 0.15, extensao * 0.1, extensao * 2.3] : [extensao * 1.55, extensao * 1.05, extensao * 1.75]
  const pos = (cam?.pos as V3 | undefined) ?? defaultPos
  const target = (cam?.alvo as V3 | undefined) ?? [0, 0, 0]
  const bounds = r ? sceneBounds(r, escala, half) : { c: [0, 0, 0] as V3, R: extensao }

  // Sem nada que se mova, a cena só redesenha quando algo muda (bateria e GPU livres).
  const animated =
    playing ||
    !!selected ||
    sondaLivre ||
    layers.linhasE ||
    layers.linhasB ||
    !!r?.ents.some((e) => ['fio', 'fioInfinito', 'cilindroCorrente', 'bobina', 'condutor', 'circuito', 'espiraSensora', 'particula'].includes(e.tipo))

  return (
    <Canvas
      dpr={hq ? [1, 2] : [1, 1.25]}
      frameloop={animated ? 'always' : 'demand'}
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 38, near: 0.05, far: 1000, position: pos as [number, number, number] }}
      onPointerMissed={() => useRun.getState().select(null)}
      aria-label="Cena 3D da simulação"
    >
      <PerformanceMonitor onDecline={() => setHq(false)} onIncline={() => setHq(true)} flipflops={3} />
      <color attach="background" args={[C.bg]} />
      <fog attach="fog" args={[C.bg, extensao * 4, extensao * 9]} />
      <SceneCtx.Provider value={info}>
        <CameraRig pos={pos} target={target} bounds={bounds} />
        <SimRunner />
        {r && <KeyboardMover r={r} />}
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 10, 4]} intensity={1.6} />
        <directionalLight position={[-8, 3, -6]} intensity={0.45} color={C.neg} />
        <Suspense fallback={null}>
          <Environment resolution={128} frames={1}>
            <Lightformer form="rect" intensity={2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
            <Lightformer form="rect" intensity={0.8} position={[-6, 2, 4]} rotation-y={Math.PI / 3} scale={[6, 3, 1]} color={C.neg} />
            <Lightformer form="rect" intensity={0.8} position={[6, 2, -4]} rotation-y={-Math.PI / 3} scale={[6, 3, 1]} color={C.pos} />
          </Environment>
        </Suspense>

        <Grid
          position={planoXY ? [0, 0, -0.002 * extensao] : [0, -extensao * 0.001, 0]}
          rotation={planoXY ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
          args={[extensao * 2, extensao * 2]}
          cellSize={extensao > 12 ? 1 : 0.5}
          sectionSize={extensao > 12 ? 5 : 1}
          cellColor={C.grid}
          sectionColor={C.gridSection}
          cellThickness={0.6}
          sectionThickness={1}
          fadeDistance={extensao * 5}
          fadeStrength={1.5}
          infiniteGrid
        />
        <Axes half={extensao} />

        <group scale={1 / escala}>
          {r && <SceneContent r={r} half={half} layers={layers} planoXY={planoXY} />}
          {r && sondaLivre && <CursorProbe r={r} />}
        </group>

        {hq && (
          <EffectComposer multisampling={4}>
            {/* oclusão ambiente em meia resolução: assenta os objetos na cena sem custar quadros */}
            <N8AO halfRes aoRadius={extensao * 0.08} distanceFalloff={1} intensity={2.2} color={C.bg} />
            <Bloom mipmapBlur luminanceThreshold={0.85} intensity={0.55} radius={0.6} />
            <Vignette eskil={false} offset={0.25} darkness={0.55} />
          </EffectComposer>
        )}
      </SceneCtx.Provider>
    </Canvas>
  )
}

function SceneContent({ r, half, layers, planoXY }: { r: Resolved; half: number; layers: ReturnType<typeof useRun.getState>['layers']; planoXY: boolean }) {
  const scenario = useRun((s) => s.scenario)!
  const { params, overrides, orient, extras, t, dragging, step, previsoes } = useRun(
    useShallow((s) => ({
      params: s.params,
      overrides: s.overrides,
      orient: s.orient,
      extras: s.extras,
      t: s.t,
      dragging: s.dragging,
      step: s.step,
      previsoes: s.previsoes,
    })),
  )
  const passo = step >= 0 ? scenario.passos[step] : undefined
  const fontes = scenario.visual.fontes
  // O contexto que o worker precisa para recompilar o cenário. O tempo só entra
  // quando as fontes dependem dele (ímã oscilando), não quando só há partículas.
  const ctx: JobCtx = useMemo(
    () => ({
      params,
      overrides,
      orient,
      extras,
      t: r.timeDependent ? t : 0,
      estado: scenario.dinamica.length ? { ...simRef.current.vars } : undefined,
      mostrar: passo?.mostrar,
      ocultar: ocultosDoPasso(scenario, step, previsoes),
    }),
    [params, overrides, orient, extras, r.timeDependent, t, passo, scenario, step, previsoes],
  )
  const ctxSig = useMemo(() => JSON.stringify(ctx), [ctx])
  const w = useMemo(() => visWorld(r, fontes), [r, fontes])
  const hasE = w.e.length > 0
  const hasB = w.b.length > 0
  const q = dragging ? 0.5 : 1
  const density = scenario.visual.densidade ?? (planoXY ? 13 : 7)
  const arrowPlane = scenario.visual.planoSetas ?? (planoXY ? 'xy' : false)
  const planoV = scenario.visual.planoV
  const slice = typeof planoV === 'object' ? planoV : { normal: (planoXY ? 'z' : 'y') as 'x' | 'y' | 'z', posicao: 0 }
  const filCampo: 'E' | 'B' = hasB ? 'B' : 'E'

  const setasE = useFieldJob('setasE', scenario, ctx, ctxSig, layers.setasE && hasE ? { tipo: 'setas', campo: 'E', half, n: density, plano: arrowPlane, fontes } : null)
  const setasB = useFieldJob('setasB', scenario, ctx, ctxSig, layers.setasB && hasB ? { tipo: 'setas', campo: 'B', half, n: density, plano: arrowPlane, fontes } : null)
  const linhasE = useFieldJob('linhasE', scenario, ctx, ctxSig, layers.linhasE && hasE ? { tipo: 'linhas', campo: 'E', half, fontes, qualidade: q } : null)
  const linhasB = useFieldJob('linhasB', scenario, ctx, ctxSig, layers.linhasB && hasB ? { tipo: 'linhas', campo: 'B', half, fontes, qualidade: q } : null)
  const plano = useFieldJob('planoV', scenario, ctx, ctxSig, layers.planoV && hasE ? { tipo: 'plano', half, normal: slice.normal, at: slice.posicao, N: dragging ? 80 : 160, fontes } : null)
  const iso = useFieldJob('iso', scenario, ctx, ctxSig, layers.equipotenciais && hasE ? { tipo: 'iso', half, N: dragging ? 22 : 34, fontes } : null)
  const limalha = useFieldJob(
    'limalha',
    scenario,
    ctx,
    ctxSig,
    layers.limalha && (hasE || hasB) ? { tipo: 'textura', campo: filCampo, half, normal: slice.normal, at: slice.posicao, N: dragging ? 128 : 256, fontes } : null,
  )

  return (
    <group>
      <Objects r={r} />
      {setasE?.tipo === 'setas' && <ArrowField res={setasE} kind="E" />}
      {setasB?.tipo === 'setas' && <ArrowField res={setasB} kind="B" />}
      {linhasE?.tipo === 'linhas' && <LineField res={linhasE} kind="E" half={half} scale={1} />}
      {linhasB?.tipo === 'linhas' && <LineField res={linhasB} kind="B" half={half} scale={1} />}
      {plano?.tipo === 'plano' && <PotentialPlane res={plano} half={half} normal={slice.normal} at={slice.posicao} />}
      {iso?.tipo === 'iso' && <IsoSurfaces res={iso} />}
      {limalha?.tipo === 'textura' && <FilingsPlane res={limalha} half={half} normal={slice.normal} at={slice.posicao} kind={filCampo} />}
    </group>
  )
}
