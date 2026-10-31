import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ROOTS = ["/", "/contestants", "/battles", "/tokens", "/live"];

export default function BackButton() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  if (ROOTS.includes(pathname)) return null;

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/");
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Go back"
      className="md:hidden -ml-2 mb-2 w-11 h-11 rounded-full grid place-items-center hover:bg-muted transition"
    >
      <ArrowLeft className="w-6 h-6" />
    </button>
  );
}