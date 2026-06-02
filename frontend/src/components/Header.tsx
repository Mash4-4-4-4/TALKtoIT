import React from 'react'
import { Button, Toolbar,AppBar } from '@mui/material'
import Logo from './shared/Logo'
import { useAuth } from '../context/AuthContext'
import NavLink from './shared/NavigationLink'
const Header = () => {

  const auth=useAuth();
  return (
    <AppBar sx={{bgcolor:"transparent",position:"static",boxShadow:"none"}}>
    <Toolbar sx={{display:"flex"}}>
      <Logo/>
      <div>
        {auth?.isLoggedIn ?
        (<> 
            <NavLink to="/chat"
            bg="#00fffc" 
            text="go to chat"
            textColor="black"
            />

        <NavLink
        bg="#51538f"
        textColor="white"
        to="/"
        text="logout"
        onClick={auth?.logout}/>
        </>

        )
        : (
        <>
         <NavLink
        bg="#51538f"
        textColor="black"
        to="/login"
        text="login"
        />
        
        <NavLink
        bg="#51538f"
        textColor="white"
        to="/signup"
        text="signup"
        />
         </>)
          }
      </div>
    </Toolbar>
    </AppBar>
  )
}

export default Header