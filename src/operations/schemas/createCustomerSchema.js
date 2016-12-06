module.exports = {
  type: 'object',
  properties: {
    username: {
      type: 'string'
    },
    password: {
      type: 'string'
    },
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },
    email: {
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
    },
    addresses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          },
          firstName: {
            type: 'string'
          },
          lastName: {
            type: 'string'
          },
          address: {
            type: 'string'
          },
          postCode: {
            type: 'number'
          },
          city: {
            type: 'string'
          },
          county: {
            type: 'string'
          },
          country: {
            type: 'string'
          },
          company: {
            type: 'string'
          },
          phone: {
            type: 'number'
          },
          instructions: {
            type: 'string'
          }
        },
        required: [
          'name',
          'firstName',
          'address',
          'postCode',
          'city',
          'county',
          'country'
        ]
      }
    }
  },
  required: [
    'username',
    'password',
    'firstName',
    'lastName'
  ],
  additionalProperties: true
};