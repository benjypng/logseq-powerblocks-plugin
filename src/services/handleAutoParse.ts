import handlePowerBlocks from "./handlePowerBlocks";

export const autoParse = () => {
  logseq.DB.onChanged(async function ({ blocks }) {
    if (!blocks || blocks.length === 0) return;
    if (blocks.length === 2 && blocks[0]!.content) {
      const regexp = /\{\{\{(.*?)\}\}\}/;
      const matched = regexp.exec(blocks[0]!.content);
      if (matched) {
        try {
          const pBlkId = matched[1];
          if (!pBlkId) return;
          await handlePowerBlocks("autoParse", blocks[0]!.uuid, pBlkId);
        } catch (e) {
          console.log(e);
        }
      }
    }
  });
};
