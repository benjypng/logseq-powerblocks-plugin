import { format, getWeek, getWeekOfMonth } from 'date-fns'

import { checkDate } from '../libs/checkDate'
import { checkSum } from '../libs/checkSum'
import { checkWeeksSinceDate } from '../libs/checkWeeksSinceDate'
import { getProperty } from '../libs/getProperty'
import { handleAndOr } from '../libs/handleAndOr'
import { handleIfDate } from '../libs/handleIfDate'
import { handleIfDateOfMonth } from '../libs/handleIfDateOfMonth'
import { handleIfDayOfWeek } from '../libs/handleIfDayOfWeek'
import { handleIfMonthOfYear } from '../libs/handleIfMonthOfYear'
import { handleIfWeekOfMonth } from '../libs/handleIfWeekOfMonth'
import { handleIfWeekOfYear } from '../libs/handleIfWeekOfYear'
import { handleIfYear } from '../libs/handleIfYear'
import { handleInlinePowerblocks } from '../libs/handleInlinePowerblocks'
import { handleRandomTag } from '../libs/handleRandomTag'
import { sidebarOpen } from '../libs/sidebarOpen'
import getTime from '../utils/getTime'
import { getGraphUrl } from './getGraphUrl'
import getPageName from './getPageName'
import { getRandomPage } from './getRandomPage'

export default async function processPowerBlock(
  uuid: string,
  content: string,
  input?: Record<string, string> | string,
) {
  if (input && input !== '') {
    if (content.includes('<%INPUT:') && content.includes('%>')) {
      Object.entries(input).map(
        (i) => (content = content.replace(i[0], i[1].toString())),
      )
    }
  }

  // Handle templates with params
  content = handleAndOr(content)

  content = handleIfDayOfWeek(content)

  content = handleIfMonthOfYear(content)

  content = handleIfDate(content)

  content = handleIfYear(content)

  content = handleIfWeekOfMonth(content)

  content = handleIfWeekOfYear(content)

  content = handleIfDateOfMonth(content)

  content = await checkDate(content)

  content = checkWeeksSinceDate(content)

  content = await handleRandomTag(content)

  content = checkSum(content)

  content = sidebarOpen(content)

  content = await getProperty(content)

  // Handle templates without params
  const templateStrArr = [
    {
      tKey: '<%TIME%>',
      tValue: getTime(),
      type: 'replace',
    },
    {
      tKey: '<%TIMEAMPM%>',
      tValue: getTime('ampm'),
      type: 'replace',
    },
    {
      tKey: '<%DAY%>',
      tValue: format(new Date(), 'EEEE'),
      type: 'replace',
    },
    {
      tKey: '<%WEEK%>',
      tValue: getWeek(new Date()),
      type: 'replace',
    },
    {
      tKey: '<%WEEKOFMONTH%>',
      tValue: getWeekOfMonth(new Date()),
      type: 'replace',
    },
    {
      tKey: '<%CURRENTPAGENAME%>',
      tValue: await getPageName(uuid),
      type: 'replace',
    },
    {
      tKey: '<%CURRENTPAGEURL%>',
      tValue: `${await getGraphUrl()}?page=${encodeURIComponent(await getPageName(uuid))}`,
      type: 'replace',
    },
    {
      tKey: `<%RANDOMPAGE%>`,
      tValue: await getRandomPage(),
      type: 'replace',
    },
  ]

  for (const t of templateStrArr) {
    content = content.replaceAll(t.tKey, t.tValue as string)
  }

  content = handleInlinePowerblocks(content, uuid)

  return content
}
