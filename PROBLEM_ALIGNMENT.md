# CarbonCompass AI Hackathon Problem Alignment

CarbonCompass AI directly answers the core hackathon problem statement: **helping individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights.**

Here is how each product requirement maps directly to our high-performance implementation:

## 1. Requirement & Implementation Mapping

### 1.1 Multi-Category Footprint Assessment
- **Problem Statement Alignment:** Individuals find emissions calculations confusing and obscure.
- **Our Solution:** A beautiful, responsive sliding form categorizing human metrics across **Transportation, Flights, Electricity, Diet, Shopping, and Waste habits**. Users see instant, real-time calculations right as they interact.

### 1.2 The Carbon Profile
- **Problem Statement Alignment:** footprint metrics are dry and hard to relate to.
- **Our Solution:** The app compiles a customized "Carbon Profile" displaying:
  - An absolute carbon score (0 to 100).
  - Physical risk classification levels (Low, Medium, High).
  - A beautiful, responsive breakdowns chart analyzing which habit area drives the client's footing.

### 1.3 What-If Behavioral Simulator
- **Problem Statement Alignment:** Changing lifestyles feels overwhelming.
- **Our Solution:** Allows users to simulate custom commutes, meat-reduction schedules, and home renovations. It translates potential reductions into real-life numbers like **metric tons saved, cash savings, and equivalent trees planted**.

### 1.4 AI Coach Recommendations
- **Problem Statement Alignment:** Generic tips are boring and ignored.
- **Our Solution:** Generates individualized, secure, local instructions via Gemini API using the client's specific habits profile. Recommendations details unique, custom instructions.

### 1.5 Carbon Journey Checkpoints & JSON Backups
- **Problem Statement Alignment:** Users want custody of their long-term data history.
- **Our Solution:**
  - **Habit Streaks:** Built-in tracker displaying active and historic streaks.
  - **Checkpoint snapshots:** Record snapshots of current footprints to see progress trends on a vector curve.
  - **Full JSON Backup & Profile import/export:** Allows saving and transferring entire profiles as independent, local JSON files.
