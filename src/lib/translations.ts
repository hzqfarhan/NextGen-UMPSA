export type Language = 'en' | 'ms'

type TranslationKeys = {
  navHome: string
  navAgents: string
  navSave: string
  navReports: string
  navPay: string
  navCards: string
  dashGreeting: string
  dashStatus: string
  dashStrong: string
  dashWatch: string
  dashBalance: string
  dashSafeDaily: string
  dashLimitsImpulse: string
  dashNextIn: string
  dashDays: string
  actionTransaction: string
  actionTransfer: string
  actionTopUp: string
  topUpTitle: string
  topUpSuccess: string
  topUpSuccessDesc: string
  insufficientFunds: string
  insufficientFundsDesc: string
  actionShield: string
  sectionHealthCheck: string
  riskCashflow: string
  riskDebtShield: string
  sectionInsights: string
  insightBrokeDate: string
  insightBrokeDesc: string
  insightSavings: string
  insightSavingsDesc: string
  sectionRecent: string
  viewAll: string
  resModalTitle: string
  resModalExcellent: string
  resModalStable: string
  resModalNeedsAttention: string
  resModalDesc: string
  resModalCashflow: string
  resModalSavings: string
  resModalDebt: string
  resModalAI: string
  resModalAIDesc: string
  settingsPreferences: string
  settingsSmartNotif: string
  settingsDebtAuto: string
  settingsAccount: string
  settingsLanguage: string
  settingsPaymentMethods: string
  settingsProfile: string
  settingsHelp: string
  settingsSecureSession: string
  settingsSignOut: string
  logoutReady: string
  logoutDesc: string
  logoutCancel: string
  logoutConfirm: string
  logoutSecuring: string
  agentHeader: string
  agentSubheader: string
  agentOrchStatus: string
  agentOrchLog: string
  agentConfidence: string
  agentAction: string
  agentSystemLogs: string
  agentNameOrch: string
  agentNameSpend: string
  agentNameCash: string
  agentNameDebt: string
  agentFindingOrch: string
  agentFindingSpend: string
  agentFindingCash: string
  agentFindingDebt: string
  agentRecOrch: string
  agentRecSpend: string
  agentRecCash: string
  agentRecDebt: string
  saveHeader: string
  saveSubheader: string
  saveTotalLabel: string
  saveActiveGoals: string
  savePocketEmerg: string
  savePocketLaptop: string
  savePocketRent: string
  saveGoalMet: string
  saveCreatePocket: string
  saveSplitSummary: string
  saveMode: string
  saveModeSavings: string
  saveModeGrowth: string
  saveRiskLevel: string
  saveRiskLow: string
  saveRiskMed: string
  saveRiskHigh: string
  saveInvestedBadge: string
  saveSmartAuto: string
  saveSmartDesc: string
  saveAddFunds: string
  saveAddPocket: string
  saveGoalName: string
  saveTargetAmount: string
  saveInitialDeposit: string
  saveChooseIcon: string
  saveAddFundsTo: string
  saveAmountToSave: string
  saveConfirmDeposit: string
  saveEditPocket: string
  saveDeletePocket: string
  saveDeleteConfirm: string
  saveDeleteNotice: string
  saveUpdatePocket: string
  reportHeader: string
  reportSubheader: string
  reportBreakdown: string
  reportMilestones: string
  reportMileEmerg: string
  reportMileEmergDesc: string
  reportMileDebt: string
  reportMileDebtDesc: string
  reportProjBal: string
  reportProjDesc: string
  coachHeader: string
  coachSubheader: string
  coachInputPlaceholder: string
  coachChipLimit: string
  coachChipSafe: string
  coachChipSave: string
  billsHeader: string
  billsSubheader: string
  billsProtected: string
  billsNext: string
  billsAutoPay: string
  billsActive: string
  billsNeedsSetup: string
  billsUpcoming: string
  billsPaid: string
  billsHistory: string
  billsAdd: string
  billsAutoPayCheck: string
  billsLock: string
  billsAutoPayToggle: string
  billsPayNow: string
  billsCompleteSetup: string
  billsNoAcc: string
  billsSafe: string
  billsUnsafe: string
  billsDueSoon: string
  billsDueToday: string
  billsOverdue: string
  billsDaysLeft: string
  billsEdit: string
  billsDelete: string
  billsSave: string
  billsCancel: string
  billsName: string
  billsAmount: string
  billsCategory: string
  billsProvider: string
  billsAccNum: string
  billsRefNum: string
  billsFreq: string
  billsDueDay: string
  billsSafety: string
  billsReminder: string
  billsStrict: string
  billsBalanced: string
  billsFlexible: string
  billsSimulated: string
}

export const t: Record<Language, TranslationKeys> = {
  en: {
    navHome: "Home",
    navAgents: "Council",
    navSave: "Missions",
    navReports: "Insights",
    navPay: "PAY",
    navCards: "Cards",
    dashGreeting: "Hi",
    dashStatus: "Status",
    dashStrong: "Strong",
    dashWatch: "Watch",
    dashBalance: "Balance",
    dashSafeDaily: "Safe Daily Spend",
    dashLimitsImpulse: "Limits impulse risk",
    dashNextIn: "Next allowance in",
    dashDays: "days",
    actionTransaction: "Activity",
    actionTransfer: "Transfer",
    actionTopUp: "Top Up",
    topUpTitle: "Top Up Wallet",
    topUpSuccess: "Wallet Topped Up",
    topUpSuccessDesc: "Funds have been added to your balance.",
    insufficientFunds: "Insufficient Funds",
    insufficientFundsDesc: "You do not have enough balance to complete this transaction. Please top up your wallet.",
    actionShield: "Smart Lock",
    sectionHealthCheck: "NextGen Check",
    riskCashflow: "Cashflow Safety",
    riskDebtShield: "Commitment Safety",
    sectionInsights: "NextGen Nudges",
    insightBrokeDate: "Week 4 Pressure",
    insightBrokeDesc: "Your current pace could make the end of month tight. Try a Cooling-Off Pocket.",
    insightSavings: "Savings Mission",
    insightSavingsDesc: "Save RM5 before midnight to keep your streak alive.",
    sectionRecent: "Recent Transfers",
    viewAll: "VIEW ALL",
    resModalTitle: "NextGen Score",
    resModalExcellent: "Strong",
    resModalStable: "Healthy",
    resModalNeedsAttention: "Needs Control",
    resModalDesc: "Your NextGen Score shows how ready your money is for the rest of the month.",
    resModalCashflow: "Cashflow Safety",
    resModalSavings: "Savings Progress",
    resModalDebt: "Commitment Pressure",
    resModalAI: "NextGen AI Council",
    resModalAIDesc: "Keep Safe Daily Spend above RM15 and lock essential commitments before non-essential spending.",
    settingsPreferences: "Preferences",
    settingsSmartNotif: "NextGen Nudges",
    settingsDebtAuto: "Commitment Safety Scan",
    settingsAccount: "Account",
    settingsLanguage: "Language / Bahasa",
    settingsPaymentMethods: "Payment Methods",
    settingsProfile: "Profile Information",
    settingsHelp: "Help & Support",
    settingsSecureSession: "Secure Session",
    settingsSignOut: "Sign Out securely",
    logoutReady: "Ready to go?",
    logoutDesc: "Your simulated financial data is saved locally on this device.",
    logoutCancel: "Cancel",
    logoutConfirm: "Sign Out",
    logoutSecuring: "Securing...",
    agentHeader: "NextGen AI Council",
    agentSubheader: "Spend Guardian, Savings Coach, Future Planner, Alternative Finder, and Guild Master",
    agentOrchStatus: "ACTIVE",
    agentOrchLog: '"Council synced. Current priority: protect commitments and keep Safe Daily Spend healthy."',
    agentConfidence: "Confidence",
    agentAction: "ACTION",
    agentSystemLogs: "Council Logs",
    agentNameOrch: "Council Orchestrator",
    agentNameSpend: "Spend Guardian",
    agentNameCash: "Future Planner",
    agentNameDebt: "Commitment Shield",
    agentFindingOrch: "NextGen Financial Brain is monitoring your money mood.",
    agentFindingSpend: "Food spending is 15% above your normal student pattern.",
    agentFindingCash: "Week 4 may feel tight if spending continues.",
    agentFindingDebt: "No new repayment pressure detected.",
    agentRecOrch: "Keep checking risky purchases before paying.",
    agentRecSpend: "Limit delivery food to RM15 today.",
    agentRecCash: "Move one purchase into a 24-hour Cooling-Off Pocket.",
    agentRecDebt: "Keep essential commitments locked.",
    saveHeader: "Savings Missions",
    saveSubheader: "Micro-savings, streaks, and future-you wins.",
    saveTotalLabel: "Total Saved",
    saveActiveGoals: "Active Missions",
    savePocketEmerg: "Emergency Pocket",
    savePocketLaptop: "Laptop Mission",
    savePocketRent: "Rent Buffer",
    saveGoalMet: "Mission Complete",
    saveCreatePocket: "Create Mission",
    saveSplitSummary: "Saving will be split between {count} missions (RM {amount} each)",
    saveMode: "Mission Mode",
    saveModeSavings: "Safe Savings",
    saveModeGrowth: "Growth Starter",
    saveRiskLevel: "Risk Profile",
    saveRiskLow: "Low (Stable)",
    saveRiskMed: "Medium (Balanced)",
    saveRiskHigh: "High (Growth)",
    saveInvestedBadge: "Managed",
    saveSmartAuto: "Smart Auto-Save",
    saveSmartDesc: "Moving RM 2.00 daily to Emergency Pocket",
    saveAddFunds: "ADD FUNDS",
    saveAddPocket: "New Savings Mission",
    saveGoalName: "Mission Name",
    saveTargetAmount: "Target Amount (RM)",
    saveInitialDeposit: "Initial Deposit (RM)",
    saveChooseIcon: "Choose Icon",
    saveAddFundsTo: "Add Funds to",
    saveAmountToSave: "Amount to Save (RM)",
    saveConfirmDeposit: "Confirm Deposit",
    saveEditPocket: "Edit Mission",
    saveDeletePocket: "Delete Mission",
    saveDeleteConfirm: "Are you sure?",
    saveDeleteNotice: "The balance in this mission will return to your main account.",
    saveUpdatePocket: "Update Mission",
    reportHeader: "Insights",
    reportSubheader: "Safe Daily Spend, NextGen Score, and spending patterns.",
    reportBreakdown: "Category Spending",
    reportMilestones: "Mission Progress",
    reportMileEmerg: "Emergency Pocket 50%",
    reportMileEmergDesc: "You are RM165 away from your first stability milestone.",
    reportMileDebt: "No BNPL Streak",
    reportMileDebtDesc: "Good job. 12 days without new repayment pressure.",
    reportProjBal: "Projected Month-End Balance",
    reportProjDesc: "Based on NextGen Financial Brain projections.",
    coachHeader: "NextGen Council",
    coachSubheader: "A proactive council for safer spending decisions.",
    coachInputPlaceholder: "Ask if a purchase is safe...",
    coachChipLimit: "Can I afford this purchase?",
    coachChipSafe: "What is my Safe Daily Spend?",
    coachChipSave: "Create a savings mission",
    billsHeader: "Smart Bill Lock",
    billsSubheader: "Protect rent, bills, goals, and future needs.",
    billsProtected: "Protected",
    billsNext: "Next Lock",
    billsAutoPay: "AutoPay",
    billsActive: "Active",
    billsNeedsSetup: "Needs Setup",
    billsUpcoming: "Upcoming Locks",
    billsPaid: "Paid / History",
    billsHistory: "History",
    billsAdd: "Add Commitment",
    billsAutoPayCheck: "Run AutoPay Check",
    billsLock: "Smart Bill Lock",
    billsAutoPayToggle: "AutoPay",
    billsPayNow: "Pay Now",
    billsCompleteSetup: "Complete Setup",
    billsNoAcc: "Add account/reference number to enable simulated AutoPay.",
    billsSafe: "Safe to Pay",
    billsUnsafe: "Low Balance Risk",
    billsDueSoon: "Due Soon",
    billsDueToday: "Due Today",
    billsOverdue: "Overdue",
    billsDaysLeft: "days left",
    billsEdit: "Edit Commitment",
    billsDelete: "Delete",
    billsSave: "Save Commitment",
    billsCancel: "Cancel",
    billsName: "Commitment Name",
    billsAmount: "Amount",
    billsCategory: "Category",
    billsProvider: "Provider",
    billsAccNum: "Account Number",
    billsRefNum: "Reference Number",
    billsFreq: "Frequency",
    billsDueDay: "Due Day of Month",
    billsSafety: "AutoPay Safety",
    billsReminder: "Reminder (days before)",
    billsStrict: "Strict",
    billsBalanced: "Balanced",
    billsFlexible: "Flexible",
    billsSimulated: "Simulated AutoPay completed",
  },
  ms: {
    navHome: "Command",
    navAgents: "Council",
    navSave: "Misi",
    navReports: "Insight",
    navPay: "BAYAR",
    navCards: "Kad",
    dashGreeting: "Hai",
    dashStatus: "Status",
    dashStrong: "Kukuh",
    dashWatch: "Awas",
    dashBalance: "Baki",
    dashSafeDaily: "Safe Daily Spend",
    dashLimitsImpulse: "Jumlah yang selamat untuk belanja hari ini.",
    dashNextIn: "Elaun seterusnya dalam",
    dashDays: "hari",
    actionTransaction: "Aktiviti",
    actionTransfer: "Transfer",
    actionTopUp: "Tambah",
    topUpTitle: "Tambah Baki Wallet",
    topUpSuccess: "Baki Berjaya Ditambah",
    topUpSuccessDesc: "Dana telah dimasukkan ke dalam baki anda.",
    insufficientFunds: "Baki Tidak Mencukupi",
    insufficientFundsDesc: "Baki tidak mencukupi untuk transaksi ini.",
    actionShield: "Smart Lock",
    sectionHealthCheck: "Semakan NextGen",
    riskCashflow: "Keselamatan Cashflow",
    riskDebtShield: "Keselamatan Komitmen",
    sectionInsights: "Nudge NextGen",
    insightBrokeDate: "Tekanan Minggu 4",
    insightBrokeDesc: "Kalau pace ni berterusan, hujung bulan boleh ketat.",
    insightSavings: "Misi Simpanan",
    insightSavingsDesc: "Simpan RM5 sebelum tengah malam untuk jaga streak.",
    sectionRecent: "Transfer Terkini",
    viewAll: "LIHAT SEMUA",
    resModalTitle: "NextGen Score",
    resModalExcellent: "Kukuh",
    resModalStable: "Sihat",
    resModalNeedsAttention: "Perlu Kawal",
    resModalDesc: "Skor ini tunjuk sejauh mana duit anda bersedia untuk baki bulan ini.",
    resModalCashflow: "Keselamatan Cashflow",
    resModalSavings: "Kemajuan Simpanan",
    resModalDebt: "Tekanan Komitmen",
    resModalAI: "NextGen AI Council",
    resModalAIDesc: "Kekalkan Safe Daily Spend atas RM15 dan lock komitmen penting dulu.",
    settingsPreferences: "Pilihan",
    settingsSmartNotif: "Nudge NextGen",
    settingsDebtAuto: "Imbas Komitmen",
    settingsAccount: "Akaun",
    settingsLanguage: "Language / Bahasa",
    settingsPaymentMethods: "Cara Pembayaran",
    settingsProfile: "Profil",
    settingsHelp: "Bantuan",
    settingsSecureSession: "Sesi Selamat",
    settingsSignOut: "Log Keluar",
    logoutReady: "Sedia keluar?",
    logoutDesc: "Data simulasi disimpan secara lokal pada peranti ini.",
    logoutCancel: "Batal",
    logoutConfirm: "Log Keluar",
    logoutSecuring: "Mengamankan...",
    agentHeader: "NextGen AI Council",
    agentSubheader: "Spend Guardian, Savings Coach, Future Planner, Alternative Finder, dan Guild Master",
    agentOrchStatus: "AKTIF",
    agentOrchLog: '"Council sync. Keutamaan: lindungi komitmen dan jaga Safe Daily Spend."',
    agentConfidence: "Keyakinan",
    agentAction: "TINDAKAN",
    agentSystemLogs: "Log Council",
    agentNameOrch: "Council Orchestrator",
    agentNameSpend: "Spend Guardian",
    agentNameCash: "Future Planner",
    agentNameDebt: "Commitment Shield",
    agentFindingOrch: "NextGen Financial Brain sedang pantau money mood anda.",
    agentFindingSpend: "Belanja makanan 15% atas corak biasa.",
    agentFindingCash: "Minggu 4 mungkin ketat jika spending berterusan.",
    agentFindingDebt: "Tiada tekanan bayaran baharu dikesan.",
    agentRecOrch: "Semak pembelian berisiko sebelum bayar.",
    agentRecSpend: "Hadkan delivery food kepada RM15 hari ini.",
    agentRecCash: "Masukkan satu pembelian ke Cooling-Off Pocket.",
    agentRecDebt: "Kekalkan komitmen penting locked.",
    saveHeader: "Savings Missions",
    saveSubheader: "Misi kecil, streak, dan future-you wins.",
    saveTotalLabel: "Jumlah Simpanan",
    saveActiveGoals: "Misi Aktif",
    savePocketEmerg: "Emergency Pocket",
    savePocketLaptop: "Misi Laptop",
    savePocketRent: "Rent Buffer",
    saveGoalMet: "Misi Selesai",
    saveCreatePocket: "Cipta Misi",
    saveSplitSummary: "Simpanan dibahagi antara {count} misi (RM {amount} setiap satu)",
    saveMode: "Mod Misi",
    saveModeSavings: "Simpanan Selamat",
    saveModeGrowth: "Growth Starter",
    saveRiskLevel: "Profil Risiko",
    saveRiskLow: "Rendah",
    saveRiskMed: "Sederhana",
    saveRiskHigh: "Tinggi",
    saveInvestedBadge: "Managed",
    saveSmartAuto: "Smart Auto-Save",
    saveSmartDesc: "RM2.00 sehari ke Emergency Pocket",
    saveAddFunds: "TAMBAH",
    saveAddPocket: "Misi Simpanan Baharu",
    saveGoalName: "Nama Misi",
    saveTargetAmount: "Sasaran (RM)",
    saveInitialDeposit: "Deposit Awal (RM)",
    saveChooseIcon: "Pilih Ikon",
    saveAddFundsTo: "Tambah Dana ke",
    saveAmountToSave: "Jumlah Simpanan (RM)",
    saveConfirmDeposit: "Sahkan Deposit",
    saveEditPocket: "Edit Misi",
    saveDeletePocket: "Padam Misi",
    saveDeleteConfirm: "Anda pasti?",
    saveDeleteNotice: "Baki misi ini akan kembali ke akaun utama.",
    saveUpdatePocket: "Kemaskini Misi",
    reportHeader: "Insights",
    reportSubheader: "Trend Safe Daily Spend, NextGen Score, dan kategori.",
    reportBreakdown: "Kategori Belanja",
    reportMilestones: "Kemajuan Misi",
    reportMileEmerg: "Emergency Pocket 50%",
    reportMileEmergDesc: "Tinggal RM165 untuk milestone stabil pertama.",
    reportMileDebt: "Streak Tanpa BNPL",
    reportMileDebtDesc: "Padu. 12 hari tanpa tekanan bayaran baharu.",
    reportProjBal: "Unjuran Baki Hujung Bulan",
    reportProjDesc: "Berdasarkan NextGen Financial Brain.",
    coachHeader: "NextGen Council",
    coachSubheader: "Council proaktif untuk keputusan belanja lebih selamat.",
    coachInputPlaceholder: "Tanya sama ada pembelian ini selamat...",
    coachChipLimit: "Mampu beli ni ke?",
    coachChipSafe: "Safe Daily Spend saya berapa?",
    coachChipSave: "Cipta misi simpanan",
    billsHeader: "Smart Bill Lock",
    billsSubheader: "Lindungi sewa, bil, matlamat, dan future needs.",
    billsProtected: "Protected",
    billsNext: "Lock Seterusnya",
    billsAutoPay: "AutoPay",
    billsActive: "Aktif",
    billsNeedsSetup: "Perlu Tetapan",
    billsUpcoming: "Lock Akan Datang",
    billsPaid: "Dibayar / Sejarah",
    billsHistory: "Sejarah",
    billsAdd: "Tambah Komitmen",
    billsAutoPayCheck: "Semak AutoPay",
    billsLock: "Smart Bill Lock",
    billsAutoPayToggle: "AutoPay",
    billsPayNow: "Bayar Sekarang",
    billsCompleteSetup: "Lengkapkan Tetapan",
    billsNoAcc: "Tambah no. akaun/rujukan untuk AutoPay simulasi.",
    billsSafe: "Selamat Dibayar",
    billsUnsafe: "Risiko Baki Rendah",
    billsDueSoon: "Akan Datang",
    billsDueToday: "Hari Ini",
    billsOverdue: "Tunggakan",
    billsDaysLeft: "hari lagi",
    billsEdit: "Edit Komitmen",
    billsDelete: "Padam",
    billsSave: "Simpan Komitmen",
    billsCancel: "Batal",
    billsName: "Nama Komitmen",
    billsAmount: "Jumlah",
    billsCategory: "Kategori",
    billsProvider: "Penyedia",
    billsAccNum: "Nombor Akaun",
    billsRefNum: "Nombor Rujukan",
    billsFreq: "Kekerapan",
    billsDueDay: "Hari Bil",
    billsSafety: "Keselamatan AutoPay",
    billsReminder: "Peringatan",
    billsStrict: "Ketat",
    billsBalanced: "Seimbang",
    billsFlexible: "Fleksibel",
    billsSimulated: "AutoPay simulasi selesai",
  },
}
