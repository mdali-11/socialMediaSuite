import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MarketingCampaignExporter from './Pages/MarketingCampaign'
import MarketingPrompt from './Pages/MarketingPrompt'
import VideoGenerator from './Pages/VideoGenerator'
import CalendarManager from './Components/CalenderManager'
import SalesPlanForm from './Components/SalesPlanForm'
import PaymentGateway from './Components/PaymentGateway'

function App() {
  const [count, setCount] = useState(0)

  return (
     <>
     {/* <MarketingCampaignExporter /> */}
     <MarketingPrompt />
     <VideoGenerator />
     <CalendarManager />
     <SalesPlanForm />
     <PaymentGateway />
     </>
  )
}

export default App
