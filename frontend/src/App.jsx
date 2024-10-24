import { Routes , Route, Navigate } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/home/HomePage";
import Footer from "./components/footer";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authUser";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import SearchPage from "./pages/SearchPage"
import SearchHistoryPage from "./pages/SearchHistoryPage"
import NotFoundPage from "./pages/NotFoundPage"
import WatchPage from "./pages/WatchPage";
import FavouritePage from "./pages/FavoritePage";
function App() {
  const { user, isCheckingAuth, authCheck } = useAuthStore();
  useEffect(() => {
    authCheck();
  }, [authCheck]);
  if (isCheckingAuth) {
    return (
      <div className="h-screen">
        <div className="flex justify-center items-center bg-black h-full">
          <Loader className="text-red-600 animate-spin size-10"  />
        </div>
      </div>
    );
  }
  return (
    <>
    <Routes>
      <Route path = '/' element = {<HomePage/>} />
      <Route path = '/login' element = {user? <Navigate to={"/"}/> : <LoginPage/> } />
      <Route path = '/signup' element = {user? <Navigate to={"/"}/> : <SignUpPage/>} />
      <Route path = '/search' element = {<SearchPage/>} />
      <Route path = '/history' element = {<SearchHistoryPage/>} />
      <Route path = '/favorites' element = {<FavouritePage/>} />
      <Route path = '/*' element = {<NotFoundPage />} />
      <Route
          path="/watch/:id"
          element={user ? <WatchPage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/watch"
          element={user ? <WatchPage /> : <Navigate to={"/login"} />}
        />
    </Routes>
    <Footer/>
    <Toaster/>
    </>
  );
}

export default App;
