import "@fontsource/roboto";

import { BrowserRouter, Route, Navigate, Routes } from "react-router-dom";

import Theme from "./components/Theme";
import Bar from "./components/Bar";

import Home from "./routes/Home";
import NotFound from "./routes/NotFound";
import Network from "./routes/Network/Network";

function App() {
  return (
    <Theme>
      <BrowserRouter basename="/app">
        <Bar />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/network/:nwid" element={<Network />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </BrowserRouter>
    </Theme>
  );
}

export default App;
