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
  console.log(inputArr)
  const {
    register,
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>()

  useEffect(() => {
    ;(async () => {
      const clipboardContent = await window.navigator.clipboard.readText()
      if (clipboardContent == '' || !inputArr[0]) return
      setValue(inputArr[0].key, clipboardContent)
    })()
  }, [])

  const onSubmit = async (data: FormInputs) => {
    await handlePowerBlocks('button', uuid, pBlkId, data)
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
