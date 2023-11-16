import checkIfCondition from "~/services/checkIfCondition";

export const handleIfDayOfWeek = (content: string): string => {
  if (content.includes("<%IFDAYOFWEEK:") && content.includes("%>")) {
    const regexp = /<%(.*?)%>/;
    const matched = regexp.exec(content);
    if (!matched || !matched[1]) return content;

    if (checkIfCondition(matched[1])) {
      return content.replaceAll(matched![0], "");
    } else {
      return content;
    }
  }
  return content;
};
