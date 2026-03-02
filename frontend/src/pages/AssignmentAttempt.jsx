import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import '../styles/AssignmentAttempt.scss';

const AssignmentAttempt = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [executeError, setExecuteError] = useState(null);

  // Hint State
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);

  // ─── Generate Session ID for Anonymous Users ──────────────────────────────────
  const [sessionId] = useState(() => {
    let sid = localStorage.getItem('ciphersql_session_id');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('ciphersql_session_id', sid);
    }
    return sid;
  });

  useEffect(() => {
    const fetchAssignmentAndProgress = async () => {
      try {
        const [assignRes, progRes] = await Promise.all([
          axios.get(`http://127.0.0.1:5000/api/assignments/${id}`),
          axios.get(`http://127.0.0.1:5000/api/progress/${sessionId}/${id}`)
        ]);

        setAssignment(assignRes.data);
        if (progRes.data && progRes.data.sqlQuery) {
          setQuery(progRes.data.sqlQuery);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignmentAndProgress();
  }, [id, sessionId]);

  const handleExecute = async () => {
    if (!query.trim()) return;
    setExecuting(true);
    setExecuteError(null);
    setResults(null);

    try {
      // 1. Save Progress
      axios.post('http://127.0.0.1:5000/api/progress', {
        userId: sessionId,
        assignmentId: id,
        sqlQuery: query
      }).catch(err => console.error('Failed to save progress', err));

      // 2. Execute Query
      const response = await axios.post('http://127.0.0.1:5000/api/execute', { query, assignmentId: id });
      setResults(response.data);
    } catch (err) {
      setExecuteError(err.response?.data?.error || err.message || 'Execution failed.');
    } finally {
      setExecuting(false);
    }
  };

  const handleGetHint = async () => {
    if (!assignment) return;
    setHintLoading(true);
    setHint('');

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/hint', {
        question: assignment.question,
        userQuery: query,
        expectedOutput: assignment.expectedOutput
      });
      setHint(response.data.hint);
    } catch (err) {
      console.error(err);
      setHint('Could not fetch hint at this time.');
    } finally {
      setHintLoading(false);
    }
  };

  if (loading) return <div className="empty-state" style={{ position: 'static' }}>Loading workspace...</div>;
  if (!assignment) return <div className="error-box" style={{ margin: '2rem' }}>Assignment not found.</div>;

  return (
    <div className="workspace">
      {/* Header Area */}
      <div className="workspace__header">
        <Link to="/" className="workspace__back">
          <span style={{ marginRight: '0.5rem' }}>←</span> Back
        </Link>
        <h2 className="workspace__title">{assignment.title}</h2>
      </div>

      {/* Main Workspace Grid */}
      <div className="workspace__grid">

        {/* Left Column: Requirements and Data */}
        <div className="workspace__panel panel">

          <div className="panel__section">
            <h3 className="panel__title">Problem Description</h3>
            <p className="panel__text">{assignment.question}</p>
          </div>

          <div className="panel__section">
            <h3 className="panel__title" style={{ marginBottom: '1rem' }}>Available Tables & Schema</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {assignment.sampleTables.map((table, idx) => (
                <div key={idx} className="schema-table">
                  <div className="schema-table__name">
                    {table.tableName}
                    <span style={{ float: 'right', fontWeight: 'normal', opacity: 0.8 }}>{table.rows.length} rows</span>
                  </div>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          {table.columns.map((col, cIdx) => (
                            <th key={cIdx}>
                              {col.columnName} <span className="data-type">{col.dataType}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {table.columns.map((col, cIdx) => (
                              <td key={cIdx}>{row[col.columnName]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel__section" style={{ marginBottom: 0 }}>
            <h3 className="panel__title">Expected Output Example</h3>
            <div className="table-responsive">
              <table className="data-table data-table--expected">
                <thead>
                  <tr>
                    {assignment.expectedOutput.value.length > 0 &&
                      Object.keys(assignment.expectedOutput.value[0]).map((key, i) => (
                        <th key={i}>{key}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {assignment.expectedOutput.value.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {Object.values(row).map((val, vIdx) => (
                        <td key={vIdx}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Editor and Results */}
        <div className="workspace__panel workspace__panel--editor">

          {/* SQL Editor Container */}
          <div className="editor-container">
            <div className="editor-header">
              <h3>SQL Query</h3>
              <div className="editor-actions">
                <button
                  className="btn btn--hint"
                  onClick={handleGetHint}
                  disabled={hintLoading}
                >
                  {hintLoading ? 'Thinking...' : '💡 Get Hint'}
                </button>
                <button
                  className="btn btn--execute"
                  onClick={handleExecute}
                  disabled={executing || !query.trim()}
                >
                  {executing ? 'Executing...' : '▶ Run Query'}
                </button>
              </div>
            </div>

            {hint && (
              <div className="hint-box">
                <button onClick={() => setHint('')} className="hint-box__close">✕</button>
                <div className="hint-box__content">
                  <span style={{ fontSize: '1.25rem' }}>🤖</span>
                  <div>
                    <strong>AI Tutor Suggestion</strong>
                    {hint}
                  </div>
                </div>
              </div>
            )}

            <div className="monaco-wrapper">
              <Editor
                height="100%"
                defaultLanguage="sql"
                theme="vs-dark"
                value={query}
                onChange={(val) => setQuery(val)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 15,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  automaticLayout: true
                }}
              />
            </div>
          </div>

          {/* Results Container */}
          <div className="results-container">
            <div className="editor-header">
              <h3>Execution Results</h3>
              {results && !executeError && (
                <span className="row-count">
                  {results.rowCount} row(s)
                </span>
              )}
            </div>

            <div className="results-content">
              {executeError && (
                <div className="error-box">
                  <strong>SQL Error</strong>
                  {executeError}
                </div>
              )}

              {!executeError && !results && (
                <div className="empty-state">
                  SELECT * FROM your_brilliance;
                </div>
              )}

              {results && (
                <div style={{ width: '100%' }}>
                  {results.rows && results.rows.length > 0 ? (
                    <table className="results-table">
                      <thead>
                        <tr>
                          {results.fields.map((field, i) => (
                            <th key={i}>{field}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.rows.map((row, index) => (
                          <tr key={index}>
                            {results.fields.map((field, i) => (
                              <td key={i}>
                                {row[field] !== null ? String(row[field]) : <span className="null-val">NULL</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="empty-state">
                      Query executed successfully, but returned 0 rows.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AssignmentAttempt;
