import checkIfCondition from "../services/checkIfCondition";

export const handleAndOr = (content: string): string => {
  if (content.includes("<%AND") && content.includes("%>")) {
    const regexp = /<%AND(.*)%>/;
    const matched = regexp.exec(content);
    if (!matched || !matched[1]) return content;

    const checkerArr = matched[1]
      .split("%>")
      .map((i) => i.replace("<%", "").trim())
      .filter((i) => i.length > 0);

    let state = true;
    for (const i of checkerArr) {
      state = checkIfCondition(i);
      if (state === false) break;
    }

    if (state) {
      return content.replace(matched![0], "");
    } else {
      return content;
    }
  } else if (content.includes("<%OR") && content.includes("%>")) {
    const regexp = /<%OR(.*)%>/;
    const matched = regexp.exec(content);
    if (!matched || !matched[1]) return content;

    const checkerArr = matched[1]
      .split("%>")
      .map((i) => i.replace("<%", "").trim())
      .filter((i) => i.length > 0);

    let state = false;
    for (const i of checkerArr) {
      state = checkIfCondition(i);
      if (state === true) break;
    }
    if (state) {
      content = content.replace(matched![0], "");
      return content;
    } else {
      return content;
    }
  } else {
    return content;
  }
};
