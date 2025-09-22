import { Elysia, t } from 'elysia'
import { env } from 'cloudflare:workers'

export const kv = new Elysia({ prefix: '/kv', tags: ['KV'] })
	.get(
		'/list',
		async ({ query: { cursor } }) => {
			const list = await env.KV.list({
				limit: 100,
				cursor,
				prefix: 'kv/'
			})

			return list.keys.map(({ name }) => name.slice(3))
		},
		{
			query: t.Object({
				cursor: t.Optional(t.String())
			}),
			response: t.Array(t.String(), {
				maxItems: 100
			})
		}
	)
	.group('/:key', (app) =>
		app
			.get(
				'',
				async ({ params: { key }, status }) => {
					const v = await env.KV.get(`kv/${key}`)
					if (!v) return status(404, 'Not Found')

					return v
				},
				{
					response: {
						200: t.String(),
						404: t.Literal('Not Found')
					}
				}
			)
			.post(
				'',
				async ({ params: { key }, body }) => {
					await env.KV.put(`kv/${key}`, body)

					return body
				},
				{
					body: t.String(),
					response: t.String()
				}
			)
	)
