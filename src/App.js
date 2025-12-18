import React from "react";
import "./App.css";

// Import your existing Story Point components
import StoryPoint1 from "./story_points/StoryPoint1";
import StoryPoint2 from "./story_points/StoryPoint2";
import StoryPoint3 from "./story_points/StoryPoint3";
import StoryPoint4 from "./story_points/StoryPoint4";

function App() {
  return (
    <div className="App">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Sleep Health Dashboard</h1>
          <p>Analyzing the link between Mental Health, Lifestyle Decisions, and Sleep Disorders.</p>
        </div>
      </header>

      <main className="dashboard-container">
        
        {/* Story Point 1 */}
        <section className="story-card">
          <div className="story-text">
            <h2>1. The Sleep Landscape</h2>
            <p>
              We begin by mapping the baseline. Do people who rate their sleep highly actually sleep longer? 
              And where do disorders like <strong>Insomnia</strong> and <strong>Apnea</strong> appear?
            </p>
          </div>
          <div className="viz-container">
            {/* Component loads its own data */}
            <StoryPoint1 />
          </div>
        </section>

        {/* Story Point 2 */}
        <section className="story-card">
          <div className="story-text">
            <h2>2. The Mental Factor: Stress</h2>
            <p>
              Stress is often cited as the #1 sleep killer. Here we track how sleep duration effects 
              self-reported stress levels rise from 1 to 10.
            </p>
          </div>
          <div className="viz-container">
            <StoryPoint2 />
          </div>
        </section>

        {/* Story Point 3 */}
        <section className="story-card">
          <div className="story-text">
            <h2>3. The Environmental Factor: Career</h2>
            <p>
              This Treemap reveals which industries are the most sleep-deprived.
              Size represents the number of people, and color represents sleep quality.
            </p>
          </div>
          <div className="viz-container">
            <StoryPoint3 />
          </div>
        </section>

        {/* Story Point 4 */}
        <section className="story-card">
          <div className="story-text">
            <h2>4. The Physical Factor: BMI</h2>
            <p>
              Finally, we look at the physical body. This Sunburst chart breaks down 
              BMI categories (Inner Ring) into specific disorders (Outer Ring).
            </p>
          </div>
          <div className="viz-container">
            <StoryPoint4 />
          </div>
        </section>

      </main>

      <footer className="dashboard-footer">
        <p>Sleep Health & Lifestyle Dataset Analysis</p>
      </footer>
    </div>
  );
}

export default App;