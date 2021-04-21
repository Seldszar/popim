export interface Settings {
  /**
   * Channel name the chat client will connect.
   */
  channel: string;

  /**
   * Command used for triggering the widget.
   */
  command: string;

  /**
   * Badges allowed to use the command.
   */
  authorizedBadges: string[];

  /**
   * Users allowed to use the command.
   */
  authorizedUsers: string[];

  /**
   * Direction from where the image will be displayed.
   */
  direction: "top" | "right" | "bottom" | "left";

  /**
   * Maximum size, in pixels, of the displayed image.
   */
  maxSize: number;
}

declare global {
  interface Window {
    settings: Settings;
  }
}
