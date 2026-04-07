import { spawn } from 'child_process';
import path from 'path';
import { InventoryForecastPoint } from '../../types/forecast.types';

export interface ForecastResponse {
  source: string;
  forecast: InventoryForecastPoint[];
}

export class ForecastingService {
  async getInventoryForecast(productId: string, days: number = 7): Promise<ForecastResponse> {
    return new Promise((resolve, reject) => {
      const pythonPath = path.join(process.cwd(), '..', '..', '.venv', 'Scripts', 'python.exe');
      const predictScript = path.join(process.cwd(), '..', '..', 'ml', 'predict.py');
      const modelPath = path.join(process.cwd(), '..', '..', 'ml', 'models', 'demand_forecast_model.pkl');
      const historyFile = path.join(process.cwd(), '..', '..', 'ml', 'data', 'demand_data.csv');

      const pythonProcess = spawn(pythonPath, [
        predictScript,
        '--model', modelPath,
        '--product-id', productId,
        '--days', days.toString(),
        '--history-file', historyFile
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
            // Fallback to simple forecast
            resolve(this.getFallbackForecast(productId, days));
          }
        } else {
          console.error('Python forecast failed:', stderr);
          // Fallback to simple forecast
          resolve(this.getFallbackForecast(productId, days));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        // Fallback to simple forecast
        resolve(this.getFallbackForecast(productId, days));
      });
    });
  }

  private getFallbackForecast(productId: string, days: number): ForecastResponse {
    const forecast: InventoryForecastPoint[] = [];
    const baseDate = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i + 1);
      forecast.push({
        date: date.toISOString().split('T')[0],
        forecast_quantity: Math.floor(Math.random() * 20) + 10 // Random between 10-30
      });
    }

    return {
      source: 'fallback',
      forecast
    };
  }
}