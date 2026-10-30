import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import PrediccionProvider from '@/features/prediction/PrediccionProvider'
import Home from '@/pages/Home'
import Location from '@/pages/Location'
import Property from '@/pages/Property'
import Result from '@/pages/Result'
import Market from '@/pages/Market'
import Batch from '@/pages/Batch'
import Model from '@/pages/Model'
import DataPage from '@/pages/Data'

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
            <Route path="/lote" element={<Batch />} />
            <Route path="/modelo" element={<Model />} />
            <Route path="/datos" element={<DataPage />} />
          </Route>
        </Routes>
      </PrediccionProvider>
    </BrowserRouter>
  )
}
