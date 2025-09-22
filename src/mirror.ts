import { Elysia, t } from 'elysia'

export const mirror = new Elysia({ tags: ['mirror'] })
	.model({
		name: t.Object(
			{
				name: t.String()
			},
			{
				description: 'An object containing a name string'
			}
		)
	})
	.post('/mirror', ({ body }) => body, {
		body: 'name',
		response: 'name'
	})
	.post('/image', ({ body: { image } }) => image, {
		body: t.Object({
			image: t.File({ type: 'image', maxSize: '5m' })
		}),
		response: t.File()
	})
