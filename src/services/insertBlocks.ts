import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import processPowerBlock from "./processPowerBlock";

export default async function insertBlocks(
  uuid: string,
  pBlk: BlockEntity,
  input: string
) {
  // Recursive function to handle children blocks
  async function recurse(arr: BlockEntity[], uuid: string) {
    for (const i of arr) {
      try {
        const blk = await logseq.Editor.insertBlock(
          uuid,
          await processPowerBlock(i.content, input ?? ""),
          { sibling: false }
        );

        if (i.children!.length > 0) {
          await recurse(i.children as BlockEntity[], blk!.uuid);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  const blk = await logseq.Editor.getBlock(uuid);

  let tempBlk = blk;
  for (let i = 0; i < pBlk.children.length; i++) {
    if (i === 0) {
      try {
        const content = await processPowerBlock(
          (pBlk.children[i] as BlockEntity).content,
          input ?? ""
        );

        await logseq.Editor.updateBlock(uuid, content);

        if ((pBlk.children[i] as BlockEntity).children.length > 0) {
          await recurse(
            (pBlk.children[i] as BlockEntity).children as BlockEntity[],
            uuid
          );
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        const content = await processPowerBlock(
          (pBlk.children[i] as BlockEntity).content,
          input ?? ""
        );
        tempBlk = await logseq.Editor.insertBlock(tempBlk!.uuid, content, {
          before: false,
          sibling: true,
        });

        if ((pBlk.children[i] as BlockEntity).children.length > 0) {
          await recurse(
            (pBlk.children[i] as BlockEntity).children as BlockEntity[],
            tempBlk!.uuid
          );
        }
      } catch (e) {
        console.log(e);
        throw new Error("Unable to process button");
      }
    }
  }
}
