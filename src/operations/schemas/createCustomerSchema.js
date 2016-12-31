module.exports = {
  type: 'object',
  properties: {
    email: {
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
          address_1: {
            type: 'string'
          },
          address_2: {
            type: 'string'
          },
          postCode: {
            type: 'number'
          },
          city: {
            type: 'string'
          },
          state: {
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
          'address_1',
          'postCode',
          'city',
          'state',
          'country'
        ]
      }
    }
  },
  required: [
    'email',
    'password',
    'firstName',
    'lastName'
  ],
  additionalProperties: true
};