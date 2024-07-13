import getTime from "../utils/getTime";
import { getDayInText } from "logseq-dateutils";
import { getWeek, getWeekOfMonth } from "date-fns";
import getPageName from "./getPageName";
import { handleAndOr } from "../libs/handleAndOr";
import { handleIfDayOfWeek } from "../libs/handleIfDayOfWeek";
import { handleIfDate } from "../libs/handleIfDate";
import { handleIfYear } from "../libs/handleIfYear";
import { handleIfWeekOfMonth } from "../libs/handleIfWeekOfMonth";
import { handleIfWeekOfYear } from "../libs/handleIfWeekOfYear";
import { checkDate } from "../libs/checkDate";
import { checkWeeksSinceDate } from "../libs/checkWeeksSinceDate";
import { handleRandomTag } from "../libs/handleRandomTag";
import { checkSum } from "../libs/checkSum";
import { sidebarOpen } from "../libs/sidebarOpen";
import { getProperty } from "../libs/getProperty";
import { handleInlinePowerblocks } from "../libs/handleInlinePowerblocks";

export default async function processPowerBlock(
  uuid: string,
  content: string,
  input?: string,
) {
  if (input && input !== "") {
    if (content.includes("<%INPUT:") && content.includes("%>")) {
      Object.entries(input).map(
        (i) => (content = content.replace(i[0], i[1].toString())),
      );
    }
  }

  // TODO: Convert to function so that the same content can be parsed through all the various methods.
  // This can also be used in the kanban and tablerender plugins?
  content = handleAndOr(content);

  content = handleIfDayOfWeek(content);

  content = handleIfDate(content);

  content = handleIfYear(content);

  content = handleIfWeekOfMonth(content);

  content = handleIfWeekOfYear(content);

  content = await checkDate(content);

  content = checkWeeksSinceDate(content);

  content = await handleRandomTag(content);

  content = checkSum(content);

  content = sidebarOpen(content);

  content = await getProperty(content);

  // Handle replacement of template strings
  const templateStrArr = [
    {
      tKey: "<%TIME%>",
      tValue: getTime(),
      type: "replace",
    },
    {
      tKey: "<%TIMEAMPM%>",
      tValue: getTime("ampm"),
      type: "replace",
    },
    {
      tKey: "<%DAY%>",
      tValue: getDayInText(new Date()),
      type: "replace",
    },
    {
      tKey: "<%WEEK%>",
      tValue: getWeek(new Date()),
      type: "replace",
    },
    {
      tKey: "<%WEEKOFMONTH%>",
      tValue: getWeekOfMonth(new Date()),
      type: "replace",
    },
    {
      tKey: "<%CURRENTPAGENAME%>",
      tValue: await getPageName(uuid),
      type: "replace",
    },
    {
      tKey: "<%CURRENTPAGEURL%>",
      tValue: `logseq://graph/logseq?page=${await getPageName(uuid)}`,
      type: "replace",
    },
  ];

  for (const t of templateStrArr) {
    content = content.replaceAll(t.tKey, t.tValue as string);
  }

  content = handleInlinePowerblocks(content);

  return content;
}
