import React from "react";
import { useNavigate } from "react-router-dom";

const Nav = () => {

    const navigate = useNavigate();

    const signOut = () => {
        localStorage.removeItem("_id");
        //👇🏻 redirects to the login page
        navigate("/");
    };
    return (
        <nav className='navbar'>
            <img className="logo" src="/Collab logo.png" alt="Collab Logo" style={{width: '200px', height: 'auto'}}/>
            <div className='navbarRight'>
                <button onClick={signOut}>Sign Out</button>
            </div>
        </nav>
    );
};

export default Nav;