import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import MapPage from "@/pages/Map";
import CabinetDetailPage from "@/pages/CabinetDetail";
import ProductsPage from "@/pages/Products";
import ReplenishmentPage from "@/pages/Replenishment";
import ExceptionsPage from "@/pages/Exceptions";
import AnalyticsPage from "@/pages/Analytics";

export default function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/map/cabinet/:id" element={<CabinetDetailPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/replenishment" element={<ReplenishmentPage />} />
          <Route path="/exceptions" element={<ExceptionsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<MapPage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
