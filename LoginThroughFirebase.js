import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { app,auth,database } from "./firebase";

import { Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 5000);
  };

  const userInstance = async (user) => {
    if (!user || !user.uid) {
      showNotification("error", "Cannot save user data: Invalid user ID.");
      return;
    }
    try {
      const userRef = ref(database, 'users/' + user.uid);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        await update(userRef, {
          lastLogin: new Date().toISOString(),
        });
      } else {
        await set(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'N/A',
          photoURL: user.photoURL || null,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        });
      }

    } catch (error) {
      let userMessage = "Could not save user data.";
      if (error.code === "PERMISSION_DENIED") {
        userMessage = "Database permission denied. Check your security rules in Firebase.";
      }
      showNotification("error", userMessage);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCred.user);
      showNotification("success", "Signup successful! Please verify your email before logging in.");
      auth.signOut();
      setEmail("");
      setPassword("");
      setIsSignUp(false);
    } catch (err) {
      showNotification("error", err.message);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      if (!userCred.user.emailVerified) {
        showNotification("error", "Please verify your email before logging in.");
        auth.signOut();
        setLoading(false);
        return;
      }
      await userInstance(userCred.user);
      onLogin(userCred.user);
      navigate("/");
    } catch (err) {
      showNotification("error", err.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      await userInstance(result.user);
      onLogin(result.user);
      navigate("/");
    } catch (err) {
      showNotification("error", err.message);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showNotification("error", "Please enter your email to reset password.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showNotification("success", "Password reset email sent. Check your inbox.");
    } catch (err) {
      showNotification("error", err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-xl shadow-lg transition-all ${
          notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {notification.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <Lock className="text-gray-900" size={24} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {isSignUp ? "Create Account" : "Welcome back"}
          </h2>
          <p className="text-gray-600 text-sm">
            {isSignUp ? "Sign up to get started" : "Sign in to your account"}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="Email-ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm text-gray-800 placeholder-gray-400"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm text-gray-800 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isSignUp && (
            <div className="text-right">
              <button
                onClick={handleForgotPassword}
                className="text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            onClick={isSignUp ? handleSignup : handleLogin}
            disabled={loading}
            className="w-full py-2.5 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              isSignUp ? "Sign Up" : "Sign In"
            )}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs">or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="text-center pt-4 text-sm text-gray-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gray-700 font-medium hover:underline"
          >
            {isSignUp ? "Sign In" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
