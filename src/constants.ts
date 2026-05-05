import { KeyMap, Lesson } from './types';

export const INSCRIPT_MAP: KeyMap[] = [
  // Row 0
  { code: 'Backquote', char: 'ॊ', shift: 'ो', finger: 'pinky', row: 0 },
  { code: 'Digit1', char: '१', shift: '!', finger: 'pinky', row: 0 },
  { code: 'Digit2', char: '२', shift: '@', finger: 'ring', row: 0 },
  { code: 'Digit3', char: '३', shift: '#', finger: 'middle', row: 0 },
  { code: 'Digit4', char: '४', shift: '$', finger: 'index', row: 0 },
  { code: 'Digit5', char: '५', shift: '%', finger: 'index', row: 0 },
  { code: 'Digit6', char: '६', shift: '^', finger: 'index', row: 0 },
  { code: 'Digit7', char: '७', shift: '&', finger: 'index', row: 0 },
  { code: 'Digit8', char: '८', shift: '*', finger: 'middle', row: 0 },
  { code: 'Digit9', char: '९', shift: '(', finger: 'ring', row: 0 },
  { code: 'Digit0', char: '०', shift: ')', finger: 'pinky', row: 0 },
  { code: 'Minus', char: '-', shift: '_', finger: 'pinky', row: 0 },
  { code: 'Equal', char: 'ृ', shift: 'ऋ', finger: 'pinky', row: 0 },
  // Row 1
  { code: 'KeyQ', char: 'ौ', shift: 'औ', finger: 'pinky', row: 1 },
  { code: 'KeyW', char: 'ै', shift: 'ऐ', finger: 'ring', row: 1 },
  { code: 'KeyE', char: 'ा', shift: 'आ', finger: 'middle', row: 1 },
  { code: 'KeyR', char: 'ी', shift: 'ई', finger: 'index', row: 1 },
  { code: 'KeyT', char: 'ू', shift: 'ऊ', finger: 'index', row: 1 },
  { code: 'KeyY', char: 'ब', shift: 'भ', finger: 'index', row: 1 },
  { code: 'KeyU', char: 'ह', shift: 'ङ', finger: 'index', row: 1 },
  { code: 'KeyI', char: 'ग', shift: 'घ', finger: 'middle', row: 1 },
  { code: 'KeyO', char: 'द', shift: 'ध', finger: 'ring', row: 1 },
  { code: 'KeyP', char: 'ज', shift: 'झ', finger: 'pinky', row: 1 },
  { code: 'BracketLeft', char: 'ड', shift: 'ढ', finger: 'pinky', row: 1 },
  { code: 'BracketRight', char: 'ञ', shift: 'ण', finger: 'pinky', row: 1 },
  // Row 2
  { code: 'KeyA', char: 'ो', shift: 'ओ', finger: 'pinky', row: 2 },
  { code: 'KeyS', char: 'े', shift: 'ए', finger: 'ring', row: 2 },
  { code: 'KeyD', char: '्', shift: 'अ', finger: 'middle', row: 2 },
  { code: 'KeyF', char: 'ि', shift: 'इ', finger: 'index', row: 2 },
  { code: 'KeyG', char: 'ु', shift: 'उ', finger: 'index', row: 2 },
  { code: 'KeyH', char: 'प', shift: 'फ', finger: 'index', row: 2 },
  { code: 'KeyJ', char: 'र', shift: 'ऱ', finger: 'index', row: 2 },
  { code: 'KeyK', char: 'क', shift: 'ख', finger: 'middle', row: 2 },
  { code: 'KeyL', char: 'त', shift: 'थ', finger: 'ring', row: 2 },
  { code: 'Semicolon', char: 'च', shift: 'छ', finger: 'pinky', row: 2 },
  { code: 'Quote', char: 'ट', shift: 'ठ', finger: 'pinky', row: 2 },
  // Row 3
  { code: 'KeyZ', char: 'ॆ', shift: 'ऑ', finger: 'pinky', row: 3 },
  { code: 'KeyX', char: 'ं', shift: 'ँ', finger: 'ring', row: 3 },
  { code: 'KeyC', char: 'म', shift: 'ण', finger: 'middle', row: 3 },
  { code: 'KeyV', char: 'न', shift: 'ञ', finger: 'index', row: 3 },
  { code: 'KeyB', char: 'व', shift: 'ळ', finger: 'index', row: 3 },
  { code: 'KeyN', char: 'ल', shift: 'ळ', finger: 'index', row: 3 },
  { code: 'KeyM', char: 'स', shift: 'श', finger: 'index', row: 3 },
  { code: 'Comma', char: ',', shift: 'ष', finger: 'middle', row: 3 },
  { code: 'Period', char: '.', shift: '।', finger: 'ring', row: 3 },
  { code: 'Slash', char: 'य', shift: 'य', finger: 'pinky', row: 3 },
];

export const REMADEL_MAP: KeyMap[] = [
  // Row 1
  { code: 'KeyQ', char: 'ु', shift: 'फ', finger: 'pinky', row: 1 },
  { code: 'KeyW', char: 'ू', shift: 'ॅ', finger: 'ring', row: 1 },
  { code: 'KeyE', char: 'म', shift: 'म्', finger: 'middle', row: 1 },
  { code: 'KeyR', char: 'त', shift: 'त्', finger: 'index', row: 1 },
  { code: 'KeyT', char: 'ज', shift: 'ज्', finger: 'index', row: 1 },
  { code: 'KeyY', char: 'ल', shift: 'ल्', finger: 'index', row: 1 },
  { code: 'KeyU', char: 'न', shift: 'न्', finger: 'index', row: 1 },
  { code: 'KeyI', char: 'प', shift: 'प्', finger: 'middle', row: 1 },
  { code: 'KeyO', char: 'व', shift: 'व्', finger: 'ring', row: 1 },
  { code: 'KeyP', char: 'च', shift: 'च्', finger: 'pinky', row: 1 },
  // Row 2
  { code: 'KeyA', char: 'ं', shift: 'ा', finger: 'pinky', row: 2 },
  { code: 'KeyS', char: 'े', shift: 'ै', finger: 'ring', row: 2 },
  { code: 'KeyD', char: 'क', shift: 'क्', finger: 'middle', row: 2 },
  { code: 'KeyF', char: 'ि', shift: 'थ', finger: 'index', row: 2 },
  { code: 'KeyG', char: 'ह', shift: 'ह्', finger: 'index', row: 2 },
  { code: 'KeyH', char: 'ी', shift: 'ी', finger: 'index', row: 2 },
  { code: 'KeyJ', char: 'र', shift: 'श्र', finger: 'index', row: 2 },
  { code: 'KeyK', char: 'ा', shift: 'ा', finger: 'middle', row: 2 },
  { code: 'KeyL', char: 'स', shift: 'स्', finger: 'ring', row: 2 },
  { code: 'Semicolon', char: 'य', shift: 'य्', finger: 'pinky', row: 2 },
  // Row 3
  { code: 'KeyX', char: 'ग', shift: 'ग्', finger: 'ring', row: 3 },
  { code: 'KeyC', char: 'ब', shift: 'ब्', finger: 'middle', row: 3 },
  { code: 'KeyV', char: 'अ', shift: 'आ', finger: 'index', row: 3 },
  { code: 'KeyB', char: 'इ', shift: 'ई', finger: 'index', row: 3 },
  { code: 'KeyN', char: 'द', shift: 'ध्', finger: 'index', row: 3 },
  { code: 'KeyM', char: 'ध', shift: 'ढ', finger: 'index', row: 3 },
];

export const LEARNING_LESSONS: Lesson[] = [
  { target: "ककककक", instruction: "Lesson 1 — Home Row: Type 'क' (middle finger, right hand) 5 times." },
  { target: "ततततत", instruction: "Lesson 2 — Home Row: Type 'त' (ring finger, right hand) 5 times." },
  { target: "कत", instruction: "Lesson 3 — Combination: Type the word 'कत'." },
  { target: "ममममम", instruction: "Lesson 4 — Left Hand: Type 'म' (middle finger, left hand) 5 times." },
  { target: "ननननन", instruction: "Lesson 5 — Left Hand: Type 'न' (index finger, left hand) 5 times." },
  { target: "मन", instruction: "Lesson 6 — Word: Type the word 'मन'." },
  { target: "कमान", instruction: "Lesson 7 — Word: Type the full word 'कमान'." },
  { target: "नमस्ते", instruction: "Lesson 8 — Classic: Type 'नमस्ते'." },
  { target: "भारत", instruction: "Lesson 9 — Word: Type 'भारत'." },
  { target: "हिन्दी", instruction: "Lesson 10 — Word: Type 'हिन्दी'." },
];

export const PARAGRAPHS = [
  "भारत एक महान देश है। यहाँ की संस्कृति और परंपराएँ विश्व प्रसिद्ध हैं। हिन्दी हमारी राष्ट्रभाषा है और इसे सीखना गर्व की बात है।",
  "प्रकृति की सुंदरता हमें शांति प्रदान करती है। पेड़-पौधे और हरियाली हमारे जीवन के लिए अत्यंत महत्वपूर्ण हैं। हमें पर्यावरण की रक्षा करनी चाहिए।",
  "शिक्षा हर व्यक्ति का मौलिक अधिकार है। यह हमें सही और गलत के बीच अंतर करना सिखाती है। एक शिक्षित समाज ही उन्नति कर सकता है।",
  "समय बहुत मूल्यवान है। इसे कभी व्यर्थ नहीं करना चाहिए। जो व्यक्ति समय का सदुपयोग करता है, वह जीवन में सफल होता है।",
  "स्वास्थ्य ही सबसे बड़ा धन है। नियमित व्यायाम और उचित आहार से हम स्वस्थ रह सकते हैं। एक स्वस्थ मन में ही स्वस्थ विचार उत्पन्न होते हैं।",
];

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  totalSessions: number;
  bestWpm: number;
  totalParagraphs: number;
  totalLessons: number;
  bestAccuracy: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_session', title: 'First Keystroke', description: 'Complete your first session', icon: '🎯', condition: (s) => s.totalSessions >= 1 },
  { id: 'speed_30', title: 'Beginner Typist', description: 'Reach 30 WPM', icon: '⚡', condition: (s) => s.bestWpm >= 30 },
  { id: 'speed_50', title: 'Skilled Typist', description: 'Reach 50 WPM', icon: '🚀', condition: (s) => s.bestWpm >= 50 },
  { id: 'speed_70', title: 'Speed Demon', description: 'Reach 70 WPM', icon: '🔥', condition: (s) => s.bestWpm >= 70 },
  { id: 'accuracy_90', title: 'Precise', description: 'Finish a session with 90%+ accuracy', icon: '✨', condition: (s) => s.bestAccuracy >= 90 },
  { id: 'accuracy_99', title: 'Perfectionist', description: 'Finish a session with 99%+ accuracy', icon: '💎', condition: (s) => s.bestAccuracy >= 99 },
  { id: 'para_3', title: 'Paragraph Pro', description: 'Complete 3 paragraphs', icon: '📝', condition: (s) => s.totalParagraphs >= 3 },
  { id: 'para_all', title: 'Linguist', description: 'Complete all paragraphs', icon: '🏆', condition: (s) => s.totalParagraphs >= 5 },
  { id: 'lessons_all', title: 'Graduate', description: 'Complete all 10 lessons', icon: '🎓', condition: (s) => s.totalLessons >= 10 },
  { id: 'sessions_10', title: 'Dedicated', description: 'Complete 10 sessions', icon: '⭐', condition: (s) => s.totalSessions >= 10 },
];
