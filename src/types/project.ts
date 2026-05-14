/**
 * Defines the structure for a project object.
 * This interface ensures type safety across the application when handling project data.
 */
export interface Project {
  /** A unique identifier for the project. */
  id: string;
  /** The title or name of the project. */
  title: string;
  /** A brief description of the project. */
  description: string;
  /** An array of tags associated with the project. */
  tags: string[];
  /** The category to which the project belongs (e.g., 'frontend', 'backend'). */
  category: string;
  /** The URL to the project's website or main page. */
  url: string;
  /** The URL to the project's source code repository. */
  repo: string;
  /** The primary programming language used in the project. */
  language: string;
  // Add any other relevant project properties as needed.
}