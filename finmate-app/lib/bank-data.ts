interface Bank {
  name: string;
  type: string;
  requiresSSN: boolean;
  monthlyFee: number;
  features: string[];
  bestFor: string[];
}

const banks: Bank[] = [
  {
    name: "Chase College Checking",
    type: "Traditional",
    requiresSSN: false,
    monthlyFee: 0,
    features: [
      "No monthly fee for up to 5 years",
      "ATM network nationwide",
      "Mobile banking app",
      "Overdraft protection"
    ],
    bestFor: ["Students with F-1/J-1 visa", "First-time account holders"]
  },
  {
    name: "Bank of America Advantage SafeBalance",
    type: "Traditional",
    requiresSSN: false,
    monthlyFee: 4.95,
    features: [
      "No overdraft fees",
      "Accepts ITIN instead of SSN",
      "Zelle transfers",
      "Large ATM network"
    ],
    bestFor: ["International students without SSN", "Budget-conscious users"]
  },
  {
    name: "Discover Online Checking",
    type: "Online",
    requiresSSN: true,
    monthlyFee: 0,
    features: [
      "No monthly fees",
      "Cashback on debit purchases",
      "60,000+ ATM network",
      "Free checks"
    ],
    bestFor: ["Students with SSN", "Tech-savvy users"]
  },
  {
    name: "Ally Bank",
    type: "Online",
    requiresSSN: true,
    monthlyFee: 0,
    features: [
      "High interest checking",
      "No minimum balance",
      "80,000+ fee-free ATMs",
      "24/7 customer support"
    ],
    bestFor: ["Students who want to earn interest", "Online-only banking"]
  },
  {
    name: "Capital One 360 Checking",
    type: "Online",
    requiresSSN: false,
    monthlyFee: 0,
    features: [
      "No fees or minimums",
      "Early direct deposit",
      "Savings tools built-in",
      "Free overdraft protection"
    ],
    bestFor: ["International students", "First bank account"]
  },
  {
    name: "Wells Fargo Everyday Checking",
    type: "Traditional",
    requiresSSN: false,
    monthlyFee: 10,
    features: [
      "Waived with $500 minimum",
      "Large physical branch network",
      "International student support",
      "Zelle and mobile banking"
    ],
    bestFor: ["Students needing in-person banking", "High balance accounts"]
  }
];

interface StudentProfile {
  country?: string;
  visa_type?: string;
  has_ssn: boolean;
  monthly_income?: number;
}

export function getBankData(profile: StudentProfile): Bank[] {
  // Filter banks based on SSN requirement
  let filteredBanks = banks.filter(bank => {
    if (!profile.has_ssn && bank.requiresSSN) {
      return false;
    }
    return true;
  });

  // Sort by monthly fee (lower is better)
  filteredBanks.sort((a, b) => a.monthlyFee - b.monthlyFee);

  return filteredBanks;
}

export type { Bank, StudentProfile };
