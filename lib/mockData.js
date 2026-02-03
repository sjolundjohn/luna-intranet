// Mock data generators for Clinical Trial Dashboard

// Generate realistic CGM glucose data (every 5 minutes)
export function generateCGMData(date = new Date(), daysBack = 1) {
  const data = [];
  const startTime = new Date(date);
  startTime.setDate(startTime.getDate() - daysBack);
  startTime.setHours(0, 0, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(23, 59, 59, 999);

  let currentGlucose = 120 + Math.random() * 40; // Start between 120-160
  let currentTime = new Date(startTime);

  while (currentTime <= endTime) {
    const hour = currentTime.getHours();

    // Simulate meal spikes and overnight patterns
    let trend = 0;
    if (hour >= 7 && hour < 9) trend = 2; // Breakfast spike
    else if (hour >= 12 && hour < 14) trend = 1.5; // Lunch spike
    else if (hour >= 18 && hour < 20) trend = 2; // Dinner spike
    else if (hour >= 22 || hour < 6) trend = -0.5; // Overnight drop (Luna active)
    else trend = -0.3; // General drift down

    // Add randomness
    const change = trend + (Math.random() - 0.5) * 8;
    currentGlucose += change;

    // Keep within realistic bounds
    currentGlucose = Math.max(55, Math.min(350, currentGlucose));

    data.push({
      time: new Date(currentTime),
      glucose: Math.round(currentGlucose),
      timestamp: currentTime.toISOString()
    });

    // Move forward 5 minutes
    currentTime = new Date(currentTime.getTime() + 5 * 60 * 1000);
  }

  return data;
}

// Generate insulin delivery events during Luna sessions (10pm - 10am)
export function generateInsulinEvents(date = new Date()) {
  const events = [];
  const sessionStart = new Date(date);
  sessionStart.setHours(22, 0, 0, 0);
  sessionStart.setDate(sessionStart.getDate() - 1); // Previous night

  const sessionEnd = new Date(date);
  sessionEnd.setHours(10, 0, 0, 0);

  // Generate 3-6 insulin events per session
  const numEvents = 3 + Math.floor(Math.random() * 4);

  for (let i = 0; i < numEvents; i++) {
    const eventTime = new Date(
      sessionStart.getTime() +
      Math.random() * (sessionEnd.getTime() - sessionStart.getTime())
    );

    events.push({
      time: eventTime,
      units: (0.3 + Math.random() * 0.7).toFixed(1), // 0.3 - 1.0 units
      timestamp: eventTime.toISOString()
    });
  }

  // Sort by time
  events.sort((a, b) => a.time - b.time);

  return events;
}

// Calculate glycemic metrics from CGM data
export function calculateMetrics(cgmData) {
  if (!cgmData || cgmData.length === 0) {
    return {
      tir: 0, tbr: 0, tar: 0, gmi: 0, cv: 0, avgGlucose: 0
    };
  }

  const glucoseValues = cgmData.map(d => d.glucose);
  const total = glucoseValues.length;

  // Time in Range calculations
  const inRange = glucoseValues.filter(g => g >= 70 && g <= 180).length;
  const belowRange = glucoseValues.filter(g => g < 70).length;
  const aboveRange = glucoseValues.filter(g => g > 180).length;

  const tir = Math.round((inRange / total) * 100);
  const tbr = Math.round((belowRange / total) * 100);
  const tar = Math.round((aboveRange / total) * 100);

  // Average glucose
  const avgGlucose = Math.round(glucoseValues.reduce((a, b) => a + b, 0) / total);

  // GMI (Glucose Management Indicator) - estimated A1C
  const gmi = ((avgGlucose + 46.7) / 28.7).toFixed(1);

  // Coefficient of Variation
  const mean = avgGlucose;
  const squaredDiffs = glucoseValues.map(g => Math.pow(g - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / total;
  const stdDev = Math.sqrt(avgSquaredDiff);
  const cv = Math.round((stdDev / mean) * 100);

  return { tir, tbr, tar, gmi: parseFloat(gmi), cv, avgGlucose };
}

// Generate session history
export function generateSessionHistory(numSessions = 14) {
  const sessions = [];
  const today = new Date();

  for (let i = 0; i < numSessions; i++) {
    const sessionDate = new Date(today);
    sessionDate.setDate(sessionDate.getDate() - i);

    const startTime = new Date(sessionDate);
    startTime.setDate(startTime.getDate() - 1);
    startTime.setHours(22, 0, 0, 0);

    const endTime = new Date(sessionDate);
    endTime.setHours(10, 0, 0, 0);

    // Random but realistic values
    const sessionTir = 65 + Math.floor(Math.random() * 25); // 65-90%
    const totalInsulin = (8 + Math.random() * 8).toFixed(1); // 8-16 units
    const hypoEvents = Math.random() < 0.15 ? 1 : 0; // 15% chance of hypo

    const statuses = ['Completed', 'Completed', 'Completed', 'Completed', 'Interrupted'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    sessions.push({
      id: `session-${i}`,
      date: sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      startTime: '10:00 PM',
      endTime: '10:00 AM',
      startDateTime: startTime,
      endDateTime: endTime,
      totalInsulin: parseFloat(totalInsulin),
      sessionTir: sessionTir,
      hypoEvents: hypoEvents,
      status: status
    });
  }

  return sessions;
}

// Generate Oura sleep data
export function generateSleepData(date = new Date()) {
  const deepPct = 20 + Math.floor(Math.random() * 15); // 20-35%
  const remPct = 15 + Math.floor(Math.random() * 15); // 15-30%
  const lightPct = 100 - deepPct - remPct;

  const totalMinutes = 390 + Math.floor(Math.random() * 120); // 6.5-8.5 hours
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    duration: `${hours}h ${minutes}m`,
    durationMinutes: totalMinutes,
    efficiency: 85 + Math.floor(Math.random() * 12), // 85-97%
    hrv: 40 + Math.floor(Math.random() * 30), // 40-70 ms
    restingHr: 55 + Math.floor(Math.random() * 15), // 55-70 bpm
    readinessScore: 75 + Math.floor(Math.random() * 20), // 75-95
    stages: {
      deep: deepPct,
      rem: remPct,
      light: lightPct
    },
    // Hourly sleep stage data for the chart
    hourlyData: generateHourlySleepData(totalMinutes, deepPct, remPct, lightPct)
  };
}

function generateHourlySleepData(totalMinutes, deepPct, remPct, lightPct) {
  const hours = Math.ceil(totalMinutes / 60);
  const data = [];

  for (let i = 0; i < hours; i++) {
    // Vary percentages slightly per hour
    const variation = () => Math.floor(Math.random() * 20) - 10;
    data.push({
      hour: i,
      deep: Math.max(0, Math.min(60, deepPct + variation())),
      rem: Math.max(0, Math.min(60, remPct + variation())),
      light: Math.max(0, Math.min(60, lightPct + variation()))
    });
  }

  return data;
}

// Generate participant list
export function generateParticipants(count = 12) {
  const participants = [];
  const statuses = ['Active', 'Active', 'Active', 'Active', 'Active', 'Paused', 'Flagged'];

  for (let i = 1; i <= count; i++) {
    const id = `P${String(i).padStart(3, '0')}`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    // Generate 7-day metrics
    const tirValues = Array.from({ length: 7 }, () => 60 + Math.floor(Math.random() * 30));
    const avgTir = Math.round(tirValues.reduce((a, b) => a + b, 0) / 7);
    const tirTrend = tirValues[6] - tirValues[0] > 3 ? 'up' : tirValues[6] - tirValues[0] < -3 ? 'down' : 'stable';

    const cgmWear = 85 + Math.floor(Math.random() * 15); // 85-100%

    const lastSession = new Date();
    lastSession.setDate(lastSession.getDate() - Math.floor(Math.random() * 3));

    participants.push({
      id,
      status,
      tir7Day: avgTir,
      tirTrend,
      cgmWear,
      lastSessionDate: lastSession.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      enrollmentDate: new Date(2025, 10 + Math.floor(Math.random() * 3), 1 + Math.floor(Math.random() * 28))
    });
  }

  return participants;
}

// Get study-wide summary metrics
export function getStudySummary(participants) {
  const activeCount = participants.filter(p => p.status === 'Active').length;
  const avgTir = Math.round(participants.reduce((sum, p) => sum + p.tir7Day, 0) / participants.length);
  const avgCompliance = Math.round(participants.reduce((sum, p) => sum + p.cgmWear, 0) / participants.length);

  // Count sessions this week (mock: each active participant has ~7 sessions)
  const sessionsThisWeek = activeCount * 7;

  return {
    totalParticipants: participants.length,
    activeParticipants: activeCount,
    avgTir,
    deviceCompliance: avgCompliance,
    sessionsThisWeek
  };
}
