import axios from 'axios'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { serverEnv } from '@/app/lib/env.server'

const bodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  message: z.string(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, message, phone } = bodySchema.parse(body)
    const webhookUrl = serverEnv.hooks.webhookUrl

    const messageData = {
      embeds: [
        {
          title: 'Mensagem de Contato',
          color: 0x4983f5,
          fields: [
            {
              name: 'Nome',
              value: name,
              inline: true,
            },
            {
              name: 'E-mail',
              value: email,
              inline: true,
            },
            {
              name: 'Telefone',
              value: phone,
            },
            {
              name: 'Mensagem',
              value: message,
            },
          ],
        },
      ],
    }

    await axios.post(webhookUrl, messageData)

    return NextResponse.json({
      message: 'Mensagem enviada com sucesso!',
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected error',
      },
      { status: 500 },
    )
  }
}
