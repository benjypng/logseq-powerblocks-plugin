import { BlockEntity } from "@logseq/libs/dist/LSPlugin";
import { ChangeEvent, useState } from "react";

import handlePowerBlocks from "../services/handlePowerBlocks";

export default function InputBox(props: {
  uuid: string;
  inputArr: string[];
  pBlkId: string;
  pBlk: BlockEntity;
}) {
  const [inputValues, setInputValues] = useState({});

  async function handleSubmit(e: ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    logseq.hideMainUI();
    await handlePowerBlocks("button", props.uuid, props.pBlkId, inputValues);
    props.inputArr.map((i) => {
      setInputValues({ [`${i}`]: "" });
    });
  }

  function getPlaceholder(content: string) {
    const regexp = /<%INPUT:(.*?)%>/;
    const matched = regexp.exec(content);
    return matched![1];
  }

  return (
    <div className="flex justify-center border border-black">
      <div
        className="absolute top-20 bg-white rounded-lg p-3 w-1/3 border flex flex-col"
        id="powerblocks-menu"
      >
        <form onSubmit={handleSubmit}>
          {props.inputArr.map((i: string) => (
            <input
              className="mb-3 py-2 px-2 border border-purple-600"
              autoFocus={true}
              type="text"
              placeholder={getPlaceholder(i)}
              name={i}
              onChange={(e) =>
                setInputValues((prevValue) => ({
                  ...prevValue,
                  [e.target.name]: e.target.value,
                }))
              }
              // @ts-ignore
              value={inputValues[i]}
            />
          ))}
          <button className="py-1 px-2" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
