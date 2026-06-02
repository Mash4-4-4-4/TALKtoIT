import  { connect, disconnect } from "mongoose";
 async function ConnectToDatabase() //function to connect to databse using .env
{
     try {  
        await connect(process.env.MONGODB_URL!)
        console.log("mogodb connected")
     } catch (error) 
     {
        console.log(error)
       throw new Error("cannot connect to mongodb");
     }
}
//function to disconnect from databse
async function DiscconnectFromDatabse() 
{
    try {
        await disconnect();
    } catch (error) 
    {
         console.log(error)
         throw new Error("something is wrong");
    }
    
}
export {ConnectToDatabase,DiscconnectFromDatabse}