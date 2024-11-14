import React from "react";
import { useNavigate } from "react-router-dom";

const Nav = () => {

    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate('/dashboard');
    }

    const signOut = () => {
        localStorage.removeItem("_id");
        navigate("/");
    };

    const goToProfile = () => {
        const userId = localStorage.getItem("_id");

        if (userId) {
            navigate(`/profile/${userId}`);
        } else {
            navigate("/");
        }
    }

    return (
        <nav className='navbar'>
            <img className="logo" src="/Collab logo.png" onClick={() => handleLogoClick()} alt="Collab Logo" style={{width: '200px', height: 'auto'}}/>
            <div className='navbarRight'>
                <div className="profileIconWrapper">
                    <svg className="profileButton" cursor="pointer" height="2rem" width="2rem" onClick={goToProfile} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#6F26E0" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                </div>
            
                <button onClick={signOut}>Sign out</button>
            </div>
        </nav>
    );
};

export default Nav;