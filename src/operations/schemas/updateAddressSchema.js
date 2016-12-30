module.exports = {
  type: 'object',
  properties: {
    customerId: {
      type: 'string'
    },
    address: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        },
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
        'id',
        'name',
        'firstName',
        'address_1',
        'postCode',
        'city',
        'county',
        'country'
      ]
    }
  },
  required: [
    'customerId',
    'address'
  ]
};