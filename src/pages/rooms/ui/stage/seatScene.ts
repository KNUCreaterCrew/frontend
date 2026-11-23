import {
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  LineDashedMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
  type Texture,
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import type { StageLayout, StageSeat, StageTone } from '../../lib/stageLayout'

/*
 * 방 목록 머리 영역의 입체 좌석 무대. 좌석 하나가 유리 블록 하나다.
 * 밝기 순서는 좌석도와 같다(빈자리 흰 면에 에메랄드 테두리와 빛 > 짐 있음 회청색 > 사용 중 스모크),
 * 확인 불가는 면 없는 점선 판이다. 색은 tokens.css 의 변수를 읽는다.
 * 계속 돌아가는 애니메이션은 없다. 블록이 솟을 때, 상태가 바뀐 블록이 들썩일 때,
 * 카메라가 포인터를 따라갈 때만 그리고, 끝나면 멈춘다.
 */

export interface SeatScene {
  setLayout(layout: StageLayout): void
  dispose(): void
}

interface Palette {
  empty: Color
  surface: Color
  awayTop: Color
  away: Color
  occupiedTop: Color
  occupied: Color
  line: Color
  ink: Color
}

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement)
  const token = (name: string) => {
    const value = css.getPropertyValue(name).trim()
    if (!value) throw new Error(`토큰 ${name} 이 없습니다`)
    return new Color(value)
  }
  return {
    empty: token('--color-empty'),
    surface: token('--color-surface'),
    awayTop: token('--color-away-top'),
    away: token('--color-away'),
    occupiedTop: token('--color-occupied-top'),
    occupied: token('--color-occupied'),
    line: token('--color-line-strong'),
    ink: token('--color-ink'),
  }
}

// 가운데가 진하고 가장자리로 사라지는 흰 원. 빈자리 빛과 블록 그림자에 색을 입혀 쓴다
function radialTexture(): Texture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d 캔버스를 쓸 수 없습니다')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.55)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

// 빈자리 윗면 테두리: 투명한 바탕에 또렷한 둥근 사각 에메랄드 선. 빛은 바닥에만 둔다
function ringTexture(aspect: number, color: Color): Texture {
  const width = 512
  const height = Math.max(64, Math.round(width / aspect))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d 캔버스를 쓸 수 없습니다')
  const line = width * 0.035
  const inset = line / 2 + 2
  const radius = Math.min(width, height) * 0.14
  const css = `#${color.getHexString()}`
  ctx.beginPath()
  ctx.roundRect(inset, inset, width - inset * 2, height - inset * 2, radius)
  ctx.strokeStyle = css
  ctx.lineWidth = line
  ctx.stroke()
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

// 모서리가 둥근 평면(빈자리 윗면)
function roundedPlane(width: number, depth: number, radius: number): BufferGeometry {
  const hw = width / 2
  const hd = depth / 2
  const r = Math.min(radius, hw, hd)
  const shape = new Shape()
  shape.moveTo(-hw + r, -hd)
  shape.lineTo(hw - r, -hd)
  shape.quadraticCurveTo(hw, -hd, hw, -hd + r)
  shape.lineTo(hw, hd - r)
  shape.quadraticCurveTo(hw, hd, hw - r, hd)
  shape.lineTo(-hw + r, hd)
  shape.quadraticCurveTo(-hw, hd, -hw, hd - r)
  shape.lineTo(-hw, -hd + r)
  shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd)
  return new ShapeGeometry(shape, 6)
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t))
const RISE_MS = 760
const RISE_STAGGER_MS = 46
const LIFT_MS = 520
// 무대 크기: 좌석도 경계의 긴 변을 이 길이로 맞춘다
const WORLD = 10
// 카메라: 살짝 내려다보고(고도) 왼쪽으로 돌려(방위) 블록의 옆면이 보이게 한다
const ELEVATION = (50 * Math.PI) / 180
const AZIMUTH = (-26 * Math.PI) / 180
const PARALLAX_AZ = (5 * Math.PI) / 180
const PARALLAX_EL = (3 * Math.PI) / 180

interface SeatNode {
  seat: StageSeat
  group: Group
  body: Group
  height: number
  glow: Mesh | null
  bornAt: number
  liftAt: number | null
}

export function createSeatScene(
  canvas: HTMLCanvasElement,
  { onContextLost }: { onContextLost: () => void },
): SeatScene {
  const palette = readPalette()
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    failIfMajorPerformanceCaveat: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = environment
  scene.environmentIntensity = 0.3
  pmrem.dispose()

  scene.add(new HemisphereLight(palette.surface, palette.occupied, 0.9))
  const sun = new DirectionalLight(palette.surface, 1.15)
  sun.position.set(-6, 14, 8)
  scene.add(sun)

  const camera = new PerspectiveCamera(28, 1, 0.1, 400)
  const target = new Vector3()

  const radial = radialTexture()
  const glowMaterial = new MeshBasicMaterial({
    map: radial,
    color: palette.empty,
    transparent: true,
    depthWrite: false,
    opacity: 0.55,
  })
  const shadowMaterial = new MeshBasicMaterial({
    map: radial,
    color: palette.ink,
    transparent: true,
    depthWrite: false,
    opacity: 0.26,
  })
  const materials: Record<Exclude<StageTone, 'unknown'>, Material> = {
    empty: new MeshPhysicalMaterial({
      color: palette.surface,
      // 옆면은 빛을 받아 윗면보다 조금 어둡게 남는다(좌석 칸의 흰 면에서 아래쪽으로 옅어지는 것처럼)
      emissive: palette.surface,
      emissiveIntensity: 0.08,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.18,
    }),
    away: new MeshPhysicalMaterial({
      color: palette.away.clone().lerp(palette.awayTop, 0.5),
      roughness: 0.38,
      clearcoat: 0.7,
      clearcoatRoughness: 0.3,
    }),
    occupied: new MeshPhysicalMaterial({
      color: palette.occupied.clone().lerp(palette.occupiedTop, 0.4),
      roughness: 0.34,
      clearcoat: 0.8,
      clearcoatRoughness: 0.25,
    }),
  }
  // 빈자리 윗면의 에메랄드 테두리. 가로세로 비율마다 한 장씩 그린다
  const rings = new Map<string, MeshBasicMaterial>()
  const ringMaterial = (aspect: number) => {
    const key = aspect.toFixed(3)
    let found = rings.get(key)
    if (!found) {
      found = new MeshBasicMaterial({
        map: ringTexture(aspect, palette.empty),
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      })
      rings.set(key, found)
    }
    return found
  }
  // 빈자리 윗면은 조명과 상관없이 가장 밝은 흰색이다
  const topMaterial = new MeshBasicMaterial({
    color: palette.surface,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  })
  const unknownFill = new MeshBasicMaterial({
    color: palette.surface,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  })
  const unknownLine = new LineDashedMaterial({ color: palette.line, dashSize: 0.16, gapSize: 0.1 })
  const plane = new PlaneGeometry(1, 1)

  // 같은 크기의 좌석이 많으므로 모양은 크기별로 한 번만 만든다
  const geometries = new Map<string, BufferGeometry>()
  const geometry = (key: string, make: () => BufferGeometry) => {
    let found = geometries.get(key)
    if (!found) {
      found = make()
      geometries.set(key, found)
    }
    return found
  }

  const root = new Group()
  scene.add(root)
  let nodes = new Map<string, SeatNode>()
  let current: StageLayout | null = null
  let scale = 1
  let extent = { width: WORLD, depth: WORLD, height: 1 }

  function buildBody(seat: StageSeat, w: number, d: number, h: number): Group {
    const body = new Group()
    const r = Math.min(w, d) * 0.18
    if (seat.tone === 'unknown') {
      const slab = new Mesh(
        geometry(`slab:${w}:${d}`, () => new RoundedBoxGeometry(w, 0.05, d, 3, 0.024)),
        unknownFill,
      )
      slab.position.y = 0.025
      body.add(slab)
      const outline = new LineLoop(
        geometry(`dash:${w}:${d}`, () => {
          const points: Vector3[] = []
          const hw = w / 2 - 0.04
          const hd = d / 2 - 0.04
          const rr = Math.min(r, hw, hd)
          const corners: Array<[number, number, number]> = [
            [hw - rr, hd - rr, 0],
            [-hw + rr, hd - rr, Math.PI / 2],
            [-hw + rr, -hd + rr, Math.PI],
            [hw - rr, -hd + rr, (3 * Math.PI) / 2],
          ]
          for (const [cx, cz, start] of corners) {
            for (let i = 0; i <= 6; i++) {
              const a = start + (i / 6) * (Math.PI / 2)
              points.push(new Vector3(cx + Math.cos(a) * rr, 0, cz + Math.sin(a) * rr))
            }
          }
          const g = new BufferGeometry().setFromPoints(points)
          return g
        }),
        unknownLine,
      )
      outline.computeLineDistances()
      outline.position.y = 0.06
      body.add(outline)
      return body
    }
    const shadow = new Mesh(plane, shadowMaterial)
    shadow.rotation.x = -Math.PI / 2
    shadow.scale.set(w * 1.5, d * 1.5, 1)
    shadow.position.set(w * 0.08, 0.004, d * 0.12)
    shadow.renderOrder = -1
    body.add(shadow)
    const block = new Mesh(
      geometry(`box:${w}:${d}:${h}`, () => new RoundedBoxGeometry(w, h, d, 4, r)),
      materials[seat.tone],
    )
    block.renderOrder = 1
    block.position.y = h / 2
    body.add(block)
    if (seat.tone === 'empty') {
      // 좌석도의 빈자리 칸처럼 흰 윗면 둘레에 얇은 에메랄드 선. 면을 초록으로 칠하지 않는다
      const face = new Mesh(
        geometry(`face:${w}:${d}`, () => roundedPlane(w - r * 0.9, d - r * 0.9, r * 0.6)),
        topMaterial,
      )
      face.rotation.x = -Math.PI / 2
      face.position.y = h + 0.001
      body.add(face)
      const ring = new Mesh(plane, ringMaterial(w / d))
      ring.rotation.x = -Math.PI / 2
      ring.scale.set(w * 0.94, d * 0.94, 1)
      ring.position.y = h + 0.003
      body.add(ring)
    }
    return body
  }

  function addSeat(seat: StageSeat, bornAt: number): SeatNode {
    const w = seat.width * scale
    const d = seat.height * scale
    const h = seat.tone === 'unknown' ? 0.06 : Math.min(w, d) * 0.46
    const group = new Group()
    group.position.set(
      (seat.x + seat.width / 2) * scale - extent.width / 2,
      0,
      (seat.y + seat.height / 2) * scale - extent.depth / 2,
    )
    let glow: Mesh | null = null
    if (seat.tone === 'empty') {
      glow = new Mesh(plane, glowMaterial)
      glow.rotation.x = -Math.PI / 2
      glow.scale.set(w * 2.1, d * 2.1, 1)
      glow.position.y = 0.006
      glow.renderOrder = -1
      group.add(glow)
    }
    const body = buildBody(seat, w, d, h)
    group.add(body)
    root.add(group)
    return { seat, group, body, height: h, glow, bornAt, liftAt: null }
  }

  function removeSeat(node: SeatNode) {
    root.remove(node.group)
  }

  // 블록 모서리 여덟 점이 화면 안에 여백을 두고 들어오도록 카메라 거리를 잡는다
  function fitCamera(az: number, el: number) {
    const width = canvas.clientWidth || 1
    const height = canvas.clientHeight || 1
    camera.aspect = width / height
    const forward = new Vector3(
      Math.cos(el) * Math.sin(az),
      Math.sin(el),
      Math.cos(el) * Math.cos(az),
    ).normalize()
    const right = new Vector3(0, 1, 0).cross(forward).normalize()
    const up = forward.clone().cross(right).normalize()
    // 위 캡슐 줄과 아래 캡슐 자리(px)는 비워 두고, 그 사이 띠에 블록을 맞춘다.
    // 자리는 rooms-stage 유틸리티의 --stage-inset-top, --stage-inset-bottom 이 정한다
    const style = getComputedStyle(canvas)
    const insetTop = parseFloat(style.getPropertyValue('--stage-inset-top')) || 0
    const insetBottom = parseFloat(style.getPropertyValue('--stage-inset-bottom')) || 0
    const band = Math.max(height - insetTop - insetBottom, height * 0.4)
    const tanV = Math.tan((camera.fov * Math.PI) / 360) * (band / height)
    const tanH = Math.tan((camera.fov * Math.PI) / 360) * camera.aspect
    const margin = 0.9
    target.set(0, extent.height * 0.35, 0)
    let distance = 0
    const hw = extent.width / 2
    const hd = extent.depth / 2
    for (const x of [-hw, hw]) {
      for (const z of [-hd, hd]) {
        for (const y of [0, extent.height]) {
          const p = new Vector3(x, y, z).sub(target)
          const along = p.dot(forward)
          distance = Math.max(
            distance,
            along + Math.abs(p.dot(right)) / (tanH * margin),
            along + Math.abs(p.dot(up)) / (tanV * margin),
          )
        }
      }
    }
    camera.position.copy(target).addScaledVector(forward, distance)
    camera.up.set(0, 1, 0)
    camera.lookAt(target)
    // 띠의 가운데가 화면 가운데에 오도록 보는 창을 옮긴다
    camera.setViewOffset(width, height, 0, -(insetTop - insetBottom) / 2, width, height)
    camera.updateProjectionMatrix()
  }

  // 그릴 일이 있을 때만 다음 프레임을 잡는다
  let frame = 0
  let disposed = false
  const pointer = new Vector2()
  const view = new Vector2()
  const finePointer = window.matchMedia('(pointer: fine)').matches

  function tick() {
    frame = 0
    if (disposed) return
    const now = performance.now()
    let busy = false
    for (const node of nodes.values()) {
      const t = Math.max(0, Math.min(1, (now - node.bornAt) / RISE_MS))
      const k = easeOutExpo(t)
      node.body.scale.y = Math.max(0.001, k)
      // 빛은 블록이 솟는 동안 함께 퍼진다
      if (node.glow) {
        node.glow.visible = t > 0
        const spread = 2.1 * (0.6 + 0.4 * k) * scale
        node.glow.scale.set(node.seat.width * spread, node.seat.height * spread, 1)
      }
      if (t < 1) busy = true
      if (node.liftAt !== null) {
        const lt = (now - node.liftAt) / LIFT_MS
        if (lt >= 1) {
          node.liftAt = null
          node.body.position.y = 0
        } else {
          node.body.position.y = Math.sin(Math.PI * lt) * node.height * 0.7
          busy = true
        }
      }
    }
    view.lerp(pointer, 0.12)
    if (view.distanceTo(pointer) > 0.002) busy = true
    else view.copy(pointer)
    fitCamera(AZIMUTH + view.x * PARALLAX_AZ, ELEVATION - view.y * PARALLAX_EL)
    renderer.render(scene, camera)
    if (busy) request()
  }

  function request() {
    if (!frame && !disposed) frame = requestAnimationFrame(tick)
  }

  function resize() {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (width === 0 || height === 0) return
    renderer.setSize(width, height, false)
    request()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()

  function onPointerMove(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect()
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1
    pointer.set(Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny)))
    request()
  }
  if (finePointer) window.addEventListener('pointermove', onPointerMove, { passive: true })

  function onLost(event: Event) {
    event.preventDefault()
    onContextLost()
  }
  canvas.addEventListener('webglcontextlost', onLost)

  function setLayout(layout: StageLayout) {
    const now = performance.now()
    const sameRoom = current?.roomId === layout.roomId
    const sameShape =
      sameRoom && current?.width === layout.width && current.height === layout.height
    if (!sameShape) {
      for (const node of nodes.values()) removeSeat(node)
      nodes = new Map()
      scale = WORLD / Math.max(layout.width, layout.height)
      const tallest = Math.max(...layout.seats.map((s) => Math.min(s.width, s.height) * scale))
      extent = {
        width: layout.width * scale,
        depth: layout.height * scale,
        height: tallest * 0.46,
      }
      // 앞줄부터 차례로 솟는다
      const order = [...layout.seats].sort((a, b) => a.y - b.y || a.x - b.x)
      order.forEach((seat, i) => {
        nodes.set(seat.seatId, addSeat(seat, now + i * RISE_STAGGER_MS))
      })
    } else {
      const next = new Map<string, SeatNode>()
      for (const seat of layout.seats) {
        const old = nodes.get(seat.seatId)
        if (
          old &&
          old.seat.tone === seat.tone &&
          old.seat.x === seat.x &&
          old.seat.y === seat.y &&
          old.seat.width === seat.width &&
          old.seat.height === seat.height
        ) {
          next.set(seat.seatId, old)
          continue
        }
        if (old) removeSeat(old)
        const node = addSeat(seat, old ? 0 : now)
        // 상태가 바뀐 블록만 한 번 들썩인다
        if (old) node.liftAt = now
        next.set(seat.seatId, node)
      }
      for (const [id, node] of nodes) if (!next.has(id)) removeSeat(node)
      nodes = next
    }
    current = layout
    request()
  }

  function dispose() {
    disposed = true
    if (frame) cancelAnimationFrame(frame)
    observer.disconnect()
    window.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('webglcontextlost', onLost)
    for (const g of geometries.values()) g.dispose()
    plane.dispose()
    for (const m of [
      glowMaterial,
      shadowMaterial,
      topMaterial,
      unknownFill,
      unknownLine,
      ...Object.values(materials),
    ]) {
      m.dispose()
    }
    for (const m of rings.values()) {
      m.map?.dispose()
      m.dispose()
    }
    radial.dispose()
    environment.dispose()
    renderer.dispose()
  }

  return { setLayout, dispose }
}
