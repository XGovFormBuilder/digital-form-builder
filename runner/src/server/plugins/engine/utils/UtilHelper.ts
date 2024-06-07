export class UtilHelper {
  // Helper class to add translations in runner
  public static getBackLinkText(eligibility: boolean, isWelsh: boolean) {
    if (eligibility) {
      if (isWelsh) {
        return "Yn ôl at eich ceisiadau";
      }
      return "Back to your applications";
    } else {
      if (isWelsh) {
        return "Yn ôl i'r trosolwg o'r cais";
      } else {
        return "Go back to application overview";
      }
    }
  }
}
