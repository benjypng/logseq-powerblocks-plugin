import checkIfCondition from '../services/checkIfCondition'

export const handleIfMonthOfYear = (content: string): string => {
  if (content.includes('<%IFMONTHOFYEAR:') && content.includes('%>')) {
    const regexp = /<%(.*?)%>/
    const matched = regexp.exec(content)
    if (!matched || !matched[1]) return content

    if (checkIfCondition(matched[1])) {
      return content.replaceAll(matched![0], '')
    } else {
      return ''
    }
  }
  return content
}
