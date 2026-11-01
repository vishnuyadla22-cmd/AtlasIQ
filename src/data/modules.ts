import { IntelligenceModuleMeta } from '../types';

export const INTELLIGENCE_MODULES: IntelligenceModuleMeta[] = [
  {
    id: 'climate',
    title: 'Climate & Weather Intelligence',
    shortTitle: 'Climate & Weather',
    tagline: 'Historical climate patterns, extreme weather frequencies, and seasonal trends',
    description: 'Comprehensive historical and projected climate patterns, precipitation anomalies, thermal comfort indexes, and extreme weather risk probabilities.',
    path: '/intelligence/climate',
    iconName: 'CloudSun',
    indicatorCount: 14,
    plannedDataSources: ['Open-Meteo API', 'ERA5 Reanalysis', 'NOAA NCEI', 'Copernicus Climate Service'],
    reportingPeriod: 'Historical 30-year baseline & seasonal rolling',
    sampleIndicators: [
      { name: 'Mean Annual Temperature', description: 'Average surface temperature normalized across 30 years', unit: '°C', status: 'unavailable' },
      { name: 'Annual Precipitation', description: 'Total accumulated annual rainfall and snowfall equivalent', unit: 'mm', status: 'unavailable' },
      { name: 'Extreme Heat Degree Days', description: 'Days exceeding regional 95th percentile heat threshold', unit: 'days/yr', status: 'unavailable' },
      { name: 'Drought Severity Index (SPEI)', description: 'Standardized Precipitation-Evapotranspiration Index', unit: 'index', status: 'unavailable' }
    ]
  },
  {
    id: 'agriculture',
    title: 'Agriculture & Crop Suitability',
    shortTitle: 'Agriculture',
    tagline: 'Soil vitality, crop viability models, growing seasons, and harvest yields',
    description: 'Soil physicochemical profiles, agro-climatic zoning, optimal crop suitability scores, growing degree days, and regional agricultural productivity.',
    path: '/intelligence/agriculture',
    iconName: 'Sprout',
    indicatorCount: 12,
    plannedDataSources: ['FAO WaPOR', 'ISRIC World Soil Information', 'USDA FAS', 'NASA Harvest'],
    reportingPeriod: 'Annual agricultural cycles & seasonal updates',
    sampleIndicators: [
      { name: 'Soil Organic Carbon', description: 'Topsoil organic carbon density in upper 30cm', unit: 'g/kg', status: 'unavailable' },
      { name: 'Arable Land Proportion', description: 'Percentage of territorial area viable for cultivation', unit: '%', status: 'unavailable' },
      { name: 'Growing Season Length', description: 'Consecutive frost-free days with adequate moisture', unit: 'days', status: 'unavailable' },
      { name: 'Agro-Ecological Crop Suitability', description: 'Multi-crop suitability index for regional staples', unit: 'score (0-100)', status: 'unavailable' }
    ]
  },
  {
    id: 'water',
    title: 'Water & Groundwater Intelligence',
    shortTitle: 'Water Resources',
    tagline: 'Aquifer recharge rates, surface reserves, baseline water stress, and runoff',
    description: 'Groundwater table monitoring, hydrological basin stress indices, watershed storage capacities, aquifer depletion metrics, and drinking water security.',
    path: '/intelligence/water',
    iconName: 'Droplets',
    indicatorCount: 10,
    plannedDataSources: ['WRI Aqueduct 4.0', 'NASA GRACE-FO', 'USGS Water Data', 'Global Runoff Data Centre'],
    reportingPeriod: 'Quarterly hydrological monitoring & annual baselines',
    sampleIndicators: [
      { name: 'Baseline Water Stress', description: 'Ratio of total water withdrawals to available renewable surface/groundwater', unit: 'ratio', status: 'unavailable' },
      { name: 'Groundwater Table Anomaly', description: 'Deviation from 10-year mean aquifer saturation level', unit: 'meters', status: 'unavailable' },
      { name: 'Interannual Variability', description: 'Variability of water supply between different years', unit: 'index', status: 'unavailable' },
      { name: 'Drought Risk Index', description: 'Probability and historical frequency of hydrological deficits', unit: 'score (1-5)', status: 'unavailable' }
    ]
  },
  {
    id: 'energy',
    title: 'Electricity & Renewable Energy Potential',
    shortTitle: 'Energy & Power',
    tagline: 'Solar irradiance, wind power density, grid reliability, and clean transition capacity',
    description: 'Global horizontal irradiance (GHI), wind power density at standard turbine hub heights, grid capacity constraints, and clean energy transition potential.',
    path: '/intelligence/energy',
    iconName: 'Zap',
    indicatorCount: 11,
    plannedDataSources: ['Global Solar Atlas', 'Global Wind Atlas', 'IRENA Global Atlas', 'OpenStreetMap Energy Infra'],
    reportingPeriod: 'Multi-year satellite irradiance & wind flow baselines',
    sampleIndicators: [
      { name: 'Photovoltaic Power Potential', description: 'Long-term practical electricity generation potential from utility PV', unit: 'kWh/kWp/day', status: 'unavailable' },
      { name: 'Wind Power Density (100m)', description: 'Mean annual kinetic wind power available per square meter', unit: 'W/m²', status: 'unavailable' },
      { name: 'Grid Proximity & Interconnects', description: 'Average distance to high-voltage transmission substation', unit: 'km', status: 'unavailable' },
      { name: 'Clean Energy Share', description: 'Estimated percentage of regional grid powered by renewables', unit: '%', status: 'unavailable' }
    ]
  },
  {
    id: 'environment',
    title: 'Environmental Quality & Biodiversity',
    shortTitle: 'Environment',
    tagline: 'Air quality indexes, pollutant particulate matter, canopy cover, and biodiversity health',
    description: 'Atmospheric particulate matter concentrations (PM2.5, PM10, NO2), canopy cover preservation, biodiversity intactness, and natural hazard vulnerability.',
    path: '/intelligence/environment',
    iconName: 'Leaf',
    indicatorCount: 9,
    plannedDataSources: ['Copernicus Atmosphere (CAMS)', 'OpenAQ', 'Global Forest Watch', 'UNEP-WCMC'],
    reportingPeriod: 'Real-time telemetry & rolling 30-day medians',
    sampleIndicators: [
      { name: 'Air Quality Index (AQI)', description: 'Standardized composite atmospheric particulate reading', unit: 'AQI', status: 'unavailable' },
      { name: 'Fine Particulate Matter (PM2.5)', description: 'Mass concentration of inhalable particles <= 2.5 micrometers', unit: 'µg/m³', status: 'unavailable' },
      { name: 'Tree Canopy Cover', description: 'Percentage of land area with greater than 30% canopy density', unit: '%', status: 'unavailable' },
      { name: 'Biodiversity Intactness Index', description: 'Remaining proportion of original species abundance', unit: 'index', status: 'unavailable' }
    ]
  },
  {
    id: 'natural-resources',
    title: 'Natural Resources & Mineral Deposits',
    shortTitle: 'Natural Resources',
    tagline: 'Geological formations, critical mineral occurrences, timber, and aggregate reserves',
    description: 'Geological surveys, identified mineral deposits, critical raw materials (lithium, rare earths, copper), commercial forestry, and extractive industries.',
    path: '/intelligence/natural-resources',
    iconName: 'Mountain',
    indicatorCount: 8,
    plannedDataSources: ['USGS Mineral Resources Program', 'BGS World Mineral Statistics', 'Global Land Outlook'],
    reportingPeriod: 'Published geological survey baselines',
    sampleIndicators: [
      { name: 'Identified Critical Minerals', description: 'Known strategic deposits located within 100km radius', unit: 'deposits', status: 'unavailable' },
      { name: 'Commercial Timber Volume', description: 'Harvestable commercial forestry stock volume', unit: 'm³/ha', status: 'unavailable' },
      { name: 'Extractive Footprint', description: 'Active mining and quarry lease areas', unit: 'km²', status: 'unavailable' },
      { name: 'Geological Stability Rating', description: 'Seismic and tectonic risk classification', unit: 'category (I-IV)', status: 'unavailable' }
    ]
  },
  {
    id: 'economy',
    title: 'Living Cost & Economic Indicators',
    shortTitle: 'Living Cost & Economy',
    tagline: 'Purchasing power, housing affordability, employment clusters, and GDP metrics',
    description: 'Regional gross domestic product, median household purchasing power, housing affordability ratios, primary employment clusters, and inflation drivers.',
    path: '/intelligence/economy',
    iconName: 'TrendingUp',
    indicatorCount: 15,
    plannedDataSources: ['World Bank Open Data', 'OECD Regional Statistics', 'National Statistical Agencies', 'Numbeo Index'],
    reportingPeriod: 'Annual national accounts & quarterly cost baskets',
    sampleIndicators: [
      { name: 'Regional GDP Per Capita', description: 'Purchasing power parity adjusted gross regional product', unit: 'USD (PPP)', status: 'unavailable' },
      { name: 'Cost of Living Index', description: 'Consumer price benchmark relative to baseline metropolis (New York = 100)', unit: 'index', status: 'unavailable' },
      { name: 'Median Housing Multiple', description: 'Ratio of median home price to median annual household income', unit: 'ratio', status: 'unavailable' },
      { name: 'Primary Economic Specialization', description: 'Dominant regional employment and export sector', unit: 'sector', status: 'unavailable' }
    ]
  },
  {
    id: 'healthcare-education',
    title: 'Healthcare & Education Infrastructure',
    shortTitle: 'Healthcare & Education',
    tagline: 'Hospital bed density, physician access, school proximity, and literacy attainment',
    description: 'Healthcare access metrics, acute care hospital bed capacity, emergency response radiuses, educational attainment rates, and technical institutions.',
    path: '/intelligence/healthcare-education',
    iconName: 'GraduationCap',
    indicatorCount: 10,
    plannedDataSources: ['WHO Global Health Observatory', 'UNESCO UIS', 'OpenStreetMap Healthcare & Education'],
    reportingPeriod: 'Annual public health & education census data',
    sampleIndicators: [
      { name: 'Hospital Beds per 1,000', description: 'Total acute care inpatient hospital beds per thousand residents', unit: 'beds/1k', status: 'unavailable' },
      { name: 'Physician Density', description: 'Practicing licensed medical doctors per 10,000 population', unit: 'doctors/10k', status: 'unavailable' },
      { name: 'Tertiary Education Attainment', description: 'Percentage of adult population (25-64) with post-secondary degree', unit: '%', status: 'unavailable' },
      { name: 'School Accessibility Radius', description: 'Average transit time to primary and secondary educational institutions', unit: 'minutes', status: 'unavailable' }
    ]
  },
  {
    id: 'infrastructure',
    title: 'Transportation & Logistics Infrastructure',
    shortTitle: 'Infrastructure',
    tagline: 'Road network connectivity, port access, transit coverage, and digital bandwidth',
    description: 'Arterial highway density, freight logistics connectivity, deepwater port and airport proximity, public transit coverage, and fiber broadband access.',
    path: '/intelligence/infrastructure',
    iconName: 'Truck',
    indicatorCount: 12,
    plannedDataSources: ['OpenStreetMap Road Network', 'World Bank Logistics Performance Index', 'ITU Broadband Atlas'],
    reportingPeriod: 'Quarterly geospatial network analysis',
    sampleIndicators: [
      { name: 'Paved Road Density', description: 'Kilometers of paved all-weather roads per square kilometer', unit: 'km/km²', status: 'unavailable' },
      { name: 'Freight Terminal Proximity', description: 'Distance to nearest intermodal container or rail freight hub', unit: 'km', status: 'unavailable' },
      { name: 'Broadband Fiber Penetration', description: 'Percentage of households with gigabit fiber broadband connectivity', unit: '%', status: 'unavailable' },
      { name: 'Logistics Access Index', description: 'Composite index of multi-modal trade connectivity', unit: 'score (1-5)', status: 'unavailable' }
    ]
  }
];
