import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, X, AlertTriangle, Download, Phone, Heart, Moon, Baby, Coffee, Camera, Image, HelpCircle, Settings, Shield, Target, Brain, Package, Droplets, Activity, Volume2, Calendar, Search, TrendingUp, Sun, Thermometer, Smile, RotateCcw, Square, Move, Footprints, AlertCircle, CheckCircle, Milk, MessageCircle, BookOpen, FileText, Settings as SettingsIcon } from 'lucide-react';
import GrowthCharts from './components/GrowthCharts';
import AgeTimeline from './components/AgeTimeline';
import ConsolidatedAdminDashboard from './components/ConsolidatedAdminDashboard';
import SatisfactionSurvey from './components/SatisfactionSurvey';
import GrowthMeasurementModal from './components/GrowthMeasurementModal';
import InsightsDashboard from './components/InsightsDashboard';
import memoryManager from './utils/memoryManager';

// NAY-9: Legal document versions - bump these when docs are updated
export const LEGAL_VERSIONS = {
  TOS_VERSION: '1.0.0',
  PRIVACY_POLICY_VERSION: '1.0.0',
  CONSENT_VERSION: '1.0.0' // Composite version
};

// Icon mapping for string-based icon references
const iconMap = {
  Baby,
  Droplets,
  Milk,
  Moon,
  Sun,
  Thermometer,
  Smile,
  Activity,
  RotateCcw,
  Square,
  Move,
  TrendingUp,
  Footprints,
  Brain,
  Search,
  Camera,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  BookOpen,
  FileText
};

const formatBotMarkdown = (text = '') => {
  if (!text) return '';

  let cleaned = text
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();

  // Remove stage directions and formatting artifacts
  cleaned = cleaned.replace(/\*[a-z]+\*\s*/gi, ''); // Remove *smiles*, *warmly*, etc.
  cleaned = cleaned.replace(/^(hi|hello|hey)( there)?[,!]?\s*/i, '');

  // Remove Cursor-specific markdown artifacts that might interfere
  cleaned = cleaned.replace(/```[\s\S]*?```/g, ''); // Remove code blocks that might be artifacts
  cleaned = cleaned.replace(/`[^`]+`/g, ''); // Remove inline code that might be artifacts
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, ''); // Remove markdown headers that might be artifacts
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove bold markdown that might be artifacts
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // Remove italic markdown that might be artifacts

  // Normalize line breaks and convert bullet symbols
  cleaned = cleaned
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s*[•·]\s*/gm, '- ');

  // Clean up any remaining markdown artifacts
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links, keep text
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, ''); // Remove images
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '- '); // Normalize bullet points

  return cleaned;
};

const NayaCareChatbot = () => {
  console.log('🚀 NayaCareChatbot component mounting...');

  // Detect embed mode from URL parameter
  const [isEmbedMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const embedMode = params.get('embed') === 'true';
    console.log('🔍 Embed mode detection:', {
      url: window.location.href,
      search: window.location.search,
      embedParam: params.get('embed'),
      isEmbedMode: embedMode
    });
    return embedMode;
  });

  // Auto-open in embed mode - set initial state directly
  const [isOpen, setIsOpen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldAutoOpen = params.get('embed') === 'true';
    console.log('🔍 Auto-open detection:', { shouldAutoOpen });
    return shouldAutoOpen;
  });
  // Start with empty messages - will add welcome message in useEffect
  const [messages, setMessages] = useState([]);

  // Performance optimization: limit initially visible messages
  const [visibleMessageCount, setVisibleMessageCount] = useState(50);
  const MESSAGES_PER_LOAD = 20;

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // NAY-9: Consent tracking (moved AFTER authentication)
  const [hasConsented, setHasConsented] = useState(false);
  const [needsConsent, setNeedsConsent] = useState(false); // Set after auth check
  const [isCheckingConsent, setIsCheckingConsent] = useState(false);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(true); // Show auth first now

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [activeSection, setActiveSection] = useState('chat');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  // Don't auto-accept legal docs - user must view them even in embed mode
  const [legalDocsViewed, setLegalDocsViewed] = useState({
    terms: false,
    privacy: false
  });
  // Enhanced personalization state - preserving all existing design
  const [babyProfiles, setBabyProfiles] = useState([]);
  const [activeBabyProfile, setActiveBabyProfile] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [feedingLogs, setFeedingLogs] = useState([]);
  const [sleepLogs, setSleepLogs] = useState([]);
  const [diaperLogs, setDiaperLogs] = useState([]);
  const [weightLogs, setWeightLogs] = useState([]);
  const [lengthLogs, setLengthLogs] = useState([]);
  const [headCircLogs, setHeadCircLogs] = useState([]);
  const [showGrowthModal, setShowGrowthModal] = useState(false);
  const [showSleepDurationModal, setShowSleepDurationModal] = useState(false);
  const [sleepDurationInput, setSleepDurationInput] = useState({ hours: 2, minutes: 0 });

  // Keyboard shortcuts for admin features
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl+Shift+A for Admin Dashboard
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdminDashboard(true);
      }
      // Ctrl+Shift+B for Bypass consent (dev only)
      if (e.ctrlKey && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        if (!hasConsented) {
          setHasConsented(true);
          setNeedsConsent(false); // NAY-9: Also bypass needsConsent check
          setLegalDocsViewed({ terms: true, privacy: true });
          setMessages([{
            id: 1,
            text: "Hello! I'm Naya, your pregnancy and postpartum companion. Admin bypass activated - ready to assist!",
            sender: 'bot',
            timestamp: new Date()
          }]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hasConsented]);
  const [showQuickLogs, setShowQuickLogs] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatInputRef = useRef(null); // For mobile keyboard focus management
  const isUserTypingRef = useRef(false); // Track if user is actively typing to prevent auto-scroll
  const mobileScrollContainerRef = useRef(null); // Track mobile scroll position

  // Satisfaction Survey state
  const [showSurvey, setShowSurvey] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const sessionMessageCountRef = useRef(0);

  // Feature usage tracking for survey analytics
  const featureUsageRef = useRef({
    used_chat: false,
    used_feeding_log: false,
    used_sleep_log: false,
    used_diaper_log: false,
    used_growth_charts: false,
    downloaded_resource: false,
    visited_youtube: false,
    resources_viewed: [] // Track which specific resources were given/viewed
  });

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToBottom = (force = false) => {
    // Don't auto-scroll if user is actively typing (prevents mobile keyboard issues)
    if (isUserTypingRef.current && !force) {
      return;
    }

    // On mobile, only scroll on force (prevent auto-scroll glitches)
    if (isMobile && !force) {
      return;
    }

    // Use requestAnimationFrame to ensure DOM is fully rendered
    const scroll = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: force ? "instant" : "smooth",
          block: "end",
          inline: "nearest"
        });
      }
    };

    if (force) {
      // For forced scroll (on login), wait for messages to be rendered
      const waitForMessages = () => {
        const messageElements = document.querySelectorAll('[data-message-id]');
        if (messageElements.length > 0) {
          // Messages are rendered, now scroll
          requestAnimationFrame(() => {
            requestAnimationFrame(scroll);
          });
        } else {
          // Messages not rendered yet, wait a bit more
          setTimeout(waitForMessages, 100);
        }
      };
      waitForMessages();
    } else {
      // For smooth scroll (new messages), use setTimeout
      setTimeout(scroll, 100);
    }
  };

  // Auto-scroll when messages change (for new messages)
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Auto-scroll to bottom when chat opens or user logs in
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      // Force instant scroll to bottom when opening chat with existing messages
      scrollToBottom(true);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll when chat section becomes active after authentication
  useEffect(() => {
    if (activeSection === 'chat' && isAuthenticated && messages.length > 0) {
      // Force scroll to bottom when switching to chat section with existing messages
      setTimeout(() => scrollToBottom(true), 300);
    }
  }, [activeSection, isAuthenticated, messages.length]);

  // Embed mode is already auto-opened via initial state
  // Don't add welcome message here - it will be added after consent/profile setup
  useEffect(() => {
    if (isEmbedMode) {
      console.log('✅ Embed mode active - chat will open with consent modal');
    }
  }, [isEmbedMode]);

  // Listen for messages from parent window (for embed mode)
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'OPEN_CHAT') {
        console.log('📨 Received OPEN_CHAT message from parent');
        setIsOpen(true);
        setHasConsented(true);
        setLegalDocsViewed({ terms: true, privacy: true });
        setMessages([{
          id: 1,
          text: "Hello! I'm Naya, your pregnancy and postpartum companion. I'm here to provide educational support. What can I help you with today?",
          sender: 'bot',
          timestamp: new Date()
        }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Progressive Memory Initialization
  useEffect(() => {
    // CRITICAL: Clear all stored data in embed mode for privacy/HIPAA compliance
    if (isEmbedMode) {
      console.log('🧹 Clearing all stored data in embed mode for privacy');
      memoryManager.clearAllMemories?.();
      localStorage.clear();
      sessionStorage.clear();
      return; // Don't load any saved data in embed mode
    }

    // CRITICAL HIPAA FIX: Only load memory data if user is authenticated
    // This prevents loading previous user's data before login
    if (!isAuthenticated) {
      console.log('🔒 HIPAA: Not loading memory data - user not authenticated');
      return; // Don't load any saved data until authenticated
    }

    // Initialize session (only in non-embed mode)
    if (!memoryManager.getMemory('session_start')) {
      memoryManager.saveMemory('session_start', Date.now());
    }

    // DISABLED: Memory system conflicts with HubSpot user data
    // User data is now loaded from HubSpot API during authentication
    // Keeping this code commented for reference but preventing execution

    // Load user profile from memory (only in non-embed mode)
    // const savedProfile = memoryManager.getUserProfile();
    // if (savedProfile && !activeBabyProfile) {
    //   setActiveBabyProfile(savedProfile);
    // }

    // Load conversation history from memory (only in non-embed mode)
    // const conversationId = memoryManager.getMemory('current_conversation_id');
    // if (conversationId) {
    //   const savedConversation = memoryManager.getConversation(conversationId);
    //   if (savedConversation && savedConversation.messages.length > 0) {
    //     setMessages(savedConversation.messages);
    //   }
    // }

    // Cleanup expired memories
    memoryManager.cleanupExpiredMemories();
  }, [isEmbedMode, isAuthenticated]);

  // Baby age calculation utilities - preserving existing design
  const calculateBabyAge = (birthDate) => {
    if (!birthDate) {
      // Return zero age if no birth date (for unborn babies)
      return {
        days: 0,
        weeks: 0,
        remainingDays: 0,
        ageString: 'not born yet'
      };
    }

    const now = new Date();
    const birth = new Date(birthDate);
    const diffTime = Math.abs(now - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;

    return {
      days: diffDays,
      weeks: weeks,
      remainingDays: remainingDays,
      ageString: weeks > 0 ? `${weeks} week${weeks > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : `${diffDays} day${diffDays > 1 ? 's' : ''}`
    };
  };

  // Helper function to safely get baby age or pregnancy info
  const getBabyAgeOrPregnancy = (profile) => {
    if (!profile) return null;

    if (profile.isBornYet !== false) {
      // Baby is born - return age
      return calculateBabyAge(profile.birthDate);
    } else {
      // Baby not born - return pregnancy info
      const today = new Date();
      const dueDate = new Date(profile.expectedDueDate);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weeksUntilDue = Math.ceil(diffDays / 7);
      const pregnancyWeeks = 40 - weeksUntilDue; // Assuming 40 weeks full term

      return {
        days: 0,
        weeks: 0,
        remainingDays: 0,
        isPregnancy: true,
        weeksUntilDue: weeksUntilDue,
        pregnancyWeeks: Math.max(0, pregnancyWeeks),
        ageString: 'expecting'
      };
    }
  };

  const getAgeAppropriateGuidance = (ageInDays) => {
    if (ageInDays <= 7) return "newborn";
    if (ageInDays <= 28) return "early-infant";
    if (ageInDays <= 84) return "infant";
    if (ageInDays <= 168) return "older-infant";
    return "toddler";
  };

  const getMilestoneGuidance = (ageInWeeks) => {
    const milestones = [
      { week: 0, title: "Newborn", description: "Focus on feeding, sleep, and bonding", icon: "Baby", tips: ["Feed every 2-3 hours", "Sleep 14-17 hours daily", "Skin-to-skin contact"] },
      { week: 2, title: "First Smiles", description: "Social development begins", icon: "Smile", tips: ["Respond to coos", "Make eye contact", "Talk to your baby"] },
      { week: 4, title: "Head Control", description: "Tummy time becomes important", icon: "Activity", tips: ["Start tummy time", "Support head during feeding", "Watch for neck strength"] },
      { week: 8, title: "Rolling Over", description: "Increased mobility awareness", icon: "RotateCcw", tips: ["Supervise closely", "Clear safe spaces", "Encourage movement"] },
      { week: 12, title: "Sitting Up", description: "Core strength development", icon: "Square", tips: ["Support with pillows", "Practice balance", "Watch for toppling"] },
      { week: 16, title: "Crawling", description: "Exploration and independence", icon: "Move", tips: ["Baby-proof home", "Encourage exploration", "Supervise constantly"] },
      { week: 20, title: "Standing", description: "Leg strength building", icon: "TrendingUp", tips: ["Support standing", "Encourage cruising", "Watch for falls"] },
      { week: 24, title: "First Steps", description: "Walking development", icon: "Footprints", tips: ["Hold hands for support", "Celebrate attempts", "Ensure safe surfaces"] }
    ];
    
    const currentMilestone = milestones.find(m => m.week <= ageInWeeks) || milestones[0];
    const nextMilestone = milestones.find(m => m.week > ageInWeeks);
    
    return { currentMilestone, nextMilestone };
  };

  const emergencyKeywords = [
    'call 911',
    'not breathing',
    'stopped breathing',
    'turning blue',
    'blue baby',
    'seizure',
    'unconscious',
    'bleeding heavily',
    'severe chest pain',
    'fainting'
  ];

  const nonEmergencyPhrases = ['blueprint', 'plan', 'day', 'guide'];

  const checkForEmergency = (message) => {
    const normalized = message.toLowerCase();

    if (nonEmergencyPhrases.some((phrase) => normalized.includes(phrase))) {
      return false;
    }

    return emergencyKeywords.some((keyword) => normalized.includes(keyword));
  };

  const simulateTyping = () => {
    setIsTyping(true);
    // Extended timeout to cover Claude Sonnet 4.5 response time (typically 5-10 seconds)
    // This prevents jarring UI where typing indicator disappears before response arrives
    setTimeout(() => {
      setIsTyping(false);
    }, 12000); // 12 seconds to comfortably cover P95 response times
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage({
          file: file,
          preview: e.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle closing the chat - works in both embed and normal mode
  const handleCloseChat = () => {
    // Hybrid Survey Trigger Logic
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000); // seconds
    const messageCount = sessionMessageCountRef.current;
    const lastSurveyDate = localStorage.getItem('lastSurveyDate');
    const daysSinceLastSurvey = lastSurveyDate
      ? Math.floor((Date.now() - parseInt(lastSurveyDate)) / (1000 * 60 * 60 * 24))
      : 999; // Large number if never surveyed

    // Testing bypass: admin@test.com can always see the survey (no 7-day limit)
    const isTestAccount = currentUser && currentUser.email === 'admin@test.com';

    // Determine if survey should be shown
    const shouldShowSurvey =
      (messageCount >= 2 || sessionDuration >= 180) && // At least 2 messages OR 3+ minutes
      (isTestAccount || daysSinceLastSurvey >= 7) && // Test account bypasses 7-day limit
      hasConsented; // Only show to users who consented

    console.log('📊 Survey trigger check:', {
      sessionDuration,
      messageCount,
      daysSinceLastSurvey,
      isTestAccount,
      shouldShowSurvey
    });

    if (shouldShowSurvey) {
      // Show survey instead of closing immediately
      setShowSurvey(true);
    } else {
      // Close without survey
      performClose();
    }
  };

  const performClose = () => {
    if (isEmbedMode) {
      console.log('📤 Sending close message to parent window');
      window.parent.postMessage('closeNayaCareChat', '*');
    } else {
      setIsOpen(false);
    }
  };

  const handleSurveySubmit = async (surveyData) => {
    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData)
      });

      if (response.ok) {
        console.log('✅ Survey submitted successfully');
        // Update last survey date
        localStorage.setItem('lastSurveyDate', Date.now().toString());
      }
    } catch (error) {
      console.error('Failed to submit survey:', error);
    }
  };

  const handleSurveyClose = () => {
    setShowSurvey(false);
    performClose();
  };

  const sendImageWithMessage = async () => {
    if (!selectedImage && !inputValue.trim()) return;

    // Track chat usage
    featureUsageRef.current.used_chat = true;

    const textToSend = inputValue || 'What can you tell me about this photo?';
    const imageData = selectedImage;

    const userMessage = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
      image: selectedImage ? selectedImage.preview : null,
      imageName: selectedImage ? selectedImage.name : null
    };

    setMessages(prev => [...prev, userMessage]);
    setConversationHistory(prev => [...prev, textToSend]);
    const currentInput = textToSend;
    setInputValue('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Track message count for survey trigger
    sessionMessageCountRef.current += 1;

    // Save to progressive memory
    const conversationId = memoryManager.getMemory('current_conversation_id') || `conv_${Date.now()}`;
    memoryManager.saveMemory('current_conversation_id', conversationId);

    // Update conversation in memory
    const updatedMessages = [...messages, userMessage];
    const ageInfo = getBabyAgeOrPregnancy(activeBabyProfile);
    memoryManager.saveConversation(conversationId, updatedMessages, {
      babyAge: ageInfo,
      babyName: activeBabyProfile?.name,
      sessionStart: memoryManager.getMemory('session_start') || Date.now()
    });

    if (checkForEmergency(currentInput)) {
      setShowEmergencyModal(true);
    }

    // Enhanced context for AI
    const context = {
      babyAge: ageInfo,
      babyName: activeBabyProfile?.name,
      isMultiple: activeBabyProfile?.isMultiple,
      recentTopics: conversationHistory.slice(-3),
      feedingPattern: feedingLogs.slice(-5),
      sleepPattern: sleepLogs.slice(-5),
      currentMilestone: (ageInfo && !ageInfo.isPregnancy) ? getMilestoneGuidance(ageInfo.weeks).currentMilestone : null,
      isPregnancy: ageInfo?.isPregnancy || false,
      pregnancyWeeks: ageInfo?.pregnancyWeeks || null,
      weeksUntilDue: ageInfo?.weeksUntilDue || null
    };

    simulateTyping();

    try {
      const recentMessages = messages.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
        timestamp: m.timestamp
      }));

      // Prepare image data for API (extract media type from base64 string)
      let imagePayload = null;
      if (imageData && imageData.preview) {
        const mediaTypeMatch = imageData.preview.match(/^data:(image\/[a-z]+);base64,/);
        imagePayload = {
          data: imageData.preview,
          mediaType: mediaTypeMatch ? mediaTypeMatch[1] : 'image/jpeg'
        };
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          history: recentMessages,
          context: context,
          image: imagePayload, // Send image data to API
          timezoneOffset: new Date().getTimezoneOffset() // Send user's timezone offset in minutes
        })
      });

      let answerText = '';
      let canGeneratePDF = false;

      if (res.ok) {
        const data = await res.json();
        console.log('🔍 FRONTEND DEBUG - API Response (with image):', data);

        answerText = data?.answer || "I received your photo, but I'm having trouble analyzing it right now. Could you describe what you'd like me to look at?";
        canGeneratePDF = data?.canGeneratePDF || false;
      } else {
        console.log('🔍 FRONTEND DEBUG - API error with image, status:', res.status);
        answerText = "I'm having trouble processing your photo right now. Please try again or describe your concern in text.";
      }

      const botResponse = {
        id: Date.now() + 1,
        text: answerText,
        sender: 'bot',
        timestamp: new Date(),
        canGeneratePDF: canGeneratePDF
      };

      setMessages(prev => {
        const updatedMessages = [...prev, botResponse];

        // Auto-scroll to bottom after bot response
        setTimeout(() => scrollToBottom(), 100);

        // Save chat history to HubSpot (including image)
        if (currentUser && currentUser.userId) {
          fetch('/api/user/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.userId,
              chatHistory: updatedMessages.map(msg => ({
                text: msg.text,
                sender: msg.sender,
                timestamp: msg.timestamp,
                image: msg.image || null,
                imageName: msg.imageName || null
              }))
            })
          }).catch(err => console.error('Failed to save chat history:', err));
        }

        return updatedMessages;
      });
    } catch (err) {
      console.error('Error sending image message:', err);
      const errorResponse = {
        id: Date.now() + 1,
        text: "I'm having trouble right now. Please try again or describe your concern in text.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText !== null ? messageText : inputValue;
    if (!textToSend.trim()) {
      return;
    }

    // Track chat usage
    featureUsageRef.current.used_chat = true;

    const userMessage = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setConversationHistory(prev => [...prev, textToSend]);
    const currentInput = textToSend;
    setInputValue('');

    // Track message count for survey trigger
    sessionMessageCountRef.current += 1;

    // Save to progressive memory
    const conversationId = memoryManager.getMemory('current_conversation_id') || `conv_${Date.now()}`;
    memoryManager.saveMemory('current_conversation_id', conversationId);
    
    // Update conversation in memory
    const updatedMessages = [...messages, userMessage];
    const ageInfo = getBabyAgeOrPregnancy(activeBabyProfile);
    memoryManager.saveConversation(conversationId, updatedMessages, {
      babyAge: ageInfo,
      babyName: activeBabyProfile?.name,
      sessionStart: memoryManager.getMemory('session_start') || Date.now()
    });

    if (checkForEmergency(currentInput)) {
      setShowEmergencyModal(true);
    }

    // Enhanced context for AI
    const context = {
      babyAge: ageInfo,
      babyName: activeBabyProfile?.name,
      isMultiple: activeBabyProfile?.isMultiple,
      recentTopics: conversationHistory.slice(-3),
      feedingPattern: feedingLogs.slice(-5),
      sleepPattern: sleepLogs.slice(-5),
      currentMilestone: (ageInfo && !ageInfo.isPregnancy) ? getMilestoneGuidance(ageInfo.weeks).currentMilestone : null,
      isPregnancy: ageInfo?.isPregnancy || false,
      pregnancyWeeks: ageInfo?.pregnancyWeeks || null,
      weeksUntilDue: ageInfo?.weeksUntilDue || null
    };

    simulateTyping();

    try {
      const recentMessages = messages.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
        timestamp: m.timestamp
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          history: recentMessages,
          context: context, // Send baby profile context to AI
          timezoneOffset: new Date().getTimezoneOffset() // Send user's timezone offset in minutes
        })
      });

      let answerText = '';
      let canGeneratePDF = false;
      
      if (res.ok) {
        const data = await res.json();
        console.log('🔍 FRONTEND DEBUG - API Response:', data);
        console.log('🔍 FRONTEND DEBUG - data.answer:', data?.answer);
        console.log('🔍 FRONTEND DEBUG - data.answer type:', typeof data?.answer);
        console.log('🔍 FRONTEND DEBUG - data.answer length:', data?.answer?.length);
        
        answerText = data?.answer || generateMockResponse(currentInput);
        canGeneratePDF = data?.canGeneratePDF || false;
        
        console.log('🔍 FRONTEND DEBUG - Final answerText:', answerText);
        console.log('🔍 FRONTEND DEBUG - answerText type:', typeof answerText);
      } else {
        console.log('🔍 FRONTEND DEBUG - API not ok, status:', res.status);
        answerText = generateMockResponse(currentInput);
      }

      const botResponse = {
        id: Date.now() + 1,
        text: answerText,
        sender: 'bot',
        timestamp: new Date(),
        canGeneratePDF: canGeneratePDF
      };
      setMessages(prev => {
        const updatedMessages = [...prev, botResponse];

        // Auto-scroll to bottom after bot response
        setTimeout(() => scrollToBottom(), 100);

        // Save chat history to HubSpot
        if (currentUser && currentUser.userId) {
          fetch('/api/user/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.userId,
              chatHistory: updatedMessages
            })
          }).then(() => {
            console.log('Chat history saved to HubSpot');
          }).catch(err => {
            console.error('Failed to save chat history:', err);
          });
        }

        return updatedMessages;
      });

      // Update memory with bot response
      const finalMessages = [...messages, userMessage, botResponse];
      memoryManager.saveConversation(conversationId, finalMessages, {
        babyAge: ageInfo,
        babyName: activeBabyProfile?.name,
        sessionStart: memoryManager.getMemory('session_start') || Date.now()
      });

      // Save learning data
      memoryManager.saveLearning({
        userInput: currentInput,
        botResponse: answerText,
        context: {
          babyAge: ageInfo,
          conversationLength: messages.length
        }
      });
    } catch (e) {
      const botResponse = {
        id: Date.now() + 1,
        text: generateMockResponse(currentInput),
        sender: 'bot',
        timestamp: new Date(),
        canGeneratePDF: false // PDF only offered by AI discretion, not automatically
      };
      setMessages(prev => [...prev, botResponse]);
    } finally {
      // Always reset typing state
      setIsTyping(false);
    }
  };

  const generateMockResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('spitting up') || lowerInput.includes('spit up')) {
      return "Spitting up is very common in newborns and usually not concerning. Normal spit-up is typically small amounts of milk that come up easily without force.\n\nWhat to watch for:\n• Projectile vomiting\n• Blood in spit-up\n• Signs of dehydration\n• Poor weight gain\n\nTips from Dr. Sonal Patel:\n• Keep baby upright for 20-30 minutes after feeding\n• Burp frequently during feeds\n• Avoid overfeeding\n\nRemember: this guidance doesn't replace medical care - contact Dr. Sonal Patel's office for specific concerns about your baby.";
    }
    
    if (lowerInput.includes('sleep') || lowerInput.includes('sleeping')) {
      return "Newborn sleep patterns are irregular in the first few months. Babies typically sleep 14-17 hours per day but wake every 2-3 hours for feeding.\n\nSafe sleep practices:\n• Always place baby on their back\n• Use a firm mattress\n• No loose bedding, pillows, or toys\n• Room-share but not bed-share\n\nNormal sleep patterns by age:\n• 0-2 months: 14-17 hours total\n• 2-4 months: 12-16 hours total\n\nIf you're concerned about your baby's sleep or breathing patterns, please contact your pediatrician.";
    }

    if (lowerInput.includes('feeding') || lowerInput.includes('breastfeeding')) {
      return "Newborns typically feed 8-12 times per day. Every baby is different, and cluster feeding is normal.\n\nSigns of good feeding:\n• 6+ wet diapers per day after day 4\n• Regular bowel movements\n• Weight gain after initial loss\n• Baby seems satisfied after feeds\n\nCommon concerns:\n• Latch difficulties\n• Nipple pain\n• Milk supply worries\n• Growth spurts\n\nContact Dr. Sonal Patel's office for personalized feeding guidance.";
    }

    return "Thank you for your question. I'm here to provide educational information about newborn and postpartum care based on Dr. Sonal Patel's guidance.\n\nBased on your question, I can help with:\n• Newborn care basics\n• Feeding support\n• Sleep guidance\n• Postpartum recovery\n• Common concerns\n\nFor the most accurate and personalized advice about your specific situation, please contact Dr. Sonal Patel's office directly. This chat doesn't replace medical care.";
  };

  const mockResources = [
    { 
      id: 1, 
      title: "Newborn Sleep Guide", 
      category: "Sleep", 
      description: "Complete guide to safe sleep practices",
      icon: Moon,
      downloadCount: "2.3k downloads"
    },
    { 
      id: 2, 
      title: "Breastfeeding Basics", 
      category: "Feeding", 
      description: "Comprehensive breastfeeding guide",
      icon: Baby,
      downloadCount: "3.1k downloads"
    },
    { 
      id: 3, 
      title: "Postpartum Recovery Timeline", 
      category: "Recovery", 
      description: "Week-by-week healing guide",
      icon: Heart,
      downloadCount: "1.8k downloads"
    },
    { 
      id: 4, 
      title: "When to Call the Doctor", 
      category: "Emergency", 
      description: "Red flag symptoms guide",
      icon: Phone,
      downloadCount: "4.2k downloads"
    },
    { 
      id: 5, 
      title: "4th Trimester Nutrition", 
      category: "Wellness", 
      description: "Nutrition guide for recovery",
      icon: Coffee,
      downloadCount: "1.5k downloads"
    },
    {
      id: 6,
      title: "Diaper Rash Prevention & Care",
      category: "Skin Care",
      description: "Complete guide to healthy baby skin",
      icon: Shield,
      downloadCount: "2.1k downloads"
    },
    {
      id: 7,
      title: "Tummy Time Progression Guide",
      category: "Development",
      description: "Month-by-month developmental milestones",
      icon: Target,
      downloadCount: "1.9k downloads"
    },
    {
      id: 8,
      title: "Postpartum Depression Screening",
      category: "Mental Health",
      description: "Warning signs and support resources",
      icon: Brain,
      downloadCount: "2.7k downloads"
    },
    {
      id: 9,
      title: "Pumping & Milk Storage",
      category: "Feeding",
      description: "Complete pumping schedule and storage guide",
      icon: Package,
      downloadCount: "3.4k downloads"
    },
    {
      id: 10,
      title: "Newborn Bath Time Safety",
      category: "Care Basics",
      description: "Step-by-step bathing instructions",
      icon: Droplets,
      downloadCount: "1.6k downloads"
    },
    {
      id: 11,
      title: "C-Section Recovery Timeline",
      category: "Recovery",
      description: "Week-by-week healing expectations",
      icon: Activity,
      downloadCount: "2.8k downloads"
    },
    {
      id: 12,
      title: "Colic & Crying Patterns",
      category: "Behavior",
      description: "Understanding and soothing techniques",
      icon: Volume2,
      downloadCount: "3.2k downloads"
    },
    {
      id: 13,
      title: "Vaccine Schedule 0-12 Months",
      category: "Health",
      description: "Complete immunization timeline",
      icon: Calendar,
      downloadCount: "4.5k downloads"
    }
    
  ];

  const quickTopics = [
    { icon: "Droplets", text: "Breastfeeding help", topic: "breastfeeding" },
    { icon: "Moon", text: "Sleep concerns", topic: "sleep" },
    { icon: "Milk", text: "Bottle feeding", topic: "bottle" },
    { icon: "Sun", text: "Jaundice info", topic: "jaundice" },
    { icon: "Thermometer", text: "Fever guidelines", topic: "fever" },
    { icon: "Baby", text: "Diaper changes", topic: "diaper" }
  ];

  const ProfileManagerModal = () => {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    };

    const handleSelectProfile = (profile) => {
      setActiveBabyProfile(profile);
      setShowProfileManager(false);
    };

    const handleAddProfile = () => {
      setShowProfileManager(false);
      setShowProfileSetup(true);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
          <h2 className="text-2xl font-bold text-pink-600 mb-4 text-center">Your Profiles</h2>
          <p className="text-gray-600 text-center mb-6">Select a profile to continue</p>

          <div className="space-y-3 mb-6">
            {babyProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleSelectProfile(profile)}
                className="w-full bg-pink-50 hover:bg-pink-100 border-2 border-pink-200 hover:border-pink-400 rounded-xl p-4 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">{profile.name}</p>
                    <p className="text-gray-600 text-sm">{formatDate(profile.birthDate)}</p>
                  </div>
                  <Baby className="text-pink-400" size={24} />
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleAddProfile}
            className="w-full bg-white border-2 border-pink-400 text-pink-600 hover:bg-pink-50 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Another Profile
          </button>
        </div>
      </div>
    );
  };

  const BabyProfileSetup = () => {
    const [profileData, setProfileData] = useState({
      name: '',
      birthDate: '',
      expectedDueDate: '',
      isBornYet: true,  // Default to baby already born
      relation: '',  // Mother, Father, Other
      customRelation: '',  // If "Other" is selected
      isMultiple: false,
      numberOfBabies: 1
    });

    const handleSaveProfile = async () => {
      // Validate required fields based on whether baby is born
      if (!profileData.name) return;
      if (!profileData.relation) return;
      if (profileData.relation === 'other' && !profileData.customRelation) return;
      if (profileData.isBornYet && !profileData.birthDate) return;
      if (!profileData.isBornYet && !profileData.expectedDueDate) return;

      const newProfile = {
        id: Date.now(),
        name: profileData.name,
        birthDate: profileData.isBornYet ? profileData.birthDate : null,
        expectedDueDate: !profileData.isBornYet ? profileData.expectedDueDate : null,
        isBornYet: profileData.isBornYet,
        relation: profileData.relation,
        customRelation: profileData.relation === 'other' ? profileData.customRelation : null,
        isMultiple: profileData.isMultiple,
        numberOfBabies: profileData.numberOfBabies,
        createdAt: new Date()
      };

      const updatedProfiles = [...babyProfiles, newProfile];
      setBabyProfiles(updatedProfiles);
      setActiveBabyProfile(newProfile);
      setShowProfileSetup(false);

      // Save baby profile to HubSpot if user is authenticated
      if (currentUser && currentUser.userId) {
        try {
          await fetch('/api/user/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.userId,
              babyProfiles: updatedProfiles
            })
          });
          console.log('Baby profile saved to HubSpot');
        } catch (err) {
          console.error('Failed to save baby profile:', err);
        }
      }

      // Add personalized welcome message based on whether baby is born
      if (profileData.isBornYet) {
        const age = calculateBabyAge(profileData.birthDate);
        const relationText = profileData.relation === 'mother' ? "mom" :
                            profileData.relation === 'father' ? "dad" :
                            profileData.customRelation || "caregiver";
        const welcomeMessage = {
          id: Date.now(),
          text: `Welcome! My name is Naya and I'll be your postpartum companion. I see you're ${profileData.name}'s ${relationText}, and your little one is ${age.ageString} old. I'll provide age-appropriate guidance for your ${age.weeks < 4 ? 'newborn' : 'baby'}. What can I help you with today?`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, welcomeMessage]);
      } else {
        // Calculate weeks until due date
        const today = new Date();
        const dueDate = new Date(profileData.expectedDueDate);
        const weeksUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24 * 7));
        const relationText = profileData.relation === 'mother' ? "an expecting mom" :
                            profileData.relation === 'father' ? "an expecting dad" :
                            "expecting a baby";
        const welcomeMessage = {
          id: Date.now(),
          text: `Welcome! My name is Naya and I'll be your pregnancy and postpartum companion. I see you're ${relationText} with ${profileData.name} due in about ${weeksUntilDue} weeks. I'm here to help you prepare for the arrival and support you through the postpartum period. What can I help you with today?`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, welcomeMessage]);
      }
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-pink-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-pink-100 p-3 rounded-full mr-3">
              <Baby className="w-8 h-8 text-pink-500" />
          </div>
          <div>
              <h3 className="text-2xl font-bold text-gray-800">Set Up Your Baby's Profile</h3>
              <p className="text-pink-600 font-medium">Personalized guidance for your little one</p>
          </div>
        </div>
        
          <div className="space-y-6">
            {/* Your Relation to Baby */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Relationship to the Baby
              </label>
              <select
                value={profileData.relation}
                onChange={(e) => setProfileData(prev => ({ ...prev, relation: e.target.value, customRelation: '' }))}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-400 transition-all duration-200"
              >
                <option value="">Select your relationship</option>
                <option value="mother">Mother</option>
                <option value="father">Father</option>
                <option value="other">Other (please specify)</option>
              </select>

              {/* Show custom relation input if "Other" is selected */}
              {profileData.relation === 'other' && (
                <input
                  type="text"
                  placeholder="Please specify your relationship (e.g., grandmother, aunt, nanny)"
                  value={profileData.customRelation}
                  onChange={(e) => setProfileData(prev => ({ ...prev, customRelation: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-400 transition-all duration-200 mt-2"
                />
              )}
            </div>

            {/* Baby's Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Baby's Name {!profileData.isBornYet && "(or nickname for now)"}
              </label>
              <input
                type="text"
                placeholder={profileData.isBornYet ? "Enter baby's name" : "Enter baby's name or nickname"}
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-400 transition-all duration-200"
              />
            </div>

            {/* Baby Born Yet Checkbox */}
            <div className="bg-pink-50 p-4 rounded-lg">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!profileData.isBornYet}
                  onChange={(e) => setProfileData(prev => ({ ...prev, isBornYet: !e.target.checked }))}
                  className="mr-3 w-5 h-5 text-pink-400 rounded focus:ring-pink-400"
                />
                <span className="text-sm font-medium text-gray-700">
                  Baby is not born yet (I'm expecting)
                </span>
              </label>
            </div>

            {/* Birth Date or Due Date based on checkbox */}
            {profileData.isBornYet ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={profileData.birthDate}
                  onChange={(e) => setProfileData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-400 transition-all duration-200"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Due Date
                </label>
                <input
                  type="date"
                  value={profileData.expectedDueDate}
                  onChange={(e) => setProfileData(prev => ({ ...prev, expectedDueDate: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-400 transition-all duration-200"
                />
              </div>
            )}

            {/* Number of Babies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Babies
              </label>
              <select
                value={profileData.numberOfBabies}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  numberOfBabies: parseInt(e.target.value),
                  isMultiple: parseInt(e.target.value) > 1
                }))}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-400 transition-all duration-200"
              >
                <option value={1}>Single Baby</option>
                <option value={2}>Twins</option>
                <option value={3}>Triplets</option>
                <option value={4}>Quadruplets</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowProfileSetup(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
              >
                Skip for Now
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={
                  !profileData.name ||
                  !profileData.relation ||
                  (profileData.relation === 'other' && !profileData.customRelation) ||
                  (profileData.isBornYet && !profileData.birthDate) ||
                  (!profileData.isBornYet && !profileData.expectedDueDate)
                }
                className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-300 to-pink-400 text-white rounded-lg hover:from-pink-400 hover:to-pink-500 font-semibold transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handle saving growth measurements
  const handleSaveGrowthMeasurement = async (measurement) => {
    // Track feature usage
    featureUsageRef.current.used_growth_charts = true;

    if (!currentUser || !currentUser.userId) {
      console.error('No user ID available');
      return;
    }

    try {
      // Determine which log array to update based on measurement type
      let updatedLogs;
      let logType;

      if (measurement.type === 'weight') {
        updatedLogs = [...weightLogs, measurement];
        setWeightLogs(updatedLogs);
        logType = 'weightLogs';
      } else if (measurement.type === 'length') {
        updatedLogs = [...lengthLogs, measurement];
        setLengthLogs(updatedLogs);
        logType = 'lengthLogs';
      } else if (measurement.type === 'headCircumference') {
        updatedLogs = [...headCircLogs, measurement];
        setHeadCircLogs(updatedLogs);
        logType = 'headCircLogs';
      }

      // Save to HubSpot
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          [logType]: updatedLogs
        })
      });

      if (response.ok) {
        console.log(`✅ ${measurement.type} measurement saved to HubSpot`);
      } else {
        throw new Error(`Failed to save ${measurement.type} measurement`);
      }
    } catch (err) {
      console.error('Failed to save growth measurement:', err);
      throw err; // Re-throw to let modal handle error display
    }
  };

  // Sleep logging function - in main component scope for modal access
  const handleSaveSleepLog = async (hours, minutes) => {
    const now = new Date();
    const durationInMinutes = (hours * 60) + minutes;
    const newLog = {
      id: Date.now(),
      time: now,
      timestamp: now,
      type: 'sleep',
      duration: durationInMinutes,
      babyId: activeBabyProfile?.id
    };
    const updatedLogs = [...sleepLogs, newLog];
    setSleepLogs(updatedLogs);
    setShowSleepDurationModal(false);

    // Reset sleep duration input to default
    setSleepDurationInput({ hours: 2, minutes: 0 });

    // Save to HubSpot
    if (currentUser && currentUser.userId) {
      try {
        await fetch('/api/user/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.userId,
            sleepLogs: updatedLogs
          })
        });
        console.log('Sleep log saved to HubSpot');
      } catch (err) {
        console.error('Failed to save sleep log:', err);
      }
    }
  };

  const QuickLogButtons = () => {
    const [justLogged, setJustLogged] = useState(null);

    const showLoggedFeedback = (type) => {
      setJustLogged(type);
      setTimeout(() => setJustLogged(null), 2000);
    };

    const logFeeding = async () => {
      // Track feature usage
      featureUsageRef.current.used_feeding_log = true;

      const now = new Date();
      const newLog = {
        id: Date.now(),
        time: now,
        timestamp: now, // Added for InsightsDashboard compatibility
        type: 'feeding',
        babyId: activeBabyProfile?.id
      };
      const updatedLogs = [...feedingLogs, newLog];
      setFeedingLogs(updatedLogs);
      showLoggedFeedback('feeding');

      // Save to HubSpot
      if (currentUser && currentUser.userId) {
        try {
          await fetch('/api/user/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.userId,
              feedingLogs: updatedLogs
            })
          });
          console.log('Feeding log saved to HubSpot');
        } catch (err) {
          console.error('Failed to save feeding log:', err);
        }
      }
    };

    const logSleep = () => {
      // Track feature usage
      featureUsageRef.current.used_sleep_log = true;

      // Open modal to input sleep duration
      setShowSleepDurationModal(true);
    };

    const logDiaper = async (diaperType) => {
      // Track feature usage
      featureUsageRef.current.used_diaper_log = true;

      const now = new Date();
      const newLog = {
        id: Date.now(),
        time: now,
        timestamp: now,
        type: diaperType, // 'wet', 'dirty', or 'both'
        babyId: activeBabyProfile?.id
      };
      const updatedLogs = [...diaperLogs, newLog];
      setDiaperLogs(updatedLogs);
      showLoggedFeedback(diaperType);

      // Save to HubSpot
      if (currentUser && currentUser.userId) {
        try {
          await fetch('/api/user/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.userId,
              diaperLogs: updatedLogs
            })
          });
          console.log('Diaper log saved to HubSpot');
        } catch (err) {
          console.error('Failed to save diaper log:', err);
        }
      }
    };

    return (
      <div className="bg-gradient-to-br from-pink-50 via-white to-blue-50 p-6 rounded-xl border-2 border-pink-200 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-pink-500" />
          Quick Log
        </h3>

        {/* Feeding & Sleep */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Feeding & Sleep</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={logFeeding}
              className={`px-4 py-3 bg-white border-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-center shadow-sm hover:shadow-md ${
                justLogged === 'feeding'
                  ? 'border-pink-500 bg-pink-50 scale-95'
                  : 'border-pink-200 hover:border-pink-400 text-gray-700'
              }`}
            >
              {justLogged === 'feeding' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-pink-500" />
                  <span className="text-pink-700">Logged!</span>
                </>
              ) : (
                <>
                  <Droplets className="w-4 h-4 mr-2 text-pink-500" />
                  Log Feeding
                </>
              )}
            </button>
            <button
              onClick={logSleep}
              className={`px-4 py-3 bg-white border-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-center shadow-sm hover:shadow-md ${
                justLogged === 'sleep'
                  ? 'border-blue-500 bg-blue-50 scale-95'
                  : 'border-blue-200 hover:border-blue-400 text-gray-700'
              }`}
            >
              {justLogged === 'sleep' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="text-blue-700">Logged!</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2 text-blue-500" />
                  Log Sleep
                </>
              )}
            </button>
          </div>
        </div>

        {/* Diaper Changes */}
        <div>
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Diaper Changes</h4>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => logDiaper('wet')}
              className={`px-4 py-3 bg-white border-2 rounded-lg transition-all duration-200 text-sm font-medium flex flex-col items-center justify-center shadow-sm hover:shadow-md ${
                justLogged === 'wet'
                  ? 'border-blue-500 bg-blue-50 scale-95'
                  : 'border-blue-200 hover:border-blue-400 text-gray-700'
              }`}
            >
              {justLogged === 'wet' ? (
                <>
                  <CheckCircle className="w-5 h-5 mb-1 text-blue-500" />
                  <span className="text-xs text-blue-700 font-semibold">Logged!</span>
                </>
              ) : (
                <>
                  <Droplets className="w-5 h-5 mb-1 text-blue-500" />
                  <span>Wet</span>
                </>
              )}
            </button>
            <button
              onClick={() => logDiaper('dirty')}
              className={`px-4 py-3 bg-white border-2 rounded-lg transition-all duration-200 text-sm font-medium flex flex-col items-center justify-center shadow-sm hover:shadow-md ${
                justLogged === 'dirty'
                  ? 'border-amber-500 bg-amber-50 scale-95'
                  : 'border-amber-200 hover:border-amber-400 text-gray-700'
              }`}
            >
              {justLogged === 'dirty' ? (
                <>
                  <CheckCircle className="w-5 h-5 mb-1 text-amber-500" />
                  <span className="text-xs text-amber-700 font-semibold">Logged!</span>
                </>
              ) : (
                <>
                  <Baby className="w-5 h-5 mb-1 text-amber-500" />
                  <span>Dirty</span>
                </>
              )}
            </button>
            <button
              onClick={() => logDiaper('both')}
              className={`px-4 py-3 bg-white border-2 rounded-lg transition-all duration-200 text-sm font-medium flex flex-col items-center justify-center shadow-sm hover:shadow-md ${
                justLogged === 'both'
                  ? 'border-purple-500 bg-purple-50 scale-95'
                  : 'border-purple-200 hover:border-purple-400 text-gray-700'
              }`}
            >
              {justLogged === 'both' ? (
                <>
                  <CheckCircle className="w-5 h-5 mb-1 text-purple-500" />
                  <span className="text-xs text-purple-700 font-semibold">Logged!</span>
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5 mb-1 text-purple-500" />
                  <span>Both</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CareTimeline = () => {
    if (!activeBabyProfile) return null;

    const ageInfo = getBabyAgeOrPregnancy(activeBabyProfile);

    // Don't show milestones for unborn babies
    if (ageInfo?.isPregnancy) {
      return (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            Pregnancy Timeline
          </h4>
          <div className="text-xs text-gray-600">
            <p className="mb-2">You are approximately {ageInfo.pregnancyWeeks} weeks pregnant</p>
            <p>{ageInfo.weeksUntilDue > 0 ? `${ageInfo.weeksUntilDue} weeks until due date` : 'Due date approaching!'}</p>
          </div>
        </div>
      );
    }

    const { currentMilestone, nextMilestone } = getMilestoneGuidance(ageInfo.weeks);
    
    return (
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
          Development Timeline
        </h4>
               <div className="text-xs text-gray-600">
                 <div className="mb-2">
                   <p className="font-medium text-blue-800 flex items-center">
                     <div className="mr-2 p-1 rounded-full bg-blue-100">
                       {(() => {
                         const IconComponent = iconMap[currentMilestone.icon];
                         return IconComponent ? <IconComponent className="w-3 h-3 text-blue-600" /> : null;
                       })()}
                     </div>
                     Current: {currentMilestone.title}
                   </p>
                   <p className="ml-6">{currentMilestone.description}</p>
                 </div>
                 {nextMilestone && (
                   <div>
                     <p className="text-blue-600 font-medium">
                       Next: {nextMilestone.title} (around {nextMilestone.week} weeks)
                     </p>
                     <p className="text-blue-500">{nextMilestone.description}</p>
                   </div>
                 )}
               </div>
      </div>
    );
  };

  const ConsentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl max-w-xl w-full p-2 sm:p-6 shadow-2xl border border-pink-100 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-center mb-2 sm:mb-6">
          <div className="bg-pink-100 p-2 sm:p-3 rounded-full mr-2 sm:mr-3">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500" />
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Welcome to Your Pregnancy & Postpartum Companion</h3>
            <p className="text-sm sm:text-base text-pink-600 font-medium">Naya: Dr. Sonal Patel's Trusted Guidance</p>
          </div>
        </div>
        
        <div className="space-y-1 sm:space-y-4 text-gray-700 mb-2 sm:mb-6">
          <div className="bg-white p-1.5 sm:p-4 rounded-lg shadow-sm border border-pink-100">
            <p className="text-sm sm:text-base font-semibold text-gray-800 mb-2">
              🌸 This chat provides educational guidance only and does not replace medical care
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              I'm here to share Dr. Patel's expertise on newborn care, feeding, sleep, and postpartum wellness to support you during this precious time.
            </p>
          </div>
          
          <div className="bg-red-50 p-1.5 sm:p-4 rounded-lg border-l-4 border-red-400 shadow-sm">
            <div className="flex items-center mb-1">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2" />
              <p className="font-bold text-red-800 text-sm sm:text-base">Medical Emergencies</p>
            </div>
            <p className="text-red-700 text-xs sm:text-sm font-medium">
              Call 911 immediately or go to your nearest emergency room
            </p>
          </div>

          <div className="bg-pink-50 p-1.5 sm:p-4 rounded-lg shadow-sm border border-pink-200">
            <p className="font-semibold text-pink-800 mb-2 text-xs sm:text-sm">This service provides:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
              {['Newborn care guidance', 'Feeding support', 'Sleep guidance', 'Postpartum wellness', 'Red flag identification', 'Downloadable resources'].map(item => (
                <div key={item} className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mr-2 flex-shrink-0"></div>
                  <span className="text-xs">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-600 bg-white p-1.5 rounded-lg border border-gray-200">
            <strong>Privacy:</strong> Your conversations are kept confidential and may be reviewed only for quality improvement. No personal health information is required to use this service.
          </div>

          {/* Legal Links */}
          <div className="bg-white p-1.5 sm:p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-2 text-center">
              <strong>Legal:</strong> By using this service, you agree to our:
            </p>
            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setLegalDocsViewed(prev => ({ ...prev, terms: true }));
                  const termsWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                  termsWindow.document.write(`
                    <html>
                      <head><title>Terms of Service - Dr. Sonal Patel's 4th Trimester Guide</title></head>
                      <body style="margin:0; padding:20px; font-family: system-ui, sans-serif;">
                        <div style="max-width: 800px; margin: 0 auto;">
                          <h1 style="color: #ec4899; border-bottom: 2px solid #f472b6; padding-bottom: 10px;">Terms of Service</h1>
                          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                            <h2 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ Important Medical Disclaimer</h2>
                            <p style="color: #dc2626; margin: 0; font-weight: 500;">This service provides educational information only and does not replace professional medical care. Always consult with your healthcare provider for medical advice, diagnosis, or treatment.</p>
                          </div>
                          <h3>1. Service Description</h3>
                          <p>Dr. Sonal Patel's 4th Trimester Guide is an educational chatbot designed to provide general information about postpartum care, newborn care, and related topics. This service is intended for educational purposes only and does not constitute medical advice, diagnosis, or treatment.</p>
                          <h3>2. Medical Disclaimer</h3>
                          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <p style="font-weight: 600; color: #92400e; margin: 0 0 10px 0;">Important Limitations:</p>
                            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                              <li>This service does not replace professional medical care</li>
                              <li>Information provided is general and educational only</li>
                              <li>Always consult your healthcare provider for medical concerns</li>
                              <li>In case of emergency, call 911 immediately</li>
                              <li>Do not delay seeking medical care based on information from this service</li>
                            </ul>
                          </div>
                          <h3>3. User Responsibilities</h3>
                          <p>By using this service, you agree to use it for educational purposes only, not rely on it for medical diagnosis or treatment, seek professional medical care when needed, and respect the educational nature of the content.</p>
                          <h3>4. Limitation of Liability</h3>
                          <p>Dr. Sonal Patel and associated parties shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from the use of this service.</p>
                          <h3>5. Contact Information</h3>
                          <p>For questions about these terms or the service, please contact Dr. Sonal Patel's office directly. This service is provided as a supplement to, not a replacement for, professional medical care.</p>
                          <div style="background: #fdf2f8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                            <p style="margin: 0 0 15px 0; font-weight: 600;">By using this service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
                            <button onclick="window.close()" style="background: linear-gradient(to right, #f472b6, #ec4899); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">I Accept These Terms</button>
                          </div>
                        </div>
                      </body>
                    </html>
                  `);
                }}
                className={`w-full sm:flex-1 px-4 py-1.5 sm:py-2.5 rounded-lg font-medium transition-all duration-200 text-sm shadow-sm ${
                  legalDocsViewed.terms
                    ? 'bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600'
                    : 'bg-gradient-to-r from-pink-300 to-pink-400 text-white hover:from-pink-400 hover:to-pink-500'
                }`}
              >
                {legalDocsViewed.terms ? '✓ Terms of Service' : 'Terms of Service'}
              </button>
              <button
                onClick={() => {
                  setLegalDocsViewed(prev => ({ ...prev, privacy: true }));
                  const privacyWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                  privacyWindow.document.write(`
                    <html>
                      <head><title>Privacy Policy - Dr. Sonal Patel's 4th Trimester Guide</title></head>
                      <body style="margin:0; padding:20px; font-family: system-ui, sans-serif;">
                        <div style="max-width: 800px; margin: 0 auto;">
                          <h1 style="color: #ec4899; border-bottom: 2px solid #f472b6; padding-bottom: 10px;">Privacy Policy</h1>
                          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                            <h2 style="color: #1d4ed8; margin: 0 0 10px 0;">🔒 Your Privacy Matters</h2>
                            <p style="color: #1d4ed8; margin: 0; font-weight: 500;">We are committed to protecting your privacy and personal information. This policy explains how we collect, use, and safeguard your data when using our educational service.</p>
                          </div>
                          <h3>1. Information We Collect</h3>
                          <p>We collect chat messages for educational responses, usage data for service improvement, and technical information for security purposes. No personal health information is required to use this service.</p>
                          <h3>2. How We Use Your Information</h3>
                          <p>We use your information to provide educational responses, improve service quality, ensure security, and comply with legal requirements. We do not sell or share your personal information.</p>
                          <h3>3. Data Protection</h3>
                          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <p style="font-weight: 600; color: #166534; margin: 0 0 10px 0;">🔒 Security Features:</p>
                            <ul style="color: #166534; margin: 0; padding-left: 20px;">
                              <li>Encryption in transit (TLS/SSL)</li>
                              <li>Secure data storage with access controls</li>
                              <li>Data minimization practices</li>
                              <li>Limited access to personal information</li>
                            </ul>
                          </div>
                          <h3>4. Data Retention</h3>
                          <p>We retain your data for up to 7 days unless you consent to longer retention for service improvement purposes.</p>
                          <h3>5. Your Rights</h3>
                          <p>You have the right to access, correct, delete your data, withdraw consent, and lodge complaints with supervisory authorities.</p>
                          <h3>6. Contact Us</h3>
                          <p>If you have questions about this Privacy Policy, please contact Dr. Sonal Patel's office directly.</p>
                          <div style="background: #fdf2f8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                            <p style="margin: 0 0 15px 0; font-weight: 600;">By using this service, you acknowledge that you have read and understood this Privacy Policy.</p>
                            <button onclick="window.close()" style="background: linear-gradient(to right, #f472b6, #ec4899); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">I Accept This Policy</button>
                          </div>
                        </div>
                      </body>
                    </html>
                  `);
                }}
                className={`w-full sm:flex-1 px-4 py-1.5 sm:py-2.5 rounded-lg font-medium transition-all duration-200 text-sm shadow-sm ${
                  legalDocsViewed.privacy
                    ? 'bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600'
                    : 'bg-gradient-to-r from-pink-300 to-pink-400 text-white hover:from-pink-400 hover:to-pink-500'
                }`}
              >
                {legalDocsViewed.privacy ? '✓ Privacy Policy' : 'Privacy Policy'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleCloseChat}
            className="w-full sm:flex-1 px-4 py-1.5 sm:py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200 text-sm"
          >
            Not Now
          </button>
          <button
            onClick={handleConsentAccept}
            disabled={!legalDocsViewed.terms || !legalDocsViewed.privacy}
            className={`w-full sm:flex-1 px-4 py-1.5 sm:py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-lg text-sm ${
              legalDocsViewed.terms && legalDocsViewed.privacy
                ? 'bg-gradient-to-r from-pink-300 to-pink-400 text-white hover:from-pink-400 hover:to-pink-500 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {legalDocsViewed.terms && legalDocsViewed.privacy 
              ? 'I Understand & Continue' 
              : 'Please Read Legal Documents First'
            }
          </button>
        </div>

        {/* Admin Bypass Button - Small and subtle */}
        {/* Hidden admin bypass - accessible via Ctrl+Shift+B keyboard shortcut only */}
      </div>
    </div>
  );

  const EmergencyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
        <div className="flex items-center justify-center mb-4">
          <Phone className="w-8 h-8 text-red-500 mr-3" />
          <h3 className="text-xl font-bold text-red-600">Emergency Detected</h3>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="font-bold text-red-800 mb-2">🚨 If this is an emergency:</p>
            <p className="text-red-700">Call 911 immediately</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowEmergencyModal(false)}
            className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Continue Chat
          </button>
          <a
            href="tel:911"
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-center hover:bg-red-700"
          >
            📞 Call 911
          </a>
        </div>
      </div>
    </div>
  );

  // Appointment Booking Modal (Coming Soon)
  const AppointmentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-pink-500 mr-3" />
          <h3 className="text-xl font-bold text-gray-800">Telehealth Appointments</h3>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-pink-50 p-4 rounded-lg text-center">
            <p className="text-lg font-semibold text-pink-800 mb-2">Coming Soon! 🎉</p>
            <p className="text-gray-700 text-sm">
              Dr. Patel is setting up online scheduling for telehealth appointments.
              This feature will be available shortly.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-800 mb-2">In the meantime:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Continue using the chat for guidance</li>
              <li>• For urgent needs, contact the office directly</li>
              <li>• Check back soon for online booking</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-pink-100 to-pink-50 p-3 rounded-lg">
            <p className="text-xs text-pink-800">
              <strong>Note:</strong> Once available, you'll be able to schedule video consultations
              directly with Dr. Patel through this button.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAppointmentModal(false)}
          className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 transition-all duration-200"
        >
          Got it, I'll check back later
        </button>
      </div>
    </div>
  );

  // NAY-9: Check if user needs to accept consent
  const checkConsentStatus = async (userEmail) => {
    try {
      setIsCheckingConsent(true);
      const response = await fetch(`/api/consent/status?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();

      if (response.ok) {
        setNeedsConsent(data.needsConsent);
        console.log(`Consent check: ${data.needsConsent ? 'User needs consent' : 'Already consented'} (${data.reason})`);
      } else {
        console.error('Failed to check consent status:', data.error);
        // Default to requiring consent if check fails (safer)
        setNeedsConsent(true);
      }
    } catch (error) {
      console.error('Error checking consent status:', error);
      // Default to requiring consent if check fails (safer)
      setNeedsConsent(true);
    } finally {
      setIsCheckingConsent(false);
    }
  };

  // NAY-9: Handle consent acceptance
  const handleConsentAccept = async () => {
    console.log('🔍 handleConsentAccept called');
    console.log('🔍 currentUser:', currentUser);
    console.log('🔍 currentUser.email:', currentUser?.email);
    console.log('🔍 window._tempUserEmail:', window._tempUserEmail);
    console.log('🔍 legalDocsViewed:', legalDocsViewed);

    // Use currentUser.email, fallback to the email passed during checkConsentStatus
    const userEmail = currentUser?.email || window._tempUserEmail;
    console.log('🔍 Final userEmail to use:', userEmail);

    if (!userEmail) {
      console.error('❌ No user email found. currentUser:', currentUser, 'window._tempUserEmail:', window._tempUserEmail);
      alert('Error: User not authenticated. Please refresh and try again.');
      return;
    }

    try {
      const response = await fetch('/api/consent/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          tosVersion: LEGAL_VERSIONS.TOS_VERSION,
          privacyPolicyVersion: LEGAL_VERSIONS.PRIVACY_POLICY_VERSION,
          consentVersion: LEGAL_VERSIONS.CONSENT_VERSION
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Consent acceptance recorded:', data);
        setHasConsented(true);
        setNeedsConsent(false);
        // Clean up temp email
        delete window._tempUserEmail;
      } else {
        console.error('Failed to record consent:', data.error);
        alert('Failed to save consent. Please try again.');
      }
    } catch (error) {
      console.error('Error recording consent:', error);
      alert('Network error. Please try again.');
    }
  };

  // Authentication Modal - Email + PIN Login/Signup
  const AuthModal = () => {
    const [authStep, setAuthStep] = useState('email'); // 'email', 'pin-login', 'pin-create', 'loading'
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        const response = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
          if (data.exists) {
            setAuthStep('pin-login');
          } else {
            setAuthStep('pin-create');
          }
        } else {
          setError(data.error || 'Failed to check email');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const handlePinSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        const endpoint = authStep === 'pin-login' ? '/api/auth/login' : '/api/auth/register';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, pin })
        });

        const data = await response.json();

        if (response.ok) {
          // CRITICAL HIPAA FIX: Clear ALL previous user data before loading new user
          console.log('🔒 HIPAA: Clearing previous user session data');
          setMessages([]);
          setFeedingLogs([]);
          setSleepLogs([]);
          setWeightLogs([]);
          setLengthLogs([]);
          setHeadCircLogs([]);
          setBabyProfiles([]);
          setActiveBabyProfile(null);
          setCurrentUser(null);
          setShowSurvey(false);
          memoryManager.clearAllMemories?.();

          // Clear ALL localStorage/sessionStorage including survey tracking
          const keysToRemove = Object.keys(localStorage);
          keysToRemove.forEach(key => localStorage.removeItem(key));
          const sessionKeys = Object.keys(sessionStorage);
          sessionKeys.forEach(key => sessionStorage.removeItem(key));

          console.log('🔒 HIPAA: Cleared all storage, survey tracking, and session data');

          // Login/registration successful
          setCurrentUser({
            userId: data.userId,
            email: data.email,
            babyProfiles: data.babyProfiles || [],
            chatHistory: data.chatHistory || [],
            feedingLogs: data.feedingLogs || [],
            sleepLogs: data.sleepLogs || [],
            diaperLogs: data.diaperLogs || []
          });

          // NAY-9: Store email temporarily for consent acceptance
          // (React state updates are async, so we need a backup for handleConsentAccept)
          window._tempUserEmail = data.email;
          console.log('✅ Stored temp email for consent:', window._tempUserEmail);

          // Set authenticated immediately to avoid UI lag
          setIsAuthenticated(true);
          setShowAuthModal(false);

          // NAY-9: Optimize consent check
          if (authStep === 'pin-create') {
            // NEW USER: Always needs consent (skip API call for instant response)
            console.log('🆕 New user registration - consent required');
            setNeedsConsent(true);
            setIsCheckingConsent(false);
          } else {
            // EXISTING USER: Check consent status via API
            console.log('🔄 Existing user login - checking consent status');
            checkConsentStatus(data.email);
          }

          // Load existing baby profiles or show setup
          if (data.babyProfiles && data.babyProfiles.length > 0) {
            setBabyProfiles(data.babyProfiles);
            setActiveBabyProfile(data.babyProfiles[0]);

            // Load chat history
            console.log('Chat history from API:', data.chatHistory);
            if (data.chatHistory && data.chatHistory.length > 0) {
              setMessages(data.chatHistory);
              console.log('Loaded chat history, message count:', data.chatHistory.length);
              // Auto-scroll to bottom after loading chat history - use longer delay for DOM rendering
              setTimeout(() => scrollToBottom(true), 500);
            } else {
              setMessages([{
                id: 1,
                text: "Welcome back! I'm Naya. How can I help you today?",
                sender: 'bot',
                timestamp: new Date()
              }]);
              console.log('No chat history, showing welcome message');
              // Auto-scroll to bottom for welcome message
              setTimeout(() => scrollToBottom(true), 500);
            }

            // Load feeding and sleep logs
            console.log('Loading logs from API:', {
              feedingLogs: data.feedingLogs,
              sleepLogs: data.sleepLogs,
              diaperLogs: data.diaperLogs,
              weightLogs: data.weightLogs,
              lengthLogs: data.lengthLogs,
              headCircLogs: data.headCircLogs
            });
            if (data.feedingLogs && data.feedingLogs.length > 0) {
              setFeedingLogs(data.feedingLogs);
              console.log('Set feeding logs:', data.feedingLogs);
            }
            if (data.sleepLogs && data.sleepLogs.length > 0) {
              setSleepLogs(data.sleepLogs);
              console.log('Set sleep logs:', data.sleepLogs);
            }
            if (data.diaperLogs && data.diaperLogs.length > 0) {
              setDiaperLogs(data.diaperLogs);
              console.log('Set diaper logs:', data.diaperLogs);
            }
            if (data.weightLogs && data.weightLogs.length > 0) {
              setWeightLogs(data.weightLogs);
              console.log('Set weight logs:', data.weightLogs);
            }
            if (data.lengthLogs && data.lengthLogs.length > 0) {
              setLengthLogs(data.lengthLogs);
              console.log('Set length logs:', data.lengthLogs);
            }
            if (data.headCircLogs && data.headCircLogs.length > 0) {
              setHeadCircLogs(data.headCircLogs);
              console.log('Set head circ logs:', data.headCircLogs);
            }

            // Show profile manager after login
            setShowProfileManager(true);
          } else {
            // No baby profiles - show setup
            setShowProfileSetup(true);
          }
        } else {
          if (response.status === 423) {
            setError(data.message || 'Account temporarily locked');
          } else if (response.status === 401) {
            setError(data.error + (data.attemptsLeft ? ` (${data.attemptsLeft} attempts left)` : ''));
          } else {
            setError(data.error || 'Authentication failed');
          }
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-white to-pink-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 my-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {authStep === 'email' ? 'Welcome!' : authStep === 'pin-create' ? 'Create Your Account' : 'Welcome Back!'}
            </h2>
            <p className="text-gray-600 text-sm">
              {authStep === 'email'
                ? 'Enter your email to continue'
                : authStep === 'pin-create'
                ? 'Create a 4-digit PIN for secure access'
                : 'Enter your 4-digit PIN'}
            </p>
          </div>

          {/* Email Step */}
          {authStep === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-400 transition-colors"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-pink-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </form>
          )}

          {/* PIN Step (Login or Create) */}
          {(authStep === 'pin-login' || authStep === 'pin-create') && (
            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {authStep === 'pin-create' ? 'Create 4-Digit PIN' : '4-Digit PIN'}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength="4"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:border-pink-400 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {authStep === 'pin-create'
                    ? 'Choose a PIN you\'ll remember'
                    : `Logging in as: ${email}`}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setAuthStep('email');
                    setPin('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || pin.length !== 4}
                  className="flex-1 bg-gradient-to-r from-pink-400 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-pink-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? 'Processing...' : authStep === 'pin-create' ? 'Create Account' : 'Login'}
                </button>
              </div>
            </form>
          )}

          {/* Security Note */}
          <div className="mt-6 p-4 bg-pink-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              🔒 Your data is encrypted and HIPAA-compliant. Your PIN is never stored in plain text.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const MessageBubble = ({ message }) => {
    const isBot = message.sender === 'bot';
    const displayText = isBot ? formatBotMarkdown(message.text) : message.text;
    
    return (
      <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-6`}>
        <div className={`max-w-2xl px-6 py-5 rounded-2xl shadow-sm ${
          isBot 
            ? 'bg-gradient-to-br from-pink-50 to-white text-gray-800 border border-pink-100' 
            : 'bg-gradient-to-br from-pink-300 to-pink-400 text-white shadow-md'
        }`}>
          {message.image && (
            <div className="mb-4">
              <img 
                src={message.image} 
                alt={message.imageName || 'Shared photo'} 
                className="max-w-full h-auto rounded-lg shadow-sm"
                style={{ maxHeight: '300px' }}
              />
              {message.imageName && (
                <p className="text-xs opacity-70 mt-1">{message.imageName}</p>
              )}
            </div>
          )}
          <ReactMarkdown
            className="prose prose-sm sm:prose-base max-w-none text-gray-800"
            remarkPlugins={[remarkGfm]}
            components={{
              p: (props) => {
                // Detect emergency warnings starting with 🚨 **URGENT
                const isEmergency = props.children &&
                  typeof props.children === 'string' &&
                  props.children.startsWith('🚨');

                return (
                  <p {...props} className={`mb-3 leading-relaxed ${isEmergency ? 'text-red-600 font-bold' : 'text-gray-800'}`} />
                );
              },
              ul: (props) => (
                <ul {...props} className="list-disc pl-5 space-y-2 marker:text-pink-400" />
              ),
              ol: (props) => (
                <ol {...props} className="list-decimal pl-5 space-y-2 marker:text-pink-400" />
              ),
              li: (props) => (
                <li {...props} className="pl-1" />
              ),
              strong: (props) => {
                // Check if this bold text is part of an emergency warning
                const parent = props.node?.position?.start?.line;
                const isInEmergency = props.children &&
                  typeof props.children === 'string' &&
                  (props.children.includes('URGENT') || props.children.includes('CALL DOCTOR'));

                return (
                  <strong {...props} className={`${isInEmergency ? 'text-red-600' : 'text-gray-900'} font-semibold`} />
                );
              }
            }}
          >
            {displayText}
          </ReactMarkdown>
          {/* HIDDEN: Download Personalized Guide - Reserved for future implementation */}
          {false && isBot && message.canGeneratePDF && (
            <button
              className="mt-4 flex items-center text-sm text-pink-400 hover:text-pink-600 bg-white px-4 py-2 rounded-lg border border-pink-200 hover:border-pink-300 transition-all duration-200"
              onClick={() => alert('PDF generation feature - would create personalized handout')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Personalized Guide
            </button>
          )}
          {message.timestamp && (
            <p className="text-xs opacity-60 mt-3">
              {(() => {
                try {
                  const date = message.timestamp instanceof Date
                    ? message.timestamp
                    : new Date(message.timestamp);
                  return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                } catch (error) {
                  console.error('Error formatting timestamp:', error, message.timestamp);
                  return '';
                }
              })()}
            </p>
          )}
        </div>
      </div>
    );
  };

  const LogSection = () => {
    const allLogs = [...feedingLogs, ...sleepLogs, ...diaperLogs]
      .filter(log => log.babyId === activeBabyProfile?.id)
      .sort((a, b) => new Date(b.time) - new Date(a.time));

    const getDiaperIcon = (diaperType) => {
      if (diaperType === 'wet') return <Droplets className="w-4 h-4 text-blue-500" />;
      if (diaperType === 'dirty') return <Baby className="w-4 h-4 text-amber-500" />;
      return <Activity className="w-4 h-4 text-purple-500" />; // both
    };

    const getDiaperLabel = (diaperType) => {
      if (diaperType === 'wet') return 'Wet diaper';
      if (diaperType === 'dirty') return 'Dirty diaper';
      return 'Wet & dirty diaper';
    };

    const getDiaperBgColor = (diaperType) => {
      if (diaperType === 'wet') return 'bg-blue-100';
      if (diaperType === 'dirty') return 'bg-amber-100';
      return 'bg-purple-100';
    };

    return (
      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quick Log</h2>
          <p className="text-gray-600 mb-6">Track your baby's feeding, sleep, and diaper patterns</p>

          {/* Quick Log Buttons - Unified Box */}
          <QuickLogButtons />

          {/* Data & Insights Dashboard - MOVED TO TOP */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-500" />
              Data & Insights
            </h3>
            <InsightsDashboard
              feedingLogs={feedingLogs}
              sleepLogs={sleepLogs}
              diaperLogs={diaperLogs}
              babyAgeInDays={activeBabyProfile ? getBabyAgeOrPregnancy(activeBabyProfile).days : 0}
              babyAgeInWeeks={activeBabyProfile ? getBabyAgeOrPregnancy(activeBabyProfile).weeks : 0}
            />
          </div>

          {/* Recent Activity - Compact Scrollable Box */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-pink-500" />
              Recent Activity
            </h3>

            {allLogs.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500 mb-2">No logs yet</p>
                <p className="text-sm text-gray-400">Start tracking by using the buttons above</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm max-h-96 overflow-y-auto">
                <div className="p-4 space-y-2">
                  {allLogs.slice(0, 20).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <div className={`mr-3 p-2 rounded-full ${
                          log.type === 'feeding' ? 'bg-pink-100' :
                          log.type === 'sleep' ? 'bg-blue-100' :
                          getDiaperBgColor(log.type)
                        }`}>
                          {log.type === 'feeding' ? (
                            <Droplets className="w-4 h-4 text-pink-500" />
                          ) : log.type === 'sleep' ? (
                            <Moon className="w-4 h-4 text-blue-500" />
                          ) : (
                            getDiaperIcon(log.type)
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {log.type === 'feeding' ? 'Feeding' :
                             log.type === 'sleep' ? 'Sleep' :
                             getDiaperLabel(log.type)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.time).toLocaleDateString()} at {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DevelopmentSection = () => (
    <div className="flex-1 overflow-y-auto p-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Development Timeline</h2>
        <p className="text-gray-600 mb-4">Track your baby's developmental milestones and what to expect next</p>

        {/* Track Growth Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowGrowthModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Track Growth Measurement</span>
          </button>
        </div>

        {/* Growth Charts Component */}
        <div className="mb-8">
          <GrowthCharts
            babyAgeInDays={activeBabyProfile?.ageInDays || 0}
            babyWeight={activeBabyProfile?.weight || null}
            babyLength={activeBabyProfile?.length || null}
            babyHeadCircumference={activeBabyProfile?.headCircumference || null}
            weightLogs={weightLogs}
            lengthLogs={lengthLogs}
            headCircLogs={headCircLogs}
            activeBabyId={activeBabyProfile?.id}
            babyBirthDate={activeBabyProfile?.birthDate || null}
          />
        </div>

        {/* Age-Specific Timeline with Developmental Milestones */}
        <div className="mb-8">
          <AgeTimeline
            babyAgeInDays={activeBabyProfile ? getBabyAgeOrPregnancy(activeBabyProfile).days : 0}
          />
        </div>
      </div>
    </div>
  );

  const EducationalSection = () => {
    const [educationalVideos, setEducationalVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadVideos();
    }, []);

    const loadVideos = async () => {
      try {
        const response = await fetch('/api/admin/videos');
        if (response.ok) {
          const data = await response.json();
          setEducationalVideos(data.videos?.filter(v => v.isActive) || []);
        } else {
          // If API fails, show empty instead of mock data
          setEducationalVideos([]);
        }
      } catch (error) {
        console.error('Error loading videos:', error);
        // If network error, show empty instead of mock data
        setEducationalVideos([]);
      } finally {
        setLoading(false);
      }
    };

    const getMockVideos = () => [
      {
        id: 1,
        title: "Newborn Care Basics",
        description: "Essential tips for caring for your newborn in the first few weeks",
        duration: "12:34",
        category: "Newborn Care",
        videoUrl: "https://www.youtube.com/@nayacare6918",
        embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        viewCount: 1250
      },
      {
        id: 2,
        title: "Breastfeeding Fundamentals",
        description: "Step-by-step guide to successful breastfeeding",
        duration: "18:45",
        category: "Feeding",
        videoUrl: "https://www.youtube.com/@nayacare6918",
        embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        viewCount: 2100
      }
    ];

    const handleVideoClick = (video) => {
      // Track feature usage
      featureUsageRef.current.visited_youtube = true;

      if (video.videoUrl) {
        // Check if we're in embed mode (iframe context)
        const isInIframe = window !== window.top;

        if (isInIframe) {
          // In embed mode, use postMessage to communicate with parent window
          window.parent.postMessage({
            type: 'OPEN_YOUTUBE_VIDEO',
            url: video.videoUrl
          }, '*');
        } else {
          // Not in iframe, use direct navigation
          window.open(video.videoUrl, '_blank', 'noopener,noreferrer');
        }
      }
    };

    const extractYouTubeId = (url) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

    const getCategoryIcon = (category) => {
      const iconMap = {
        'Sleep': 'Moon',
        'Breastfeeding': 'Baby',
        'Feeding': 'Droplets',
        'Recovery': 'Activity',
        'Development': 'TrendingUp',
        'Education': 'BookOpen',
        'Safety': 'AlertTriangle'
      };
      return iconMap[category] || 'Activity';
    };

    return (
      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Educational Videos</h2>
          <p className="text-gray-600 mb-8">Watch Dr. Sonal Patel's expert guidance on pregnancy and postpartum care</p>
          
          {/* Video Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {educationalVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => handleVideoClick(video)}
                className="bg-white rounded-xl border border-pink-200 hover:border-pink-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md group"
              >
                {/* Video Thumbnail */}
                <div className="relative">
                  {video.thumbnailUrl ? (
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-8 rounded-t-xl text-center h-48 flex flex-col justify-center">
                      <div className="mb-4 flex justify-center">
                        <div className="p-4 rounded-full bg-white shadow-sm">
                          {(() => {
                            const IconComponent = iconMap[video.icon];
                            return IconComponent ? <IconComponent className="w-8 h-8 text-pink-500" /> : null;
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-t-xl group-hover:bg-opacity-30 transition-all">
                    <div className="bg-red-500 text-white p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 5v10l8-5-8-5z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Duration badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  )}
                </div>
                
                {/* Video Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-pink-600 bg-pink-100 px-2 py-1 rounded-full">
                      {video.category}
                    </span>
                    <div className="flex items-center text-gray-400 group-hover:text-pink-500 transition-colors">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12l-4-4h8l-4 4z"/>
                      </svg>
                      <span className="text-xs">Watch</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
                    {video.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* YouTube Channel Link */}
          <div className="mt-8 bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-red-500 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Dr. Sonal Patel's YouTube Channel</h3>
                  <p className="text-sm text-gray-600">Subscribe for weekly educational content</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const isInIframe = window !== window.top;
                  if (isInIframe) {
                    // In embed mode, use postMessage to communicate with parent window
                    window.parent.postMessage({
                      type: 'OPEN_YOUTUBE_VIDEO',
                      url: 'https://www.youtube.com/@nayacare6918'
                    }, '*');
                  } else {
                    // Not in iframe, use direct navigation
                    window.open('https://www.youtube.com/@nayacare6918', '_blank', 'noopener,noreferrer');
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Visit Channel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TriageSection = () => {
    const [activeTriageTab, setActiveTriageTab] = useState('symptom-checker');
    const [symptomAnswers, setSymptomAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [severityScore, setSeverityScore] = useState(null);
    const [uploadedPhoto, setUploadedPhoto] = useState(null);
    const [phq9Answers, setPhq9Answers] = useState({});
    const [growthData, setGrowthData] = useState([]);

    // Symptom Checker Questions
    const symptomQuestions = [
      {
        id: 'fever',
        question: 'Does your baby have a fever (temperature above 100.4°F/38°C)?',
        options: ['Yes', 'No', 'Not sure'],
        severity: { 'Yes': 3, 'No': 0, 'Not sure': 1 }
      },
      {
        id: 'feeding',
        question: 'How is your baby feeding?',
        options: ['Normal feeding', 'Reduced feeding', 'Refusing to feed', 'Vomiting after feeds'],
        severity: { 'Normal feeding': 0, 'Reduced feeding': 2, 'Refusing to feed': 3, 'Vomiting after feeds': 2 }
      },
      {
        id: 'breathing',
        question: 'How is your baby breathing?',
        options: ['Normal', 'Fast breathing', 'Difficulty breathing', 'Noisy breathing'],
        severity: { 'Normal': 0, 'Fast breathing': 2, 'Difficulty breathing': 3, 'Noisy breathing': 2 }
      },
      {
        id: 'skin',
        question: 'Any skin changes or rashes?',
        options: ['No changes', 'Mild rash', 'Severe rash', 'Yellow skin (jaundice)'],
        severity: { 'No changes': 0, 'Mild rash': 1, 'Severe rash': 2, 'Yellow skin (jaundice)': 3 }
      },
      {
        id: 'behavior',
        question: 'How is your baby behaving?',
        options: ['Normal', 'More fussy than usual', 'Very irritable', 'Lethargic/unresponsive'],
        severity: { 'Normal': 0, 'More fussy than usual': 1, 'Very irritable': 2, 'Lethargic/unresponsive': 3 }
      }
    ];

    // PHQ-9 Questions for Postpartum Depression
    const phq9Questions = [
      'Little interest or pleasure in doing things',
      'Feeling down, depressed, or hopeless',
      'Trouble falling or staying asleep, or sleeping too much',
      'Feeling tired or having little energy',
      'Poor appetite or overeating',
      'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
      'Trouble concentrating on things, such as reading the newspaper or watching television',
      'Moving or speaking so slowly that other people could have noticed, or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
      'Thoughts that you would be better off dead, or of hurting yourself'
    ];

    const calculateSeverityScore = (answers) => {
      let totalScore = 0;
      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = symptomQuestions.find(q => q.id === questionId);
        if (question && question.severity[answer] !== undefined) {
          totalScore += question.severity[answer];
        }
      });
      return totalScore;
    };

    const getSeverityLevel = (score) => {
      if (score >= 8) return { level: 'high', color: 'red', message: 'Seek immediate medical attention' };
      if (score >= 4) return { level: 'moderate', color: 'yellow', message: 'Monitor closely, consider calling your doctor' };
      return { level: 'low', color: 'green', message: 'Continue monitoring, symptoms appear mild' };
    };

    const handleSymptomAnswer = (answer) => {
      const newAnswers = { ...symptomAnswers, [symptomQuestions[currentQuestion].id]: answer };
      setSymptomAnswers(newAnswers);
      
      if (currentQuestion < symptomQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        const score = calculateSeverityScore(newAnswers);
        setSeverityScore(score);
      }
    };

    const handlePhotoUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedPhoto(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };

    const analyzePhoto = () => {
      // Mock photo analysis - in real implementation, this would call ML service
      return {
        conditions: ['Mild diaper rash detected', 'Normal skin tone'],
        recommendations: ['Apply diaper cream', 'Monitor for worsening'],
        confidence: 85
      };
    };

    const calculatePHQ9Score = (answers) => {
      return Object.values(answers).reduce((sum, score) => sum + (score || 0), 0);
    };

    const getPHQ9Severity = (score) => {
      if (score >= 15) return { level: 'Severe', color: 'red', action: 'Immediate professional help recommended' };
      if (score >= 10) return { level: 'Moderate', color: 'yellow', action: 'Consider professional support' };
      if (score >= 5) return { level: 'Mild', color: 'yellow', action: 'Monitor and consider support' };
      return { level: 'Minimal', color: 'green', action: 'Continue self-care' };
    };

    return (
      <div className="flex-1 overflow-y-auto p-3 sm:p-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Advanced Triage & Assessment</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-8">Comprehensive health assessment tools for you and your baby</p>
          
          {/* Triage Tabs - Mobile Optimized */}
          <div className="flex space-x-1 sm:space-x-2 mb-4 sm:mb-8 bg-gray-100 p-1 rounded-lg overflow-x-auto scrollbar-hide">
            {[
              { id: 'symptom-checker', label: 'Symptom Checker', shortLabel: 'Symptoms', icon: 'Search' },
              { id: 'depression-screening', label: 'Depression Screening', shortLabel: 'Screening', icon: 'Brain' }
            ].map((tab) => {
              const IconComponent = iconMap[tab.icon];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTriageTab(tab.id)}
                  className={`flex-shrink-0 px-2 sm:px-4 py-2 sm:py-3 rounded-md transition-all duration-200 flex items-center justify-center whitespace-nowrap ${
                    activeTriageTab === tab.id
                      ? 'bg-white text-pink-600 font-semibold shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {IconComponent && <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Symptom Checker */}
          {activeTriageTab === 'symptom-checker' && (
            <div className="bg-white rounded-xl border border-pink-200 p-3 sm:p-6">
              {severityScore === null ? (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                    Question {currentQuestion + 1} of {symptomQuestions.length}
                  </h3>
                  <div className="mb-4 sm:mb-6">
                    <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">{symptomQuestions[currentQuestion].question}</p>
                    <div className="space-y-2 sm:space-y-3">
                      {symptomQuestions[currentQuestion].options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSymptomAnswer(option)}
                          className="w-full p-3 sm:p-4 text-left border-2 border-pink-200 rounded-lg hover:border-pink-400 transition-all duration-200 text-sm sm:text-base"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-pink-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / symptomQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Assessment Complete</h3>
                  {(() => {
                    const severity = getSeverityLevel(severityScore);
                    return (
                      <div className={`p-4 sm:p-6 rounded-xl border-2 ${
                        severity.color === 'red' ? 'border-red-200 bg-red-50' :
                        severity.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
                        'border-green-200 bg-green-50'
                      }`}>
                        <div className={`mb-3 sm:mb-4 flex justify-center ${
                          severity.color === 'red' ? 'text-red-500' :
                          severity.color === 'yellow' ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          <div className={`p-2 sm:p-3 rounded-full ${
                            severity.color === 'red' ? 'bg-red-100' :
                            severity.color === 'yellow' ? 'bg-yellow-100' :
                            'bg-green-100'
                          }`}>
                            {severity.color === 'red' ? (
                              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" />
                            ) : severity.color === 'yellow' ? (
                              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                            ) : (
                              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                            )}
                          </div>
                        </div>
                        <h4 className={`text-lg sm:text-xl font-semibold mb-2 ${
                          severity.color === 'red' ? 'text-red-800' :
                          severity.color === 'yellow' ? 'text-yellow-800' :
                          'text-green-800'
                        }`}>
                          {severity.message}
                        </h4>
                        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Severity Score: {severityScore}/15</p>
                        <button
                          onClick={() => {
                            setSeverityScore(null);
                            setCurrentQuestion(0);
                            setSymptomAnswers({});
                          }}
                          className="bg-pink-400 text-white px-6 py-2 rounded-lg hover:bg-pink-500 transition-all duration-200"
                        >
                          Start New Assessment
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Depression Screening */}
          {activeTriageTab === 'depression-screening' && (
            <div className="bg-white rounded-xl border border-pink-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Postpartum Depression Screening (PHQ-9)</h3>
              <p className="text-gray-600 mb-6">Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
              
              <div className="space-y-6">
                {phq9Questions.map((question, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <p className="font-medium text-gray-800 mb-3">{index + 1}. {question}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 0, label: 'Not at all' },
                        { value: 1, label: 'Several days' },
                        { value: 2, label: 'More than half the days' },
                        { value: 3, label: 'Nearly every day' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPhq9Answers(prev => ({ ...prev, [index]: option.value }))}
                          className={`p-3 text-sm rounded-lg border-2 transition-all duration-200 ${
                            phq9Answers[index] === option.value
                              ? 'border-pink-400 bg-pink-50 text-pink-700'
                              : 'border-gray-200 hover:border-pink-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {Object.keys(phq9Answers).length === phq9Questions.length && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  {(() => {
                    const score = calculatePHQ9Score(phq9Answers);
                    const severity = getPHQ9Severity(score);
                    return (
                      <div className={`text-center p-4 rounded-lg border-2 ${
                        severity.color === 'red' ? 'border-red-200 bg-red-50' :
                        severity.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
                        'border-green-200 bg-green-50'
                      }`}>
                        <h4 className={`text-lg font-semibold mb-2 ${
                          severity.color === 'red' ? 'text-red-800' :
                          severity.color === 'yellow' ? 'text-yellow-800' :
                          'text-green-800'
                        }`}>
                          PHQ-9 Score: {score}/27 - {severity.level}
                        </h4>
                        <p className="text-gray-700 mb-3">{severity.action}</p>
                        <div className="text-sm text-gray-600">
                          <p>• This is a screening tool, not a diagnosis</p>
                          <p>• Please consult with a healthcare provider</p>
                          <p>• Crisis support: 988 Suicide & Crisis Lifeline</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const ResourcesSection = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadResources();
    }, []);

    const loadResources = async () => {
      try {
        const response = await fetch('/api/admin/resources');
        if (response.ok) {
          const data = await response.json();
          setResources(data.resources?.filter(r => r.isActive) || []);
        } else {
          // If API fails, show empty instead of mock data
          setResources([]);
        }
      } catch (error) {
        console.error('Error loading resources:', error);
        // If network error, show empty instead of mock data
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    const formatDownloadCount = (count) => {
      if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k downloads`;
      }
      return `${count} downloads`;
    };

    return (
      <div className="flex-1 overflow-y-auto p-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Resource Library</h2>
              <p className="text-gray-600">Download Dr. Sonal Patel's guides and resources for pregnancy & postpartum</p>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading resources...</div>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                {resources.map((resource) => {
                  const IconComponent = iconMap[resource.icon] || FileText;
                  return (
                    <div key={resource.id} className="bg-white rounded-xl border border-pink-100 hover:border-pink-300 transition-all duration-200 p-6 shadow-sm hover:shadow-md">
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-pink-100 p-3 rounded-lg">
                          <IconComponent className="w-6 h-6 text-pink-400" />
                        </div>
                        <span className="text-xs text-gray-500">{formatDownloadCount(resource.downloadCount || 0)}</span>
                      </div>
                      <span className="text-xs font-semibold text-pink-400 uppercase tracking-wide">{resource.category}</span>
                      <h3 className="text-lg font-bold text-gray-800 mt-2 mb-2">{resource.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                      <button
                        className="w-full flex items-center justify-center text-sm text-white bg-gradient-to-r from-pink-300 to-pink-400 hover:from-pink-400 hover:to-pink-500 px-4 py-2 rounded-lg transition-all duration-200"
                        onClick={async () => {
                          if (resource.pdfUrl) {
                            // Track feature usage
                            featureUsageRef.current.downloaded_resource = true;
                            // Also track which specific resource was downloaded
                            if (!featureUsageRef.current.resources_viewed.includes(resource.title)) {
                              featureUsageRef.current.resources_viewed.push(resource.title);
                            }

                            // Increment download counter
                            try {
                              await fetch(`/api/admin/resources?id=${resource.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  downloadCount: (resource.downloadCount || 0) + 1
                                })
                              });
                            } catch (err) {
                              console.error('Failed to increment download count:', err);
                            }

                            // Open PDF - handle embed mode
                            const isInIframe = window !== window.top;
                            if (isInIframe) {
                              // In embed mode, ask parent window to open PDF
                              window.parent.postMessage({
                                type: 'OPEN_PDF',
                                url: resource.pdfUrl,
                                title: resource.title
                              }, '*');
                            } else {
                              // Direct mode
                              window.open(resource.pdfUrl, '_blank');
                            }
                          } else {
                            alert('PDF not available yet. Please check back later.');
                          }
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {resource.pdfUrl ? 'Download PDF' : 'Coming Soon'}
                      </button>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-12 bg-pink-50 rounded-xl p-6 border border-pink-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">📚 More Resources Coming Soon</h3>
                <p className="text-gray-600">Dr. Sonal Patel is continuously updating our resource library with new guides, checklists, and educational materials to support your journey.</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Mobile Modal Component
  const MobileModal = () => {
    // NAY-9: New flow order - Auth → Consent (if needed) → Profile Setup
    // Show AuthModal first (before consent)
    if (!isAuthenticated || showAuthModal) {
      return <AuthModal />;
    }

    // Show loading while checking consent status (prevents flash)
    if (isCheckingConsent) {
      return (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
        </div>
      );
    }

    // Show ConsentModal if user needs consent (after authentication)
    if (needsConsent && !hasConsented) {
      return <ConsentModal />;
    }

    // Show ProfileManager if needed
    if (showProfileManager) {
      return <ProfileManagerModal />;
    }

    // Show ProfileSetup if needed
    if (showProfileSetup) {
      return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-y-auto">
          <div className="bg-gradient-to-r from-pink-300 to-pink-400 text-white px-4 py-3 flex items-center justify-between shadow-lg">
            <h3 className="font-bold text-lg">Set Up Baby Profile</h3>
            <button
              onClick={() => setShowProfileSetup(false)}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 p-4">
            <BabyProfileSetup />
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-pink-300 to-pink-400 text-white px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">NayaCare</h3>
              <p className="text-xs opacity-90">
                {activeBabyProfile ? (
                  activeBabyProfile.isBornYet !== false ?
                    `${activeBabyProfile.name} - ${calculateBabyAge(activeBabyProfile.birthDate).ageString} old` :
                    (() => {
                      const today = new Date();
                      const dueDate = new Date(activeBabyProfile.expectedDueDate);
                      const diffTime = dueDate - today;
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      const weeksUntilDue = Math.ceil(diffDays / 7);

                      if (diffDays < 0) {
                        return `${activeBabyProfile.name} - Overdue`;
                      } else if (diffDays === 0) {
                        return `${activeBabyProfile.name} - Due today!`;
                      } else {
                        return `${activeBabyProfile.name} - Due in ${weeksUntilDue} week${weeksUntilDue !== 1 ? 's' : ''}`;
                      }
                    })()
                ) : "Dr. Sonal Patel's Guide"
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseChat}
            className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation - Bottom Tab Bar */}
        <div className="bg-white border-t border-gray-200 px-2 py-1">
          <div className="flex justify-around">
            {[
              { id: 'chat', label: 'Chat', icon: 'MessageCircle' },
              { id: 'log', label: 'Log', icon: 'Activity' },
              { id: 'development', label: 'Dev', icon: 'TrendingUp' },
              { id: 'education', label: 'Edu', icon: 'BookOpen' },
              { id: 'triage', label: 'Tri', icon: 'Search' },
              { id: 'resources', label: 'Res', icon: 'FileText' }
            ].map((tab) => {
              const IconComponent = iconMap[tab.icon];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex flex-col items-center py-2 px-1 transition-all duration-200 ${
                    activeSection === tab.id
                      ? 'text-pink-500'
                      : 'text-gray-500'
                  }`}
                >
                  {IconComponent && <IconComponent className="w-5 h-5 mb-1" />}
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Content Area */}
        <div className="flex-1 overflow-y-auto">
          {showProfileSetup ? (
            <div className="p-4">
              <BabyProfileSetup />
            </div>
          ) : activeSection === 'chat' ? (
            <>
              {/* Quick Topics for Mobile */}
              <div className="bg-pink-50 border-b border-pink-100 px-4 py-3">
                <p className="text-xs text-gray-600 mb-2">Quick topics:</p>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {quickTopics.slice(0, 4).map((topic, index) => {
                    const IconComponent = iconMap[topic.icon];
                    return (
                      <button
                        key={index}
                        onClick={() => setInputValue(`Tell me about ${topic.topic}`)}
                        className="flex items-center space-x-1 bg-white px-3 py-2 rounded-full border border-pink-200 hover:border-pink-400 hover:bg-pink-50 transition-all duration-200 whitespace-nowrap text-xs"
                      >
                        {IconComponent && <IconComponent className="w-3 h-3 text-pink-500" />}
                        <span className="text-gray-700">{topic.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-pink-25 to-white">
                <div className="max-w-4xl mx-auto">
                  {/* Load More Button (shown if there are older messages) */}
                  {messages.length > visibleMessageCount && (
                    <div className="text-center mb-4">
                      <button
                        onClick={() => setVisibleMessageCount(prev => Math.min(prev + MESSAGES_PER_LOAD, messages.length))}
                        className="px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-sm transition-colors"
                      >
                        Load {Math.min(MESSAGES_PER_LOAD, messages.length - visibleMessageCount)} older messages
                      </button>
                    </div>
                  )}
                  {/* Only render visible messages (most recent ones) */}
                  {messages.slice(-visibleMessageCount).map((message) => (
                    <div key={message.id} data-message-id={message.id}>
                      <MessageBubble message={message} />
                    </div>
                  ))}
                  {isTyping && <MessageBubble message={{ sender: 'bot', text: '...' }} />}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Mobile Input Area */}
              <div className="bg-white border-t border-gray-200 p-3">
                {selectedImage && (
                  <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg mb-3">
                    <div className="flex items-center">
                      <img src={selectedImage.preview} alt="Preview" className="w-8 h-8 object-cover rounded mr-2" />
                      <span className="text-xs text-gray-700">Image attached</span>
                    </div>
                    <button onClick={removeSelectedImage} className="text-gray-500 hover:text-gray-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isTyping}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={chatInputRef}
                    type="text"
                    defaultValue=""
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        isUserTypingRef.current = false;
                        const value = e.target.value.trim();
                        if (value || selectedImage) {
                          if (selectedImage) {
                            setInputValue(value);
                            sendImageWithMessage();
                          } else {
                            handleSendMessage(value);
                          }
                          e.target.value = '';
                        }
                      }
                    }}
                    onFocus={() => {
                      isUserTypingRef.current = true;
                    }}
                    onBlur={() => {
                      isUserTypingRef.current = false;
                    }}
                    placeholder="Ask about your baby..."
                    className="flex-1 border-2 border-pink-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:border-pink-400"
                    style={{ fontSize: '16px', WebkitUserSelect: 'text', touchAction: 'manipulation' }}
                    disabled={isTyping}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    inputMode="text"
                  />
                  <button
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isTyping) return;

                      const value = chatInputRef.current?.value?.trim();
                      if (value || selectedImage) {
                        // Keep input focused to prevent scroll
                        const currentFocus = document.activeElement;

                        if (selectedImage) {
                          setInputValue(value || '');
                          sendImageWithMessage();
                        } else {
                          handleSendMessage(value || '');
                        }

                        if (chatInputRef.current) {
                          chatInputRef.current.value = '';
                        }

                        // Restore focus if it was on input
                        if (currentFocus === chatInputRef.current) {
                          setTimeout(() => chatInputRef.current?.focus(), 50);
                        }
                      }
                    }}
                    type="button"
                    disabled={isTyping}
                    className="bg-gradient-to-r from-pink-300 to-pink-400 text-white p-2 rounded-lg hover:from-pink-400 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Educational guidance only • Not medical advice • Call 911 for emergencies
                </p>
              </div>
            </>
          ) : activeSection === 'log' ? (
            <LogSection />
          ) : activeSection === 'development' ? (
            <DevelopmentSection />
          ) : activeSection === 'education' ? (
            <EducationalSection />
          ) : activeSection === 'triage' ? (
            <TriageSection />
          ) : (
            <ResourcesSection />
          )}
        </div>
      </div>
    );
  };

  console.log('🎨 Rendering NayaCareChatbot:', {
    isOpen,
    isMobile,
    isEmbedMode,
    hasConsented,
    messagesCount: messages.length
  });

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {showEmergencyModal && <EmergencyModal />}
      {showAppointmentModal && <AppointmentModal />}

      {/* Mobile Modal */}
      {isOpen && isMobile ? (
        <MobileModal />
      ) : isOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col w-full h-full">
          {/* Background Image for Fullscreen Modal */}
          <img 
            src="/pregnant-woman-silhouette-fullscreen.png" 
            alt="" 
                   className="absolute inset-0 w-full h-full object-contain object-right opacity-10 z-0"
            style={{ 
              pointerEvents: 'none',
                     transform: 'translateY(5%) translateX(10px)',
                     maxHeight: '100vh',
                     maxWidth: '100vw'
            }}
          />
          {/* NAY-9: New flow order - Auth → Consent (if needed) → Profile Setup */}
          {!isAuthenticated || showAuthModal ? (
            <div className="relative z-10">
              <AuthModal />
            </div>
          ) : isCheckingConsent ? (
            <div className="relative z-10 flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
            </div>
          ) : needsConsent && !hasConsented ? (
            <div className="relative z-10">
              <ConsentModal />
            </div>
          ) : showProfileManager ? (
            <div className="relative z-10">
              <ProfileManagerModal />
            </div>
          ) : showProfileSetup ? (
            <div className="relative z-10">
              <BabyProfileSetup />
            </div>
          ) : (
            <>
              {/* Header */}
                     <div className="bg-gradient-to-r from-pink-300 to-pink-400 text-white px-3 sm:px-6 py-3 sm:py-4 flex items-center shadow-lg relative z-10">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl">Naya: Your Virtual Provider</h3>
                    <p className="text-xs sm:text-sm opacity-90">
                      {activeBabyProfile ? (
                        activeBabyProfile.isBornYet !== false ?
                          // Baby is born - show age
                          `${activeBabyProfile.name} - ${calculateBabyAge(activeBabyProfile.birthDate).ageString} old` :
                          // Baby not born yet - show due date info
                          (() => {
                            const today = new Date();
                            const dueDate = new Date(activeBabyProfile.expectedDueDate);
                            const diffTime = dueDate - today;
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            const weeksUntilDue = Math.ceil(diffDays / 7);

                            if (diffDays < 0) {
                              // Baby is overdue
                              const overdueDays = Math.abs(diffDays);
                              const overdueWeeks = Math.floor(overdueDays / 7);
                              const remainingDays = overdueDays % 7;
                              return `${activeBabyProfile.name} - ${overdueWeeks > 0 ? `${overdueWeeks} week${overdueWeeks !== 1 ? 's' : ''} ${remainingDays} day${remainingDays !== 1 ? 's' : ''}` : `${overdueDays} day${overdueDays !== 1 ? 's' : ''}`} overdue`;
                            } else if (diffDays === 0) {
                              return `${activeBabyProfile.name} - Due today!`;
                            } else if (weeksUntilDue === 0) {
                              return `${activeBabyProfile.name} - Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                            } else {
                              return `${activeBabyProfile.name} - Due in ${weeksUntilDue} week${weeksUntilDue !== 1 ? 's' : ''}`;
                            }
                          })()
                      ) : "Dr. Sonal Patel's Care Through Pregnancy and Beyond"}
                    </p>
                  </div>
                </div>
                
                       {/* Navigation Tabs - Sliding Bar Style */}
                       <div className="flex-1 flex justify-start pl-1 sm:pl-8 min-w-0">
                         <div className="flex items-center space-x-0.5 sm:space-x-2 overflow-x-auto scrollbar-hide nav-scroll pb-1 min-w-0 flex-1">
                    <button
                      onClick={() => setActiveSection('chat')}
                             className={`flex-shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 whitespace-nowrap text-xs sm:text-base border-2 ${
                        activeSection === 'chat' 
                                 ? 'bg-white text-pink-400 font-semibold border-white' 
                                 : 'text-white border-white border-opacity-30 hover:border-opacity-50 hover:bg-white hover:bg-opacity-10'
                      }`}
                    >
                      Chat
                    </button>
                           <button
                             onClick={() => setActiveSection('log')}
                             className={`flex-shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 whitespace-nowrap text-xs sm:text-base border-2 ${
                               activeSection === 'log' 
                                 ? 'bg-white text-pink-400 font-semibold border-white' 
                                 : 'text-white border-white border-opacity-30 hover:border-opacity-50 hover:bg-white hover:bg-opacity-10'
                             }`}
                           >
                             Log
                           </button>
                           <button
                             onClick={() => setActiveSection('development')}
                             className={`flex-shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 whitespace-nowrap text-xs sm:text-base border-2 ${
                               activeSection === 'development' 
                                 ? 'bg-white text-pink-400 font-semibold border-white' 
                                 : 'text-white border-white border-opacity-30 hover:border-opacity-50 hover:bg-white hover:bg-opacity-10'
                             }`}
                           >
                             <span className="hidden sm:inline">Development</span>
                             <span className="sm:hidden">Dev</span>
                           </button>
                           <button
                             onClick={() => setActiveSection('education')}
                             className={`flex-shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 whitespace-nowrap text-xs sm:text-base border-2 ${
                               activeSection === 'education' 
                                 ? 'bg-white text-pink-400 font-semibold border-white' 
                                 : 'text-white border-white border-opacity-30 hover:border-opacity-50 hover:bg-white hover:bg-opacity-10'
                             }`}
                           >
                             <span className="hidden sm:inline">Education</span>
                             <span className="sm:hidden">Edu</span>
                           </button>
                           <button
                             onClick={() => setActiveSection('triage')}
                             className={`flex-shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 whitespace-nowrap text-xs sm:text-base border-2 ${
                               activeSection === 'triage' 
                                 ? 'bg-white text-pink-400 font-semibold border-white' 
                                 : 'text-white border-white border-opacity-30 hover:border-opacity-50 hover:bg-white hover:bg-opacity-10'
                             }`}
                           >
                             <span className="hidden sm:inline">Triage</span>
                             <span className="sm:hidden">Tri</span>
                           </button>
                    <button
                      onClick={() => setActiveSection('resources')}
                             className={`flex-shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 whitespace-nowrap text-xs sm:text-base border-2 ${
                        activeSection === 'resources' 
                                 ? 'bg-white text-pink-400 font-semibold border-white' 
                                 : 'text-white border-white border-opacity-30 hover:border-opacity-50 hover:bg-white hover:bg-opacity-10'
                      }`}
                    >
                             <span className="hidden sm:inline">Resources</span>
                             <span className="sm:hidden">Res</span>
                    </button>
                  </div>
                </div>
                
                {/* Right side actions */}
                <div className="flex items-center space-x-1 sm:space-x-3">
                  {/* Status indicator */}
                  <div className="flex items-center space-x-1 sm:space-x-2 bg-white bg-opacity-10 rounded-full px-2 sm:px-3 py-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-300 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-white hidden sm:inline">Online</span>
                  </div>
                  
                  {/* Help button */}
                  <button 
                    onClick={() => alert('Help: This is Dr. Sonal Patel\'s Pregnancy & Postpartum Companion. You can ask questions about newborn care, feeding, sleep, and postpartum wellness. For emergencies, call 911.')}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 sm:p-2 transition-all duration-200"
                    title="Get help"
                  >
                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  
                  {/* Close button */}
                  <button
                    onClick={handleCloseChat}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 sm:p-2 transition-all duration-200"
                    title="Close chat"
                  >
                    <X className="w-4 h-4 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              {activeSection === 'chat' ? (
                <>
                  {/* Quick Topics Bar */}
                         <div className="bg-pink-50 border-b border-pink-100 px-3 sm:px-6 py-3 sm:py-4 relative z-10">
                           <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Quick topics:</p>
                           <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
                             {quickTopics.map((topic, index) => {
                               const IconComponent = iconMap[topic.icon];
                               return (
                        <button
                          key={index}
                          onClick={() => setInputValue(`Tell me about ${topic.topic}`)}
                                   className="flex items-center space-x-1 sm:space-x-2 bg-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-full border border-pink-200 hover:border-pink-400 hover:bg-pink-50 transition-all duration-200 whitespace-nowrap text-xs sm:text-sm"
                        >
                                   {IconComponent && <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 text-pink-500" />}
                          <span className="text-gray-700">{topic.text}</span>
                        </button>
                               );
                             })}

                             {/* Book Appointment Button - Stands Out */}
                             <button
                               onClick={() => setShowAppointmentModal(true)}
                               className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-pink-500 to-pink-600 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-white hover:from-pink-600 hover:to-pink-700 transition-all duration-200 whitespace-nowrap text-xs sm:text-sm font-medium shadow-md animate-pulse-subtle ml-2"
                             >
                               <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                               <span>Book Telehealth</span>
                             </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-pink-25 to-white relative z-10">
                    <div className="max-w-4xl mx-auto">
                      {/* Load More Button (shown if there are older messages) */}
                      {messages.length > visibleMessageCount && (
                        <div className="text-center mb-6">
                          <button
                            onClick={() => setVisibleMessageCount(prev => Math.min(prev + MESSAGES_PER_LOAD, messages.length))}
                            className="px-6 py-3 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                          >
                            Load {Math.min(MESSAGES_PER_LOAD, messages.length - visibleMessageCount)} older messages
                          </button>
                        </div>
                      )}
                      {/* Only render visible messages (most recent ones) */}
                      {messages.slice(-visibleMessageCount).map((message) => (
                        <div key={message.id} data-message-id={message.id}>
                          <MessageBubble message={message} />
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex justify-start mb-6">
                          <div className="bg-pink-50 rounded-2xl px-6 py-5 border border-pink-100">
                            <div className="flex space-x-2">
                              <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
                              <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-pink-100 p-3 sm:p-6 bg-white relative z-10">
                    <div className="max-w-4xl mx-auto">
                      {/* Image Preview */}
                      {selectedImage && (
                        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-pink-50 rounded-lg border border-pink-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <img 
                                src={selectedImage.preview} 
                                alt="Preview" 
                                className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                              />
                              <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-800">{selectedImage.name}</p>
                                <p className="text-xs text-gray-500">Ready to send</p>
                              </div>
                            </div>
                            <button
                              onClick={removeSelectedImage}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 sm:space-x-3">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              isUserTypingRef.current = false; // User is done typing
                              selectedImage ? sendImageWithMessage() : handleSendMessage();
                            }
                          }}
                          onFocus={() => {
                            // Mark user as actively typing when input is focused
                            isUserTypingRef.current = true;
                          }}
                          onBlur={() => {
                            // Mark user as done typing when input loses focus
                            isUserTypingRef.current = false;
                          }}
                          placeholder="Ask about your baby..."
                          className="flex-1 border-2 border-pink-200 rounded-xl px-3 sm:px-5 py-3 sm:py-4 text-sm sm:text-base focus:outline-none focus:border-pink-400 transition-all duration-200"
                          disabled={isTyping}
                        />
                        
                        {/* Hidden file input */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        
                        {/* Photo upload button */}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isTyping}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 sm:p-4 rounded-xl transition-all duration-200 disabled:opacity-50"
                          title="Upload photo"
                        >
                          <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        
                        {/* Send button */}
                        <button
                          onClick={selectedImage ? sendImageWithMessage : handleSendMessage}
                          disabled={isTyping || (!inputValue.trim() && !selectedImage)}
                          className="bg-gradient-to-r from-pink-300 to-pink-400 text-white p-3 sm:p-4 rounded-xl hover:from-pink-400 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                        >
                          <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        Educational guidance only • Not medical advice • Call 911 for emergencies • Photos are for educational guidance only
                      </p>
                    </div>
                  </div>
                </>
              ) : activeSection === 'log' ? (
                <LogSection />
              ) : activeSection === 'development' ? (
                <DevelopmentSection />
              ) : activeSection === 'education' ? (
                <EducationalSection />
              ) : activeSection === 'triage' ? (
                <TriageSection />
              ) : (
                <ResourcesSection />
              )}
            </>
          )}
        </div>
      )}

      {/* Floating Chat Button with pregnant woman image */}
      {!isEmbedMode && (
        <button
        onClick={() => setIsOpen(true)}
        className="group relative bg-gradient-to-r from-pink-300 to-pink-400 hover:from-pink-400 hover:to-pink-500 text-white rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
        style={{
          boxShadow: '0 8px 32px rgba(244, 114, 182, 0.4), 0 4px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
          width: '380px',
          height: '90px',
          animation: 'gentle-bounce 3s ease-in-out infinite'
        }}
      >
        {/* Pregnant Woman Silhouette Background Image */}
        <img 
          src="/pregnant-woman-silhouette.png" 
          alt="" 
          className="absolute inset-0 w-full h-full object-contain object-right pointer-events-none"
          style={{ 
            opacity: '1',  // The image already has low opacity, so we use full opacity here
            transform: 'scale(1.4) translateX(-40px)'  // Slight adjustments for positioning
          }}
        />
        
        {/* Main content */}
        <div className="relative px-4 py-3 pr-6 z-10">
          <div className="flex items-center gap-3">
            {/* Heart icon */}
            <div className="flex-shrink-0 bg-white/25 backdrop-blur-sm p-2 rounded-lg border border-white/30"
                 style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}>
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            
            {/* Text content */}
            <div className="flex-1 text-left">
              <h3 className="font-bold text-base leading-tight text-white" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                Questions About Your Baby?
              </h3>
              <p className="text-pink-100 text-[10px] leading-tight mt-0.5" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)' }}>
                Naya: Your 4th Trimester Virtual Provider<br />Curated by Dr. Patel
              </p>
              <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-pink-50" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>Available 24/7</span>
                <span className="text-pink-200/80 text-xs" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>• Click to start</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Flashing green status indicator */}
        <div className="absolute top-3 right-3 w-2 h-2 bg-green-300 rounded-full shadow-lg border border-white/40 animate-pulse"></div>
        
        {/* Enhanced border */}
        <div className="absolute inset-0 rounded-xl border border-white/30 pointer-events-none"
             style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }}></div>
      </button>
      )}
      
      {/* Custom gentle bounce animation */}
       <style jsx>{`
         @keyframes gentle-bounce {
           0%, 100% { transform: translateY(0px); }
           50% { transform: translateY(-3px); }
         }
         .scrollbar-hide {
           -ms-overflow-style: none;
           scrollbar-width: none;
         }
         .scrollbar-hide::-webkit-scrollbar {
           display: none;
         }
         .nav-scroll {
           -webkit-overflow-scrolling: touch;
           scroll-behavior: smooth;
         }
       `}</style>

      {/* Consolidated Admin Dashboard */}
      {showAdminDashboard && (
        <ConsolidatedAdminDashboard onClose={() => setShowAdminDashboard(false)} />
      )}

      {/* Satisfaction Survey */}
      {showSurvey && (
        <SatisfactionSurvey
          onClose={handleSurveyClose}
          onSubmit={handleSurveySubmit}
          sessionData={{
            duration: Math.floor((Date.now() - sessionStartTime) / 1000),
            messageCount: sessionMessageCountRef.current,
            userEmail: currentUser?.email || 'anonymous',
            babyProfileId: activeBabyProfile?.id || null,
            isEmbed: isEmbedMode,
            featureUsage: featureUsageRef.current
          }}
        />
      )}

      {/* Growth Measurement Modal */}
      <GrowthMeasurementModal
        isOpen={showGrowthModal}
        onClose={() => setShowGrowthModal(false)}
        onSave={handleSaveGrowthMeasurement}
        activeBabyProfile={activeBabyProfile}
        babyGender={activeBabyProfile?.gender || 'male'}
      />

      {/* Sleep Duration Modal */}
      {showSleepDurationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <Moon className="w-6 h-6 mr-2 text-blue-500" />
                How long did baby sleep?
              </h3>
              <button
                onClick={() => setShowSleepDurationModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={sleepDurationInput.hours}
                    onChange={(e) => setSleepDurationInput(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center text-2xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minutes</label>
                  <select
                    value={sleepDurationInput.minutes}
                    onChange={(e) => setSleepDurationInput(prev => ({ ...prev, minutes: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center text-2xl font-bold"
                  >
                    <option value="0">0</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Total sleep:</strong> {sleepDurationInput.hours}h {sleepDurationInput.minutes}m
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => setShowSleepDurationModal(false)}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveSleepLog(sleepDurationInput.hours, sleepDurationInput.minutes)}
                  className="px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Log Sleep
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Access Button - Hidden by default, only shown with keyboard shortcut */}
      {/* Removed for production - use Ctrl+Shift+A to access admin */}
    </div>
  );
};

export default NayaCareChatbot;