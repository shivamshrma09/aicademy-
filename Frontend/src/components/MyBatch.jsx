import React, { useState, useEffect } from "react";
import {
  BookOpen, Search, Zap, Users, ArrowLeft, Award, Star,
  ChevronDown, ChevronUp, FileText, CheckCircle, Edit3, Lock,
  Download, Calendar, Clock, Sparkles, GraduationCap, Trophy,
  Book, Youtube, ExternalLink, AlertTriangle, BarChart2, PieChart,
  Image, Code, CircuitBoard, FlaskConical, Lightbulb, Layers,
  FileDown, BookMarked, HelpCircle, MessageSquare
} from "lucide-react";
import "./MyBatch.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import SyllabusList from "./SyllabusList";
import BatchCard from "./BatchCard";
import MarkdownRenderer from "./MarkdownRenderer";

// API key from environment variable
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY ;
const API_URL = import.meta.env.VITE_API_URL;

const getGeminiModel = (modelName = "gemini-2.5-flash") => {
  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  return genAI.getGenerativeModel({ model: modelName });
};

// Generate flashcards directly in component
const generateFlashcards = async (subject, topic, count = 5) => {
  try {
    const model = getGeminiModel();
    const prompt = `You are an expert educator. Generate ${count} comprehensive educational flashcards for Subject: "${subject}", Topic: "${topic}".
    
    For EACH flashcard, provide in this exact format:
    TITLE: [Clear, concise title]
    FRONT: [Question/concept - 1-2 sentences]
    BACK: [Detailed answer with key points, definitions, and examples]
    KEY_POINTS: [3-4 important bullet points]
    REAL_WORLD_EXAMPLE: [Practical real-world application or example]
    IMAGE_SUGGESTION: [Specific image/diagram recommendation that would help understand this concept]
    DIFFICULTY: [Beginner/Intermediate/Advanced]
    ---
    
    Make flashcards progressive (easier to harder). Use clear, academic language. Include mnemonics or memory aids where helpful.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();
    
    // Parse the generated flashcards with enhanced structure
    return generatedText.split('---').map(card => {
      const titleMatch = card.match(/TITLE:\s*(.+)/i);
      const frontMatch = card.match(/FRONT:\s*([\s\S]+?)(?=BACK:|$)/i);
      const backMatch = card.match(/BACK:\s*([\s\S]+?)(?=KEY_POINTS:|$)/i);
      const keyPointsMatch = card.match(/KEY_POINTS:\s*([\s\S]+?)(?=REAL_WORLD_EXAMPLE:|$)/i);
      const exampleMatch = card.match(/REAL_WORLD_EXAMPLE:\s*([\s\S]+?)(?=IMAGE_SUGGESTION:|$)/i);
      const imageMatch = card.match(/IMAGE_SUGGESTION:\s*(.+)/i);
      const difficultyMatch = card.match(/DIFFICULTY:\s*(.+)/i);
      
      return {
        id: Math.random().toString(36).substring(2, 9),
        title: titleMatch ? titleMatch[1].trim() : 'Generated Flashcard',
        front: frontMatch ? frontMatch[1].trim() : '',
        content: backMatch ? backMatch[1].trim() : card.trim(),
        keyPoints: keyPointsMatch ? keyPointsMatch[1].trim().split('\n').filter(p => p.trim()) : [],
        example: exampleMatch ? exampleMatch[1].trim() : '',
        imageSuggestion: imageMatch ? imageMatch[1].trim() : '',
        difficulty: difficultyMatch ? difficultyMatch[1].trim() : 'Intermediate',
        subject,
        topic,
        likes: 0,
        generated: true
      };
    }).filter(card => card.title && (card.content || card.front));
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return [];
  }
};

// Generate test questions directly in component
const generateTestQuestions = async (subject, topic, count = 5) => {
  try {
    const model = getGeminiModel();
    const prompt = `You are an expert exam creator. Generate ${count} high-quality multiple-choice assessment questions for Subject: "${subject}", Topic: "${topic}".
    
    For EACH question, provide in this exact format:
    QUESTION: [Clear, unambiguous question - can be single-select or scenario-based]
    DIFFICULTY: [Beginner/Intermediate/Advanced]
    OPTIONS: [Option A], [Option B], [Option C], [Option D]
    CORRECT: [Letter: A/B/C/D]
    EXPLANATION: [Detailed explanation of why the correct answer is right, and why others are wrong]
    KEY_CONCEPT: [The core concept this question tests]
    HINTS: [Study tip or hint to remember this concept]
    REAL_SCENARIO: [Real-world scenario where this knowledge applies]
    ---
    
    Ensure questions test understanding, not just memorization. Vary difficulty levels. Avoid grammatically suggesting the answer.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();
    
    // Parse the generated questions with comprehensive details
    return generatedText.split('---').map(item => {
      const questionMatch = item.match(/QUESTION:\s*([\s\S]+?)(?=DIFFICULTY:|$)/i);
      const difficultyMatch = item.match(/DIFFICULTY:\s*(.+)/i);
      const optionsMatch = item.match(/OPTIONS:\s*([\s\S]+?)(?=CORRECT:|$)/i);
      const correctMatch = item.match(/CORRECT:\s*([A-D])/i);
      const explanationMatch = item.match(/EXPLANATION:\s*([\s\S]+?)(?=KEY_CONCEPT:|$)/i);
      const conceptMatch = item.match(/KEY_CONCEPT:\s*(.+)/i);
      const hintsMatch = item.match(/HINTS:\s*(.+)/i);
      const scenarioMatch = item.match(/REAL_SCENARIO:\s*([\s\S]+?)(?=---|$)/i);
      
      if (!questionMatch || !optionsMatch || !correctMatch) return null;
      
      const optionsArray = optionsMatch[1].split(',').map(opt => opt.trim());
      const correctIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }[correctMatch[1]] || 0;
      
      return {
        id: Math.random().toString(36).substring(2, 9),
        question: questionMatch[1].trim(),
        options: optionsArray.length >= 4 ? optionsArray.slice(0, 4) : ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: correctIndex,
        explanation: explanationMatch ? explanationMatch[1].trim() : 'No explanation provided',
        difficulty: difficultyMatch ? difficultyMatch[1].trim() : 'Intermediate',
        keyConcept: conceptMatch ? conceptMatch[1].trim() : '',
        hints: hintsMatch ? hintsMatch[1].trim() : '',
        realScenario: scenarioMatch ? scenarioMatch[1].trim() : '',
        subject,
        topic
      };
    }).filter(q => q !== null);
  } catch (error) {
    console.error('Error generating test questions:', error);
    return [];
  }
};

// Generate learning resources directly in component
const generateResources = async (subject, topic) => {
  try {
    const model = getGeminiModel();
    const prompt = `You are a learning resource curator. Generate 5 diverse, valuable learning resources for Subject: "${subject}", Topic: "${topic}".
    
    For EACH resource, provide in this exact format:
    TITLE: [Clear, descriptive title]
    TYPE: [Article/Video/Interactive Tool/Course/Documentation]
    PLATFORM: [YouTube/MDN/Coursera/Official Docs/Medium/Dev.to/GitHub/etc]
    DESCRIPTION: [2-3 sentences explaining what this resource covers and why it's valuable]
    DIFFICULTY: [Beginner/Intermediate/Advanced/All Levels]
    DURATION: [Estimated learning time - e.g., '15 minutes', '2 hours']
    KEY_TOPICS_COVERED: [Main topics this resource explains]
    WHY_THIS_RESOURCE: [Why this is a must-have resource for learning this topic]
    OFFICIAL_URL_FORMAT: [Suggest type of resource: Official docs, Blog post, Video tutorial, etc.]
    PRICE: [Free/Paid]
    RATING: [★★★★★ - 5/5 stars based on community value]
    ---
    
    Recommend well-known, reputable, and high-quality resources. Mix beginner-friendly with advanced resources.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();
    
    // Parse the generated resources with comprehensive metadata
    return generatedText.split('---').map(item => {
      const titleMatch = item.match(/TITLE:\s*(.+)/i);
      const typeMatch = item.match(/TYPE:\s*(.+)/i);
      const platformMatch = item.match(/PLATFORM:\s*(.+)/i);
      const descriptionMatch = item.match(/DESCRIPTION:\s*([\s\S]+?)(?=DIFFICULTY:|$)/i);
      const difficultyMatch = item.match(/DIFFICULTY:\s*(.+)/i);
      const durationMatch = item.match(/DURATION:\s*(.+)/i);
      const topicsMatch = item.match(/KEY_TOPICS_COVERED:\s*(.+)/i);
      const whyMatch = item.match(/WHY_THIS_RESOURCE:\s*([\s\S]+?)(?=OFFICIAL_URL_FORMAT:|$)/i);
      const urlFormatMatch = item.match(/OFFICIAL_URL_FORMAT:\s*(.+)/i);
      const priceMatch = item.match(/PRICE:\s*(.+)/i);
      const ratingMatch = item.match(/RATING:\s*(.+)/i);
      
      if (!titleMatch) return null;
      
      return {
        id: Math.random().toString(36).substring(2, 9),
        title: titleMatch[1].trim(),
        type: typeMatch ? typeMatch[1].trim().toLowerCase() : 'article',
        platform: platformMatch ? platformMatch[1].trim() : 'Online',
        description: descriptionMatch ? descriptionMatch[1].trim() : 'No description provided',
        difficulty: difficultyMatch ? difficultyMatch[1].trim() : 'All Levels',
        duration: durationMatch ? durationMatch[1].trim() : 'Variable',
        keyTopics: topicsMatch ? topicsMatch[1].trim().split(',').map(t => t.trim()) : [],
        whyMatters: whyMatch ? whyMatch[1].trim() : '',
        urlFormat: urlFormatMatch ? urlFormatMatch[1].trim() : '',
        price: priceMatch ? priceMatch[1].trim() : 'Free',
        rating: ratingMatch ? ratingMatch[1].trim() : '★★★★☆',
        url: '#',
        subject,
        topic
      };
    }).filter(r => r !== null);
  } catch (error) {
    console.error('Error generating resources:', error);
    return [];
  }
};

const MyBatch = ({ initialTab = 'my-batches', currentUser = {} }) => {
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState(initialTab);

  const [showBatchCreation, setShowBatchCreation] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState("description");
  const [openChapterIndex, setOpenChapterIndex] = useState(null);
  
  // New state variables for enhanced features
  const [showTestModal, setShowTestModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showTestResultsModal, setShowTestResultsModal] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [notes, setNotes] = useState({});
  const [currentNote, setCurrentNote] = useState("");
  const [testQuestions, setTestQuestions] = useState([]);
  const [testLoading, setTestLoading] = useState(false);
  const [testAnswers, setTestAnswers] = useState({});
  const [testResults, setTestResults] = useState(null);
  const [assignmentPrompt, setAssignmentPrompt] = useState("");
  const [resources, setResources] = useState({});
  const [adaptiveChapter, setAdaptiveChapter] = useState(null);
  const [flashcards, setFlashcards] = useState({});
  const [detailedTopics, setDetailedTopics] = useState({});
  const [activeDetailTab, setActiveDetailTab] = useState("content");
  const [importantQuestions, setImportantQuestions] = useState({});
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedChapterForVideo, setSelectedChapterForVideo] = useState(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(null);
  const [showDoubtModal, setShowDoubtModal] = useState(false);
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtMessages, setDoubtMessages] = useState([]);
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = React.useRef(null);
  
  // New enhanced features
  const [studyStreak, setStudyStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [studyTime, setStudyTime] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [studyGroup, setStudyGroup] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [studyReminders, setStudyReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("Beginner");
  const [newLanguage, setNewLanguage] = useState("English");
  const [newDuration, setNewDuration] = useState("");
  const [newInstructor, setNewInstructor] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [syllabusInputType, setSyllabusInputType] = useState("text");
  const [newSyllabusText, setNewSyllabusText] = useState("");

  // Load flashcards from local storage
  const loadFlashcardsFromStorage = (batchId) => {
    try {
      const storedFlashcards = localStorage.getItem(`flashcards_${batchId}`);
      if (storedFlashcards) {
        setFlashcards(JSON.parse(storedFlashcards));
      }
    } catch (error) {
      console.error('Error loading flashcards from storage:', error);
    }
  };

  // Save flashcards to local storage
  const saveFlashcardsToStorage = (batchId, flashcardsData) => {
    try {
      localStorage.setItem(`flashcards_${batchId}`, JSON.stringify(flashcardsData));
    } catch (error) {
      console.error('Error saving flashcards to storage:', error);
    }
  };

  // Handler for opening flashcards modal with generated content
  const handleOpenFlashcards = async (chapter, topic) => {
    setCurrentChapter(chapter);
    setShowFlashcardsModal(true);
    
    // Check if we already have flashcards for this chapter
    const key = `${chapter.title}-${topic?.title || 'general'}`;
    if (!flashcards[key]) {
      setLoadingFlashcards(true);
      try {
        // Generate flashcards directly in component
        const generatedFlashcards = await generateFlashcards(
          selectedBatch?.subject || 'General',
          topic?.title || chapter.title,
          5
        );
        
        const updatedFlashcards = {
          ...flashcards,
          [key]: generatedFlashcards
        };
        
        setFlashcards(updatedFlashcards);
        
        // Save to local storage
        if (selectedBatch) {
          saveFlashcardsToStorage(selectedBatch.id, updatedFlashcards);
        }
      } catch (error) {
        console.error('Error generating flashcards:', error);
      } finally {
        setLoadingFlashcards(false);
      }
    }
  };

  // Handler for opening test modal with generated questions
  const handleOpenTest = async (chapter) => {
    setCurrentChapter(chapter);
    setShowTestModal(true);
    setTestLoading(true);
    setTestAnswers({});
    setTestResults(null);
    
    try {
      // Generate test questions directly in component
      const questions = await generateTestQuestions(
        selectedBatch?.subject || 'General',
        chapter.title,
        5
      );
      
      setTestQuestions(questions);
    } catch (error) {
      console.error('Error generating test questions:', error);
      setTestQuestions([]);
    } finally {
      setTestLoading(false);
    }
  };

  // Load resources from local storage
  const loadResourcesFromStorage = (batchId) => {
    try {
      const storedResources = localStorage.getItem(`resources_${batchId}`);
      if (storedResources) {
        setResources(JSON.parse(storedResources));
      }
    } catch (error) {
      console.error('Error loading resources from storage:', error);
    }
  };

  // Save resources to local storage
  const saveResourcesToStorage = (batchId, resourcesData) => {
    try {
      localStorage.setItem(`resources_${batchId}`, JSON.stringify(resourcesData));
    } catch (error) {
      console.error('Error saving resources to storage:', error);
    }
  };









  // Handler for opening resources modal with generated content
  const handleOpenResources = async (chapter, topic) => {
    setCurrentChapter(chapter);
    setShowResourcesModal(true);
    
    // Check if we already have resources for this chapter
    const key = `${chapter.title}-${topic?.title || 'general'}`;
    if (!resources[key]) {
      setLoadingResources(true);
      try {
        // Generate resources directly in component
        const generatedResources = await generateResources(
          selectedBatch?.subject || 'General',
          topic?.title || chapter.title
        );
        
        const updatedResources = {
          ...resources,
          [key]: generatedResources
        };
        
        setResources(updatedResources);
        
        // Save to local storage
        if (selectedBatch) {
          saveResourcesToStorage(selectedBatch.id, updatedResources);
        }
      } catch (error) {
        console.error('Error generating resources:', error);
      } finally {
        setLoadingResources(false);
      }
    }
  };

  // Handler for submitting test answers
  const handleSubmitTest = () => {
    // Calculate results
    let correctCount = 0;
    const questionResults = {};
    
    testQuestions.forEach(question => {
      const userAnswer = testAnswers[question.id];
      const isCorrect = userAnswer === question.correct;
      if (isCorrect) correctCount++;
      
      questionResults[question.id] = {
        userAnswer,
        isCorrect,
        correctAnswer: question.correct,
        explanation: question.explanation
      };
    });
    
    const score = Math.round((correctCount / testQuestions.length) * 100);
    
    setTestResults({
      score,
      correctCount,
      totalQuestions: testQuestions.length,
      questionResults,
      strengths: score > 70 ? ['Good understanding of concepts', 'Quick response time'] : ['Effort to attempt all questions'],
      weaknesses: score < 70 ? ['Need to review core concepts', 'Practice more examples'] : ['Minor details need attention'],
      recommendations: [
        'Review the explanations for incorrect answers',
        'Practice with more examples',
        'Focus on understanding the concepts rather than memorizing'
      ]
    });
  };

  // Function to load progress from database
  const loadProgressFromDatabase = async (batchId) => {
    try {
      const response = await fetch(`/api/progress/${batchId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
    return null;
  };

  // Function to load batch content from local storage
  const loadBatchContentFromStorage = (batchId) => {
    try {
      const storedData = localStorage.getItem(`batch_${batchId}`);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error('Error loading batch content from storage:', error);
    }
    return null;
  };

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const res = await fetch(`${API_URL}/api/batches`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setBatches(data.batches || []);
        }
      } catch (err) {
        console.error('Error fetching batches:', err);
      }
    };
    fetchBatches();
  }, []);

  const resetForm = () => {
    setNewTitle("");
    setNewSubject("");
    setNewDifficulty("Beginner");
    setNewLanguage("English");
    setNewDuration("");
    setNewInstructor("");
    setNewImage("");
    setNewDescription("");
    setSyllabusInputType("text");
    setNewSyllabusText("");
  };

  const handleBatchFormSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    
    try {
      const model = getGeminiModel();
      const prompt = `Create educational content for ${newSubject} (${newDifficulty} level).

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no extra text.

Format:
{
  "batchName": "Course Title",
  "description": "Brief overview",
  "chapters": [
    {
      "title": "Chapter Name",
      "topics": [
        {
          "title": "Topic Name",
          "explanation": "Use proper markdown formatting with headings, code blocks, lists, and emphasis. Include practical examples and explanations.",
          "imageUrl": "Description",
          "videoSearchTerm": "Search term"
        }
      ]
    }
  ]
}

Rules:
- Use double quotes for all strings
- Use \\n for newlines in explanation
- Use triple backticks for code blocks in markdown
- Keep explanation detailed with proper markdown
- Maximum 3 chapters, 2 topics each
- Include code examples in markdown format
- Return valid JSON only`;
      
      const result = await model.generateContent(prompt);
      let rawText = await result.response.text();
      
      // Clean the response - remove markdown code blocks if present
      rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const jsonStart = rawText.indexOf("{");
      const jsonEnd = rawText.lastIndexOf("}") + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No valid JSON found in response');
      }
      
      let jsonText = rawText.slice(jsonStart, jsonEnd);
      
      // Clean up common JSON issues
      jsonText = jsonText
        .replace(/\n/g, ' ')  // Remove newlines
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .replace(/,\s*}/g, '}')  // Remove trailing commas
        .replace(/,\s*]/g, ']');  // Remove trailing commas in arrays
      
      let generatedPlan;
      try {
        generatedPlan = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Problematic JSON:', jsonText.substring(0, 500));
        throw new Error('Failed to parse AI response as JSON');
      }
      
      // Ensure basic structure
      if (!generatedPlan.chapters || !Array.isArray(generatedPlan.chapters)) {
        generatedPlan.chapters = [];
      }
      
      // Fix importantLinks and ensure all required fields
      generatedPlan.chapters = generatedPlan.chapters.map(chapter => {
        if (!chapter.topics || !Array.isArray(chapter.topics)) {
          chapter.topics = [];
        }
        
        chapter.topics = chapter.topics.map(topic => {
          // Ensure importantLinks is an array
          if (!topic.importantLinks) {
            topic.importantLinks = [];
          } else if (typeof topic.importantLinks === 'string') {
            try {
              // Try to parse if it's a JSON string
              const parsed = JSON.parse(topic.importantLinks);
              topic.importantLinks = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              // If parsing fails, set empty array
              console.warn('Failed to parse importantLinks:', topic.importantLinks);
              topic.importantLinks = [];
            }
          } else if (!Array.isArray(topic.importantLinks)) {
            // If it's an object or something else, wrap in array or set empty
            topic.importantLinks = [];
          }
          
          // Validate each link in the array
          if (Array.isArray(topic.importantLinks)) {
            topic.importantLinks = topic.importantLinks.filter(link => 
              link && typeof link === 'object' && link.title && link.url
            );
          }
          
          // Set defaults for missing fields
          topic.explanation = topic.explanation || 'Content coming soon';
          topic.imageUrl = topic.imageUrl || 'Placeholder';
          topic.videoSearchTerm = topic.videoSearchTerm || topic.title;
          
          return topic;
        });
        
        return chapter;
      });
      
      console.log('Processed chapters:', JSON.stringify(generatedPlan.chapters, null, 2));
      
      const batchId = Date.now().toString();
      const chapters = generatedPlan.chapters || [];
      
      const completionStatus = chapters.map(() => ({
        completed: false,
        topics: [],
        testAttempted: false
      }));
      
      // Save full data to backend
      const response = await fetch(`${API_URL}/api/batches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id: batchId,
          title: generatedPlan.batchName || newTitle,
          subject: newSubject,
          difficulty: newDifficulty,
          language: newLanguage,
          estimatedTime: newDuration ? `${newDuration} hours` : '',
          instructor: newInstructor,
          image: newImage || 'https://images.pexels.com/photos/159832/science-formula-physics-school-159832.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
          description: generatedPlan.description,
          totalChapters: chapters.length,
          type: 'custom',
          aiLearningPlan: {
            batchName: generatedPlan.batchName,
            description: generatedPlan.description,
            chapters
          },
          completionStatus
        })
      });
      
      if (!response.ok) throw new Error('Failed to save batch');
      
      const { batch } = await response.json();
      setBatches(prev => [batch, ...prev]);
      
      resetForm();
      setShowBatchCreation(false);
    } catch (err) {
      console.error('Batch creation error:', err);
      alert('Error creating batch: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentBatches = () => {
    if (activeTab === "my-batches") {
      return batches.filter((batch) => {
        const termLower = searchTerm.toLowerCase();
        const matchesSearch =
          (batch.title?.toLowerCase().includes(termLower) || "") ||
          (batch.subject?.toLowerCase().includes(termLower) || "");
        const matchesFilter =
          filterType === "all" ||
          (filterType === "custom" && batch.type === "custom") ||
          (filterType === "active" && batch.progress > 0 && batch.progress < 100) ||
          (filterType === "completed" && batch.progress === 100);
        return matchesSearch && matchesFilter;
      });
    } else {
      return [];
    }
  };

  const handleImageError = (e) => {
    e.target.src = 'https://ik.imagekit.io/qwzhnpeqg/7c3d9081-eca6-4f7c-a313-4c20862c737b.png';
  };
  
  // Handle batch card click to show details
  const handleBatchClick = (batch) => {
    setSelectedBatch(batch);
    setShowBatchDetails(true);
  };
  
  // Generate detailed topic explanations
  const generateDetailedTopicExplanation = async (chapterIndex, topicIndex) => {
    if (!selectedBatch) return;
    
    const chapter = selectedBatch.aiLearningPlan.chapters[chapterIndex];
    const topic = chapter.topics[topicIndex];
    const topicKey = `${selectedBatch.id}-${chapterIndex}-${topicIndex}`;
    
    // Check if we already have detailed explanation
    if (detailedTopics[topicKey]) return;
    
    try {
      const prompt = `
You are a master educator specializing in deep, comprehensive topic explanations. Provide an EXTENSIVE, DETAILED explanation suitable for intermediate learners.

Topic: ${topic.title}
Context: ${chapter.title}
Basic Understanding: ${topic.explanation}

Create a comprehensive learning resource with:
1. CONCEPT OVERVIEW - Definition, principles, historical context, and relevance
2. DETAILED EXPLANATION - Step-by-step breakdown, key principles, formulas/specs
3. VISUAL AIDS - ASCII diagrams, flowcharts, detailed visual descriptions
4. PRACTICAL EXAMPLES - 3-4 real-world examples with detailed explanations
5. CODE EXAMPLES - Working code in popular languages with explanations
6. COMMON MISTAKES - Frequent misunderstandings and how to correct them
7. IMPORTANT RESOURCES - YouTube channels, docs, books, communities, practice platforms
8. PRACTICE EXERCISES - 3-4 progressive difficulty exercises with hints

Return ONLY valid JSON, no markdown or text outside:
{
  "definition": "Precise definition",
  "overview": "Why it matters and history",
  "detailedExplanation": "Comprehensive explanation",
  "theory": "Mathematical/technical theory if applicable",
  "visualAids": [{"type": "Diagram type", "description": "ASCII/text description"}],
  "practicalExamples": [{"title": "Example", "description": "Detailed", "industryUse": "Real world use"}],
  "codeExamples": [{"language": "Language", "code": "Working code", "explanation": "How it works"}],
  "commonMisconceptions": [{"misconception": "What people think", "reality": "What's true", "why": "Why confusion"}],
  "importantLinks": {"youtubeChannels": [], "officialDocs": [], "books": [], "communities": [], "practicePlatforms": []},
  "practiceExercises": [{"difficulty": "Level", "question": "Problem", "hint": "Hint", "approach": "Solution"}],
  "keyTakeaways": ["Point 1", "Point 2", "Point 3"]
}
`;

      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const rawText = result.response?.text ? await result.response.text() : '';
      
      if (!rawText.trim()) throw new Error("Failed to generate detailed explanation");
      
      try {
        const jsonStart = rawText.indexOf("{");
        const jsonEnd = rawText.lastIndexOf("}") + 1;
        const jsonText = rawText.slice(jsonStart, jsonEnd);
        const detailedExplanation = JSON.parse(jsonText);
        
        setDetailedTopics(prev => ({
          ...prev,
          [topicKey]: detailedExplanation
        }));
      } catch (err) {
        console.error("Error parsing detailed explanation:", err);
      }
    } catch (err) {
      console.error("Error generating detailed explanation:", err);
    }
  };
  
  // Generate flashcards for a chapter
  const generateFlashcards = async (chapterIndex) => {
    if (!selectedBatch) return;
    
    const chapter = selectedBatch.aiLearningPlan.chapters[chapterIndex];
    const flashcardKey = `${selectedBatch.id}-${chapterIndex}`;
    
    // Check if we already have flashcards
    if (flashcards[flashcardKey]) return;
    
    try {
      const prompt = `
Create a set of 10 flashcards for studying the following chapter:
Chapter Title: ${chapter.title}
Topics: ${chapter.topics.map(t => t.title).join(", ")}
Content: ${chapter.topics.map(t => t.explanation).join(" ")}

Each flashcard should have a question on one side and the answer on the other side.
Make sure the flashcards cover key concepts, definitions, and applications from the chapter.

Return the flashcards in JSON format like this:
[
  {
    "question": "Question text here?",
    "answer": "Answer text here",
    "topic": "The specific topic this relates to"
  }
]
Only return valid JSON, no other text.
`;

      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const rawText = result.response?.text ? await result.response.text() : '';
      
      if (!rawText.trim()) throw new Error("Failed to generate flashcards");
      
      try {
        const jsonStart = rawText.indexOf("[");
        const jsonEnd = rawText.lastIndexOf("]") + 1;
        const jsonText = rawText.slice(jsonStart, jsonEnd);
        const flashcardsData = JSON.parse(jsonText);
        
        setFlashcards(prev => ({
          ...prev,
          [flashcardKey]: flashcardsData
        }));
      } catch (err) {
        console.error("Error parsing flashcards:", err);
      }
    } catch (err) {
      console.error("Error generating flashcards:", err);
    }
  };
  
  // Generate important questions for a chapter
  const generateImportantQuestions = async (chapterIndex) => {
    if (!selectedBatch) return;
    
    const chapter = selectedBatch.aiLearningPlan.chapters[chapterIndex];
    const questionsKey = `${selectedBatch.id}-${chapterIndex}`;
    
    // Check if we already have important questions
    if (importantQuestions[questionsKey]) return;
    
    try {
      const prompt = `
Create a set of 5 important questions with detailed answers for the following chapter:
Chapter Title: ${chapter.title}
Topics: ${chapter.topics.map(t => t.title).join(", ")}
Content: ${chapter.topics.map(t => t.explanation).join(" ")}

These should be conceptual questions that test deep understanding, not simple recall.
Include detailed explanations in the answers.

Return the questions in JSON format like this:
[
  {
    "question": "Question text here?",
    "answer": "Detailed answer with explanation",
    "topic": "The specific topic this relates to",
    "difficulty": "easy|medium|hard"
  }
]
Only return valid JSON, no other text.
`;

      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const rawText = result.response?.text ? await result.response.text() : '';
      
      if (!rawText.trim()) throw new Error("Failed to generate important questions");
      
      try {
        const jsonStart = rawText.indexOf("[");
        const jsonEnd = rawText.lastIndexOf("]") + 1;
        const jsonText = rawText.slice(jsonStart, jsonEnd);
        const questionsData = JSON.parse(jsonText);
        
        setImportantQuestions(prev => ({
          ...prev,
          [questionsKey]: questionsData
        }));
      } catch (err) {
        console.error("Error parsing important questions:", err);
      }
    } catch (err) {
      console.error("Error generating important questions:", err);
    }
  };
  
  // Generate resources for a chapter without requiring test completion
  const generateChapterResources = async (chapterIndex) => {
    if (!selectedBatch) return;
    
    const chapter = selectedBatch.aiLearningPlan.chapters[chapterIndex];
    const resourceKey = `${selectedBatch.id}-${chapterIndex}`;
    
    // Check if we already have resources
    if (resources[resourceKey]) return;
    
    try {
      const prompt = `
Provide learning resources for a student studying "${chapter.title}":
Topics: ${chapter.topics.map(t => t.title).join(", ")}

Return the resources in JSON format like this:
{
  "books": [
    { "title": "Book Title", "author": "Author Name", "description": "Brief description", "link": "amazon.com/book-url" }
  ],
  "videos": [
    { "title": "Video Title", "platform": "YouTube/Coursera/etc", "description": "Brief description", "link": "youtube.com/video-url" }
  ],
  "websites": [
    { "title": "Website Title", "url": "example.com", "description": "Brief description" }
  ],
  "articles": [
    { "title": "Article Title", "source": "Source Name", "description": "Brief description", "link": "website.com/article-url" }
  ]
}
Only return valid JSON, no other text.
`;

      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const rawText = result.response?.text ? await result.response.text() : '';
      
      if (!rawText.trim()) throw new Error("Failed to generate resources");
      
      try {
        const jsonStart = rawText.indexOf("{");
        const jsonEnd = rawText.lastIndexOf("}") + 1;
        const jsonText = rawText.slice(jsonStart, jsonEnd);
        const resourcesData = JSON.parse(jsonText);
        
        setResources(prev => ({
          ...prev,
          [resourceKey]: resourcesData
        }));
      } catch (err) {
        console.error("Error parsing resources:", err);
      }
    } catch (err) {
      console.error("Error generating resources:", err);
    }
  };
  
  // Generate test questions using AI
  const generateTestQuestions = async (chapterIndex) => {
    if (!selectedBatch) return;
    
    setTestLoading(true);
    const chapter = selectedBatch.aiLearningPlan.chapters[chapterIndex];
    
    try {
      const prompt = `Create 5 questions (3 MCQ + 2 text-based) for testing knowledge on:
Chapter: ${chapter.title}
Topics: ${chapter.topics.map(t => t.title).join(", ")}

Return ONLY valid JSON array:
[
  {
    "type": "mcq",
    "question": "Question text?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "Why this is correct"
  },
  {
    "type": "text",
    "question": "Question text?",
    "correctAnswer": "Expected answer",
    "explanation": "Explanation"
  }
]
No markdown, no extra text.`;

      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const rawText = result.response?.text ? await result.response.text() : '';
      
      if (!rawText.trim()) throw new Error("Failed to generate test");
      
      const jsonStart = rawText.indexOf("[");
      const jsonEnd = rawText.lastIndexOf("]") + 1;
      const jsonText = rawText.slice(jsonStart, jsonEnd);
      const questions = JSON.parse(jsonText);
      
      setTestQuestions(questions);
      setTestAnswers({});
    } catch (err) {
      console.error("Error generating test:", err);
      setTestQuestions([
        {
          question: `What is ${chapter.title} about?`,
          options: ["Core concepts", "Advanced topics", "History", "Future"],
          correctAnswer: 0,
          explanation: "Focuses on core concepts"
        }
      ]);
    } finally {
      setTestLoading(false);
    }
  };
  
  // Generate assignment prompt using AI
  const generateAssignmentPrompt = async (chapterIndex) => {
    if (!selectedBatch) return;
    
    const chapter = selectedBatch.aiLearningPlan.chapters[chapterIndex];
    
    try {
      const prompt = `
Create a practical assignment for students who have completed the following chapter:
Chapter Title: ${chapter.title}
Topics: ${chapter.topics.map(t => t.title).join(", ")}
Content: ${chapter.topics.map(t => t.explanation).join(" ")}

The assignment should:
1. Be practical and hands-on
2. Allow students to demonstrate their understanding of the chapter concepts
3. Include clear instructions and deliverables
4. Be challenging but achievable

Provide the assignment in a concise paragraph format.
`;

      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const assignmentText = result.response?.text ? await result.response.text() : '';
      
      if (assignmentText.trim()) {
        setAssignmentPrompt(assignmentText);
      } else {
        // Fallback assignment
        setAssignmentPrompt(`Create a project that demonstrates your understanding of ${chapter.title}. Include all key concepts covered in the chapter and submit your work with a brief explanation of how you applied these concepts.`);
      }
    } catch (err) {
      console.error("Error generating assignment prompt:", err);
      // Fallback assignment
      setAssignmentPrompt(`Create a project that demonstrates your understanding of ${chapter.title}. Include all key concepts covered in the chapter and submit your work with a brief explanation of how you applied these concepts.`);
    }
  };
  
  // Calculate test score based on answers
  const calculateTestScore = () => {
    if (!testQuestions.length) return 0;
    
    let correctCount = 0;
    testQuestions.forEach((q, index) => {
      if (q.type === 'mcq') {
        if (testAnswers[index] === q.correctAnswer) correctCount++;
      } else {
        const userAnswer = (testAnswers[index] || '').toLowerCase().trim();
        const correctAnswer = (q.correctAnswer || '').toLowerCase().trim();
        if (userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer)) {
          correctCount++;
        }
      }
    });
    
    return Math.round((correctCount / testQuestions.length) * 100);
  };
  
  // Function to check if a chapter is unlocked (available for study)
  const isChapterUnlocked = (batch, chapterIndex) => {
    if (chapterIndex === 0) return true; // First chapter is always unlocked
    if (!batch.completionStatus || !batch.completionStatus[chapterIndex - 1]) return true;
    
    // Check if previous chapter has a test
    const prevChapterStatus = batch.completionStatus[chapterIndex - 1];
    const isTestChapter = prevChapterStatus && prevChapterStatus.isTest;
    
    // If previous chapter is a test chapter, check if it's attempted
    if (isTestChapter) {
      return prevChapterStatus && prevChapterStatus.testAttempted;
    }
    
    // For regular chapters, no need to complete them to proceed
    return true;
  };
  


  // Function to mark a topic as completed
  const markTopicCompleted = (chapterIndex, topicIndex) => {
    if (!selectedBatch || !selectedBatch.completionStatus || !selectedBatch.completionStatus[chapterIndex]) return;
    
    const updatedBatches = batches.map(batch => {
      if (batch.id === selectedBatch.id) {
        const updatedCompletionStatus = [...(batch.completionStatus || [])];
        if (!updatedCompletionStatus[chapterIndex]) {
          updatedCompletionStatus[chapterIndex] = { completed: false, topics: [], testAttempted: false };
        }
        if (!updatedCompletionStatus[chapterIndex].topics[topicIndex]) {
          updatedCompletionStatus[chapterIndex].topics[topicIndex] = { completed: false };
        }
        updatedCompletionStatus[chapterIndex].topics[topicIndex].completed = true;
        
        // Check if all topics in the chapter are completed
        const allTopicsCompleted = updatedCompletionStatus[chapterIndex].topics.every(topic => topic && topic.completed);
        
        // Update chapter completion status
        if (allTopicsCompleted) {
          updatedCompletionStatus[chapterIndex].completed = true;
        }
        
        // Calculate overall progress
        const totalTopics = batch.aiLearningPlan?.chapters?.reduce(
          (sum, chapter) => sum + (chapter.topics?.length || 0), 0
        ) || 0;
        const completedTopics = updatedCompletionStatus.reduce(
          (sum, chapter) => sum + (chapter.topics?.filter(topic => topic && topic.completed).length || 0), 0
        );
        const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
        
        // Count completed chapters
        const completedChapters = updatedCompletionStatus.filter(chapter => chapter.completed).length;
        
        // Save complete batch data to local storage
        const updatedBatch = {
          ...batch,
          completionStatus: updatedCompletionStatus,
          progress,
          completedChapters
        };
        localStorage.setItem(`batch_${batch.id}`, JSON.stringify(updatedBatch));
        
        return {
          ...batch,
          completionStatus: updatedCompletionStatus,
          progress,
          completedChapters
        };
      }
      return batch;
    });
    
    setBatches(updatedBatches);
    setSelectedBatch(updatedBatches.find(batch => batch.id === selectedBatch.id));
  };
  
  // Function to handle test completion
  const handleTestCompletion = async (chapterIndex, score) => {
    if (!selectedBatch) return;
    
    // Analyze test results
    const results = {
      score,
      totalQuestions: testQuestions.length,
      correctAnswers: 0,
      incorrectAnswers: [],
      conceptsToReview: [],
      difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
      answeredQuestions: [],
      completedAt: new Date().toISOString()
    };
    
    testQuestions.forEach((question, index) => {
      const userAnswer = testAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        results.correctAnswers++;
      } else {
        results.incorrectAnswers.push({
          question: question.question,
          userAnswer: question.options && question.options[userAnswer] ? question.options[userAnswer] : userAnswer,
          correctAnswer: question.options && question.options[question.correctAnswer] ? question.options[question.correctAnswer] : question.correctAnswer,
          explanation: question.explanation || 'No explanation provided',
          conceptTested: question.conceptTested || 'General concept'
        });
        
        const concept = question.conceptTested || 'General concept';
        if (!results.conceptsToReview.includes(concept)) {
          results.conceptsToReview.push(concept);
        }
      }
      
      if (question.difficulty) {
        results.difficultyBreakdown[question.difficulty]++;
      }
      
      results.answeredQuestions.push({
        question: question.question,
        userAnswer: userAnswer !== undefined ? (question.options && question.options[userAnswer] ? question.options[userAnswer] : userAnswer) : 'Not answered',
        correctAnswer: question.options && question.options[question.correctAnswer] ? question.options[question.correctAnswer] : question.correctAnswer,
        isCorrect,
        explanation: question.explanation || 'No explanation provided'
      });
    });
    
    setTestResults(results);
    
    // Save to backend and send email
    try {
      const response = await fetch(`${API_URL}/api/batches/${selectedBatch.id}/test-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          chapterIndex,
          chapterTitle: selectedBatch.aiLearningPlan.chapters[chapterIndex].title,
          batchTitle: selectedBatch.title,
          testResults: results
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.emailSent) {
          console.log('Test report sent to email');
        }
      }
    } catch (error) {
      console.error('Error saving test results:', error);
    }
    
    // Generate adaptive chapter if score is below 70%
    if (score < 70 && results.conceptsToReview.length > 0) {
      generateAdaptiveChapter(chapterIndex, results.conceptsToReview);
    }
    
    // Generate learning resources
    generateResources(chapterIndex, results.conceptsToReview);
    
    const updatedBatches = batches.map(batch => {
      if (batch.id === selectedBatch.id) {
        const updatedCompletionStatus = [...batch.completionStatus];
        updatedCompletionStatus[chapterIndex].testAttempted = true;
        updatedCompletionStatus[chapterIndex].testScore = score;
        updatedCompletionStatus[chapterIndex].testResults = results;
        
        localStorage.setItem(`batch_${batch.id}`, JSON.stringify({
          ...batch,
          completionStatus: updatedCompletionStatus
        }));
        
        return {
          ...batch,
          completionStatus: updatedCompletionStatus
        };
      }
      return batch;
    });
    
    setBatches(updatedBatches);
    setSelectedBatch(updatedBatches.find(batch => batch.id === selectedBatch.id));
    setShowTestModal(false);
    setShowTestResultsModal(true);
  };
  
  // Function to handle assignment completion
  const handleAssignmentCompletion = (chapterIndex) => {
    if (!selectedBatch) return;
    
    const updatedBatches = batches.map(batch => {
      if (batch.id === selectedBatch.id) {
        const updatedCompletionStatus = [...batch.completionStatus];
        updatedCompletionStatus[chapterIndex].assignmentCompleted = true;
        
        return {
          ...batch,
          completionStatus: updatedCompletionStatus
        };
      }
      return batch;
    });
    
    setBatches(updatedBatches);
    setSelectedBatch(updatedBatches.find(batch => batch.id === selectedBatch.id));
    setShowAssignmentModal(false);
  };
  
  // Function to save notes
  const saveNote = (chapterIndex) => {
    if (!selectedBatch || !currentNote.trim()) return;
    
    const noteKey = `${selectedBatch.id}-${chapterIndex}`;
    const updatedNotes = {
      ...notes,
      [noteKey]: currentNote
    };
    
    setNotes(updatedNotes);
    setCurrentNote("");
    
    // Save notes to localStorage only (not database)
    localStorage.setItem('batchNotes', JSON.stringify(updatedNotes));
  };
  
  // Generate learning resources for concepts
  const generateResources = async (chapterIndex, conceptsToReview) => {
    if (!selectedBatch) return;
    
    const chapter = selectedBatch.aiLearningPlan.chapters[chapterIndex];
    
    try {
      const prompt = `
Provide learning resources for a student studying "${chapter.title}" who needs help with these concepts:
${conceptsToReview.length > 0 ? conceptsToReview.join(', ') : 'All concepts in the chapter'}

Return the resources in JSON format like this:
{
  "books": [
    { "title": "Book Title", "author": "Author Name", "description": "Brief description" }
  ],
  "videos": [
    { "title": "Video Title", "platform": "YouTube/Coursera/etc", "description": "Brief description" }
  ],
  "websites": [
    { "title": "Website Title", "url": "example.com", "description": "Brief description" }
  ],
  "articles": [
    { "title": "Article Title", "source": "Source Name", "description": "Brief description" }
  ]
}
Only return valid JSON, no other text.
`;

      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const rawText = result.response?.text ? await result.response.text() : '';
      
      if (!rawText.trim()) throw new Error("Failed to generate resources");
      
      try {
        const jsonStart = rawText.indexOf("{");
        const jsonEnd = rawText.lastIndexOf("}") + 1;
        const jsonText = rawText.slice(jsonStart, jsonEnd);
        const resourcesData = JSON.parse(jsonText);
        
        // Store resources for this chapter
        setResources(prev => ({
          ...prev,
          [`${selectedBatch.id}-${chapterIndex}`]: resourcesData
        }));
        
        // Show resources modal if there are concepts to review
        if (conceptsToReview.length > 0) {
          setShowResourcesModal(true);
        }
      } catch (err) {
        console.error("Error parsing resources:", err);
      }
    } catch (err) {
      console.error("Error generating resources:", err);
    }
  };
  
  // Function to check if a batch is eligible for certificate
  const isEligibleForCertificate = (batch) => {
    if (!batch || !batch.completionStatus) return false;
    
    // Check if all chapters are completed with tests and assignments
    // Skip adaptive chapters for certificate eligibility
    return batch.completionStatus
      .filter(chapter => !chapter.isAdaptive)
      .every(chapter => 
        chapter.completed && chapter.testAttempted && 
        (chapter.testScore >= 70) && // Passing score
        (chapter.assignmentCompleted || !chapter.hasOwnProperty('assignmentCompleted'))
      );
  };
  
  // Generate adaptive chapter based on test results
  const generateAdaptiveChapter = async (chapterIndex, conceptsToReview) => {
    if (!selectedBatch) return;
    
    const chapter = selectedBatch.aiLearningPlan.chapters[chapterIndex];
    
    try {
      const prompt = `
Create a focused learning chapter to help a student who is struggling with the following concepts:
${conceptsToReview.join(', ')}

These concepts are from the chapter "${chapter.title}" which covers:
${chapter.topics.map(t => t.title).join(', ')}

Create a remedial chapter that explains these concepts in a different way, with more examples and practice exercises.
Return the chapter in JSON format like this:
{
  "title": "Reinforcement: [Original Chapter Title]",
  "topics": [
    {
      "title": "Topic title focusing on a concept",
      "explanation": "Detailed explanation with examples",
      "examples": ["Example 1", "Example 2"],
      "practice": ["Practice question 1", "Practice question 2"]
    }
  ]
}
Only return valid JSON, no other text.
`;

      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const rawText = result.response?.text ? await result.response.text() : '';
      
      if (!rawText.trim()) throw new Error("Failed to generate adaptive chapter");
      
      try {
        const jsonStart = rawText.indexOf("{");
        const jsonEnd = rawText.lastIndexOf("}") + 1;
        const jsonText = rawText.slice(jsonStart, jsonEnd);
        const adaptiveChapterData = JSON.parse(jsonText);
        
        // Add the adaptive chapter to the batch
        const updatedBatches = batches.map(batch => {
          if (batch.id === selectedBatch.id) {
            // Create a new chapter in the learning plan
            const updatedChapters = [...batch.aiLearningPlan.chapters];
            updatedChapters.push(adaptiveChapterData);
            
            // Add completion status for the new chapter
            const updatedCompletionStatus = [...batch.completionStatus];
            updatedCompletionStatus.push({
              completed: false,
              topics: adaptiveChapterData.topics.map(() => ({ completed: false })),
              testAttempted: false,
              isAdaptive: true,
              parentChapterIndex: chapterIndex
            });
            
            return {
              ...batch,
              aiLearningPlan: {
                ...batch.aiLearningPlan,
                chapters: updatedChapters
              },
              completionStatus: updatedCompletionStatus,
              totalChapters: updatedChapters.length
            };
          }
          return batch;
        });
        
        setBatches(updatedBatches);
        setSelectedBatch(updatedBatches.find(batch => batch.id === selectedBatch.id));
        setAdaptiveChapter(adaptiveChapterData);
      } catch (err) {
        console.error("Error parsing adaptive chapter:", err);
      }
    } catch (err) {
      console.error("Error generating adaptive chapter:", err);
    }
  };

  const handleAskDoubt = async () => {
    if (!doubtQuestion.trim()) return;
    
    const userMessage = { role: 'user', content: doubtQuestion };
    setDoubtMessages(prev => [...prev, userMessage]);
    setDoubtQuestion('');
    setDoubtLoading(true);
    
    try {
      const contextContent = selectedTopic 
        ? `Topic: ${selectedTopic.title}\n${selectedTopic.explanation}`
        : selectedChapterForVideo.topics?.map(t => `${t.title}: ${t.explanation}`).join('\n\n');
      
      const prompt = `You are a helpful tutor. Based on this learning content:\n\n${contextContent}\n\nStudent's question: ${doubtQuestion}\n\nProvide a clear, detailed answer.`;
      
      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      
      const aiMessage = { role: 'assistant', content: response };
      setDoubtMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting answer:', error);
      const errorMessage = { role: 'assistant', content: 'Sorry, I could not process your question. Please try again.' };
      setDoubtMessages(prev => [...prev, errorMessage]);
    } finally {
      setDoubtLoading(false);
    }
  };

  const handleVideoClick = () => {
    if (!isVideoPlaying && videoRef.current) {
      videoRef.current.play();
      setIsVideoPlaying(true);
      
      const textToSpeak = selectedTopic 
        ? selectedTopic.explanation 
        : selectedChapterForVideo.topics?.map(t => `${t.title}. ${t.explanation}`).join('. ');
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        if (videoRef.current) {
          videoRef.current.pause();
          setIsVideoPlaying(false);
        }
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.cancel();
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsVideoPlaying(false);
    }
  };

  return (
    <div className="mybatch-root">
      {/* Batch Creation Modal */}
      {showBatchCreation && (
        <div className="pw-modal-overlay">
          <div className="pw-modal-content" style={{ maxWidth: '500px', padding: '20px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Create New Batch</h2>
            <form onSubmit={handleBatchFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Batch Title *" required style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Subject *" required style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                <select value={newDifficulty} onChange={e => setNewDifficulty(e.target.value)} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input value={newLanguage} onChange={e => setNewLanguage(e.target.value)} placeholder="Language" style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                <input value={newDuration} onChange={e => setNewDuration(e.target.value)} type="number" min="1" placeholder="Duration (hrs)" style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
              </div>
              
              <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Description" rows={3} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}></textarea>
              
              <textarea value={newSyllabusText} onChange={e => setNewSyllabusText(e.target.value)} placeholder="Syllabus topics" rows={4} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}></textarea>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowBatchCreation(false)} disabled={loading} style={{ flex: 1, padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', background: '#174C7C', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>{loading ? "Creating..." : "Create Batch"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Header */}
      {!showBatchDetails && (
        <>
          <div className="mybatch-header">
            <div>
              <h1 className="mybatch-title">Learning Batches</h1>
              <p className="mybatch-subtitle">Manage your learning journey</p>
            </div>
            <div className="mybatch-header-actions">
              <button onClick={() => setShowBatchCreation(true)} className="mybatch-btn mybatch-btn-create">
                <Zap size={18} /> Create AI Batch
              </button>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="mybatch-searchfilter" style={{ marginBottom: '16px' }}>
            <div className="mybatch-searchbox" style={{ flex: '0 0 250px' }}>
              <Search className="mybatch-searchicon" size={16} />
              <input 
                className="mybatch-input" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Search batches..."
                style={{ fontSize: '13px', padding: '8px 8px 8px 32px' }}
              />
            </div>
            <div className="mybatch-filterbox" style={{ flex: '0 0 180px' }}>
              <select 
                className="mybatch-select" 
                value={filterType} 
                onChange={e => setFilterType(e.target.value)}
                style={{ fontSize: '13px', padding: '8px' }}
              >
                <option value="all">All Batches</option>
                <option value="active">In Progress</option>
                <option value="completed">Completed</option>
                <option value="custom">Custom AI Batches</option>
              </select>
            </div>
          </div>
        </>
      )}
      
      {/* Batch List */}
      {!showBatchDetails && (
        <div className="mybatch-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {getCurrentBatches().length > 0 ? (
          getCurrentBatches().map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              onCardClick={handleBatchClick}
              onContinueClick={() => handleBatchClick(batch)}
            />
          ))
        ) : (
          <div className="mybatch-no-batches">No batches found. Create a new batch to get started!</div>
        )}
        </div>
      )}
      
      {/* Batch Details View */}
      {showBatchDetails && selectedBatch && !showVideoModal && (
        <div className="mybatch-details" style={{ position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0, backgroundColor: '#f9fafb', zIndex: 1000, overflowY: 'auto' }}>
          <div className="mybatch-details-header" style={{ top: 0,  overflow: 'hidden' }}>
            <button 
            className="mybatch-back-btn"
              onClick={() => { setShowBatchDetails(false); setSelectedBatch(null); }}
              style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#6b7280' , marginTop:'15px' }}
            >
              <ArrowLeft size={18} style={{  marginTop:'7px' }} /> Back
            </button>&nbsp;
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '12px' }}>{selectedBatch.title}</h2>
          </div>
          
          <div className="mybatch-details-tabs" style={{  top: '-20px' , display: 'flex', gap: '32px' }}>
            <button 
              style={{  border: 'none', background: 'none', fontSize: '14px', fontWeight: '500', color: activeDetailTab === 'description' ? '#174C7C' : '#6b7280', borderBottom: activeDetailTab === 'description' ? '2px solid #174C7C' : 'none', cursor: 'pointer' }}
              onClick={() => setActiveDetailTab('description')}
            >
              Description
            </button>
            <button 
              style={{ padding: '16px 0', border: 'none', background: 'none', fontSize: '14px', fontWeight: '500', color: activeDetailTab === 'classes' ? '#174C7C' : '#6b7280', borderBottom: activeDetailTab === 'classes' ? '2px solid #174C7C' : 'none', cursor: 'pointer' }}
              onClick={() => setActiveDetailTab('classes')}
            >
              All Classes
            </button>
            <button 
              style={{ padding: '16px 0', border: 'none', background: 'none', fontSize: '14px', fontWeight: '500', color: activeDetailTab === 'community' ? '#174C7C' : '#6b7280', borderBottom: activeDetailTab === 'community' ? '2px solid #174C7C' : 'none', cursor: 'pointer' }}
              onClick={() => setActiveDetailTab('community')}
            >
              Community
            </button>
          </div>
          
          <div className="mybatch-details-content" style={{ maxWidth: '1200px', margin: '', padding: '24px' }}>
            {activeDetailTab === 'description' && (
              <div>
                <div style={{  borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>This Batch Includes</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Calendar size={14} style={{ color: '#174C7C' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>Course Duration</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>{selectedBatch.estimatedTime || 'Flexible'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BookOpen size={14} style={{ color: '#174C7C' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>Daily Lectures</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>Classes will be held regularly</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={14} style={{ color: '#174C7C' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>Study Materials</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>PDF Notes and resources included</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{  borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>About This Course</h3>
                  <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>
                    {selectedBatch.aiLearningPlan?.description || "This comprehensive course covers all essential topics with hands-on practice and real-world examples."}
                  </p>
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Subjects: {selectedBatch.subject}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Difficulty: {selectedBatch.difficulty}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Language: {selectedBatch.language}</div>
                  </div>
                </div>
                
                <div style={{  borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Know Your Teachers</h3>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                    <img 
                      src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150" 
                      alt={selectedBatch.instructor}
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{selectedBatch.instructor}</h4>
                      <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                        Expert instructor with 10+ years of experience in {selectedBatch.subject}. Passionate about teaching and helping students achieve their learning goals.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style={{  borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>FAQs</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { q: 'How long do I have access to this course?', a: 'You have lifetime access to all course materials once enrolled.' },
                      { q: 'Can I download the course materials?', a: 'Yes, all PDF notes and resources can be downloaded for offline study.' },
                      { q: 'Is there a certificate upon completion?', a: "Yes, you'll receive a certificate after completing all chapters and passing the tests." },
                      { q: 'Can I ask questions to the instructor?', a: 'Yes, you can ask questions through the community tab and get responses from instructors.' }
                    ].map((faq, index) => (
                      <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                        <button
                          onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'white', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HelpCircle size={16} style={{ color: '#174C7C', flexShrink: 0 }} />
                            <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{faq.q}</h4>
                          </div>
                          {openFaqIndex === index ? <ChevronUp size={18} style={{ color: '#6b7280' }} /> : <ChevronDown size={18} style={{ color: '#6b7280' }} />}
                        </button>
                        {openFaqIndex === index && (
                          <div style={{ padding: '12px 16px 16px 40px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{faq.a}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeDetailTab === 'classes' && selectedBatch.aiLearningPlan?.chapters && (
              <div style={{ marginTop:'-50px', marginLeft:'-50px', padding: '24px' }}>
                <SyllabusList 
                  chapters={selectedBatch.aiLearningPlan.chapters}
                  onChapterClick={(chapter, index) => {
                    setSelectedChapterForVideo(chapter);
                    setSelectedChapterIndex(index);
                    setSelectedTopic(null);
                    setShowVideoModal(true);
                  }}
                  onTopicClick={(chapter, topic) => {
                    setSelectedChapterForVideo(chapter);
                    setSelectedTopic(topic);
                    setShowVideoModal(true);
                  }}
                />
              </div>
            )}
            
            {activeDetailTab === 'tests' && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Tests & Assignments</h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Complete classes to unlock tests and assignments.</p>
              </div>
            )}
            
            {activeDetailTab === 'announcements' && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Announcements</h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>No announcements yet.</p>
              </div>
            )}
            
            {activeDetailTab === 'community' && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Community</h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Connect with other learners in this batch.</p>
              </div>
            )}
            
          
            
            {/* Resources Tab */}
            {activeDetailTab === 'resources' && (
              <div className="mybatch-resources-section">
                <h3>Learning Resources</h3>
                {currentChapter !== null ? (
                  resources[`${selectedBatch.id}-${currentChapter}`] ? (
                    <div className="mybatch-resources-lists">
                      {resources[`${selectedBatch.id}-${currentChapter}`].books?.length > 0 && (
                        <div className="mybatch-resource-section">
                          <h4><Book size={16} /> Recommended Books</h4>
                          <ul className="mybatch-resources-list">
                            {resources[`${selectedBatch.id}-${currentChapter}`].books.map((book, index) => (
                              <li key={index} className="mybatch-resource-item">
                                <div className="mybatch-resource-title">{book.title}</div>
                                <div className="mybatch-resource-author">by {book.author}</div>
                                <div className="mybatch-resource-description">{book.description}</div>
                                {book.link && (
                                  <a href={book.link} target="_blank" rel="noopener noreferrer" className="mybatch-resource-link">
                                    <ExternalLink size={14} /> View Book
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {resources[`${selectedBatch.id}-${currentChapter}`].videos?.length > 0 && (
                        <div className="mybatch-resource-section">
                          <h4><Youtube size={16} /> Video Tutorials</h4>
                          <ul className="mybatch-resources-list">
                            {resources[`${selectedBatch.id}-${currentChapter}`].videos.map((video, index) => (
                              <li key={index} className="mybatch-resource-item">
                                <div className="mybatch-resource-title">{video.title}</div>
                                <div className="mybatch-resource-platform">{video.platform}</div>
                                <div className="mybatch-resource-description">{video.description}</div>
                                {video.link && (
                                  <a href={video.link} target="_blank" rel="noopener noreferrer" className="mybatch-resource-link">
                                    <ExternalLink size={14} /> Watch Video
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {resources[`${selectedBatch.id}-${currentChapter}`].websites?.length > 0 && (
                        <div className="mybatch-resource-section">
                          <h4><ExternalLink size={16} /> Useful Websites</h4>
                          <ul className="mybatch-resources-list">
                            {resources[`${selectedBatch.id}-${currentChapter}`].websites.map((website, index) => (
                              <li key={index} className="mybatch-resource-item">
                                <div className="mybatch-resource-title">{website.title}</div>
                                <div className="mybatch-resource-url">{website.url}</div>
                                <div className="mybatch-resource-description">{website.description}</div>
                                <a href={website.url} target="_blank" rel="noopener noreferrer" className="mybatch-resource-link">
                                  <ExternalLink size={14} /> Visit Website
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {resources[`${selectedBatch.id}-${currentChapter}`].articles?.length > 0 && (
                        <div className="mybatch-resource-section">
                          <h4><FileText size={16} /> Articles & Papers</h4>
                          <ul className="mybatch-resources-list">
                            {resources[`${selectedBatch.id}-${currentChapter}`].articles.map((article, index) => (
                              <li key={index} className="mybatch-resource-item">
                                <div className="mybatch-resource-title">{article.title}</div>
                                <div className="mybatch-resource-source">{article.source}</div>
                                <div className="mybatch-resource-description">{article.description}</div>
                                {article.link && (
                                  <a href={article.link} target="_blank" rel="noopener noreferrer" className="mybatch-resource-link">
                                    <ExternalLink size={14} /> Read Article
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mybatch-resources-loading">
                      <div className="mybatch-spinner"></div>
                      <p>Generating resources...</p>
                    </div>
                  )
                ) : (
                  <p>Select a chapter to view resources</p>
                )}
              </div>
            )}
            
            {/* Flashcards Tab */}
            {activeDetailTab === 'flashcards' && (
              <div className="mybatch-flashcards-section">
                <h3>Study Flashcards</h3>
                {currentChapter !== null ? (
                  flashcards[`${selectedBatch.id}-${currentChapter}`] ? (
                    <div className="mybatch-flashcards-container">
                      {flashcards[`${selectedBatch.id}-${currentChapter}`].map((card, index) => (
                        <div className="mybatch-flashcard" key={index}>
                          <div className="mybatch-flashcard-inner">
                            <div className="mybatch-flashcard-front">
                              <h4>{card.question}</h4>
                              <span className="mybatch-flashcard-topic">{card.topic}</span>
                            </div>
                            <div className="mybatch-flashcard-back">
                              <p>{card.answer}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="mybatch-flashcards-actions">
                        <button className="mybatch-btn mybatch-btn-download" onClick={() => alert('Download functionality would be implemented here')}>
                          <FileDown size={16} /> Download Flashcards
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mybatch-flashcards-loading">
                      <div className="mybatch-spinner"></div>
                      <p>Generating flashcards...</p>
                    </div>
                  )
                ) : (
                  <p>Select a chapter to view flashcards</p>
                )}
              </div>
            )}
            
            {/* Important Questions Tab */}
            {activeDetailTab === 'questions' && (
              <div className="mybatch-questions-section">
                <h3>Important Questions</h3>
                {currentChapter !== null ? (
                  importantQuestions[`${selectedBatch.id}-${currentChapter}`] ? (
                    <div className="mybatch-questions-container">
                      {importantQuestions[`${selectedBatch.id}-${currentChapter}`].map((q, index) => (
                        <div className="mybatch-question-item" key={index}>
                          <div className="mybatch-question-header">
                            <h4>{index + 1}. {q.question}</h4>
                            <span className={`mybatch-question-difficulty mybatch-difficulty-${q.difficulty}`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <div className="mybatch-question-topic">{q.topic}</div>
                          <div className="mybatch-question-answer">
                            <h5>Answer:</h5>
                            <p>{q.answer}</p>
                          </div>
                        </div>
                      ))}
                      <div className="mybatch-questions-actions">
                        <button className="mybatch-btn mybatch-btn-download" onClick={() => alert('Download functionality would be implemented here')}>
                          <FileDown size={16} /> Download Questions
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mybatch-questions-loading">
                      <div className="mybatch-spinner"></div>
                      <p>Generating important questions...</p>
                    </div>
                  )
                ) : (
                  <p>Select a chapter to view important questions</p>
                )}
              </div>
            )}
            
            {/* Tests & Assignments Tab */}
            {activeDetailTab === 'tests' && (
              <div className="mybatch-tests-section">
                <h3>Tests & Assignments</h3>
                {selectedBatch.completionStatus.map((status, index) => {
                  if (!status.isTest && !status.testAttempted) return null;
                  
                  const chapter = selectedBatch.aiLearningPlan.chapters[index];
                  return (
                    <div className="mybatch-test-item" key={index}>
                      <div className="mybatch-test-header">
                        <h4>Chapter {index + 1}: {chapter.title}</h4>
                        {status.testAttempted && (
                          <span className={`mybatch-test-score ${status.testScore >= 70 ? 'passed' : 'failed'}`}>
                            Score: {status.testScore}%
                          </span>
                        )}
                      </div>
                      
                      <div className="mybatch-test-actions">
                        <button 
                          className="mybatch-btn mybatch-btn-test"
                          onClick={() => {
                            setCurrentChapter(index);
                            generateTestQuestions(index);
                            setShowTestModal(true);
                          }}
                        >
                          {status.testAttempted ? 'Retake Test' : 'Take Test'}
                        </button>
                        
                        {status.testAttempted && (
                          <button 
                            className="mybatch-btn mybatch-btn-results"
                            onClick={() => {
                              setCurrentChapter(index);
                              setTestResults(status.testResults);
                              setShowTestResultsModal(true);
                            }}
                          >
                            View Results
                          </button>
                        )}
                        
                        {status.testAttempted && (
                          <button 
                            className="mybatch-btn mybatch-btn-assignment"
                            onClick={() => {
                              setCurrentChapter(index);
                              generateAssignmentPrompt(index);
                              setShowAssignmentModal(true);
                            }}
                            disabled={status.assignmentCompleted}
                          >
                            {status.assignmentCompleted ? 'Assignment Completed' : 'Complete Assignment'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {selectedBatch.completionStatus.every(status => !status.isTest && !status.testAttempted) && (
                  <p>No tests have been attempted yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Test Modal */}
      {showTestModal && selectedBatch && currentChapter !== null && (
        <div className="pw-modal-overlay">
          <div className="pw-modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '2px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#174C7C' }}>Chapter {currentChapter + 1} Test</h2>
              <button onClick={() => setShowTestModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#6b7280' }}>×</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {testLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                  <div className="pw-spinner" style={{ width: '40px', height: '40px', marginBottom: '16px' }}></div>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>Generating test questions...</p>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Answer the following questions to complete the chapter test.</p>
                  
                  {testQuestions.map((question, qIndex) => (
                    <div key={qIndex} style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ padding: '4px 12px', backgroundColor: question.type === 'mcq' ? '#dbeafe' : '#fef3c7', color: question.type === 'mcq' ? '#174C7C' : '#92400e', fontSize: '12px', fontWeight: '600', borderRadius: '6px' }}>
                          {question.type === 'mcq' ? 'Multiple Choice' : 'Text Answer'}
                        </span>
                      </div>
                      <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>{qIndex + 1}. {question.question}</p>
                      
                      {question.type === 'mcq' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {question.options.map((option, oIndex) => (
                            <label 
                              key={oIndex}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '12px 16px', 
                                backgroundColor: testAnswers[qIndex] === oIndex ? '#dbeafe' : 'white',
                                border: testAnswers[qIndex] === oIndex ? '2px solid #174C7C' : '1px solid #d1d5db',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <input 
                                type="radio" 
                                name={`q${qIndex}`} 
                                value={oIndex} 
                                checked={testAnswers[qIndex] === oIndex}
                                onChange={() => setTestAnswers({...testAnswers, [qIndex]: oIndex})}
                                style={{ marginRight: '12px', accentColor: '#174C7C' }}
                              /> 
                              <span style={{ fontSize: '14px', color: '#374151' }}>{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          value={testAnswers[qIndex] || ''}
                          onChange={(e) => setTestAnswers({...testAnswers, [qIndex]: e.target.value})}
                          placeholder="Type your answer here..."
                          style={{ 
                            width: '100%', 
                            minHeight: '100px', 
                            padding: '12px', 
                            border: '2px solid #d1d5db', 
                            borderRadius: '8px', 
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            backgroundColor: 'white',
                            color: '#374151'
                          }}
                        />
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
            
            {!testLoading && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setShowTestModal(false)}
                    style={{ padding: '10px 20px', backgroundColor: 'white', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {Object.keys(testAnswers).filter(k => testAnswers[k] !== undefined && testAnswers[k] !== '').length} / {testQuestions.length} answered
                </div>
                <button 
                  onClick={() => handleTestCompletion(currentChapter, calculateTestScore())}
                  disabled={Object.keys(testAnswers).filter(k => testAnswers[k] !== undefined && testAnswers[k] !== '').length < testQuestions.length}
                  style={{ 
                    padding: '10px 24px', 
                    backgroundColor: Object.keys(testAnswers).filter(k => testAnswers[k] !== undefined && testAnswers[k] !== '').length < testQuestions.length ? '#9ca3af' : '#174C7C', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    cursor: Object.keys(testAnswers).filter(k => testAnswers[k] !== undefined && testAnswers[k] !== '').length < testQuestions.length ? 'not-allowed' : 'pointer' 
                  }}
                >
                  Submit Test
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Assignment Modal */}
      {showAssignmentModal && selectedBatch && currentChapter !== null && (
        <div className="pw-modal-overlay">
          <div className="pw-modal-content">
            <h2>Chapter {currentChapter + 1} Assignment</h2>
            <div className="pw-assignment-content">
              <p>Complete the following assignment to demonstrate your understanding of the chapter.</p>
              
              <div className="pw-assignment-task">
                <h4>Assignment Task:</h4>
                <div className="pw-assignment-description">
                  {assignmentPrompt ? (
                    <p>{assignmentPrompt}</p>
                  ) : (
                    <div className="pw-assignment-loading">
                      <div className="pw-spinner"></div>
                      <p>Generating assignment...</p>
                    </div>
                  )}
                </div>
                
                <textarea 
                  className="pw-assignment-textarea"
                  placeholder="Describe your approach and solution here..."
                ></textarea>
                
                <div className="pw-form-group">
                  <label>Upload File or Provide Link:</label>
                  <input type="text" placeholder="https://github.com/yourusername/project" />
                </div>
              </div>
              
              <div className="pw-form-actions">
                <button 
                  className="pw-btn" 
                  onClick={() => setShowAssignmentModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="pw-btn pw-btn-primary" 
                  onClick={() => handleAssignmentCompletion(currentChapter)}
                  disabled={!assignmentPrompt}
                >
                  Submit Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Test Results Modal */}
      {showTestResultsModal && testResults && selectedBatch && currentChapter !== null && (
        <div className="pw-modal-overlay">
          <div className="pw-modal-content pw-test-results-modal">
            <h2>Test Results</h2>
            <div className="pw-test-results-content">
              <div className="pw-test-results-summary">
                <div className="pw-test-score-display">
                  <div className="pw-test-score-circle">
                    <span className="pw-test-score-value">{testResults.score}%</span>
                  </div>
                  <p className="pw-test-score-label">
                    {testResults.score >= 70 ? 'Passed!' : 'Needs Improvement'}
                  </p>
                </div>
                
                <div className="pw-test-stats">
                  <div className="pw-test-stat">
                    <span className="pw-test-stat-label">Questions</span>
                    <span className="pw-test-stat-value">{testResults.totalQuestions}</span>
                  </div>
                  <div className="pw-test-stat">
                    <span className="pw-test-stat-label">Correct</span>
                    <span className="pw-test-stat-value">{testResults.correctAnswers}</span>
                  </div>
                  <div className="pw-test-stat">
                    <span className="pw-test-stat-label">Incorrect</span>
                    <span className="pw-test-stat-value">{testResults.incorrectAnswers.length}</span>
                  </div>
                </div>
                
                <div className="pw-test-chart">
                  <h4><BarChart2 size={16} /> Difficulty Breakdown</h4>
                  <div className="pw-difficulty-bars">
                    <div className="pw-difficulty-bar">
                      <div className="pw-difficulty-label">Easy</div>
                      <div className="pw-difficulty-track">
                        <div 
                          className="pw-difficulty-fill pw-easy" 
                          style={{ width: `${(testResults.difficultyBreakdown.easy / testResults.totalQuestions) * 100}%` }}
                        ></div>
                      </div>
                      <div className="pw-difficulty-value">{testResults.difficultyBreakdown.easy}</div>
                    </div>
                    <div className="pw-difficulty-bar">
                      <div className="pw-difficulty-label">Medium</div>
                      <div className="pw-difficulty-track">
                        <div 
                          className="pw-difficulty-fill pw-medium" 
                          style={{ width: `${(testResults.difficultyBreakdown.medium / testResults.totalQuestions) * 100}%` }}
                        ></div>
                      </div>
                      <div className="pw-difficulty-value">{testResults.difficultyBreakdown.medium}</div>
                    </div>
                    <div className="pw-difficulty-bar">
                      <div className="pw-difficulty-label">Hard</div>
                      <div className="pw-difficulty-track">
                        <div 
                          className="pw-difficulty-fill pw-hard" 
                          style={{ width: `${(testResults.difficultyBreakdown.hard / testResults.totalQuestions) * 100}%` }}
                        ></div>
                      </div>
                      <div className="pw-difficulty-value">{testResults.difficultyBreakdown.hard}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {testResults.incorrectAnswers.length > 0 && (
                <div className="pw-incorrect-answers">
                  <h4><AlertTriangle size={16} /> Concepts to Review</h4>
                  <ul className="pw-concepts-list">
                    {testResults.conceptsToReview.map((concept, index) => (
                      <li key={index}>{concept}</li>
                    ))}
                  </ul>
                  
                  <h4>Incorrect Answers</h4>
                  {testResults.incorrectAnswers.map((item, index) => (
                    <div className="pw-incorrect-item" key={index}>
                      <p className="pw-incorrect-question">{item.question}</p>
                      <div className="pw-incorrect-details">
                        <p><strong>Your answer:</strong> <span className="pw-wrong-answer">{item.userAnswer}</span></p>
                        <p><strong>Correct answer:</strong> <span className="pw-right-answer">{item.correctAnswer}</span></p>
                        <p><strong>Explanation:</strong> {item.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="pw-form-actions">
                <button 
                  className="pw-btn" 
                  onClick={() => setShowTestResultsModal(false)}
                >
                  Close
                </button>
                <button 
                  className="pw-btn pw-btn-primary" 
                  onClick={() => {
                    setShowTestResultsModal(false);
                    setShowResourcesModal(true);
                  }}
                >
                  View Resources
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Resources Modal - HIDDEN */}
      {false && showResourcesModal && selectedBatch && currentChapter !== null && (
        <div className="pw-modal-overlay">
          <div className="pw-modal-content pw-resources-modal">
            <h2>Learning Resources</h2>
            <div className="pw-resources-content">
              <p>Here are some resources to help you master the concepts in this chapter:</p>
              
              {resources[`${selectedBatch.id}-${currentChapter}`] ? (
                <div className="pw-resources-lists">
                  {resources[`${selectedBatch.id}-${currentChapter}`].books?.length > 0 && (
                    <div className="pw-resource-section">
                      <h4><Book size={16} /> Recommended Books</h4>
                      <ul className="pw-resources-list">
                        {resources[`${selectedBatch.id}-${currentChapter}`].books.map((book, index) => (
                          <li key={index} className="pw-resource-item">
                            <div className="pw-resource-title">{book.title}</div>
                            <div className="pw-resource-author">by {book.author}</div>
                            <div className="pw-resource-description">{book.description}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {resources[`${selectedBatch.id}-${currentChapter}`].videos?.length > 0 && (
                    <div className="pw-resource-section">
                      <h4><Youtube size={16} /> Video Tutorials</h4>
                      <ul className="pw-resources-list">
                        {resources[`${selectedBatch.id}-${currentChapter}`].videos.map((video, index) => (
                          <li key={index} className="pw-resource-item">
                            <div className="pw-resource-title">{video.title}</div>
                            <div className="pw-resource-platform">{video.platform}</div>
                            <div className="pw-resource-description">{video.description}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {resources[`${selectedBatch.id}-${currentChapter}`].websites?.length > 0 && (
                    <div className="pw-resource-section">
                      <h4><ExternalLink size={16} /> Useful Websites</h4>
                      <ul className="pw-resources-list">
                        {resources[`${selectedBatch.id}-${currentChapter}`].websites.map((website, index) => (
                          <li key={index} className="pw-resource-item">
                            <div className="pw-resource-title">{website.title}</div>
                            <div className="pw-resource-url">{website.url}</div>
                            <div className="pw-resource-description">{website.description}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {resources[`${selectedBatch.id}-${currentChapter}`].articles?.length > 0 && (
                    <div className="pw-resource-section">
                      <h4><FileText size={16} /> Articles & Papers</h4>
                      <ul className="pw-resources-list">
                        {resources[`${selectedBatch.id}-${currentChapter}`].articles.map((article, index) => (
                          <li key={index} className="pw-resource-item">
                            <div className="pw-resource-title">{article.title}</div>
                            <div className="pw-resource-source">{article.source}</div>
                            <div className="pw-resource-description">{article.description}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pw-resources-loading">
                  <div className="pw-spinner"></div>
                  <p>Generating resources...</p>
                </div>
              )}
              
              <div className="pw-form-actions">
                <button 
                  className="pw-btn" 
                  onClick={() => setShowResourcesModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="pw-modal-overlay">
          <div className="pw-modal-content pw-analytics-modal">
            <h2>Learning Analytics</h2>
            <div className="pw-analytics-content">
              <div className="pw-analytics-grid">
                <div className="pw-analytics-card">
                  <h3>Study Time</h3>
                  <div className="pw-analytics-value">{Math.floor(studyTime/60)}h {studyTime%60}m</div>
                  <div className="pw-analytics-trend">+15% this week</div>
                </div>
                <div className="pw-analytics-card">
                  <h3>Streak</h3>
                  <div className="pw-analytics-value">{studyStreak} days</div>
                  <div className="pw-analytics-trend">Personal best!</div>
                </div>
                <div className="pw-analytics-card">
                  <h3>Completion Rate</h3>
                  <div className="pw-analytics-value">{Math.round(batches.reduce((sum, b) => sum + b.progress, 0) / batches.length)}%</div>
                  <div className="pw-analytics-trend">Above average</div>
                </div>
                <div className="pw-analytics-card">
                  <h3>Achievements</h3>
                  <div className="pw-analytics-value">{achievements.length}</div>
                  <div className="pw-analytics-trend">2 new this week</div>
                </div>
              </div>
              <div className="pw-analytics-chart">
                <h3>Weekly Progress</h3>
                <div className="pw-progress-bars">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <div key={day} className="pw-day-progress">
                      <div className="pw-day-bar" style={{height: `${Math.random() * 100}%`}}></div>
                      <span>{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pw-form-actions">
              <button onClick={() => setShowAnalytics(false)} className="pw-btn">Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="pw-modal-overlay">
          <div className="pw-modal-content pw-leaderboard-modal">
            <h2>Leaderboard</h2>
            <div className="pw-leaderboard-content">
              <div className="pw-leaderboard-tabs">
                <button className="pw-tab active">Weekly</button>
                <button className="pw-tab">Monthly</button>
                <button className="pw-tab">All Time</button>
              </div>
              <div className="pw-leaderboard-list">
                {[1,2,3,4,5].map(rank => (
                  <div key={rank} className={`pw-leaderboard-item ${rank <= 3 ? 'top-three' : ''}`}>
                    <div className="pw-rank">
                      {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : rank}
                    </div>
                    <div className="pw-user-info">
                      <div className="pw-username">Student {rank}</div>
                      <div className="pw-user-stats">{Math.floor(Math.random() * 50) + 20}h studied</div>
                    </div>
                    <div className="pw-points">{Math.floor(Math.random() * 1000) + 500} pts</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pw-form-actions">
              <button onClick={() => setShowLeaderboard(false)} className="pw-btn">Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Certificate Modal */}
      {showCertificateModal && selectedBatch && (
        <div className="pw-modal-overlay">
          <div className="pw-modal-content pw-certificate-modal">
            <h2>Course Certificate</h2>
            <div className="pw-certificate">
              <div className="pw-certificate-border"></div>
              <div className="pw-certificate-header">
                <div className="pw-certificate-logo">
                  <Sparkles size={20} />
                  <span>IntelliLearn</span>
                </div>
                <Award size={60} className="pw-certificate-icon" />
                <h3>Certificate of Completion</h3>
              </div>
              
              <div className="pw-certificate-body">
                <p>This is to certify that</p>
                <h4>Student Name</h4>
                <p>has successfully completed the course</p>
                <h3>{selectedBatch.title}</h3>
                <div className="pw-certificate-score">
                  <p>with a final score of</p>
                  <div className="pw-certificate-score-value">
                    {Math.round(selectedBatch.completionStatus.reduce((sum, chapter) => 
                      sum + (chapter.testScore || 0), 0) / selectedBatch.completionStatus.length)}%
                  </div>
                </div>
                <p className="pw-certificate-date">Date: {new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="pw-certificate-footer">
                <div className="pw-certificate-signature">
                  <div className="pw-certificate-signature-line"></div>
                  <p>Instructor: {selectedBatch.instructor}</p>
                </div>
                <div className="pw-certificate-seal">
                  <div className="pw-certificate-seal-inner">
                    <Star size={24} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pw-form-actions">
              <button 
                className="pw-btn" 
                onClick={() => setShowCertificateModal(false)}
              >
                Close
              </button>
              <button className="pw-btn pw-btn-primary">
                <Download size={18} /> Download Certificate
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Video Modal */}
      {showVideoModal && selectedChapterForVideo && (
        <div className="mybatch-video-view" style={{ backgroundColor: '#fefefe', zIndex: 1000, overflowY: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #e8e8e8', paddingBottom: '16px' }}>
              <button 
                onClick={() => setShowVideoModal(false)}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#6b7280' }}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <h2 style={{ fontSize: '22px', fontWeight: '600', margin: 0, fontFamily: 'Georgia, serif', color: '#1a1a1a' }}>{selectedChapterForVideo.title}</h2>
              {selectedTopic && <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#6b7280', margin: 0, fontFamily: 'Georgia, serif' }}> • {selectedTopic.title}</h3>}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <button style={{ padding: '8px 20px', backgroundColor: '#174C7C', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={16} /> Study
              </button>
              <button 
                onClick={() => setShowDoubtModal(true)}
                style={{ padding: '8px 20px', backgroundColor: 'white', color: '#174C7C', border: '2px solid #174C7C', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <MessageSquare size={16} /> Ask Doubt
              </button>
              <button 
                onClick={() => {
                  setCurrentChapter(selectedChapterIndex);
                  generateTestQuestions(selectedChapterIndex);
                  setShowTestModal(true);
                }}
                style={{ padding: '8px 20px', backgroundColor: '#174C7C', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle size={16} /> Next
              </button>
            </div>
            
            <div>
              <div style={{ 
                backgroundColor: '#fefefe',
                padding: '0',
                marginBottom: '24px',
                boxShadow: 'none',
                border: 'none'
              }}>
                {selectedTopic ? (
                  <>
                    <MarkdownRenderer content={selectedTopic.explanation} />
                    {selectedTopic.importantLinks && selectedTopic.importantLinks.length > 0 && (
                      <div style={{ marginTop: '32px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                        <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#174C7C' }}>📚 Important Links</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {selectedTopic.importantLinks.map((link, idx) => (
                            <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'white', borderRadius: '8px', textDecoration: 'none', color: '#174C7C', border: '1px solid #e5e7eb' }}>
                              <span style={{ fontSize: '20px' }}>{link.type === 'documentation' ? '📖' : link.type === 'article' ? '📝' : '🎓'}</span>
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '14px' }}>{link.title}</div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{link.type}</div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    {selectedChapterForVideo.topics?.map((topic, index) => (
                      <div key={index} style={{ 
                        marginBottom: '48px', 
                        paddingBottom: '40px', 
                        borderBottom: index < selectedChapterForVideo.topics.length - 1 ? '1px solid #e8e8e8' : 'none' 
                      }}>
                        <h4 style={{ 
                          fontSize: '19px', 
                          fontWeight: '600', 
                          marginBottom: '20px', 
                          color: '#1a1a1a',
                          fontFamily: 'Georgia, serif'
                        }}>{topic.title}</h4>
                        <MarkdownRenderer content={topic.explanation} />
                      </div>
                    ))}
                  </div>
                )}
                
                <div 
                  onClick={handleVideoClick}
                  style={{ 
                    position: 'relative', 
                    paddingBottom: '56.25%', 
                    height: 0, 
                    overflow: 'hidden', 
                    borderRadius: '12px', 
                    backgroundColor: '#000', 
                    marginBottom: '20px',
                    cursor: 'pointer'
                  }}
                >
                  <video
                    ref={videoRef}
                    loop
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }}
                    src="https://ik.imagekit.io/qwzhnpeqg/mockround.ai%20imges%20public/video2.mp4?updatedAt=1767107552476"
                  />
                  {!isVideoPlaying && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'rgba(23, 76, 124, 0.8)',
                      borderRadius: '50%',
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '24px'
                    }}>
                      ▶
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    const nextIndex = selectedChapterIndex + 1;
                    if (nextIndex < selectedBatch.aiLearningPlan.chapters.length) {
                      setSelectedChapterForVideo(selectedBatch.aiLearningPlan.chapters[nextIndex]);
                      setSelectedChapterIndex(nextIndex);
                      setSelectedTopic(null);
                    }
                  }}
                  disabled={selectedChapterIndex >= selectedBatch.aiLearningPlan.chapters.length - 1}
                  style={{ width: '100%', padding: '12px', backgroundColor: '#174C7C', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', opacity: selectedChapterIndex >= selectedBatch.aiLearningPlan.chapters.length - 1 ? 0.5 : 1 }}
                >
                  Next Chapter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Doubt Modal */}
      {showDoubtModal && (
        <div className="pw-modal-overlay" style={{ zIndex: 1001 }}>
          <div className="pw-modal-content" style={{ maxWidth: '700px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Ask Your Doubt</h2>
              <button onClick={() => setShowDoubtModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#6b7280' }}>×</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', minHeight: '300px' }}>
              {doubtMessages.map((msg, index) => (
                <div key={index} style={{ marginBottom: '12px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ 
                    maxWidth: '80%', 
                    padding: '10px 14px', 
                    borderRadius: '12px', 
                    backgroundColor: msg.role === 'user' ? '#174C7C' : 'white',
                    color: msg.role === 'user' ? 'white' : '#1f2937',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <MarkdownRenderer content={msg.content} />
                  </div>
                </div>
              ))}
              {doubtLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div className="pw-spinner" style={{ width: '20px', height: '20px' }}></div>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text"
                value={doubtQuestion}
                onChange={(e) => setDoubtQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskDoubt()}
                placeholder="Type your question here..."
                style={{ flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
              />
              <button 
                onClick={handleAskDoubt}
                disabled={!doubtQuestion.trim() || doubtLoading}
                style={{ padding: '10px 20px', backgroundColor: '#174C7C', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', opacity: (!doubtQuestion.trim() || doubtLoading) ? 0.5 : 1 }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBatch;
