import { Elysia, t } from 'elysia'
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker'
import { openapi } from '@elysiajs/openapi'

import { kv } from './kv'
import { r2 } from './r2'
import { mirror } from './mirror'

export default new Elysia({
	adapter: CloudflareAdapter
})
	.use(
		openapi({
			documentation: {
				info: {
					title: 'Elysia on Cloudflare',
					version: '0.1.0',
					description:
						'Elysia running on Cloudflare Worker with R2 and KV'
				}
			}
		})
	)
	.get('/', ({ redirect }) => redirect('/'), {
		detail: {
			hide: true
		}
	})
	.use(kv)
	.use(r2)
	.use(mirror)
	.compile()
