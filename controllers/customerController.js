const { Customer } = require('../models');

exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body); 
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message }); 
  }
};


exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll(); 
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message }); 
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id); 
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' }); 
    }
    res.status(200).json(customer); 
  } catch (error) {
    res.status(500).json({ error: error.message }); 
  }
};