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
  background-color: #fff;
  border: 1px solid #d5d9d9;
  border-radius: 8px;
  box-shadow: rgba(213, 217, 217, .5) 0 2px 5px 0;
  box-sizing: border-box;
  color: #0f1111;
  cursor: pointer;
  display: inline-block;
  font-family: "Amazon Ember",sans-serif;
  font-size: 13px;
  line-height: 29px;
  padding: 0 10px 0 11px;
  position: relative;
  text-align: center;
  text-decoration: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: middle;
  width: 100px;
}

.powerblocks-btn:hover {
  background-color: #f7fafa;
}

.powerblocks-btn:focus {
  border-color: #008296;
  box-shadow: rgba(213, 217, 217, .5) 0 2px 5px 0;
  outline: 0;
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
      if (blocks.length === 2 && blocks[0].content) {
        const regexp = /\{\{\{(.*?)\}\}\}/;
        const matched = regexp.exec(blocks[0].content);
        if (matched) {
          try {
            const pBlkId = matched[1];
            await handlePowerBlocks("autoParse", blocks[0].uuid, pBlkId);
          } catch (e) {
            console.log(e);
          }
        }
      }
    });
  }
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error);
