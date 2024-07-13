import '@logseq/libs'

import {
  BlockCursorPosition,
  BlockEntity,
} from '@logseq/libs/dist/LSPlugin.user'
import { createRoot } from 'react-dom/client'

import InputBox from './components/InputBox'
import PowerBlocksMenu from './components/PowerBlocksMenu'
import { handleClosePopup } from './handlePopup'
import css from './index.css?raw'
import getPowerBlocks from './services/getPowerBlocks'
import { autoParse } from './services/handleAutoParse'
import handlePowerBlocks from './services/handlePowerBlocks'
import settings from './services/settings'

const main = async () => {
  console.log('logseq-powerblocks-plugin loaded')

  logseq.provideStyle(css)
  handleClosePopup()

  // CREATE MENU
  await logseq.Editor.registerSlashCommand('Insert PowerBlock', async (e) => {
    const { rect } =
      (await logseq.Editor.getEditingCursorPosition()) as BlockCursorPosition

    const { powerBlocksArr } = await getPowerBlocks()

    if (powerBlocksArr.length > 0) {
      const container = document.getElementById('app')
      if (!container) return
      const root = createRoot(container)
      root.render(
        <PowerBlocksMenu
          rect={rect}
          allPowerBlocks={powerBlocksArr}
          uuid={e.uuid}
        />,
      )
      logseq.showMainUI()
    } else {
      logseq.UI.showMsg('You have no PowerBlocks created')
      return
    }
  })

  // HANDLE POWER BLOCKS BUTTON
  logseq.App.onMacroRendererSlotted(async function ({ slot, payload }) {
    const [type, pBlkId] = payload.arguments
    const uuid = payload.uuid
    if (!type || !type.startsWith(':powerblocks_') || !pBlkId) return

    logseq.provideModel({
      [`pb-${slot}`]: async function () {
        const { pBlk } = await getPowerBlocks(pBlkId)
        // Recursively go through all child blocks of the power block and locate an input block. If there is an input block, popup an Input and pass the content below
        const inputArr: string[] = []
        const findInput = (arr: BlockEntity[]) => {
          for (const i of arr) {
            if (i.content.includes('<%INPUT:') && i.content.includes('%>')) {
              const regexp = /<%INPUT:(.*?)%>/
              const matched = regexp.exec(i.content)
              inputArr.push(matched![0])
            }
            if (i.children!.length > 0) {
              findInput(i.children as BlockEntity[])
            }
          }
        }
        findInput(pBlk.children)
        if (inputArr.length > 0) {
          const container = document.getElementById('app')
          const root = createRoot(container!)
          root.render(
            <InputBox
              uuid={uuid}
              inputArr={inputArr}
              pBlkId={pBlkId}
              pBlk={pBlk}
            />,
          )
          logseq.showMainUI()
        } else {
          handlePowerBlocks('button', uuid, pBlkId)
        }
      },
    })

    logseq.provideUI({
      key: slot,
      slot,
      reset: true,
      template: `<button data-slot-id=${slot} data-on-click="pb-${slot}" class="powerblocks-btn">${pBlkId}</button>`,
    })
  })

  if (logseq.settings!.autoParse) {
    autoParse()
  }
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error)
