import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Login from "./features/auth/Login";

const Dashboard = lazy(() => import("./features/dashboard/Dashboard"));
const LandingPage = lazy(() => import("./features/landing/LandingPage"));

const PageFallback = <div style={{height:"100vh",background:"#12090A"}} />;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Suspense fallback={PageFallback}>
            <LandingPage />
          </Suspense>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <Suspense fallback={<div style={{height:"100vh",background:"#12090A"}} />}>
            <Dashboard />
          </Suspense>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;