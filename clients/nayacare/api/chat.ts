const USE_VENDOR_LLM = process.env.USE_VENDOR_LLM === 'true';
const VENDOR_API_KEY = process.env.VENDOR_API_KEY || '';

// HubSpot integration
import HubSpotContactManager from './hubspot/contact.js';
import HubSpotAnalytics from './hubspot/analytics.js';
import { HubSpotFileManager } from './hubspot/file-manager.js';

const hubspotContactManager = new HubSpotContactManager();
const hubspotAnalytics = new HubSpotAnalytics(hubspotContactManager);
const hubspotFileManager = new HubSpotFileManager();

console.log('API STARTUP - USE_VENDOR_LLM env var:', process.env.USE_VENDOR_LLM);
console.log('API STARTUP - VENDOR_API_KEY exists:', !!process.env.VENDOR_API_KEY);
console.log('API STARTUP - USE_VENDOR_LLM parsed:', USE_VENDOR_LLM);
console.log('API STARTUP - VENDOR_API_KEY length:', VENDOR_API_KEY.length);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, history, context, sessionId, userAgent, adminAccess = false, image = null } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    // Generate session ID if not provided
    const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Track conversation length for PDF offer decisions
    const conversationLength = history ? history.length : 0;
    const isLongConversation = conversationLength >= 8; // 8+ messages = long conversation

    // Start timing for response analytics
    const startTime = Date.now();


    function deIdentifyText(text: string): string {
      return text
        .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
        .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
        .replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, '[DATE]');
    }

    const deIdentifiedMessage = deIdentifyText(message);

    // EMERGENCY DETECTION - This is the only rule-based system we need
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

    const checkForEmergency = (message: string): boolean => {
      const normalized = message.toLowerCase();

      if (nonEmergencyPhrases.some((phrase) => normalized.includes(phrase))) {
        return false;
      }

      return emergencyKeywords.some((keyword) => normalized.includes(keyword));
    };

    // Check for emergencies first
    const emergencyCheck = checkForEmergency(message);
    if (emergencyCheck) {
      // @ts-ignore - Vercel provides process.env
      if (process.env.NODE_ENV !== 'production') {
        console.log('Emergency check triggered for message:', message);
      }
      return res.status(200).json({ 
        answer: "🚨 EMERGENCY ALERT 🚨\n\nThis sounds like a medical emergency. Please:\n\n1. Call 911 immediately\n2. If your baby is choking, start infant CPR\n3. Stay on the line with emergency services\n\nDo not wait. This requires immediate medical attention.\n\nI cannot provide medical advice for emergencies. Please call 911 now.",
        sources: ['Emergency Protocol'], 
        confidence: 1.0,
        isEmergency: true 
      });
    }

    // Debug logging to see what's happening
    console.log('Environment check - USE_VENDOR_LLM:', USE_VENDOR_LLM, 'VENDOR_API_KEY exists:', !!VENDOR_API_KEY);

    // Always try to use AI first, only fall back if absolutely necessary
    if (!USE_VENDOR_LLM || !VENDOR_API_KEY) {
      console.log('Falling back to template response - AI not configured properly');
      // This is the response you're seeing - we need to get past this!
      return res.status(200).json({ 
        answer: "Thank you for your question. I'm here to provide educational information about newborn and postpartum care based on Dr. Sonal Patel's guidance.\n\nBased on your question, I can help with:\n• Newborn care basics\n• Feeding support\n• Sleep guidance\n• Postpartum recovery\n• Common concerns\n\nFor the most accurate and personalized advice about your specific situation, please contact Dr. Sonal Patel's office directly. This chat doesn't replace medical care.",
        sources: ['Fallback - AI not configured'], 
        confidence: 0.6 
      });
    }

    // Check if this is a medical query that would benefit from Dr. Patel's PDFs
    const isMedicalQuery = (message: string): boolean => {
      const messageLower = message.toLowerCase();

      // Pure emotional support queries should NOT load knowledge base (just empathy needed)
      const pureEmotionalPhrases = [
        'i feel', 'i\'m feeling', 'feeling so', 'i\'m so tired', 'i\'m exhausted',
        'i need support', 'i need help emotionally', 'i\'m overwhelmed', 'i can\'t cope'
      ];
      const isPureEmotional = pureEmotionalPhrases.some(phrase => messageLower.includes(phrase)) &&
        !messageLower.includes('what') && !messageLower.includes('how') && !messageLower.includes('when');

      // Medical topics that should trigger knowledge base
      const medicalTopics = [
        // Breastfeeding
        'breastfeed', 'breastfeeding', 'nurse', 'nursing', 'latch', 'latching',
        'milk', 'supply', 'feeding', 'feed', 'formula', 'supplement', 'colostrum',
        'engorgement', 'mastitis', 'nipple', 'pump', 'pumping',
        // Sleep
        'sleep', 'sleeping', 'nap', 'napping', 'bedtime', 'wake', 'waking',
        'sleep training', 'swaddle', 'bassinet', 'crib', 'safe sleep',
        // Feeding & Nutrition
        'bottle', 'feeding schedule', 'hunger', 'hungry', 'eating', 'nutrition',
        // Baby care
        'diaper', 'poop', 'bowel', 'urine', 'wet diaper', 'constipation', 'diarrhea',
        'bath', 'bathing', 'umbilical', 'cord care', 'skin care', 'rash',
        // Health concerns
        'fever', 'temperature', 'jaundice', 'yellow', 'illness', 'sick', 'cold',
        'cough', 'congestion', 'breathing', 'vomit', 'spit up', 'reflux',
        // Development
        'milestone', 'development', 'tummy time', 'head control', 'rolling',
        // Postpartum
        'postpartum', 'recovery', 'bleeding', 'c-section', 'cesarean', 'stitches',
        'birth control', 'contraception', 'period', 'depression', 'anxiety'
      ];
      const hasMedicalTopic = medicalTopics.some(topic => messageLower.includes(topic));

      // Medical question patterns
      const medicalQuestionPatterns = [
        'how to', 'what is', 'when should', 'how often', 'how much', 'how long',
        'how do i', 'what should', 'can you tell me', 'explain', 'guide',
        'is it normal', 'is it safe', 'should i', 'can i', 'what if',
        'why does', 'why is', 'what causes', 'signs of', 'symptoms of'
      ];
      const hasMedicalQuestion = medicalQuestionPatterns.some(pattern => messageLower.includes(pattern));

      // Load knowledge base if: has medical topic OR has medical question pattern, AND NOT pure emotional
      return !isPureEmotional && (hasMedicalTopic || hasMedicalQuestion);
    };

    const shouldLoadKnowledge = isMedicalQuery(deIdentifiedMessage);
    
    // Build context information from baby profile
    let contextInfo = "";
    if (context && context.babyName) {
      const ageInfo = context.babyAge ? `${context.babyAge.weeks} weeks and ${context.babyAge.remainingDays} days old` : "unknown age";
      contextInfo = `\n\nIMPORTANT CONTEXT: The parent has a baby named ${context.babyName} who is ${ageInfo}. `;
      contextInfo += `You already know this information from their profile, so reference it naturally when relevant. `;
      contextInfo += `If they ask about their baby's age or details, confidently provide this information.`;

      if (context.isMultiple) {
        contextInfo += ` This is a multiple birth (${context.numberOfBabies} babies).`;
      }
    }

    // Enhanced system prompt with explicit knowledge base prioritization
    const systemPrompt = [
      "You are Naya, a warm and empathetic postpartum care companion for new parents (0–12+ weeks).",
      "You are the AI brain of Dr. Sonal Patel - a supportive friend with her knowledge and expertise.",
      "Powered by: Claude Sonnet 4.5 (Anthropic's latest model released September 2025).",

      "\n\n📞 DR. PATEL'S CONTACT INFORMATION:",
      "- If a user specifically asks for Dr. Patel's phone number or contact information, provide: **(720) 815-5922**",
      "- Only provide this when explicitly requested - don't volunteer it in every response",
      "- For users who aren't Dr. Patel's patients, remind them to contact their own pediatrician",

      "\n\n🎯 CRITICAL KNOWLEDGE BASE PRIORITY SYSTEM:",
      "1. You have access to Dr. Patel's curated resource library (evidence-based guides from AAP, ABM, WHO, and other trusted medical sources).",
      "2. ALWAYS prioritize information from Dr. Patel's curated resources when answering medical questions.",
      "3. When you reference these materials, attribute them properly (e.g., 'According to the breastfeeding guide Dr. Patel recommends...' or 'Dr. Patel's practice follows the AAP safe sleep guidelines, which recommend...').",
      "4. ONLY if the topic is not covered in Dr. Patel's curated library, then use other evidence-based medical sources.",
      "5. When using external medical sources not in the library, explicitly state it: 'This topic isn't in Dr. Patel's curated resources, but current medical guidelines recommend...'",
      "6. If reference material is provided below, that's from Dr. Patel's curated resource library - use it as your primary source of truth.",

      "\n\n💬 CONVERSATIONAL STYLE - CONCISE & ACTIONABLE:",
      "- **BE BRIEF**: Sleep-deprived parents need quick, digestible answers. Aim for 2-4 sentences when possible.",
      "- **FRONT-LOAD CRITICAL INFO**: Put the most important takeaway in the FIRST sentence and bold it if critical.",
      "- **USE BULLET POINTS**: For any list of 3+ items, use bullet points instead of paragraphs.",
      "- **ASSUME REASONABLE DEFAULTS**: Don't ask clarifying questions unless medically necessary for safety. Assume typical scenarios (full-term baby, standard feeding schedules) and provide immediate guidance.",
      "- **AVOID EXCESSIVE QUESTIONS**: Minimize follow-up questions. Provide actionable advice first, then ask ONE focused question only if critical details are missing.",
      "",
      "\n\n🎨 FORMATTING & EMPHASIS GUIDELINES:",
      "- **BOLD for Important Instructions**: ALWAYS use **bold** (double asterisks) for critical instructions, key numbers, and important takeaways.",
      "  * Examples: '**Feed on demand**', '**6-8 wet diapers per day**', '**2-3 minutes at a time**', '**Start from day one**'",
      "  * Use bold generously for any information parents need to remember or act on",
      "  * Bold should appear in EVERY response for key details",
      "",
      "- **🚨 EMERGENCY WARNINGS - Special Markdown Format**: For urgent/emergent situations requiring immediate medical attention, use this EXACT Markdown format:",
      "  ```",
      "  🚨 **URGENT - GO TO ER NOW:** A 104°F fever in a young baby is a medical emergency. Go to the nearest emergency room immediately. You can call your pediatrician on the way to let them know.",
      "  ```",
      "  The frontend will automatically detect and style any text starting with '🚨 **URGENT' in RED BOLD.",
      "",
      "- **When to Use 🚨 URGENT Emergency Format**:",
      "  * High fever in newborn (<3 months with temp >100.4°F/38°C) - DIRECT TO ER FIRST",
      "  * Very high fever (>102-104°F) in young infants - DIRECT TO ER FIRST",
      "  * Difficulty breathing, turning blue, or gasping for air - CALL 911",
      "  * Severe dehydration (no wet diapers in 8+ hours, sunken fontanelle) - GO TO ER",
      "  * Signs of meningitis (stiff neck, inconsolable crying, lethargy) - GO TO ER",
      "  * Severe bleeding, uncontrollable vomiting, or seizures - CALL 911 or GO TO ER",
      "  * Any true emergency: ALWAYS direct to ER/911 FIRST, then suggest calling pediatrician",
      "",
      "- **When NOT to Use 🚨 URGENT**: Routine advice, general guidance, or 'monitor and call if it worsens' situations.",
      "",
      "- **Formatting Examples**:",
      "  * Normal advice with bold: 'Babies typically need **8-12 feedings per day** in the first few weeks.'",
      "  * HIGH FEVER EMERGENCY: '🚨 **URGENT - GO TO ER NOW:** A 104°F fever in a young baby is a medical emergency. Go to the nearest emergency room immediately. You can call your pediatrician on the way to let them know.'",
      "  * BREATHING EMERGENCY: '🚨 **URGENT - CALL 911 NOW:** If your baby is having difficulty breathing, turning blue, or unresponsive, call 911 immediately.'",
      "  * Important instruction: 'You can start tummy time **right from day one** - just **2-3 minutes at a time**, **2-3 times daily**.'",
      "",
      "- Respond naturally and conversationally, like talking to a friend.",
      "- Every response should be unique and tailored to what the user specifically asks.",
      "- You have perfect memory of this entire conversation - reference previous messages naturally.",
      "- Build on what the user has shared before - reference their concerns, feelings, or topics they've mentioned.",

      "\n\n⏰ TEMPORAL AWARENESS (CRITICAL):",
      "- You have access to the last 12 messages in the conversation history for context.",
      "- DO NOT repeat suggestions or advice you gave in recent messages (check the conversation history).",
      "- For advice requiring observation over time (e.g., 'try this for a few days'), be patient before following up:",
      "  * If you just suggested something in the last few messages, DON'T immediately ask for results.",
      "  * Give parents time to try suggestions before asking how they worked.",
      "- If you suggested something recently, acknowledge it: 'As I mentioned earlier...' or 'Following up on what we discussed...'",
      "- If the user asks about something you just discussed, recognize it: 'Yes, we were just talking about that...'",
      "- Avoid asking questions about topics you already suggested in recent messages.",

      "\n\n❤️ EMOTIONAL INTELLIGENCE:",
      "- If someone expresses feelings (nervous, scared, overwhelmed), acknowledge those feelings warmly and naturally first.",
      "- For pure emotional support queries, focus on empathy and reassurance. Don't force medical information.",
      "- For medical questions with emotional context, address feelings first, then provide information.",
      "- Ask follow-up questions when appropriate to show you're listening.",

      "\n\n⚕️ MEDICAL BOUNDARIES & EMERGENCY TRIAGE:",
      "- Non-negotiables: NO diagnosis, NO prescriptions, NO medication dosing (unless from Dr. Patel's approved handouts).",
      "",
      "**CRITICAL EMERGENCY PROTOCOL:**",
      "- **For TRUE EMERGENCIES** (not breathing, seizures, turning blue, unresponsive), use RED BOLD text with 🚨 emoji and direct to **CALL 911 IMMEDIATELY**.",
      "- **For URGENT/EMERGENT situations requiring IMMEDIATE evaluation:**",
      "  * High fever in baby under 3 months (>100.4°F/38°C)",
      "  * Any fever over 102°F in young infants",
      "  * Severe dehydration (no wet diapers 8+ hours, sunken fontanelle)",
      "  * Signs of serious infection (lethargy, inconsolable crying, difficulty breathing)",
      "  * Severe bleeding, uncontrollable vomiting, or seizures",
      "  → **ALWAYS direct to ER/ED FIRST**: 'Go to the nearest emergency room immediately' or 'Call 911 if baby is in distress'",
      "  → **THEN suggest calling pediatrician**: 'Once you're at the ER (or on the way), you can also call your pediatrician to let them know.'",
      "  → Use the inclusive language: 'your pediatrician' (NOT 'Dr. Patel') unless context clearly shows they are Dr. Patel's patient",
      "",
      "- **For NON-EMERGENCY URGENT situations** (needs same-day evaluation but not ER):",
      "  * Suggest: 'Call your pediatrician right away to get your baby seen today.'",
      "  * Use inclusive language: 'your pediatrician' or 'your baby's doctor'",
      "",
      "- For concerns needing routine evaluation, suggest contacting their pediatrician (or Dr. Patel if she's their provider) - no red text needed.",
      "- Use warm, conversational, empathetic tone with plain language (Grade 12 level).",

      "\n\n📸 COMPREHENSIVE CLINICAL PHOTO ANALYSIS FRAMEWORK (when image is provided):",
      "You are providing expert-level clinical analysis with parent-friendly education.",
      "You have access to the baby's age from their profile - ALWAYS use this to narrow diagnostic possibilities.",

      "\n🩺 STEP 1: EXPERT CLINICAL ANALYSIS (Internal Reasoning):",
      "A. LESION MORPHOLOGY (Describe precisely):",
      "   - Primary lesion: macule, papule, vesicle, pustule, plaque, nodule, patch, wheal",
      "   - Secondary changes: scale, crust, erosion, ulcer, fissure, lichenification",
      "   - Color: pink, red, salmon, yellow, white, brown, hyperpigmented, violaceous, blue, purple",
      "   - Texture: smooth, rough, bumpy, scaly, greasy, dry, crusted, weepy, moist",
      "   - Size: <1mm (petechiae), 1-5mm (small), 5-10mm (medium), >10mm (large)",
      "   - Shape: round, oval, annular, linear, serpiginous, irregular",
      "   - Borders: well-defined, poorly-defined, irregular, raised",
      "   - Distribution: localized, regional, generalized, dermatomal",
      "   - Pattern: isolated, clustered, grouped, confluent, reticular, linear",
      "   - Location: face, scalp, trunk, diaper area, extremities, folds, palms/soles, mucosa",
      "   - Symmetry: symmetric (bilateral) vs. asymmetric (unilateral)",
      "   - Configuration: discrete, grouped, herpetiform, zosteriform, annular, target",

      "B. AGE-BASED DIAGNOSTIC WINDOW (Critical for narrowing differential):",
      "   • <24 hours: Birth trauma, congenital lesions, neonatal pustulosis, subcutaneous fat necrosis",
      "   • 1-7 days: Erythema toxicum, transient pustular melanosis, miliaria, congenital infections",
      "   • 1-4 weeks: Neonatal acne, seborrheic dermatitis, infantile hemangioma emerging",
      "   • 1-3 months: Atopic dermatitis onset, contact dermatitis, viral exanthems, thrush",
      "   • 3-6 months: Eczema peak onset, teething drool rash, food allergy reactions",
      "   • 6-12 months: Viral exanthems (roseola, hand-foot-mouth), impetigo, molluscum",

      "C. GENERATE TOP 3 DIFFERENTIAL DIAGNOSES:",
      "   1. Most likely diagnosis (with confidence: high/moderate/low)",
      "   2. Alternative possibility (if features overlap)",
      "   3. Must-not-miss diagnosis (serious condition that could present similarly)",
      "   - For each, note: benign/self-limited, needs routine evaluation, or requires urgent attention",

      "D. RED FLAG ASSESSMENT (Screen for emergent conditions):",
      "   - Life-threatening: petechiae/purpura, blistering with systemic illness, blue/gray discoloration",
      "   - Urgent (same-day): signs of infection (pus, warmth, spreading erythema), severe pain",
      "   - Prompt (24-48h): rapid spread, involvement of eyes/mouth/genitals, fever + rash",
      "   - Routine: stable, well-appearing infant, isolated finding",

      "\n📚 STEP 2: COMPREHENSIVE INFANT CONDITION REFERENCE LIBRARY:",
      "Use baby's age to prioritize the most likely conditions. Each entry includes: Clinical features, Parent explanation, Home care, When to seek care.",

      "\n═══ NEWBORN PERIOD (<4 weeks) ═══",

      "• ERYTHEMA TOXICUM NEONATORUM (50% of newborns, days 1-5):",
      "  Clinical: Erythematous macules/papules with central pustule, face/trunk, spares palms/soles, waxing/waning",
      "  Parent: 'Small red spots with tiny white bumps that come and go - like a moving rash. Totally normal for newborns!'",
      "  Home care: None needed, resolves spontaneously by 2 weeks",
      "  Seek care: Only if fever, baby ill-appearing, or pustules enlarge",

      "• TRANSIENT NEONATAL PUSTULAR MELANOSIS (5% of newborns, present at birth):",
      "  Clinical: Superficial pustules that rupture → hyperpigmented macules with collarette scale, any body site",
      "  Parent: 'Tiny blisters that pop and leave behind brown spots with a little ring around them. Harmless birth mark!'",
      "  Home care: None, hyperpigmentation fades over weeks-months",
      "  Seek care: If pustules become larger, red, or pus-filled (rule out infection)",

      "• MILIA (40% of newborns):",
      "  Clinical: 1-2mm white papules on nose, cheeks, chin (blocked sebaceous glands)",
      "  Parent: 'Tiny white bumps that look like whiteheads on baby's nose and cheeks. They'll go away on their own!'",
      "  Home care: Do NOT squeeze, resolves in weeks",
      "  Seek care: If inflamed or increasing in size",

      "• MILIARIA (HEAT RASH) - 3 types:",
      "  Miliaria crystallina: Clear vesicles (sweat trapped superficially)",
      "  Miliaria rubra: Red papules in folds (sweat duct obstruction)",
      "  Miliaria profunda: Flesh-colored papules (deeper obstruction)",
      "  Parent: 'Tiny bumps from trapped sweat - baby got too warm! Cool them down with loose cotton clothes.'",
      "  Home care: Cool environment, dress in breathable layers, avoid overdressing",
      "  Seek care: If pustules form (secondary infection)",

      "• NEONATAL ACNE (20% of newborns, peaks week 3-4):",
      "  Clinical: Closed comedones, papules, pustules on cheeks/forehead (maternal androgen stimulation)",
      "  Parent: 'Baby acne from mom's hormones still in their system. Looks like teenage acne but on a newborn face!'",
      "  Home care: Gentle cleansing with water, avoid oils/lotions, resolves by 3 months",
      "  Seek care: If severe, confluent, or scarring (rare infantile acne)",

      "• SEBORRHEIC DERMATITIS (CRADLE CAP) - onset week 2-3:",
      "  Clinical: Greasy yellow scales on scalp, eyebrows, post-auricular, diaper area (yeast + sebum)",
      "  Parent: 'Crusty yellow patches on baby's scalp - it's cradle cap! You can gently loosen with baby oil.'",
      "  Home care: Gentle shampoo, apply mineral oil 15min before washing, soft brush to lift scales",
      "  Seek care: If oozing, red, or spreads beyond scalp (rule out infection)",

      "• SUBCUTANEOUS FAT NECROSIS (rare, from birth trauma/cold stress):",
      "  Clinical: Firm, red-purple nodules on cheeks, back, buttocks in first 2 weeks",
      "  Parent: 'Hard lumps under the skin from birth trauma or cooling during delivery. Usually harmless but needs monitoring.'",
      "  Home care: None, resolves over weeks-months",
      "  Seek care: ALWAYS evaluate (risk of hypercalcemia weeks later)",

      "\n═══ INFANCY (1-12 months) ═══",

      "• ATOPIC DERMATITIS (ECZEMA) - onset 2-6 months:",
      "  Clinical: Dry, erythematous, scaly patches on cheeks, extensors (infants) → flexors (older), pruritic",
      "  Parent: 'Dry, itchy red patches - this is eczema. Baby's skin barrier needs extra help with thick moisturizer.'",
      "  Home care: Thick emollients 2-3x daily, avoid harsh soaps, lukewarm baths, cotton clothing",
      "  Seek care: If oozing, crusted (infection), not improving with moisturizer, or severe itching",

      "• CONTACT DERMATITIS:",
      "  Irritant: Red rash in area of contact (drool, food, detergent), well-demarcated",
      "  Allergic: Delayed reaction, may have vesicles, pruritic",
      "  Parent: 'Rash where something touched baby's skin - like drool on the chin or a new soap. Remove the irritant!'",
      "  Home care: Identify and avoid trigger, barrier cream, gentle cleansing",
      "  Seek care: If blistering, spreading, or not improving in 3-5 days",

      "• DIAPER DERMATITIS - 4 types:",
      "  1. Irritant: Shiny red, spares deep folds (urine/stool contact)",
      "  2. Candida: Beefy red WITH satellite papules/pustules, includes folds",
      "  3. Bacterial: Honey-crusted, erosions (impetigo)",
      "  4. Psoriasiform: Well-demarcated red plaques with minimal scale",
      "  Parent: 'Red irritated skin in the diaper area. Change frequently, use barrier cream, and let skin air dry!'",
      "  Home care: Frequent changes, barrier cream (zinc oxide), gentle cleansing, air time",
      "  Seek care: If bright red with satellites (needs antifungal), or honey-crusted (bacterial)",

      "• VIRAL EXANTHEMS:",
      "  Roseola (HHV-6, 6-24mo): High fever 3-5d → diffuse pink maculopapular rash as fever breaks",
      "  Hand-foot-mouth (Coxsackie, 6mo-5y): Vesicles on palms/soles, oral ulcers, fever",
      "  Molluscum (poxvirus): Flesh-colored umbilicated papules, spread by contact",
      "  Parent: 'Viral rash from a common childhood infection. Usually harmless and goes away on its own!'",
      "  Home care: Supportive care, monitor hydration, avoid scratching",
      "  Seek care: If baby ill-appearing, not drinking, or rash becomes painful/purulent",

      "• INFANTILE HEMANGIOMA (5-10% of infants, appears week 1-4):",
      "  Clinical: Bright red, raised, soft vascular tumor, grows rapidly first 6mo → involutes over years",
      "  Parent: 'A strawberry birthmark that will grow for a few months then slowly shrink over years.'",
      "  Home care: Observation, photo documentation of growth",
      "  Seek care: If near eyes/nose/mouth (can affect function), ulcerated, or rapid growth",

      "• PORT-WINE STAIN (capillary malformation, present at birth):",
      "  Clinical: Flat, pink-purple patch, grows proportionally with child, does NOT fade",
      "  Parent: 'A flat pink birthmark that will stay the same color - it won't fade like other birthmarks.'",
      "  Home care: None",
      "  Seek care: If on forehead/eyelid (rule out Sturge-Weber), or for cosmetic laser treatment discussion",

      "• MONGOLIAN SPOTS (90% in darker-skinned infants, present at birth):",
      "  Clinical: Blue-gray macules on sacrum/buttocks, fade by school age",
      "  Parent: 'Blue-gray marks on baby's bottom or back - normal pigment variations that fade as baby grows.'",
      "  Home care: None, benign",
      "  Seek care: Document in chart to differentiate from bruising",

      "\n═══ INFECTIONS & URGENT CONDITIONS ═══",

      "• IMPETIGO (bacterial, Staph/Strep):",
      "  Clinical: Honey-crusted erosions, often around nose/mouth, highly contagious",
      "  Parent: 'Crusty sores from a bacterial skin infection. Needs antibiotic ointment or oral medicine.'",
      "  Home care: Keep clean, avoid scratching",
      "  Seek care: ALWAYS - needs topical or oral antibiotics",

      "• CELLULITIS (bacterial skin infection):",
      "  Clinical: Red, warm, tender, swollen area with advancing border, may have fever",
      "  Parent: 'Deep skin infection with warmth and spreading redness. This needs antibiotics today.'",
      "  Home care: None",
      "  Seek care: URGENT same-day - needs oral/IV antibiotics",

      "• HERPES SIMPLEX (especially dangerous in newborns):",
      "  Clinical: Grouped vesicles on erythematous base, can disseminate in newborns",
      "  Parent: 'Grouped blisters that could be a herpes infection. In newborns this is very serious.'",
      "  Home care: None",
      "  Seek care: URGENT - especially if <1 month old (can be life-threatening)",

      "• VARICELLA (chickenpox, rare with vaccination):",
      "  Clinical: Pruritic vesicles in different stages (macule → papule → vesicle → crust)",
      "  Parent: 'Chickenpox - itchy blisters all over. Keep baby comfortable and watch for complications.'",
      "  Home care: Antihistamines, oatmeal baths, keep nails short",
      "  Seek care: If <1 year, immunocompromised, or blisters become red/painful (infection)",

      "• SCABIES (mite infestation):",
      "  Clinical: Intensely pruritic papules, burrows, in webs/wrists/axillae/palms/soles (infants)",
      "  Parent: 'Tiny mites under the skin causing intense itching. Whole family needs treatment!'",
      "  Home care: None until treated",
      "  Seek care: ALWAYS - needs prescription permethrin + treat whole household",

      "\n🚨 STEP 3: CRITICAL RED FLAG SCREENING (Emergent vs. Urgent vs. Routine):",

      "LIFE-THREATENING (Call 911 NOW):",
      "• Petechiae/purpura (non-blanching purple spots) + fever/ill-appearing",
      "  → Meningococcemia, ITP, bleeding disorder",
      "• Widespread blistering + fever + ill-appearing",
      "  → Stevens-Johnson syndrome, staphylococcal scalded skin",
      "• Blue/gray discoloration of lips, tongue, extremities",
      "  → Cyanosis, poor perfusion, shock",
      "• Hives + stridor/wheezing/respiratory distress",
      "  → Anaphylaxis",
      "• Newborn with ANY vesicular rash + fever or lethargy",
      "  → Disseminated HSV (neonatal herpes)",

      "URGENT (Same-day evaluation by pediatrician or ER):",
      "• Signs of cellulitis: warm, tender, spreading redness",
      "• Fever + petechiae (even if baby looks well)",
      "• Rapidly spreading rash in hours",
      "• Painful blisters, erosions, or skin sloughing",
      "• Purulent drainage, pus, or honey-crusting",
      "• Eye involvement (swelling, discharge, vision changes)",
      "• Oral/genital mucosal involvement",
      "• Baby appears uncomfortable, lethargic, or won't feed",

      "PROMPT (24-48 hour evaluation):",
      "• Rash + fever (but baby well-appearing)",
      "• Suspected impetigo (crusted sores)",
      "• Rash worsening despite home care",
      "• Hemangioma growing rapidly or ulcerated",
      "• Suspected eczema not improving with moisturizer",

      "ROUTINE (Mention at next well visit or call office for guidance):",
      "• Stable rashes: neonatal acne, milia, seborrheic dermatitis",
      "• Non-progressive birthmarks",
      "• Mild diaper rash improving with care",
      "• Questions about normal skin variations",

      "\n💬 STEP 4: PARENT-FRIENDLY RESPONSE FRAMEWORK (NayaCare's Conversational Tone):",
      "DO NOT use clinical jargon in your final response. Translate everything into warm, supportive language.",

      "STRUCTURE YOUR RESPONSE:",
      "1. EMPATHY FIRST (Validate concern):",
      "   'I can absolutely understand why you'd want me to take a look at this.'",
      "   'Thanks for sharing this photo with me. Let me tell you what I'm seeing.'",
      "   'I'm glad you reached out about this - let's figure out what's going on.'",

      "2. DESCRIBE IN PLAIN LANGUAGE (What you observe):",
      "   Use parent-friendly terms: 'small bumps' not 'papules', 'red patches' not 'erythematous plaques'",
      "   'I can see small red spots with tiny white centers on {baby name}'s chest and face.'",
      "   'What I'm noticing is dry, scaly patches in the creases of {baby name}'s elbows and knees.'",

      "3. EDUCATE (Likely cause + why it happens):",
      "   'This pattern is very common in newborns and usually means...'",
      "   'This looks like {condition name}, which happens when...'",
      "   'Based on {baby name}'s age ({X weeks old}), this is consistent with...'",

      "4. PROVIDE DIFFERENTIAL (If uncertain, explain possibilities):",
      "   'This could be either {A} or {B}. Here's how to tell the difference...'",
      "   'While it looks like {A}, we want to make sure it's not {B} because...'",

      "5. HOME CARE GUIDANCE (Specific, actionable steps for benign conditions):",
      "   Include 2-4 concrete actions parents can take",
      "   'Here's what you can do at home...'",
      "   'To help this along, try...'",
      "   Use bullet points for clarity when listing multiple steps",

      "6. SET EXPECTATIONS (Timeline):",
      "   'This should improve within...'",
      "   'You might see it get a bit worse before it gets better - that's normal.'",
      "   'Most babies outgrow this by...'",

      "7. TRIAGE WITH CLEAR NEXT STEPS:",
      "   BENIGN: 'This is completely harmless and will clear up on its own. Just keep doing what you're doing!'",
      "   MONITOR: 'Keep an eye on this. If you notice {specific red flags}, reach out to your pediatrician (or Dr. Patel if she's your provider).'",
      "   EVALUATE: 'I'd recommend having your baby's doctor take a look at this - not because it's an emergency, but because {reason}.'",
      "   URGENT: 'This needs to be checked out today. Please call your pediatrician right away to get {baby name} seen.'",
      "   EMERGENCY: 'This could be serious. Please call 911 or go to the ER right now, especially since {specific concern}.'",

      "8. SPECIFIC RED FLAGS TO WATCH (When to escalate):",
      "   Always end with concrete, observable signs:",
      "   'Call your pediatrician if you see: {specific signs like fever, pus, spreading, baby not eating, etc.}'",
      "   'Go to the ER if: {emergency signs like difficulty breathing, purple spots, baby very sleepy}'",

      "\n⚖️ STEP 5: IMPORTANT LIMITATIONS & SAFETY GUARDRAILS:",
      "• You are providing educational triage, NOT a definitive diagnosis",
      "• Image quality, lighting, angles, and zoom affect accuracy",
      "• Many conditions look similar in photos but require different treatments",
      "• Some serious conditions (like early meningococcemia) can look benign initially",
      "• When diagnostic confidence is LOW (<70%), default to: 'To be safe, I'd recommend having your baby's doctor evaluate this in person.'",
      "• When differential includes both benign and serious: 'While this could be {benign}, we need to rule out {serious}, so please have it checked today.'",
      "• NEVER say 'This is definitely {diagnosis}' - always use 'This looks like', 'appears to be', 'is consistent with', 'could be'",
      "• If parent reports systemic symptoms (fever, lethargy, poor feeding) + ANY rash → escalate to same-day evaluation",
      "• Your role: Bridge between parent concern and appropriate medical evaluation, NOT replacement for in-person exam",

      "\n\n✍️ FORMATTING:",
      "- Write ONLY natural conversation text. NEVER include asterisks, stage directions, or meta-comments.",
      "- ⛔ CRITICAL: NEVER EVER start your response with timestamps like '[Today 1:13 PM]' or '[Yesterday 3:28 AM]'. These are for your internal context only. Your response should start directly with conversational text.",
      "- Do NOT give the same response twice.",
      "- Avoid generic medical bullet points unless specifically asked for technical information.",

      contextInfo
    ].join(' ');

    // Conversation history WITHOUT timestamps (to prevent AI from copying them into responses)
    // We removed timestamp formatting because AI kept displaying timestamps despite instructions
    const historyMessages = Array.isArray(history) && history.length > 0
      ? history
          .slice(-12) // Keep last 12 messages for context
          .filter((h: any) => h && h.content && h.content.trim().length > 0) // Filter out empty messages
          .map((h: any) => {
            const role = h.role === 'user' ? 'user' : 'assistant';
            const content = deIdentifyText(String(h.content || '').trim());
            return { role, content };
          })
      : [];

    // Extract baby age from conversation context for age-appropriate KB retrieval
    let babyAgeInDays: number | null = null;
    const ageContext = historyMessages.find((m: any) => 
      m.role === 'user' && (m.content.includes('day old') || m.content.includes('days old') || m.content.includes('week old') || m.content.includes('weeks old'))
    );
    if (ageContext) {
      const dayMatch = ageContext.content.match(/(\d+)\s+days?\s+old/i);
      const weekMatch = ageContext.content.match(/(\d+)\s+weeks?\s+old/i);
      if (dayMatch) {
        babyAgeInDays = parseInt(dayMatch[1]);
      } else if (weekMatch) {
        babyAgeInDays = parseInt(weekMatch[1]) * 7;
      }
    }

    // Load knowledge base with PDF prioritization system - FOR ALL MEDICAL QUERIES
    let kbRecords: any[] = [];
    let pdfPriorityInfo = { drPatelPDFs: 0, fallbackSources: 0, hubspotDocs: 0 };

    if (shouldLoadKnowledge) {
      console.log('📚 Medical query detected - loading Dr. Patel\'s curated resource library as reference');
      try {
        // PRIORITY 1: Try HubSpot File Manager (new storage solution)
        console.log('Querying HubSpot File Manager for knowledge base documents...');
        const hubspotDocs = await hubspotFileManager.getAllDocuments();

        if (hubspotDocs && hubspotDocs.length > 0) {
          console.log(`✅ Loaded ${hubspotDocs.length} documents from HubSpot File Manager`);

          // Smart filtering: Prioritize documents by relevance to user's question
          const messageLower = message.toLowerCase();
          const scoredDocs = hubspotDocs.map((doc: any) => {
            let relevanceScore = 0;
            const category = (doc.category || '').toLowerCase();
            const title = (doc.title || doc.fileName || '').toLowerCase();

            // Score by category match
            if (messageLower.includes('sleep') && category.includes('sleep')) relevanceScore += 100;
            if (messageLower.includes('breastfeed') && category.includes('breastfeed')) relevanceScore += 100;
            if (messageLower.includes('postpartum') && category.includes('postpartum')) relevanceScore += 100;

            // Score by title match
            if (messageLower.includes('sleep') && title.includes('sleep')) relevanceScore += 50;
            if (messageLower.includes('safe sleep') && title.includes('safe sleep')) relevanceScore += 150;
            if (messageLower.includes('breastfeed') && title.includes('breastfeed')) relevanceScore += 50;
            if (messageLower.includes('peripartum') && title.includes('peripartum')) relevanceScore += 150;

            return { doc, relevanceScore };
          });

          // Sort by relevance (highest first), then convert to KB records
          const sortedDocs = scoredDocs
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .map(item => item.doc);

          console.log(`📊 Document Relevance Scores:`, scoredDocs.map(item =>
            `${item.doc.title}: ${item.relevanceScore}`
          ).join(', '));

          // Convert HubSpot docs to knowledge base record format
          kbRecords = sortedDocs.map((doc: any) => ({
            title: doc.title || doc.fileName,
            content: doc.textContent || doc.description || '',
            text: doc.textContent || doc.description || '',
            source: `${doc.category} Resource (Curated by Dr. Patel)`,
            category: doc.category,
            tags: doc.category,
            topic: doc.category,
            metadata: {
              fileName: doc.fileName,
              pages: doc.pages,
              uploadedAt: doc.uploadedAt,
              storage: 'HubSpot File Manager'
            }
          }));

          pdfPriorityInfo = {
            drPatelPDFs: 0,
            fallbackSources: 0,
            hubspotDocs: hubspotDocs.length
          };

          console.log(`Converted ${kbRecords.length} HubSpot docs to KB records`);
        } else {
          // PRIORITY 2: Fallback to static content
          console.log('⚠️ No HubSpot docs found, trying static knowledge base fallback...');

          // Try to load from your existing content structure first
          // @ts-ignore - Vercel provides process.env
          const contentRes = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : ''}/kb_index.json`);
          if (contentRes.ok) {
            const contentKB = await contentRes.json();
            kbRecords = contentKB?.records || [];
            console.log(`📄 Loaded ${kbRecords.length} entries from static content KB`);

            // No filtering - use all available knowledge for any medical query
            // The AI will determine relevance based on the question

            pdfPriorityInfo = {
              drPatelPDFs: kbRecords.length,
              fallbackSources: 0,
              hubspotDocs: 0
            };

            console.log(`✅ Found ${kbRecords.length} knowledge base entries for all medical topics`);
          } else {
            // PRIORITY 3: Last fallback to Dr. Patel's static PDF knowledge base
            // @ts-ignore - Vercel provides process.env
            const drPatelRes = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : ''}/dr_patel_kb.json`);
            if (drPatelRes.ok) {
              const drPatelKB = await drPatelRes.json();
              kbRecords = drPatelKB?.records || [];
              console.log(`Loaded ${kbRecords.length} Dr. Patel PDF entries from static KB`);
              pdfPriorityInfo = {
                drPatelPDFs: kbRecords.length,
                fallbackSources: 0,
                hubspotDocs: 0
              };
            }
          }
        }
      } catch (error) {
        console.error('❌ Error loading knowledge base:', error);
        kbRecords = [];
      }
    } else {
      console.log('💬 Pure emotional/conversational query - no knowledge base needed');
    }

    // Build a comprehensive reference block from Dr. Patel's PDFs (if loaded)
    console.log(`🔍 KB Records Count: ${kbRecords.length}`);
    console.log(`🔍 Should Load Knowledge: ${shouldLoadKnowledge}`);

    if (kbRecords.length > 0) {
      console.log(`📚 KB Records Available:`);
      kbRecords.forEach((r: any, i: number) => {
        console.log(`   ${i + 1}. ${r.title} - Content length: ${(r.content || r.text || '').length} chars`);
      });
    }

    const contextBlock = shouldLoadKnowledge && kbRecords.length > 0 ?
      `\n\n📚 REFERENCE MATERIAL FROM DR. PATEL'S CURATED RESOURCE LIBRARY:\n` +
      `(These are evidence-based resources Dr. Patel has curated and endorses for her patients - use these as your PRIMARY source. Attribute them properly when referencing.)\n\n` +
      kbRecords
        .slice(0, 6) // Top 6 most relevant documents
        .map((r: any, i: number) => {
          const content = (r.content || r.text || '').slice(0, 5000); // 5000 chars per snippet = ~30K total
          const source = r.source || r.category || 'Medical Guide';
          console.log(`   📄 Including in context: "${r.title}" - ${content.length} chars`);
          return `[Reference ${i + 1} - ${source}: "${r.title}"]\n${content}`;
        })
        .join('\n\n---\n\n') : '';

    console.log(`📝 Context Block Length: ${contextBlock.length} chars`);
    console.log(`📝 Context Block Preview (first 200 chars): ${contextBlock.slice(0, 200)}...`);

    // Create conversation context summary for better memory
    const conversationContext = historyMessages.length > 0 
      ? `\n\nConversation Context:\nThis is an ongoing conversation. The user has shared: ${historyMessages.filter((m: any) => m.role === 'user').slice(-3).map((m: any) => `"${m.content.slice(0, 100)}${m.content.length > 100 ? '...' : ''}"`).join(', ')}. Build on this context naturally.`
      : '\n\nThis is the start of a new conversation. Be welcoming and ask what they need help with.';

    // Build user message content (text only or multimodal with image)
    let userMessageContent;
    if (image && image.data) {
      console.log('📸 Image detected in request - using multimodal format');
      // Extract base64 data (remove data:image/jpeg;base64, prefix if present)
      const base64Data = image.data.includes(',') ? image.data.split(',')[1] : image.data;
      const mediaType = image.mediaType || 'image/jpeg';

      userMessageContent = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Data
          }
        },
        {
          type: 'text',
          text: deIdentifiedMessage
        }
      ];
    } else {
      userMessageContent = deIdentifiedMessage;
    }

    console.log('Making Anthropic API call with:', {
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      temperature: 0.9,
      hasSystem: !!systemPrompt,
      hasContext: !!contextBlock,
      hasImage: !!image,
      messageCount: historyMessages.length + 1
    });

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': VENDOR_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        temperature: 0.9,
        system: contextBlock
          ? `${systemPrompt}${conversationContext}${contextBlock}\n\n🎯 CRITICAL INSTRUCTION - YOU MUST FOLLOW THIS:\n\n1. The reference material above IS AVAILABLE TO YOU RIGHT NOW. These are evidence-based resources Dr. Patel has curated and endorses for her patients.\n2. You MUST use this material to answer the user's question. Do NOT say you "don't have access" or "can't pull it up" - YOU ALREADY HAVE IT.\n3. When answering from the reference material, attribute properly (e.g., "According to the safe sleep guidelines Dr. Patel recommends..." or "The breastfeeding resource Dr. Patel endorses suggests..." or "Dr. Patel's practice follows AAP guidelines, which recommend...").\n4. ONLY use external medical sources if the specific topic is NOT covered in the reference material above.\n5. If using external sources, explicitly state: "This topic isn't in Dr. Patel's curated resources, but medical guidelines recommend..."\n\nDO NOT be overly cautious or conservative. If the reference material addresses the user's question, USE IT CONFIDENTLY.`
          : `${systemPrompt}${conversationContext}`,
        messages: [
          ...historyMessages,
          { role: 'user', content: userMessageContent }
        ]
      })
    });

    console.log('Anthropic response status:', anthropicRes.status);

    if (!anthropicRes.ok) {
      const text = await anthropicRes.text();
      console.error('Anthropic error:', anthropicRes.status, text);
      console.error('Error response body:', text);
      
      // Try to provide a more conversational fallback instead of rigid rules
      const conversationalFallback = `I'm having a little trouble connecting right now, but I'm still here for you. ${deIdentifiedMessage.includes('nervous') || deIdentifiedMessage.includes('scared') || deIdentifiedMessage.includes('worried') ? "I can hear that you're feeling some difficult emotions, and that's completely understandable. " : ""}What's going on? I want to help however I can.`;
      
      return res.status(200).json({ answer: conversationalFallback, sources: ['Fallback'], confidence: 0.6 });
    }

    const data = await anthropicRes.json();
    console.log('Anthropic response data:', JSON.stringify(data, null, 2));
    
    const answer = (data && Array.isArray(data.content) && data.content[0] && data.content[0].text)
      ? data.content[0].text
      : `I'm here and listening. ${deIdentifiedMessage.includes('nervous') || deIdentifiedMessage.includes('scared') || deIdentifiedMessage.includes('worried') ? "I can hear that you're feeling some difficult emotions, and that's completely understandable. " : ""}What's on your mind? I want to help however I can.`;

    // Don't add source citations - let Claude integrate them naturally
    const enrichedAnswer = answer;

    console.log('Final answer:', enrichedAnswer);
    // Enhanced response with knowledge base insights and PDF prioritization info
    const kbStats = {
      totalSources: kbRecords.length,
      pdfPrioritization: pdfPriorityInfo,
      usingDrPatelPDFs: pdfPriorityInfo.drPatelPDFs > 0,
      confidence: kbRecords.length > 0 ? 0.9 : 0.8
    };

    // Determine if PDF should be offered based on conversation length and content
    const shouldOfferPDF = isLongConversation && enrichedAnswer.length > 200 && 
      (enrichedAnswer.includes('guidance') || enrichedAnswer.includes('steps') || 
       enrichedAnswer.includes('recommend') || enrichedAnswer.includes('suggest'));

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Log conversation data to HubSpot (async, don't wait for it)
    logConversationData({
      sessionId: currentSessionId,
      message: deIdentifiedMessage,
      response: enrichedAnswer,
      responseTime,
      adminAccess,
      userAgent,
      conversationLength,
      knowledgeBaseUsed: kbRecords.length > 0,
      emergencyDetected: false // Would be set earlier if emergency
    }).catch(err => console.error('Failed to log conversation data:', err));

    return res.status(200).json({ 
      answer: enrichedAnswer,
      sources: kbStats.totalSources > 0 ? ['Knowledge Base', 'Anthropic'] : ['Anthropic'], 
      confidence: kbStats.usingDrPatelPDFs ? 0.9 : 0.75,
      conversationContext: {
        messageCount: historyMessages.length + 1,
        hasHistory: historyMessages.length > 0,
        lastTopics: historyMessages.filter((m: any) => m.role === 'user').slice(-2).map((m: any) => m.content.slice(0, 50))
      },
      knowledgeBase: kbStats,
      canGeneratePDF: shouldOfferPDF,
      conversationLength: conversationLength
    });
  } catch (err) {
    console.error('API /api/chat error:', err);
    
    // Simple fallback response without trying to access out-of-scope variables
    const errorResponse = "I'm having some technical difficulties right now, but I'm still here for you. What's going on? I want to help however I can.";
    
    return res.status(200).json({ answer: errorResponse, sources: ['Error fallback'], confidence: 0.4 });
  }
}

/**
 * Log conversation data to HubSpot for research purposes
 */
async function logConversationData(data: {
  sessionId: string;
  message: string;
  response: string;
  responseTime: number;
  adminAccess: boolean;
  userAgent?: string;
  conversationLength: number;
  knowledgeBaseUsed: boolean;
  emergencyDetected: boolean;
}) {
  try {
    // Create anonymous contact for tracking
    const contactId = await hubspotContactManager.createOrUpdateContact(
      `anonymous_${data.sessionId}@nayacare.local`,
      {
        nayacare_conversation_count: 1,
        nayacare_user_type: data.adminAccess ? 'Admin' : 'Patient/Parent'
      }
    );

    // Log the conversation
    await hubspotContactManager.logConversation({
      contactId,
      sessionId: data.sessionId,
      timestamp: new Date().toISOString(),
      messageType: 'user',
      content: data.message,
      category: categorizeMessage(data.message),
      sentiment: analyzeSentiment(data.message),
      responseTime: data.responseTime,
      adminAccess: data.adminAccess
    });

    // Log the bot response
    await hubspotContactManager.logConversation({
      contactId,
      sessionId: data.sessionId,
      timestamp: new Date().toISOString(),
      messageType: 'bot',
      content: data.response,
      category: categorizeMessage(data.response),
      sentiment: 'positive', // Bot responses are generally positive
      responseTime: 0,
      adminAccess: data.adminAccess
    });

    // Log session analytics
    await hubspotAnalytics.logSessionAnalytics({
      sessionId: data.sessionId,
      contactId,
      timestamp: new Date().toISOString(),
      messageCount: data.conversationLength,
      conversationDuration: data.responseTime,
      primaryTopics: extractTopics(data.message),
      sentiment: analyzeSentiment(data.message),
      escalatedToHuman: data.emergencyDetected,
      adminAccess: data.adminAccess,
      deviceType: detectDeviceType(data.userAgent || '')
    });

  } catch (error) {
    console.error('Error logging conversation data to HubSpot:', error);
  }
}

function categorizeMessage(message: string): string {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('breastfeeding') || messageLower.includes('nursing') || messageLower.includes('latch')) {
    return 'Breastfeeding';
  }
  if (messageLower.includes('sleep') || messageLower.includes('nap') || messageLower.includes('tired')) {
    return 'Sleep';
  }
  if (messageLower.includes('feeding') || messageLower.includes('hungry') || messageLower.includes('eat')) {
    return 'Feeding';
  }
  if (messageLower.includes('crying') || messageLower.includes('fussy') || messageLower.includes('colic')) {
    return 'Behavior';
  }
  if (messageLower.includes('diaper') || messageLower.includes('poop') || messageLower.includes('urine')) {
    return 'Hygiene';
  }
  if (messageLower.includes('development') || messageLower.includes('milestone') || messageLower.includes('growth')) {
    return 'Development';
  }
  
  return 'General';
}

function analyzeSentiment(message: string): 'positive' | 'neutral' | 'negative' {
  const messageLower = message.toLowerCase();

  const positiveWords = ['good', 'great', 'happy', 'thank', 'helpful', 'better', 'improved'];
  const negativeWords = ['worried', 'scared', 'nervous', 'frustrated', 'angry', 'sad', 'concerned'];

  const positiveCount = positiveWords.filter(word => messageLower.includes(word)).length;
  const negativeCount = negativeWords.filter(word => messageLower.includes(word)).length;

  if (negativeCount > positiveCount) return 'negative';
  if (positiveCount > negativeCount) return 'positive';
  return 'neutral';
}

function extractTopics(message: string): string[] {
  const topics: string[] = [];
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('breastfeeding')) topics.push('breastfeeding');
  if (messageLower.includes('sleep')) topics.push('sleep');
  if (messageLower.includes('feeding')) topics.push('feeding');
  if (messageLower.includes('development')) topics.push('development');
  if (messageLower.includes('safety')) topics.push('safety');
  
  return topics;
}

function detectDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
  const ua = userAgent.toLowerCase();
  
  if (/tablet|ipad/.test(ua)) return 'tablet';
  if (/mobile|android|iphone/.test(ua)) return 'mobile';
  return 'desktop';
}


