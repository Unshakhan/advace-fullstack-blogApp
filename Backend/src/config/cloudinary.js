import cloudinary from "cloudinary"
import dotenv from "dotenv"

dotenv.config()
//yahan humne connect kiya
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key:process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
console.log( "line 11", process.env.CLOUD_NAME);
console.log("line 12 ----------->",process.env.CLOUD_API_KEY);
console.log("line 13",process.env.CLOUD_API_SECRET);
const uploadImg = async (file) => {

  return new Promise((resolve, reject) => {

    const fileName = `blog-${file.originalname.split(".")[0]}_${Date.now()}`;

    const upload = cloudinary.v2.uploader.upload_stream(
      {
        public_id: fileName,
        folder: "blogs",
        resource_type: "auto",
      },

      (err, result) => {

        if (err) {
          console.log("Cloudinary error:", err);
          return reject(err);
        }

        resolve({
          image: result.secure_url,
          public_id: result.public_id
        });

      }
    );

    upload.end(file.buffer);
  });

};
const deleteImg = async (public_id) => {
try {
  

  const result = await cloudinary.v2.uploader.destroy(public_id,{
    resource_type:"image"
  });
return result
} catch (error) {
  console.log('error in dlt-->',error);
  
}

}


export { uploadImg ,deleteImg};