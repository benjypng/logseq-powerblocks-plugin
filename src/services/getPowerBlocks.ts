import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

export default async function getPowerBlocks(pBlkId?: string) {
  const query = `[:find (pull ?b [*])
                :where
         	(or [?p :block/name "powerblocks-button"] [?p :block/name "powerblocks"] [?p :block/name "powerblocks-stickybutton"])
         	[?b :block/refs ?p]]`
  let powerBlocksArr = await logseq.DB.datascriptQuery(query)
  powerBlocksArr = powerBlocksArr.map((i: BlockEntity[]) => i[0])
  if (pBlkId) {
    let pBlk = powerBlocksArr.filter(
      (i: BlockEntity) =>
        i.content
          .replace('#powerblocks-stickybutton', '')
          .replace('#powerblocks-button', '')
          .replace('#powerblocks', '')
          .replace('collapsed:: true', '')
          .replace('collapsed:: false', '')
          .trim() === pBlkId,
    )[0]
    pBlk = await logseq.Editor.getBlock(pBlk.uuid, { includeChildren: true })
    return { powerBlocksArr, pBlk }
  } else {
    return { powerBlocksArr }
  }
}
