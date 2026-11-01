import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocationProvider } from './context/LocationContext';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewPage } from './pages/OverviewPage';
import { LocationExplorerPage } from './pages/LocationExplorerPage';
import { ClimateWeatherPage } from './pages/intelligence/ClimateWeatherPage';
import { AgriculturePage } from './pages/intelligence/AgriculturePage';
import { WaterResourcesPage } from './pages/intelligence/WaterResourcesPage';
import { EnergyPage } from './pages/intelligence/EnergyPage';
import { EnvironmentPage } from './pages/intelligence/EnvironmentPage';
import { NaturalResourcesPage } from './pages/intelligence/NaturalResourcesPage';
import { LivingCostEconomyPage } from './pages/intelligence/LivingCostEconomyPage';
import { HealthcareEducationPage } from './pages/intelligence/HealthcareEducationPage';
import { InfrastructurePage } from './pages/intelligence/InfrastructurePage';
import { IntelligenceModuleView } from './pages/intelligence/IntelligenceModuleView';
import { ResourceGapAnalysisPage } from './pages/ResourceGapAnalysisPage';
import { CompareLocationsPage } from './pages/CompareLocationsPage';
import { ScenarioSimulatorPage } from './pages/ScenarioSimulatorPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LocationProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="explorer" element={<LocationExplorerPage />} />

            {/* Intelligence Modules */}
            <Route path="intelligence">
              <Route path="climate" element={<ClimateWeatherPage />} />
              <Route path="agriculture" element={<AgriculturePage />} />
              <Route path="water" element={<WaterResourcesPage />} />
              <Route path="energy" element={<EnergyPage />} />
              <Route path="environment" element={<EnvironmentPage />} />
              <Route path="natural-resources" element={<NaturalResourcesPage />} />
              <Route path="economy" element={<LivingCostEconomyPage />} />
              <Route path="healthcare-education" element={<HealthcareEducationPage />} />
              <Route path="infrastructure" element={<InfrastructurePage />} />
              <Route path=":moduleId" element={<IntelligenceModuleView />} />
            </Route>

            {/* Analysis Modules */}
            <Route path="analysis">
              <Route path="resource-gap" element={<ResourceGapAnalysisPage />} />
              <Route path="compare" element={<CompareLocationsPage />} />
              <Route path="simulator" element={<ScenarioSimulatorPage />} />
            </Route>

            {/* AI Assistant */}
            <Route path="assistant" element={<AIAssistantPage />} />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </LocationProvider>
    </BrowserRouter>
  );
};

export default App;
