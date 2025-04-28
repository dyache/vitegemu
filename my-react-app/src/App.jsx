import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { ReviewPage } from "./pages/ReviewPage";
import { CreateReview } from "./pages/CreateReview";
import { AuthPage } from "./pages/AuthPage";
import { Profile } from "./pages/Profile";
import { Navbar } from "./Components/NavBar";
import { Reviews } from "./pages/reviews";
import Esports from "./pages/Esports";
import OtherProfile from "./pages/OtherProfile";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-white">
        <Navbar />
        <main className="pt-20 px-4 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/review/:id" element={<ReviewPage />} />
            <Route path="/create" element={<CreateReview />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="user/:nick" element={<OtherProfile />} />
            <Route path="/esports" element={<Esports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
