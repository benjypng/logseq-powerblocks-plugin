import getPowerBlocks from "./getPowerBlocks";
import insertBlocks from "./insertBlocks";

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

  // Process the power blocks
  // Process buttons
  if (type === "button") {
    insertBlocks(uuid, pBlk, input);
  } else if (type === "template") {
    insertBlocks(uuid, pBlk, input);
  }
}
