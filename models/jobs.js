const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
    title: {
        type: String,
        required:true,
    },
    description:  {
        type: String,
        required:true,
    },
    image:{
        url:String,
    },
    organiization:  {
        type: String, 
        required:true,
    },
    wage : {
        type: String,
        required:true,
    },
});

module.exports.Job = mongoose.model("Job",jobSchema);