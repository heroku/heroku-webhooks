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
    'Created': delivery.created_at,
    'Event': delivery.event.id,
    'Webhook': delivery.webhook.id,
    'Status': delivery.status,
    'Include': delivery.event.include,
    'Level': delivery.webhook.level,
    'Attempts': delivery.num_attempts,
    'Code': delivery.last_attempt && delivery.last_attempt.code,
    'Error': delivery.last_attempt && delivery.last_attempt.error_class,
    'Next Attempt': delivery.next_attempt_at
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
