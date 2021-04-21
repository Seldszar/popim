/**
 * Application settings.
 *
 * To use the widget, type the command (`!popim <url>` for example) followed by an image URL.
 * By default, only the broadcaster, moderators and VIPs are allowed to use the command.
 */
window.settings = {
  /**
   * Channel name the chat client will connect.
   * @type {String}
   */
  channel: "0xseldszar",

  /**
   * Command used for triggering the widget.
   * @type {String}
   */
  command: "!popim",

  /**
   * Badges allowed to use the command.
   * @type {String[]}
   */
  authorizedBadges: ["broadcaster", "moderator", "vip"],

  /**
   * Users allowed to use the command.
   * @type {String[]}
   */
  authorizedUsers: [],

  /**
   * Direction from where the image will be displayed.
   * @type {("top" | "right" | "bottom" | "left")}
   */
  direction: "top",

  /**
   * Maximum size, in pixels, of the displayed image.
   * @type {Number}
   */
  maxSize: 400,
};
