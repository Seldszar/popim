export interface Settings {
  /**
   * The channel name the chat client will connect.
   */
  channel: string;

  /**
   * Additional users allowed to use the command.
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
