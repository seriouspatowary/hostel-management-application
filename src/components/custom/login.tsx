"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

import useToast from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useDispatch, useSelector } from 'react-redux';
import { login } from "@/lib/redux/slices/authSlice";
import { RootState, AppDispatch } from '@/lib/redux/store';


const Login = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");


  const { showSuccess, showError } = useToast();

  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();

  
  const {loading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ username: username, password: password }))
      .unwrap()
      .then(() => {
        showSuccess('Logged in successfully!');
        router.push('/admin');
      })
      .catch((err) => {
        showError(err || 'Login failed');
      });
  };

  return (
    <div className="h-screen flex w-full overflow-hidden" style={{ margin: 0, padding: 0, borderRadius: 0, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
  

  {/* Left Side - Welcome Section */}
      <div
        className="w-1/2 bg-gradient-to-br from-[#005cb3] via-[#290ed8] to-[#2340ff] flex items-center justify-center relative h-screen"
        style={{ borderRadius: 0 }}
      >
        <div className="max-w-md text-white z-10">
          <h1 className="text-4xl font-bold mb-2">
            Welcome To
          </h1>

          <h2 className="text-5xl font-bold text-[#F2FF00] mb-8">
            Usha Girls PG
          </h2>

          <p className="text-lg text-white whitespace-nowrap">
            A HiTech PG 
          </p>

          <p className="text-lg text-white font-bold mb-12 whitespace-nowrap">
            focused on rooms, comfort, and modern living
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg">
                Register Yourself
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg">
                Book Room
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg">
                Choose Comfort
              </span>
            </div>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -bottom-32 -left-32 w-80 h-80 border-2 border-white/15 rounded-full"></div>

        <div className="absolute -bottom-16 -left-16 w-48 h-48 border-2 border-white/20 rounded-full"></div>
      </div>


   {/* Right Side - Login Form */}
    <div
      className="w-1/2 h-screen relative flex items-center justify-center"
      style={{
        backgroundImage: 'url(/bg-image.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Login Card */}
       <div className="w-full max-w-[560px] z-15 px-4">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md">
        

            <CardHeader className="pt-1">
              <h3 className="text-base font-semibold  text-gray-800">Login</h3>
            </CardHeader>
             <CardContent className="px-5 pb-3">
              <div className="space-y-2">
                <div className="space-y-1 mb-4">

                 <Input
                    id="username"
                    type="text"
                    placeholder="Enter Username"
                    maxLength={15}
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-12 w-full px-4 text-base border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                <div className="space-y-1">
              
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full px-4 mb-4 text-base border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500"

                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 mb-3 text-center">
                    {error}
                  </p>
                )}

                <Button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full h-9 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Logging..." : "LOGIN"}
                </Button>
              </div>
            </CardContent>
          </Card>
       </div>
       </div>
    </div>
  );
};

export default Login;