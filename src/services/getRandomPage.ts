const getSecureRandomString = (array: string[]): string => {
  if (array.length === 0) return ''
  const randomBuffer = new Uint32Array(1)
  crypto.getRandomValues(randomBuffer)
  if (!randomBuffer[0]) return ''
  const randomIndex = randomBuffer[0] % array.length
  if (!array[randomIndex]) return ''
  return array[randomIndex]
}

export const getRandomPage = async () => {
  const query = `[:find ?name
         :where
         [?p :block/name ?name]]`
  let results = await logseq.DB.datascriptQuery(query)
  results = results.map((r: string[]) => r[0])
  const randomPage = getSecureRandomString(results)
  if (randomPage == '') return
  const page = await logseq.Editor.getPage(randomPage)
  if (!page) return
  return `[[${page.originalName}]]`
}
