import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Globe, Shield, User, Landmark, CheckCircle, LogOut, Info, AlertTriangle, ChevronDown, UploadCloud, FileText, X, FileCheck, ArrowRight, Loader2, Sparkles, BookOpen, BrainCircuit, Activity, Settings, Type, Languages, Gauge, MessageSquare, Dices, Layers, CheckSquare, Target, Timer, Clock, PlayCircle, RefreshCw, MessageCircle, ListChecks, XCircle, RotateCcw, BarChart3, Image as ImageIcon, Users, Monitor } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, serverTimestamp, deleteDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCdktXlsvR9jC3m7SPZtZewKsSzUOuaDSM",
  authDomain: "qurnia-monitor.firebaseapp.com",
  projectId: "qurnia-monitor",
  storageBucket: "qurnia-monitor.firebasestorage.app",
  messagingSenderId: "317226508638",
  appId: "1:317226508638:web:6ea6058a9283ed1e9defcf"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const TRANSLATIONS = {
  en: {
    // Phase 1
    langName: "English (GB)", tagline: "Learning with you, besides you, and for you!", nameLabel: "Full Name", namePlaceholder: "Enter your full name", orgLabel: "Organization", orgPlaceholder: "Enter your organization / institution", loginBtn: "Activate Platform", authError: "Authorization error. Please verify your credentials and try again.", welcome: "Welcome,", authorizedText: "Authentication successful! Your organization has been fully authorized to access the QURNIA! ecosystem.", logout: "Log Out", footer: "© 2026 QURNIA! Learning Platform. All rights reserved.", logoCredit: "The logo of QURNIA! is credited to Natania Callista Tarno (Pah Tsung Trilingual High School student)", phaseLabel: "Active Phase: Phase 1 (Auth & Localization Engine)", phaseDesc: "The core verification layer is active. Only accredited organizations can initiate the question synthesis core.", goToUploadBtn: "Enter Workspace",
    
    // Phase 2
    uploadTitle: "Document Ingestion Hub", uploadDesc: "Upload up to 5 documents (.pdf, .docx). Maximum total size 10MB.", dragDropText: "Drag & drop files here, or click to browse", typeError: "Only PDF and DOCX files are supported.", sizeLimitError: "Total file size exceeds 10MB limit.", fileLimitError: "Maximum of 5 files allowed.", analyzeBtn: "Analyze Documents", analyzing: "Analyzing...", topicLabel: "General Topics Covered", difficultyLabel: "Estimated Difficulty", styleLabel: "Narration Style", detailsLabel: "Key Extracted Details", proceedBtn: "Proceed to Question Customization",
    
    // Phase 3
    custTitle: "Question Customization Hub", custDesc: "Configure the parameters for your generated practice set.", topicSelectTitle: "Focus Topics", randomTopic: "Surprise Me (Random Topic)", langSelectTitle: "Question Language", diffSelectTitle: "Difficulty Level", diffEasy: "Easy", diffMedium: "Medium", diffHard: "Hard", diffRandom: "Randomized", typeSelectTitle: "Question Types", typeMcq4: "4-Choice MCQ (A-D)", typeMcq5: "5-Choice MCQ (A-E)", typeMcqComplex: "Complex MCQ (1-2 Correct)", typeFillText: "Text Fill-in-the-Blank", typeFillNum: "Numerical Fill-in (e.g., 6,0)", typeEssay: "Long Text / Essay (AI Scored)", specialReqTitle: "Special Instructions", specialReqPlaceholder: "e.g., 'Make the questions architecture-themed', or 'Correlate this to the medical field...'",
    
    // Modes
    modeSelectTitle: "Activity Mode", modePractice: "Practice Mode", modeTryOut: "Try Out Mode", tryOutSettingsTitle: "Try Out Settings", qCountLabel: "Number of Questions", durationLabel: "Duration", startPracticeBtn: "Start Practice", startTryOutBtn: "Start Try Out",
    
    // Phase 4
    pracTitle: "Practice Session", pracDesc: "Master the material at your own pace.", pracPlaceholder: "Ready to test your knowledge? Click 'Generate New' to fetch your first question.", btnGenNew: "Generate New", btnCheck: "Check", btnDiscuss: "Discussion", btnSummarize: "Summarize", btnRetry: "Retry", btnIllustrate: "Illustrate", illustrating: "Drawing...",
    correctMsgs: ["Brilliant work!", "You nailed it perfectly!", "That's exactly right.", "Your understanding is solid.", "Keep up this fantastic momentum!"],
    incorrectMsgs: ["Don't give up!", "Mistakes are just stepping stones to learning.", "You're getting closer, try reviewing the concepts.", "Take a deep breath and look at it from another angle.", "Every attempt builds your brain power!"],
    discussionTitle: "Step-by-Step Discussion", evaluating: "Evaluating Answer...",
    
    // Phase 4 - Segment 4 (Summary)
    summaryTitle: "Session Summary", summaryDesc: "Here is your detailed performance analytics for this practice session.", accuracyLabel: "First-Attempt Accuracy", totalQ: "Questions Tackled", totalRetries: "Total Session Retries", reviewTitle: "Detailed Question Review", correctFirst: "Correct on First Try", incorrectFirst: "Incorrect on First Try", retryCountText: "Retries before passing:", returnToHubBtn: "Return to Customization Hub",
    
    // Phase 5
    // Phase 5 - Segment 2 (Try Out UI)
    submitTryOut: "Submit Try Out", nextBtn: "Next", prevBtn: "Previous", qNavTitle: "Navigation", timeRemLabel: "Time Remaining", qPrefix: "Question",
    
    // Phase 5 - Segment 3 (Anti-Cheat)
    cheatWarningTitle: "Integrity Warning", cheatWarningDesc: "Your cursor has left the active examination window. Please maintain focus on the test.", cheatViolationCountLabel: "Violations Recorded",

    // Phase 5 - Segment 4 (Summary Sub 4A & 4C)
    finalScoreLabel: "Objective Score", cheatViolationsLabel: "Integrity Flags", noAnswer: "No Answer Provided", yourAnswer: "Your Answer", correctAnswer: "Correct Answer"
  },
  id: {
    // Phase 1
    langName: "Bahasa Indonesia", tagline: "Belajar bersamamu, di sampingmu, dan untukmu!", nameLabel: "Nama Lengkap", namePlaceholder: "Masukkan nama lengkap Anda", orgLabel: "Organisasi", orgPlaceholder: "Masukkan nama organisasi / institusi Anda", loginBtn: "Aktifkan Platform", authError: "Kesalahan otorisasi. Silakan verifikasi data Anda dan coba lagi.", welcome: "Selamat Datang,", authorizedText: "Autentikasi berhasil! Organisasi Anda telah sepenuhnya diberikan akses ke ekosistem QURNIA!.", logout: "Keluar", footer: "© 2026 Platform Pembelajaran QURNIA!. Hak cipta dilindungi undang-undang.", logoCredit: "Logo QURNIA! dikreditkan kepada Natania Callista Tarno (siswi SMA Tiga Bahasa Pah Tsung)", phaseLabel: "Fase Aktif: Fase 1 (Sistem Autentikasi & Lokalisasi)", phaseDesc: "Lapisan verifikasi inti sedang aktif. Hanya organisasi terakreditasi yang dapat mengakses modul pembuat soal.", goToUploadBtn: "Masuk ke Ruang Kerja",
    
    // Phase 2
    uploadTitle: "Pusat Ingesti Dokumen", uploadDesc: "Unggah hingga 5 dokumen (.pdf, .docx). Ukuran total maksimum 10MB.", dragDropText: "Seret & lepas file di sini, atau klik untuk meramban", typeError: "Hanya file PDF dan DOCX yang didukung.", sizeLimitError: "Total ukuran file melebihi batas 10MB.", fileLimitError: "Maksimal 5 file diizinkan.", analyzeBtn: "Analisis Dokumen", analyzing: "Menganalisis...", topicLabel: "Topik Umum yang Dicakup", difficultyLabel: "Estimasi Tingkat Kesulitan", styleLabel: "Gaya Narasi", detailsLabel: "Detail Penting yang Diekstraksi", proceedBtn: "Lanjutkan ke Penyesuaian Pertanyaan",
    
    // Phase 3
    custTitle: "Pusat Kustomisasi Pertanyaan", custDesc: "Konfigurasikan parameter untuk set latihan yang akan dihasilkan.", topicSelectTitle: "Fokus Topik", randomTopic: "Beri Saya Kejutan (Topik Acak)", langSelectTitle: "Bahasa Pertanyaan", diffSelectTitle: "Tingkat Kesulitan", diffEasy: "Mudah", diffMedium: "Sedang", diffHard: "Sulit", diffRandom: "Diacak", typeSelectTitle: "Jenis Pertanyaan", typeMcq4: "Pilihan Ganda 4 Opsi (A-D)", typeMcq5: "Pilihan Ganda 5 Opsi (A-E)", typeMcqComplex: "Pilihan Ganda Kompleks (1-2 Benar)", typeFillText: "Isian Singkat Teks", typeFillNum: "Isian Angka (misal: 6,0)", typeEssay: "Esai Panjang (Dinilai AI)", specialReqTitle: "Instruksi Khusus", specialReqPlaceholder: "contoh: 'Buat pertanyaannya bertema arsitektur', atau 'Hubungkan dengan bidang medis...'",
    
    // Modes
    modeSelectTitle: "Mode Aktivitas", modePractice: "Mode Latihan", modeTryOut: "Mode Try Out", tryOutSettingsTitle: "Pengaturan Try Out", qCountLabel: "Jumlah Pertanyaan", durationLabel: "Durasi", startPracticeBtn: "Mulai Latihan", startTryOutBtn: "Mulai Try Out",
    
    // Phase 4
    pracTitle: "Sesi Latihan", pracDesc: "Kuasai materi dengan kecepatan Anda sendiri.", pracPlaceholder: "Siap menguji pengetahuan Anda? Klik 'Hasilkan Baru' untuk mendapatkan pertanyaan pertama Anda.", btnGenNew: "Hasilkan Baru", btnCheck: "Periksa", btnDiscuss: "Diskusi", btnSummarize: "Ringkasan", btnRetry: "Coba Lagi", btnIllustrate: "Ilustrasi", illustrating: "Menggambar...",
    correctMsgs: ["Kerja yang brilian!", "Kamu menjawabnya dengan sempurna!", "Itu tepat sekali.", "Pemahamanmu sangat solid.", "Pertahankan momentum luar biasa ini!"],
    incorrectMsgs: ["Jangan menyerah!", "Kesalahan hanyalah batu loncatan untuk belajar.", "Kamu semakin dekat, coba tinjau kembali konsepnya.", "Tarik napas dalam-dalam dan lihat dari sudut pandang lain.", "Setiap percobaan membangun kekuatan otakmu!"],
    discussionTitle: "Diskusi Langkah-demi-Langkah", evaluating: "Mengevaluasi Jawaban...",
    
    // Phase 4 - Segment 4 (Summary)
    summaryTitle: "Ringkasan Sesi", summaryDesc: "Berikut adalah analisis detail performa Anda untuk sesi latihan ini.", accuracyLabel: "Akurasi Percobaan Pertama", totalQ: "Pertanyaan Dikerjakan", totalRetries: "Total Percobaan Ulang", reviewTitle: "Ulasan Pertanyaan Terperinci", correctFirst: "Benar di Percobaan Pertama", incorrectFirst: "Salah di Percobaan Pertama", retryCountText: "Percobaan ulang sebelum benar:", returnToHubBtn: "Kembali ke Pusat Kustomisasi",
    
    // Phase 5
    // Phase 5 - Segment 2 (Try Out UI)
    submitTryOut: "Kumpulkan Try Out", nextBtn: "Selanjutnya", prevBtn: "Sebelumnya", qNavTitle: "Navigasi", timeRemLabel: "Sisa Waktu", qPrefix: "Pertanyaan",
    
    // Phase 5 - Segment 3 (Anti-Cheat)
    cheatWarningTitle: "Peringatan Integritas", cheatWarningDesc: "Kursor Anda telah meninggalkan jendela ujian aktif. Harap tetap fokus pada tes.", cheatViolationCountLabel: "Pelanggaran Dicatat",

    // Phase 5 - Segment 4 (Summary Sub 4A & 4C)
    finalScoreLabel: "Skor Objektif", cheatViolationsLabel: "Pelanggaran Integritas", noAnswer: "Tidak Ada Jawaban", yourAnswer: "Jawaban Anda", correctAnswer: "Jawaban Benar"
  },
  zh_CN: {
    // Phase 1
    langName: "简体中文", tagline: "与你一起学习，伴你身旁，为你而学！", nameLabel: "真实姓名", namePlaceholder: "请输入您的真实姓名", orgLabel: "机构/组织", orgPlaceholder: "请输入您的机构或组织名称", loginBtn: "激活平台", authError: "授权错误。请核对您填写的内容并重试。", welcome: "欢迎您，", authorizedText: "身份验证成功！您的机构已获得访问 QURNIA! 生态系统的完整授权。", logout: "退出登录", footer: "© 2026 QURNIA! 学习平台。版权所有。", logoCredit: "QURNIA! 标志设计归功于 Natania Callista Tarno（巴中三语高中学生）", phaseLabel: "当前阶段：阶段 1 (身份验证与本地化引擎)", phaseDesc: "核心验证层已启用。只有经过认证的组织机构才能运行题目生成核心模块。", goToUploadBtn: "进入工作区",
    
    // Phase 2
    uploadTitle: "文档接收中心", uploadDesc: "最多上传5个文档 (.pdf, .docx)。总大小上限为10MB。", dragDropText: "将文件拖放到此处，或点击浏览", typeError: "仅支持 PDF 和 DOCX 文件。", sizeLimitError: "总文件大小超过 10MB 限制。", fileLimitError: "最多允许上传 5 个文件。", analyzeBtn: "分析文档", analyzing: "分析中...", topicLabel: "涵盖的一般主题", difficultyLabel: "预估难度", styleLabel: "叙述风格", detailsLabel: "提取的关键细节", proceedBtn: "继续进行题目自定义",
    
    // Phase 3
    custTitle: "题目自定义中心", custDesc: "配置生成练习集的参数。", topicSelectTitle: "重点主题", randomTopic: "给我惊喜 (随机主题)", langSelectTitle: "题目语言", diffSelectTitle: "难度级别", diffEasy: "简单", diffMedium: "中等", diffHard: "困难", diffRandom: "随机", typeSelectTitle: "题型", typeMcq4: "4 选项单选题 (A-D)", typeMcq5: "5 选项单选题 (A-E)", typeMcqComplex: "复杂选择题 (1-2个正确)", typeFillText: "文本填空题", typeFillNum: "数字填空题 (例如: 6,0)", typeEssay: "长文本/问答题 (AI评分)", specialReqTitle: "特殊指令", specialReqPlaceholder: "例如：'将题目设定为建筑主题'，或'将其与医学领域相关联...'",
    
    // Modes
    modeSelectTitle: "活动模式", modePractice: "练习模式", modeTryOut: "模拟测试模式 (Try Out)", tryOutSettingsTitle: "测试设置", qCountLabel: "题目数量", durationLabel: "时长", startPracticeBtn: "开始练习", startTryOutBtn: "开始测试",
    
    // Phase 4
    pracTitle: "练习模式", pracDesc: "按照您自己的节奏掌握材料。", pracPlaceholder: "准备好测试您的知识了吗？点击“生成新题目”获取第一道题。", btnGenNew: "生成新题目", btnCheck: "检查", btnDiscuss: "讨论解析", btnSummarize: "总结", btnRetry: "重试", btnIllustrate: "生成插图", illustrating: "绘制中...",
    correctMsgs: ["非常棒！", "你完全答对了！", "完全正确。", "你的理解非常扎实。", "保持这个极好的势头！"],
    incorrectMsgs: ["不要放弃！", "错误只是学习的垫脚石。", "你离正确答案越来越近了，试着复习一下概念。", "深呼吸，从另一个角度来看看。", "每一次尝试都在增强你的脑力！"],
    discussionTitle: "逐步解析", evaluating: "正在评估答案...",
    
    // Phase 4 - Segment 4 (Summary)
    summaryTitle: "会话总结", summaryDesc: "这是您在此次练习中的详细表现分析。", accuracyLabel: "首次尝试准确率", totalQ: "已答题目", totalRetries: "总重试次数", reviewTitle: "详细题目回顾", correctFirst: "首次尝试正确", incorrectFirst: "首次尝试错误", retryCountText: "通过前重试次数:", returnToHubBtn: "返回自定义中心",
    
    // Phase 5
    // Phase 5 - Segment 2 (Try Out UI)
    submitTryOut: "提交模拟考试", nextBtn: "下一题", prevBtn: "上一题", qNavTitle: "导航", timeRemLabel: "剩余时间", qPrefix: "题目",
    
    // Phase 5 - Segment 3 (Anti-Cheat)
    cheatWarningTitle: "诚信警告", cheatWarningDesc: "您的光标已离开活动考试窗口。请保持对考试的关注。", cheatViolationCountLabel: "记录的违规次数",

    // Phase 5 - Segment 4 (Summary Sub 4A & 4C)
    finalScoreLabel: "客观得分", cheatViolationsLabel: "诚信警告", noAnswer: "未提供答案", yourAnswer: "你的答案", correctAnswer: "正确答案"
  },
  zh_TW: {
    // Phase 1
    langName: "繁體中文", tagline: "與你一起學習，伴你身旁，為你而學！", nameLabel: "真實姓名", namePlaceholder: "請輸入您的真實姓名", orgLabel: "機構/組織", orgPlaceholder: "請輸入您的機構或組織名稱", loginBtn: "激活平台", authError: "授權錯誤。請核對您填寫的內容並重試。", welcome: "歡迎您，", authorizedText: "身份驗證成功！您的機構已獲得訪問 QURNIA! 生態系統的完整授權。", logout: "退出登入", footer: "© 2026 QURNIA! 學習平台。版權所有。", logoCredit: "QURNIA! 標誌設計鳴謝 Natania Callista Tarno（巴中三語高中學生）", phaseLabel: "當前階段：階段 1 (身份驗證與本地化引擎)", phaseDesc: "核心驗證層已啟用。只有經過認證的組織機構才能運行題目生成核心模組。", goToUploadBtn: "進入工作區",
    
    // Phase 2
    uploadTitle: "文檔接收中心", uploadDesc: "最多上傳5個文檔 (.pdf, .docx)。總大小上限為10MB。", dragDropText: "將文件拖放到此處，或點擊瀏覽", typeError: "僅支持 PDF 和 DOCX 文件。", sizeLimitError: "總文件大小超過 10MB 限制。", fileLimitError: "最多允許上傳 5 個文件。", analyzeBtn: "分析文檔", analyzing: "分析中...", topicLabel: "涵蓋的一般主題", difficultyLabel: "預估難度", styleLabel: "敘述風格", detailsLabel: "提取的關鍵細節", proceedBtn: "繼續進行題目自定義",
    
    // Phase 3
    custTitle: "題目自定義中心", custDesc: "配置生成練習集的參數。", topicSelectTitle: "重點主題", randomTopic: "給我驚喜 (隨機主題)", langSelectTitle: "題目語言", diffSelectTitle: "難度級別", diffEasy: "簡單", diffMedium: "中等", diffHard: "困難", diffRandom: "隨機", typeSelectTitle: "題型", typeMcq4: "4 選項單選題 (A-D)", typeMcq5: "5 選項單選題 (A-E)", typeMcqComplex: "複雜選擇題 (1-2個正確)", typeFillText: "文本填空題", typeFillNum: "數字填空題 (例如: 6,0)", typeEssay: "長文本/問答題 (AI評分)", specialReqTitle: "特殊指令", specialReqPlaceholder: "例如：'將題目設定為建築主題'，或'將其與醫學領域相關聯...'",
    
    // Modes
    modeSelectTitle: "活動模式", modePractice: "練習模式", modeTryOut: "模擬測試模式 (Try Out)", tryOutSettingsTitle: "測試設置", qCountLabel: "題目數量", durationLabel: "時長", startPracticeBtn: "開始練習", startTryOutBtn: "開始測試",
    
    // Phase 4
    pracTitle: "練習模式", pracDesc: "按照您自己的節奏掌握材料。", pracPlaceholder: "準備好測試您的知識了嗎？點擊「生成新題目」獲取第一題。", btnGenNew: "生成新題目", btnCheck: "檢查", btnDiscuss: "討論解析", btnSummarize: "總結", btnRetry: "重試", btnIllustrate: "生成插圖", illustrating: "繪製中...",
    correctMsgs: ["非常棒！", "你完全答對了！", "完全正確。", "你的理解非常紮實。", "保持這個極好的勢頭！"],
    incorrectMsgs: ["不要放棄！", "錯誤只是學習的墊腳石。", "你離正確答案越來越近了，試著複習一下概念。", "深呼吸，從另一個角度來看看。", "每一次嘗試都在增強你的腦力！"],
    discussionTitle: "逐步解析", evaluating: "正在評估答案...",
    
    // Phase 4 - Segment 4 (Summary)
    summaryTitle: "會話總結", summaryDesc: "這是您在此次練習中的詳細表現分析。", accuracyLabel: "首次嘗試準確率", totalQ: "已答題目", totalRetries: "總重試次數", reviewTitle: "詳細題目回顧", correctFirst: "首次嘗試正確", incorrectFirst: "首次嘗試錯誤", retryCountText: "通過前重試次數:", returnToHubBtn: "返回自定義中心",
    
    // Phase 5
    // Phase 5 - Segment 2 (Try Out UI)
    submitTryOut: "提交模擬考試", nextBtn: "下一題", prevBtn: "上一題", qNavTitle: "導航", timeRemLabel: "剩餘時間", qPrefix: "題目",
    
    // Phase 5 - Segment 3 (Anti-Cheat)
    cheatWarningTitle: "誠信警告", cheatWarningDesc: "您的游標已離開活動考試窗口。請保持對考試的關注。", cheatViolationCountLabel: "記錄的違規次數",

    // Phase 5 - Segment 4 (Summary Sub 4A & 4C)
    finalScoreLabel: "客觀得分", cheatViolationsLabel: "誠信警告", noAnswer: "未提供答案", yourAnswer: "你的答案", correctAnswer: "正確答案"
  }
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [currentView, setCurrentView] = useState('login'); 
  
  // Phase 0: Firebase Auth State
  const [currentUserUid, setCurrentUserUid] = useState(null);

  useEffect(() => {
    signInAnonymously(auth).catch((error) => console.error("Auth Error:", error));
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUserUid(user.uid);
      else setCurrentUserUid(null);
    });
    return () => unsubscribe();
  }, []);

  // Login State
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Phase 1 & 2: Monitor Mode State
  const [appMode, setAppMode] = useState('solo'); // 'solo' or 'monitor'
  const [role, setRole] = useState(null); // 'host' or 'student'
  const [roomCode, setRoomCode] = useState(''); 
  const [studentInputCode, setStudentInputCode] = useState('');
  const [participants, setParticipants] = useState([]);
  const [joinError, setJoinError] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  
  const [roomStatus, setRoomStatus] = useState(null);
  const hasStartedRef = useRef(false);

  const unsubscribeParticipantsRef = useRef(null);
  const unsubscribeRoomRef = useRef(null);

  // Firebase Lobby Functions (Phase 2)
  const handleCreateRoom = async () => {
    setIsCreatingRoom(true);
    try {
      // Generate 5 digit code
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 5; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      const roomRef = doc(db, 'rooms', code);
      await setDoc(roomRef, {
        hostName: name,
        hostUid: currentUserUid,
        status: 'waiting',
        createdAt: serverTimestamp(),
        config: null
      });

      setRoomCode(code);
      setRole('host');
      setCurrentView('host_lobby');

      // Listen for joined students
      const participantsRef = collection(db, 'rooms', code, 'participants');
      unsubscribeParticipantsRef.current = onSnapshot(participantsRef, (snapshot) => {
        const students = [];
        snapshot.forEach((doc) => {
          students.push({ uid: doc.id, ...doc.data() });
        });
        setParticipants(students);
      });
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async () => {
    setJoinError('');
    setIsJoiningRoom(true);
    try {
      const code = studentInputCode.trim().toUpperCase();
      const roomRef = doc(db, 'rooms', code);
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        if (roomData.status !== 'waiting') {
          setJoinError('This session has already started or ended.');
          setIsJoiningRoom(false);
          return;
        }

        // Add student to room
        const participantRef = doc(db, 'rooms', code, 'participants', currentUserUid);
        await setDoc(participantRef, {
          name: name,
          joinedAt: serverTimestamp(),
          progress: 0,
          score: 0,
          cheatFlags: 0,
          status: 'active'
        });

        setRoomCode(code);
        setRole('student');
        setCurrentView('student_waiting');
        hasStartedRef.current = false;
        setRoomStatus('waiting');

        // Phase 3 & Bugfix: Continuous listener for status updates
        unsubscribeRoomRef.current = onSnapshot(roomRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setRoomStatus(data.status); // Safe real-time state trigger

            if (data.status === 'in-progress' && data.config && !hasStartedRef.current) {
               hasStartedRef.current = true;
               
               // Update local state with teacher's configuration visually
               setAnalysisResult(data.config.analysisResult);
               setCustomTopics(data.config.customTopics);
               setIsRandomTopic(data.config.isRandomTopic);
               setQLanguage(data.config.qLanguage);
               setQDifficulty(data.config.qDifficulty);
               setQTypes(data.config.qTypes);
               setSpecialRequest(data.config.specialRequest);
               setSelectedMode(data.config.selectedMode);
               setTryOutQCount(data.config.tryOutQCount);
               setTryOutDuration(data.config.tryOutDuration);

               // Automatically trigger correct mode strictly passing config override
               if (data.config.selectedMode === 'tryout') {
                 generateTryOut(data.config);
               } else {
                 generateQuestion(data.config);
               }
            }
          }
        });

      } else {
        setJoinError('Room not found. Please check the code.');
      }
    } catch (error) {
      console.error("Error joining room:", error);
      setJoinError('Connection error. Please try again.');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (unsubscribeParticipantsRef.current) {
      unsubscribeParticipantsRef.current();
      unsubscribeParticipantsRef.current = null;
    }
    if (unsubscribeRoomRef.current) {
      unsubscribeRoomRef.current();
      unsubscribeRoomRef.current = null;
    }

    if (role === 'student' && roomCode && currentUserUid) {
      deleteDoc(doc(db, 'rooms', roomCode, 'participants', currentUserUid)).catch(console.error);
    } else if (role === 'host' && roomCode) {
      deleteDoc(doc(db, 'rooms', roomCode)).catch(console.error);
    }

    setRole(null);
    setRoomCode('');
    setParticipants([]);
    setStudentInputCode('');
    setJoinError('');
    setCurrentView('role_selection');
  };

  // Upload State (Phase 2)
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Customization State (Phase 3)
  const [customTopics, setCustomTopics] = useState([]);
  const [isRandomTopic, setIsRandomTopic] = useState(false);
  const [qLanguage, setQLanguage] = useState('en');
  const [qDifficulty, setQDifficulty] = useState('medium');
  const [qTypes, setQTypes] = useState(['mcq4']);
  const [specialRequest, setSpecialRequest] = useState('');
  const [selectedMode, setSelectedMode] = useState('practice');
  const [tryOutQCount, setTryOutQCount] = useState(10);
  const [tryOutDuration, setTryOutDuration] = useState(30);

  // Practice State (Phase 4)
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [currentAttempts, setCurrentAttempts] = useState(0); 
  const [userAnswer, setUserAnswer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [katexLoaded, setKatexLoaded] = useState(false);
  
  const [checkState, setCheckState] = useState('idle'); 
  const [firstAttemptStatus, setFirstAttemptStatus] = useState(null); 
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [illustrationUrl, setIllustrationUrl] = useState(null);
  const [isIllustrating, setIsIllustrating] = useState(false);
  const [showIllustrationModal, setShowIllustrationModal] = useState(false);

  // Phase 5 State
  const [tryOutQuestions, setTryOutQuestions] = useState([]);
  const [userTryOutAnswers, setUserTryOutAnswers] = useState({});
  const [isGeneratingTryOut, setIsGeneratingTryOut] = useState(false);
  // Phase 5 - Segment 2 (Try Out UI State)
  const [currentTryOutIndex, setCurrentTryOutIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Phase 5 - Segment 3 (Anti-Cheat State)
  const [cheatViolationsCount, setCheatViolationsCount] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);

  // Phase 5 - Segment 4A (Try Out Analytics Local State)
  const [objectiveScore, setObjectiveScore] = useState({ correct: 0, total: 0 });
  const [isEvaluatingTryOut, setIsEvaluatingTryOut] = useState(false);
  const [tryOutFeedback, setTryOutFeedback] = useState(null);
  
  // Modal State for Sub-Segment 4C Discussion
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);

  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const t = TRANSLATIONS[lang];

  // Phase 4: Student Live Sync (Pushes progress and cheat flags to Teacher)
  useEffect(() => {
    if (role === 'student' && roomCode && currentUserUid && currentView === 'tryout') {
      const syncProgress = async () => {
        try {
          const participantRef = doc(db, 'rooms', roomCode, 'participants', currentUserUid);
          await updateDoc(participantRef, {
            progress: Object.keys(userTryOutAnswers).length,
            cheatFlags: cheatViolationsCount
          });
        } catch (e) {
          console.error("Sync error:", e);
        }
      };
      syncProgress();
    }
  }, [userTryOutAnswers, cheatViolationsCount, role, roomCode, currentView, currentUserUid, db]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (window.katex) {
      setKatexLoaded(true);
      return;
    }

    const checkKatex = setInterval(() => {
      if (window.katex) {
        setKatexLoaded(true);
        clearInterval(checkKatex);
      }
    }, 100);

    if (!document.getElementById('katex-css')) {
      const link = document.createElement('link');
      link.id = 'katex-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      document.head.appendChild(link);
    }
    
    if (!document.getElementById('katex-js')) {
      const script = document.createElement('script');
      script.id = 'katex-js';
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
      document.head.appendChild(script);
    }

    return () => clearInterval(checkKatex);
  }, []);

  const renderMathText = useCallback((text) => {
    if (!text) return null;
    if (!katexLoaded || !window.katex) return <>{text}</>; 
    
    const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      let math = null;
      let isDisplay = false;

      if (part.startsWith('$$') && part.endsWith('$$')) {
        math = part.slice(2, -2);
        isDisplay = true;
      } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
        math = part.slice(2, -2);
        isDisplay = true;
      } else if (part.startsWith('$') && part.endsWith('$')) {
        math = part.slice(1, -1);
      } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
        math = part.slice(2, -2);
      }

      if (math !== null) {
        try {
          const html = window.katex.renderToString(math.trim(), { 
            displayMode: isDisplay, 
            throwOnError: false,
            strict: false
          });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} className={isDisplay ? "block my-2 overflow-x-auto text-center" : ""} />;
        } catch (e) {
          return <span key={index} className="text-red-400">{part}</span>;
        }
      }
      
      return <span key={index}>{part}</span>;
    });
  }, [katexLoaded]);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    setTimeout(() => {
      const sanitizedOrg = organization.toLowerCase().trim();
      if (name.trim() !== "" && sanitizedOrg.includes("pah tsung")) {
        setIsAuthorized(true);
        setErrorMsg('');
      } else {
        setErrorMsg(t.authError);
        setIsAuthorized(false);
      }
      setSubmitting(false);
    }, 800);
  };

  const handleLogout = () => {
    if (unsubscribeParticipantsRef.current) {
      unsubscribeParticipantsRef.current();
      unsubscribeParticipantsRef.current = null;
    }
    if (unsubscribeRoomRef.current) {
      unsubscribeRoomRef.current();
      unsubscribeRoomRef.current = null;
    }
    if (role === 'student' && roomCode && currentUserUid) {
      deleteDoc(doc(db, 'rooms', roomCode, 'participants', currentUserUid)).catch(console.error);
    }
    
    setName('');
    setOrganization('');
    setIsAuthorized(false);
    setErrorMsg('');
    setCurrentView('login');
    
    setAppMode('solo');
    setRole(null);
    setRoomCode('');
    setStudentInputCode('');
    setParticipants([]);
    setRoomStatus(null);
    hasStartedRef.current = false;

    setFiles([]);
    setAnalysisResult(null);
    setCustomTopics([]);
    setIsRandomTopic(false);
    setQTypes(['mcq4']);
    setSpecialRequest('');
    setSelectedMode('practice');
    setCurrentQuestion(null);
    setSessionHistory([]);
    setCurrentAttempts(0);
    setUserAnswer('');
    setCheckState('idle');
    setFirstAttemptStatus(null);
    setFeedbackMsg('');
    setIllustrationUrl(null);
    setIsIllustrating(false);
    setShowIllustrationModal(false);
    
    setTryOutQuestions([]);
    setUserTryOutAnswers({});
    setCheatViolationsCount(0);
    setShowCheatWarning(false);
    setCurrentTryOutIndex(0);
    setTimeLeft(0);
    setObjectiveScore({ correct: 0, total: 0 });
    setIsEvaluatingTryOut(false);
    setTryOutFeedback(null);
    setSelectedDiscussion(null);
  };

  const resetPracticeAndReturn = () => {
    setCurrentQuestion(null);
    setSessionHistory([]);
    setCurrentAttempts(0);
    setUserAnswer('');
    setCheckState('idle');
    setFirstAttemptStatus(null);
    setFeedbackMsg('');
    setIllustrationUrl(null);
    setIsIllustrating(false);
    setShowIllustrationModal(false);
    setTryOutQuestions([]);
    setUserTryOutAnswers({});
    setCheatViolationsCount(0);
    setShowCheatWarning(false);
    setCurrentTryOutIndex(0);
    setTimeLeft(0);
    setObjectiveScore({ correct: 0, total: 0 });
    setIsEvaluatingTryOut(false);
    setTryOutFeedback(null);
    setSelectedDiscussion(null);
    setCurrentView('customization');
  };

  const saveCurrentToHistory = () => {
    if (currentQuestion) {
      setSessionHistory(prev => [...prev, {
        questionText: currentQuestion.questionText,
        firstAttemptCorrect: firstAttemptStatus === 'correct',
        retries: currentAttempts,
        explanation: currentQuestion.explanation,
        type: currentQuestion.type
      }]);
    }
  };

  const handleSummarize = useCallback(() => {
    saveCurrentToHistory();
    setCurrentView('summary');
  }, [currentQuestion, firstAttemptStatus, currentAttempts]);

  const validateAndAddFiles = (newFilesList) => {
    setFileError('');
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    let validFiles = [];
    let currentTotalSize = files.reduce((acc, f) => acc + f.size, 0);

    for (let i = 0; i < newFilesList.length; i++) {
      const file = newFilesList[i];
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
        setFileError(t.typeError);
        continue;
      }
      if (currentTotalSize + file.size > 10 * 1024 * 1024) {
        setFileError(t.sizeLimitError);
        break;
      }
      if (files.length + validFiles.length >= 5) {
        setFileError(t.fileLimitError);
        break;
      }
      validFiles.push(file);
      currentTotalSize += file.size;
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  }, [files, lang]);

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length === 1) setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    setIsAnalyzing(true);
    setFileError('');

    try {
      const fileParts = await Promise.all(files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        const base64Data = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        return {
          inlineData: { data: base64Data, mimeType: mimeType }
        };
      }));

      const promptText = `
        You are an expert academic analyst and educational consultant. Your goal is to analyze the provided documents (which may be notes, previous exams, or academic literature).
        The documents are provided as file attachments.

        Please analyze all provided documents holistically and provide a general description.
        You MUST respond ONLY with a valid JSON object. Do not include markdown code blocks (like \`\`\`json) or any other text outside the JSON object.
        CRITICAL REQUIREMENT: All of the analysis text inside your JSON response MUST be translated to and written in ${t.langName}.

        The JSON object MUST adhere to this exact schema:
        {
          "topics": ["Array of strings", "Each representing a main academic subject, chapter, or concept", "Make these concise bullet points."],
          "difficulty": "An assessment of the difficulty level (e.g., 'Beginner/Middle School', 'Intermediate/High School', 'Advanced/University', 'Mixed'). Provide a short reasoning.",
          "style": "A description of the narration or structural style of the documents.",
          "importantDetails": "Any other critical details you noticed, such as the presence of complex formulas, specific localized contexts, or recurring question patterns."
        }
      `;

      const payload = {
        contents: [{ role: "user", parts: [{ text: promptText }, ...fileParts] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                topics: { type: "ARRAY", items: { type: "STRING" } },
                difficulty: { type: "STRING" },
                style: { type: "STRING" },
                importantDetails: { type: "STRING" }
              },
              required: ["topics", "difficulty", "style", "importantDetails"]
            }
        }
      };

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      let response = null;
      let attempt = 0;
      const maxRetries = 5;
      const delays = [1000, 2000, 4000, 8000, 16000];

      while (attempt <= maxRetries) {
        try {
          response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (response.ok) break;
          if (attempt === maxRetries) throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        } catch (error) {
          if (attempt === maxRetries) throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
        attempt++;
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0) {
        setAnalysisResult(JSON.parse(result.candidates[0].content.parts[0].text));
      } else {
        throw new Error("Invalid response structure from AI model.");
      }

    } catch (error) {
      console.error("Analysis failed:", error);
      setFileError(`Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleTopic = (topic) => {
    setCustomTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };

  const toggleQType = (type) => {
    setQTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const generateRandomFeedback = (isCorrect) => {
    const pool = isCorrect ? t.correctMsgs : t.incorrectMsgs;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).join(' ');
  };

  const generateQuestion = async (overrideConfig = null) => {
    saveCurrentToHistory();

    setIsGenerating(true);
    setCurrentQuestion(null);
    setUserAnswer('');
    setCurrentAttempts(0); 
    setCheckState('idle');
    setFirstAttemptStatus(null); 
    setFeedbackMsg('');
    setShowDiscussion(false);
    setIllustrationUrl(null);
    setIsIllustrating(false);
    setShowIllustrationModal(false);
    setCurrentView('practice');

    const config = (overrideConfig && !overrideConfig.nativeEvent && overrideConfig.type !== 'click') ? overrideConfig : null;

	const activeAnalysis = config ? config.analysisResult : analysisResult;
	const activeTopics = config ? config.customTopics : customTopics;
	const activeIsRandom = config ? config.isRandomTopic : isRandomTopic;
	const activeDiff = config ? config.qDifficulty : qDifficulty;
	const activeLang = config ? config.qLanguage : qLanguage;
	const activeTypes = config ? config.qTypes : qTypes;
	const activeReq = config ? config.specialRequest : specialRequest;

    try {
      const selectedType = activeTypes[Math.floor(Math.random() * activeTypes.length)];
      let topicStr = "";
      if (activeIsRandom && activeAnalysis?.topics?.length > 0) {
          topicStr = "Randomly mix from these topics: " + activeAnalysis.topics.join(', ');
      } else {
          topicStr = activeTopics.length > 0 ? activeTopics.join(', ') : "General Knowledge";
      }
      
      const diffStr = activeDiff === 'random' ? "Random (mix of easy, medium, hard)" : activeDiff;
      const contextStr = activeAnalysis 
        ? `Document Context:\nTopics: ${Array.isArray(activeAnalysis.topics) ? activeAnalysis.topics.join(', ') : activeAnalysis.topics}\nDetails: ${activeAnalysis.importantDetails}`
        : "General academic knowledge based on user prompt.";
      const targetLanguageName = TRANSLATIONS[activeLang].langName;

      const promptText = `
        You are an advanced academic AI assistant. Generate ONE highly original practice question.
        
        Context:
        ${contextStr}
        
        Constraints:
        - Language: MUST be exactly ${targetLanguageName}.
        - Topic Focus: ${topicStr}
        - Difficulty: ${diffStr}
        - Question Type Code: ${selectedType} 
          (mcq4 = 4 choices A-D, mcq5 = 5 choices A-E, mcqComplex = 5 choices A-E with 1-2 correct answers, fillText = short word/phrase, fillNum = number using comma for decimals like 6,0, essay = open ended)
        - Special Request: ${activeReq || "None"}
        
        CRITICAL LATEX GUIDELINES:
        - You MUST format ALL mathematical formulas, expressions, variables, units, and numbers using standard LaTeX math mode.
        - YOU MUST ENCLOSE ALL LATEX IN DOLLAR SIGNS: $...$ for inline, $$...$$ for display.
        - NEVER write raw LaTeX like 24^\\circ\\text{C}. ALWAYS write $24^\\circ\\text{C}$.
        - This strict $...$ requirement applies to the question text, the explanation, and EVERY single item in the "options" array.
        - The question must be novel, not a direct copy from typical public datasets.
        
        Respond ONLY with a valid JSON object using this exact schema:
        {
          "questionText": "The question paragraph",
          "type": "${selectedType}",
          "topic": "The specific topic of this generated question (short phrase)",
          "difficulty": "The assessed difficulty level of this question (e.g. Easy, Medium, Hard)",
          "options": ["Array of option strings. ONLY if type is mcq4, mcq5, or mcqComplex. Include A) B) prefixes. ALWAYS wrap math/numbers in $...$"],
          "correctAnswer": "Exact correct answer. For MCQ, just the letter(s) like 'A' or 'A,C'. For fill-in, the exact text/number.",
          "explanation": "Highly detailed, step-by-step solution in ${targetLanguageName} using LaTeX for math (wrapped in $ or $$). DO NOT ARRANGE THE EXPLANATION IN PARAGRAPH. Arrange the step-by-step solution DOWNWARD instead."
        }
      `;

      const payload = {
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.9, 
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              questionText: { type: "STRING" },
              type: { type: "STRING" },
              topic: { type: "STRING" },
              difficulty: { type: "STRING" },
              options: { type: "ARRAY", items: { type: "STRING" } },
              correctAnswer: { type: "STRING" },
              explanation: { type: "STRING" }
            },
            required: ["questionText", "type", "topic", "difficulty", "correctAnswer", "explanation"]
          }
        }
      };

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      let response = null;
      let attempt = 0;
      const maxRetries = 5;
      const delays = [1000, 2000, 4000, 8000, 16000];

      while (attempt <= maxRetries) {
        try {
          response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (response.ok) break;
          if (attempt === maxRetries) throw new Error(`API Error: ${response.status}`);
        } catch (error) {
          if (attempt === maxRetries) throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
        attempt++;
      }

      const result = await response.json();
      setCurrentQuestion(JSON.parse(result.candidates[0].content.parts[0].text));

    } catch (error) {
      console.error("Failed to generate question:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTryOut = async (overrideConfig = null) => {
    setIsGeneratingTryOut(true);
    setTryOutQuestions([]);
    setUserTryOutAnswers({});
    setCheatViolationsCount(0);
    setShowCheatWarning(false);
    setCurrentView('tryout'); 

    const config = (overrideConfig && !overrideConfig.nativeEvent && overrideConfig.type !== 'click') ? overrideConfig : null;

	const activeAnalysis = config ? config.analysisResult : analysisResult;
	const activeTopics = config ? config.customTopics : customTopics;
	const activeIsRandom = config ? config.isRandomTopic : isRandomTopic;
	const activeDiff = config ? config.qDifficulty : qDifficulty;
	const activeLang = config ? config.qLanguage : qLanguage;
	const activeTypes = config ? config.qTypes : qTypes;
	const activeReq = config ? config.specialRequest : specialRequest;
	const activeCount = config ? config.tryOutQCount : tryOutQCount;
	const activeDuration = config ? config.tryOutDuration : tryOutDuration;

    try {
      let topicStr = "";
      if (activeIsRandom && activeAnalysis?.topics?.length > 0) {
          topicStr = "Randomly mix from these topics: " + activeAnalysis.topics.join(', ');
      } else {
          topicStr = activeTopics.length > 0 ? activeTopics.join(', ') : "General Knowledge";
      }
      
      const diffStr = activeDiff === 'random' ? "Random (mix of easy, medium, hard)" : activeDiff;
      const contextStr = activeAnalysis 
        ? `Document Context:\nTopics: ${Array.isArray(activeAnalysis.topics) ? activeAnalysis.topics.join(', ') : activeAnalysis.topics}\nDetails: ${activeAnalysis.importantDetails}`
        : "General academic knowledge based on user prompt.";
      const targetLanguageName = TRANSLATIONS[activeLang].langName;
      const typesList = activeTypes.join(", "); 

      const promptText = `
        You are an advanced academic AI assistant. Generate an exam consisting of EXACTLY ${activeCount} unique practice questions.
        
        Context:
        ${contextStr}
        
        Constraints:
        - Volume: You MUST generate exactly ${activeCount} questions in the array.
        - Language: MUST be exactly ${targetLanguageName}.
        - Topic Focus: ${topicStr}
        - Difficulty: ${diffStr}
        - Allowed Question Types: ${typesList} 
          (Note: mcq4 = 4 choices A-D, mcq5 = 5 choices A-E, mcqComplex = 5 choices A-E with 1-2 correct answers, fillText = short word/phrase, fillNum = number using comma for decimals like 6,0, essay = open ended). Please mix these allowed types evenly if multiple are provided.
        - Special Request: ${activeReq || "None"}
        
        CRITICAL LATEX GUIDELINES:
        - You MUST format ALL mathematical formulas, expressions, variables, units, and numbers using standard LaTeX math mode.
        - YOU MUST ENCLOSE ALL LATEX IN DOLLAR SIGNS: $...$ for inline, $$...$$ for display.
        - NEVER write raw LaTeX like 24^\\circ\\text{C}. ALWAYS write $24^\\circ\\text{C}$.
        
        Respond ONLY with a valid JSON ARRAY using this exact schema structure for each object in the array:
        [
          {
            "questionText": "The question paragraph",
            "type": "ONE of the allowed types",
            "topic": "The specific topic of this generated question",
            "difficulty": "Easy, Medium, or Hard",
            "options": ["Array of option strings. ONLY if type is mcq4, mcq5, or mcqComplex. Include A) B) prefixes. Wrap math in $...$"],
            "correctAnswer": "Exact correct answer.",
            "explanation": "Highly detailed, step-by-step solution in ${targetLanguageName} using LaTeX for math. DO NOT ARRANGE THE EXPLANATION IN PARAGRAPH. Arrange the step-by-step solution DOWNWARD instead."
          }
        ]
      `;

      const payload = {
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.8, 
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            description: `Exactly ${activeCount} unique practice questions.`,
            items: {
              type: "OBJECT",
              properties: {
                questionText: { type: "STRING" },
                type: { type: "STRING" },
                topic: { type: "STRING" },
                difficulty: { type: "STRING" },
                options: { type: "ARRAY", items: { type: "STRING" } },
                correctAnswer: { type: "STRING" },
                explanation: { type: "STRING" }
              },
              required: ["questionText", "type", "topic", "difficulty", "correctAnswer", "explanation"]
            }
          }
        }
      };

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      let response = null;
      let attempt = 0;
      const maxRetries = 5;
      const delays = [1000, 2000, 4000, 8000, 16000];

      while (attempt <= maxRetries) {
        try {
          response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (response.ok) break;
          if (attempt === maxRetries) throw new Error(`API Error: ${response.status}`);
        } catch (error) {
          if (attempt === maxRetries) throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
        attempt++;
      }

      const result = await response.json();
      const generatedQuestions = JSON.parse(result.candidates[0].content.parts[0].text);
      setTryOutQuestions(generatedQuestions);
      setTimeLeft(activeDuration * 60); 
      setCurrentTryOutIndex(0);

    } catch (error) {
      console.error("Failed to generate bulk Try Out questions:", error);
    } finally {
      setIsGeneratingTryOut(false);
    }
  };

  const handleStartSession = async () => {
    if (appMode === 'monitor' && role === 'host') {
      const roomRef = doc(db, 'rooms', roomCode);
      await updateDoc(roomRef, {
        status: 'in-progress',
        config: {
          analysisResult,
          customTopics,
          isRandomTopic,
          qLanguage,
          qDifficulty,
          qTypes,
          specialRequest,
          selectedMode,
          tryOutQCount,
          tryOutDuration
        }
      });
      setCurrentView('teacher_dashboard');
    } else {
      if (selectedMode === 'practice') setCurrentView('practice'); 
      else if (selectedMode === 'tryout') generateTryOut(); 
    }
  };

  // Phase 5 Segment 4A: Submission Handler & Local Quantitative Grader
  const handleTryOutSubmit = useCallback(() => {
    let localCorrect = 0;
    let localTotal = 0;
    
    tryOutQuestions.forEach((q, idx) => {
      // We skip essays in the local objective calculator (AI will handle them in 4B)
      if (q.type === 'essay') return; 
      
      localTotal++; // 1 potential point
      let isCorrect = false;
      const uA = userTryOutAnswers[idx] || '';
      const cA = q.correctAnswer || '';
      
      if (q.type === 'mcqComplex') {
        const uLetters = uA.split(',').map(s=>s.trim().toUpperCase()).filter(Boolean).sort().join(',');
        const cLetters = cA.split(',').map(s=>s.trim().charAt(0).toUpperCase()).filter(Boolean).sort().join(',');
        isCorrect = (uLetters === cLetters);
      } else if (q.type.startsWith('mcq')) {
        const uLetter = uA.trim().toUpperCase();
        const cLetter = cA.trim().charAt(0).toUpperCase();
        isCorrect = (uLetter === cLetter);
      } else {
        isCorrect = (uA.trim().toLowerCase() === cA.trim().toLowerCase());
      }
      
      if (isCorrect) localCorrect++; // 1 point for correct, 0 for wrong
    });

    setObjectiveScore({ correct: localCorrect, total: localTotal });
    setCurrentView('tryout_summary');

    // Notify teacher dashboard that this student has completed the test
    if (role === 'student' && roomCode && currentUserUid) {
      updateDoc(doc(db, 'rooms', roomCode, 'participants', currentUserUid), {
        status: 'completed',
        score: localCorrect,
        total: localTotal,
        progress: localTotal
      }).catch(console.error);
    }

    evaluateTryOutSession(localCorrect, localTotal); // Fire the AI payload
  }, [tryOutQuestions, userTryOutAnswers, qLanguage, cheatViolationsCount, role, roomCode, currentUserUid, db]);

  // Safe listener to force-submit when Room Status goes to 'completed'
  useEffect(() => {
    if (roomStatus === 'completed' && role === 'student') {
      if (currentView === 'tryout') {
         handleTryOutSubmit();
      } else if (currentView === 'practice') {
         handleSummarize();
      }
      setRoomStatus('handled_completed'); // prevent re-triggering loop
    }
  }, [roomStatus, currentView, role, handleTryOutSubmit, handleSummarize]);

  const evaluateTryOutSession = async (localCorrect, localTotal) => {
    setIsEvaluatingTryOut(true);
    try {
      const targetLanguageName = TRANSLATIONS[qLanguage].langName;
      const essaysToScore = tryOutQuestions.map((q, i) => ({ i, q, a: userTryOutAnswers[i] })).filter(item => item.q.type === 'essay');
      const essayPromptContext = essaysToScore.map(e => `Q${e.i + 1}: ${e.q.questionText}\nUser Answer: ${e.a || 'None'}\nCorrect Idea: ${e.q.correctAnswer}`).join('\n\n');

      const promptText = `
        You are an expert AI academic evaluator. A student has completed a Try Out exam.
        Exam Context: ${tryOutQuestions.length} questions. Local objective score (MCQ/Fill-in): ${localCorrect}/${localTotal}.
        Cheat Violations (cursor left screen): ${cheatViolationsCount}.
        
        ${essaysToScore.length > 0 ? `Please evaluate these essays for correctness:\n${essayPromptContext}` : 'No essays to score.'}
        
        Provide a valid JSON response with EXACTLY this schema:
        {
          "essayScores": { "indexNumberString": trueOrFalse },
          "motivation": "2-3 highly encouraging sentences in ${targetLanguageName}. If Cheat Violations > 0, gently remind them about exam integrity.",
          "critique": "Detailed constructive feedback in ${targetLanguageName} analyzing their objective score performance.",
          "advice": "2-3 actionable study tips in ${targetLanguageName}."
        }
      `;

      const payload = {
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.5,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              essayScores: { type: "OBJECT" },
              motivation: { type: "STRING" },
              critique: { type: "STRING" },
              advice: { type: "STRING" }
            },
            required: ["essayScores", "motivation", "critique", "advice"]
          }
        }
      };

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const result = await response.json();
      setTryOutFeedback(JSON.parse(result.candidates[0].content.parts[0].text));
    } catch (error) {
      console.error("Try Out Evaluation failed:", error);
      setTryOutFeedback({
        motivation: "System error generating deep feedback. Keep practicing!",
        critique: "Unable to retrieve AI critique at this moment.",
        advice: "Please review the correct answers below manually.",
        essayScores: {}
      });
    } finally {
      setIsEvaluatingTryOut(false);
    }
  };

  // Phase 5 Segment 2: Dynamic Countdown Timer
  useEffect(() => {
    let timer;
    if (currentView === 'tryout' && !isGeneratingTryOut && tryOutQuestions.length > 0 && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && currentView === 'tryout' && tryOutQuestions.length > 0) {
      handleTryOutSubmit(); // Auto-submit when the countdown hits zero
    }
    return () => clearInterval(timer);
  }, [currentView, isGeneratingTryOut, tryOutQuestions.length, timeLeft, handleTryOutSubmit]);

  // Phase 5 Segment 3: Anti-Cheat Cursor Tracker
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (currentView === 'tryout' && !isGeneratingTryOut && tryOutQuestions.length > 0) {
        if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
           setShowCheatWarning(true);
           setCheatViolationsCount(prev => prev + 1);
        }
      }
    };

    const handleMouseEnter = () => {
      if (showCheatWarning) {
         setShowCheatWarning(false);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [currentView, isGeneratingTryOut, tryOutQuestions.length, showCheatWarning]);

  const handleCheck = async () => {
    if (!currentQuestion || !userAnswer) return;

    let isCorrect = false;

    if (currentQuestion.type === 'essay') {
      setIsEvaluating(true);
      try {
        const targetLanguageName = TRANSLATIONS[lang].langName; 
        const promptText = `
          Evaluate the user's essay answer based on the correct rubric/explanation.
          Question: ${currentQuestion.questionText}
          Correct Rubric: ${currentQuestion.correctAnswer}
          Explanation: ${currentQuestion.explanation}
          User Answer: ${userAnswer}

          Evaluate strictly but fairly. Is the user's answer conceptually correct and well-written?
          Respond ONLY with JSON: 
          { 
            "isCorrect": true/false, 
            "feedback": "3-5 engaging, localized motivational sentences in ${targetLanguageName} explaining briefly why it is correct or incorrect." 
          }
        `;
        
        const payload = {
          contents: [{ role: "user", parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                isCorrect: { type: "BOOLEAN" },
                feedback: { type: "STRING" }
              },
              required: ["isCorrect", "feedback"]
            }
          }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=$`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        const result = await response.json();
        const evalData = JSON.parse(result.candidates[0].content.parts[0].text);
        
        isCorrect = evalData.isCorrect;
        setFeedbackMsg(evalData.feedback);

      } catch (error) {
        console.error("Evaluation failed", error);
        isCorrect = false;
        setFeedbackMsg("Evaluation system offline. Please try again.");
      } finally {
        setIsEvaluating(false);
      }
    } else {
      if (currentQuestion.type === 'mcqComplex') {
        const uA = userAnswer.split(',').map(s=>s.trim().toUpperCase()).sort().join(',');
        const cA = currentQuestion.correctAnswer.split(',').map(s=>s.trim().toUpperCase()).sort().join(',');
        isCorrect = (uA === cA);
      } else if (currentQuestion.type.startsWith('mcq')) {
        isCorrect = (userAnswer.trim().toUpperCase() === currentQuestion.correctAnswer.trim().toUpperCase());
      } else {
        isCorrect = (userAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase());
      }
      setFeedbackMsg(generateRandomFeedback(isCorrect));
    }

    setCheckState(isCorrect ? 'correct' : 'incorrect');
    
    if (currentAttempts === 0) {
      setFirstAttemptStatus(isCorrect ? 'correct' : 'incorrect');
    }
  };

  const handleEndSession = async () => {
    if (role === 'host' && roomCode) {
      const roomRef = doc(db, 'rooms', roomCode);
      await updateDoc(roomRef, { status: 'completed' }).catch(console.error);
      setCurrentView('teacher_summary');
    }
  };

  const handleRetry = () => {
    setCurrentAttempts(prev => prev + 1); 
    setUserAnswer('');                    
    setCheckState('idle');                
    setFeedbackMsg('');
    setShowDiscussion(false);             
  };

  const handleIllustrate = async () => {
    if (!currentQuestion) return;
    if (illustrationUrl) {
      setShowIllustrationModal(true);
      return;
    }
    setIsIllustrating(true);
    setFeedbackMsg('');
    try {
      const promptText = `Create a clear, educational, and engaging illustration that visually explains or represents the context of this academic question: "${currentQuestion.questionText}". Do not include any text in the image.`;
      
      const payload = { instances: { prompt: promptText }, parameters: { sampleCount: 1 } };
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
        setIllustrationUrl(`data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`);
        setShowIllustrationModal(true);
      } else {
        setFeedbackMsg("Failed to generate illustration. Please try again.");
      }
    } catch (error) {
      console.error("Illustration failed:", error);
      setFeedbackMsg("Error generating illustration.");
    } finally {
      setIsIllustrating(false);
    }
  };

  useEffect(() => {
    if (currentView === 'practice' && !currentQuestion && !isGenerating) {
      generateQuestion();
    }
  }, [currentView]);


  const renderHeader = () => (
    <header className="absolute top-0 left-0 right-0 w-full z-[100] pointer-events-none">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full blur opacity-60"></div>
            <img
              src="https://i.imgflip.com/av37js.jpg"
              alt="QURNIA Logo"
              className="relative w-9 h-9 rounded-full border border-slate-800 object-cover shadow-sm"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&q=80'; }}
            />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-300">
            QURNIA!
          </span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            type="button"
            className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 text-sm py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-95 shadow-lg cursor-pointer"
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span className="font-medium">{t.langName}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-1.5 space-y-0.5">
                {Object.keys(TRANSLATIONS).map((locale) => (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => {
                      setLang(locale);
                      setIsLangOpen(false);
                      if (errorMsg) setErrorMsg(TRANSLATIONS[locale].authError);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between cursor-pointer ${
                      lang === locale 
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold' 
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <span>{TRANSLATIONS[locale].langName}</span>
                    {lang === locale && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  const renderFooter = () => (
    <footer className="w-full py-6 text-center border-t border-slate-950 relative z-10 px-4 space-y-2 bg-slate-950/85">
      <p className="text-xs text-slate-500">{t.footer}</p>
      <p className="text-[11px] text-slate-600 font-medium max-w-md mx-auto leading-relaxed transition-all duration-300">
        {t.logoCredit}
      </p>
    </footer>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans antialiased relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-900/30 to-violet-900/30 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[50%] rounded-full bg-gradient-to-tr from-cyan-900/20 to-indigo-900/25 blur-[100px] pointer-events-none z-0" />

      {renderHeader()}
      
      {/* Anti-Cheat Overlay System (Z-Index: 9999 ensures it covers EVERYTHING) */}
      {showCheatWarning && currentView === 'tryout' && (
        <div className="fixed inset-0 z-[9999] backdrop-blur-xl bg-slate-950/80 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-rose-950/80 border-2 border-rose-500/50 p-8 md:p-12 rounded-3xl shadow-[0_0_100px_rgba(244,63,94,0.3)] flex flex-col items-center text-center max-w-xl">
              <AlertTriangle className="w-24 h-24 text-rose-500 mb-6 animate-pulse" />
              <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{t.cheatWarningTitle}</h2>
              <p className="text-rose-200 text-lg mb-8 leading-relaxed font-medium">{t.cheatWarningDesc}</p>
              <div className="bg-rose-900/50 px-6 py-4 rounded-xl border border-rose-500/30 shadow-inner">
                 <span className="text-rose-400 font-bold uppercase tracking-widest text-sm">
                   {t.cheatViolationCountLabel}: <span className="text-white text-xl ml-2">{cheatViolationsCount}</span>
                 </span>
              </div>
           </div>
        </div>
      )}

      <main className="flex-grow flex items-center justify-center px-4 pt-28 pb-12 relative z-10 w-full">
        
        {/* === VIEW: LOGIN (PHASE 1 Base) === */}
        {currentView === 'login' && (
          <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
            {!isAuthorized ? (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="inline-block relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full blur opacity-45 group-hover:opacity-75 transition duration-500"></div>
                    <img
                      src="https://i.imgflip.com/av37js.jpg"
                      alt="QURNIA Logo Banner"
                      className="relative w-28 h-28 object-cover rounded-full border-4 border-slate-900 shadow-2xl transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&q=80'; }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <h1 className="text-4xl font-black tracking-tight text-white">QURNIA!</h1>
                    <p className="text-indigo-300 font-medium text-sm px-4 max-w-sm mx-auto leading-relaxed transition-all duration-300 italic min-h-[40px] flex items-center justify-center">
                      "{t.tagline}"
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">{t.nameLabel}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className="h-4.5 w-4.5 text-slate-500" />
                        </div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t.namePlaceholder}
                          className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">{t.orgLabel}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Landmark className="h-4.5 w-4.5 text-slate-500" />
                        </div>
                        <input
                          type="text"
                          required
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder={t.orgPlaceholder}
                          className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                        />
                      </div>
                    </div>
                    {errorMsg && (
                      <div className="p-3.5 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start space-x-2.5 text-xs text-red-300 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{errorMsg}</p>
                      </div>
                    )}
                    <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-50 text-sm flex items-center justify-center space-x-2 mt-2 cursor-pointer">
                      {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Shield className="w-4 h-4" /><span>{t.loginBtn}</span></>}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative overflow-hidden text-center space-y-6 animate-in zoom-in-95 duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                <div className="mx-auto bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-full w-14 h-14 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{t.welcome} <span className="text-indigo-300">{name}</span>!</h2>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-xs mx-auto">{t.authorizedText}</p>
                </div>
                
                {/* Phase 1 Mode Selection Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <button 
                    onClick={() => { 
                      setAppMode('solo'); 
                      setCurrentView('upload'); 
                    }} 
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 hover:border-emerald-500/50 transition-all duration-200 group cursor-pointer shadow-inner"
                  >
                    <User className="w-6 h-6 mb-2 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    <span className="font-semibold text-slate-200 group-hover:text-white text-sm">Solo Mode</span>
                    <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Independent Study</span>
                  </button>
                  
                  <button 
                    onClick={() => { 
                      setAppMode('monitor'); 
                      setCurrentView('role_selection'); 
                    }} 
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 hover:border-indigo-500/50 transition-all duration-200 group cursor-pointer shadow-inner"
                  >
                    <Users className="w-6 h-6 mb-2 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    <span className="font-semibold text-slate-200 group-hover:text-white text-sm">Monitor Mode</span>
                    <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Host or Join</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button onClick={handleLogout} type="button" className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-[0.98] text-sm flex items-center justify-center space-x-2 cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === VIEW: ROLE SELECTION (PHASE 1) === */}
        {currentView === 'role_selection' && (
          <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative overflow-hidden text-center space-y-6">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                
                <div className="mx-auto bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-full w-14 h-14 flex items-center justify-center">
                  <Monitor className="w-7 h-7 text-indigo-400" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Select Your Role</h2>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">Are you hosting a session for students, or joining an existing one?</p>
                </div>

                <div className="space-y-4">
                  <button 
                    disabled={isCreatingRoom}
                    onClick={handleCreateRoom} 
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/30 flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {isCreatingRoom ? <Loader2 className="w-5 h-5 text-indigo-200 animate-spin" /> : <Shield className="w-5 h-5 text-indigo-200" />}
                      <span>Host (Teacher)</span>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button 
                    onClick={() => { 
                      setRole('student'); 
                      setCurrentView('student_join'); 
                    }} 
                    className="w-full bg-slate-950 border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold py-4 px-4 rounded-xl transition-all duration-200 shadow-inner flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-slate-400" />
                      <span>Join (Student)</span>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <button 
                  onClick={() => setCurrentView('login')} 
                  className="mt-2 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors cursor-pointer"
                >
                  Back to Mode Selection
                </button>
             </div>
          </div>
        )}

        {/* === VIEW: HOST LOBBY (PHASE 2) === */}
        {currentView === 'host_lobby' && (
          <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-500">
             <div className="bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative overflow-hidden text-center space-y-8">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
                
                <div>
                  <h2 className="text-xl font-bold text-slate-300 tracking-tight flex items-center justify-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-violet-400" /> Teacher Lobby
                  </h2>
                  <p className="text-slate-500 text-sm">Share this code with your students to join.</p>
                </div>

                <div className="bg-slate-950 border-2 border-dashed border-violet-500/50 rounded-2xl p-6 shadow-inner">
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-1">Room Code</span>
                  <div className="text-6xl font-black text-white tracking-widest font-mono">
                    {roomCode}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 flex flex-col items-center gap-4">
                  {participants.length === 0 ? (
                     <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  ) : (
                     <CheckCircle className="w-6 h-6 text-emerald-400" />
                  )}
                  <p className="text-slate-300 font-medium text-sm">
                    {participants.length === 0 ? "Waiting for students to join..." : `${participants.length} Student(s) Ready`}
                  </p>
                  
                  {/* Real-time Student List */}
                  <div className="w-full flex flex-col gap-2 mt-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {participants.length === 0 ? (
                      <div className="px-4 py-2 bg-slate-900 rounded-lg text-xs font-bold text-slate-500 border border-slate-800">
                        0 Students Connected
                      </div>
                    ) : (
                      participants.map((p, idx) => (
                        <div key={p.uid || idx} className="px-4 py-2.5 bg-slate-900 rounded-lg text-sm font-bold text-indigo-300 border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
                           <User className="w-4 h-4 text-indigo-500" />
                           {p.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleLeaveRoom}
                    className="py-3 px-4 rounded-xl border border-slate-700 bg-slate-950 text-slate-300 font-semibold hover:bg-slate-800 transition-all text-sm cursor-pointer"
                  >
                    Cancel Session
                  </button>
                  <button 
                    onClick={() => setCurrentView('upload')} 
                    className="py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-violet-900/30 flex items-center justify-center gap-2 transition-all text-sm cursor-pointer"
                  >
                    Proceed to Setup <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
             </div>
          </div>
        )}

        {/* === VIEW: STUDENT JOIN (PHASE 2) === */}
        {currentView === 'student_join' && (
          <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
             <div className="bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative overflow-hidden text-center space-y-6">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                
                <div>
                  <h2 className="text-xl font-bold text-slate-300 tracking-tight flex items-center justify-center gap-2 mb-2">
                    <User className="w-5 h-5 text-emerald-400" /> Join a Session
                  </h2>
                  <p className="text-slate-500 text-sm">Enter the 5-digit code provided by your teacher.</p>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={studentInputCode}
                    onChange={(e) => setStudentInputCode(e.target.value.toUpperCase())}
                    placeholder="e.g. X7K9P"
                    maxLength={5}
                    className="w-full text-center text-3xl font-black tracking-[0.2em] font-mono uppercase bg-slate-950 border-2 border-slate-700 rounded-xl py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  
                  {joinError && (
                    <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start space-x-2 text-xs text-red-300 text-left animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p>{joinError}</p>
                    </div>
                  )}

                  <button 
                    disabled={studentInputCode.length !== 5 || isJoiningRoom}
                    onClick={handleJoinRoom} 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isJoiningRoom ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Join Room <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>

                <button 
                  onClick={handleLeaveRoom} 
                  className="mt-2 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors cursor-pointer"
                >
                  Back
                </button>
             </div>
          </div>
        )}

        {/* === VIEW: STUDENT WAITING (PHASE 2) === */}
        {currentView === 'student_waiting' && (
          <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
             <div className="bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative overflow-hidden text-center space-y-8">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                
                <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-full relative">
                   <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full animate-ping"></div>
                   <CheckCircle className="w-8 h-8 text-cyan-400 relative z-10" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight mb-2">Connected!</h2>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-950 border border-slate-700 rounded-full">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Room</span>
                    <span className="text-sm text-cyan-400 font-black font-mono">{roomCode}</span>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                  <p className="text-slate-300 font-medium text-sm leading-relaxed">Waiting for your teacher to customize and start the session...</p>
                </div>

                <button 
                  onClick={handleLeaveRoom} 
                  className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-950 text-slate-400 font-semibold hover:bg-slate-800 hover:text-slate-200 transition-all text-sm cursor-pointer"
                >
                  Leave Room
                </button>
             </div>
          </div>
        )}

        {/* === VIEW: UPLOAD (PHASE 2) === */}
        {currentView === 'upload' && (
          <div className="w-full max-w-5xl relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <UploadCloud className="w-6 h-6 text-indigo-400" />
                  </div>
                  {t.uploadTitle}
                </h2>
                <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">{t.uploadDesc}</p>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0">
                <LogOut className="w-4 h-4" />
                <span>{t.logout}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className="w-full aspect-[4/3] md:aspect-auto md:h-64 border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-900/50 hover:bg-indigo-900/10 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group">
                  <input type="file" multiple accept=".pdf,.docx" className="hidden" ref={fileInputRef} onChange={(e) => validateAndAddFiles(e.target.files)} />
                  <div className="bg-slate-800 group-hover:bg-indigo-500/20 p-4 rounded-full mb-4 transition-colors"><FileText className="w-8 h-8 text-slate-400 group-hover:text-indigo-400" /></div>
                  <p className="text-slate-300 font-medium mb-1 px-4">{t.dragDropText}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">PDF, DOCX (Max 5, 10MB)</p>
                </div>

                {fileError && <div className="p-3 bg-red-950/50 border border-red-900 rounded-xl flex items-center gap-2 text-sm text-red-400"><AlertTriangle className="w-4 h-4 shrink-0" /><p>{fileError}</p></div>}

                {files.length > 0 && (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      <span>{files.length} / 5 Files Selected</span>
                      <span>Total: {(files.reduce((a, b) => a + b.size, 0) / (1024 * 1024)).toFixed(2)} MB / 10 MB</span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-xl group hover:border-slate-700 transition-colors">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                            <div className="truncate"><p className="text-sm font-medium text-slate-200 truncate">{f.name}</p><p className="text-xs text-slate-500">{(f.size / 1024).toFixed(1)} KB</p></div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isAnalyzing ? <><Loader2 className="w-5 h-5 animate-spin" /><span>{t.analyzing}</span></> : <><Sparkles className="w-5 h-5" /><span>{t.analyzeBtn}</span></>}
                    </button>
                  </div>
                )}
              </div>

              <div className="h-full flex flex-col">
                <div className={`flex-grow bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl transition-all duration-500 relative overflow-hidden ${analysisResult ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none'}`}>
                  {!analysisResult ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 min-h-[300px]">
                      <BrainCircuit className="w-16 h-16 opacity-20" />
                      <p className="text-sm text-center max-w-xs leading-relaxed">Upload documents and run the analysis to unlock AI-powered insights and topic extraction.</p>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col animate-in fade-in duration-500">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Activity className="w-5 h-5 text-emerald-400" /> Analysis Dashboard</h3>
                      <div className="space-y-5 flex-grow">
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" />{t.topicLabel}</h4>
                          {Array.isArray(analysisResult.topics) ? <ul className="text-slate-300 text-sm leading-relaxed list-disc list-inside space-y-1">{analysisResult.topics.map((topic, idx) => <li key={idx}>{topic}</li>)}</ul> : <p className="text-slate-300 text-sm leading-relaxed">{analysisResult.topics}</p>}
                        </div>
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Gauge className="w-3.5 h-3.5" />{t.difficultyLabel}</h4>
                          <p className="text-slate-300 text-sm leading-relaxed">{analysisResult.difficulty}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                            <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Type className="w-3.5 h-3.5" />{t.styleLabel}</h4>
                            <p className="text-slate-300 text-sm leading-relaxed">{analysisResult.style}</p>
                          </div>
                          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Info className="w-3.5 h-3.5" />{t.detailsLabel}</h4>
                            <p className="text-slate-300 text-sm leading-relaxed line-clamp-4">{analysisResult.importantDetails}</p>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setCurrentView('customization')} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 group">
                        <span>{t.proceedBtn}</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === VIEW: CUSTOMIZATION (PHASE 3) === */}
        {currentView === 'customization' && (
          <div className="w-full max-w-5xl relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-violet-500/20 rounded-lg"><Settings className="w-6 h-6 text-violet-400" /></div>
                  {t.custTitle}
                </h2>
                <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">{t.custDesc}</p>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0">
                <LogOut className="w-4 h-4" /><span>{t.logout}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Layers className="w-4 h-4 text-blue-400" />{t.topicSelectTitle}</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20">
                      <input type="checkbox" checked={isRandomTopic} onChange={() => { setIsRandomTopic(!isRandomTopic); if (!isRandomTopic) setCustomTopics([]); }} className="w-5 h-5 rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900 bg-slate-900" />
                      <span className="text-sm font-semibold text-indigo-200 flex items-center gap-2"><Dices className="w-4 h-4 text-indigo-400" />{t.randomTopic}</span>
                    </label>
                    <div className={`space-y-2 transition-opacity duration-300 ${isRandomTopic ? 'opacity-40 pointer-events-none' : ''}`}>
                      {analysisResult?.topics?.map((topic, idx) => (
                        <label key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 cursor-pointer transition-colors group">
                          <input type="checkbox" checked={customTopics.includes(topic)} onChange={() => toggleTopic(topic)} className="w-5 h-5 rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900 bg-slate-900 mt-0.5" />
                          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{topic}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
                   <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-pink-400" />{t.specialReqTitle}</h3>
                  <textarea value={specialRequest} onChange={(e) => setSpecialRequest(e.target.value)} placeholder={t.specialReqPlaceholder} rows="4" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all resize-none" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-emerald-400" />{t.typeSelectTitle}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[{ id: 'mcq4', label: t.typeMcq4 }, { id: 'mcq5', label: t.typeMcq5 }, { id: 'mcqComplex', label: t.typeMcqComplex }, { id: 'fillText', label: t.typeFillText }, { id: 'fillNum', label: t.typeFillNum }, { id: 'essay', label: t.typeEssay }].map((type) => (
                      <label key={type.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${qTypes.includes(type.id) ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/50'}`}>
                        <input type="checkbox" checked={qTypes.includes(type.id)} onChange={() => toggleQType(type.id)} className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 bg-slate-900" />
                        <span className="text-xs font-medium text-slate-300">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Languages className="w-4 h-4 text-amber-400" />{t.langSelectTitle}</h3>
                    <div className="space-y-2">
                      {[{ id: 'id', label: 'Bahasa Indonesia' }, { id: 'en', label: 'English (GB)' }, { id: 'zh_CN', label: '简体中文' }, { id: 'zh_TW', label: '繁體中文' }].map((langOpt) => (
                        <label key={langOpt.id} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${qLanguage === langOpt.id ? 'border-amber-500' : 'border-slate-600 group-hover:border-amber-400'}`}>
                            {qLanguage === langOpt.id && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                          </div>
                          <input type="radio" name="qLang" checked={qLanguage === langOpt.id} onChange={() => setQLanguage(langOpt.id)} className="hidden" />
                          <span className={`text-sm transition-colors ${qLanguage === langOpt.id ? 'text-amber-300 font-medium' : 'text-slate-400 group-hover:text-slate-200'}`}>{langOpt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Gauge className="w-4 h-4 text-red-400" />{t.diffSelectTitle}</h3>
                    <div className="space-y-2">
                      {[{ id: 'easy', label: t.diffEasy }, { id: 'medium', label: t.diffMedium }, { id: 'hard', label: t.diffHard }, { id: 'random', label: t.diffRandom }].map((diffOpt) => (
                        <label key={diffOpt.id} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${qDifficulty === diffOpt.id ? 'border-red-500' : 'border-slate-600 group-hover:border-red-400'}`}>
                            {qDifficulty === diffOpt.id && <div className="w-2 h-2 rounded-full bg-red-500" />}
                          </div>
                          <input type="radio" name="qDiff" checked={qDifficulty === diffOpt.id} onChange={() => setQDifficulty(diffOpt.id)} className="hidden" />
                          <span className={`text-sm transition-colors ${qDifficulty === diffOpt.id ? 'text-red-300 font-medium' : 'text-slate-400 group-hover:text-slate-200'}`}>{diffOpt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" />{t.modeSelectTitle}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => setSelectedMode('practice')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${selectedMode === 'practice' ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-800/50'}`}>
                      <Target className={`w-8 h-8 mb-2 ${selectedMode === 'practice' ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className={`text-sm font-bold ${selectedMode === 'practice' ? 'text-cyan-100' : 'text-slate-400'}`}>{t.modePractice}</span>
                    </button>
                    <button onClick={() => setSelectedMode('tryout')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${selectedMode === 'tryout' ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-800/50'}`}>
                      <Timer className={`w-8 h-8 mb-2 ${selectedMode === 'tryout' ? 'text-blue-400' : 'text-slate-500'}`} />
                      <span className={`text-sm font-bold ${selectedMode === 'tryout' ? 'text-blue-100' : 'text-slate-400'}`}>{t.modeTryOut}</span>
                    </button>
                  </div>
                </div>

                {selectedMode === 'tryout' && (
                  <div className="bg-slate-950/80 border border-blue-900/30 rounded-2xl p-6 shadow-inner animate-in slide-in-from-top-4 fade-in duration-300">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Settings className="w-4 h-4" />{t.tryOutSettingsTitle}</h4>
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs font-medium text-slate-400 block mb-2">{t.qCountLabel}</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[5, 10, 15, 20].map(num => (
                            <button key={num} onClick={() => setTryOutQCount(num)} className={`py-2 rounded-lg text-sm font-bold transition-colors border ${tryOutQCount === num ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'}`}>
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-400 block mb-2">{t.durationLabel}</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Clock className="w-4 h-4 text-blue-400" /></div>
                          <select value={tryOutDuration} onChange={(e) => setTryOutDuration(Number(e.target.value))} className="block w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                            {[5, 10, 15, 30, 60, 90, 120].map(mins => <option key={mins} value={mins}>{mins} {lang === 'id' ? 'Menit' : lang.startsWith('zh') ? '分钟' : 'Minutes'}</option>)}
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><ChevronDown className="w-4 h-4 text-slate-400" /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  disabled={(!isRandomTopic && customTopics.length === 0) || qTypes.length === 0} 
                  onClick={handleStartSession} 
                  className={`w-full mt-6 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group ${selectedMode === 'practice' ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-cyan-900/20' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/20'}`}
                >
                  <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-lg">{selectedMode === 'practice' ? t.startPracticeBtn : t.startTryOutBtn}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === VIEW: TRY OUT MODE (PHASE 5) === */}
        {currentView === 'tryout' && (
          <div className="w-full max-w-6xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
             {isGeneratingTryOut ? (
                <div className="flex-grow flex items-center justify-center min-h-[60vh]">
                  <div className="bg-slate-900/80 border border-blue-900/50 p-10 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center max-w-lg w-full relative overflow-hidden">
                     <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse" />
                     <div className="relative mb-6">
                        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-ping"></div>
                        <Loader2 className="w-16 h-16 animate-spin relative z-10 text-blue-400" />
                     </div>
                     <h3 className="text-2xl font-black text-white tracking-wide mb-2">{t.generatingTryOut || "Generating Try Out..."}</h3>
                     <p className="text-slate-400 text-sm leading-relaxed">{t.tryOutLoadingDesc || "Please wait while we synthesize your exam."}</p>
                     
                     <div className="w-full bg-slate-950 rounded-full h-2 mt-8 overflow-hidden border border-slate-800">
                        <div className="bg-blue-500 h-2 rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '50%' }}></div>
                     </div>
                  </div>
                </div>
             ) : (
                <div className="flex-grow w-full h-full flex flex-col md:flex-row gap-6 items-stretch p-2">
                   <div className="w-full md:w-1/4 lg:w-1/5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl min-h-[400px]">
                      
                      <div className="p-4 bg-slate-950/80 border-b border-slate-800 text-center">
                         <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {t.timeRemLabel}
                         </div>
                         <div className={`text-3xl font-black tabular-nums transition-colors ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-blue-400'}`}>
                            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                         </div>
                      </div>
                      
                      <div className="p-4 flex-grow overflow-y-auto custom-scrollbar">
                         <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{t.qNavTitle}</h4>
                         <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {tryOutQuestions.map((_, idx) => {
                               const isAnswered = userTryOutAnswers[idx] !== undefined && userTryOutAnswers[idx] !== '';
                               const isActive = currentTryOutIndex === idx;
                               return (
                                 <button 
                                   key={idx}
                                   onClick={() => setCurrentTryOutIndex(idx)}
                                   className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all border-2 ${isActive ? 'border-blue-500 bg-blue-500/20 text-blue-100 scale-110 shadow-lg' : isAnswered ? 'border-emerald-500/50 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-800/40' : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                                 >
                                   {idx + 1}
                                 </button>
                               );
                            })}
                         </div>
                      </div>
                      
                      <div className="p-4 bg-slate-950/80 border-t border-slate-800">
                         <button onClick={handleTryOutSubmit} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group transition-all">
                            <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span>{t.submitTryOut}</span>
                         </button>
                      </div>
                   </div>

                   <div className="w-full md:w-3/4 lg:w-4/5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden min-h-[500px]">
                      
                      <div className="p-6 md:p-8 flex-grow overflow-y-auto custom-scrollbar">
                          {tryOutQuestions[currentTryOutIndex] && (
                             <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300" key={currentTryOutIndex}>
                                <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 pb-4">
                                   <span className="text-blue-400 font-black text-xl">{t.qPrefix} {currentTryOutIndex + 1}</span>
                                   <div className="hidden sm:block h-4 w-px bg-slate-700"></div>
                                   <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/30">
                                      {tryOutQuestions[currentTryOutIndex].type}
                                   </span>
                                   {/* Topic Badge */}
                                   <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-widest border border-cyan-500/30 truncate max-w-[200px]" title={tryOutQuestions[currentTryOutIndex].topic}>
                                      {tryOutQuestions[currentTryOutIndex].topic}
                                   </span>
                                   {/* Difficulty Badge */}
                                   <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                                      tryOutQuestions[currentTryOutIndex].difficulty.toLowerCase().includes('hard') ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                                      tryOutQuestions[currentTryOutIndex].difficulty.toLowerCase().includes('medium') ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                   }`}>
                                      {tryOutQuestions[currentTryOutIndex].difficulty}
                                   </span>
                                </div>
                                
                                <div className="text-white text-[1.1rem] leading-relaxed whitespace-pre-wrap font-medium">
                                   {renderMathText(tryOutQuestions[currentTryOutIndex].questionText)}
                                </div>
                                
                                <div className="space-y-3 pt-2">
                                   {tryOutQuestions[currentTryOutIndex].type.startsWith('mcq') && tryOutQuestions[currentTryOutIndex].options ? (
                                      <div className="grid grid-cols-1 gap-3.5">
                                         {tryOutQuestions[currentTryOutIndex].options.map((opt, idx) => {
                                            const letter = String.fromCharCode(65 + idx); 
                                            const currentAns = userTryOutAnswers[currentTryOutIndex] || '';
                                            const isChecked = tryOutQuestions[currentTryOutIndex].type === 'mcqComplex' ? currentAns.includes(letter) : currentAns === letter;
                                            
                                            return (
                                               <label key={idx} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${isChecked ? 'border-blue-500 bg-blue-900/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800'}`}>
                                                  <input 
                                                    type={tryOutQuestions[currentTryOutIndex].type === 'mcqComplex' ? "checkbox" : "radio"}
                                                    name={`tryout-mcq-${currentTryOutIndex}`}
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                       if (tryOutQuestions[currentTryOutIndex].type === 'mcqComplex') {
                                                          let currentAnswers = currentAns ? currentAns.split(',') : [];
                                                          if (e.target.checked) currentAnswers.push(letter);
                                                          else currentAnswers = currentAnswers.filter(a => a !== letter);
                                                          setUserTryOutAnswers(prev => ({ ...prev, [currentTryOutIndex]: currentAnswers.sort().join(',') }));
                                                       } else {
                                                          setUserTryOutAnswers(prev => ({ ...prev, [currentTryOutIndex]: letter }));
                                                       }
                                                    }}
                                                    className="mt-1 w-5 h-5 text-blue-500 border-slate-600 bg-slate-950 focus:ring-blue-500 focus:ring-offset-slate-900 transition-colors"
                                                  />
                                                  <div className={`text-[1.05rem] mt-[-2px] ${isChecked ? 'text-blue-100 font-medium' : 'text-slate-300'}`}>
                                                     {renderMathText(opt)}
                                                  </div>
                                               </label>
                                            );
                                         })}
                                      </div>
                                   ) : tryOutQuestions[currentTryOutIndex].type === 'essay' ? (
                                      <textarea 
                                         value={userTryOutAnswers[currentTryOutIndex] || ''}
                                         onChange={(e) => setUserTryOutAnswers(prev => ({ ...prev, [currentTryOutIndex]: e.target.value }))}
                                         placeholder="Write your detailed answer here..."
                                         rows="8"
                                         className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-xl p-5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none shadow-inner text-lg"
                                      />
                                   ) : (
                                      <input 
                                         type="text"
                                         value={userTryOutAnswers[currentTryOutIndex] || ''}
                                         onChange={(e) => setUserTryOutAnswers(prev => ({ ...prev, [currentTryOutIndex]: e.target.value }))}
                                         placeholder={tryOutQuestions[currentTryOutIndex].type === 'fillNum' ? "e.g. 6,0" : "Type your answer here..."}
                                         className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-xl p-5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner text-lg"
                                      />
                                   )}
                                </div>
                             </div>
                          )}
                      </div>
                      
                      <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center">
                         <button 
                           onClick={() => setCurrentTryOutIndex(prev => Math.max(0, prev - 1))}
                           disabled={currentTryOutIndex === 0}
                           className="px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                         >
                           <ArrowRight className="w-4 h-4 rotate-180" /> {t.prevBtn}
                         </button>
                         <button 
                           onClick={() => setCurrentTryOutIndex(prev => Math.min(tryOutQuestions.length - 1, prev + 1))}
                           disabled={currentTryOutIndex === tryOutQuestions.length - 1}
                           className="px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                         >
                           {t.nextBtn} <ArrowRight className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                </div>
             )}
          </div>
        )}

        {/* === VIEW: TRY OUT SUMMARY (PHASE 5 - Segment 4A Dashboard) === */}
        {currentView === 'tryout_summary' && (
          <div className="w-full max-w-5xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col space-y-8 pb-10">
             
            {isEvaluatingTryOut || !tryOutFeedback ? (
               <div className="flex-grow flex items-center justify-center min-h-[60vh]">
                 <div className="bg-slate-900/80 border border-fuchsia-900/50 p-10 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center max-w-lg w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 animate-pulse" />
                    <div className="relative mb-6">
                       <div className="absolute inset-0 border-4 border-fuchsia-500/20 rounded-full animate-ping"></div>
                       <BrainCircuit className="w-16 h-16 animate-pulse relative z-10 text-fuchsia-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-wide mb-2">Evaluating Try Out...</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Our AI is currently assessing your performance, scoring essays, and generating a personalized report.</p>
                 </div>
               </div>
            ) : (
               <>
                 <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-3">
                      <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <BarChart3 className="w-8 h-8 text-indigo-400" />
                      </div>
                      {t.summaryTitle}
                    </h2>
                    <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">{t.summaryDesc}</p>
                 </div>

                 {/* Objective Stats Row */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                       <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-400" />
                       <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs mb-3">{t.finalScoreLabel} (Non-Essay)</span>
                       <div className="flex items-baseline gap-2">
                         <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                           {objectiveScore.total > 0 ? Math.round((objectiveScore.correct / objectiveScore.total) * 100) : 0}%
                         </span>
                         <span className="text-slate-500 font-bold text-lg">({objectiveScore.correct}/{objectiveScore.total})</span>
                       </div>
                    </div>
                    
                    {/* Integrity Metrics Card */}
                    <div className={`bg-slate-900/80 border rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden ${cheatViolationsCount > 0 ? 'border-rose-900/50' : 'border-slate-800'}`}>
                       {cheatViolationsCount > 0 && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-500 animate-pulse" />}
                       <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${cheatViolationsCount > 0 ? 'text-rose-500' : 'text-slate-500'}`} /> 
                          {t.cheatViolationsLabel}
                       </span>
                       <span className={`text-6xl font-black ${cheatViolationsCount > 0 ? 'text-rose-500' : 'text-slate-600'}`}>
                         {cheatViolationsCount}
                       </span>
                    </div>
                 </div>

                 {/* AI Qualitative Feedback Panels */}
                 <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex items-center gap-3">
                       <Sparkles className="w-5 h-5 text-indigo-400" />
                       <h3 className="font-bold text-white uppercase tracking-wider text-sm">AI Performance Analysis</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                       <div className="p-6 space-y-3">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Motivation</span>
                          <p className="text-slate-300 text-sm leading-relaxed">{tryOutFeedback.motivation}</p>
                       </div>
                       <div className="p-6 space-y-3">
                          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">Critique</span>
                          <p className="text-slate-300 text-sm leading-relaxed">{tryOutFeedback.critique}</p>
                       </div>
                       <div className="p-6 space-y-3">
                          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">Advice</span>
                          <p className="text-slate-300 text-sm leading-relaxed">{tryOutFeedback.advice}</p>
                       </div>
                    </div>
                 </div>

                 {/* Sub-segment 4C: Post-Mortem Comparison Log (No Discussion Yet) */}
                 <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                      <ListChecks className="w-5 h-5 text-indigo-400" /> 
                      {t.reviewTitle}
                    </h3>
                    
                    <div className="space-y-5">
                       {tryOutQuestions.map((q, idx) => {
                          const uA = userTryOutAnswers[idx] || '';
                          const cA = q.correctAnswer || '';
                          let isCorrectLocal = false;
                          let displayUA = uA;
                          
                          if (q.type === 'essay') {
                            isCorrectLocal = tryOutFeedback?.essayScores?.[idx.toString()] === true;
                          } else if (q.type === 'mcqComplex') {
                            const uLetters = uA.split(',').map(s=>s.trim().toUpperCase()).filter(Boolean).sort().join(',');
                            const cLetters = cA.split(',').map(s=>s.trim().charAt(0).toUpperCase()).filter(Boolean).sort().join(',');
                            isCorrectLocal = (uLetters === cLetters);
                          } else if (q.type.startsWith('mcq')) {
                            const uLetter = uA.trim().toUpperCase();
                            const cLetter = cA.trim().charAt(0).toUpperCase();
                            isCorrectLocal = (uLetter === cLetter);
                          } else {
                            isCorrectLocal = (uA.trim().toLowerCase() === cA.trim().toLowerCase());
                          }

                          // Reconstruct full text for display if it's an MCQ
                          if (q.type.startsWith('mcq') && q.options && uA) {
                            const uLettersArr = uA.split(',').map(s=>s.trim().toUpperCase()).filter(Boolean);
                            displayUA = uLettersArr.map(letter => {
                              const optIndex = letter.charCodeAt(0) - 65;
                              if (optIndex >= 0 && optIndex < q.options.length) {
                                const optText = q.options[optIndex];
                                return optText.startsWith(letter) ? optText : `${letter}) ${optText}`;
                              }
                              return letter;
                            }).join(', ');
                          }

                          return (
                            <div 
                              key={idx} 
                              onClick={() => setSelectedDiscussion(idx)}
                              className={`group bg-slate-900/50 p-6 rounded-2xl border-2 shadow-inner transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl ${isCorrectLocal ? 'border-emerald-900/30 hover:border-emerald-500/50' : 'border-rose-900/30 hover:border-rose-500/50'}`}
                            >
                               <div className="flex flex-wrap items-center gap-3 mb-4">
                                  <span className="text-slate-400 font-bold text-sm tracking-widest">Q{idx + 1}</span>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-700 text-slate-400 bg-slate-800">{q.type}</span>
                                  {/* Topic Badge */}
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-700 text-cyan-400 bg-cyan-900/20 truncate max-w-[150px]" title={q.topic}>
                                     {q.topic}
                                  </span>
                                  {/* Difficulty Badge */}
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-700 ${
                                     q.difficulty.toLowerCase().includes('hard') ? 'text-rose-400 bg-rose-900/20' :
                                     q.difficulty.toLowerCase().includes('medium') ? 'text-amber-400 bg-amber-900/20' :
                                     'text-emerald-400 bg-emerald-900/20'
                                  }`}>
                                     {q.difficulty}
                                  </span>
                                  
                                  {isCorrectLocal ? (
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 ml-auto">
                                      <CheckCircle className="w-3.5 h-3.5" /> Correct
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 ml-auto">
                                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                                    </span>
                                  )}
                               </div>
                               
                               <div className="text-slate-200 text-base leading-relaxed whitespace-pre-wrap font-medium mb-6">
                                 {renderMathText(q.questionText)}
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
                                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">{t.yourAnswer}</span>
                                     <div className={`text-sm font-medium ${!displayUA ? 'text-slate-600 italic' : 'text-slate-300'}`}>
                                        {displayUA ? renderMathText(displayUA) : t.noAnswer}
                                     </div>
                                  </div>
                                  <div className="p-4 rounded-xl border border-emerald-900/50 bg-emerald-900/10">
                                     <span className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest block mb-2">{t.correctAnswer}</span>
                                     <div className="text-sm font-medium text-emerald-300">
                                        {renderMathText(cA)}
                                     </div>
                                  </div>
                               </div>
                               
                               <div className="mt-4 flex items-center justify-center border-t border-slate-800 pt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" /> Click to view AI Discussion
                                  </span>
                               </div>
                            </div>
                          );
                       })}
                    </div>
                 </div>

                 {/* Discussion Modal Popup */}
                 {selectedDiscussion !== null && (
                    <div className="fixed inset-0 z-[120] backdrop-blur-sm bg-slate-950/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
                       <div className="bg-slate-900 border border-slate-700 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto relative animate-in zoom-in-95 duration-300 custom-scrollbar">
                          <button 
                            onClick={() => setSelectedDiscussion(null)} 
                            className="absolute top-5 right-5 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          
                          <h4 className="text-lg font-bold text-indigo-400 uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                             <BookOpen className="w-5 h-5" />
                             {t.discussionTitle || "Step-by-Step Discussion"} - Q{selectedDiscussion + 1}
                          </h4>
                          
                          <div className="text-slate-200 text-base leading-relaxed space-y-4 font-medium">
                             {tryOutQuestions[selectedDiscussion].explanation
                               .replace(/\\n/g, '\n')
                               .split(/\n+/)
                               .filter(paragraph => paragraph.trim() !== '')
                               .map((paragraph, pIdx) => (
                                 <div key={pIdx} className="whitespace-pre-wrap">
                                   {renderMathText(paragraph)}
                                 </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 )}

                 {/* Return Hub Reset Trigger */}
                 <button 
                   onClick={resetPracticeAndReturn}
                   className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 group"
                 >
                   <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                   <span className="text-lg">{t.returnToHubBtn}</span>
                 </button>
               </>
            )}

          </div>
        )}

        {/* === VIEW: PRACTICE MODE (PHASE 4) === */}
        {currentView === 'practice' && (
          <div className="w-full max-w-4xl relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg"><Target className="w-6 h-6 text-cyan-400" /></div>
                  {t.pracTitle}
                </h2>
                <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">{t.pracDesc}</p>
              </div>
              <button onClick={() => setCurrentView('customization')} className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0">
                <Settings className="w-4 h-4" /><span>Return to Hub</span>
              </button>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />
              
              <div className="px-6 py-4 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 font-medium tracking-wide">
                    Attempt Tracker: <span className="text-white font-bold">{currentAttempts}</span>
                  </span>
                  <span className="text-slate-400 font-medium tracking-wide">
                    Completed: <span className="text-emerald-400 font-bold">{sessionHistory.length}</span>
                  </span>
                </div>
              </div>

              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
                {isGenerating || isEvaluating ? (
                  <div className="flex flex-col items-center justify-center space-y-5 animate-in fade-in zoom-in-95 duration-500 min-h-[300px]">
                    <div className="relative">
                      <div className={`absolute inset-0 border-4 rounded-full ${isEvaluating ? 'border-amber-500/30' : 'border-cyan-500/30'}`}></div>
                      <Loader2 className={`w-14 h-14 animate-spin relative z-10 ${isEvaluating ? 'text-amber-400' : 'text-cyan-400'}`} />
                    </div>
                    <p className={`font-medium animate-pulse tracking-wide uppercase text-sm ${isEvaluating ? 'text-amber-300' : 'text-cyan-300'}`}>
                      {isEvaluating ? t.evaluating : "Synthesizing Dynamic Question..."}
                    </p>
                  </div>
                ) : !currentQuestion ? (
                  <div className="animate-in fade-in duration-500 flex flex-col items-center">
                    <BrainCircuit className="w-16 h-16 text-slate-600 opacity-50 mb-4" />
                    <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">{t.pracPlaceholder}</p>
                  </div>
                ) : (
                  <div className="w-full text-left space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="bg-slate-800/40 p-6 md:p-8 rounded-2xl border border-slate-700/60 shadow-inner">
                      <div className="flex flex-wrap items-center gap-2 mb-5">
                        <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest border border-indigo-500/30">
                          {currentQuestion.type}
                        </span>
                        {currentQuestion.difficulty && (
                          <span className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-widest border border-rose-500/30">
                            {currentQuestion.difficulty}
                          </span>
                        )}
                        {currentQuestion.topic && (
                          <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest border border-emerald-500/30">
                            {currentQuestion.topic}
                          </span>
                        )}
                      </div>
                      <div className="text-white text-[1.1rem] leading-relaxed whitespace-pre-wrap font-medium">
                        {renderMathText(currentQuestion.questionText)}
                      </div>
                    </div>

                    <div className="space-y-3 px-2">
                      {currentQuestion.type.startsWith('mcq') && currentQuestion.options ? (
                         <div className="grid grid-cols-1 gap-3.5">
                           {currentQuestion.options.map((opt, idx) => {
                             const letter = String.fromCharCode(65 + idx); 
                             const isChecked = currentQuestion.type === 'mcqComplex' ? userAnswer.includes(letter) : userAnswer === letter;
                             const inputLocked = checkState !== 'idle';
                             
                             return (
                               <label key={idx} className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${inputLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${isChecked ? 'border-cyan-500 bg-cyan-900/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800'}`}>
                                 <input 
                                   type={currentQuestion.type === 'mcqComplex' ? "checkbox" : "radio"} 
                                   name="mcqAnswer"
                                   checked={isChecked}
                                   disabled={inputLocked}
                                   onChange={(e) => {
                                      if (currentQuestion.type === 'mcqComplex') {
                                          let currentAnswers = userAnswer ? userAnswer.split(',') : [];
                                          if (e.target.checked) currentAnswers.push(letter);
                                          else currentAnswers = currentAnswers.filter(a => a !== letter);
                                          setUserAnswer(currentAnswers.sort().join(','));
                                      } else { setUserAnswer(letter); }
                                   }}
                                   className="mt-1 w-5 h-5 text-cyan-500 border-slate-600 bg-slate-950 focus:ring-cyan-500 focus:ring-offset-slate-900 transition-colors" 
                                 />
                                 <div className={`text-[1.05rem] mt-[-2px] ${isChecked ? 'text-cyan-100 font-medium' : 'text-slate-300'}`}>
                                    {renderMathText(opt)}
                                 </div>
                               </label>
                             );
                           })}
                         </div>
                      ) : currentQuestion.type === 'essay' ? (
                         <textarea 
                           value={userAnswer}
                           disabled={checkState !== 'idle'}
                           onChange={(e) => setUserAnswer(e.target.value)}
                           placeholder="Write your detailed answer here..."
                           rows="6"
                           className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-xl p-5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none shadow-inner text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                         />
                      ) : (
                         <input 
                           type="text"
                           value={userAnswer}
                           disabled={checkState !== 'idle'}
                           onChange={(e) => setUserAnswer(e.target.value)}
                           placeholder={currentQuestion.type === 'fillNum' ? "e.g. 6,0" : "Type your answer here..."}
                           className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-xl p-5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                         />
                      )}
                    </div>

                    {checkState !== 'idle' && (
                      <div className={`mt-4 p-5 rounded-2xl border flex items-start gap-4 animate-in zoom-in-95 duration-300 ${checkState === 'correct' ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-rose-950/30 border-rose-500/30'}`}>
                         {checkState === 'correct' ? (
                           <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />
                         ) : (
                           <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
                         )}
                         <div>
                            <h4 className={`text-sm font-bold uppercase tracking-wider mb-1 ${checkState === 'correct' ? 'text-emerald-400' : 'text-rose-400'}`}>
                               {checkState === 'correct' ? 'CORRECT' : 'INCORRECT'}
                            </h4>
                            <p className="text-slate-200 leading-relaxed text-sm">{feedbackMsg}</p>
                         </div>
                      </div>
                    )}

                    {showDiscussion && (
                      <div className="mt-4 p-6 bg-slate-800/80 border border-indigo-500/30 rounded-2xl animate-in slide-in-from-top-4 fade-in duration-300 shadow-inner overflow-x-auto">
                        <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                           <BookOpen className="w-4 h-4" />
                           {t.discussionTitle}
                        </h4>
                        <div className="text-slate-200 text-base leading-relaxed space-y-4 font-medium">
                           {currentQuestion.explanation
                             .replace(/\\n/g, '\n') 
                             .split(/\n+/) 
                             .filter(paragraph => paragraph.trim() !== '') 
                             .map((paragraph, idx) => (
                               <div key={idx} className="whitespace-pre-wrap">
                                 {renderMathText(paragraph)}
                               </div>
                           ))}
                        </div>
                      </div>
                    )}

                    {/* Illustration Modal Popup */}
                    {showIllustrationModal && illustrationUrl && (
                       <div className="fixed inset-0 z-[120] backdrop-blur-sm bg-slate-950/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
                          <div className="bg-slate-900 border border-slate-700 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col">
                             <button 
                               onClick={() => setShowIllustrationModal(false)} 
                               className="absolute top-5 right-5 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer z-10"
                             >
                               <X className="w-5 h-5" />
                             </button>
                             
                             <h4 className="text-lg font-bold text-pink-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-800 pb-4">
                                <ImageIcon className="w-5 h-5" />
                                Generated Illustration
                             </h4>
                             
                             <div className="flex-1 overflow-y-auto flex items-center justify-center bg-slate-950 rounded-xl border-2 border-slate-700/50 p-2 custom-scrollbar">
                                <img src={illustrationUrl} alt="AI Generated Illustration" className="max-w-full max-h-[50vh] object-contain rounded-lg" />
                             </div>
                          </div>
                       </div>
                    )}

                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-950/80 border-t border-slate-800">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  
                  <button 
                    onClick={() => generateQuestion()}
                    disabled={isGenerating || isEvaluating}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white transition-all shadow-lg shadow-cyan-900/20 group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-5 h-5 mb-1.5 ${isGenerating ? 'animate-spin' : 'group-hover:-rotate-180 transition-transform duration-500'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider">{t.btnGenNew}</span>
                  </button>

                  {checkState === 'incorrect' ? (
                    <button 
                      onClick={handleRetry}
                      disabled={isGenerating || isEvaluating}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-amber-600/50 bg-amber-950/50 text-amber-500 hover:bg-amber-900/50 hover:text-amber-400 transition-all active:scale-95"
                    >
                      <RotateCcw className="w-5 h-5 mb-1.5" />
                      <span className="text-xs font-bold uppercase tracking-wider">{t.btnRetry}</span>
                    </button>
                  ) : (
                    <button 
                      onClick={handleCheck}
                      disabled={!currentQuestion || !userAnswer || isGenerating || isEvaluating || checkState === 'correct'}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-emerald-600/50 bg-emerald-950/30 text-emerald-500 hover:bg-emerald-900/50 hover:text-emerald-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                    >
                      <CheckCircle className="w-5 h-5 mb-1.5" />
                      <span className="text-xs font-bold uppercase tracking-wider">{t.btnCheck}</span>
                    </button>
                  )}

                  <button 
                    onClick={() => setShowDiscussion(!showDiscussion)}
                    disabled={!currentQuestion || isGenerating || isEvaluating}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 ${showDiscussion ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300' : 'border-indigo-600/50 bg-indigo-950/30 text-indigo-500 hover:bg-indigo-900/50 hover:text-indigo-400'}`}
                  >
                    <MessageCircle className="w-5 h-5 mb-1.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t.btnDiscuss}</span>
                  </button>

                  <button 
                    onClick={handleSummarize}
                    disabled={isGenerating || isEvaluating || !currentQuestion}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-30 active:scale-95"
                  >
                    <ListChecks className="w-5 h-5 mb-1.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t.btnSummarize}</span>
                  </button>

                  <button 
                    onClick={handleIllustrate}
                    disabled={isGenerating || isEvaluating || isIllustrating || !currentQuestion}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-pink-700/50 bg-pink-900/20 text-pink-400 hover:bg-pink-900/40 hover:text-pink-300 transition-all disabled:opacity-30 active:scale-95 group"
                  >
                    <ImageIcon className={`w-5 h-5 mb-1.5 ${isIllustrating ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider">{isIllustrating ? t.illustrating : t.btnIllustrate}</span>
                  </button>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* === VIEW: SUMMARY DASHBOARD (PHASE 4 - SEGMENT 4) === */}
        {currentView === 'summary' && (
          <div className="w-full max-w-5xl relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="text-center space-y-4">
               <h2 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-3">
                 <div className="p-2 bg-fuchsia-500/20 rounded-lg">
                   <BarChart3 className="w-8 h-8 text-fuchsia-400" />
                 </div>
                 {t.summaryTitle}
               </h2>
               <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">{t.summaryDesc}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-400" />
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs mb-3">{t.accuracyLabel}</span>
                  <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                    {sessionHistory.length > 0 ? Math.round((sessionHistory.filter(q => q.firstAttemptCorrect).length / sessionHistory.length) * 100) : 0}%
                  </span>
               </div>
               
               <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs mb-3">{t.totalQ}</span>
                  <span className="text-5xl font-black text-white">{sessionHistory.length}</span>
               </div>
               
               <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs mb-3">{t.totalRetries}</span>
                  <span className="text-5xl font-black text-amber-400">{sessionHistory.reduce((acc, q) => acc + q.retries, 0)}</span>
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                 <ListChecks className="w-5 h-5 text-indigo-400" /> 
                 {t.reviewTitle}
               </h3>
               
               <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {sessionHistory.map((q, idx) => (
                    <div key={idx} className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60 shadow-inner flex flex-col gap-4">
                       <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/50 pb-3">
                          <span className="text-slate-400 font-bold text-sm tracking-widest">Q{idx + 1}</span>
                          <div className="flex flex-wrap items-center gap-2">
                             {q.firstAttemptCorrect ? (
                               <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                                 <CheckCircle className="w-3.5 h-3.5" /> {t.correctFirst}
                               </span>
                             ) : (
                               <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                                 <XCircle className="w-3.5 h-3.5" /> {t.incorrectFirst}
                               </span>
                             )}
                             <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                               <RotateCcw className="w-3.5 h-3.5" /> {t.retryCountText} {q.retries}
                             </span>
                          </div>
                       </div>
                       <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                         {renderMathText(q.questionText)}
                       </div>
                    </div>
                  ))}
                  
                  {sessionHistory.length === 0 && (
                    <p className="text-slate-500 text-center py-8 italic">No questions were completed in this session.</p>
                  )}
               </div>
            </div>

            <button 
              onClick={resetPracticeAndReturn}
              className="w-full mt-6 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-fuchsia-900/20 flex items-center justify-center gap-3 group"
            >
              <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-lg">{t.returnToHubBtn}</span>
            </button>

          </div>
        )}

        {/* === VIEW: TEACHER LIVE DASHBOARD (PHASE 4) === */}
        {currentView === 'teacher_dashboard' && (
          <div className="w-full max-w-6xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
                <div>
                   <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                     <div className="p-2 bg-indigo-500/20 rounded-lg">
                       <Monitor className="w-6 h-6 text-indigo-400" />
                     </div>
                     Live Monitoring Dashboard
                   </h2>
                   <p className="text-slate-400 mt-2 text-sm">Room Code: <span className="text-white font-mono font-bold tracking-widest">{roomCode}</span></p>
                </div>
                <button 
                  onClick={handleEndSession}
                  className="px-6 py-2.5 rounded-xl border border-rose-900/50 bg-rose-950/30 text-rose-400 font-semibold hover:bg-rose-900/50 hover:text-rose-300 transition-all text-sm flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> End Session Early
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center text-center">
                   <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs mb-2">Connected Students</span>
                   <span className="text-4xl font-black text-white">{participants.length}</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center text-center">
                   <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs mb-2">Completed</span>
                   <span className="text-4xl font-black text-emerald-400">{participants.filter(p => p.status === 'completed').length}</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center text-center">
                   <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs mb-2">Total Warnings</span>
                   <span className="text-4xl font-black text-rose-400">{participants.reduce((acc, p) => acc + (p.cheatFlags || 0), 0)}</span>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {participants.map((p, idx) => (
                   <div key={p.uid || idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col relative overflow-hidden transition-all">
                      {p.status === 'completed' && <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />}
                      {(p.cheatFlags > 0) && p.status !== 'completed' && <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 animate-pulse" />}
                      
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${p.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                               <User className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-white truncate max-w-[120px]">{p.name}</h3>
                         </div>
                         {p.status === 'completed' ? (
                            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-lg">Done</span>
                         ) : (
                            <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-lg">Active</span>
                         )}
                      </div>

                      <div className="space-y-4">
                         <div>
                            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                               <span>Progress</span>
                               <span>{p.progress || 0} / {tryOutQCount}</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
                               <div 
                                 className={`h-full rounded-full transition-all duration-500 ${p.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                 style={{ width: `${Math.min(((p.progress || 0) / tryOutQCount) * 100, 100)}%` }} 
                               />
                            </div>
                         </div>
                         
                         <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                            <div className="flex items-center gap-2">
                               <AlertTriangle className={`w-4 h-4 ${p.cheatFlags > 0 ? 'text-rose-500' : 'text-slate-500'}`} />
                               <span className="text-xs font-semibold text-slate-400">Warnings</span>
                            </div>
                            <span className={`font-black ${p.cheatFlags > 0 ? 'text-rose-400' : 'text-slate-300'}`}>{p.cheatFlags || 0}</span>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* === VIEW: TEACHER SUMMARY (PHASE 5) === */}
        {currentView === 'teacher_summary' && (
          <div className="w-full max-w-5xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center space-y-4 mb-10">
                <h2 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  Session Complete
                </h2>
                <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">The monitoring session has ended. Here is the final aggregate report for all participants.</p>
             </div>

             <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex items-center gap-3">
                   <BarChart3 className="w-5 h-5 text-indigo-400" />
                   <h3 className="font-bold text-white uppercase tracking-wider text-sm">Class Leaderboard</h3>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="bg-slate-900 border-b border-slate-800">
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Completion</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Score</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Warnings</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                         {[...participants].sort((a, b) => (b.score || 0) - (a.score || 0)).map((p, idx) => (
                            <tr key={p.uid || idx} className="hover:bg-slate-800/20 transition-colors">
                               <td className="p-4 font-bold text-slate-200 flex items-center gap-3">
                                  <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs text-slate-400">{idx + 1}</span>
                                  {p.name}
                               </td>
                               <td className="p-4 text-center">
                                  {p.status === 'completed' ? (
                                     <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-lg">100%</span>
                                  ) : (
                                     <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-lg">{Math.round(((p.progress || 0) / tryOutQCount) * 100)}%</span>
                                  )}
                               </td>
                               <td className="p-4 text-center font-black text-blue-400">
                                  {p.score !== undefined ? `${p.score}/${p.total || tryOutQCount}` : '-'}
                               </td>
                               <td className="p-4 text-right">
                                  <span className={`font-bold ${p.cheatFlags > 0 ? 'text-rose-400' : 'text-slate-500'}`}>{p.cheatFlags || 0}</span>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                   {participants.length === 0 && (
                      <div className="p-8 text-center text-slate-500 text-sm">No students joined this session.</div>
                   )}
                </div>
             </div>

             <button 
               onClick={handleLogout}
               className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl flex items-center justify-center gap-3 group border border-slate-700"
             >
               <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
               <span className="text-lg">Close Session & Return Home</span>
             </button>
          </div>
        )}

      </main>
      {renderFooter()}
    </div>
  );
}