"use server"
import { PostRequestAxios } from "@/api-hooks/api-hooks";
import { cookies } from "next/headers";


 type userData ={
    user:Record<string, unknown>,
    access_token?:string,
    accessToken?:string,
    message?:string
 }
type LoginPayload = {
    identity: string,
    password: string
}

export const loginUser = async (payload:LoginPayload) => {
    // Use axios directly instead of PostRequestAxios to avoid 401 redirect
    // (PostRequestAxios throws redirect('/login') on 401, but for login, 401 means wrong credentials)
    try {
      const {data} = await (await import("axios")).default.post<userData>(
        `${process.env.BASE_URL}/user/login`,
        { identity: payload.identity.trim(), password: payload.password }
      );
      if(data){
        const cookie = await cookies();
        const accessToken = data?.access_token || data?.accessToken || "";
        cookie.set("access_token", accessToken, { httpOnly: true, secure: true, path:"/", maxAge:60*60*24*10 });
        cookie.set("user", JSON.stringify(data?.user) || "", { httpOnly: true, secure: true, path:"/", maxAge:60*60*24*10 });
      }
      const role = data?.user?.role as string | undefined;
      return { data, error: null, role };
    } catch (err: unknown) {
      const axios = (await import("axios"));
      if (axios.default.isAxiosError(err)) {
        const res = err?.response?.data as Record<string, unknown> | undefined;
        const message = typeof res?.message === "string" ? res.message : "Invalid credentials";
        return { data: null, error: { message, statusCode: err?.response?.status ?? 401 }, role: undefined };
      }
      return { data: null, error: { message: "Something went wrong", statusCode: 500 }, role: undefined };
    }
}

export const loginWithGoogle = async (idToken:string)=>{

    const [data, error] = await PostRequestAxios<userData>("/user/login-user-with-google",{id:idToken});
    if(data){
        console.log("getting-data",data)
    const cookie = await cookies();
   cookie.set("access_token", data?.access_token || "", {  httpOnly: true,secure: true,path:"/", maxAge:60*60*24*10 });
   const userSaveData = {
    _id:data?.user?._id,
    name:data?.user?.name,
    email:data?.user?.email,
    phoneNumber:data?.user?.phoneNumber,
    isOtpVerified:data?.user?.isOtpVerified,
    numberOfConnections:data?.user?.numberOfConnections,
    role:data?.user?.role,
    gender:data?.user?.gender
   }
   cookie.set("user", JSON.stringify(userSaveData) || "",{  httpOnly: true,secure: true,path:"/", maxAge:60*60*24*10 });
    }
   
   return {data,error};
}

export const logOutUser = async ()=>{
        const cookie = await cookies();
 cookie.delete("access_token");
 cookie.delete("user");
 return true
}

export const getUser = async ()=>{
    const cookie = await cookies();
    const userString = cookie.get("user")?.value;
    const UserData:UserInfo | null = userString ? JSON.parse(userString) : null;

    return UserData;
}

export const requestNumber = async (payoad:{userId:string, requestUserId:string}) => {
    const [data, error] = await PostRequestAxios("/user/request-for-number",payoad);
    console.log("requestNumberdata",data);
    if(data){
        const cookie = await cookies();

        cookie.set("user", JSON.stringify(data?.userData) || "",{  httpOnly: true,secure: true,path:"/", maxAge:60*60*24*10 });
    }
    return {data,error};
}

export const setUserData = async (data:Record<string,unknown>) =>{
     const cookie = await cookies();

        cookie.set("user", JSON.stringify(data) || "",{  httpOnly: true,secure: true,path:"/", maxAge:60*60*24*10 });
}

export const setOtpData = async (payoad:Record<string,unknown>) =>{
    const [data, error] = await PostRequestAxios("/user/verify-otp",payoad);
    if(data){
        const cookie = await cookies();
        cookie.set("user", JSON.stringify(data?.data) || "",{  httpOnly: true,secure: true,path:"/", maxAge:60*60*24*10 });
           cookie.set("access_token", data?.access_token || "", {  httpOnly: true,secure: true,path:"/", maxAge:60*60*24*10 });
    }
    console.log("setOtpdata--------------> dadad ------------>",data);
    return {data,error};
}
