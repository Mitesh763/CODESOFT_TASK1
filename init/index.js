const mongoose = require('mongoose');
const {Job} =require('../models/jobs.js');
const initData = require('./data.js');

const initDB = async() =>{
    await  Job.deleteMany({});
    await Job.insertMany(initData.data);
    console.log("Data was initialized..!");
}
initDB();