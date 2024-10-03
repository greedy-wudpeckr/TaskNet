const {Schema, default: mongoose} = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
require('dotenv').config();
const databaseKey = process.env.DATABASEKEY;


main()
.then(()=>{
    console.log("Connection successful");
}).catch(err => console.log(err));


async function main() {
  await mongoose.connect(databaseKey); };

  const userSchema = new Schema({
    email:{
      type : String,
      required : true
    }
});

userSchema.plugin(passportLocalMongoose);


const toDoSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' }, // Reference to User model
    task: { type: String, required: true },
  completed: { type: Boolean, default: false }, // Track if the task is done
  createdAt: { type: Date, default: Date.now }  // Timestamp for each task
});

const userModel =  mongoose.model("User" , userSchema);
const toDoModel = mongoose.model("ToDo" , toDoSchema)

module.exports = { userModel, toDoModel };
