const shortId = require('shortid');

const Code = require('code');
const Lab = require('lab');
const nock = require('nock');
const request = require('supertest-as-promised');

// shortcuts
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const beforeEach = lab.beforeEach;
const after = lab.after;
const it = lab.it;
const expect = Code.expect;

const base = require('../index.js');
const app = base.transports.http.app;

const defaultHeaders = base.config.get('test:defaultHeaders');

const defaultEmail = 'john.doe@gmail.com';
let defaultCustomerId = null;
let defaultAddressId = null;

// Check the environment
if (process.env.NODE_ENV !== 'test') {
  console.log('\n[test] THIS ENVIRONMENT IS NOT FOR TEST!\n');
  process.exit(1);
}

// Check the database
if (!base.db.url.includes('test')) {
  console.log('\n[test] THIS DATABASE IS NOT A TEST DATABASE!\n');
  process.exit(1);
}

// Helper to clean the DB
function cleaner(callback) {
  const db = base.db.connections[0];
  var count = Object.keys(db.collections).length;
  Object.keys(db.collections).forEach(colName => {
    const collection = db.collections[colName];
    collection.drop(() => {
      if (--count <= 0 && callback) {
        callback();
      }
    });
  });
}

// Helper to clean the database
function cleanDB(done) {
  cleaner(done);
}

// Helper to initialize the database
function initDB(done) {
  cleanDB(() => {
    createCustomer(defaultEmail)
      .then(response => {
        defaultCustomerId = response.body.customer.id;
        defaultAddressId = response.body.customer.addresses[0].id;
        done();
      })
  });
}

// Helper to inject a call with default parameters
function callService(options) {
  options.method = options.method || 'POST';
  options.headers = options.headers || defaultHeaders;
  const promise = request(app)[options.method.toLowerCase()](options.url);
  Object.keys(options.headers).forEach(key => {
    promise.set(key, options.headers[key]);
  });
  if (options.payload) promise.send(options.payload);
  return promise;
}

// Helper to create customer
function createCustomer(email, country) {
  return callService({
    url: '/services/customer/v1/customer.create',
    payload: {
      email: email,
      password: 'mypassword',
      firstName: 'John',
      lastName: 'Doe',
      tags: ['VIP'],
      status: 'ACTIVE',
      addresses: [{
        name: 'Home',
        firstName: 'John',
        lastName: 'Doe',
        address_1: '1650 Bolman Court',
        address_2: '10',
        postCode: 61701,
        city: 'Bloomington',
        state: 'Illinois',
        country: country || 'US',
        company: 'My Company',
        phone: 2173203531,
        instructions: 'Instructions'
      }]
    }
  })
}


/*
 Customer Tests
 */
describe('Customer', () => {
  beforeEach(done => {
    initDB(done);
  });
  after(done => {
    cleanDB(done);
  });

  it('create a customer', done => {
    createCustomer('test@testemail.com')
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(true);
        const customer = result.customer;

        expect(customer.id).to.be.a.string();
        expect(customer.email).to.be.a.string().and.to.equal('test@testemail.com');
        expect(customer.firstName).to.be.a.string().and.to.equal('John');
        expect(customer.lastName).to.be.a.string().and.to.equal('Doe');
        expect(customer.status).to.be.a.string().and.to.equal('ACTIVE');
        expect(customer.tags[0]).to.be.a.string().and.to.equal('VIP');

        const address = customer.addresses[0];
        expect(address.name).to.be.a.string().and.to.equal('Home');
        expect(address.firstName).to.be.a.string().and.to.equal('John');
        expect(address.lastName).to.be.a.string().and.to.equal('Doe');
        expect(address.address_1).to.be.a.string().and.to.equal('1650 Bolman Court');
        expect(address.address_2).to.be.a.string().and.to.equal('10');
        expect(address.postCode).to.be.a.number().and.to.equal(61701);
        expect(address.city).to.be.a.string().and.to.equal('Bloomington');
        expect(address.state).to.be.a.string().and.to.equal('Illinois');
        expect(address.country).to.be.a.string().and.to.equal('US');
        expect(address.company).to.be.a.string().and.to.equal('My Company');
        expect(address.phone).to.be.a.number().and.to.equal(2173203531);
        expect(address.instructions).to.be.a.string().and.to.equal('Instructions');

        done();
      })
      .catch((error) => done(error));
  });

  it('create a customer fail, invalid email', done => {
    createCustomer('testemail.com')
      .then(response => {
        //expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('customer_invalid_email');

        done();
      })
      .catch((error) => done(error));
  });

  it('create a customer fail, invalid country', done => {
    createCustomer('test@testemail.com', 'United States')
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('address_contry_invalid');

        done();
      })
      .catch((error) => done(error));
  });

  it('customer info', done => {
    createCustomer('test1@testemail.com')
      .then(response => {
        const result = response.body;
        const customerId = result.customer.id;

        return callService({
          url: '/services/customer/v1/customer.info',
          payload: {
            id: customerId
          }
        });
      })
      .then(response => {
        const result = response.body;
        expect(result.ok).to.equal(true);
        const customer = result.customer;

        expect(customer.email).to.be.a.string().and.to.equal('test1@testemail.com');

        done();
      })
      .catch((error) => done(error));
  });

  it('customer info not found', done => {

    callService({
      url: '/services/customer/v1/customer.info',
      payload: {
        id: 'id'
      }
    })
      .then(response => {
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('customer_not_found');

        done();
      })
      .catch((error) => done(error));
  });

  it('customer remove', done => {
    createCustomer('test1@testemail.com')
      .then(response => {
        const result = response.body;
        const customerId = result.customer.id;

        return callService({
          url: '/services/customer/v1/customer.remove',
          payload: {
            id: customerId
          }
        });
      })
      .then(response => {
        const result = response.body;
        expect(result.ok).to.equal(true);

        done();
      })
      .catch((error) => done(error));
  });

  it('customer remove not found', done => {

    callService({
      url: '/services/customer/v1/customer.remove',
      payload: {
        id: 'id'
      }
    })
      .then(response => {
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('customer_not_found');

        done();
      })
      .catch((error) => done(error));
  });

  it('customer update', done => {
    createCustomer('testupdate@testemail.com')
      .then(response => {
        const result = response.body;
        const customerId = result.customer.id;

        return callService({
          url: '/services/customer/v1/customer.update',
          payload: {
            id: customerId,
            firstName: 'JohnUpdate',
            lastName: 'DoeUpdate',
          }
        });
      })
      .then(response => {
        const result = response.body;
        expect(result.ok).to.equal(true);
        const customer = result.customer;

        expect(customer.email).to.be.a.string().and.to.equal('testupdate@testemail.com');
        expect(customer.firstName).to.be.a.string().and.to.equal('JohnUpdate');
        expect(customer.lastName).to.be.a.string().and.to.equal('DoeUpdate');

        done();
      })
      .catch((error) => done(error));
  });

  it('customer update not found', done => {

    callService({
      url: '/services/customer/v1/customer.update',
      payload: {
        id: 'id'
      }
    })
      .then(response => {
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('customer_not_found');

        done();
      })
      .catch((error) => done(error));
  });

  it('customer list', done => {

    callService({
      url: '/services/customer/v1/customer.list',
      payload: {
        email: defaultEmail
      }
    })
      .then(response => {
        const result = response.body;
        expect(result.ok).to.equal(true);
        const data = result.data;

        expect(data.length).to.be.a.number().and.to.equal(1);
        expect(data[0].email).to.be.a.string().and.to.equal(defaultEmail);

        done();
      })
      .catch((error) => done(error));
  });

  it('customer list without result', done => {

    callService({
      url: '/services/customer/v1/customer.list',
      payload: {
        email: 'fakeEmail'
      }
    })
      .then(response => {
        const result = response.body;
        expect(result.ok).to.equal(true);
        const data = result.data;

        expect(data.length).to.be.a.number().and.to.equal(0);

        done();
      })
      .catch((error) => done(error));
  });

  it('customer check credentials', done => {
    const email = 'usertest@testemail.com';
    createCustomer(email)
      .then(response => {
        return callService({
          url: '/services/customer/v1/customer.checkCredentials',
          payload: {
            email: email,
            password: 'mypassword'
          }
        });
      })
      .then(response => {
        const result = response.body;
        expect(result.ok).to.equal(true);

        done();
      })
      .catch((error) => done(error));
  });

  it('customer check credentials, bad credentials', done => {
    const email = 'usertest@testemail.com';
    createCustomer(email)
      .then(response => {
        return callService({
          url: '/services/customer/v1/customer.checkCredentials',
          payload: {
            email: email,
            password: 'wrongpassword'
          }
        });
      })
      .then(response => {
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('bad_credentials');

        done();
      })
      .catch((error) => done(error));
  });

  it('customer create address', done => {

    callService({
      url: '/services/customer/v1/customer.address.create',
      payload: {
        customerId: defaultCustomerId,
        addresses: [{
          name: 'Work',
          firstName: 'John',
          lastName: 'Doe',
          address_1: 'Colon 20',
          postCode: 46004,
          city: 'Valencia',
          state: 'Valencia',
          country: 'ES',
          company: 'MyCompany',
          phone: 961667897,
          instructions: 'Some Instructions'
        }]
      }
    })
      .then(response => {
        const result = response.body;
        expect(result.ok).to.equal(true);
        const customer = result.customer;
        const addresses = customer.addresses;
        expect(addresses.length).to.be.a.number().and.to.equal(2);
        const newAddress = addresses.filter(a => a.name == 'Work')[0];

        expect(newAddress.name).to.be.a.string().and.to.equal('Work');
        expect(newAddress.firstName).to.be.a.string().and.to.equal('John');
        expect(newAddress.lastName).to.be.a.string().and.to.equal('Doe');
        expect(newAddress.address_1).to.be.a.string().and.to.equal('Colon 20');
        expect(newAddress.postCode).to.be.a.number().and.to.equal(46004);
        expect(newAddress.city).to.be.a.string().and.to.equal('Valencia');
        expect(newAddress.state).to.be.a.string().and.to.equal('Valencia');
        expect(newAddress.country).to.be.a.string().and.to.equal('ES');
        expect(newAddress.company).to.be.a.string().and.to.equal('MyCompany');
        expect(newAddress.phone).to.be.a.number().and.to.equal(961667897);
        expect(newAddress.instructions).to.be.a.string().and.to.equal('Some Instructions');

        done();
      })
      .catch((error) => done(error));
  });

  it('customer create address, invalid country', done => {

    callService({
      url: '/services/customer/v1/customer.address.create',
      payload: {
        customerId: defaultCustomerId,
        addresses: [{
          name: 'Work',
          firstName: 'John',
          lastName: 'Doe',
          address_1: 'Colon 20',
          postCode: 46004,
          city: 'Valencia',
          state: 'Valencia',
          country: 'Spain',
          company: 'MyCompany',
          phone: 961667897,
          instructions: 'Some Instructions'
        }]
      }
    })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('address_contry_invalid');


        done();
      })
      .catch((error) => done(error));
  });

  it('customer create address, customer not found', done => {

    callService({
      url: '/services/customer/v1/customer.address.create',
      payload: {
        customerId: 'id',
        addresses: [{
          name: 'Work',
          firstName: 'John',
          lastName: 'Doe',
          address_1: 'Colon 20',
          postCode: 46004,
          city: 'Valencia',
          state: 'Valencia',
          country: 'ES',
          company: 'MyCompany',
          phone: 961667897,
          instructions: 'Some Instructions'
        }]
      }
    })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('customer_not_found');


        done();
      })
      .catch((error) => done(error));
  });

  it('customer address info', done => {

    callService({
      url: '/services/customer/v1/customer.address.info',
      payload: {
        customerId: defaultCustomerId,
        addressId: defaultAddressId
      }
    })
      .then(response => {
        const result = response.body;
        expect(result.ok).to.equal(true);
        const address = result.address;
        expect(address.id).to.be.a.string().and.to.equal(defaultAddressId);

        done();
      })
      .catch((error) => done(error));
  });

  it('customer address info, customer not found', done => {

    callService({
      url: '/services/customer/v1/customer.address.info',
      payload: {
        customerId: 'id',
        addressId: defaultAddressId
      }
    })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('customer_not_found');

        done();
      })
      .catch((error) => done(error));
  });

  it('customer address info, address not found', done => {

    callService({
      url: '/services/customer/v1/customer.address.info',
      payload: {
        customerId: defaultCustomerId,
        addressId: 'id'
      }
    })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('address_not_found');

        done();
      })
      .catch((error) => done(error));
  });

  it('customer update address', done => {

    callService({
      url: '/services/customer/v1/customer.address.update',
      payload: {
        customerId: defaultCustomerId,
        address: {
          id: defaultAddressId,
          name: 'Work',
          firstName: 'John',
          lastName: 'Doe',
          address_1: 'Colon 20',
          postCode: 46004,
          city: 'Valencia',
          state: 'Valencia',
          country: 'ES',
          company: 'MyCompany',
          phone: 961667897,
          instructions: 'Some Instructions'
        }
      }
    })
      .then(response => {
        const result = response.body;
        expect(result.ok).to.equal(true);
        const customer = result.customer;
        const addresses = customer.addresses;
        expect(addresses.length).to.be.a.number().and.to.equal(1);
        const newAddress = addresses[0];

        expect(newAddress.name).to.be.a.string().and.to.equal('Work');
        expect(newAddress.firstName).to.be.a.string().and.to.equal('John');
        expect(newAddress.lastName).to.be.a.string().and.to.equal('Doe');
        expect(newAddress.address_1).to.be.a.string().and.to.equal('Colon 20');
        expect(newAddress.postCode).to.be.a.number().and.to.equal(46004);
        expect(newAddress.city).to.be.a.string().and.to.equal('Valencia');
        expect(newAddress.state).to.be.a.string().and.to.equal('Valencia');
        expect(newAddress.country).to.be.a.string().and.to.equal('ES');
        expect(newAddress.company).to.be.a.string().and.to.equal('MyCompany');
        expect(newAddress.phone).to.be.a.number().and.to.equal(961667897);
        expect(newAddress.instructions).to.be.a.string().and.to.equal('Some Instructions');

        done();
      })
      .catch((error) => done(error));
  });

  it('customer update address, customer-address not found 1', done => {

    callService({
      url: '/services/customer/v1/customer.address.update',
      payload: {
        customerId: 'id',
        address: {
          id: defaultAddressId,
          name: 'Work',
          firstName: 'John',
          lastName: 'Doe',
          address_1: 'Colon 20',
          postCode: 46004,
          city: 'Valencia',
          state: 'Valencia',
          country: 'ES',
          company: 'MyCompany',
          phone: 961667897,
          instructions: 'Some Instructions'
        }
      }
    })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('customer_address_not_found');

        done();
      })
      .catch((error) => done(error));
  });

  it('customer update address, customer-address not found 2', done => {

    callService({
      url: '/services/customer/v1/customer.address.update',
      payload: {
        customerId: defaultCustomerId,
        address: {
          id: 'id',
          name: 'Work',
          firstName: 'John',
          lastName: 'Doe',
          address_1: 'Colon 20',
          postCode: 46004,
          city: 'Valencia',
          state: 'Valencia',
          country: 'ES',
          company: 'MyCompany',
          phone: 961667897,
          instructions: 'Some Instructions'
        }
      }
    })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('customer_address_not_found');

        done();
      })
      .catch((error) => done(error));
  });

  it('customer update address, invalid country', done => {

    callService({
      url: '/services/customer/v1/customer.address.update',
      payload: {
        customerId: defaultCustomerId,
        address: {
          id: defaultAddressId,
          name: 'Work',
          firstName: 'John',
          lastName: 'Doe',
          address_1: 'Colon 20',
          postCode: 46004,
          city: 'Valencia',
          state: 'Valencia',
          country: 'Spain',
          company: 'MyCompany',
          phone: 961667897,
          instructions: 'Some Instructions'
        }
      }
    })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('address_contry_invalid');

        done();
      })
      .catch((error) => done(error));
  });

  it('customer remove address ', done => {

    callService({
      url: '/services/customer/v1/customer.address.remove',
      payload: {
        customerId: defaultCustomerId,
        addressId: defaultAddressId
      }
    })
      .then(response => {
        const result = response.body;
        expect(result.ok).to.equal(true);
        const customer = result.customer;
        const addresses = customer.addresses;
        expect(addresses.length).to.be.a.number().and.to.equal(0);

        done();
      })
      .catch((error) => done(error));
  });

  it('customer remove address, customer not found', done => {

    callService({
      url: '/services/customer/v1/customer.address.remove',
      payload: {
        customerId: 'id',
        addressId: defaultAddressId
      }
    })
      .then(response => {
        expect(response.statusCode).to.equal(200);
        const result = response.body;
        expect(result.ok).to.equal(false);
        expect(result.error).to.be.a.string().and.to.equal('customer_address_not_found');

        done();
      })
      .catch((error) => done(error));
  });

});