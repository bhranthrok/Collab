import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "./Nav";
import Likes from "./Likes";
import Comments from "./Comments";

const Home = () => {
    const navigate = useNavigate();

    // A post
    const [thread, setThread] = useState("");
    // Array with all posts
    const [threadList, setThreadList] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        createThread();
        setThread("");
    };

    // Checks if User is logged in
    useEffect(() => {
        const checkUser = () => {
            if (!localStorage.getItem("_id")) {
                navigate("/");
            } else {
                fetch("https://collab-ve2d.onrender.com/api/all/threads")
                .then((res) => res.json())
                .then((data) => setThreadList(data.threads))
                .catch((err) => console.error(err));
            }
        };
        checkUser();
    }, [navigate]);

    const createThread = () => {
        fetch("https://collab-ve2d.onrender.com/api/create/thread", {
            method: "POST",
            body: JSON.stringify({
                thread,
                userId: localStorage.getItem("_id"),
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setThreadList(data.threads);
            })
            .catch((err) => console.error(err));
    };

    const goToThread = (threadId) => {
        navigate(`/${threadId}/replies`);
    }

    return (
        <>
            <Nav />
            <main className='home'>
                
                <form className='homeForm' onSubmit={handleSubmit}>
                    <div className='home_container'>
                        <textarea
                            type='textarea'
                            rows={3}
                            name='thread'
                            required
                            value={thread}
                            onChange={(e) => setThread(e.target.value)}
                        />
                    </div>
                    <div className="button_container">
                        <button className='modalBtn'>POST</button>
                    </div>
                </form>

                <div className='thread_container'>
                    {threadList.map((thread) => (
                        <div className='thread_item' key={thread.id} onClick={() => goToThread(thread.id)}>
                            <p className="thread_title">{thread.title}</p>
                            <div className='reactions_container'>
                                <Likes numberOfLikes={thread.likes.length} threadId = {thread.id}/>
                                <Comments 
                                    numberOfComments = {thread.replies.length}
                                    threadId={thread.id}
                                    title={thread.title}
                                    />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
};

export default Home;