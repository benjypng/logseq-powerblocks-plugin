import "@logseq/libs";
import React from "react";
import ReactDOM from "react-dom";
import {
  BlockCursorPosition,
  BlockEntity,
} from "@logseq/libs/dist/LSPlugin.user";
import handleClosePopup from "./handlePopup";
import PowerBlockMenu from "./components/PowerBlockMenu";
import getPowerBlocks from "./services/getPowerBlocks";
import "./App.css";
import handlePowerBlocks from "./services/handlePowerBlocks";
import InputBox from "./components/InputBox";
import settings from "./services/settings";

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
        //@ts-expect-error
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
      [`pb-${slot}`]: async function () {
        const { pBlk } = await getPowerBlocks(pBlkId);

        // Recursively go through all child blocks of the power block and locate an input block. If there is an input block, popup an Input and pass the content below
        let inputArr: string[] = [];
        function findInput(arr: BlockEntity[]) {
          for (const i of arr) {
            if (i.content.includes("<%INPUT:") && i.content.includes("%>")) {
              const regexp = /\<\%INPUT\:(.*?)\%\>/;
              const matched = regexp.exec(i.content);
              inputArr.push(matched![0]);
            }

            if (i.children!.length > 0) {
              findInput(i.children as BlockEntity[]);
            }
          }
        }
        findInput(pBlk.children);

        if (inputArr.length > 0) {
          logseq.showMainUI();
          ReactDOM.render(
            <React.StrictMode>
              <InputBox
                uuid={uuid}
                inputArr={inputArr}
                pBlkId={pBlkId}
                pBlk={pBlk}
              />
            </React.StrictMode>,
            document.getElementById("app")
          );
        } else {
          handlePowerBlocks("button", uuid, pBlkId);
        }
      },
    });

    logseq.provideUI({
      key: slot,
      slot,
      reset: true,
      template: `<button data-slot-id=${slot} data-on-click="pb-${slot}" class="powerblocks-btn">${pBlkId}</button>`,
    });
  });

  if (logseq.settings!.autoParse) {
    logseq.DB.onChanged(async function ({ blocks }) {
      if (blocks.length === 2) {
        if (
          blocks[0].content.startsWith("{{{") &&
          blocks[0].content.endsWith("}}}")
        ) {
          try {
            const pBlkId = blocks[0].content
              .replace("{{{", "")
              .replace("}}}", "")
              .trim();
            await handlePowerBlocks("template", blocks[0].uuid, pBlkId);
          } catch (e) {
            console.log(e);
          }
        }
      }
    });
  }
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error);
