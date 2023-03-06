import getTime from "../utils/getTime";
import getDateFromJournalDay from "../utils/getDateFromJournalDay";
import { getDateForPage, getDayInText } from "logseq-dateutils";
import checkIfCondition from "./checkIfCondition";
import * as chrono from "chrono-node";
import { getWeek, getWeekOfMonth } from "date-fns";
import getPageName from "./getPageName";

export default async function processPowerBlock(content: string, input?: any) {
  if (input !== "") {
    if (content.includes("<%INPUT:") && content.includes("%>")) {
      //@ts-expect-error
      Object.entries(input).map((i) => (content = content.replace(i[0], i[1])));
    }
  }

  if (content.includes("<%AND") && content.includes("%>")) {
    const regexp = /\<\%AND(.*)\%\>/;
    const matched = regexp.exec(content);
    const checkerArr = matched[1]
      .split("%>")
      .map((i) => i.replace("<%", "").trim())
      .filter((i) => i.length > 0);

    let state: boolean = true;
    for (const i of checkerArr) {
      state = checkIfCondition(i);
      if (state === false) break;
    }

    if (state) {
      content = content.replace(matched![0], "");
      return content;
    } else {
      return "";
    }
  } else if (content.includes("<%OR") && content.includes("%>")) {
    const regexp = /\<\%OR(.*)\%\>/;
    const matched = regexp.exec(content);
    const checkerArr = matched[1]
      .split("%>")
      .map((i) => i.replace("<%", "").trim())
      .filter((i) => i.length > 0);

    let state: boolean = false;
    for (const i of checkerArr) {
      state = checkIfCondition(i);
      if (state === true) break;
    }
    if (state) {
      content = content.replace(matched![0], "");
      return content;
    } else {
      return "";
    }
  }

  if (content.includes("<%IFDAYOFWEEK:") && content.includes("%>")) {
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);
    if (checkIfCondition(matched[1])) {
      content = content.replaceAll(matched![0], "");
    } else {
      return "";
    }
  }

  if (content.includes("<%IFMONTHOFYEAR:") && content.includes("%>")) {
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);
    if (checkIfCondition(matched[1])) {
      content = content.replaceAll(matched![0], "");
    } else {
      return "";
    }
  }

  if (content.includes("<%IFDATE:") && content.includes("%>")) {
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);

    if (checkIfCondition(matched[1], true)) {
      content = content.replaceAll(matched![0], "");
    } else {
      return "";
    }
  }

  if (content.includes("<%IFYEAR:") && content.includes("%>")) {
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);

    if (checkIfCondition(matched[1])) {
      content = content.replaceAll(matched![0], "");
    } else {
      return "";
    }
  }

  if (content.includes("<%IFWEEKOFMONTH:") && content.includes("%>")) {
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);

    if (checkIfCondition(matched[1])) {
      content = content.replaceAll(matched![0], "");
    } else {
      return "";
    }
  }

  if (content.includes("<%IFWEEKOFYEAR:") && content.includes("%>")) {
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);

    if (checkIfCondition(matched[1])) {
      content = content.replaceAll(matched![0], "");
    } else {
      return "";
    }
  }

  if (content.includes("<%DATE:") && content.includes("%>")) {
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);
    const dateToParse = matched![1].replace("DATE:", "").trim();

    const page = await logseq.Editor.getPage(
      (await logseq.Editor.getCurrentBlock())!.parent.id
    );

    const referenceDate = !page!["journal?"]
      ? new Date()
      : new Date(getDateFromJournalDay(page!.journalDay!));

    const date = chrono.parseDate(dateToParse, referenceDate);

    content = content.replaceAll(
      matched![0],
      getDateForPage(
        date,
        (await logseq.App.getUserConfigs()).preferredDateFormat
      )
    );
  }

  if (content.includes("<%RANDOMTAG:") && content.includes("%>")) {
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);

    const tag = matched![1].replace("RANDOMTAG:", "");
    content = content.replaceAll(
      matched![0],
      `
												#+BEGIN_QUERY
												{:title [:h2 "Random Quote 🎙"]
												 :query [:find (pull ?b [*])
												         :where
												         [?p :block/name "${tag}"]
												         (or [?b :block/refs ?p]
												         [?b :block/page ?p])
												    ]
												 :result-transform (fn [result]
												         [(rand-nth result)])
												 :breadcrumb-show? false
												}
												#+END_QUERY
			`
    );
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
      tValue: await getPageName(),
      type: "replace",
    },
    {
      tKey: "<%CURRENTPAGEURL%>",
      tValue: `logseq://graph/logseq?page=${await getPageName()}`,
      type: "replace",
    },
  ];

  for (const t of templateStrArr) {
    //@ts-expect-error
    content = content.replaceAll(t.tKey, t.tValue);
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
      `{{renderer :powerblocks_, ${pbToRender}}}`
    );
  }

  return content;
}
