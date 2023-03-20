import { BlockEntity } from "@logseq/libs/dist/LSPlugin";
import React, { useState } from "react";
import handlePowerBlocks from "../services/handlePowerBlocks";

export default function InputBox(props: {
  uuid: string;
  inputArr: string[];
  pBlkId: string;
  pBlk: BlockEntity;
}) {
  const [inputValues, setInputValues] = useState({});

  function handleChange(e) {
    setInputValues({ ...inputValues, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    logseq.hideMainUI();
    await handlePowerBlocks("button", props.uuid, props.pBlkId, inputValues);
    props.inputArr.map((i) => {
      setInputValues({ [`${i}`]: "" });
    });
  }

  function getPlaceholder(content: string) {
    const regexp = /\<\%INPUT\:(.*?)\%\>/;
    const matched = regexp.exec(content);

    return matched![1];
  }

  return (
    <div className="flex justify-center border border-black">
      <div
        className="absolute top-20 bg-white rounded-lg p-3 w-1/3 border flex flex-col"
        id="powerblocks-menu"
      >
        {props.inputArr.map((i: string) => (
          <input
            className="mb-3 py-2 px-2 border border-purple-600"
            type="text"
            placeholder={getPlaceholder(i)}
            name={i}
            onChange={handleChange}
            value={inputValues[i]}
          />
        ))}
        <button className="py-1 px-2" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}
