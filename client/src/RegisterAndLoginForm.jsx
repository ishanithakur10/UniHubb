import { UserContext} from "./UserContext.";
import {useContext, useState} from "react";
import axios from "axios";


export default function RegisterAndLoginForm(){

    const[username,setUsername]=useState('');
    const[password,setPassword]=useState('');
    const[isLoginOrRegister, setIsLoginOrRegister] =useState('register');

    const {setUsername:setLoggedInUsername,setId}=useContext(UserContext);

    // async function register(ev){
    //     ev.preventDefault();
    //     await axios.post('/register',{username,password})
    // }
    async function handleSubmit(ev) {
        const url=isLoginOrRegister ==='register' ? 'register' :'login';
        ev.preventDefault();
        await axios.post('http://localhost:4040/register', { username, password });
        setLoggedInUsername(username);
        setId(data.id);
      }
      

    return (
        <div className="bg-blue-50 h-screen flex items-center">
        <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
            <input value={username} 
            onChange={ev=> setUsername(ev.target.value)} 
            type="text" 
            placeholder="userame" 
            className="block w-full rounded-sm p-2 mb-2 border"/>
            <input value={password} 
            onChange={ev=> setPassword(ev.target.value)} 
            type="password" 
            placeholder="password" 
            className="block w-full rounded-sm p-2 mb-2 border"/>
            <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
                {isLoginOrRegister ==='register' ? 'Register' : 'Login'}
            </button>
            <div className="text-center mt-2"> {isLoginOrRegister === 'register' && (
                <div>
                    Already a member ?
                    <button onClick={()=>
                    setIsLoginOrRegister('login')}>Login here</button>
                </div>
            )}
            {isLoginOrRegister === 'login' && (
                <div>
                    Don't have an account?
                    <button onClick={()=> setIsLoginOrRegister('register')}>
                        Register
                    </button>
                </div>
            )}
            </div>
        </form>
        </div>
    );
}