import './inputbox.css'

import { BlockEntity } from '@logseq/libs/dist/LSPlugin'
import { ChangeEvent, useEffect, useState } from 'react'

import handlePowerBlocks from '../services/handlePowerBlocks'

interface InputBoxProps {
  uuid: string
  inputArr: string[]
  pBlkId: string
  pBlk: BlockEntity
}

const InputBox = ({ uuid, inputArr, pBlkId }: InputBoxProps) => {
  const [inputValues, setInputValues] = useState<Record<string, string>>({})

  // Initialize inputValues with empty strings for all inputs
  useEffect(() => {
    const initialValues = inputArr.reduce(
      (acc, inputName) => {
        acc[inputName] = ''
        return acc
      },
      {} as Record<string, string>,
    )
    setInputValues(initialValues)
  }, [inputArr])

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    logseq.hideMainUI()
    await handlePowerBlocks('button', uuid, pBlkId, inputValues)
    setInputValues((prevValues) => {
      return Object.keys(prevValues).reduce(
        (acc, key) => {
          acc[key] = ''
          return acc
        },
        {} as Record<string, string>,
      )
    })
  }

  const getPlaceholder = (content: string) => {
    const regexp = /<%INPUT:(.*?)%>/
    const matched = regexp.exec(content)
    return matched![1]
  }

  return (
    <div id="powerblocks-input">
      <form onSubmit={handleSubmit}>
        {inputArr.map((i: string, index) => (
          <input
            key={index}
            autoFocus={index === 0}
            type="text"
            placeholder={getPlaceholder(i)}
            value={inputValues[i] || ''}
            name={i}
            onChange={(e) =>
              setInputValues((prevValue) => ({
                ...prevValue,
                [e.target.name]: e.target.value,
              }))
            }
          />
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default InputBox
