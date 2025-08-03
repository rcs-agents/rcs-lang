import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Detects the project root directory for RCL files
 */
export class ProjectRootDetector {
  private static cache = new Map<string, string>();

  /**
   * Find the project root directory by searching for RCL config files
   * @param filePath - The file path to start searching from
   * @returns The project root directory or the directory containing the file
   */
  static getProjectRoot(filePath: string): string {
    // Check cache first
    const dir = path.dirname(filePath);
    if (ProjectRootDetector.cache.has(dir)) {
      const cached = ProjectRootDetector.cache.get(dir);
      if (cached) return cached;
    }

    const projectRoot = ProjectRootDetector.findProjectRoot(dir);
    ProjectRootDetector.cache.set(dir, projectRoot);
    return projectRoot;
  }

  /**
   * Clear the project root cache
   */
  static clearCache(): void {
    ProjectRootDetector.cache.clear();
  }

  private static findProjectRoot(startDir: string): string {
    let currentDir = startDir;

    while (currentDir !== path.dirname(currentDir)) {
      // Check for RCL config files
      const configFiles = [
        'rclconfig.yml',
        'rclconfig.yaml',
        'config/rcl.yml',
        'config/rcl.yaml',
        '.rclrc',
        'package.json', // fallback to package.json
      ];

      for (const configFile of configFiles) {
        const configPath = path.join(currentDir, configFile);
        if (fs.existsSync(configPath)) {
          return currentDir;
        }
      }

      // Move up one directory
      currentDir = path.dirname(currentDir);
    }

    // If no config found, return the original directory
    return startDir;
  }

  /**
   * Check if a directory is likely an RCL project root
   * @param dir - Directory to check
   * @returns True if the directory appears to be an RCL project root
   */
  static isProjectRoot(dir: string): boolean {
    const indicators = [
      'rclconfig.yml',
      'rclconfig.yaml',
      'config/rcl.yml',
      'config/rcl.yaml',
      '.rclrc',
    ];

    return indicators.some((indicator) => fs.existsSync(path.join(dir, indicator)));
  }
}
