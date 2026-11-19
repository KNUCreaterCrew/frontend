import { commonLinks, scenarioGuide, type GuideLink } from '@mocks/scenarioGuide'
import { scenarios } from '@mocks/scenarios'
import type { MockingResult } from '@/app/enableMocking'
import { groupScenarios } from '../model/groupScenarios'
import { previewHref } from '../model/previewHref'

const LINK =
  'inline-flex min-h-tap items-center underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink'
const FALLBACK_LINKS: GuideLink[] = [
  { label: '방 목록', path: '/' },
  { label: '좌석도', path: '/rooms/IT4-101' },
]

function ScenarioLink({ href, label, title }: { href: string; label: string; title?: string }) {
  return (
    <a href={href} className={LINK}>
      {label}
      {title && <span className="sr-only">, {title}</span>}
    </a>
  )
}

function ScenarioRow({ name, current }: { name: string; current: boolean }) {
  const guide = Object.hasOwn(scenarioGuide, name) ? scenarioGuide[name] : undefined
  const links = guide?.links ?? FALLBACK_LINKS
  return (
    <li className="flex gap-1 border-b-2 border-ink">
      <span aria-hidden="true" className={`w-band shrink-0 ${current ? 'bg-ink' : ''}`.trim()} />
      <div className="min-w-0 flex-1 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="min-w-0 wrap-anywhere">
            {guide && <span className="text-body font-bold">{guide.title} </span>}
            <span className="font-num text-label text-ink-soft">{name}</span>
          </p>
          {current && <span className="shrink-0 text-label font-bold">지금 보는 중</span>}
        </div>
        {guide && <p className="mt-1 text-body text-ink-soft">{guide.description}</p>}
        <div className="mt-1 flex flex-wrap gap-x-4">
          {links.map((link) => (
            <ScenarioLink
              key={link.label}
              href={previewHref(name, link)}
              label={link.label}
              title={guide?.title}
            />
          ))}
        </div>
      </div>
    </li>
  )
}

export function ScenarioPicker({ scenario, unknownScenario }: MockingResult) {
  const groups = groupScenarios(Object.keys(scenarios))
  return (
    <main className="mt-6">
      <h1 className="text-title font-black tracking-tight">어떤 화면을 볼까요</h1>
      <p className="mt-4 text-body">
        실제 장치와 서버 없이 모의 데이터로 앱을 볼 수 있어요. 고르면 그 상태로 앱이 열려요. 이상한
        곳은 위 띠의 “의견”으로 남겨 주세요.
      </p>
      {unknownScenario !== null && (
        <p className="mt-4 text-body font-bold">
          모르는 시나리오예요: {unknownScenario}. 기본 시나리오(default)로 열었어요.
        </p>
      )}
      {groups.map((group) => (
        <section key={group.id} className="mt-6 border-t-6 border-ink">
          <h2 className="mt-3 mb-1 text-fact font-black">{group.title}</h2>
          <ul className="border-t-2 border-ink">
            {group.names.map((name) => (
              <ScenarioRow key={name} name={name} current={name === scenario} />
            ))}
          </ul>
        </section>
      ))}
      <section className="mt-6 border-t-6 border-ink">
        <h2 className="mt-3 mb-1 text-fact font-black">어느 시나리오에서나</h2>
        <div className="flex flex-wrap gap-x-4 border-t-2 border-ink">
          {commonLinks.map((link) => (
            <a key={link.label} href={previewHref(link.scenario, link)} className={LINK}>
              {link.label}
            </a>
          ))}
        </div>
      </section>
      <p className="mt-6 text-label text-ink-soft">
        새로고침해도 고른 시나리오가 유지돼요. 탭을 닫으면 기본으로 돌아가요.
      </p>
    </main>
  )
}
