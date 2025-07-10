import { createContext, useContext, useState, useEffect } from 'react';

interface DonationContextType {
  hasDonated: boolean;
  donationAddress: string;
  markAsDonated: () => void;
  resetDonation: () => void;
  canPostMeme: boolean;
  memesPosted: number;
  incrementMemeCount: () => void;
}

const DonationContext = createContext<DonationContextType | undefined>(undefined);

export function DonationProvider({ children }: { children: React.ReactNode }) {
  const [hasDonated, setHasDonated] = useState(false);
  const [memesPosted, setMemesPosted] = useState(0);
  const donationAddress = "bc1q2hglmlutz959c30s9cc83p7edvnmrj536dgsx2";

  // Load donation status from localStorage
  useEffect(() => {
    const donated = localStorage.getItem('btc-donated') === 'true';
    const posted = parseInt(localStorage.getItem('memes-posted') || '0');
    setHasDonated(donated);
    setMemesPosted(posted);
  }, []);

  const markAsDonated = () => {
    setHasDonated(true);
    localStorage.setItem('btc-donated', 'true');
  };

  const resetDonation = () => {
    setHasDonated(false);
    setMemesPosted(0);
    localStorage.removeItem('btc-donated');
    localStorage.removeItem('memes-posted');
  };

  const incrementMemeCount = () => {
    const newCount = memesPosted + 1;
    setMemesPosted(newCount);
    localStorage.setItem('memes-posted', newCount.toString());
  };

  // Can post meme if donated but hasn't posted yet
  const canPostMeme = hasDonated && memesPosted === 0;

  const value: DonationContextType = {
    hasDonated,
    donationAddress,
    markAsDonated,
    resetDonation,
    canPostMeme,
    memesPosted,
    incrementMemeCount,
  };

  return <DonationContext.Provider value={value}>{children}</DonationContext.Provider>;
}

export function useDonation() {
  const context = useContext(DonationContext);
  if (context === undefined) {
    throw new Error('useDonation must be used within a DonationProvider');
  }
  return context;
}