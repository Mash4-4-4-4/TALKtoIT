import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import {IoIosLogIn} from 'react-icons/io'
import Button from '@mui/material/Button'
import React from 'react'
import { useEffect } from 'react'
import CustomizedInput from '../components/shared/CustomizedInput'
import {toast} from "react-hot-toast"
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext'
const Signup = () => {
  const navigate=useNavigate();
  const auth=useAuth();

const handleSubmit=async (e:React.FormEvent<HTMLFormElement>)=>
{
  e.preventDefault();
  const formData=new FormData(e.currentTarget);
    const name=formData.get("name") as string;

  const email=formData.get("email") as string;
  const password=formData.get("password") as string;
   try
   {
    toast.loading("Signing in...",{id:"signup"});
await auth?.signup(name,email,password);
    toast.success("Signup successful!",{id:"signup"});
   }
   catch(error)
   {
    console.error("signup failed:", error);
    toast.error("Signup failed. Please try again.",{id:"signup"});
   }

}
 useEffect(()=>
  {
    if(auth?.user)
    {
      navigate("/chat")
    }
  },[auth])
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        backgroundColor: "black",
        overflow: "hidden"
      }}
    >

      {/* LEFT SIDE */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <form
        onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "350px",
            padding: "40px",
            borderRadius: "10px",
            boxShadow: "0px 0px 20px #333"
          }}
        >
          <Typography
            variant="h4"
            textAlign={"center"}
            color="white"
          >
            SignUp
          </Typography>
               <CustomizedInput
          type="text" name="name" label="name"
          ></CustomizedInput>
          <CustomizedInput
          type="email" name="email" label="Email"
          ></CustomizedInput>

          <CustomizedInput type="password"
          name="password" label="Password"
          >

          </CustomizedInput>
          <Button variant="contained" type="submit"
          sx={{px:2,py:1,mt:2,width:"350px",
            borderRadius:"2px",
            bgcolor:"#333",
            ":hover":{bgcolor:"#555",
              color:"white"
            }
          }}
          endIcon={<IoIosLogIn size={20} />}
          >
            SIGNUP
          </Button>
        </form>
      </Box>

      {/* RIGHT SIDE */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <img
          src="login.png"
          alt="login"
          style={{
            width: "80%",
            maxWidth: "450px",
            height: "auto"
          }}
        />
      </Box>

    </Box>
  )
}

export default Signup