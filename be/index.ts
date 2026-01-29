import { Hono } from 'hono'
import demo from './src/routes/demo'
import { serve } from 'bun'
import { cors } from "hono/cors"
import game from './src/routes/game'

const app = new Hono()
app.get('/ping', (c) => c.text('pong'))




serve({
  fetch: app.fetch,
  port: 3001,
  hostname: "0.0.0.0",
})

app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
)
app.options("*", cors())

app.route('/api/demo', demo)
app.route("/api/game", game)

console.log('🚀 Demo backend running on http://localhost:3001')
