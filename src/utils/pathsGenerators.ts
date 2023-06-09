import { nanoid } from "nanoid";


export function getRandomProfilePath() {
  const randomCharsLength = 9;
  return `user-${nanoid(randomCharsLength)}`;
}

export function getPostPath(content: string | undefined | null) {
  if (typeof content === "string") {
    content = toLowerCaseAndLimitChars(content, 70);
    content = removeSpecialChars(content);
    content = removeLastWord(content);
    content = replaceSpacesWithDashes(content);

    if (isUrlFriendly(content)) {
      return `${content}-${nanoid(10)}`;
    }
  }
  return nanoid();
}

function toLowerCaseAndLimitChars(str: string, charsLimit: number) {
  str = str.toLowerCase();
  return str.slice(0, charsLimit);
}

function removeSpecialChars(str: string) {
  const specialCharsRegex = /[\~\`\!\@\#\$\%\^\&\*\(\)\-\_\=\+\{\}\[\]\;\:\'\"\<\>\?\,\.\/\\\|]/g;
  return str.replace(specialCharsRegex, "");
}

function removeLastWord(str: string) {
  const splitStr = str.split(" ");
  splitStr.pop();
  return splitStr.join(" ");
}

function replaceSpacesWithDashes(str: string) {
  str = str.replace(/\s/g, "-");
  return str;
}

function isUrlFriendly(str: string) {
  const regex = /^[a-z0-9-\s]+$/;
  return regex.test(str);
}
