import "@logseq/libs";
import React from "react";
import ReactDOM from "react-dom";
import { BlockCursorPosition } from "@logseq/libs/dist/LSPlugin.user";
import handleClosePopup from "./handlePopup";
import PowerBlockMenu from "./components/PowerBlockMenu";
import generateUniqueId from "./utils/generateUniqueId";
import getPowerBlocks from "./services/getPowerBlocks";
import "./App.css";
import handlePowerBlocks from "./services/handlePowerBlocks";

async function main() {
  console.log("logseq-powerblocks-plugin loaded");

  // Handle close-popup
  handleClosePopup();

  logseq.provideStyle(`
	.powerblocks-btn {
		background-color: white;
		color: black;
		border-radius: 8px;
		border: 1px solid gray;
		padding: 1px 4px;
	}
`);

  // CREATE MENU
  await logseq.Editor.registerSlashCommand("Insert PowerBlock", async (e) => {
    const { rect } =
      (await logseq.Editor.getEditingCursorPosition()) as BlockCursorPosition;

    const { powerBlocksArr } = await getPowerBlocks();

    if (powerBlocksArr.length > 0) {
      logseq.showMainUI();
      ReactDOM.render(
        <React.StrictMode>
          <PowerBlockMenu
            rect={rect}
            allPowerBlocks={powerBlocksArr}
            uuid={e.uuid}
          />
        </React.StrictMode>,
        document.getElementById("app")
      );
    } else {
      logseq.UI.showMsg("You have no PowerBlocks created");
      return;
    }
  });

  // HANDLE POWER BLOCKS BUTTON
  logseq.App.onMacroRendererSlotted(async function ({ slot, payload }) {
    const [type, pBlkId] = payload.arguments;
    const uuid = payload.uuid;
    if (!type.startsWith(":powerblocks_")) return;

    logseq.provideModel({
      async render() {
        handlePowerBlocks("button", uuid, pBlkId);
      },
    });

    const uniqueId = generateUniqueId();
    logseq.provideUI({
      key: uniqueId,
      slot,
      reset: true,
      template: `<button data-slot-id=${uniqueId} data-on-click="render" class="powerblocks-btn">${pBlkId}</button>`,
    });
  });
}

logseq.ready(main).catch(console.error);
