import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Link,
  ExternalLink,
  TrendingUp,
  MousePointerClick,
} from "lucide-react";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function App() {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [allUrls, setAllUrls] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load all URLs on mount
  useEffect(() => {
    fetchAllUrls();
  }, []);

  const fetchAllUrls = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/urls`);
      setAllUrls(response.data);
    } catch (error) {
      console.error("Error fetching URLs:", error);
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/shorten`, {
        url: url,
        customAlias: customAlias || null,
      });
      setShortUrl(response.data.shortUrl);
      setUrl("");
      setCustomAlias("");
      fetchAllUrls(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.error || "Error shortening URL");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (shortCode) => {
    try {
      const response = await axios.get(`${API_URL}/api/analytics/${shortCode}`);
      setAnalytics(response.data);
      setSelectedUrl(shortCode);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <header>
          <h1>
            <Link size={32} /> URL Shortener
          </h1>
          <p>Fast, simple, and powerful URL shortening with analytics</p>
        </header>

        {/* URL Shortening Form */}
        <div className="card">
          <h2>Shorten a URL</h2>
          <form onSubmit={handleShorten}>
            <input
              type="url"
              placeholder="Enter your long URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="input-long"
            />
            <input
              type="text"
              placeholder="Custom alias (optional)"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              className="input-short"
            />
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Shortening..." : "Shorten URL"}
            </button>
          </form>

          {shortUrl && (
            <div className="result">
              <p>Your shortened URL:</p>
              <div className="short-url">
                <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                  {shortUrl}
                </a>
                <button onClick={() => navigator.clipboard.writeText(shortUrl)}>
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* URL List */}
        <div className="card">
          <h2>
            <TrendingUp size={20} /> Your URLs ({allUrls.length})
          </h2>
          <div className="url-list">
            {allUrls.length === 0 ? (
              <p className="empty">No URLs yet. Create one above!</p>
            ) : (
              allUrls.map((item) => (
                <div key={item.id} className="url-item">
                  <div className="url-info">
                    <a
                      href={`${API_URL}/${item.shortCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="short-link"
                    >
                      {API_URL}/{item.shortCode} <ExternalLink size={14} />
                    </a>
                    <p className="original-url">{item.originalUrl}</p>
                    <div className="meta">
                      <span>
                        <MousePointerClick size={14} /> {item.clickCount} clicks
                      </span>
                      <span>
                        Created: {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => fetchAnalytics(item.shortCode)}
                    className="btn-analytics"
                  >
                    View Analytics
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Analytics Panel */}
        {analytics && (
          <div className="card analytics">
            <h2>Analytics: /{selectedUrl}</h2>
            <div className="stats">
              <div className="stat-card">
                <h3>Total Clicks</h3>
                <p className="stat-value">{analytics.totalClicks}</p>
              </div>
              <div className="stat-card">
                <h3>Original URL</h3>
                <p className="stat-url">{analytics.originalUrl}</p>
              </div>
              <div className="stat-card">
                <h3>Created</h3>
                <p className="stat-value">
                  {new Date(analytics.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <h3>Recent Clicks</h3>
            {analytics.recentClicks.length === 0 ? (
              <p className="empty">No clicks yet</p>
            ) : (
              <div className="recent-clicks">
                {analytics.recentClicks.map((click, index) => (
                  <div key={index} className="click-item">
                    <span className="click-time">
                      {new Date(click.clickedAt).toLocaleString()}
                    </span>
                    <span className="click-ip">{click.ipAddress}</span>
                    <span className="click-browser">
                      {click.userAgent?.substring(0, 50)}...
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
