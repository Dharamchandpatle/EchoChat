import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import HomePage from "./pages/HomePage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationPage from "./pages/NotificationPage.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";

import  { Toaster } from "react-hot-toast";
import useAuthUser from "./hooks/useAuthUser.jsx";
import PageLoader from "./components/PageLoader.jsx";

const App = () => {

  const {isLoading , authUser } = useAuthUser
  if(isLoading )return <PageLoader/>

  return (
    <div className="h-screen" data-theme="dark">

      <Routes>
        <Route path="/" element={ authUser ? <HomePage/> : <Navigate to = "/login" /> } />
        <Route path="/signup" element={!authUser ? <SignUpPage />  : <Navigate to = "/login" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to = "/login" />} />
        <Route path="/call" element={authUser ? <CallPage /> : <Navigate to = "/login" />} />
        <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to = "/login" />} />
        <Route path="/notification" element={authUser ? <NotificationPage /> : <Navigate to = "/login" />} />
        <Route path="/onboarding" element={authUser ? <Onboarding /> : <Navigate to = "/login" />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
