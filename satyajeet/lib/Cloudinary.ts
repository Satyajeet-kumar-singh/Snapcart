import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({ 
  cloud_name: 'dme1cihpu', 
  api_key: '243989212119865', 
  api_secret: "ybj7bXwusq7m8xVSN6yshaSSyGA"
});

const uploadOnCloudinary = async(file:Blob):Promise<string | null>=>{
    if(!file){
        return null
    }

    try {
     const  arrayBuffer = await file.arrayBuffer()
     const buffer = Buffer.from(arrayBuffer)
     
     return new Promise((resolve,reject)=>{
       const uploadStream = cloudinary.uploader.upload_stream({
            folder:"grocery-app",
            resource_type:"auto"
        },
        (error,result)=>{
            if(error) reject(error)
            else resolve(result?.secure_url ?? null)
        }
    )
        uploadStream.end(buffer)
     })
    } catch (error) {
        console.log(error)
        return null
    }
}

export default uploadOnCloudinary;