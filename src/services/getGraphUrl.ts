export const getGraphUrl = async (): Promise<string | void> => {
  const graph = await logseq.App.getCurrentGraph()
  if (!graph) return
  return `logseq://graph/${graph.name}`
}
