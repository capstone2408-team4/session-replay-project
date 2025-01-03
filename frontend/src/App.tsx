import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage'
import SingleSessionPage from './components/SingleSessionPage'
import MultiSessionPage from './components/MultiSessionPage'
import FourOhFour from './components/FourOhFour';
import ChatbotPage from './components/ChatbotPage';
import { AuthProvider } from './components/AuthProvider/AuthProvider'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/' Component={LandingPage}/>
          <Route path='/single' Component={SingleSessionPage}/>
          <Route path='/multi' Component={MultiSessionPage}/>
          <Route path='/chatbot' Component={ChatbotPage}/>
          <Route path='*' Component={FourOhFour} />
        </Routes>
      </ Router>
    </AuthProvider>
  )
}

export default App
