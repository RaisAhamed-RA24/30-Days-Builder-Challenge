
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("Params");

  const [params, setParams] = useState("");
  const [headers, setHeaders] = useState('{\n  \n}');
  const [body, setBody] = useState('{\n  \n}');

  const [response, setResponse] = useState(null);
  const [status, setStatus] = useState("");
  const [responseTime, setResponseTime] = useState(null);
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("apiHistory")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("apiHistory", JSON.stringify(history));
  }, [history]);

  const sendRequest = async () => {
    if (!url.trim()) {
      alert("Please enter an API URL");
      return;
    }

    let requestUrl = url.trim();

    if (!/^https?:\/\//i.test(requestUrl)) {
      requestUrl = "https://" + requestUrl;
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(requestUrl);
    } catch {
      alert("Please enter a valid URL");
      return;
    }

    // Add query parameters
    const paramLines = params.split("\n");

    paramLines.forEach((line) => {
      const separator = line.indexOf("=");

      if (separator > 0) {
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim();

        if (key) {
          parsedUrl.searchParams.set(key, value);
        }
      }
    });

    // Parse headers
    let customHeaders;

    try {
      customHeaders = JSON.parse(headers || "{}");

      if (
        customHeaders === null ||
        Array.isArray(customHeaders) ||
        typeof customHeaders !== "object"
      ) {
        throw new Error("Headers must be a JSON object");
      }

      for (const [key, value] of Object.entries(customHeaders)) {
        if (typeof value !== "string") {
          throw new Error(`Header "${key}" must have a string value`);
        }
      }
    } catch (error) {
      alert("Invalid Headers JSON: " + error.message);
      return;
    }

    // Prepare request options
    const options = {
      method,
      headers: customHeaders,
    };

    // Add request body where supported
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        const parsedBody = JSON.parse(body || "{}");

        options.body = JSON.stringify(parsedBody);

        if (!Object.keys(customHeaders).some(
          (key) => key.toLowerCase() === "content-type"
        )) {
          options.headers["Content-Type"] = "application/json";
        }
      } catch (error) {
        alert("Invalid Body JSON: " + error.message);
        return;
      }
    }

    setLoading(true);
    setResponse(null);
    setStatus("Sending request...");
    setResponseTime(null);

    const startTime = performance.now();

    try {
      const result = await fetch(parsedUrl.toString(), options);

      const endTime = performance.now();

      setResponseTime(Math.round(endTime - startTime));

      const contentType = result.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await result.json();
      } else {
        data = await result.text();
      }

      setStatus(`${result.status} ${result.statusText}`);
      setResponse(data);

      setHistory((previous) => [
        {
          id: Date.now(),
          method,
          url: parsedUrl.toString(),
          status: result.status,
        },
        ...previous,
      ].slice(0, 20));

    } catch (error) {
      setStatus("Request Failed");
      setResponse(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = (item) => {
    setMethod(item.method);
    setUrl(item.url);
    setResponse(null);
    setStatus("");
    setResponseTime(null);
  };

  const clearResponse = () => {
    setResponse(null);
    setStatus("");
    setResponseTime(null);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">&lt;/&gt;</span>
          <h1>API Playground</h1>
        </div>
        <span className="version">v1.0</span>
      </header>

      <main className="main-container">
        <section className="intro">
          <h2>API Request Builder</h2>
          <p>Test APIs, send requests and inspect responses.</p>
        </section>

        <section className="request-panel">
          <div className="request-bar">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>PATCH</option>
              <option>DELETE</option>
            </select>

            <input
              type="text"
              placeholder="Enter API endpoint URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <button
              className="send-button"
              onClick={sendRequest}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>

          <div className="tabs">
            {["Params", "Headers", "Body"].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="request-content">
            {activeTab === "Params" && (
              <div>
                <h4>Query Parameters</h4>
                <p>Enter one parameter per line in key=value format.</p>
                <textarea
                  value={params}
                  onChange={(e) => setParams(e.target.value)}
                  placeholder={"userId=1\npostId=2"}
                />
              </div>
            )}

            {activeTab === "Headers" && (
              <div>
                <h4>Request Headers</h4>
                <p>Enter headers as a JSON object.</p>
                <textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  placeholder={'{\n  "Authorization": "Bearer token"\n}'}
                />
              </div>
            )}

            {activeTab === "Body" && (
              <div>
                <h4>Request Body (JSON)</h4>
                <p>Used for POST, PUT and PATCH requests.</p>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={'{\n  "title": "Hello",\n  "body": "Testing API",\n  "userId": 1\n}'}
                />
              </div>
            )}
          </div>
        </section>

        <section className="response-panel">
          <div className="response-heading">
            <h3>Response</h3>

            <div className="response-actions">
              <span>
                {status || "Waiting for request..."}
                {responseTime !== null && ` · ${responseTime} ms`}
              </span>

              <button onClick={clearResponse}>Clear</button>
            </div>
          </div>

          <div className="response-content">
            {response === null ? (
              <p>Your API response will appear here.</p>
            ) : (
              <pre>
                {typeof response === "string"
                  ? response
                  : JSON.stringify(response, null, 2)}
              </pre>
            )}
          </div>
        </section>

        <section className="history-panel">
          <div className="history-heading">
            <h3>Request History</h3>
            <button onClick={() => setHistory([])}>Clear History</button>
          </div>

          {history.length === 0 ? (
            <p className="empty-history">No requests yet.</p>
          ) : (
            history.map((item) => (
              <button
                className="history-item"
                key={item.id}
                onClick={() => loadHistory(item)}
              >
                <strong>{item.method}</strong>
                <span>{item.url}</span>
                <small>{item.status}</small>
              </button>
            ))
          )}
        </section>
      </main>

      <footer className="footer">
        Built with React | Day 4 of 30-Day Builder Challenge
      </footer>
    </div>
  );
}

export default App;
