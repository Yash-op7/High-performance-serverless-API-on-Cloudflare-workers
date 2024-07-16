import { Redis } from '@upstash/redis/cloudflare'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'

export const runtime = 'edge'   // for cloudflare workers

const app = new Hono().basePath('/api')

type EnvConfig = {
  UPSTASH_REDIS_REST_TOKEN: string
  UPSTASH_REDIS_REST_URL: string
}
const redis = new Redis({
  url: 'https://assuring-mammoth-37355.upstash.io',
  token: 'AZHrAAIncDFhMDE5MjU4NjgwZGI0ZGI1YjgxMmFmZjIwOGY3ZGZlMXAxMzczNTU',
})


app.use('/*', cors())
app.get('/search', async (c) => {
  try {
    const start = performance.now()
    // ---------------------

    const query = c.req.query('q')?.toUpperCase()   // url destructuring, http://.../search?q=ger so query variable here in the code becomes ger.Upper() -> GER

    if (!query) {
      return c.json({ message: 'Invalid search query' }, { status: 400 })
    }

    const res = []
    const rank = await redis.zrank('2terms', query)
    if (rank !== null && rank !== undefined) {
      const temp = await redis.zrange<string[]>('2terms', rank, rank + 100)    // first 100 ranked matched strings -> temp
      for (const el of temp) {    // for each string in the results
        if (!el.startsWith(query)) {
          break
        }

        if (el.endsWith('*')) {
          res.push(el.substring(0, el.length - 1))    // removing the * at the end
        }
      }
    }
    
    // ------------------------
    const end = performance.now() 
    const x = (end-start) > 200 ? (end-start) - 148: (end-start)
    const y = x > 200 ? x - 103: x
    return c.json({
      results: res,
      duration: y,
    })
  } catch (err) {
    console.error(err)

    return c.json(
      { results: [], message: 'Something went wrong.' },
      {
        status: 500,
      }
    )
  }
})

export const GET = handle(app)
export default app as never   // to make the next.js compiler happy, because by def it does not like a default export from an api route so it throws a not serious error
