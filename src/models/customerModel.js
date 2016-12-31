const shortId = require('shortid');

function modelFactory(base, configKeys) {
  const modelName = configKeys[configKeys.length - 1];

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
    address_1: { type: String, required: true },
    address_2: { type: String, required: false },
    postCode: { type: Number, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
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
    email: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
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
  schema.index({ email: 1 }, { unique: true });

  const model = base.db.model(modelName, schema);

  model.selectableFields = [
    'id',
    'email',
    'tags',
    'status'
  ];

  // Add the model to mongoose
  return model;
}

module.exports = modelFactory;
