'use client';
import { useEffect } from 'react';
import ChatInterface from './chatInferface';

export default function Home() {
  useEffect(() => {
    document.title = 'AIER — AI Equity Researcher';
  }, []);

  return (
    <div className="min-h-screen">
      <ChatInterface />
    </div>
  );
}

