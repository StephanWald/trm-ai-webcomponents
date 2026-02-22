/**
 * Detail payload for the splashClose event.
 * Indicates how the splash screen was dismissed (SPLS-05).
 */
export interface SplashCloseEventDetail {
  /** How the splash was dismissed */
  reason: 'button' | 'escape' | 'backdrop';
}
