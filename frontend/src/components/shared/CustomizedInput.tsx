import React from 'react'
import TextField from '@mui/material/TextField';

type Props={
    name:string
    type:string;
    label:string;
}
const CustomizedInput = (props:Props) => {
  return (
  <TextField 
  variant="outlined"
   name={props.name}
  type={props.type}
  label={props.label}

   slotProps={{
        input: {
          style: {
            width: "350px",
            borderRadius: "10px",
            fontSize: "16px",
            color: "white"
          }
        },

        inputLabel: {
          style: {
            color: "white"
          }
        }
      }}
/>
)
}

export default CustomizedInput