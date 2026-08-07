import "dotenv/config"
import app from "./app.js"
import { ConnectToDatabase } from "./db/connections.js"

const PORT=process.env.PORT || 5000

//connections to databse and listeners
ConnectToDatabase().then(()=>
{
app.listen(PORT,()=>console.log("server open"))
})
.catch((err)=>console.log(err));
