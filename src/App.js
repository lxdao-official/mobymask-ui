import logo from "./logo.svg";
import "./installBuffer";
import QueryParamsRoute from "./QueryParamsRoute";
import { BrowserRouter } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>
          <img src={logo} className="App-logo" alt="logo" />
          MobyMask
        </h1>
        <p>An alliance of good-hearted phish, aiming to eliminate phishers.</p>
      </header>

      <BrowserRouter>
        <QueryParamsRoute />
      </BrowserRouter>

      <div className="footer">
        <p>Reporters are added on an invite-only basis.</p>
        <p>
          <a href="https://mirror.xyz/0x55e2780588aa5000F464f700D2676fD0a22Ee160/8whNch3m5KMzeo6g5eblcXMMplPf8UpW228cSh3nmzg">
            Learn more
          </a>
        </p>
        <p>
          <a href="https://github.com/danfinlay/MobyMask/">Fork on GitHub</a>
        </p>
      </div>
    </div>
  );
}

export default App;
