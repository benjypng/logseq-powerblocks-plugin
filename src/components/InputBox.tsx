import React, { useState } from "react";

export default function InputBox(props: {
  getResponse: Function;
  question: string;
}) {
  const [blockId, setBlockId] = useState("");

  async function handleSubmit(e) {
    if (e.key === "Enter") {
      props.getResponse(blockId);
      setBlockId("");
    }
  }

  return (
    <div className="flex justify-center border border-black" tabIndex={-1}>
      <div className="absolute top-20 bg-white rounded-lg p-3 w-2/3 border flex flex-col">
        <input
          id="blockid-field"
          className="py-1 px-2 text-sm"
          name="blockId"
          type="text"
          placeholder={props.question}
          onChange={(e) => {
            setBlockId(e.target.value);
          }}
          value={blockId}
          onKeyDown={(e) => handleSubmit(e)}
        />
      </div>
    </div>
  );
}
