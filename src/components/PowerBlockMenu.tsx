import React, { useEffect } from "react";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import handlePowerBlocks from "../services/handlePowerBlocks";

export default function PowerBlockMenu(props: {
  rect: DOMRect;
  allPowerBlocks: BlockEntity[];
  uuid: string;
}) {
  const containerStyle = {
    position: "absolute",
    padding: 3 + "px",
    top: props.rect.top + "px",
    left: props.rect.left + "px",
    display: "flex",
    flexDirection: "column",
    zIndex: 99,
  };

  useEffect(() => {
    (
      document.querySelector("#powerblocks-menu")
        ?.firstElementChild as HTMLElement
    ).focus();
  }, []);

  async function insertPowerBlock(e: any) {
    logseq.hideMainUI();

    if (e.target.value.includes("#powerblocks-button")) {
      // Insert powerblocks button
      await logseq.Editor.insertAtEditingCursor(
        `{{renderer :powerblocks_, ${e.target.value
          .replace("#powerblocks-button", "")
          .trim()}}}`
      );
      await logseq.Editor.exitEditingMode(false);

      // Insert powerblocks template
    } else if (e.target.value.includes("#powerblocks")) {
      handlePowerBlocks(
        "template",
        props.uuid,
        e.target.value.replace("#powerblocks", "").trim()
      );
    }
  }

  return (
    <React.Fragment>
      {/*@ts-expect-error*/}
      <div style={containerStyle} id="powerblocks-menu">
        {props.allPowerBlocks.map((b: BlockEntity) => (
          <button
            autoFocus={true}
            value={b.content.trim()}
            onClick={insertPowerBlock}
            className="menu-button py-2 px-4 bg-white hover:bg-gray-800 hover:text-white border focus:bg-gray-800 focus:text-white"
          >
            {b.content
              .replace("#powerblocks-button", "⏺")
              .replace("#powerblocks", "📃")
              .replace("collapsed:: true", "")
              .trim()}
          </button>
        ))}
      </div>
    </React.Fragment>
  );
}
