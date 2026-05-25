import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { InventoryForecastPoint } from '../types/forecast.types';

export interface ForecastResponse {
  source: string;
  forecast: InventoryForecastPoint[];
}

export class ForecastingService {
  private getPythonPath(): string {
    const possiblePaths = [
      // Check for .venv in ml folder
      path.join(process.cwd(), '..', 'ml', '.venv', 'Scripts', 'python.exe'),
      path.join(process.cwd(), '..', 'ml', '.venv', 'bin', 'python'),
      // Check for .venv in backend parent folder (trade_bridge root)
      path.join(process.cwd(), '..', '.venv', 'Scripts', 'python.exe'),
      path.join(process.cwd(), '..', '.venv', 'bin', 'python'),
      // Check for the original path configuration
      path.join(process.cwd(), '..', '..', '.venv', 'Scripts', 'python.exe'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    // Default to system python
    return process.platform === 'win32' ? 'python' : 'python3';
  }

  async getInventoryForecast(productId: string, days: number = 7): Promise<ForecastResponse> {
    return new Promise((resolve, reject) => {
      const pythonPath = this.getPythonPath();
      const predictScript = path.join(process.cwd(), '..', 'ml', 'predict.py');

      const pythonProcess = spawn(pythonPath, [
        predictScript,
        'forecast-demand',
        '--product-id', productId,
        '--horizon-days', days.toString()
      ]);

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const forecastData = JSON.parse(stdout.trim());
            resolve({
              source: 'ml-model',
              forecast: forecastData
            });
          } catch (parseError) {
            console.error('Failed to parse forecast output:', stdout);
            reject(new Error('Failed to parse ML forecast output'));
          }
        } else {
          console.error('Python forecast failed:', stderr);
          reject(new Error(stderr || 'ML forecast process failed'));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        reject(new Error('Failed to start ML forecast process'));
      });
    });
  }
}