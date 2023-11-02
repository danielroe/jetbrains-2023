import { OpenAI } from 'openai'

export default defineEventHandler(async event => {
    const token = useRuntimeConfig().openai.token
    const openai = new OpenAI({
        apiKey: token
    })
    const body = await readBody(event)
    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-16k',
        messages: [
            {
                role: 'system',
                content: 'You only speak JSON. You are a computer in charge of modifying elements of a Vue application to suit the needs of the user.'
            },
            {
                role: 'system',
                content: 'Here is the current state of the app in JSON format:\n\n' + JSON.stringify(body.malleables, null, 2)
            },
            {
                role: 'user',
                content: body.prompt
            },
            {
                role: 'system',
                content: 'Provide the new state of the app in JSON format:\n\n'
            }
        ]
    })
    const content = completion.choices[0].message.content
    if (!content) {
        throw createError({
            statusCode: 422,
            message: 'Could not parse response from OpenAI.'
        })
    }
    return {
        malleables: JSON.parse(content) as Record<string, any>
    }
})