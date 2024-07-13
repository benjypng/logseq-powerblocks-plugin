import * as chrono from "chrono-node";
import { differenceInCalendarWeeks } from "date-fns";

export const checkWeeksSinceDate = (content: string): string => {
  if (content.includes("<%WEEKSSINCEDATE:") && content.includes("%>")) {
    const regexp = /<%(.*?)%>/;
    const matched = regexp.exec(content);
    if (!matched || !matched[1]) return content;

    const startDate = chrono.parseDate(
      matched![1].replace("WEEKSSINCEDATE", "").trim(),
    );

    const difference = differenceInCalendarWeeks(new Date(), startDate);

    return content.replaceAll(matched![0], difference.toString());
  } else {
    return content;
  }
};
