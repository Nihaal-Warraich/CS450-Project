import "./App.css";

// Import each story point component
import StoryPoint1 from "./story_points/StoryPoint1";
import StoryPoint2 from "./story_points/StoryPoint2";
import StoryPoint3 from "./story_points/StoryPoint3";
import StoryPoint4 from "./story_points/StoryPoint4";

function App() {
  return (
    <div className="App">
      <header className="dashboard-header">
        <h1>Sleep Health and Life Style Dataset Dashboard</h1>
        <p>Explore insights revealed by each visualization below.</p>
      </header>

      <main className="dashboard-container">
        
        <section className="story-section">
          <h2>Story Point 1</h2>
          <StoryPoint1 />
        </section>

        <section className="story-section">
          <h2>Stress Levels vs. Sleep Duration</h2>
          <StoryPoint2 />
        </section>

        <section className="story-section">
          <h2>Story Point 3</h2>
          <StoryPoint3 />
        </section>

        <section className="story-section">
          <h2>BMI & Clinical Disorders</h2>
          <StoryPoint4 />
        </section>

      </main>
    </div>
  );
}

export default App;
