# AeroSense AI 🌿

**AeroSense AI** is a next-generation environmental intelligence dashboard that combines real-time air quality monitoring with AI-powered health tools. It goes beyond simple data display by actively guiding users to improve their respiratory health and understanding of their local atmosphere.


## ✨ Key Features

### 🌍 Real-Time Atmospheric Intelligence
- **Live Air Quality Map**: Interactive heatmap visualizing real-time pollution levels.
- **Pollutant Fingerprinting**: Identifies the primary source of pollution (e.g., Traffic, Industrial, Combustion) based on chemical composition.
- **Micro-Climate Analysis**: Provides precise wind direction, speed, and temperature data.

### 🧘 Smart Pulmonary Coach (AI-Powered)
- **Computer Vision Breathing Guide**: Uses **MediaPipe Pose Detection** to track your body movements via webcam.
- **Seated Exercise Routine**: Guides you through "Sky Reaches" and "Chest Openers" to expand lung capacity.
- **4-7-8 Breathing Tech**: A scientifically proven breathing rhythm (Inhale 4s, Hold 7s, Exhale 8s) monitored by AI to ensure relaxation.
- **Real-Time Feedback**: Offers instant correction on posture and movement accuracy.

### ☀️ Physics Lab & Health Tools
- **Solar Efficiency Calculator**: Estimates how much solar energy is lost due to local smog (PM2.5) and cloud opacity.
- **Carbon Footprint**: A quick estimator for your daily environmental impact.
- **Exposure Calculator**: Calculates accumulated pollutant exposure based on time spent outdoors.

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **AI & Computer Vision**: Google MediaPipe (Pose Detection), TensorFlow JS
- **State Management**: Zustand (with Session Persistence)
- **Animations**: Framer Motion
- **Maps & Data**: Leaflet, Recharts
- **APIs**:
  - WAQI (World Air Quality Index)
  - OpenWeatherMap (Meteorological Data & Cloud Cover)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aqi-ai.git
   cd aqi-ai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your API keys:
   ```env
   VITE_WAQI_API_KEY=your_waqi_token_here
   VITE_OPENWEATHER_API_KEY=your_owm_key_here
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Deploy to Vercel

1.  **Push to GitHub**: Ensure your project is pushed to a repository.
2.  **Import to Vercel**: 
    - Go to [Vercel](https://vercel.com/new).
    - Select your repository.
3.  **Configure Build Settings**:
    - Framework Preset: **Vite**
    - Build Command: `npm run build`
    - Output Directory: `dist`
4.  **Add Environment Variables**:
    Important! You must add the following in the Vercel Project Settings > Environment Variables:

    | Variable Key | Description |
    |--------------|-------------|
    | `VITE_WAQI_API_KEY` | Your token from aqicn.org |
    | `VITE_OPENWEATHER_API_KEY` | Your API key from OpenWeatherMap |

5.  **Deploy**: Click Deploy and wait for the build to finish.

## 🎮 How to Use

1. **Select Location**: Upon launch, search for your city or use "Detect GPS" to set your monitoring zone.
2. **View Dashboard**: Check the AQI gauge, pollutant breakdown, and wind analysis.
3. **Start AI Coach**:
    - Scroll to the "Pulmonary Coach" card.
    - Click **"Start AI Session"**.
    - Allow camera access.
    - **Raise your hands** above your nose to begin the guided session.
4. **Check Solar Potential**: Visit the "Solar Potential" card to see how much energy the atmosphere is blocking today.

## 📄 License
MIT License.
