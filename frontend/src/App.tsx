import Layout from "@/components/common/Layout";
import { ThemeProvider } from "@/context/ThemeContext";
import About from "@/pages/About";
import ConnectionTest from "@/pages/ConnectionTest";
import Home from "@/pages/Home";
import Results from "@/pages/Results";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="/about" element={<About />} />
            <Route path="/test" element={<ConnectionTest />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
