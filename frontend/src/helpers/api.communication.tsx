import axios from "axios";
export const loginUser=async(email:string,password:string)=>
{
    const res= await axios.post("/user/login",{email,password});
    if(res.status!==200)
    {
        throw new Error("Login failed");
    }
    const data=await res.data;
    return data;
}

export const logoutUser=async()=>
{
    const res= await axios.get("/user/logout");
    if(res.status!==200)
    {
        throw new Error("Logout failed");
    }
    const data=await res.data;
    return data;
}

export const signupUser=async(name:string,email:string,password:string)=>
{
    const res= await axios.post("/user/signup",{name,email,password});
    if(res.status!==200)
    {
        throw new Error("signup failed");
    }
    const data=await res.data;
    return data;
}

export const checkAuthStatus=async()=>
{
    const res= await axios.get("/user/auth-status");
    if(res.status!==200)
    {
        throw new Error("unable to authenticate user");
    }
    const data=await res.data;
    return data;
}

export const sendChatMessages=async(message: string)=>
{
    const res= await axios.post("/chat/new",{message});
    if(res.status!==200)
    {
        throw new Error("Failed to send chat messages");
    }
    const data=await res.data;
    return data;
}
export const getAllChats=async()=>
{
    const res= await axios.get("/chat/all-chats");
    if(res.status!==200)
    {
        throw new Error("Failed to send chat messages");
    }
    const data=await res.data;
    return data;
}

export const deleteAllChats=async()=>
{
    const res=await axios.delete("/chat/delete-chats");
    if(res.status!==200)
    {
        throw new Error("Failed to delete chats");
    }
    return await res.data;
}

export const uploadPdf = async (
  formData: FormData
) => {
  const res = await axios.post(
    "/pdf/upload",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const getPdfText = async (
  formData: FormData
) => {
  const res = await axios.post(
    "/pdf/text",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const getAllPdfs = async () => {
  const res = await axios.get(
    "/pdf/all"
  );

  return res.data;
};