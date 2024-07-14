import '@logseq/libs'

import {
  BlockCursorPosition,
  BlockEntity,
} from '@logseq/libs/dist/LSPlugin.user'
import { createRoot } from 'react-dom/client'

import InputBox from './components/InputBox'
import PowerBlocksMenu from './components/PowerBlocksMenu'
import { handlePopup } from './handlePopup'
import css from './index.css?raw'
import getPowerBlocks from './services/getPowerBlocks'
import { autoParse } from './services/handleAutoParse'
import handlePowerBlocks from './services/handlePowerBlocks'
import settings from './services/settings'

const main = async () => {
  console.log('logseq-powerblocks-plugin loaded')

  logseq.provideStyle(css)
  handlePopup()

  // Create root for menu
  const container = document.getElementById('app')
  if (!container) return
  const root = createRoot(container)

  // CREATE MENU
  await logseq.Editor.registerSlashCommand('Insert PowerBlock', async (e) => {
    const { rect } =
      (await logseq.Editor.getEditingCursorPosition()) as BlockCursorPosition

    const { powerBlocksArr } = await getPowerBlocks()

    if (powerBlocksArr.length > 0) {
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
  logseq.App.onMacroRendererSlotted(
    async ({ slot, payload: { uuid, arguments: args } }) => {
      const [type, pBlkId] = args
      if (!type || !type.startsWith(':powerblocks_') || !pBlkId) return
      const slotId = `${pBlkId}_${uuid}_${slot}`

      logseq.provideModel({
        [`pb-${slot}`]: async () => {
          const { pBlk } = await getPowerBlocks(pBlkId)
          // Recursively go through all child blocks of the power block and locate an input block. If there is an input block, popup an Input and pass the content below
          const inputArr: { key: string; placeholder: string }[] = []
          const findInput = (blocks: BlockEntity[]) => {
            for (const block of blocks) {
              const inputBlock = /<%INPUT:(.+?)%>/.exec(block.content)
              if (inputBlock) {
                inputArr.push({
                  key: inputBlock[0]!,
                  placeholder: inputBlock[1]!,
                })
              }
              if (block.children) {
                findInput(block.children as BlockEntity[])
              }
            }
          }
          findInput(pBlk.children)
          if (inputArr.length > 0) {
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
        key: slotId,
        slot,
        reset: true,
        template: `<button id=${slotId} data-on-click="pb-${slot}" class="powerblocks-btn">${pBlkId}</button>`,
      })
    },
  )

  if (logseq.settings!.autoParse) {
    autoParse()
  }
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error)
