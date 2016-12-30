# customer.list

This method is used to get a list of customers using filters.

# Arguments

This method has the URL https://server/services/customer/v1/customer.list and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
token                  | no  | Token        | Bearer xxxxx...      | Authentication token.
id                     | no  | String List  | r1h2uQ4rx            | Customer identifier.
email                  | no  | String List  | john.doe@gmail.com   | Customer email.
firstName              | no  | String       | John                 | Customer first name.
lastName               | no  | String       | Doe                  | Customer last name.
status                 | no  | String List  | ACTIVE               | Status of the customer. ACTIVE or INACTIVE.
tags                   | no  | String List  | [VIP]                | Tags associated to the customer.
addresses.id           | no  | String List  | r1h2uQ4rx            | Address identifier.
addresses.name         | no  | String       | Work                 | Address name.
addresses.firstName    | no  | String       | John                 | Customer first name.
addresses.lastName     | no  | String       | Doe                  | Customer last name.
addresses.address_1    | no  | String       | 1650 Bolman Court    | Address information.
addresses.address_2    | no  | Array        | Number 10            | Aditional address information.
addresses.postCode     | no  | Number List  | 61701                | Address post code
addresses.city         | no  | String List  | Bloomington          | Address city
addresses.county       | no  | String List  | Illinois             | Address county
addresses.country      | no  | String List  | US                   | Address country
addresses.company      | no  | String       | My Company           | Name of the company
addresses.phone        | no  | Number List  | 2173203531           | Address phone
addresses.instructions | no  | String       | Some instructions    | Aditional instrucctions for the address

# Response

Returns a customer object:

```javascript
{
    "ok": true,
    "page": {
        "limit": 10,
        "skip": 0
    },
    "data": [{
        "email": "john.doe@gmail.com",
        "firstName": "John",
        "lastName": "Doe",
        "status": "ACTIVE",
        "tags": [
            "VIP"
        ],
        "addresses": [
            {
                "name": "Work",
                "firstName": "John",
                "lastName": "Doe",
                "address_1": "1650 Bolman Court",
                "address_2": "Number 10",
                "postCode": 61701,
                "city": "Bloomington",
                "county": "Illinois",
                "country": "US",
                "company": "My Company",
                "phone": 2173203531,
                "instructions": "Some Instructions",
                "id": "r1h2uQ4rx"
            }
        ],
        "id": "HkhhuXESl"
    ]}
}
```

# Example

```bash
curl --request POST \
  --url http://localhost:3005/services/customer/v1/customer.list \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{
        "id": "HkhhuXESl,HkhhuXES3"
      }'
```
