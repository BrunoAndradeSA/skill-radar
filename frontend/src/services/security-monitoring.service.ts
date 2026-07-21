type FocusCallback = (violations: number) => void;
type TerminateCallback = () => void;
type AutomationDetectedCallback = (type: string) => void;

export class SecurityMonitoringService {
  private violations = 0;
  private maxViolations = 2;
  private autoTerminate = true;
  private onFocusLoss: FocusCallback | null = null;
  private onTerminate: TerminateCallback | null = null;

  private enableCopyProtection = true;
  private enableResizeDetection = true;
  private resizeThreshold: number = 0.6;

  private enableAutomationDetection = true;
  private enableMouseActivityMonitoring = true;

  private onAutomationDetected: AutomationDetectedCallback | null = null;

  private resizeCooldown = false;
  private focusCooldown = false;
  private styleEl: HTMLStyleElement | null = null;

  private mouseActivity = false;
  private mouseCheckInterval: ReturnType<typeof setInterval> | null = null;
  private activityCheckInterval: ReturnType<typeof setInterval> | null = null;

  private lastAnswerTime = 0;
  private quickAnswers = 0;
  private interactionCount = 0;

  constructor(config?: {
    maxViolations?: number;
    autoTerminate?: boolean;
    enableCopyProtection?: boolean;
    enableResizeDetection?: boolean;
    resizeThreshold?: number;
    enableAutomationDetection?: boolean;
    enableMouseActivityMonitoring?: boolean;
  }) {
    if (config?.maxViolations !== undefined) this.maxViolations = config.maxViolations;
    if (config?.autoTerminate !== undefined) this.autoTerminate = config.autoTerminate;
    if (config?.enableCopyProtection !== undefined) this.enableCopyProtection = config.enableCopyProtection;
    if (config?.enableResizeDetection !== undefined) this.enableResizeDetection = config.enableResizeDetection;
    if (config?.resizeThreshold !== undefined) this.resizeThreshold = config.resizeThreshold;
    if (config?.enableAutomationDetection !== undefined) this.enableAutomationDetection = config.enableAutomationDetection;
    if (config?.enableMouseActivityMonitoring !== undefined) this.enableMouseActivityMonitoring = config.enableMouseActivityMonitoring;
  }

  onFocusLossCallback(cb: FocusCallback): void {
    this.onFocusLoss = cb;
  }

  onTerminateCallback(cb: TerminateCallback): void {
    this.onTerminate = cb;
  }

  onAutomationDetectedCallback(cb: AutomationDetectedCallback): void {
    this.onAutomationDetected = cb;
  }

  recordInteraction(type: 'answer' | 'navigate'): void {
    const now = Date.now();
    this.interactionCount++;

    if (type === 'answer') {
      if (this.lastAnswerTime > 0) {
        const delta = now - this.lastAnswerTime;
        if (delta < 2000) {
          this.quickAnswers++;
        }
      }
      this.lastAnswerTime = now;
    }
  }

  getInteractionCount(): number {
    return this.interactionCount;
  }

  private handleFocusLoss = () => {
    if (this.focusCooldown) return;
    this.focusCooldown = true;
    setTimeout(() => { this.focusCooldown = false; }, 500);

    this.violations++;
    if (this.onFocusLoss) this.onFocusLoss(this.violations);
    if (this.violations >= this.maxViolations && this.autoTerminate) {
      if (this.onTerminate) this.onTerminate();
    }
  };

  private visibilityHandler = () => {
    if (document.hidden) this.handleFocusLoss();
  };

  private blurHandler = () => {
    this.handleFocusLoss();
  };

  private fullscreenHandler = () => {
    if (!document.fullscreenElement) this.handleFocusLoss();
  };

  /* Copy protection */

  private copyHandler = (e: ClipboardEvent) => { e.preventDefault(); };
  private cutHandler = (e: ClipboardEvent) => { e.preventDefault(); };
  private pasteHandler = (e: ClipboardEvent) => { e.preventDefault(); };
  private contextMenuHandler = (e: MouseEvent) => { e.preventDefault(); };

  /* Resize detection */

  private resizeHandler = () => {
    if (this.resizeCooldown) return;
    this.resizeCooldown = true;
    setTimeout(() => { this.resizeCooldown = false; }, 1000);

    if (screen.availWidth < 1024) return;
    const ratio = window.outerWidth / screen.availWidth;
    if (ratio < this.resizeThreshold) {
      this.handleFocusLoss();
    }
  };

  /* Anti-automation */

  private checkAutomationAPIs(): string | null {
    const nav = navigator as unknown as Record<string, unknown>;
    const win = window as unknown as Record<string, unknown>;

    if (nav.webdriver === true) return 'webdriver';
    if (win.__webdriver_script_fn !== undefined) return 'webdriver_script_fn';
    if (win.__driver_evaluate !== undefined) return 'driver_evaluate';
    if (win.__selenium_evaluate !== undefined) return 'selenium_evaluate';
    if (win.__lastWatirAlert !== undefined) return 'watir';
    if (win.__webdriver_evaluate !== undefined) return 'webdriver_evaluate';
    if (typeof win.callPhantom === 'function') return 'phantomjs';
    if (win._phantom !== undefined) return 'phantomjs';
    if (win.domAutomation !== undefined) return 'dom_automation';
    if (win.domAutomationController !== undefined) return 'dom_automation_controller';
    if (win.__selenium_unwrapped !== undefined) return 'selenium_unwrapped';

    return null;
  }

  private handleAutomationDetected(type: string): void {
    this.violations = this.maxViolations;
    if (this.onAutomationDetected) this.onAutomationDetected(type);
    if (this.autoTerminate && this.onTerminate) this.onTerminate();
  }

  private handleMouseActivity = (): void => {
    this.mouseActivity = true;
  };

  private checkMouseInactivity = (): void => {
    if (
      this.interactionCount > 0 &&
      !this.mouseActivity
    ) {
      this.handleFocusLoss();
    }
    this.mouseActivity = false;
  };

  private checkActivity = (): void => {
    const detected = this.checkAutomationAPIs();
    if (detected) {
      this.handleAutomationDetected(detected);
    }

    if (this.quickAnswers >= this.interactionCount * 0.5 && this.interactionCount >= 3) {
      this.handleAutomationDetected('rapid_answers');
    }
  };

  start(): void {
    document.addEventListener('visibilitychange', this.visibilityHandler);
    window.addEventListener('blur', this.blurHandler);
    document.addEventListener('fullscreenchange', this.fullscreenHandler);

    if (this.enableCopyProtection) {
      document.addEventListener('copy', this.copyHandler, true);
      document.addEventListener('cut', this.cutHandler, true);
      document.addEventListener('paste', this.pasteHandler, true);
      document.addEventListener('contextmenu', this.contextMenuHandler);

      this.styleEl = document.createElement('style');
      this.styleEl.textContent = '* { user-select: none !important; -webkit-user-select: none !important; }';
      document.head.appendChild(this.styleEl);
    }

    if (this.enableResizeDetection) {
      window.addEventListener('resize', this.resizeHandler);
      this.resizeHandler();
    }

    if (this.enableMouseActivityMonitoring) {
      document.addEventListener('mousemove', this.handleMouseActivity);
      document.addEventListener('touchstart', this.handleMouseActivity);
      document.addEventListener('click', this.handleMouseActivity);
      document.addEventListener('keydown', this.handleMouseActivity);

      this.mouseCheckInterval = setInterval(this.checkMouseInactivity, 10_000);
    }

    if (this.enableAutomationDetection) {
      this.activityCheckInterval = setInterval(this.checkActivity, 5_000);

      const detected = this.checkAutomationAPIs();
      if (detected) {
        this.handleAutomationDetected(detected);
      }
    }
  }

  stop(): void {
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    window.removeEventListener('blur', this.blurHandler);
    document.removeEventListener('fullscreenchange', this.fullscreenHandler);

    document.removeEventListener('copy', this.copyHandler, true);
    document.removeEventListener('cut', this.cutHandler, true);
    document.removeEventListener('paste', this.pasteHandler, true);
    document.removeEventListener('contextmenu', this.contextMenuHandler);

    if (this.styleEl) {
      this.styleEl.remove();
      this.styleEl = null;
    }

    window.removeEventListener('resize', this.resizeHandler);

    if (this.mouseCheckInterval) {
      clearInterval(this.mouseCheckInterval);
      this.mouseCheckInterval = null;
    }
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
    }

    document.removeEventListener('mousemove', this.handleMouseActivity);
    document.removeEventListener('touchstart', this.handleMouseActivity);
    document.removeEventListener('click', this.handleMouseActivity);
    document.removeEventListener('keydown', this.handleMouseActivity);
  }

  reset(): void {
    this.violations = 0;
    this.quickAnswers = 0;
    this.interactionCount = 0;
    this.lastAnswerTime = 0;
  }

  getViolations(): number {
    return this.violations;
  }
}
