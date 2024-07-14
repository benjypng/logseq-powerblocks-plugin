import './powerblocks-menu.css'

import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import {
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'

import handlePowerBlocks from '../services/handlePowerBlocks'

interface PowerBlocksMenuProps {
  rect: {
    x: number
    y: number
  }
  allPowerBlocks: BlockEntity[]
  uuid: string
}

const PowerBlocksMenu = ({
  rect: { x, y },
  allPowerBlocks,
  uuid,
}: PowerBlocksMenuProps): ReactNode => {
  const [searchInput, setSearchInput] = useState<string>('')
  const [data, setData] = useState<BlockEntity[]>(allPowerBlocks)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  const insertPowerBlock = useCallback(
    async (block: BlockEntity) => {
      const value = block.content
        .replace(
          /#powerblocks-button|#powerblocks|collapsed:: true|collapsed:: false/g,
          '',
        )
        .trim()

      if (block.content.includes('#powerblocks-button')) {
        // Insert powerblocks button
        await logseq.Editor.insertAtEditingCursor(
          `{{renderer :powerblocks_${uuid}, ${value}}}`,
        )
        await logseq.Editor.exitEditingMode(false)
      } else if (block.content.includes('#powerblocks')) {
        // Insert powerblocks template
        await handlePowerBlocks('template', uuid, value)
      }
      setSearchInput('')
      setSelectedIndex(0)
      logseq.hideMainUI()
    },
    [uuid],
  )

  useEffect(() => {
    const filteredBlocks = allPowerBlocks.filter((block) =>
      block.content.toLowerCase().includes(searchInput.toLowerCase()),
    )
    setData(filteredBlocks)
    setSelectedIndex(0)
  }, [searchInput, allPowerBlocks])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prevIndex) => (prevIndex + 1) % data.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(
            (prevIndex) => (prevIndex - 1 + data.length) % data.length,
          )
          break
        case 'Enter':
          e.preventDefault()
          if (data[selectedIndex]) {
            insertPowerBlock(data[selectedIndex])
          }
          break
      }
    },
    [data, selectedIndex, insertPowerBlock],
  )

  return (
    <div id="powerblocks-menu" style={{ left: x, top: y }}>
      <input
        type="text"
        placeholder="What are you looking for?"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="powerblocks-search-input"
      />
      <div className="powerblocks-section">
        {data.map((b, index) => {
          const icon =
            b.content.includes('#powerblocks-button') ||
            b.content.includes('#powerblocks-stickybutton')
              ? '⌘'
              : '📄'
          const content = b.content
            .replace(
              /#powerblocks-button|#powerblocks|collapsed:: true|collapsed:: false/g,
              '',
            )
            .trim()

          return (
            <div
              key={b.uuid}
              className={`powerblocks-menu-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => insertPowerBlock(b)}
            >
              <span className="powerblocks-icon">{icon}</span>
              <span className="powerblocks-content">{content}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PowerBlocksMenu
