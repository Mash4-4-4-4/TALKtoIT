import { Typography } from '@mui/material';
import React from 'react'
import {Link} from "react-router-dom";
const Logo = () => {
  return (
    <div style={{
        display:"flex",
        alignItems:"center",
        gap:"8px",
        marginRight:"auto",
    }}>
        <Link to={"/"}
         style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
  }} >

        <img src="logo.png" alt="TalkTOit" width={"32px"} height={"30px"}
        className="image-inverted"
        />

        <span style={{fontSize:"20px", fontWeight:"bold",color:"white"}}>TalkTOit</span>
        <Typography sx={{display:{md:"block" , sm:"none"  , xs:"none"}, 
    marginRight:"auto",
    fontSize:"18px",
    fontweight:"bold",
    textshadow:"2px 2px 20px #000"
    }} />
        </Link>
    </div>
  )
}

export default Logo