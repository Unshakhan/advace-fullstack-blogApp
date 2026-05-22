import mongoose from "mongoose";


const BlogSchema = new mongoose.Schema({
    title:{
    type:String,
    required:true,
    minLength:[4,"minimum 4 required"]
    },
   content:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user' //but kis user ki id uthani hay
    }
    ,public_id:{
        type:String
    }
   
},
{
    timestamps:true
}


)

 const Blog = mongoose.model('blog',BlogSchema)
 export default Blog