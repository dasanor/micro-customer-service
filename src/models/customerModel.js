const shortId = require('shortid');

function modelFactory(base) {
  if (base.logger.isDebugEnabled()) base.logger.debug('[db] registering model Customer');

  const STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
  };

  // The address schema
  const addressSchema = base.db.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    address: { type: String, required: true },
    postCode: { type: Number, required: true },
    city: { type: String, required: true },
    county: { type: String, required: true },
    country: { type: String, required: true },
    company: { type: String, required: false },
    phone: { type: Number, required: false },
    instructions: { type: String, required: false }
  }, { _id: false });

  // Enable the virtuals when converting to JSON
  addressSchema.set('toJSON', {
    virtuals: true
  });

  // The root schema
  const schema = base.db.Schema({
    _id: {
      type: String, required: true, default: function () {
        return shortId.generate();
      }
    },
    username: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: false },
    addresses: [addressSchema],
    tags: [{ type: String, required: false }],
    status: {
      type: String,
      required: false,
      default: 'ACTIVE',
      enum: Object.keys(STATUS).map(s => STATUS[s])
    },
  }, { _id: false, timestamps: true });

  // Enable the virtuals when converting to JSON
  schema.set('toJSON', {
    virtuals: true
  });

  // Add a method to clean the object before sending it to the client
  schema.method('toClient', function () {
    const obj = this.toJSON();
    delete obj._id;
    delete obj.password;
    delete obj.__v;
    delete obj.createdAt;
    delete obj.updatedAt;
    return obj;
  });

  // Add the indexes
  schema.index({ username: 1 }, { unique: true });

  const model = base.db.model('Customer', schema);

  model.selectableFields = [
    'id',
    'username',
    'firstName',
    'lastName',
    'email',
    'tags',
    'status',
    'addresses'
  ];

  // Add the model to mongoose
  return model;
}

module.exports = modelFactory;
