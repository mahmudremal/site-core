import { BrowserRouter, HashRouter, Route, Routes } from 'react-router'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import VideoPage from './pages/VideoPage'
import SearchPage from './pages/SearchPage'
import ExplorePage from './pages/ExplorePage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/watch/:id" element={<VideoPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
