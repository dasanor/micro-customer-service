module.exports = {
  type: 'object',
  properties: {
    id: {
      type: 'string'
    },
    email: {
      type: 'string'
    },
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },
    tags: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    status: {
      type: 'string'
    }
  },
  required: [
    'id'
  ],
  additionalProperties: true
};