import getTime from "../utils/getTime";
import getDateFromJournalDay from "../utils/getDateFromJournalDay";
import { getDateForPage, getDayInText } from "logseq-dateutils";
import * as chrono from "chrono-node";
import { differenceInCalendarWeeks, getWeek, getWeekOfMonth } from "date-fns";
import getPageName from "./getPageName";
import { handleAndOr } from "~/libs/handleAnd";
import { handleIfDayOfWeek } from "~/libs/handleIfDayOfWeek";
import { handleIfDate } from "~/libs/handleIfDate";
import { handleIfYear } from "~/libs/handleIfYear";
import { handleIfWeekOfMonth } from "~/libs/handleIfWeekOfMonth";
import { handleIfWeekOfYear } from "~/libs/handleIfWeekOfYear";
import { checkDate } from "~/libs/checkDate";

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

  if (content.includes("<%WEEKSSINCEDATE:") && content.includes("%>")) {
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);
    const startDate = chrono.parseDate(
      matched![1].replace("WEEKSSINCEDATE", "").trim(),
    );

    const difference = differenceInCalendarWeeks(new Date(), startDate);

    content = content.replaceAll(matched![0], difference.toString());
  }

  if (content.includes("<%RANDOMTAG:") && content.includes("%>")) {
    const regexp = /<%(.*?)%>/;
    const matched = regexp.exec(content);
    const tags = matched![1]
      ?.replace("RANDOMTAG:", "")
      .split(",")
      .map((i) => `[[${i.trim()}]]`)
      .join(" ");
    const query = await logseq.DB.q(`(or ${tags} (sample 1))`);
    if (!query) return;
    if (query.length === 0)
      await logseq.UI.showMsg("No reference found", "error");
    content = content.replaceAll(matched![0], `((${query[0].uuid}))`);
    await logseq.Editor.upsertBlockProperty(query[0].uuid, "id", query[0].uuid);
  }

  if (content.includes("<%SUM:") && content.includes("%>")) {
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);

    const varsArr = matched![1]
      .replace("SUM:", "")
      .split(",")
      .map((i) => parseFloat(i))
      .reduce((a, b) => a + b);
    content = content.replaceAll(matched[0], varsArr.toString());
  }

  if (content.includes("<%SIDEBAROPEN:") && content.includes("%>")) {
    const regexp = /\<\%SIDEBAROPEN:(.*?)\%\>/;
    const matched = regexp.exec(content);

    if (matched && matched[1]) {
      logseq.Editor.openInRightSidebar(matched[1]);
    }

    content = "";
  }

  if (content.includes("<%GETPROPERTY:") && content.includes("%>")) {
    const regexp = /\<\%GETPROPERTY:(.*?)\%\>/;
    const matched = regexp.exec(content);

    const [id, property] = matched[1].split(",");
    let result: string;
    if (id.startsWith("[[") && id.endsWith("]]")) {
      const page = await logseq.Editor.getPage(
        id.trim().replace("[[", "").replace("]]", ""),
      );
      result = await logseq.Editor.getBlockProperty(page.uuid, property);
    } else {
      result = await logseq.Editor.getBlockProperty(id.trim(), property);
    }

    content = result;
  }

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

  // Handle inline power blocks
  if (content.includes("<%PB:") && content.includes("%>")) {
    // Get power block ID
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);

    // Parse matched[1]
    const pbToRender = matched![1].replace("PB:", "").trim();
    content = content.replaceAll(
      matched![0],
      `{{renderer :powerblocks_, ${pbToRender}}}`,
    );
  }

  return content;
}
