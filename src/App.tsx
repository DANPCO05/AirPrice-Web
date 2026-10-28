import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import PrediccionProvider from '@/features/prediction/PrediccionProvider'
import Home from '@/pages/Home'
import Location from '@/pages/Location'
import Property from '@/pages/Property'
import Result from '@/pages/Result'
import Market from '@/pages/Market'

export default function App() {
  return (
    <BrowserRouter>
      <PrediccionProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/ubicacion" element={<Location />} />
            <Route path="/propiedad" element={<Property />} />
            <Route path="/resultado" element={<Result />} />
            <Route path="/mercado" element={<Market />} />
          </Route>
        </Routes>
      </PrediccionProvider>
    </BrowserRouter>
  )
}
