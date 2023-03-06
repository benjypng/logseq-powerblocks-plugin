import getPowerBlocks from "./getPowerBlocks";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import processPowerBlock from "./processPowerBlock";

export default async function handlePowerBlocks(
  type: string,
  uuid: string,
  pBlkId: string,
  input?: any
) {
  // All powerblocks templates and buttons are handled using this function.
  // For buttons, the first block should replace {{renderer}}
  // This function should be inserted in provideModel
  // For templates, the first block should just replace the first block
  // This function should be inserted in the menu React component

  // Get the template
  const { pBlk } = await getPowerBlocks(pBlkId);

  // Recursive function to handle children blocks
  async function recurse(arr: BlockEntity[], uuid: string) {
    for (const i of arr) {
      try {
        const blk = await logseq.Editor.insertBlock(
          uuid,
          await processPowerBlock(uuid, i.content, input ?? ""),
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

  if (type === "button") {
    const blk = await logseq.Editor.getBlock(uuid);

    let tempBlk = blk;
    for (let i = 0; i < pBlk.children.length; i++) {
      if (i === 0) {
        try {
          const content = await processPowerBlock(
            uuid,
            pBlk.children[i].content,
            input ?? ""
          );

          await logseq.Editor.updateBlock(
            uuid,
            blk!.content.replace(
              `{{renderer :powerblocks_, ${pBlkId}}}`,
              content
            )
          );

          if (pBlk.children[i].children.length > 0) {
            await recurse(pBlk.children[i].children, uuid);
          }
        } catch (e) {
          console.log(e);
        }
      } else {
        try {
          const content = await processPowerBlock(
            uuid,
            pBlk.children[i].content,
            input ?? ""
          );
          tempBlk = await logseq.Editor.insertBlock(tempBlk!.uuid, content, {
            before: false,
            sibling: true,
          });

          if (pBlk.children[i].children.length > 0) {
            await recurse(pBlk.children[i].children, tempBlk!.uuid);
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
  } else if (type === "template") {
    // Process template
    for (let b of pBlk.children.reverse()) {
      try {
        const content = await processPowerBlock(uuid, b.content);
        const blk = await logseq.Editor.insertBlock(uuid, content, {
          sibling: true,
        });

        if (b.children.length > 0) {
          await recurse(b.children, blk!.uuid);
        }
      } catch (e) {
        console.log(e);
      }
    }

    await logseq.Editor.removeBlock(uuid);
  }
}
