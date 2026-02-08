import React, { useState, useEffect } from "react";
import { FileText, Download, Trash2 } from "lucide-react";

function SaveYourResource() {
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [pdfData, setPdfData] = useState(null);
  const [activeTab, setActiveTab] = useState("pdfs");
  const [savedResources, setSavedResources] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:1000'}/api/resources/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSavedResources(data.resources);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === "application/pdf" || file.type.startsWith('image/'))) {
      const reader = new FileReader();
      reader.onload = (e) => setPdfData(e.target.result);
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid PDF or image file.");
      setPdfData(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!heading || !description || !pdfData) {
      alert("Please fill heading, description and select a PDF.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:1000'}/api/resources/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ heading, description, pdfData })
      });

      const data = await response.json();
      if (data.success) {
        alert("Resource saved!");
        setHeading("");
        setDescription("");
        setPdfData(null);
        fetchResources();
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Failed to save resource');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:1000'}/api/resources/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        fetchResources();
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const renderPDFs = () => {
    if (!savedResources.length) return <p style={{ textAlign: 'center', color: '#666' }}>No saved PDFs.</p>;
    return savedResources.map((res) => (
      <div key={res._id} style={{ backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', padding: '15px', marginBottom: '12px', borderRadius: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#174C7C', fontSize: '1.1em' }}>{res.heading}</h3>
            <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.9em' }}>{res.description}</p>
            <small style={{ color: '#999' }}>Saved on: {new Date(res.createdAt).toLocaleString()}</small>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href={res.pdfData} download={`${res.heading}.pdf`} style={{ backgroundColor: '#174C7C', color: 'white', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Download size={14} /> Download
            </a>
            <button onClick={() => handleDelete(res._id)} style={{ backgroundColor: '#dc3545', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>
    ));
  };

  const renderNotes = () => <p style={{ textAlign: 'center', color: '#666' }}>Notes feature coming soon.</p>;
  const renderImages = () => <p style={{ textAlign: 'center', color: '#666' }}>Images feature coming soon.</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', marginLeft: '280px', padding: '20px' }}>
      <h1 style={{ fontSize: '2em', color: '#174C7C', marginBottom: '10px', fontWeight: '700' }}>Save Your Resources</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Upload and manage your PDF resources</p>

      <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
              Heading
            </label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.95em' }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.95em' }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
              Upload PDF or Image
            </label>
            <input type="file" accept="application/pdf,image/*" onChange={handleFileChange} required style={{ fontSize: '0.9em' }} />
          </div>

          <button type="submit" disabled={loading} style={{ backgroundColor: '#174C7C', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.95em', fontWeight: '600' }}>
            {loading ? 'Saving...' : 'Save Resource'}
          </button>
        </form>
      </div>

      <div>
        <div style={{ display: 'flex', marginBottom: '15px', gap: '5px' }}>
          <div
            onClick={() => setActiveTab("pdfs")}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: activeTab === "pdfs" ? "#174C7C" : "#f8f9fa",
              color: activeTab === "pdfs" ? "white" : "#666",
              textAlign: 'center',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9em'
            }}
          >
            PDFs
          </div>
          <div
            onClick={() => setActiveTab("notes")}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: activeTab === "notes" ? "#174C7C" : "#f8f9fa",
              color: activeTab === "notes" ? "white" : "#666",
              textAlign: 'center',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9em'
            }}
          >
            Notes
          </div>
          <div
            onClick={() => setActiveTab("images")}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: activeTab === "images" ? "#174C7C" : "#f8f9fa",
              color: activeTab === "images" ? "white" : "#666",
              textAlign: 'center',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9em'
            }}
          >
            Images
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '8px', minHeight: '200px' }}>
          {activeTab === "pdfs" && renderPDFs()}
          {activeTab === "notes" && renderNotes()}
          {activeTab === "images" && renderImages()}
        </div>
      </div>
    </div>
  );
}

export default SaveYourResource;
