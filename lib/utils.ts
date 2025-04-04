import { interviewCovers, mappings } from '@/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)); // Combines class names using clsx and resolves conflicts with twMerge
}

const techIconBaseURL =
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

// Function to normalize a technology name to match the expected format in the mappings
const normalizeTechName = (tech: string) => {
  const key = tech
    .toLowerCase()
    .replace(/\.js$/, '') // Remove ".js" suffix if present
    .replace(/\s+/g, ''); // Remove all whitespace
  return mappings[key as keyof typeof mappings]; // Return the corresponding mapping key
};

// Function to check if a given URL exists by sending a HEAD request
const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD' }); // Send a HEAD request to check if the resource exists
    return response.ok; // Return true if the response status is OK (200-299)
  } catch {
    return false; // Return false if an error occurs
  }
};

// Function to get an array of tech logos for a given array of technology names
export const getTechLogos = async (techArray: string[]) => {
  // Map each technology name to its corresponding logo URL
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech); // Normalize the tech name
    return {
      tech, // Original tech name
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`, // Construct the logo URL
    };
  });

  // Check if each logo URL exists and replace with a fallback if it doesn't
  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech, // Original tech name
      url: (await checkIconExists(url)) ? url : '/tech.svg', // Use the URL if it exists, otherwise use a fallback
    }))
  );

  return results; // Return the array of tech logos with their URLs
};

// Function to get a random interview cover image
export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(
    Math.random() * interviewCovers.length // Generate a random index within the range of available covers
  );
  return `/covers${interviewCovers[randomIndex]}`; // Return the path to the randomly selected cover
};
