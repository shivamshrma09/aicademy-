import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import "./MyBatch.css";

const defaultSyllabus = [
  {
    title: "Week 1: React Foundations",
    topics: [
      { title: "Day 1-2: React Foundations & Setup", explanation: "Intro to React, project setup, JSX, components." },
      { title: "Day 3-4: JSX & Components", explanation: "Creating function components, props, and composition." },
    ],
  },
  {
    title: "Week 2: State & Props",
    topics: [
      { title: "State Management", explanation: "useState, lifting state, controlled components." },
      { title: "Props", explanation: "Passing data and callbacks between components." },
    ],
  },
];

const SyllabusList = ({ chapters = defaultSyllabus, compact = false, onTopicClick, onChapterClick }) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className={compact ? "sidebar-syllabus compact" : "syllabus-list"}>
      {chapters.map((chapter, index) => (
        <div
          key={index}
          className={compact ? "pw-chapter-item" : "pw-chapter-item"}
          style={{ marginBottom: compact ? 8 : 12 }}
        >
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div 
              style={{ flex: 1 }}
              onClick={() => onChapterClick && onChapterClick(chapter, index)}
            >
              <div style={{ fontWeight: 600, fontSize: compact ? '13px' : '15px' }}>{chapter.title}</div>
              {compact && <div style={{ fontSize: '12px', color: '#6b7280' }}>{(chapter.topics || []).length} topics</div>}
            </div>
            <div onClick={(e) => { e.stopPropagation(); setOpenIndex(openIndex === index ? null : index); }}>
              {openIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>

          {openIndex === index && chapter.topics && (
            <div style={{ marginTop: 10 }}>
              {chapter.topics.map((topic, ti) => (
                <div 
                  key={ti} 
                  style={{ padding: '8px', borderRadius: 6, marginBottom: 8, cursor: 'pointer' }}
                  onClick={() => onTopicClick && onTopicClick(chapter, topic)}
                >
                  <div style={{ fontWeight: 500, fontSize: '13px' }}>{topic.title}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{topic.explanation}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SyllabusList;
export { defaultSyllabus };
