import React from 'react'
import TextField from '@mui/material/TextField';

const CYAN  = "#00ffcc";
const BODY  = "#c8f0e8";
const BLACK = "#000000";
const MONO  = "'Share Tech Mono', 'Courier New', monospace";

type Props = {
  name: string;
  type: string;
  label: string;
}

const CustomizedInput = (props: Props) => {
  return (
    <TextField
      variant="outlined"
      name={props.name}
      type={props.type}
      label={props.label}
      fullWidth
      sx={{
        /* input text */
        "& .MuiInputBase-input": {
          color: BODY,
          fontFamily: MONO,
          fontSize: "13px",
          letterSpacing: "1px",
          padding: "10px 12px",
          background: "transparent",
          /* kill browser autofill yellow */
          "&:-webkit-autofill": {
            WebkitBoxShadow: `0 0 0 100px ${BLACK} inset`,
            WebkitTextFillColor: BODY,
            caretColor: CYAN,
          },
        },
        /* the fieldset border */
        "& .MuiOutlinedInput-notchedOutline": {
          border: "none",
        },
        "& .MuiOutlinedInput-root": {
          background: "transparent",
          borderRadius: 0,
          "& fieldset": { border: "none" },
          "&:hover fieldset": { border: "none" },
          "&.Mui-focused fieldset": { border: "none" },
        },
        /* label */
        "& .MuiInputLabel-root": {
          color: `${CYAN}77`,
          fontFamily: MONO,
          fontSize: "12px",
          letterSpacing: "1px",
          "&.Mui-focused": {
            color: CYAN,
          },
        },
      }}
    />
  );
};

export default CustomizedInput;