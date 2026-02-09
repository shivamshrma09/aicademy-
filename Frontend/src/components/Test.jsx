import React, { useState, useEffect } from "react";
import { Zap, XCircle, FileText } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./Test.css";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY ;
const API_URL = import.meta.env.VITE_API_URL;

const getGeminiModel = (modelName = "gemini-2.5-flash") => {
  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  return genAI.getGenerativeModel({ model: modelName });
};

const Test = () => {
  const [showBatchCreation, setShowBatchCreation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newLanguage, setNewLanguage] = useState("English");
  const [newDuration, setNewDuration] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSyllabusText, setNewSyllabusText] = useState("");
  const [allTestSeries, setAllTestSeries] = useState([]);
  const [selectedTestSeries, setSelectedTestSeries] = useState(null);
  const [activeTest, setActiveTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [testResults, setTestResults] = useState([]);

  // Load test series from backend
  useEffect(() => {
    fetchTestSeries();
  }, []);

  const fetchTestSeries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/test-series/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAllTestSeries(data.testSeries);
      }
    } catch (error) {
      console.error('Error fetching test series:', error);
    }
  };

  const handleBatchFormSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const prompt = `
You are an expert world best educator. Create a highly detailed, accurate, and comprehensive learning Test series from basic to advance for:
Subject: ${newSubject}
Language: ${newLanguage}
Syllabus/Detail: ${newSyllabusText || newDescription}
Description: ${newDescription}

The test series should contain exactly:
- 3 basic tests
- 3 mid-level tests
- 4 advanced tests

Each test must include multiple questions based on the SBA (Single Best Answer) format. For each question:
- Provide 4 options labeled (A, B, C, D)
- Each test should contain 8 questions
- Specify the correct answer

Answer strictly in JSON like this format (example):

{
  "Testname": "string",
  "description": "string",
  "tests": [
    {
      "title": "Basic Test 1",
      "level": "Basic",
      "questions": [
        {
          "question": "string",
          "options": {
            "A": "string",
            "B": "string",
            "C": "string",
            "D": "string"
          },
          "correctAnswer": "A"
        }
      ]
    }
  ]
}

Return ONLY strict JSON, no extra text outside JSON.
`;

    try {
      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const rawText = result.response.text();

      if (!rawText.trim()) {
        throw new Error("Gemini API returned empty response!");
      }

      const cleanedResponse = rawText.replace(/``````/g, "").trim();
      const cleanedResponse2 = cleanedResponse.replace(/```json\n?|\n?```/g, '').trim();
      const generatedPlan = JSON.parse(cleanedResponse2);

      const newTestSeries = {
        ...generatedPlan,
        subject: newSubject,
      };

      // Save to backend
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/test-series/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTestSeries)
      });

      const data = await response.json();
      if (data.success) {
        alert("Test series generated successfully!");
        fetchTestSeries();
        setNewTitle("");
        setNewSubject("");
        setNewLanguage("English");
        setNewDuration("");
        setNewDescription("");
        setNewSyllabusText("");
        setShowBatchCreation(false);
      }
    } catch (error) {
      console.error("Error generating test series:", error.message);
      alert("Failed to generate test series. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Select test series
  const handleSelectTestSeries = (series) => {
    setSelectedTestSeries(series);
    setActiveTest(null);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
  };

  // Start specific test inside series
  const handleStartTest = (index) => {
    if (selectedTestSeries && selectedTestSeries.tests[index]) {
      setActiveTest(selectedTestSeries.tests[index]);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setShowResult(false);
      setScore(0);
    }
  };

  // Option select
  const handleOptionSelect = (option) => {
    if (showResult) return;
    setSelectedOption(option);
  };

  // Submit answer and check correctness
  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setShowResult(true);
    if (selectedOption === activeTest.questions[currentQuestionIndex].correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (!showResult) return;

    const questionsLength = activeTest.questions.length;

    if (currentQuestionIndex < questionsLength - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      // Save test result to backend
      const testResult = {
        testSeriesId: selectedTestSeries._id,
        testName: selectedTestSeries.Testname,
        testTitle: activeTest.title,
        level: activeTest.level,
        score,
        totalQuestions: questionsLength,
      };

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/test-series/result`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(testResult)
        });

        const data = await response.json();
        if (data.success) {
          alert(`Test Completed! Your score: ${score}/${questionsLength}${data.emailSent ? '\nReport sent to your email!' : ''}`);
        }
      } catch (error) {
        console.error('Error saving test result:', error);
        alert(`Test Completed! Your score: ${score}/${questionsLength}`);
      }

      setActiveTest(null);
      setScore(0);
      setSelectedOption(null);
      setShowResult(false);
    }
  };

  const handleSkipQuestion = async () => {
    const questionsLength = activeTest.questions.length;

    if (currentQuestionIndex < questionsLength - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      // Save test result to backend
      const testResult = {
        testSeriesId: selectedTestSeries._id,
        testName: selectedTestSeries.Testname,
        testTitle: activeTest.title,
        level: activeTest.level,
        score,
        totalQuestions: questionsLength,
      };

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/test-series/result`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(testResult)
        });

        const data = await response.json();
        if (data.success) {
          alert(`Test Completed! Your score: ${score}/${questionsLength}${data.emailSent ? '\nReport sent to your email!' : ''}`);
        }
      } catch (error) {
        console.error('Error saving test result:', error);
        alert(`Test Completed! Your score: ${score}/${questionsLength}`);
      }

      setActiveTest(null);
      setScore(0);
      setSelectedOption(null);
      setShowResult(false);
    }
  };

  // Render active test interface
  const renderTestInterface = () => {
    if (!activeTest) return null;
    const currentQuestion = activeTest.questions[currentQuestionIndex];
    const optionLabels = ["A", "B", "C", "D"];

    return (
      <div className="pw-modal-overlay">
        <div className="pw-modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '2px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#174C7C' }}>{activeTest.title} - Question {currentQuestionIndex + 1}/{activeTest.questions.length}</h2>
            <button onClick={() => setActiveTest(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#6b7280' }}>×</button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>{currentQuestion.question}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {optionLabels.map((ch) => (
                  <label 
                    key={ch}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '12px 16px', 
                      backgroundColor: selectedOption === ch ? '#dbeafe' : 'white',
                      border: selectedOption === ch ? '2px solid #174C7C' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: showResult ? 'default' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="option" 
                      id={"option-" + ch}
                      value={ch} 
                      checked={selectedOption === ch}
                      onChange={() => handleOptionSelect(ch)}
                      disabled={showResult}
                      style={{ marginRight: '12px', accentColor: '#174C7C' }}
                    /> 
                    <span style={{ fontSize: '14px', color: '#374151' }}><b>{ch}.</b> {currentQuestion.options[ch]}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {showResult && (
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: selectedOption === currentQuestion.correctAnswer ? '#d4edda' : '#f8d7da', border: `1px solid ${selectedOption === currentQuestion.correctAnswer ? '#28a745' : '#dc3545'}`, marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: selectedOption === currentQuestion.correctAnswer ? '#155724' : '#721c24' }}>
                  {selectedOption === currentQuestion.correctAnswer ? "✓ Correct Answer!" : `✗ Wrong Answer. Correct: ${currentQuestion.correctAnswer}`}
                </p>
              </div>
            )}
          </div>
          
          <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' }}>
            <button 
              onClick={handleSkipQuestion}
              disabled={showResult}
              style={{ padding: '10px 20px', backgroundColor: showResult ? '#9ca3af' : '#6c757d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: showResult ? 'not-allowed' : 'pointer' }}
            >
              Skip
            </button>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              Question {currentQuestionIndex + 1} of {activeTest.questions.length}
            </div>
            {!showResult ? (
              <button 
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                style={{ 
                  padding: '10px 24px', 
                  backgroundColor: selectedOption === null ? '#9ca3af' : '#174C7C', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  cursor: selectedOption === null ? 'not-allowed' : 'pointer' 
                }}
              >
                Submit Answer
              </button>
            ) : (
              <button 
                onClick={handleNextQuestion}
                style={{ 
                  padding: '10px 24px', 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}
              >
                {currentQuestionIndex === activeTest.questions.length - 1 ? "Finish Test" : "Next Question"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mybatch-root">
      {/* Batch Creation Modal */}
      {showBatchCreation && (
        <div className="pw-modal-overlay">
          <div className="pw-modal-content" style={{ maxWidth: '500px', padding: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#1f2937' }}>Create New Test Series</h2>
            <form onSubmit={handleBatchFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Test Series Title (e.g., 'Physics Fundamentals') *" required style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
              <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Subject (e.g., 'Physics') *" required style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
              <input value={newLanguage} onChange={e => setNewLanguage(e.target.value)} placeholder="Language (e.g., 'English') *" required style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
              <input value={newDuration} onChange={e => setNewDuration(e.target.value)} type="number" min="1" placeholder="Duration (hrs, optional)" style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
              <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Brief Description (e.g., 'Comprehensive tests covering core physics concepts.')" rows={3} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}></textarea>
              <textarea value={newSyllabusText} onChange={e => setNewSyllabusText(e.target.value)} placeholder="Enter detailed syllabus topics (e.g., 'Newtonian Mechanics, Thermodynamics, Electromagnetism, Quantum Physics')" rows={4} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}></textarea>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowBatchCreation(false)} disabled={loading} style={{ flex: 1, padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', background: '#174C7C', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>{loading ? "Generating..." : "Generate Test Series"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mybatch-header">
        <div>
          <h1 className="mybatch-title">My Learning Tests</h1>
          <p className="mybatch-subtitle">Create and manage your AI-powered test series</p>
        </div>
        <button onClick={() => setShowBatchCreation(true)} style={{ backgroundColor: '#174C7C', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} /> Create Test Series
        </button>
      </div>

      {/* Test Series List */}
      {!selectedTestSeries && !activeTest && (
        <>
          {allTestSeries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <FileText size={64} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>No Test Series Yet</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Create your first AI-powered test series to get started!</p>
            </div>
          ) : (
            <>
              <h2 className="section-heading">Available Test Series</h2>
              <div className="test-series-grid">
                {allTestSeries.map((series) => (
                  <div key={series._id} className="test-series-card" onClick={() => handleSelectTestSeries(series)}>
                    <div className="card-icon">
                      <Zap size={28} color="#0070f3" />
                    </div>
                    <h3 className="card-title">{series.Testname}</h3>
                    <p className="card-description">{series.description}</p>
                    <div className="card-meta">
                      <span>Subject: {series.subject || "N/A"}</span>
                      <span>Tests: {series.tests ? series.tests.length : 0}</span>
                    </div>
                    <button className="card-button">Select Test Series &rarr;</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Test Selection */}
      {selectedTestSeries && !activeTest && (
        <div className="test-selection-interface">
          <button className="back-button" onClick={() => setSelectedTestSeries(null)}>
            &larr; Back to All Test Series
          </button>
          
          <div className="test-series-header">
            <h2 className="test-series-title">{selectedTestSeries.Testname}</h2>
            <p className="test-series-description">{selectedTestSeries.description}</p>
            <div className="test-series-meta">
              <span><strong>Subject:</strong> {selectedTestSeries.subject || 'N/A'}</span>
              <span><strong>Tests:</strong> {selectedTestSeries.tests?.length || 0}</span>
            </div>
          </div>

          <h3 className="choose-test-heading">Choose a Test to Start</h3>
          <div className="test-list">
            {selectedTestSeries.tests && selectedTestSeries.tests.map((test, idx) => (
              <div key={idx} className="test-item" onClick={() => handleStartTest(idx)}>
                <div className="test-item-content">
                  <h4 className="test-item-title">{test.title}</h4>
                  <span className="test-item-questions">({test.questions.length} Questions)</span>
                </div>
                <button className="test-start-btn">Start Test →</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Test Interface */}
      {activeTest && renderTestInterface()}
    </div>
  );
};

export default Test;
