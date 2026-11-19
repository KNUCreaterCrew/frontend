const NEW_ISSUE_URL = 'https://github.com/KNUCreaterCrew/frontend/issues/new'

export function feedbackUrl(input: { scenario: string; page: string }): string {
  const params = new URLSearchParams({
    template: 'preview-feedback.yml',
    title: `[미리보기] ${input.scenario}`,
    scenario: input.scenario,
    page: input.page,
  })
  return `${NEW_ISSUE_URL}?${params.toString()}`
}
