import React from 'react';

export interface SEOData {
  extractedData: {
    title: string;
    description: string;
    h1Count: number;
    h1s: string[];
    h2Count: number;
    imagesCount: number;
    missingAltCount: number;
    wordCount: number;
  };
  analysis: {
    score: number;
    overview: string;
    liveKeywords: string[];
    errors: {
      issue: string;
      severity: 'High' | 'Medium' | 'Low' | 'Info';
      fixCommand: string;
    }[];
    successes: string[];
  };
}

export type FetchState = 'idle' | 'loading' | 'success' | 'error';
