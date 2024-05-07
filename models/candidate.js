const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./jobs.js');

const candidateSchema =new Schema({
    name:{
        type : String,
        required:true,
    },
    email:{
        type : String,
        required:true,
    },
    mobile:{
        type : Number,
        required:true,
    },
    qualification:{
        type : String,
        required:true,
    },
    image:{
        url:String,
        filename:String,
    },
    domain:{
        type: Schema.Types.ObjectId,
        ref:"Job",
    },
    user:{
        type : Schema.Types.ObjectId,
        ref:"User",
    },
});

module.exports = mongoose.model("Candidate",candidateSchema);