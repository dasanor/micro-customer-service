module.exports = {
  type: 'object',
  properties: {
    customerId: {
      type: 'string'
    },
    addressId: {
      type: 'string'
    }
  },
  required: [
    'customerId',
    'addressId'
  ]
};