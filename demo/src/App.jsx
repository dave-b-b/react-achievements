import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { AchievementProvider, useAchievement } from "react-achievements";
import achievementConfig from "./AchievementConfig";

const AppContents = () => {
  const { setMetrics, metrics } = useAchievement();
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button
          onClick={() => {
            setMetrics((prevMetrics) => {
              return {
                ...prevMetrics,
                level: prevMetrics.level + 1,
              };
            });
          }}
        >
          level is {metrics.level}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
};

const initialState = {
  level: 1,
};

/**
 * @see node_modules/react-achievements/dist/defaultStyles.d.ts
 */
const customStyles = {
  achievementModal: {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    content: {
      color: "#000000",
    },
    title: {
      // color: "#ffd700",
    },
    button: {
      // backgroundColor: "#4CAF50",
    },
  },
  badgesModal: {
    content: {
      color: "#000000",
    },
  },
  badgesButton: {
    // Custom styles for the badges button
  },
};

function App() {
  return (
    <AchievementProvider
      config={achievementConfig}
      initialState={initialState}
      badgesButtonPosition="top-right"
      styles={customStyles}
    >
      <AppContents />
    </AchievementProvider>
  );
}

export default App;
