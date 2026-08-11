import { Route, Routes } from "react-router-dom"
import MobileNav from "./components/MobileNav"
import Navbar from "./components/Navbar"
import Create from "./pages/Create"
import Explore from "./pages/Explore"
import MyNfts from "./pages/MyNfts"
import NftDetails from "./pages/NftDetails"

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pb-24 md:pb-0">
        <Routes>
          <Route path="/" element={<Explore />} />
          <Route path="/my-nfts" element={<MyNfts />} />
          <Route path="/create" element={<Create />} />
          <Route path="/nft/:id" element={<NftDetails />} />
        </Routes>
      </main>
      <MobileNav />
    </div>
  )
}

export default App
