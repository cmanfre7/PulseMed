import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, X, AlertTriangle, Download, Phone, Heart, Moon, Baby, Coffee, Camera, Image, HelpCircle, Settings, Shield, Target, Brain, Package, Droplets, Activity, Volume2, Calendar, Search, TrendingUp, Sun, Thermometer, Smile, RotateCcw, Square, Move, Footprints, AlertCircle, CheckCircle, Milk, MessageCircle, BookOpen, FileText, Settings as SettingsIcon } from 'lucide-react';
import GrowthCharts from './components/GrowthCharts';
import AgeTimeline from './components/AgeTimeline';
import ConsolidatedAdminDashboard from './components/ConsolidatedAdminDashboard';
import memoryManager from './utils/memoryManager';

// Check if app is opened in popup mode (DISABLED - always show original design)
const isPopupMode = false;

// Check if app is embedded in iframe (for HubSpot homepage)
const isEmbedMode = new URLSearchParams(window.location.search).get('embed') === 'true';

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
  cleaned = cleaned.replace(/\*[a-z]+\*\s*/gi, '');
  cleaned = cleaned.replace(/^(hi|hello|hey)( there)?[,!]?\s*/i, '');
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`[^`]+`/g, '');
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');

  cleaned = cleaned
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s*[•·]\s*/gm, '- ');

  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '- ');

  return cleaned;
};

const NayaCareChatbot = () => {
  const [isOpen, setIsOpen] = useState(isEmbedMode); // Auto-open if embedded
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [activeSection, setActiveSection] = useState('chat');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [legalDocsViewed, setLegalDocsViewed] = useState({
    terms: false,
    privacy: false
  });
  
  const [babyProfiles, setBabyProfiles] = useState([]);
  const [activeBabyProfile, setActiveBabyProfile] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [feedingLogs, setFeedingLogs] = useState([]);
  const [sleepLogs, setSleepLogs] = useState([]);

  // Keyboard shortcuts for admin features
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdminDashboard(true);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        if (!hasConsented) {
          setHasConsented(true);
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

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  useEffect(() => {
    if (!memoryManager.getMemory('session_start')) {
      memoryManager.saveMemory('session_start', Date.now());
    }

    const savedProfile = memoryManager.getUserProfile();
    if (savedProfile && !activeBabyProfile) {
      setActiveBabyProfile(savedProfile);
    }

    const conversationId = memoryManager.getMemory('current_conversation_id');
    if (conversationId) {
      const savedConversation = memoryManager.getConversation(conversationId);
      if (savedConversation && savedConversation.messages.length > 0) {
        setMessages(savedConversation.messages);
      }
    }

    memoryManager.cleanupExpiredMemories();
  }, []);

  const calculateBabyAge = (birthDate) => {
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
    'call 911', 'not breathing', 'stopped breathing', 'turning blue', 'blue baby',
    'seizure', 'unconscious', 'bleeding heavily', 'severe chest pain', 'fainting'
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
    setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
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

  const sendImageWithMessage = () => {
    if (!selectedImage && !inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue || 'Shared a photo',
      sender: 'user',
      timestamp: new Date(),
      image: selectedImage ? selectedImage.preview : null,
      imageName: selectedImage ? selectedImage.name : null
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (checkForEmergency(currentInput)) {
      setShowEmergencyModal(true);
    }

    simulateTyping();

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: generateImageResponse(currentInput, selectedImage),
        sender: 'bot',
        timestamp: new Date(),
        canGeneratePDF: false
      };
      setMessages(prev => [...prev, botResponse]);
    }, 2000);
  };

  const generateImageResponse = (input, image) => {
    if (image) {
      return "Thank you for sharing this photo! I can see your little one. While I can't provide medical diagnosis from photos, I can offer general guidance about what you're seeing.\n\nPlease describe what you're concerned about, and I'll provide educational information based on Dr. Sonal Patel's guidance. Remember, this is for educational purposes only and doesn't replace medical care.\n\nFor any urgent concerns, please contact your pediatrician directly.";
    }
    return generateMockResponse(input);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setConversationHistory(prev => [...prev, inputValue]);
    const currentInput = inputValue;
    setInputValue('');

    const conversationId = memoryManager.getMemory('current_conversation_id') || `conv_${Date.now()}`;
    memoryManager.saveMemory('current_conversation_id', conversationId);
    
    const updatedMessages = [...messages, userMessage];
    memoryManager.saveConversation(conversationId, updatedMessages, {
      babyAge: activeBabyProfile ? calculateBabyAge(activeBabyProfile.birthDate) : null,
      babyName: activeBabyProfile?.name,
      sessionStart: memoryManager.getMemory('session_start') || Date.now()
    });

    if (checkForEmergency(currentInput)) {
      setShowEmergencyModal(true);
    }

    const context = {
      babyAge: activeBabyProfile ? calculateBabyAge(activeBabyProfile.birthDate) : null,
      babyName: activeBabyProfile?.name,
      isMultiple: activeBabyProfile?.isMultiple,
      recentTopics: conversationHistory.slice(-3),
      feedingPattern: feedingLogs.slice(-5),
      sleepPattern: sleepLogs.slice(-5),
      currentMilestone: activeBabyProfile ? getMilestoneGuidance(calculateBabyAge(activeBabyProfile.birthDate).weeks).currentMilestone : null
    };

    simulateTyping();

    try {
      const recentMessages = messages.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, history: recentMessages })
      });

      let answerText = '';
      let canGeneratePDF = false;
      
      if (res.ok) {
        const data = await res.json();
        answerText = data?.answer || generateMockResponse(currentInput);
        canGeneratePDF = data?.canGeneratePDF || false;
      } else {
        answerText = generateMockResponse(currentInput);
      }

      const botResponse = {
        id: Date.now() + 1,
        text: answerText,
        sender: 'bot',
        timestamp: new Date(),
        canGeneratePDF: canGeneratePDF
      };
      setMessages(prev => [...prev, botResponse]);

      const finalMessages = [...messages, userMessage, botResponse];
      memoryManager.saveConversation(conversationId, finalMessages, {
        babyAge: activeBabyProfile ? calculateBabyAge(activeBabyProfile.birthDate) : null,
        babyName: activeBabyProfile?.name,
        sessionStart: memoryManager.getMemory('session_start') || Date.now()
      });

      memoryManager.saveLearning({
        userInput: currentInput,
        botResponse: answerText,
        context: {
          babyAge: activeBabyProfile ? calculateBabyAge(activeBabyProfile.birthDate) : null,
          conversationLength: messages.length
        }
      });
    } catch (e) {
      const botResponse = {
        id: Date.now() + 1,
        text: generateMockResponse(currentInput),
        sender: 'bot',
        timestamp: new Date(),
        canGeneratePDF: false
      };
      setMessages(prev => [...prev, botResponse]);
    } finally {
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
    { id: 1, title: "Newborn Sleep Guide", category: "Sleep", description: "Complete guide to safe sleep practices", icon: "Moon", downloadCount: 2300 },
    { id: 2, title: "Breastfeeding Basics", category: "Feeding", description: "Comprehensive breastfeeding guide", icon: "Baby", downloadCount: 3100 },
    { id: 3, title: "Postpartum Recovery Timeline", category: "Recovery", description: "Week-by-week healing guide", icon: "Heart", downloadCount: 1800 },
    { id: 4, title: "When to Call the Doctor", category: "Emergency", description: "Red flag symptoms guide", icon: "Phone", downloadCount: 4200 },
    { id: 5, title: "4th Trimester Nutrition", category: "Wellness", description: "Nutrition guide for recovery", icon: "Coffee", downloadCount: 1500 }
  ];

  const quickTopics = [
    { icon: "Droplets", text: "Breastfeeding help", topic: "breastfeeding" },
    { icon: "Moon", text: "Sleep concerns", topic: "sleep" },
    { icon: "Milk", text: "Bottle feeding", topic: "bottle" },
    { icon: "Sun", text: "Jaundice info", topic: "jaundice" },
    { icon: "Thermometer", text: "Fever guidelines", topic: "fever" },
    { icon: "Baby", text: "Diaper changes", topic: "diaper" }
  ];

  // Component definitions (BabyProfileSetup, QuickLogButtons, etc. - keeping them as they are)
  // [Previous component code remains the same - I'll include the key ones]

  const BabyProfileSetup = () => {
    const [profileData, setProfileData] = useState({
      name: '',
      birthDate: '',
      isMultiple: false,
      numberOfBabies: 1
    });

    const handleSaveProfile = () => {
      if (!profileData.name || !profileData.birthDate) return;
      
      const newProfile = {
        id: Date.now(),
        name: profileData.name,
        birthDate: profileData.birthDate,
        isMultiple: profileData.isMultiple,
        numberOfBabies: profileData.numberOfBabies,
        createdAt: new Date()
      };
      
      setBabyProfiles(prev => [...prev, newProfile]);
      setActiveBabyProfile(newProfile);
      setShowProfileSetup(false);
      
      const age = calculateBabyAge(profileData.birthDate);
      const welcomeMessage = {
        id: Date.now(),
        text: `Welcome! My name is Naya and I'll be your pregnancy and postpartum companion. I see your little one ${profileData.name} is ${age.ageString} old. I'll provide age-appropriate guidance for your ${age.weeks < 4 ? 'newborn' : 'baby'}. What can I help you with today?`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, welcomeMessage]);
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Baby's Name</label>
              <input
                type="text"
                placeholder="Enter baby's name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-400 transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
              <input
                type="date"
                value={profileData.birthDate}
                onChange={(e) => setProfileData(prev => ({ ...prev, birthDate: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-400 transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Babies</label>
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
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowProfileSetup(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
              >
                Skip for Now
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={!profileData.name || !profileData.birthDate}
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

  const ConsentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl max-w-xl w-full p-2 sm:p-6 shadow-2xl border border-pink-100 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-center mb-2 sm:mb-6">
          <div className="bg-pink-100 p-2 sm:p-3 rounded-full mr-2 sm:mr-3">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500" />
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Welcome to Your Pregnancy & Postpartum Companion</h3>
            <p className="text-sm sm:text-base text-pink-600 font-medium">Dr. Sonal Patel's Trusted Guidance</p>
          </div>
        </div>
        
        <div className="space-y-1 sm:space-y-4 text-gray-700 mb-2 sm:mb-6">
          <div className="bg-white p-1.5 sm:p-4 rounded-lg shadow-sm border border-pink-100">
            <p className="text-sm sm:text-base font-semibold text-gray-800 mb-2">
              This chat provides educational guidance only and does not replace medical care
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

          <div className="bg-white p-1.5 sm:p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-2 text-center">
              <strong>Legal:</strong> By using this service, you agree to our:
            </p>
            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setLegalDocsViewed(prev => ({ ...prev, terms: true }));
                  window.open('https://www.nayacare.org/terms-of-service', '_blank');
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
                  window.open('https://www.nayacare.org/privacy-policy', '_blank');
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
            onClick={() => {
              setIsOpen(false);
              if (isEmbedMode && window.parent !== window) {
                window.parent.postMessage('closeNayaCareModal', '*');
              }
            }}
            className="w-full sm:flex-1 px-4 py-1.5 sm:py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200 text-sm"
          >
            Not Now
          </button>
          <button
            onClick={() => {
              setHasConsented(true);
              if (babyProfiles.length === 0) {
                setShowProfileSetup(true);
              } else {
                setMessages([{
                  id: 1,
                  text: "Hello! I'm Naya, your pregnancy and postpartum companion. I'm here to provide educational support about newborn care, feeding, sleep, and your postpartum journey.\n\nYou can ask me questions, browse our resource library, or select from common topics. You can even send photos of your little one for additional guidance.\n\nWhat can I help you with today?",
                  sender: 'bot',
                  timestamp: new Date()
                }]);
              }
            }}
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

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setHasConsented(true);
              setLegalDocsViewed({ terms: true, privacy: true });
              setMessages([{
                id: 1,
                text: "Hello! I'm Naya, your pregnancy and postpartum companion. Admin bypass activated - ready to assist!",
                sender: 'bot',
                timestamp: new Date()
              }]);
            }}
            className="text-xs text-gray-400 hover:text-pink-500 transition-colors duration-200"
            title="Admin bypass - Skip consent (Ctrl+Shift+B)"
          >
            Admin Access
          </button>
        </div>
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
            <p className="font-bold text-red-800 mb-2">If this is an emergency:</p>
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
            Call 911
          </a>
        </div>
      </div>
    </div>
  );

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
              p: (props) => <p {...props} className="mb-3 leading-relaxed text-gray-800" />,
              ul: (props) => <ul {...props} className="list-disc pl-5 space-y-2 marker:text-pink-400" />,
              ol: (props) => <ol {...props} className="list-decimal pl-5 space-y-2 marker:text-pink-400" />,
              li: (props) => <li {...props} className="pl-1" />,
              strong: (props) => <strong {...props} className="text-gray-900 font-semibold" />
            }}
          >
            {displayText}
          </ReactMarkdown>
          {isBot && message.canGeneratePDF && (
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
              {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          )}
        </div>
      </div>
    );
  };

  // ResourcesSection component (keeping as is)
  const ResourcesSection = () => {
    const [resources, setResources] = useState(mockResources);
    const [loading, setLoading] = useState(false);

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
                    onClick={() => alert('PDF not available yet. Please check back later.')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Coming Soon
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="mt-12 bg-pink-50 rounded-xl p-6 border border-pink-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">More Resources Coming Soon</h3>
            <p className="text-gray-600">Dr. Sonal Patel is continuously updating our resource library with new guides, checklists, and educational materials to support your journey.</p>
          </div>
        </div>
      </div>
    );
  };

  // CRITICAL: Render function for embed mode - returns ONLY the chat interface
  const renderFullChatInterface = () => {
    return (
      <div className="w-full h-screen bg-white flex flex-col">
        {showEmergencyModal && <EmergencyModal />}
        
        {!hasConsented ? (
          <ConsentModal />
        ) : showProfileSetup ? (
          <BabyProfileSetup />
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-300 to-pink-400 text-white px-3 sm:px-6 py-3 sm:py-4 flex items-center shadow-lg relative z-10">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl">Pregnancy & Postpartum Companion</h3>
                  <p className="text-xs sm:text-sm opacity-90">
                    {activeBabyProfile 
                      ? `${activeBabyProfile.name} - ${calculateBabyAge(activeBabyProfile.birthDate).ageString} old`
                      : "Dr. Sonal Patel's Care Through Pregnancy and Beyond"
                    }
                  </p>
                </div>
              </div>
              
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
              
              <div className="flex items-center space-x-1 sm:space-x-3">
                <div className="flex items-center space-x-1 sm:space-x-2 bg-white bg-opacity-10 rounded-full px-2 sm:px-3 py-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-white hidden sm:inline">Online</span>
                </div>
                
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    if (isEmbedMode && window.parent !== window) {
                      window.parent.postMessage('closeNayaCareModal', '*');
                    }
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 sm:p-2 transition-all duration-200"
                  title="Close chat"
                >
                  <X className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {activeSection === 'chat' ? (
              <>
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
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-pink-25 to-white relative z-10">
                  <div className="max-w-4xl mx-auto">
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
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

                <div className="border-t border-pink-100 p-3 sm:p-6 bg-white relative z-10">
                  <div className="max-w-4xl mx-auto">
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
                        onKeyPress={(e) => e.key === 'Enter' && (selectedImage ? sendImageWithMessage() : handleSendMessage())}
                        placeholder="Ask about your baby..."
                        className="flex-1 border-2 border-pink-200 rounded-xl px-3 sm:px-5 py-3 sm:py-4 text-sm sm:text-base focus:outline-none focus:border-pink-400 transition-all duration-200"
                        disabled={isTyping}
                      />
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isTyping}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 sm:p-4 rounded-xl transition-all duration-200 disabled:opacity-50"
                        title="Upload photo"
                      >
                        <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      
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
              <div className="flex-1 overflow-y-auto bg-white">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Activity Log</h2>
                  <p className="text-gray-600 mb-6">Track your baby's feeding, sleep, and development</p>
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <p className="text-gray-700">Log section - Feature coming soon</p>
                  </div>
                </div>
              </div>
            ) : activeSection === 'development' ? (
              <div className="flex-1 overflow-y-auto bg-white">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Development Tracking</h2>
                  <p className="text-gray-600 mb-6">Monitor your baby's growth and milestones</p>
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <p className="text-gray-700">Development section - Feature coming soon</p>
                  </div>
                </div>
              </div>
            ) : activeSection === 'education' ? (
              <div className="flex-1 overflow-y-auto bg-white">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Educational Videos</h2>
                  <p className="text-gray-600 mb-6">Watch Dr. Sonal Patel's expert guidance</p>
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <p className="text-gray-700">Education section - Feature coming soon</p>
                  </div>
                </div>
              </div>
            ) : activeSection === 'triage' ? (
              <div className="flex-1 overflow-y-auto bg-white">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Health Triage</h2>
                  <p className="text-gray-600 mb-6">Symptom checker and health assessments</p>
                  <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                    <p className="text-gray-700">Triage section - Feature coming soon</p>
                  </div>
                </div>
              </div>
            ) : (
              <ResourcesSection />
            )}
          </>
        )}

        {showAdminDashboard && (
          <ConsolidatedAdminDashboard onClose={() => setShowAdminDashboard(false)} />
        )}
      </div>
    );
  };

  // CRITICAL: Check if embed mode at the very end
  if (isEmbedMode) {
    return renderFullChatInterface();
  }

  // Normal mode - render floating widget
  return (
    <div className="fixed bottom-6 right-6 z-40">
      {showEmergencyModal && <EmergencyModal />}
      
      {isOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col w-full h-full">
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
          
          {!hasConsented ? (
            <div className="relative z-10">
              <ConsentModal />
            </div>
          ) : showProfileSetup ? (
            <div className="relative z-10">
              <BabyProfileSetup />
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-pink-300 to-pink-400 text-white px-3 sm:px-6 py-3 sm:py-4 flex items-center shadow-lg relative z-10">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl">Pregnancy & Postpartum Companion</h3>
                    <p className="text-xs sm:text-sm opacity-90">
                      {activeBabyProfile 
                        ? `${activeBabyProfile.name} - ${calculateBabyAge(activeBabyProfile.birthDate).ageString} old`
                        : "Dr. Sonal Patel's Care Through Pregnancy and Beyond"
                      }
                    </p>
                  </div>
                </div>
                
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
                
                <div className="flex items-center space-x-1 sm:space-x-3">
                  <div className="flex items-center space-x-1 sm:space-x-2 bg-white bg-opacity-10 rounded-full px-2 sm:px-3 py-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-300 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-white hidden sm:inline">Online</span>
                  </div>
                  
                  <button 
                    onClick={() => alert('Help: This is Dr. Sonal Patel\'s Pregnancy & Postpartum Companion. You can ask questions about newborn care, feeding, sleep, and postpartum wellness. For emergencies, call 911.')}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 sm:p-2 transition-all duration-200"
                    title="Get help"
                  >
                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 sm:p-2 transition-all duration-200"
                    title="Close chat"
                  >
                    <X className="w-4 h-4 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              {activeSection === 'chat' ? (
                <>
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
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-pink-25 to-white relative z-10">
                    <div className="max-w-4xl mx-auto">
                      {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
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

                  <div className="border-t border-pink-100 p-3 sm:p-6 bg-white relative z-10">
                    <div className="max-w-4xl mx-auto">
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
                          onKeyPress={(e) => e.key === 'Enter' && (selectedImage ? sendImageWithMessage() : handleSendMessage())}
                          placeholder="Ask about your baby..."
                          className="flex-1 border-2 border-pink-200 rounded-xl px-3 sm:px-5 py-3 sm:py-4 text-sm sm:text-base focus:outline-none focus:border-pink-400 transition-all duration-200"
                          disabled={isTyping}
                        />
                        
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isTyping}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 sm:p-4 rounded-xl transition-all duration-200 disabled:opacity-50"
                          title="Upload photo"
                        >
                          <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        
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
              ) : (
                <ResourcesSection />
              )}
            </>
          )}
        </div>
      )}

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
        <img 
          src="/pregnant-woman-silhouette.png" 
          alt="" 
          className="absolute inset-0 w-full h-full object-contain object-right pointer-events-none"
          style={{ 
            opacity: '1',
            transform: 'scale(1.4) translateX(-40px)'
          }}
        />
        
        <div className="relative px-4 py-3 pr-6 z-10">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 bg-white/25 backdrop-blur-sm p-2 rounded-lg border border-white/30"
                 style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}>
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            
            <div className="flex-1 text-left">
              <h3 className="font-bold text-base leading-tight text-white" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                Questions About Your Baby?
              </h3>
              <p className="text-pink-100 text-xs font-small mt-0.5" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)' }}>
                Dr. Sonal Patel's Pregnancy & Postpartum Companion
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-pink-50" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>Available 24/7</span>
                <span className="text-pink-200/80 text-xs" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>• Click to start</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-3 right-3 w-2 h-2 bg-green-300 rounded-full shadow-lg border border-white/40 animate-pulse"></div>
        
        <div className="absolute inset-0 rounded-xl border border-white/30 pointer-events-none"
             style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }}></div>
      </button>
      
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

      {showAdminDashboard && (
        <ConsolidatedAdminDashboard onClose={() => setShowAdminDashboard(false)} />
      )}
    </div>
  );
};

export default NayaCareChatbot;