import React, { useState } from 'react';
import './BatchCreation.css';

const BatchCreation = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [language, setLanguage] = useState('English');
  const [chapters, setChapters] = useState([{ id: 1, title: '', duration: '' }]);

  // एक नया chapter जोड़ने का फंक्शन
  const addChapter = () => {
    setChapters([...chapters, { id: chapters.length + 1, title: '', duration: '' }]);
  };

  // किसी chapter का field अपडेट करना
  const updateChapter = (index, field, value) => {
    const newChapters = [...chapters];
    newChapters[index][field] = value;
    setChapters(newChapters);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !subject) {
      alert('Please fill in all required fields.');
      return;
    }

    const newBatch = {
      id: Date.now(),
      title,
      subject,
      description,
      syllabus,
      language,
      chapters,
      progress: 0,
      completedChapters: 0,
      totalChapters: chapters.length,
      type: 'custom',
      enrolledStudents: 1,
      difficulty: 'Custom',
      estimatedTime: chapters.reduce((sum, c) => sum + (parseInt(c.duration) || 0), 0) + ' hours',
      image: '',
    };

    onCreate(newBatch);
    onClose();
  };

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal-content" style={modalStyle}>
        <h2 style={{ marginBottom: 20, fontSize: 20 }}>Create New Batch</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
          </div>
          
          <div>
            <label style={labelStyle}>Subject *</label>
            <input required value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle} />
          </div>
          
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} style={textareaStyle} rows={4} placeholder="Brief description of the batch" />
          </div>
          
          <div>
            <label style={labelStyle}>Syllabus</label>
            <textarea value={syllabus} onChange={e => setSyllabus(e.target.value)} style={textareaStyle} rows={5} placeholder="Detailed syllabus and topics covered" />
          </div>
          
          <div>
            <label style={labelStyle}>Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} style={inputStyle}>
              <option>English</option>
              <option>Hindi</option>
              <option>Spanish</option>
            </select>
          </div>
          
          <div style={{ marginTop: 8 }}>
            <label style={labelStyle}>Chapters</label>
            {chapters.map((chapter, i) => (
              <div key={chapter.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input 
                  placeholder="Chapter Title"
                  value={chapter.title}
                  onChange={e => updateChapter(i, 'title', e.target.value)}
                  required
                  style={{ ...inputStyle, flex: 1 }}
                />
                <input 
                  placeholder="Hours"
                  value={chapter.duration}
                  onChange={e => updateChapter(i, 'duration', e.target.value)}
                  style={{ ...inputStyle, width: 80 }}
                  required
                  type="number"
                  min="1"
                />
              </div>
            ))}
            <button type="button" onClick={addChapter} style={addBtnStyle}>+ Add Chapter</button>
          </div>
          
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button type="submit" style={submitBtnStyle}>Create Batch</button>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed', top: 0, left:0, right:0, bottom:0,
  backgroundColor: 'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex: 1000
};

const modalStyle = {
  backgroundColor: 'white', padding: 24, borderRadius: 12, width: '90%', maxWidth: 480,
  maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
};

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151'
};

const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none'
};

const textareaStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit'
};

const addBtnStyle = {
  padding: '6px 12px', fontSize: 13, border: '1px dashed #356AC3', background: 'transparent', color: '#356AC3', borderRadius: 6, cursor: 'pointer'
};

const submitBtnStyle = {
  flex: 1, padding: '10px', background: '#356AC3', color: 'white', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer'
};

const cancelBtnStyle = {
  flex: 1, padding: '10px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer'
};

export default BatchCreation;