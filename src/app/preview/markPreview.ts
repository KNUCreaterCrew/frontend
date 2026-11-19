const TITLE_PREFIX = '미리보기 '

/** 첫 프레임부터 띠 자리를 잡도록 render 전에 부른다. */
export function markPreviewDocument(): void {
  document.documentElement.classList.add('preview')
  if (!document.title.startsWith(TITLE_PREFIX)) {
    document.title = TITLE_PREFIX + document.title
  }
}
