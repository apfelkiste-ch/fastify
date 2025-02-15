'use strict'

const {
  kFourOhFourContext,
  kReplySerializerDefault,
  kSchemaErrorFormatter,
  kErrorHandler,
  kReply,
  kRequest,
  kBodyLimit,
  kLogLevel,
  kContentTypeParser,
  kRouteByFastify,
  kRequestValidateWeakMap,
  kReplySerializeWeakMap,
  kPublicRouteContext
} = require('./symbols.js')

// Object that holds the context of every request
// Every route holds an instance of this object.
function Context ({
  schema,
  handler,
  config,
  errorHandler,
  bodyLimit,
  logLevel,
  logSerializers,
  attachValidation,
  validatorCompiler,
  serializerCompiler,
  replySerializer,
  schemaErrorFormatter,
  server,
  isFastify
}) {
  this.schema = schema
  this.handler = handler
  this.Reply = server[kReply]
  this.Request = server[kRequest]
  this.contentTypeParser = server[kContentTypeParser]
  this.onRequest = null
  this.onSend = null
  this.onError = null
  this.onTimeout = null
  this.preHandler = null
  this.onResponse = null
  this.preSerialization = null
  this.config = config
  this.errorHandler = errorHandler || server[kErrorHandler]
  this._middie = null
  this._parserOptions = {
    limit: bodyLimit || server[kBodyLimit]
  }
  this.logLevel = logLevel || server[kLogLevel]
  this.logSerializers = logSerializers
  this[kFourOhFourContext] = null
  this.attachValidation = attachValidation
  this[kReplySerializerDefault] = replySerializer
  this.schemaErrorFormatter =
    schemaErrorFormatter ||
    server[kSchemaErrorFormatter] ||
    defaultSchemaErrorFormatter
  this[kRouteByFastify] = isFastify

  this[kRequestValidateWeakMap] = null
  this[kReplySerializeWeakMap] = null
  this.validatorCompiler = validatorCompiler || null
  this.serializerCompiler = serializerCompiler || null

  // Route + Userland configurations for the route
  this[kPublicRouteContext] = getPublicRouteContext(this)

  this.server = server
}

function getPublicRouteContext (context) {
  return Object.create(null, {
    schema: {
      enumerable: true,
      get () {
        return context.schema
      }
    },
    config: {
      enumerable: true,
      get () {
        return context.config
      }
    }
  })
}

function defaultSchemaErrorFormatter (errors, dataVar) {
  let text = ''
  const separator = ', '

  // eslint-disable-next-line no-var
  for (var i = 0; i !== errors.length; ++i) {
    const e = errors[i]
    text += dataVar + (e.instancePath || '') + ' ' + e.message + separator
  }
  return new Error(text.slice(0, -separator.length))
}

module.exports = Context
