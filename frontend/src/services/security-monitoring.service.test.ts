import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SecurityMonitoringService } from './security-monitoring.service';

describe('SecurityMonitoringService', () => {
  let service: SecurityMonitoringService;

  beforeEach(() => {
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    service = new SecurityMonitoringService();
  });

  afterEach(() => {
    service.stop();
    vi.restoreAllMocks();
  });

  describe('start/stop', () => {
    it('registra listener de visibilitychange ao iniciar', () => {
      const spy = vi.spyOn(document, 'addEventListener');
      service.start();
      expect(spy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    });

    it('remove listener ao parar', () => {
      const spy = vi.spyOn(document, 'removeEventListener');
      service.start();
      service.stop();
      expect(spy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    });
  });

  describe('detecção de perda de foco', () => {
    it('incrementa violações quando página fica oculta', () => {
      vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
      service.start();
      document.dispatchEvent(new Event('visibilitychange'));
      expect(service.getViolations()).toBe(1);
    });

    it('não incrementa quando página fica visível', () => {
      service.start();
      document.dispatchEvent(new Event('visibilitychange'));
      expect(service.getViolations()).toBe(0);
    });

    it('não conta violações após stop', () => {
      vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
      service.start();
      service.stop();
      document.dispatchEvent(new Event('visibilitychange'));
      expect(service.getViolations()).toBe(0);
    });
  });

  describe('callbacks', () => {
    it('dispara onFocusLoss a cada violação (com cooldown de 500ms)', () => {
      vi.useFakeTimers();
      const onFocusLoss = vi.fn();
      service.onFocusLossCallback(onFocusLoss);
      vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
      service.start();

      document.dispatchEvent(new Event('visibilitychange'));
      expect(onFocusLoss).toHaveBeenCalledWith(1);

      vi.advanceTimersByTime(500);
      document.dispatchEvent(new Event('visibilitychange'));
      expect(onFocusLoss).toHaveBeenCalledWith(2);
      vi.useRealTimers();
    });

    it('dispara onTerminate ao atingir limite (maxViolations=2)', () => {
      vi.useFakeTimers();
      const onTerminate = vi.fn();
      service.onTerminateCallback(onTerminate);
      vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
      service.start();

      document.dispatchEvent(new Event('visibilitychange'));
      expect(onTerminate).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      document.dispatchEvent(new Event('visibilitychange'));
      expect(onTerminate).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });
  });

  describe('reset', () => {
    it('zera o contador de violações', () => {
      vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
      service.start();

      document.dispatchEvent(new Event('visibilitychange'));
      expect(service.getViolations()).toBe(1);

      service.reset();
      expect(service.getViolations()).toBe(0);
    });
  });

  describe('configuração customizada', () => {
    it('usa maxViolations do construtor', () => {
      const custom = new SecurityMonitoringService({ maxViolations: 1, autoTerminate: true });
      const onTerminate = vi.fn();
      custom.onTerminateCallback(onTerminate);
      vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
      custom.start();

      document.dispatchEvent(new Event('visibilitychange'));
      expect(onTerminate).toHaveBeenCalled();
      custom.stop();
    });

    it('não encerra automaticamente quando autoTerminate=false', () => {
      const custom = new SecurityMonitoringService({ maxViolations: 2, autoTerminate: false });
      const onTerminate = vi.fn();
      custom.onTerminateCallback(onTerminate);
      vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
      custom.start();

      document.dispatchEvent(new Event('visibilitychange'));
      document.dispatchEvent(new Event('visibilitychange'));
      document.dispatchEvent(new Event('visibilitychange'));
      expect(onTerminate).not.toHaveBeenCalled();
      custom.stop();
    });
  });

  describe('proteção de cópia', () => {
    it('impede copy após start', () => {
      service.start();
      const event = new Event('copy', { cancelable: true });
      document.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('impede cut após start', () => {
      service.start();
      const event = new Event('cut', { cancelable: true });
      document.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('impede paste após start', () => {
      service.start();
      const event = new Event('paste', { cancelable: true });
      document.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('impede contextmenu após start', () => {
      service.start();
      const event = new Event('contextmenu', { cancelable: true });
      document.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('não impede copy após stop', () => {
      service.start();
      service.stop();
      const event = new Event('copy', { cancelable: true });
      document.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });

    it('adiciona style de user-select ao head ao iniciar', () => {
      service.start();
      const style = document.head.querySelector('style');
      expect(style).not.toBeNull();
      expect(style?.textContent).toContain('user-select: none');
      service.stop();
    });

    it('remove style de user-select do head ao parar', () => {
      service.start();
      service.stop();
      const style = document.head.querySelector('style');
      expect(style).toBeNull();
    });
  });

  describe('detecção de resize suspeito', () => {
    it('incrementa violação quando janela é pequena demais', () => {
      Object.defineProperty(screen, 'availWidth', { value: 1920, configurable: true });
      Object.defineProperty(window, 'outerWidth', { value: 1000, configurable: true });
      service.start();
      expect(service.getViolations()).toBe(1);
      service.stop();
    });

    it('não incrementa quando janela está em tamanho normal', () => {
      Object.defineProperty(screen, 'availWidth', { value: 1920, configurable: true });
      Object.defineProperty(window, 'outerWidth', { value: 1920, configurable: true });
      service.start();
      expect(service.getViolations()).toBe(0);
      service.stop();
    });

    it('não incrementa em telas pequenas (availWidth < 1024)', () => {
      Object.defineProperty(screen, 'availWidth', { value: 800, configurable: true });
      Object.defineProperty(window, 'outerWidth', { value: 400, configurable: true });
      service.start();
      expect(service.getViolations()).toBe(0);
      service.stop();
    });

    it('usa resizeThreshold do construtor', () => {
      const custom = new SecurityMonitoringService({ resizeThreshold: 0.8 });
      Object.defineProperty(screen, 'availWidth', { value: 1920, configurable: true });
      Object.defineProperty(window, 'outerWidth', { value: 1500, configurable: true });
      custom.start();
      expect(custom.getViolations()).toBe(1);
      custom.stop();
    });
  });
});
