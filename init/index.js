const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderLust");
}

main()
.then(() => {
    console.log("Connected to Server");
})
.catch((err) => {
    console.log(err);
})

const initDB = async () => {
    // first we cleane our database
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: '6538edc03b0c08cbe1a4f5cb'}));
    await Listing.insertMany(initData.data);
    console.log("Data was Saved");
}

initDB();