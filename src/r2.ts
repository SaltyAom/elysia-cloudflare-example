import { Elysia, t } from 'elysia'
import { env } from 'cloudflare:workers'
import { fileTypeFromBlob } from 'file-type'

export const r2 = new Elysia({ prefix: '/r2', tags: ['R2'] })
	.get(
		'/list',
		async ({ query: { cursor } }) => {
			const list = await env.image.list({
				limit: 100,
				cursor,
				prefix: 'image/'
			})

			return list.objects.map(({ key }) => key.slice(6))
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
				async ({ params: { key }, status, set }) => {
					const image = await env.image.get(`image/${key}`)
					if (!image) return status(404, 'Not Found')

					let [blob, mime] = await Promise.all([
						image.blob() as Promise<File>,
						env.KV.get(`image/${key}`)
					])
					if (!mime) {
						const fileType = await fileTypeFromBlob(blob)
						if (fileType) {
							mime = fileType.mime
							await env.KV.put(`image/${key}`, mime)
						}
					}

					set.headers['content-type'] = mime!

					return blob
				},
				{
					response: {
						200: t.File(),
						404: t.Literal('Not Found')
					}
				}
			)
			.post(
				'',
				async ({ params: { key }, body: { image } }) => {
					await env.image.put(`image/${key}`, image)
					await env.KV.put(`image/${key}`, image.type)

					return image
				},
				{
					body: t.Object({
						image: t.File({ type: 'image', maxSize: '2m' })
					}),
					response: t.File()
				}
			)
	)
