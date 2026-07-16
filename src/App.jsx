import { Route, Routes, Outlet } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import ModulePage from './pages/ModulePage.jsx'
import { PageWipeProvider } from './context/PageWipe.jsx'

function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5FA]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <PageWipeProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/:moduleKey" element={<ModulePage />} />
        </Route>
      </Routes>
    </PageWipeProvider>
  )
}
