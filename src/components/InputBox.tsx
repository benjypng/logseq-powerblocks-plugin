import './inputbox.css'

import { BlockEntity } from '@logseq/libs/dist/LSPlugin'
import { Fragment, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import handlePowerBlocks from '../services/handlePowerBlocks'

interface InputBoxProps {
  uuid: string
  inputArr: { key: string; placeholder: string }[]
  pBlkId: string
  pBlk: BlockEntity
}

type FormInputs = Record<string, string>

const InputBox = ({ uuid, inputArr, pBlkId }: InputBoxProps) => {
  const {
    register,
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>()

  useEffect(() => {
    const getClipboard = async () => {
      const clipboardContent = await window.navigator.clipboard.readText()
      if (clipboardContent == '' || !inputArr[0]) return
      setValue(inputArr[0].key, clipboardContent)
    }
    getClipboard()
  }, [])

  const onSubmit = async (data: FormInputs) => {
    if (data.input?.startsWith('((') && data.input?.endsWith('))')) {
      // do something
      const blk = await logseq.Editor.getBlock(data.input.slice(2, -2))
      if (!blk) return

      await handlePowerBlocks('button', uuid, pBlkId, {
        input: blk.content,
      })
    } else {
      await handlePowerBlocks('button', uuid, pBlkId, data)
    }

    logseq.hideMainUI()
    reset()
  }

  return (
    <div id="powerblocks-input">
      <form onSubmit={handleSubmit(onSubmit)}>
        {inputArr.map((input, index) => (
          <Fragment key={index}>
            <input
              placeholder={input.placeholder}
              {...register(input.key, { required: true })}
            />
            {errors[input.key] && <span className="error-msg">Required</span>}
          </Fragment>
        ))}
        <div style={{ display: 'flex', gap: '5px' }}>
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
        </div>
      </form>
    </div>
  )
}

export default InputBox
