import { scenarioGroups, scenarioGuide } from '@mocks/scenarioGuide'

export type ScenarioGroup = { id: string; title: string; names: string[] }

export function groupScenarios(names: readonly string[]): ScenarioGroup[] {
  const groups: ScenarioGroup[] = scenarioGroups.map((group) => ({
    id: group.id,
    title: group.title,
    names: names.filter(
      (name) => Object.hasOwn(scenarioGuide, name) && scenarioGuide[name]?.group === group.id,
    ),
  }))
  const other = names.filter((name) => !Object.hasOwn(scenarioGuide, name))
  groups.push({ id: 'other', title: '그 밖의 시나리오', names: other })
  return groups.filter((group) => group.names.length > 0)
}
