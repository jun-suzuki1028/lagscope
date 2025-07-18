import { useCallback, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

interface PerformanceMonitorOptions {
  enabled?: boolean;
  threshold?: number;
  onMetric?: (metric: PerformanceMetrics) => void;
}

export function usePerformanceMonitor(
  componentName: string,
  options: PerformanceMonitorOptions = {}
) {
  const {
    enabled = process.env.NODE_ENV === 'development',
    threshold = 16, // 60fps = 16ms per frame
    onMetric
  } = options;

  const startTimeRef = useRef<number>(0);
  const metricsRef = useRef<PerformanceMetrics[]>([]);

  const startMeasure = useCallback(() => {
    if (!enabled) return;
    startTimeRef.current = performance.now();
  }, [enabled]);

  const endMeasure = useCallback(() => {
    if (!enabled || !startTimeRef.current) return;
    
    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;
    
    const metric: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now(),
    };

    metricsRef.current.push(metric);
    
    if (renderTime > threshold) {
      console.warn(`⚠️ Performance warning: ${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }

    if (onMetric) {
      onMetric(metric);
    }

    startTimeRef.current = 0;
  }, [enabled, componentName, threshold, onMetric]);

  const getMetrics = useCallback(() => {
    return metricsRef.current.slice();
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
  }, []);

  const getAverageRenderTime = useCallback(() => {
    if (metricsRef.current.length === 0) return 0;
    const total = metricsRef.current.reduce((sum, metric) => sum + metric.renderTime, 0);
    return total / metricsRef.current.length;
  }, []);

  const getSlowRenders = useCallback(() => {
    return metricsRef.current.filter(metric => metric.renderTime > threshold);
  }, [threshold]);

  // Web Vitals monitoring
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure' && entry.name.includes(componentName)) {
          const metric: PerformanceMetrics = {
            renderTime: entry.duration,
            componentName,
            timestamp: Date.now(),
          };
          
          metricsRef.current.push(metric);
          
          if (onMetric) {
            onMetric(metric);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });

    return () => observer.disconnect();
  }, [enabled, componentName, onMetric]);

  return {
    startMeasure,
    endMeasure,
    getMetrics,
    clearMetrics,
    getAverageRenderTime,
    getSlowRenders,
  };
}

export function useRenderCount(componentName: string) {
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 ${componentName} rendered ${renderCountRef.current} times`);
    }
  });

  return renderCountRef.current;
}