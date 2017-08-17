'use strict'

let co = require('co')
let cli = require('heroku-cli-util')

function * run (context, heroku) {
  let delivery = yield heroku.request({
    path: `/apps/${context.app}/webhook-deliveries/${context.args.id}`,
    headers: {Accept: 'application/vnd.heroku+json; version=3.webhooks'},
    method: 'GET'
  })

  let event = yield heroku.request({
    path: `/apps/${context.app}/webhook-events/${delivery.event.id}`,
    headers: {Accept: 'application/vnd.heroku+json; version=3.webhooks'},
    method: 'GET'
  })

  let obj = {
    created_at: delivery.created_at,
    event: delivery.event.id,
    webhook: delivery.webhook.id,
    status: delivery.status,
    include: delivery.event.include,
    level: delivery.webhook.level,
    num_attempts: delivery.num_attempts,
    code: delivery.last_attempt && delivery.last_attempt.code,
    error_class: delivery.last_attempt && delivery.last_attempt.error_class,
    next_attempt_at: delivery.next_attempt_at
  }

  cli.styledHeader(delivery.id)
  cli.styledObject(obj)

  cli.styledHeader('Event Payload')
  cli.styledJSON(event.payload)
}

module.exports = {
  topic: 'webhooks',
  command: 'deliveries:info',
  description: 'info for a webhook event on an app',
  args: [{name: 'id'}],
  help: `Example:

 $ heroku webhooks:deliveries:info 99999999-9999-9999-9999-999999999999
`,
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(run))
}
