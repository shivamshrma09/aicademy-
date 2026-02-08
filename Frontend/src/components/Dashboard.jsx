import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { BookOpen, FileText, Clock, TrendingUp, Award, Target, CheckCircle, Activity, Calendar, Zap } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:1000'}/api/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) setData(result.stats);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!data) return <div style={{ marginLeft: '280px', padding: '20px' }}>Loading...</div>;

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Activity',
      data: data.weeklyActivity,
      borderColor: '#174C7C',
      backgroundColor: 'rgba(23, 76, 124, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const testScoreData = {
    labels: data.testPerformance.testScores.map((_, i) => `T${i + 1}`),
    datasets: [{
      label: 'Score %',
      data: data.testPerformance.testScores,
      backgroundColor: '#174C7C'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false } }
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ backgroundColor: color, padding: '10px', borderRadius: '8px' }}>
        <Icon size={22} color="white" />
      </div>
      <div>
        <p style={{ margin: 0, color: '#666', fontSize: '0.8em' }}>{title}</p>
        <h2 style={{ margin: '3px 0 0 0', color: '#174C7C', fontSize: '1.6em', fontWeight: '700' }}>{value}</h2>
      </div>
    </div>
  );

  return (
    <div style={{ marginLeft: '280px', padding: '20px', maxWidth: '1400px' }}>
      <h1 style={{ fontSize: '2em', color: '#174C7C', marginBottom: '8px', fontWeight: '700' }}>Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '25px' }}>Welcome back! Here's your complete learning overview</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '25px' }}>
        <StatCard icon={BookOpen} title="Total Batches" value={data.overview.totalBatches} color="#174C7C" />
        <StatCard icon={CheckCircle} title="Completed" value={data.overview.completedBatches} color="#059669" />
        <StatCard icon={FileText} title="Tests Taken" value={data.overview.totalTests} color="#2563eb" />
        <StatCard icon={Target} title="Avg Score" value={`${data.overview.avgScore}%`} color="#dc2626" />
        <StatCard icon={Activity} title="Streak" value={`${data.overview.streak}d`} color="#f59e0b" />
        <StatCard icon={Award} title="Points" value={data.overview.totalPoints} color="#8b5cf6" />
        <StatCard icon={Zap} title="Rank" value={`#${data.overview.rank || 'N/A'}`} color="#ec4899" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '18px' }}>
          <h2 style={{ margin: '0 0 12px 0', color: '#174C7C', fontSize: '1.1em', fontWeight: '600' }}>Weekly Activity</h2>
          <Line data={chartData} options={chartOptions} />
        </div>
        <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '18px' }}>
          <h2 style={{ margin: '0 0 12px 0', color: '#174C7C', fontSize: '1.1em', fontWeight: '600' }}>Recent Test Scores</h2>
          {data.testPerformance.testScores.length > 0 ? <Bar data={testScoreData} options={chartOptions} /> : <p style={{ color: '#666', textAlign: 'center', marginTop: '40px' }}>No tests taken yet</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '18px' }}>
          <h2 style={{ margin: '0 0 12px 0', color: '#174C7C', fontSize: '1.1em', fontWeight: '600' }}>Recent Batches</h2>
          {data.recentActivity.recentBatches.length > 0 ? data.recentActivity.recentBatches.map((b, i) => (
            <div key={i} style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '6px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ color: '#174C7C', fontWeight: '600', fontSize: '0.85em' }}>{b.title}</span>
                <span style={{ color: '#059669', fontSize: '0.8em', fontWeight: '600' }}>{b.progress}%</span>
              </div>
              <div style={{ backgroundColor: '#e0e0e0', height: '3px', borderRadius: '2px' }}>
                <div style={{ backgroundColor: '#174C7C', height: '100%', width: `${b.progress}%`, borderRadius: '2px' }}></div>
              </div>
            </div>
          )) : <p style={{ color: '#666', textAlign: 'center', fontSize: '0.85em' }}>No batches yet</p>}
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '18px' }}>
          <h2 style={{ margin: '0 0 12px 0', color: '#174C7C', fontSize: '1.1em', fontWeight: '600' }}>Recent Tests</h2>
          {data.recentActivity.recentTests.length > 0 ? data.recentActivity.recentTests.map((t, i) => (
            <div key={i} style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '6px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ color: '#174C7C', fontWeight: '600', fontSize: '0.85em' }}>{t.testTitle || t.testName}</span>
                <span style={{ color: t.percentage >= 70 ? '#059669' : '#dc2626', fontWeight: '600', fontSize: '0.85em' }}>{t.percentage}%</span>
              </div>
              <small style={{ color: '#666', fontSize: '0.75em' }}>{t.score}/{t.totalQuestions} correct</small>
            </div>
          )) : <p style={{ color: '#666', textAlign: 'center', fontSize: '0.85em' }}>No tests taken yet</p>}
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '18px' }}>
          <h2 style={{ margin: '0 0 12px 0', color: '#174C7C', fontSize: '1.1em', fontWeight: '600' }}>Recent Resources</h2>
          {data.recentActivity.recentResources.length > 0 ? data.recentActivity.recentResources.map((r, i) => (
            <div key={i} style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '6px', marginBottom: '6px' }}>
              <span style={{ color: '#174C7C', fontWeight: '600', fontSize: '0.85em', display: 'block' }}>{r.heading}</span>
              <small style={{ color: '#666', fontSize: '0.75em' }}>{new Date(r.createdAt).toLocaleDateString()}</small>
            </div>
          )) : <p style={{ color: '#666', textAlign: 'center', fontSize: '0.85em' }}>No resources saved</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '18px' }}>
          <h2 style={{ margin: '0 0 12px 0', color: '#174C7C', fontSize: '1.1em', fontWeight: '600' }}>Active Batches Progress</h2>
          {data.progress.activeBatches.length > 0 ? data.progress.activeBatches.map((b, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div>
                  <span style={{ color: '#174C7C', fontWeight: '600', fontSize: '0.9em' }}>{b.title}</span>
                  <span style={{ color: '#666', fontSize: '0.8em', marginLeft: '8px' }}>({b.completedChapters}/{b.totalChapters} chapters)</span>
                </div>
                <span style={{ color: '#059669', fontWeight: '600', fontSize: '0.9em' }}>{b.progress}%</span>
              </div>
              <div style={{ backgroundColor: '#e0e0e0', height: '6px', borderRadius: '3px' }}>
                <div style={{ backgroundColor: '#174C7C', height: '100%', width: `${b.progress}%`, borderRadius: '3px' }}></div>
              </div>
            </div>
          )) : <p style={{ color: '#666', textAlign: 'center' }}>No active batches</p>}
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '18px' }}>
          <h2 style={{ margin: '0 0 12px 0', color: '#174C7C', fontSize: '1.1em', fontWeight: '600' }}>Best Subjects</h2>
          {data.testPerformance.bestSubjects?.length > 0 ? data.testPerformance.bestSubjects.map((s, i) => (
            <div key={i} style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '6px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#174C7C', fontWeight: '600', fontSize: '0.85em' }}>{s.subject}</span>
              <span style={{ color: '#059669', fontWeight: '600', fontSize: '0.85em' }}>{s.avgScore}%</span>
            </div>
          )) : <p style={{ color: '#666', textAlign: 'center', fontSize: '0.85em' }}>No data yet</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '18px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#174C7C', fontSize: '0.9em' }}>Chapters</h3>
          <p style={{ fontSize: '1.8em', fontWeight: '700', color: '#174C7C', margin: '8px 0' }}>{data.progress.totalChaptersCompleted}/{data.progress.totalChapters}</p>
          <p style={{ color: '#666', fontSize: '0.75em' }}>Completed</p>
        </div>
        <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '18px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#174C7C', fontSize: '0.9em' }}>Study Time</h3>
          <p style={{ fontSize: '1.8em', fontWeight: '700', color: '#174C7C', margin: '8px 0' }}>{data.recentActivity.studyTimeWeek}m</p>
          <p style={{ color: '#666', fontSize: '0.75em' }}>This Week</p>
        </div>
        <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '18px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#174C7C', fontSize: '0.9em' }}>Resources</h3>
          <p style={{ fontSize: '1.8em', fontWeight: '700', color: '#174C7C', margin: '8px 0' }}>{data.resources.totalPDFs}</p>
          <p style={{ color: '#666', fontSize: '0.75em' }}>Saved PDFs</p>
        </div>
        <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '18px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#174C7C', fontSize: '0.9em' }}>Library</h3>
          <p style={{ fontSize: '1.8em', fontWeight: '700', color: '#174C7C', margin: '8px 0' }}>{data.resources.libraryItems}</p>
          <p style={{ color: '#666', fontSize: '0.75em' }}>Items</p>
        </div>
        <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '18px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#174C7C', fontSize: '0.9em' }}>Certificates</h3>
          <p style={{ fontSize: '1.8em', fontWeight: '700', color: '#174C7C', margin: '8px 0' }}>{data.achievements.certificates}</p>
          <p style={{ color: '#666', fontSize: '0.75em' }}>Earned</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
