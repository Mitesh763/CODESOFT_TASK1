const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/codesoft").then(()=>{ console.log("connected") });

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