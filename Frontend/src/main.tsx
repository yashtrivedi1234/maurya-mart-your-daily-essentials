import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { Provider } from "react-redux";
import { store } from "./store";
import { SocketProvider } from "./context/SocketContext";

createRoot(document.getElementById("root")!).render(
  <SocketProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </SocketProvider>
);
