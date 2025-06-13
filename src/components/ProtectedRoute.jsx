import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import useProfileCheck from "../services/userProfileCheck";

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useAuth();
  const { loading: profileLoading, isComplete } = useProfileCheck();

  if (authLoading || profileLoading) {
    return <div className="text-center text-white min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Profile not complete
  if (!isComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};

export default ProtectedRoute;