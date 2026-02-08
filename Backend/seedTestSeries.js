const mongoose = require('mongoose');
require('dotenv').config();

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  course: String
});

const Student = mongoose.model('Student', studentSchema);

const TestSeriesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  Testname: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  tests: [{
    title: { type: String, required: true },
    level: { type: String, required: true },
    questions: [{
      question: { type: String, required: true },
      options: {
        A: String,
        B: String,
        C: String,
        D: String
      },
      correctAnswer: { type: String, required: true }
    }]
  }],
  createdAt: { type: Date, default: Date.now }
});

const TestSeries = mongoose.model('TestSeries', TestSeriesSchema);

const sampleTestSeries = {
  Testname: "ReactJS Learning Test Series",
  description: "A comprehensive test series covering ReactJS from fundamental concepts to advanced topics",
  subject: "ReactJS",
  tests: [
    {
      title: "ReactJS Basic Test 1: Fundamentals",
      level: "Basic",
      questions: [
        {
          question: "What is React?",
          options: {
            A: "A JavaScript library for building user interfaces",
            B: "A database management system",
            C: "A CSS framework",
            D: "A backend framework"
          },
          correctAnswer: "A"
        },
        {
          question: "What is JSX?",
          options: {
            A: "A JavaScript extension",
            B: "A syntax extension for JavaScript",
            C: "A CSS preprocessor",
            D: "A database query language"
          },
          correctAnswer: "B"
        },
        {
          question: "Which method is used to create components in React?",
          options: {
            A: "React.createComponent()",
            B: "React.component()",
            C: "React.Component or function",
            D: "React.make()"
          },
          correctAnswer: "C"
        },
        {
          question: "What is the virtual DOM?",
          options: {
            A: "A copy of the real DOM kept in memory",
            B: "A database",
            C: "A CSS framework",
            D: "A testing tool"
          },
          correctAnswer: "A"
        },
        {
          question: "What is a React component?",
          options: {
            A: "A reusable piece of UI",
            B: "A database table",
            C: "A CSS class",
            D: "A server endpoint"
          },
          correctAnswer: "A"
        },
        {
          question: "What is props in React?",
          options: {
            A: "Properties passed to components",
            B: "A state management tool",
            C: "A routing library",
            D: "A testing framework"
          },
          correctAnswer: "A"
        },
        {
          question: "What is state in React?",
          options: {
            A: "Data that changes over time in a component",
            B: "A CSS property",
            C: "A database connection",
            D: "A routing path"
          },
          correctAnswer: "A"
        },
        {
          question: "How do you create a React app?",
          options: {
            A: "npm install react",
            B: "npx create-react-app app-name",
            C: "react new app",
            D: "npm start react"
          },
          correctAnswer: "B"
        }
      ]
    },
    {
      title: "ReactJS Basic Test 2: Event Handling & Lists",
      level: "Basic",
      questions: [
        {
          question: "How do you handle events in React?",
          options: {
            A: "Using onclick attribute",
            B: "Using onClick prop",
            C: "Using addEventListener",
            D: "Using on-click directive"
          },
          correctAnswer: "B"
        },
        {
          question: "What is the key prop used for in lists?",
          options: {
            A: "To uniquely identify elements",
            B: "To style elements",
            C: "To add animations",
            D: "To handle events"
          },
          correctAnswer: "A"
        },
        {
          question: "How do you render a list in React?",
          options: {
            A: "Using for loop",
            B: "Using map() method",
            C: "Using forEach()",
            D: "Using while loop"
          },
          correctAnswer: "B"
        },
        {
          question: "What is event.preventDefault() used for?",
          options: {
            A: "To prevent default browser behavior",
            B: "To stop event propagation",
            C: "To remove event listener",
            D: "To trigger event"
          },
          correctAnswer: "A"
        },
        {
          question: "How do you pass parameters to event handlers?",
          options: {
            A: "Using arrow functions or bind",
            B: "Using global variables",
            C: "Using localStorage",
            D: "Using cookies"
          },
          correctAnswer: "A"
        },
        {
          question: "What is synthetic event in React?",
          options: {
            A: "Cross-browser wrapper around native events",
            B: "A CSS animation",
            C: "A routing method",
            D: "A state management tool"
          },
          correctAnswer: "A"
        },
        {
          question: "How do you conditionally render elements?",
          options: {
            A: "Using if-else or ternary operators",
            B: "Using CSS display property",
            C: "Using HTML comments",
            D: "Using database queries"
          },
          correctAnswer: "A"
        },
        {
          question: "What is the purpose of fragments in React?",
          options: {
            A: "To group multiple elements without adding extra DOM nodes",
            B: "To style components",
            C: "To manage state",
            D: "To handle routing"
          },
          correctAnswer: "A"
        }
      ]
    }
  ]
};

async function seedTestSeries() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await Student.findOne();
    
    if (!user) {
      console.log('No user found. Please create a user first.');
      process.exit(1);
    }

    sampleTestSeries.userId = user._id;

    const testSeries = new TestSeries(sampleTestSeries);
    await testSeries.save();

    console.log('✅ Test series created successfully!');
    console.log('Test Series ID:', testSeries._id);
    console.log('User:', user.email);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedTestSeries();
