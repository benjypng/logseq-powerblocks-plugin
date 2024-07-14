import './inputbox.css'

import { BlockEntity } from '@logseq/libs/dist/LSPlugin'
import { Fragment, useState } from 'react'
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
  const { register, reset, handleSubmit } = useForm<FormInputs>()

  const onSubmit = async (data: FormInputs) => {
    await handlePowerBlocks('button', uuid, pBlkId, data)
    logseq.hideMainUI()
    reset()
  }

  return (
    <div id="powerblocks-input">
      <form onSubmit={handleSubmit(onSubmit)}>
        {inputArr.map((input, index) => (
          <input
            key={index}
            placeholder={input.placeholder}
            {...register(input.key, { required: true })}
          />
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default InputBox
