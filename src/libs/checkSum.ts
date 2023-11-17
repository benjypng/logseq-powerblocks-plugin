export const checkSum = (content: string): string => {
  if (content.includes("<%SUM:") && content.includes("%>")) {
    const regexp = /<%(.*?)%>/;
    const matched = regexp.exec(content);
    if (!matched || !matched[1]) return content;

    const varsArr = matched![1]
      .replace("SUM:", "")
      .split(",")
      .map((i) => parseFloat(i))
      .reduce((a, b) => a + b);
    return content.replaceAll(matched[0], varsArr.toString());
  } else {
    return content;
  }
};
