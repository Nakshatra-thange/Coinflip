import { Hono } from 'hono'
import demo from './src/routes/demo'
import { serve } from 'bun'

const app = new Hono()
app.get('/ping', (c) => c.text('pong'))

app.route('/api/demo', demo)

serve({
  fetch: app.fetch,
  port: 3000,
})

console.log('🚀 Demo backend running on http://localhost:3000')
