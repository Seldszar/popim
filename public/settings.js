/**
 * Application settings.
 *
 * To use the widget, you have to type `!popim <url>` where the URL returns an image.
 * By default, the broadcaster and moderators are allowed to use the command.
 */
window.settings = {
  /**
   * The channel name the chat client will connect.
   * @type {String}
   */
  channel: "0xseldszar",

  /**
   * Additional users allowed to use the command.
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
