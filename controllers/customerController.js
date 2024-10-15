const Customer = require('../models/customer');

//Create a customer
exports.createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).send(customer);
  } catch (error) {
    res.status(400).send(error);
  }
};

//Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.send(customers);
  } catch (error) {
    res.status(500).send(error);
  }
};

//Get a customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send();
    res.send(customer);
  } catch (error) {
    res.status(500).send(error);
  }
};